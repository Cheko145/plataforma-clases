import Link from 'next/link';
import { misClases, getYouTubeID } from '@/data/courses';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const session = await auth();
   if (!session || !session.user) {
      redirect("/login");
    }
  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Mis Cursos Disponibles</h1>
          <p className="text-slate-600">Selecciona una clase para comenzar</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {misClases.map((clase) => {
            const videoId = getYouTubeID(clase.youtubeUrl);
            
            return (
              <Link 
                key={clase.id} 
                href={`/courses/${clase.id}/${videoId}`} // Esto conecta con la página dinámica
                className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-200 flex flex-col"
              >
                {/* Miniatura */}
                <div className="aspect-video bg-gray-200 relative overflow-hidden">
                  <img 
                    src={clase.thumbnail} 
                    alt={clase.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Botón de Play superpuesto */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                    <span className="bg-white/90 text-black rounded-full p-3">
                      ▶ Ver Clase
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-5 flex flex-col flex-1">
                  <h2 className="font-bold text-lg text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                    {clase.title}
                  </h2>
                  <p className="text-slate-500 text-sm mb-4 flex-1">
                    {clase.description}
                  </p>
                  <span className="text-blue-600 text-sm font-medium self-start">
                    Ir al aula virtual &rarr;
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}