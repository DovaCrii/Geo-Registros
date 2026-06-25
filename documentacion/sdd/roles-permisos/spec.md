# SDD Spec: Roles y Permisos

## Resumen
Implementar control de acceso basado en roles. Hoy `requirePageAuth()` solo verifica autenticación. Los roles existen en el schema y JWT pero nunca se evaluan.

## Requisitos

### R1 — `requirePageAuth` extendido
- Segundo parámetro opcional: `allowedRoles: Role[]`
- Si se pasa y el usuario no tiene ese rol → redirect a `/dashboard` con error
- Si no se pasa → comportamiento actual (solo auth)

### R2 — Protección páginas admin
- `/admin/users/*` y `/admin/email-logs/*` requieren rol `ADMIN`
- Si un no-admin accede: redirect a `/dashboard` + toast/mensaje "Acceso denegado"

### R3 — Sidebar filtra ítems admin
- `page-shell.tsx` oculta ítems con `adminOnly: true` si el rol no es ADMIN
- Mobile nav igual

### R4 — Server actions protegidas
- `batchDeactivateUsers`, `batchReactivateUsers` verifican rol antes de ejecutar
- Si no es ADMIN → throw `Unauthorized` error

### R5 — JWT fresco
- En cada request, el JWT callback consulta la DB para el rol actual
- (Ya está implementado parcialmente en `auth.ts` línea 52-59)

## Criterios de Aceptación

- [ ] Usuario sin rol ADMIN visita `/admin/users` → redirect a `/dashboard`
- [ ] Usuario sin rol ADMIN no ve "Usuarios" ni "Registro de correos" en sidebar
- [ ] Usuario sin rol ADMIN ejecuta batch action → error 403
- [ ] Usuario con rol ADMIN accede normalmente a todo
- [ ] Usuario regular accede a `/flight-plans`, `/drones`, etc. sin cambios

## Escenarios

### Happy path
1. Admin loguea → ve sidebar completo → accede a admin/users → OK
2. Operador loguea → sidebar sin ítems admin → /admin/users → redirect a /dashboard

### Edge cases
1. Token expirado → redirect a login (comportamiento actual, no cambia)
2. Rol cambiado en DB entre requests → JWT callback refresca en siguiente request

### Error cases
1. No-admin fuerza URL /admin/users → redirect a /dashboard
2. No-admin llama batch action vía fetch → error 403 en server

## Archivos a modificar

| Archivo | Cambio |
|---|---|
| `src/lib/require-page-auth.ts` | Agregar parámetro `allowedRoles`, validar y redirect |
| `src/components/ui/page-shell.tsx` | Leer rol del session, filtrar adminOnly items |
| `src/app/admin/users/page.tsx` | Agregar `requirePageAuth(..., ["ADMIN"])` |
| `src/app/admin/users/[id]/page.tsx` | Agregar `requirePageAuth(..., ["ADMIN"])` |
| `src/app/admin/users/new/page.tsx` | Agregar `requirePageAuth(..., ["ADMIN"])` |
| `src/app/admin/email-logs/page.tsx` | Agregar `requirePageAuth(..., ["ADMIN"])` |
| `src/app/admin/email-logs/[id]/page.tsx` | Agregar `requirePageAuth(..., ["ADMIN"])` |
| `src/server/users/actions.ts` | Verificar rol en batch actions |
