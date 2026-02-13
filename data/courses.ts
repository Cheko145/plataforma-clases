export interface courses {
  id: string;
  duration: string;
  questions: {
    q1: string;
    q2: string;
    q3: string;
    [key: string]: string; // Por si algún día añades q4, q5...
  };
  title: string;
  description: string;
  youtubeUrl: string;
  thumbnail: string;
}
export const misClases = [
  {
    id: "video_1", // ID único interno (opcional)
    duration:"1:14",
    title: "Clase 1: Propiedad Intelectual",
    description: "Propiedad Intelectual",
    questions:{
     q1: "¿Qué es una variable en programación?",
     q2:"¿Para qué se utilizan las estructuras de control?",
     q3:"Menciona un ejemplo de estructura de control y explica su función." 
    },
    youtubeUrl: "https://www.youtube.com/watch?v=FOKl4tfXlsE", // Pegas tu link aquí
    thumbnail: "https://i.ytimg.com/vi/FOKl4tfXlsE/hqdefault.jpg?sqp=-oaymwFBCNACELwBSFryq4qpAzMIARUAAIhCGAHYAQHiAQoIGBACGAY4AUAB8AEB-AH-CYAC0AWKAgwIABABGGUgUihGMA8=&rs=AOn4CLCsChl7uujQyeOU-v7AC5MXiTy1Ag" // Truco: así obtienes la miniatura auto
  },  
  {
    id: "video_2",
    duration:"15:30",
    questions:{
     q1: "¿Qué es una variable en programación?",
      q2:"¿Para qué se utilizan las estructuras de control?",
     q3:"Menciona un ejemplo de estructura de control y explica su función." 
    },
    title: "Clase 2: Estructuras de Control",
    description: "Aprende sobre if, else y bucles for/while.",
    youtubeUrl: "https://www.youtube.com/watch?v=6vcdxuNyKxc", 
    thumbnail: "hhttps://i.ytimg.com/an_webp/6vcdxuNyKxc/mqdefault_6s.webp?du=3000&sqp=CPPGuMwG&rs=AOn4CLAxQX9exg8KpdIGDSwQE2cQcUM6GQ"
  },
  
  // ... agrega todos los que quieras
];

// Función auxiliar para sacar el ID limpio de YouTube (la usaremos en la vista)
export function getYouTubeID(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}