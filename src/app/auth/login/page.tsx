"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
        callbackUrl,
      });

      if (!result?.ok || result.error) {
        setError("Credenciales inválidas. Verificá tu email y contraseña.");
        return;
      }

      const target = result.url ?? callbackUrl;
      router.replace(target);
      router.refresh();
    } catch {
      setError("No se pudo iniciar sesión. Intentá nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.16),_transparent_42%),radial-gradient(circle_at_bottom,_rgba(14,165,233,0.12),_transparent_38%),linear-gradient(180deg,_#020617,_#0f172a_60%,_#111827)]" />
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-slate-950/80 p-8 shadow-2xl shadow-cyan-950/20 backdrop-blur-md">
        {/* Header */}
          <div className="mb-8 text-center">
            <Link href="/" className="inline-block">
            <h1 className="text-2xl font-bold tracking-tight text-white">
                AeroFlow
              </h1>
            </Link>
          <p className="mt-2 text-sm text-slate-300">
            Ingresá a la plataforma
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div role="alert" aria-live="polite" className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          )}

          <label className="block space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-300">
              Correo
            </span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full rounded-lg border border-slate-700/80 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-300">
              Contraseña
            </span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-700/80 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg border border-cyan-400/30 bg-cyan-500/15 px-4 py-3 text-sm font-medium text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>

          <p className="mt-6 text-center text-sm text-slate-300">
            ¿No tenés cuenta?{" "}
            <Link
              href="/auth/register"
            className="font-medium text-cyan-300 transition hover:text-cyan-200"
            >
              Registrate
            </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
