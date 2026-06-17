"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { validateName, validateEmail, validatePassword } from "@/lib/validation";

type FieldErrors = {
  fullName?: string;
  email?: string;
  password?: string;
};

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  function validate(): FieldErrors {
    const errs: FieldErrors = {};
    const nameErr = validateName(fullName, "Nombre completo");
    if (nameErr) errs.fullName = nameErr;
    const emailErr = validateEmail(email);
    if (emailErr) errs.email = emailErr;
    const passErr = validatePassword(password);
    if (passErr) errs.password = passErr;
    return errs;
  }

  function handleField<T>(setter: (v: T) => void, field: keyof FieldErrors) {
    return (value: T) => {
      setter(value);
      // Clear error on change
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError("");

    const fieldErrors = validate();
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName }),
      });

      if (!res.ok) {
        const data = await res.json();
        setServerError(data.error || "Error al registrarse.");
        setLoading(false);
        return;
      }

      router.push("/auth/login?registered=true");
    } catch {
      setServerError("Error de conexión. Intentá de nuevo.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-[#080f1e]">
      <div className="w-full max-w-md rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/55 p-8 shadow-sm dark:shadow-2xl dark:shadow-cyan-950/10">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              AeroFlow
            </h1>
          </Link>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Creá tu cuenta para ingresar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {serverError && (
            <div className="rounded-lg border border-red-200 dark:border-rose-500/30 bg-red-50 dark:bg-rose-500/10 px-4 py-3 text-sm text-danger dark:text-rose-300">
              {serverError}
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
              onChange={(e) => handleField(setFullName, "fullName")(e.target.value)}
              placeholder="Tu nombre"
              className={`w-full rounded-lg border bg-white dark:bg-slate-900/90 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-accent/20 dark:focus:ring-cyan-500/20 ${
                errors.fullName
                  ? "border-red-300 dark:border-rose-500/60 focus:border-danger dark:focus:border-rose-400/60"
                  : "border-slate-300 dark:border-slate-700/80 focus:border-accent/60 dark:focus:border-cyan-400/60"
              }`}
            />
            {errors.fullName && (
              <p className="text-xs text-danger dark:text-rose-400 pl-1">{errors.fullName}</p>
            )}
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
              Email
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => handleField(setEmail, "email")(e.target.value)}
              placeholder="tu@email.com"
              className={`w-full rounded-lg border bg-white dark:bg-slate-900/90 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-accent/20 dark:focus:ring-cyan-500/20 ${
                errors.email
                  ? "border-red-300 dark:border-rose-500/60 focus:border-danger dark:focus:border-rose-400/60"
                  : "border-slate-300 dark:border-slate-700/80 focus:border-accent/60 dark:focus:border-cyan-400/60"
              }`}
            />
            {errors.email && (
              <p className="text-xs text-danger dark:text-rose-400 pl-1">{errors.email}</p>
            )}
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
              Contraseña
            </span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => handleField(setPassword, "password")(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              className={`w-full rounded-lg border bg-white dark:bg-slate-900/90 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-accent/20 dark:focus:ring-cyan-500/20 ${
                errors.password
                  ? "border-red-300 dark:border-rose-500/60 focus:border-danger dark:focus:border-rose-400/60"
                  : "border-slate-300 dark:border-slate-700/80 focus:border-accent/60 dark:focus:border-cyan-400/60"
              }`}
            />
            {errors.password && (
              <p className="text-xs text-danger dark:text-rose-400 pl-1">{errors.password}</p>
            )}
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg border border-accent/30 dark:border-cyan-400/30 bg-accent/10 dark:bg-cyan-500/15 px-4 py-3 text-sm font-medium text-accent-strong dark:text-cyan-100 transition hover:border-accent/50 dark:hover:border-cyan-300/50 hover:bg-accent/15 dark:hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          ¿Ya tenés cuenta?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-accent transition hover:text-accent-strong dark:text-cyan-300 dark:hover:text-cyan-200"
          >
            Iniciá sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
