// app/register/page.tsx
"use client";

import { registerUser } from "@/app/actions/register";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);
    
    const result = await registerUser(formData);

    if (result.error) {
      setError(result.error);
    } else {
      router.push("/login?registered=true");
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-6 text-center text-black">Crear Cuenta</h1>
        
        {error && <p className="bg-red-100 text-red-600 p-2 mb-4 rounded">{error}</p>}

        <div className="mb-4">
          <label className="block text-gray-700">Nombre</label>
          <input name="name" type="text" required className="w-full border p-2 rounded text-black" />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Correo</label>
          <input name="email" type="email" required className="w-full border p-2 rounded text-black" />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700">Contraseña</label>
          <input name="password" type="password" required className="w-full border p-2 rounded text-black" />
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Registrarse
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          ¿Ya tienes cuenta? <Link href="/login" className="text-blue-600">Inicia sesión</Link>
        </p>
      </form>
    </div>
  );
}