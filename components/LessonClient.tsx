'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import VideoPlayer from './VideoPlayer';
import ChatInterface from './ChatInterface';

interface LessonClientProps {
  videoId: string;   // YouTube video ID
  courseId: string;  // Internal course ID
  userName: string;
  deadline: string | null; // ISO string or null
}

export default function LessonClient({ videoId, courseId, userName, deadline }: LessonClientProps) {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const watchedRef = useRef(false);

  const deadlineDate = deadline ? new Date(deadline) : null;
  const isPastDeadline = deadlineDate ? new Date() > deadlineDate : false;

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  const handleQuestionTriggered = useCallback(() => {
    setPlaying(false);
  }, []);

  const handleAnswerSubmitted = useCallback(() => {
    setPlaying(true);
  }, []);

  const markWatched = useCallback(async () => {
    if (watchedRef.current) return;
    watchedRef.current = true;
    await fetch('/api/video-watches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId }),
    });
  }, [courseId]);

  // Mark watched when video ends
  const handleEnded = useCallback(() => {
    setPlaying(false);
    markWatched();
  }, [markWatched]);

  // Also mark watched when 80%+ of the video is seen
  useEffect(() => {
    if (videoDuration > 0 && currentTime / videoDuration >= 0.8) {
      markWatched();
    }
  }, [currentTime, videoDuration, markWatched]);

  return (
    <div className="space-y-4">
      {/* Deadline banner */}
      {deadlineDate && (
        <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm ${
          isPastDeadline
            ? 'bg-red-50 border border-red-100 text-red-700'
            : 'bg-amber-50 border border-amber-100 text-amber-700'
        }`}>
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {isPastDeadline ? (
            <span>
              <strong>Fecha límite vencida</strong> — Este video ya no es calificado (venció el {deadlineDate.toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}).
            </span>
          ) : (
            <span>
              <strong>Fecha límite:</strong> {deadlineDate.toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Video */}
        <section className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-100 bg-black">
            <VideoPlayer
              videoId={videoId}
              playing={playing}
              onTimeUpdate={handleTimeUpdate}
              onDuration={setVideoDuration}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={handleEnded}
            />
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4">
            <h1 className="text-lg font-semibold text-slate-800">Clase en curso</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              {isPastDeadline
                ? 'El plazo de calificación venció, pero puedes seguir viendo el video y usando el chat.'
                : 'El asistente IA puede hacerte preguntas durante la clase para evaluar tu comprensión.'}
            </p>
          </div>
        </section>

        {/* Columna Chat */}
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3-3-3z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-slate-700">Profesor IA</span>
              <span className="ml-auto w-2 h-2 rounded-full bg-green-400" />
              {isPastDeadline && (
                <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Sin calificación</span>
              )}
            </div>
            <ChatInterface
              videoId={courseId}
              userName={userName}
              id={videoId}
              courseId={courseId}
              currentTime={currentTime}
              videoDuration={videoDuration}
              onQuestionTriggered={handleQuestionTriggered}
              onAnswerSubmitted={handleAnswerSubmitted}
              gradeDisabled={isPastDeadline}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
