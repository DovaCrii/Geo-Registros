"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Error al registrarse.");
        setLoading(false);
        return;
      }

      router.push("/auth/login?registered=true");
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080f1e] px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-800/80 bg-slate-950/55 p-8 shadow-2xl shadow-cyan-950/10 backdrop-blur">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Aeroflow
            </h1>
          </Link>
          <p className="mt-2 text-sm text-slate-400">
            Creá tu cuenta para empezar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              {error}
            </div>
          )}

          <label className="block space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
              Nombre completo
            </span>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Tu nombre"
              className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
              Email
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
              Contraseña
            </span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-500/20"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl border border-cyan-400/30 bg-cyan-500/15 px-4 py-3 text-sm font-medium text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          ¿Ya tenés cuenta?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-cyan-300 transition hover:text-cyan-200"
          >
            Iniciá sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
