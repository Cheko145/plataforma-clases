import VideoPlayer from '@/components/VideoPlayer';
import ChatInterface from '@/components/ChatInterface';
import { auth } from "@/auth"; // <--- Importamos auth
import { redirect } from "next/navigation";
interface PageProps {
  params: Promise<{ id: string; videoId: string }>;
}

export default async function ClaseDinamica({ params }: PageProps) {
  const session = await auth();
  if (!session || !session.user) {
    redirect("/login");
  }
  const { id, videoId } = await params;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Navbar */}
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-3">
          <a href="/" className="text-slate-400 hover:text-indigo-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </a>
          <div className="w-px h-4 bg-slate-200" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-slate-700">Aula Virtual</span>
          </div>
          <span className="text-slate-300 text-sm ml-1">/ Clase</span>
        </div>
      </nav>

      {/* Contenido */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Columna Video */}
          <section className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-100 bg-black">
              <VideoPlayer videoId={videoId} />
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4">
              <h1 className="text-lg font-semibold text-slate-800">Clase en curso</h1>
              <p className="text-slate-400 text-sm mt-0.5">El asistente IA puede hacerte preguntas durante la clase para evaluar tu comprensión.</p>
            </div>
          </section>

          {/* Columna Chat */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3-3-3z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-slate-700">Profesor IA</span>
                <span className="ml-auto w-2 h-2 rounded-full bg-green-400"></span>
              </div>
              <ChatInterface videoId={id} userName={session.user.name ?? "Estudiante"} id={videoId} courseId={id} />
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
}