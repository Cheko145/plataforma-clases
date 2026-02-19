"use client";

import { useState, useEffect, useCallback } from "react";

interface Course {
  id: string;
  title: string;
  duration: string | null;
}

interface CourseState {
  questions: string[];
  loading: boolean;
  generating: boolean;
  error: string | null;
}

export default function QuestionManager() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [states, setStates] = useState<Record<string, CourseState>>({});

  const loadQuestions = useCallback(async (videoId: string) => {
    try {
      const res = await fetch(`/api/questions/${videoId}`);
      const data: string[] = await res.json();
      setStates(prev => ({
        ...prev,
        [videoId]: { ...prev[videoId], questions: data, loading: false },
      }));
    } catch {
      setStates(prev => ({
        ...prev,
        [videoId]: { ...prev[videoId], loading: false, error: "Error al cargar" },
      }));
    }
  }, []);

  useEffect(() => {
    fetch("/api/courses")
      .then(r => r.json())
      .then((data: Course[]) => {
        setCourses(data);
        setCoursesLoading(false);
        const initial: Record<string, CourseState> = {};
        data.forEach(c => {
          initial[c.id] = { questions: [], loading: true, generating: false, error: null };
        });
        setStates(initial);
        data.forEach(c => loadQuestions(c.id));
      })
      .catch(() => setCoursesLoading(false));
  }, [loadQuestions]);

  async function handleGenerate(videoId: string) {
    setStates(prev => ({
      ...prev,
      [videoId]: { ...prev[videoId], generating: true, error: null },
    }));

    try {
      const res = await fetch("/api/questions/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId }),
      });

      if (!res.ok) throw new Error(await res.text());

      const data: { questions: string[] } = await res.json();
      setStates(prev => ({
        ...prev,
        [videoId]: { questions: data.questions, loading: false, generating: false, error: null },
      }));
    } catch (err) {
      setStates(prev => ({
        ...prev,
        [videoId]: {
          ...prev[videoId],
          generating: false,
          error: err instanceof Error ? err.message : "Error desconocido",
        },
      }));
    }
  }

  if (coursesLoading) {
    return (
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Preguntas de evaluación por video</h2>
        <p className="text-xs text-slate-400">Cargando cursos…</p>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Preguntas de evaluación por video</h2>
        <p className="text-xs text-slate-400 italic">No hay cursos creados aún. Agrega uno en la sección de Cursos.</p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-sm font-semibold text-slate-700 mb-3">Preguntas de evaluación por video</h2>
      <div className="space-y-3">
        {courses.map(course => {
          const state = states[course.id] ?? { questions: [], loading: false, generating: false, error: null };
          return (
            <div key={course.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{course.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{course.id} · {course.duration ?? "—"}</p>
                </div>

                <button
                  onClick={() => handleGenerate(course.id)}
                  disabled={state.generating}
                  className="flex-shrink-0 flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white
                             text-xs font-medium px-3.5 py-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {state.generating ? (
                    <>
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Generando…
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      {state.questions.length > 0 ? "Regenerar" : "Generar con IA"}
                    </>
                  )}
                </button>
              </div>

              {state.error && (
                <p className="mt-3 text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{state.error}</p>
              )}

              {state.loading ? (
                <p className="mt-3 text-xs text-slate-400">Cargando…</p>
              ) : state.questions.length > 0 ? (
                <ol className="mt-3 space-y-1.5 list-decimal list-inside">
                  {state.questions.map((q, i) => (
                    <li key={i} className="text-xs text-slate-600 leading-relaxed">{q}</li>
                  ))}
                </ol>
              ) : (
                <p className="mt-3 text-xs text-slate-400 italic">
                  Sin preguntas — haz clic en &quot;Generar con IA&quot; para crearlas.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
