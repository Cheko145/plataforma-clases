import { getValidToken } from "@/lib/tokens";
import ResetPasswordForm from "./ResetPasswordForm";
import Link from "next/link";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function ResetPasswordPage({ params }: PageProps) {
  const { token } = await params;
  const record = await getValidToken(token);

  if (!record) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-5">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Enlace inválido</h1>
          <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">
            Este enlace ha expirado o ya fue utilizado. Solicita uno nuevo.
          </p>
          <Link href="/forgot-password" className="text-indigo-600 font-medium hover:underline text-sm">
            Solicitar nuevo enlace
          </Link>
        </div>
      </div>
    );
  }

  return <ResetPasswordForm token={token} />;
}