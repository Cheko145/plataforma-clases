import Link from 'next/link';
import { getCoursesByUserId, getAllCourses, getYouTubeID, getCoursesWithDeadlinesForUser } from '@/lib/courses-db';
import { getWatchedCourseIds } from '@/lib/video-watches';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { signOut } from '@/auth';
import NotificationBell from '@/components/NotificationBell';

export default async function Dashboard() {
  const session = await auth();
  if (!session || !session.user) {
    redirect("/login");
  }

  const userName = session.user.name ?? session.user.email ?? "Estudiante";
  const initials = userName.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase();
  const isAdmin  = session.user.role === "admin";

  const [misClases, watchedIds, deadlines] = await Promise.all([
    isAdmin ? getAllCourses() : getCoursesByUserId(session.user.id!),
    isAdmin ? Promise.resolve([]) : getWatchedCourseIds(session.user.id!),
    isAdmin ? Promise.resolve([]) : getCoursesWithDeadlinesForUser(session.user.id!),
  ]);

  const watchedSet = new Set(watchedIds);

  // Sort deadlines ascending
  const upcomingDeadlines = [...deadlines].sort(
    (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
  );

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Navbar */}
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="font-bold text-slate-800 text-lg">Aula Virtual</span>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 text-xs text-indigo-600 border border-indigo-200 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors font-medium"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Panel Admin
              </Link>
            )}
            {/* Notification Bell (client component) */}
            <NotificationBell />
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                {initials}
              </div>
              <span className="text-sm text-slate-600 hidden sm:block">{userName}</span>
            </div>
            <form action={async () => { "use server"; await signOut({ redirectTo: "/login" }); }}>
              <button
                type="submit"
                className="text-xs text-slate-400 hover:text-slate-600 border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-lg transition-colors"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </nav>

      {/* Contenido */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Hola, {userName.split(" ")[0]} 👋
          </h1>
          <p className="text-slate-500 mt-1">Estos son tus cursos disponibles. ¡A aprender!</p>
        </header>

        <div className="flex gap-6 items-start">

          {/* Grid de cursos */}
          <div className="flex-1 min-w-0">
            {misClases.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h2 className="text-slate-700 font-semibold text-lg mb-1">
                  {isAdmin ? "No hay cursos creados" : "Aún no tienes cursos asignados"}
                </h2>
                <p className="text-slate-400 text-sm max-w-sm">
                  {isAdmin
                    ? "Crea cursos desde el Panel Admin para que aparezcan aquí."
                    : "Contacta a tu administrador para que te asigne a un grupo y puedas acceder a las clases."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {misClases.map((clase) => {
                  const videoId = getYouTubeID(clase.youtube_url);
                  const isWatched = watchedSet.has(clase.id);
                  const courseDeadline = upcomingDeadlines.find(d => d.course_id === clase.id);
                  const isPastDeadline = courseDeadline ? new Date() > new Date(courseDeadline.deadline) : false;

                  return (
                    <Link
                      key={clase.id}
                      href={`/courses/${clase.id}/${videoId}`}
                      className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col"
                    >
                      {/* Miniatura */}
                      <div className="aspect-video bg-slate-100 relative overflow-hidden">
                        <img
                          src={clase.thumbnail ?? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
                          alt={clase.title}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/25">
                          <div className="bg-white/95 text-indigo-600 rounded-full px-4 py-2 text-sm font-semibold shadow-sm flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                            Ver clase
                          </div>
                        </div>
                        {/* Green check if watched */}
                        {isWatched && (
                          <div className="absolute top-2 right-2 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center shadow-md">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-5 flex flex-col flex-1">
                        <h2 className="font-semibold text-slate-800 mb-1.5 group-hover:text-indigo-600 transition-colors leading-snug">
                          {clase.title}
                        </h2>
                        <p className="text-slate-400 text-sm flex-1 leading-relaxed">
                          {clase.description}
                        </p>
                        <div className="mt-4 flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-xs text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full">
                            {clase.duration ?? "—"}
                          </span>
                          {courseDeadline && (
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                              isPastDeadline
                                ? "bg-red-50 text-red-600 border border-red-100"
                                : "bg-amber-50 text-amber-700 border border-amber-100"
                            }`}>
                              {isPastDeadline ? "Vencido" : `Límite: ${new Date(courseDeadline.deadline).toLocaleDateString("es-MX", { day: "2-digit", month: "short" })}`}
                            </span>
                          )}
                          {!courseDeadline && (
                            <span className="text-indigo-600 text-sm font-medium group-hover:translate-x-0.5 transition-transform">
                              Ir al aula →
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar calendario (solo alumnos) */}
          {!isAdmin && upcomingDeadlines.length > 0 && (
            <aside className="w-64 flex-shrink-0 hidden lg:block">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden sticky top-24">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                  <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-semibold text-slate-800">Próximas entregas</span>
                </div>
                <div className="divide-y divide-slate-50">
                  {upcomingDeadlines.map((item) => {
                    const dl = new Date(item.deadline);
                    const now = new Date();
                    const diffMs = dl.getTime() - now.getTime();
                    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                    const isPast = diffMs < 0;
                    const isWatched = watchedSet.has(item.course_id);

                    let urgency = "text-slate-500 bg-slate-50";
                    if (isPast) urgency = "text-red-600 bg-red-50";
                    else if (diffDays <= 2) urgency = "text-orange-600 bg-orange-50";
                    else if (diffDays <= 7) urgency = "text-amber-600 bg-amber-50";

                    return (
                      <Link
                        key={item.course_id}
                        href={`/courses/${item.course_id}/${getYouTubeID(item.youtube_url)}`}
                        className="block px-4 py-3 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5 flex-shrink-0">
                            {isWatched ? (
                              <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            ) : (
                              <div className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-slate-700 leading-snug line-clamp-2">{item.title}</p>
                            <span className={`inline-block mt-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${urgency}`}>
                              {isPast
                                ? "Vencido"
                                : diffDays === 0
                                ? "Hoy"
                                : diffDays === 1
                                ? "Mañana"
                                : `${diffDays} días`}
                            </span>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {dl.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })}
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}
