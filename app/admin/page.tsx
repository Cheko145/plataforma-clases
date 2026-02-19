import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAllAnswers, getEngagementByStudent } from "@/lib/answers";
import Link from "next/link";
import QuestionManager from "@/components/QuestionManager";

export default async function AdminPage() {
  const session = await auth();
  if (!session || !session.user) redirect("/login");
  if (session.user.role !== "admin") redirect("/");

  const [answers, engagement] = await Promise.all([
    getAllAnswers(),
    getEngagementByStudent(),
  ]);

  const correctCount   = answers.filter(a => a.is_correct === true).length;
  const incorrectCount = answers.filter(a => a.is_correct === false).length;
  const uniqueStudents = engagement.length;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Navbar */}
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-slate-400 hover:text-indigo-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="w-px h-4 bg-slate-200" />
            <span className="text-sm font-semibold text-slate-700">Panel de Calificaciones</span>
          </div>
          <a
            href="/api/export"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            Exportar a Excel
          </a>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">

        <QuestionManager />

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <p className="text-slate-400 text-xs uppercase tracking-wide font-medium mb-1">Alumnos activos</p>
            <p className="text-3xl font-bold text-indigo-600">{uniqueStudents}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <p className="text-slate-400 text-xs uppercase tracking-wide font-medium mb-1">Total respuestas</p>
            <p className="text-3xl font-bold text-slate-800">{answers.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <p className="text-slate-400 text-xs uppercase tracking-wide font-medium mb-1">Correctas</p>
            <p className="text-3xl font-bold text-emerald-600">{correctCount}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <p className="text-slate-400 text-xs uppercase tracking-wide font-medium mb-1">Incorrectas</p>
            <p className="text-3xl font-bold text-red-500">{incorrectCount}</p>
          </div>
        </div>

        {/* Engagement por alumno */}
        {engagement.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Engagement por alumno</h2>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Alumno</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Email</th>
                    <th className="px-5 py-3.5 text-center text-xs font-semibold text-slate-400 uppercase tracking-wide">Respuestas</th>
                    <th className="px-5 py-3.5 text-center text-xs font-semibold text-slate-400 uppercase tracking-wide">Correctas</th>
                    <th className="px-5 py-3.5 text-center text-xs font-semibold text-slate-400 uppercase tracking-wide">Incorrectas</th>
                    <th className="px-5 py-3.5 text-center text-xs font-semibold text-slate-400 uppercase tracking-wide">% Acierto</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Última actividad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {engagement.map((e) => {
                    const pct = e.pct_correct !== null ? Number(e.pct_correct) : null;
                    const pctColor =
                      pct === null ? "text-slate-300" :
                      pct >= 70    ? "text-emerald-600" :
                      pct >= 40    ? "text-amber-500"   : "text-red-500";
                    return (
                      <tr key={e.user_id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-slate-800">{e.user_name ?? "—"}</td>
                        <td className="px-5 py-3.5 text-slate-500 text-xs">{e.user_email ?? "—"}</td>
                        <td className="px-5 py-3.5 text-center font-semibold text-slate-700">{e.total_answers}</td>
                        <td className="px-5 py-3.5 text-center text-emerald-600 font-medium">{e.correct_count}</td>
                        <td className="px-5 py-3.5 text-center text-red-500 font-medium">{e.incorrect_count}</td>
                        <td className="px-5 py-3.5 text-center">
                          {pct !== null ? (
                            <span className={`font-bold text-sm ${pctColor}`}>{pct}%</span>
                          ) : (
                            <span className="text-slate-300 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-slate-400 text-xs whitespace-nowrap">
                          {new Date(e.last_activity).toLocaleDateString("es-MX", {
                            day: "2-digit", month: "short", year: "numeric",
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <h2 className="text-sm font-semibold text-slate-700 mb-3">Detalle de respuestas</h2>

        {answers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-slate-400 font-medium">No hay respuestas registradas aún</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Alumno</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Email</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Curso</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Pregunta</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Respuesta</th>
                  <th className="px-5 py-3.5 text-center text-xs font-semibold text-slate-400 uppercase tracking-wide">Resultado</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {answers.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-800">{a.user_name ?? "—"}</td>
                    <td className="px-5 py-3.5 text-slate-500">{a.user_email ?? "—"}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs bg-indigo-50 text-indigo-600 font-medium px-2.5 py-1 rounded-full">
                        {a.course_id}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 max-w-[180px] truncate" title={a.question}>
                      {a.question}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 max-w-[180px] truncate" title={a.answer}>
                      {a.answer}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {a.is_correct === true && (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-medium">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          Correcto
                        </span>
                      )}
                      {a.is_correct === false && (
                        <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 px-2.5 py-1 rounded-full text-xs font-medium">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Incorrecto
                        </span>
                      )}
                      {a.is_correct === null && (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 text-xs whitespace-nowrap">
                      {new Date(a.created_at).toLocaleDateString("es-MX", {
                        day: "2-digit", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
