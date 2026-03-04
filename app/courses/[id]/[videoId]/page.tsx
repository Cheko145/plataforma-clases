import LessonClient from '@/components/LessonClient';
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getCoursesByUserId } from "@/lib/courses-db";

interface PageProps {
  params: Promise<{ id: string; videoId: string }>;
}

export default async function ClaseDinamica({ params }: PageProps) {
  const session = await auth();
  if (!session || !session.user) {
    redirect("/login");
  }
  const { id, videoId } = await params;

  // Los admins tienen acceso total; los alumnos solo a sus cursos de grupo
  if (session.user.role !== "admin") {
    const accessibleCourses = await getCoursesByUserId(session.user.id!);
    const hasAccess = accessibleCourses.some((c) => c.id === id);
    if (!hasAccess) redirect("/");
  }

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
        <LessonClient
          videoId={videoId}
          courseId={id}
          userName={session.user.name ?? "Estudiante"}
        />
      </main>
    </div>
  );
}