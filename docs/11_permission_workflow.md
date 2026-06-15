# Permission Workflow — State Machine, Audit Trail & Document Management

**Estado:** Build-verified ✅
**Dependencias:** FlightPlan foundation (02), Master Data (01)

## Resumen

Se implementó el flujo completo de permisos con 10 estados, reemplazando el enum anterior `FlightPlanStatus` (3 estados: DRAFT, READY_FOR_GEOMETRY, ON_HOLD) por `PermissionStatus` (10 estados con 22 transiciones válidas). Incluye:

- Modelo `PermissionEvent` para auditoría inmutable
- Modelo `Document` para gestión documental (14 tipos)
- Servicios server-side con validación de transiciones atómicas
- Componentes UI: badge, timeline, acciones, uploader
- API routes para transición y carga/descarga de documentos

## Decisiones técnicas clave

| Decisión | Alternativa | Por qué |
|----------|-------------|---------|
| **PermissionStatus como enum de Prisma** | Tabla separada de estados | El enum es más simple, type-safe, y no necesitamos metadatos por estado. Si en el futuro cada estado necesita reglas complejas, se migra a tabla. |
| **PermissionEvent como modelo separado** | JSON array dentro de FlightPlan | Eventos inmutables necesitan su propia tabla para consultas eficientes, índices, y crecimiento sin límite. |
| **API routes para transición/upload** | Server actions directas | El upload de archivos requiere manejo de FormData multiparte que es más limpio en Route Handlers. Las transiciones viajan por fetch() del lado cliente para feedback inmediato sin recargar la página. |
| **Transacciones atómicas en `transitionPermission`** | Transición sin evento | Garantiza que el cambio de estado y la creación del evento de auditoría ocurran siempre juntos. Si falla uno, falla todo. |
| **Storage local para documentos** | S3 / Nextcloud | Para el MVP alcanza con el sistema de archivos local. El storage-adapter.ts ya está preparado para migrar a S3 o Nextcloud en el futuro. |
| **10 estados con solo 22 transiciones válidas** | Mapa completo (10×10 = 100 transiciones) | Explícitamente se prohibieron rutas inválidas. No se puede saltar de DRAFT a AUTHORIZED, por ejemplo. |

## Modelos de datos

### PermissionStatus enum

Los 10 estados (ver guía de uso para detalle). Flujo general:

```
DRAFT → IN_REVIEW → READY_FOR_SUBMISSION → SUBMITTED → AUTHORIZED → CLOSED
                        ↕                      ↕            ↕
                      OBSERVED              REJECTED     EXPIRED
                        ↕                      ↕            ↕
                      CANCELLED              CANCELLED    DRAFT
```

### PermissionEvent

```prisma
model PermissionEvent {
  id              String   @id @default(cuid())
  flightPlanId    String
  eventType       String   // TRANSITION, DOCUMENT_UPLOADED, DOCUMENT_REMOVED, NOTE_ADDED
  fromStatus      String?  // null para eventos no-transición
  toStatus        String?  // null para eventos no-transición
  description     String?
  metadata        Json?    // datos adicionales (docType, fileName, etc.)
  createdAt       DateTime @default(now())

  flightPlan      FlightPlan @relation(fields: [flightPlanId], references: [id])
}
```

### Document

```prisma
model Document {
  id            String   @id @default(cuid())
  flightPlanId  String
  docType       String   // 14 tipos: DGAC_REGISTRATION, INSURANCE, JAC_RESOLUTION, etc.
  fileName      String
  filePath      String   // ruta relativa en storage/documents/
  fileSize      Int?
  mimeType      String?
  createdAt     DateTime @default(now())

  flightPlan    FlightPlan @relation(fields: [flightPlanId], references: [id])
}
```

## Flujo de datos

### Transición de estado

```
Usuario click → permission-actions.tsx → fetch POST /api/permissions/transition
  → route.ts (parsea body) → transitionPermission() en actions.ts
    → [transacción atómica]
       → 1. Valida que la transición sea permitida (state machine map)
       → 2. Valida que el estado actual no sea terminal (CLOSED, CANCELLED)
       → 3. Actualiza permissionStatus en FlightPlan
       → 4. Crea PermissionEvent (eventType: "TRANSITION")
  → Response 200
  → Componente cliente actualiza UI
```

### Upload de documento

```
Usuario sube archivo → document-upload.tsx → fetch POST /api/permissions/documents/upload (multipart)
  → route.ts (parsea FormData) → guarda archivo en storage/documents/{flightPlanId}/
  → attachDocument() → crea Document en DB + PermissionEvent ("DOCUMENT_UPLOADED")
  → Response 200
  → Componente refresca lista de documentos
```

## Lecciones aprendidas

1. **El FormData de server actions y el de fetch no son intercambiables.** La API route de upload necesita manejar el multipart manualmente porque el `Request` de App Router no expone `formData()` exactamente igual que el de server actions.

2. **La migración de FlightPlanStatus → PermissionStatus requiere mapeo explícito.** Los registros existentes con `READY_FOR_GEOMETRY` y `ON_HOLD` se mapearon a `DRAFT` como default sensato. Si hubiera datos en producción, habría que decidir estado por estado.

3. **Los estados terminales necesitan validación doble.** Se validan tanto en el mapa de transiciones (no tienen rutas de salida) como en un guard explícito al inicio de `transitionPermission()`.

4. **El componente cliente de acciones necesita estado local (`isLoading`, `error`).** Como las transiciones viajan por fetch() y no por server action, perdemos el manejo de errores automático de Next.js. Hay que manejarlo manualmente.

## Verificación

- `prisma generate`: ✅
- `tsc --noEmit`: ✅ (0 errores)
- `npm run build`: ✅
- Archivos creados: 11 nuevos, 8 modificados
- Líneas: +996 / -130
