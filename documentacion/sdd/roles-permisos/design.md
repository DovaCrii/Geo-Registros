# SDD Design: Roles y Permisos

## Arquitectura

### Flujo de autorización
```
Request → Page/Route → requirePageAuth(url, allowedRoles?)
                         ↓
                      auth() → session.user.role
                         ↓
                   ¿allowedRoles? → NO → OK (solo auth)
                         ↓
                      SÍ → ¿role in allowedRoles? → SÍ → OK
                         ↓
                      NO → redirect(/dashboard?error=access-denied)
```

### Server action protection
```
Batch action call → check session.role === ADMIN → SÍ → ejecutar
                                                      ↓
                                                   NO → throw UnauthorizedError
```

## Cambios por archivo

### 1. `src/lib/require-page-auth.ts`

```typescript
import { Role } from "@prisma/client";

export async function requirePageAuth(
  callbackUrl: string,
  allowedRoles?: Role[],
) {
  const session = await auth();
  if (!session?.user) {
    redirect(`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = session.user.role as Role;
    if (!allowedRoles.includes(userRole)) {
      redirect("/dashboard?error=access-denied");
    }
  }

  return session;
}
```

### 2. `src/components/ui/page-shell.tsx`

- Importar `useSession` de next-auth/react (o leer de la sesión del server)  
- Wrapped en `SessionProvider` en el layout
- Pasar `session.user.role` a `NavLinks` (desde server session o client session)

Wait — `PageShell` es Client Component, usa `"use client"`. Necesito obtener el rol del usuario del lado cliente.

**Opción A**: Usar `useSession()` de next-auth/react
**Opción B**: Recibir `userRole` como prop desde el layout

Opción B es más limpia para un server-first app. El layout puede leer la session y pasarla como prop.

### 3. Admin pages

En cada page.tsx admin, cambiar:
```typescript
await requirePageAuth("/admin/users");
// → 
await requirePageAuth("/admin/users", ["ADMIN"]);
```

### 4. Server actions

En `src/server/users/actions.ts`:
```typescript
import { auth } from "@/lib/auth";

export async function batchDeactivateUsers(ids: string[]) {
  const session = await auth();
  if (!session?.user || (session.user.role as Role) !== "ADMIN") {
    throw new Error("Acceso denegado. Se requiere rol ADMIN.");
  }
  // ... existing logic
}
```

## Datos

- Los roles están en `@prisma/client` como enum `Role`
- El session.user.role viene del JWT callback (ya implementado)
- No se requieren migraciones de DB

## Riesgos

- `SessionProvider` necesario si usamos `useSession()` en PageShell
- Si el layout no provee la session, el sidebar no sabrá el rol
- Solución: pasar `userRole` como prop desde un server layout wrapper
