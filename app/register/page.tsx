// app/register/page.tsx
"use client";

import { registerUser } from "@/app/actions/register";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(event: { preventDefault(): void; currentTarget: HTMLFormElement }) {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Marca */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 mb-4 shadow-lg">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Crea tu cuenta</h1>
          <p className="text-slate-500 text-sm mt-1">Únete y comienza a aprender hoy</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Nombre completo
              </label>
              <input
                name="name"
                type="text"
                required
                placeholder="Juan Pérez"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm
                           placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Correo electrónico
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="tu@correo.com"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm
                           placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Contraseña
              </label>
              <input
                name="password"
                type="password"
                required
                placeholder="Mínimo 6 caracteres"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm
                           placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            <div className="pt-1">
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl transition-colors shadow-sm"
              >
                Crear cuenta
              </button>
            </div>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-indigo-600 font-medium hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
