import { createGoogleGenerativeAI } from '@ai-sdk/google';

// Configuración centralizada del proveedor de IA
export const googleAI = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

// Definimos el modelo específico aquí para fácil cambio futuro
export const chatModel = googleAI('models/gemini-3-flash-preview');