"use client";

import { registerUser } from "@/app/actions/register";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const requirements = [
  { label: "Mínimo 8 caracteres",                  test: (p: string) => p.length >= 8 },
  { label: "Al menos una letra mayúscula",          test: (p: string) => /[A-Z]/.test(p) },
  { label: "Al menos un número",                    test: (p: string) => /[0-9]/.test(p) },
  { label: "Al menos un carácter especial (!@#$…)", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [showReqs, setShowReqs] = useState(false);
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

  const allMet = requirements.every(r => r.test(password));

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
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setShowReqs(true)}
                placeholder="Crea una contraseña segura"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm
                           placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />

              {/* Requisitos de contraseña — aparecen al enfocar el campo */}
              {showReqs && (
                <ul className="mt-2.5 space-y-1.5 px-1">
                  {requirements.map(req => {
                    const met = req.test(password);
                    const typed = password.length > 0;
                    return (
                      <li key={req.label} className="flex items-center gap-2">
                        <span className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                          met ? 'bg-emerald-500' : typed ? 'bg-red-400' : 'bg-slate-200'
                        }`}>
                          {met ? (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </span>
                        <span className={`text-xs transition-colors ${
                          met ? 'text-emerald-600' : typed ? 'text-red-500' : 'text-slate-400'
                        }`}>
                          {req.label}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={password.length > 0 && !allMet}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl transition-colors shadow-sm
                           disabled:opacity-40 disabled:cursor-not-allowed"
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
