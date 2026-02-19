'use client';

import { useChat } from "@ai-sdk/react";
import { misClases } from "@/data/courses";
import { useState, useEffect, useRef } from "react";

// Calcula el intervalo entre preguntas en función de cuántas hay
function calculateInterval(durationStr: string, questionCount: number): number {
  const [minutes, seconds] = durationStr.split(':').map(Number);
  return ((minutes * 60) + seconds) * 1000 / questionCount;
}

interface ChatInterfaceProps {
  videoId: string;  // ID interno del curso
  userName: string;
  id: string;       // ID del video de YouTube
  courseId: string;
}

export default function ChatInterface({ videoId, userName, id, courseId }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const [questionsList, setQuestionsList] = useState<string[]>([]);
  const [questionsReady, setQuestionsReady] = useState(false);

  // Metadatos del curso (duración) siguen viniendo de courses.ts
  const currentCourse = misClases.find((c: { id: string }) => c.id === videoId);

  const questionIndexRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { messages, status, sendMessage } = useChat();
  const isLoading = status === 'submitted' || status === 'streaming';

  const isLoadingRef = useRef(isLoading);
  const sendMessageRef = useRef(sendMessage);
  const pendingQuestionRef = useRef(pendingQuestion);

  useEffect(() => {
    isLoadingRef.current = isLoading;
    sendMessageRef.current = sendMessage;
    pendingQuestionRef.current = pendingQuestion;
  }, [isLoading, sendMessage, pendingQuestion]);

  // Carga las preguntas desde la DB (1 fetch por video, compartido entre 70k alumnos)
  useEffect(() => {
    setQuestionsReady(false);
    setQuestionsList([]);
    questionIndexRef.current = 0;

    fetch(`/api/questions/${videoId}`)
      .then(r => r.json())
      .then((data: string[]) => {
        setQuestionsList(Array.isArray(data) ? data : []);
        setQuestionsReady(true);
      })
      .catch(() => setQuestionsReady(true)); // Sin preguntas → el chat sigue funcionando
  }, [videoId]);

  // Dispara preguntas automáticas según el intervalo calculado
  useEffect(() => {
    if (!questionsReady || questionsList.length === 0 || !currentCourse) return;

    const intervalTime = calculateInterval(currentCourse.duration, questionsList.length);

    timerRef.current = setInterval(() => {
      if (questionIndexRef.current >= questionsList.length) {
        if (timerRef.current) clearInterval(timerRef.current);
        return;
      }
      if (isLoadingRef.current) return;

      const currentQuestion = questionsList[questionIndexRef.current];
      setPendingQuestion(currentQuestion);

      sendMessageRef.current(
        { text: `TRIGGER_AUTO_QUESTION:\nUser: "${userName}"\nQuestion: "${currentQuestion}"` },
        { body: { videoId: id } }
      );

      questionIndexRef.current += 1;
    }, intervalTime);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [videoId, userName, questionsList, questionsReady, currentCourse, id]);

  const onSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!input.trim()) return;

    const currentPending = pendingQuestionRef.current;

    if (currentPending) {
      setPendingQuestion(null);
      await sendMessage(
        { text: input },
        {
          body: {
            videoId: id,
            isStudentAnswer: true,
            pendingQuestion: currentPending,
            courseId,
          }
        }
      );
    } else {
      await sendMessage(
        { text: input },
        { body: { videoId: id } }
      );
    }

    setInput('');
  };

  return (
    <div className="flex flex-col h-[600px]">
      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-slate-400 text-sm mt-8">
            <p>¡Hola! Soy tu Profesor IA.</p>
            <p className="mt-1">Hazme cualquier pregunta sobre el video.</p>
          </div>
        )}

        {messages.map(m => {
          const isHidden = m.parts?.some(part =>
            part.type === 'text' && part.text.includes('TRIGGER_AUTO_QUESTION')
          );
          if (isHidden) return null;

          const isUser = m.role === 'user';

          return (
            <div
              key={m.id}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-br-sm'
                    : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                }`}
              >
                <p className="text-xs font-semibold mb-1 opacity-70">
                  {isUser ? 'Tú' : 'Profesor IA'}
                </p>
                <div className="whitespace-pre-wrap">
                  {m.parts?.map((part, index) =>
                    part.type === 'text'
                      ? <span key={index}>{part.text.replace(/\[EVAL:(SI|NO)\]/g, '').trim()}</span>
                      : null
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 px-3.5 py-2.5 rounded-2xl rounded-bl-sm">
              <span className="text-xs text-slate-400">Escribiendo</span>
              <span className="inline-flex gap-0.5 ml-1.5">
                <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={onSubmit} className="p-3 border-t border-slate-100">
        {pendingQuestion && (
          <div className="flex items-center gap-1.5 text-amber-600 text-xs mb-2 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-lg">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Respondiendo a una pregunta de evaluación
          </div>
        )}
        <div className="flex gap-2">
          <input
            className="flex-1 text-sm border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900
                       placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={pendingQuestion ? "Escribe tu respuesta..." : "Pregunta algo sobre el video..."}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium
                       disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
}
