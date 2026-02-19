"use client";

import { useState, useEffect, useCallback } from "react";

interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  youtube_url: string;
  duration: string | null;
  created_at: string;
}

interface FormData {
  title: string;
  description: string;
  youtube_url: string;
  duration: string;
}

const EMPTY_FORM: FormData = { title: "", description: "", youtube_url: "", duration: "" };

function getYouTubeID(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export default function CourseManager() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    const res = await fetch("/api/courses");
    const data = await res.json();
    setCourses(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  function openCreate() {
    setEditingCourse(null);
    setForm(EMPTY_FORM);
    setError(null);
    setShowModal(true);
  }

  function openEdit(course: Course) {
    setEditingCourse(course);
    setForm({
      title: course.title,
      description: course.description ?? "",
      youtube_url: course.youtube_url,
      duration: course.duration ?? "",
    });
    setError(null);
    setShowModal(true);
  }

  async function handleSave() {
    setError(null);
    if (!form.title.trim() || !form.youtube_url.trim()) {
      setError("El título y la URL de YouTube son obligatorios.");
      return;
    }
    if (!getYouTubeID(form.youtube_url)) {
      setError("La URL de YouTube no es válida.");
      return;
    }

    setSaving(true);
    try {
      let res: Response;
      if (editingCourse) {
        res = await fetch(`/api/courses/${editingCourse.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } else {
        res = await fetch("/api/courses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }

      if (!res.ok) {
        const msg = await res.json();
        throw new Error(msg.error ?? "Error al guardar");
      }

      setShowModal(false);
      await fetchCourses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este curso? Esta acción no se puede deshacer.")) return;
    setDeletingId(id);
    try {
      await fetch(`/api/courses/${id}`, { method: "DELETE" });
      await fetchCourses();
    } finally {
      setDeletingId(null);
    }
  }

  const previewId = getYouTubeID(form.youtube_url);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-slate-700">Gestión de cursos</h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-3.5 py-2 rounded-xl transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo curso
        </button>
      </div>

      {loading ? (
        <p className="text-xs text-slate-400">Cargando cursos…</p>
      ) : courses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
          <p className="text-slate-400 text-sm">No hay cursos aún. Crea el primero.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Curso</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide hidden md:table-cell">Descripción</th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold text-slate-400 uppercase tracking-wide">Duración</th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold text-slate-400 uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {courses.map(course => {
                const ytId = getYouTubeID(course.youtube_url);
                return (
                  <tr key={course.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {ytId && (
                          <img
                            src={`https://i.ytimg.com/vi/${ytId}/default.jpg`}
                            alt=""
                            className="w-14 h-9 object-cover rounded-lg flex-shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate max-w-[240px]">{course.title}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{course.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs max-w-[180px] truncate hidden md:table-cell">
                      {course.description ?? "—"}
                    </td>
                    <td className="px-5 py-3.5 text-center text-slate-500 text-xs">{course.duration ?? "—"}</td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEdit(course)}
                          className="text-xs text-indigo-600 hover:text-indigo-800 border border-indigo-200 hover:border-indigo-400 px-2.5 py-1 rounded-lg transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(course.id)}
                          disabled={deletingId === course.id}
                          className="text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {deletingId === course.id ? "…" : "Eliminar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">
                {editingCourse ? "Editar curso" : "Nuevo curso"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1.5">Título *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Ej: Unidad 1: Introducción al marketing"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1.5">URL de YouTube *</label>
                <input
                  type="url"
                  value={form.youtube_url}
                  onChange={e => setForm(f => ({ ...f, youtube_url: e.target.value }))}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                />
                {previewId && (
                  <div className="mt-2 flex items-center gap-2">
                    <img
                      src={`https://i.ytimg.com/vi/${previewId}/hqdefault.jpg`}
                      alt="Preview"
                      className="w-24 h-14 object-cover rounded-lg"
                    />
                    <span className="text-xs text-emerald-600 font-medium">Vista previa detectada</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1.5">Descripción</label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Ej: Propiedad Intelectual"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1.5">Duración</label>
                  <input
                    type="text"
                    value={form.duration}
                    onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                    placeholder="Ej: 12:34"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="text-sm text-slate-500 hover:text-slate-700 px-4 py-2 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
              >
                {saving ? "Guardando…" : editingCourse ? "Guardar cambios" : "Crear curso"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
