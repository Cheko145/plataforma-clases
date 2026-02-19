"use client";

import { useState, useEffect, useCallback } from "react";

interface Group {
  id: string;
  name: string;
  description: string | null;
  member_count: number;
  course_count: number;
}

interface Member {
  user_id: string;
  name: string | null;
  email: string | null;
}

interface StudentBasic {
  id: string;
  name: string | null;
  email: string | null;
}

interface CourseBasic {
  id: string;
  title: string;
  youtube_url: string;
}

interface GroupCourse {
  course_id: string;
  title: string;
}

type Tab = "alumnos" | "cursos";

export default function GroupManager() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("alumnos");

  // Datos del grupo seleccionado
  const [members, setMembers] = useState<Member[]>([]);
  const [allStudents, setAllStudents] = useState<StudentBasic[]>([]);
  const [groupCourses, setGroupCourses] = useState<GroupCourse[]>([]);
  const [allCourses, setAllCourses] = useState<CourseBasic[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  // Modal de crear/editar grupo
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [savingGroup, setSavingGroup] = useState(false);
  const [groupError, setGroupError] = useState<string | null>(null);

  // Búsqueda en listas
  const [studentSearch, setStudentSearch] = useState("");
  const [courseSearch, setCourseSearch] = useState("");

  const fetchGroups = useCallback(async () => {
    const res = await fetch("/api/groups");
    const data = await res.json();
    setGroups(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);

  const loadGroupDetail = useCallback(async (group: Group) => {
    setDetailLoading(true);
    setSelectedGroup(group);
    setActiveTab("alumnos");

    const [membersRes, coursesRes] = await Promise.all([
      fetch(`/api/groups/${group.id}/members`),
      fetch(`/api/groups/${group.id}/courses`),
    ]);
    const { members: m, allStudents: s } = await membersRes.json();
    const { groupCourses: gc, allCourses: ac } = await coursesRes.json();

    setMembers(m);
    setAllStudents(s);
    setGroupCourses(gc);
    setAllCourses(ac);
    setDetailLoading(false);
  }, []);

  function openCreateGroup() {
    setEditingGroup(null);
    setGroupName("");
    setGroupDesc("");
    setGroupError(null);
    setShowGroupModal(true);
  }

  function openEditGroup(group: Group, e: React.MouseEvent) {
    e.stopPropagation();
    setEditingGroup(group);
    setGroupName(group.name);
    setGroupDesc(group.description ?? "");
    setGroupError(null);
    setShowGroupModal(true);
  }

  async function handleSaveGroup() {
    if (!groupName.trim()) { setGroupError("El nombre es obligatorio."); return; }
    setSavingGroup(true);
    setGroupError(null);
    try {
      let res: Response;
      if (editingGroup) {
        res = await fetch(`/api/groups/${editingGroup.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: groupName.trim(), description: groupDesc.trim() || undefined }),
        });
      } else {
        res = await fetch("/api/groups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: groupName.trim(), description: groupDesc.trim() || undefined }),
        });
      }
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setShowGroupModal(false);
      await fetchGroups();
      if (selectedGroup && editingGroup?.id === selectedGroup.id) {
        // Recargar detalle si estamos viendo ese grupo
        const updated = await res.json();
        setSelectedGroup(prev => prev ? { ...prev, ...updated } : null);
      }
    } catch (err) {
      setGroupError(err instanceof Error ? err.message : "Error");
    } finally {
      setSavingGroup(false);
    }
  }

  async function handleDeleteGroup(group: Group, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm(`¿Eliminar el grupo "${group.name}"? Se quitarán todos los alumnos y cursos asignados.`)) return;
    await fetch(`/api/groups/${group.id}`, { method: "DELETE" });
    if (selectedGroup?.id === group.id) setSelectedGroup(null);
    await fetchGroups();
  }

  async function toggleMember(userId: string, isMember: boolean) {
    if (!selectedGroup) return;
    const method = isMember ? "DELETE" : "POST";
    await fetch(`/api/groups/${selectedGroup.id}/members`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    // Actualizar estado local optimistamente
    if (isMember) {
      setMembers(prev => prev.filter(m => m.user_id !== userId));
    } else {
      const student = allStudents.find(s => s.id === userId);
      if (student) {
        setMembers(prev => [...prev, { user_id: student.id, name: student.name, email: student.email }]);
      }
    }
    // Actualizar conteo en la lista
    setGroups(prev => prev.map(g =>
      g.id === selectedGroup.id
        ? { ...g, member_count: g.member_count + (isMember ? -1 : 1) }
        : g
    ));
    setSelectedGroup(prev => prev ? { ...prev, member_count: prev.member_count + (isMember ? -1 : 1) } : null);
  }

  async function toggleCourse(courseId: string, isAssigned: boolean) {
    if (!selectedGroup) return;
    const method = isAssigned ? "DELETE" : "POST";
    await fetch(`/api/groups/${selectedGroup.id}/courses`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    });
    if (isAssigned) {
      setGroupCourses(prev => prev.filter(c => c.course_id !== courseId));
    } else {
      const course = allCourses.find(c => c.id === courseId);
      if (course) {
        setGroupCourses(prev => [...prev, { course_id: course.id, title: course.title }]);
      }
    }
    setGroups(prev => prev.map(g =>
      g.id === selectedGroup.id
        ? { ...g, course_count: g.course_count + (isAssigned ? -1 : 1) }
        : g
    ));
    setSelectedGroup(prev => prev ? { ...prev, course_count: prev.course_count + (isAssigned ? -1 : 1) } : null);
  }

  const memberIds = new Set(members.map(m => m.user_id));
  const assignedCourseIds = new Set(groupCourses.map(c => c.course_id));

  const filteredStudents = allStudents.filter(s =>
    studentSearch === "" ||
    (s.name ?? "").toLowerCase().includes(studentSearch.toLowerCase()) ||
    (s.email ?? "").toLowerCase().includes(studentSearch.toLowerCase())
  );

  const filteredCourses = allCourses.filter(c =>
    courseSearch === "" || c.title.toLowerCase().includes(courseSearch.toLowerCase())
  );

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-slate-700">Gestión de grupos</h2>
        <button
          onClick={openCreateGroup}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-3.5 py-2 rounded-xl transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo grupo
        </button>
      </div>

      {loading ? (
        <p className="text-xs text-slate-400">Cargando grupos…</p>
      ) : (
        <div className="flex gap-4 items-start">
          {/* Lista de grupos */}
          <div className="w-72 flex-shrink-0 space-y-2">
            {groups.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-center">
                <p className="text-slate-400 text-xs">No hay grupos. Crea el primero.</p>
              </div>
            ) : (
              groups.map(group => (
                <div
                  key={group.id}
                  onClick={() => loadGroupDetail(group)}
                  className={`bg-white rounded-2xl border shadow-sm p-4 cursor-pointer transition-all ${
                    selectedGroup?.id === group.id
                      ? "border-indigo-300 shadow-indigo-100"
                      : "border-slate-100 hover:border-slate-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{group.name}</p>
                      {group.description && (
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{group.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-slate-500">
                          <span className="font-semibold text-indigo-600">{group.member_count}</span> alumnos
                        </span>
                        <span className="text-xs text-slate-500">
                          <span className="font-semibold text-emerald-600">{group.course_count}</span> cursos
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={e => openEditGroup(group, e)}
                        className="text-slate-400 hover:text-indigo-600 p-1 rounded-lg hover:bg-indigo-50 transition-colors"
                        title="Editar grupo"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={e => handleDeleteGroup(group, e)}
                        className="text-slate-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-colors"
                        title="Eliminar grupo"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Panel derecho */}
          {selectedGroup ? (
            <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-800">{selectedGroup.name}</p>
                {selectedGroup.description && (
                  <p className="text-xs text-slate-400 mt-0.5">{selectedGroup.description}</p>
                )}
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-100">
                {(["alumnos", "cursos"] as Tab[]).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-3 text-xs font-medium capitalize transition-colors ${
                      activeTab === tab
                        ? "text-indigo-600 border-b-2 border-indigo-500"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {tab === "alumnos"
                      ? `Alumnos (${selectedGroup.member_count})`
                      : `Cursos (${selectedGroup.course_count})`}
                  </button>
                ))}
              </div>

              {detailLoading ? (
                <div className="p-8 text-center text-xs text-slate-400">Cargando…</div>
              ) : activeTab === "alumnos" ? (
                <div className="p-4">
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={e => setStudentSearch(e.target.value)}
                    placeholder="Buscar alumno…"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                  />
                  <div className="space-y-1 max-h-72 overflow-y-auto">
                    {filteredStudents.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">No hay alumnos registrados.</p>
                    ) : (
                      filteredStudents.map(student => {
                        const isMember = memberIds.has(student.id);
                        return (
                          <div
                            key={student.id}
                            className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-slate-50 transition-colors"
                          >
                            <div>
                              <p className="text-sm font-medium text-slate-700">{student.name ?? "—"}</p>
                              <p className="text-xs text-slate-400">{student.email}</p>
                            </div>
                            <button
                              onClick={() => toggleMember(student.id, isMember)}
                              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                                isMember
                                  ? "bg-red-50 text-red-600 hover:bg-red-100"
                                  : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                              }`}
                            >
                              {isMember ? "Quitar" : "Agregar"}
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4">
                  <input
                    type="text"
                    value={courseSearch}
                    onChange={e => setCourseSearch(e.target.value)}
                    placeholder="Buscar curso…"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                  />
                  <div className="space-y-1 max-h-72 overflow-y-auto">
                    {filteredCourses.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">No hay cursos creados.</p>
                    ) : (
                      filteredCourses.map(course => {
                        const isAssigned = assignedCourseIds.has(course.id);
                        return (
                          <div
                            key={course.id}
                            className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-slate-50 transition-colors"
                          >
                            <p className="text-sm font-medium text-slate-700 max-w-[280px] truncate">{course.title}</p>
                            <button
                              onClick={() => toggleCourse(course.id, isAssigned)}
                              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors flex-shrink-0 ml-2 ${
                                isAssigned
                                  ? "bg-red-50 text-red-600 hover:bg-red-100"
                                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              }`}
                            >
                              {isAssigned ? "Quitar" : "Asignar"}
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center py-16">
              <div className="text-center">
                <svg className="w-10 h-10 text-slate-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-slate-400 text-sm">Selecciona un grupo para ver sus detalles</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal grupo */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">
                {editingGroup ? "Editar grupo" : "Nuevo grupo"}
              </h3>
              <button
                onClick={() => setShowGroupModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1.5">Nombre del grupo *</label>
                <input
                  type="text"
                  value={groupName}
                  onChange={e => setGroupName(e.target.value)}
                  placeholder="Ej: Grupo A — Mañana"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1.5">Descripción (opcional)</label>
                <input
                  type="text"
                  value={groupDesc}
                  onChange={e => setGroupDesc(e.target.value)}
                  placeholder="Ej: Cohorte 2025 — Turno matutino"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                />
              </div>
              {groupError && (
                <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{groupError}</p>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setShowGroupModal(false)}
                className="text-sm text-slate-500 hover:text-slate-700 px-4 py-2 rounded-xl border border-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveGroup}
                disabled={savingGroup}
                className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
              >
                {savingGroup ? "Guardando…" : editingGroup ? "Guardar" : "Crear grupo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
