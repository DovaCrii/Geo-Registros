"use client";

import { useActionState, useCallback } from "react";
import { Role } from "@prisma/client";

import { createUser, updateUser } from "@/server/users/actions";

const ROLES = Object.values(Role);

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  GERENTE_OPERACIONES_AEREAS: "Gerente Operaciones Aéreas",
  JEFE_SEGURIDAD_AEREA: "Jefe Seguridad Aérea",
  ADC: "ADC",
  ESPECIALISTA_DOCUMENTAL: "Especialista Documental",
  OPERADOR_RPA: "Operador RPA",
  AUDITOR: "Auditor",
  VIEWER: "Viewer",
};

type UserData = {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  active: boolean;
  createdAt: Date;
};

type UserFormProps =
  | { mode: "create"; user?: never }
  | { mode: "edit"; user: UserData };

export function UserForm(props: UserFormProps) {
  const { mode } = props;
  const user = mode === "edit" ? props.user : undefined;

  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      try {
        if (mode === "create") {
          await createUser(formData);
        } else {
          await updateUser(user!.id, formData);
        }
        return { error: undefined };
      } catch (e) {
        return { error: e instanceof Error ? e.message : "An error occurred." };
      }
    },
    null,
  );

  const baseInput =
    "w-full rounded-xl border border-slate-700/80 bg-slate-900/70 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 transition focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30";

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <div className="rounded-xl border border-red-800/40 bg-red-950/50 px-4 py-3 text-sm text-red-200">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-slate-300">
          Full name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          required
          defaultValue={user?.fullName ?? ""}
          className={baseInput}
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-300">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          disabled={mode === "edit"}
          defaultValue={user?.email ?? ""}
          className={`${baseInput} disabled:opacity-50`}
        />
      </div>

      <div>
        <label htmlFor="role" className="mb-1.5 block text-sm font-medium text-slate-300">
          Role
        </label>
        <select
          id="role"
          name="role"
          required
          defaultValue={user?.role ?? "VIEWER"}
          className={baseInput}
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r] ?? r}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-300">
          {mode === "create" ? "Password" : "New password (leave blank to keep current)"}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          minLength={mode === "create" ? 8 : undefined}
          required={mode === "create"}
          className={baseInput}
        />
      </div>

      {mode === "edit" && user && (
        <div className="flex items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-900/50 px-4 py-3">
          <span className="text-sm text-slate-400">Status:</span>
          <span className={`text-sm font-medium ${user.active ? "text-emerald-300" : "text-slate-400"}`}>
            {user.active ? "Active" : "Inactive"}
          </span>
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/15 px-6 py-2.5 text-sm font-medium text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-400/20 disabled:opacity-50"
        >
          {pending ? "Saving…" : mode === "create" ? "Create user" : "Save changes"}
        </button>

        <a
          href="/admin/users"
          className="inline-flex items-center justify-center rounded-2xl border border-slate-700/80 bg-slate-900/80 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
