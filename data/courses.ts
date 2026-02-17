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
    duration:"3:29",
    title: "Unidad 2: Identificacion de oportunidades de negocio y desarrollo de productos",
    description: "Propiedad Intelectual",
    questions:{
     q1: "¿Cuáles son los tres elementos esenciales que permiten distinguir una oportunidad de negocio real de una simple idea?",
     q2:"¿En qué se diferencian las oportunidades de naturaleza 'schumpeteriana' de las 'kirznerianas' en cuanto al manejo de la información? ",
     q3:"Según la teoría de los 'trabajos por hacer' (Jobs to be Done) de Clayton Christensen, ¿cuál es el motivo real por el cual un cliente adquiere un producto o servicio? ", 
     q4:"¿Cuál es la ventaja principal de aplicar el 'Lienzo Lean' (Lean Canvas) en emprendimientos nuevos en comparación con el modelo Canvas tradicional? "
    },
    youtubeUrl: "https://www.youtube.com/watch?v=1iWXyKuMHXI", // Pegas tu link aquí
    thumbnail: "hhttps://i.ytimg.com/an_webp/Nnv0W23BHJQ/mqdefault_6s.webp?du=3000&sqp=CLyG08wG&rs=AOn4CLCWj3d5xYWKhA0lsB1fpfu-QYGuZg" // Truco: así obtienes la miniatura auto
  },  
  
  // ... agrega todos los que quieras
];

// Función auxiliar para sacar el ID limpio de YouTube (la usaremos en la vista)
export function getYouTubeID(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}