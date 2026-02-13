import Link from 'next/link';
import { misClases, getYouTubeID } from '@/data/courses';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { signOut } from '@/auth';

export default async function Dashboard() {
  const session = await auth();
  if (!session || !session.user) {
    redirect("/login");
  }

  const userName = session.user.name ?? session.user.email ?? "Estudiante";
  const initials = userName.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase();
  const isAdmin  = session.user.role === "admin";

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Navbar */}
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
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
      <main className="max-w-6xl mx-auto px-6 py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Hola, {userName.split(" ")[0]} 👋
          </h1>
          <p className="text-slate-500 mt-1">Estos son tus cursos disponibles. ¡A aprender!</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {misClases.map((clase) => {
            const videoId = getYouTubeID(clase.youtubeUrl);
            return (
              <Link
                key={clase.id}
                href={`/courses/${clase.id}/${videoId}`}
                className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col"
              >
                {/* Miniatura */}
                <div className="aspect-video bg-slate-100 relative overflow-hidden">
                  <img
                    src={clase.thumbnail}
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
                </div>

                {/* Info */}
                <div className="p-5 flex flex-col flex-1">
                  <h2 className="font-semibold text-slate-800 mb-1.5 group-hover:text-indigo-600 transition-colors leading-snug">
                    {clase.title}
                  </h2>
                  <p className="text-slate-400 text-sm flex-1 leading-relaxed">
                    {clase.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full">
                      {clase.duration}
                    </span>
                    <span className="text-indigo-600 text-sm font-medium group-hover:translate-x-0.5 transition-transform">
                      Ir al aula →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}