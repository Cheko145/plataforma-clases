'use client';

import { useChat } from "@ai-sdk/react";
import Script from "next/script";
import { misClases } from "@/data/courses";
import { useState, useEffect, useRef } from "react";

// Función auxiliar para convertir "MM:SS" a milisegundos totales
function calculateInterval(durationStr: string) {
  const [minutes, seconds] = durationStr.split(':').map(Number);
  return ((minutes * 60) + seconds) * 1000 / 3; // Dividimos entre 3
}
interface ChatInterfaceProps {
  videoId: string; 
  userName: string; // <--- Nuevo: Recibimos el nombre del usuario logueado
  id: string; // <--- Nuevo: Recibimos el ID del video (puede ser igual a videoId o un ID interno)
}
// Función auxiliar para el tiempo
  export default function ChatInterface({ videoId,userName,id }: ChatInterfaceProps) {
  // 1. Gestionamos el input nosotros mismos
  const [input, setInput] = useState('');
  const currentCourse = misClases.find((c: { id: string; }) => c.id === videoId);  
  const questionsList = currentCourse ? Object.values(currentCourse.questions) : [];
  const questionIndexRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  // 2. Extraemos las nuevas propiedades de la v5/v6
  const { messages, status, sendMessage } = useChat();

  // 3. Calculamos isLoading basado en el status
  const isLoading = status === 'submitted' || status === 'streaming';
  // --- TRUCO DE EXPERTO: REFS PARA ROMPER LA DEPENDENCIA ---
  // Guardamos las variables cambiantes en Refs para leerlas dentro del setInterval
  // sin reiniciar el temporizador.
  const isLoadingRef = useRef(isLoading);
  const sendMessageRef = useRef(sendMessage);

  // Actualizamos los refs cada vez que cambian, SIN afectar al temporizador
  useEffect(() => {
    isLoadingRef.current = isLoading;
    sendMessageRef.current = sendMessage;
  }, [isLoading, sendMessage]);
useEffect(() => {
    if (!currentCourse || questionsList.length === 0) return;

    const intervalTime = calculateInterval(currentCourse.duration);
    console.log(`⏱️ Temporizador iniciado. Intervalo: ${intervalTime / 1000}s`);

    timerRef.current = setInterval(() => {
      // Usamos los REFS para checar el estado actual
      // Así el timer NO se reinicia si isLoading cambia.
      if (questionIndexRef.current >= questionsList.length) {
        console.log("⏹️ Se acabaron las preguntas.");
        if (timerRef.current) clearInterval(timerRef.current);
        return;
      }

      if (isLoadingRef.current) {
        console.log("⏳ IA ocupada, saltando este turno...");
        return; 
      }

      const currentQuestion = questionsList[questionIndexRef.current];
      console.log("🚀 DISPARANDO AUTOMÁTICO:", currentQuestion);

      // Usamos la función del ref para asegurar que tenemos la última versión
      if (sendMessageRef.current) {
        sendMessageRef.current(
          { 
            // NOTA: Si sendMessage espera 'text', déjalo así. 
            // Si falla, prueba cambiar 'text' por 'content' (estándar AI SDK).
            text: `TRIGGER_AUTO_QUESTION:\nUser: "${userName}"\nQuestion: "${currentQuestion}"` 
          },
          { body: { videoId:id } }
        );
      }

      questionIndexRef.current += 1;

    }, intervalTime);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // ⚠️ QUITAMOS isLoading y sendMessage de aquí para que NO reinicien el timer
  }, [videoId, userName, currentCourse, questionsList]); 

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    await sendMessage(
      { text: input }, 
      { body: { videoId:id } } // Asegúrate de mandar el videoId de YouTube aquí
    );

    setInput('');
  };

  return (
    <div className="flex flex-col h-[600px] border rounded-lg bg-gray-50">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(m => {
            // SOLUCIÓN AL ERROR DE TYPESCRIPT:
            // Verificamos de forma segura si alguna parte es texto Y contiene el trigger
            const isHidden = m.parts?.some(part => 
                part.type === 'text' && part.text.includes('TRIGGER_AUTO_QUESTION')
            );

            return (
              <div 
                key={m.id} 
                className={`p-3 rounded-lg max-w-[80%] ${
                  m.role === 'user' 
                    ? (isHidden
                        ? 'hidden' // Si es trigger, lo ocultamos con CSS
                        : 'bg-blue-600 text-white self-end ml-auto')
                    : 'bg-black border self-start'
                }`}
              >
                {/* Renderizamos solo si NO está oculto */}
                {!isHidden && (
                  <>
                    <p className="text-sm font-bold mb-1">{m.role === 'user' ? 'Tú' : 'Profesor IA'}</p>
                    
                    <div className="whitespace-pre-wrap">
                      {m.parts ? (
                        m.parts.map((part, index) => 
                          // Solo renderizamos partes de texto
                          part.type === 'text' ? <span key={index}>{part.text}</span> : null
                        )
                      ) : (
                        // Fallback por si acaso
                        <span>{m.parts}</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
        })}
      </div>
      
      <form onSubmit={onSubmit} className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <input
            className="flex-1 p-2 border rounded text-black"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pregunta algo sobre el video..."
            disabled={isLoading}
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
}