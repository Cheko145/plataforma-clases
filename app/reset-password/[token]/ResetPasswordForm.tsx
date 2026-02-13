"use client";

import { useActionState } from "react";
import { resetPassword } from "@/app/actions/resetPassword";
import Link from "next/link";

export default function ResetPasswordForm({ token }: { token: string }) {
  const [error, dispatch] = useActionState(resetPassword, undefined);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 mb-4 shadow-lg">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Nueva contraseña</h1>
          <p className="text-slate-500 text-sm mt-1">Elige una contraseña segura</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-5">
              {error}
            </div>
          )}

          <form action={dispatch} className="space-y-4">
            <input type="hidden" name="token" value={token} />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Nueva contraseña
              </label>
              <input
                name="password"
                type="password"
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm
                           placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Confirmar contraseña
              </label>
              <input
                name="confirmPassword"
                type="password"
                required
                minLength={6}
                placeholder="Repite la contraseña"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 text-sm
                           placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            <div className="pt-1">
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl transition-colors shadow-sm"
              >
                Cambiar contraseña
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