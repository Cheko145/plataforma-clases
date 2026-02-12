import VideoPlayer from '@/components/VideoPlayer';
import ChatInterface from '@/components/ChatInterface';
import { auth } from "@/auth"; // <--- Importamos auth
import { redirect } from "next/navigation";
interface PageProps {
  params: Promise<{ id: string ,videoId: string}>;
}

export default async function ClaseDinamica({ params }: PageProps) {
  const session = await auth();
  if (!session || !session.user) {
    redirect("/login");
  }
  const { id,videoId } = await params; 

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna Video */}
        <section className="lg:col-span-2 space-y-4">
          <VideoPlayer videoId={videoId} />
          <div className="bg-white p-4 rounded-lg shadow">
            <h1 className="text-xl font-bold">Viendo clase ID: {id}</h1>
          </div>
        </section>

        {/* Columna Chat */}
        <aside className="lg:col-span-1">
          <ChatInterface videoId={id} userName='Estudiante' id={videoId} />
        </aside>

      </div>
    </main>
  );
}