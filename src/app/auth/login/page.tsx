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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-[#080f1e]">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800/80 dark:bg-slate-950/55 dark:shadow-2xl dark:shadow-cyan-950/10">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              AeroFlow
            </h1>
          </Link>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Ingresá a la plataforma
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div role="alert" aria-live="polite" className="rounded-lg border border-red-200 dark:border-rose-500/30 bg-red-50 dark:bg-rose-500/10 px-4 py-3 text-sm text-danger dark:text-rose-300">
              {error}
            </div>
          )}

          <label className="block space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-600 dark:text-slate-400">
              Correo
            </span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700/80 bg-white dark:bg-slate-950/90 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-accent/60 dark:focus:border-cyan-400/60 focus:ring-2 focus:ring-accent/20 dark:focus:ring-cyan-500/20"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-600 dark:text-slate-400">
              Contraseña
            </span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700/80 bg-white dark:bg-slate-950/90 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-accent/60 dark:focus:border-cyan-400/60 focus:ring-2 focus:ring-accent/20 dark:focus:ring-cyan-500/20"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg border border-accent/30 dark:border-cyan-400/30 bg-accent/10 dark:bg-cyan-500/15 px-4 py-3 text-sm font-medium text-accent-strong dark:text-cyan-100 transition hover:border-accent/50 dark:hover:border-cyan-300/50 hover:bg-accent/15 dark:hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          ¿No tenés cuenta?{" "}
          <Link
            href="/auth/register"
            className="font-medium text-accent transition hover:text-accent-strong dark:text-cyan-300 dark:hover:text-cyan-200"
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
