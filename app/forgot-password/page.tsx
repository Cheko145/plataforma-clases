"use client";

import { useActionState } from "react";
import { forgotPassword } from "@/app/actions/forgotPassword";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [state, dispatch] = useActionState(forgotPassword, undefined);

  if ((state as string) === "ok") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-5">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Revisa tu correo</h1>
          <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">
            Si el correo está registrado, recibirás un enlace para restablecer tu contraseña en los próximos minutos.
          </p>
          <Link href="/login" className="text-indigo-600 font-medium hover:underline text-sm">
            ← Volver al inicio de sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Marca */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 mb-4 shadow-lg">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Recuperar contraseña</h1>
          <p className="text-slate-500 text-sm mt-1">Te enviaremos un enlace a tu correo</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">

          {state && (state as string) !== "ok" && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-5">
              {state}
            </div>
          )}

          <form action={dispatch} className="space-y-4">
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

            <div className="pt-1">
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl transition-colors shadow-sm"
              >
                Enviar enlace de recuperación
              </button>
            </div>
          </form>

          <p className="mt-5 text-center text-sm">
            <Link href="/login" className="text-slate-400 hover:text-indigo-600 transition-colors">
              ← Volver al inicio de sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
