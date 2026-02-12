// app/login/page.tsx
"use client";

import { useActionState } from "react"; // Hook para actions
import { authenticate } from "@/app/actions/login";
import Link from "next/link";

export default function LoginPage() {
  const [errorMessage, dispatch] = useActionState(authenticate, undefined);

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <form action={dispatch} className="w-full max-w-md bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-6 text-center text-black">Iniciar Sesión</h1>
        
        {errorMessage && (
          <p className="bg-red-100 text-red-600 p-2 mb-4 rounded">{errorMessage}</p>
        )}

        <div className="mb-4">
          <label className="block text-gray-700">Correo</label>
          <input name="email" type="email" required className="w-full border p-2 rounded text-black" />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700">Contraseña</label>
          <input name="password" type="password" required className="w-full border p-2 rounded text-black" />
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Entrar
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          ¿No tienes cuenta? <Link href="/register" className="text-blue-600">Regístrate</Link>
        </p>
      </form>
    </div>
  );
}