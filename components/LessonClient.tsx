'use client';

import { useState, useCallback } from 'react';
import VideoPlayer from './VideoPlayer';
import ChatInterface from './ChatInterface';

interface LessonClientProps {
  videoId: string;   // YouTube video ID
  courseId: string;  // Internal course ID
  userName: string;
}

export default function LessonClient({ videoId, courseId, userName }: LessonClientProps) {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);

  const handleTimeUpdate = useCallback((currentTime: number) => {
    setCurrentTime(currentTime);
  }, []);

  const handleQuestionTriggered = useCallback(() => {
    setPlaying(false);
  }, []);

  const handleAnswerSubmitted = useCallback(() => {
    setPlaying(true);
  }, []);

  return (
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
          />
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4">
          <h1 className="text-lg font-semibold text-slate-800">Clase en curso</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            El asistente IA puede hacerte preguntas durante la clase para evaluar tu comprensión.
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
          />
        </div>
      </aside>

    </div>
  );
}
