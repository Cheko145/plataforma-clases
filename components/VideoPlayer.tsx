// src/components/VideoPlayer.tsx
'use client'; // 1. Obligatorio ser la primera línea

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// 2. Importación dinámica para evitar errores de "window is not defined"
const ReactPlayer = dynamic(() => import('react-player'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-200 animate-pulse" />
});

interface VideoPlayerProps {
  videoId: string;
}

export default function VideoPlayer({ videoId }: VideoPlayerProps) {
  // Estado para asegurarnos que solo renderizamos en cliente (doble seguridad)
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="aspect-video bg-gray-900 rounded-lg" />; // Placeholder inicial
  }

  return (
    <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-xl border border-gray-800">
      <ReactPlayer 
        src={`https://www.youtube.com/watch?v=${videoId}`}
        width="100%" 
        height="100%" 
        controls={true}
        // Opcional: callback cuando termina el video
        // onEnded={() => console.log('El alumno terminó de ver el video')}
      />
    </div>
  );
}