# Vibecoding UX/UI — AeroFlow

> Workflow de diseño e implementación visual para OpenCode. Combina principios de diseño campo-primero con un flujo de trabajo iterativo de "vibe" (estado, plan, código, revisión, handoff).

---

## 1. Principios de Vibecoding UX/UI

### 1.1 Seguridad antes que estética
El color comunica **estado operacional**, no decoración. Un botón rojo no es "peligroso"; es "REJECTED". Un verde no es "bonito"; es "AUTHORIZED / Listo para volar".

### 1.2 Campo primero
Todo debe funcionar en:
- **Tablet** (iPad/Surface, ~10-13")
- **Sol directo** (contraste alto, evitar grises sutiles)
- **Guantes** (touch targets mínimo 44x44px, preferir 56x56px)
- **Poca batería** (sin animaciones pesadas, sin carga de assets externos)

### 1.3 Contexto sin salir
La normativa DGAC debe estar a **1 click o hover**, no en otra pestaña. Si el operador necesita saber qué significa "Zona VFR", la respuesta debe aparecer sin perder el contexto del mapa.

### 1.4 Acción inmediata
Los **empty states** proponen el siguiente paso, no solo informan. Una lista vacía de planes de vuelo dice: "No hay misiones activas" + botón "Crear primera misión".

### 1.5 Minimalismo disciplinado
Usar primero primitives nativas de React/Next/Browser. Si algo no agrega valor real, se omite y se documenta el límite. Referencia: Ponytail (principios de diseño sin peso).

---

## 2. Sistema de Diseño Vivo

### 2.1 Colores semánticos (ya implementado en T-024)

| Estado | Tailwind | Significado operacional | Uso |
|---|---|---|---|
| DRAFT | `slate` | Planificación | Badge, borde sutil, icono lápiz |
| IN_REVIEW | `amber` | Espera DGAC | Badge, borde warning, spinner lento |
| AUTHORIZED | `emerald` | Listo para volar | Badge, borde success, checkmark |
| REJECTED | `rose` | No operable | Badge, borde danger, alerta |
| CLOSED | `zinc` | Archivado | Badge, borde muted, ícono archivo |

**Regla de oro:** Si un componente muestra un estado de plan de vuelo, DEBE usar `StatusBadge`. No inventar nuevos colores.

### 2.2 Jerarquía de información operacional

En cualquier pantalla, la prioridad visual debe ser:

1. **¿Puedo volar hoy?** (semáforo + clima + vigencias) → T-035
2. **¿Qué misión sigue?** (panel operativo) → T-026
3. **¿Qué necesito completar?** (checklist + wizard) → T-025 ✅
4. **¿Qué pasó?** (timeline + auditoría) → Existente

### 2.3 Tipografía y espaciado

- **Headers:** `text-lg` (18px) mínimo para legibilidad en campo. No usar `text-sm` ni `text-xs` en títulos.
- **Body:** `text-sm` (14px) como base. `text-xs` (12px) solo para metadatos (fechas, IDs, versiones).
- **Tracking:** `tracking-[0.18em]` para labels uppercase (ya en uso). No exagerar.
- **Line-height:** `leading-relaxed` (1.625) para bloques de texto. `leading-snug` (1.375) para headers.
- **Espaciado:** `space-y-4` (16px) mínimo entre secciones. `space-y-2` (8px) solo dentro de formularios compactos.

### 2.4 Touch targets y botones

- **Mínimo:** 44x44px (accesibilidad base)
- **Recomendado:** 56x56px (modo campo)
- **Primary button:** `h-11` (44px) + `rounded-2xl` + `px-5`
- **Secondary:** `h-10` (40px) + `rounded-xl` + `px-4`
- **Icon button:** `h-10 w-10` mínimo

---

## 3. Flujo de Vibecoding UX/UI (5 Ritmos)

### Ritmo 1: Vibe Check (5 min)
**Antes de tocar código**, entender el estado emocional y funcional de la UI actual.

```bash
node scripts/vibe-check.js
# Lee docs/HANDOFF/VIBE_CHECK.md
```

**Preguntas a responder:**
- ¿Qué pantalla se siente más "rota" o confusa hoy?
- ¿Dónde el usuario pierde más tiempo?
- ¿Qué está fuera de alineación con el sistema visual?

**Output:** Nota mental o breve línea en el handoff: "La navegación del mapa tiene demasiados botones apilados".

### Ritmo 2: Vibe Plan (10 min)
**Elegir UNA sola micro-mejoría** que tenga alto impacto visual y bajo riesgo.

Criterios de selección:
- Impacto visual en < 5 archivos
- No cambia lógica de negocio
- Mejora una métrica concreta: tiempo de navegación, claridad de estado, o reducción de clicks

**Ejemplo para T-026 (Panel operativo):**
> "Agregar una barra sticky de 48px en el layout raíz que muestra: (a) nombre de la misión activa si existe, (b) semáforo de vigencia, (c) botón de alerta. Si no hay misión activa, colapsar a un pill de 32px con 'Sin misión activa' + CTA 'Crear'.

**Output:** `docs/HANDOFF/feat-T-026.md` con el criterio de aceptación.

### Ritmo 3: Vibe Code (30-90 min)
**Implementar la micro-mejoría con validación continua.**

**Reglas del ritmo:**
1. Commits cada 15-20 minutos, no al final.
2. Cada commit debe dejar la UI en un estado válido (no roto).
3. Usar `npm run build` como "guardarrail" visual — si falla, algo rompió el bundle.
4. Preview en navegador cada 2-3 cambios (no solo al final).

**Heurísticas visuales durante el código:**
- **Alineación:** ¿Está todo centrado o alineado a una grilla coherente?
- **Contraste:** ¿Se lee bien con sol directo? (usar Lighthouse o simplemente bajar brillo de pantalla)
- **Consistencia:** ¿Usa los mismos tokens que el resto de la app? (`slate-950`, `cyan-500`, etc.)
- **Estado:** ¿Cada elemento interactivo tiene hover, focus, disabled, loading?

### Ritmo 4: Vibe Review (10 min)
**Auto-revisión con ojos de operador, no de desarrollador.**

```bash
node scripts/vibe-review.js
# Lee docs/HANDOFF/VIBE_REVIEW.md
```

**Checklist de review UX/UI:**
- [ ] ¿Un operador en campo entiende qué hacer sin leer instrucciones?
- [ ] ¿Los colores comunican estado correctamente?
- [ ] ¿Hay algún `console.log` o `debugger` olvidado?
- [ ] ¿Los touch targets son suficientemente grandes?
- [ ] ¿La navegación funciona con teclado (Tab, Enter, Escape)?
- [ ] ¿No hay texto en inglés suelto (todo localizado a español)?
- [ ] ¿No hay duplicación de componentes ya existentes?

### Ritmo 5: Vibe Handoff (5 min)
**Documentar el cambio y dejar el estado listo para la siguiente sesión.**

```bash
node scripts/git-handoff.js
# Genera docs/HANDOFF/GIT_HANDOFF.md
```

**Contenido del handoff:**
- Qué se hizo (What)
- Por qué se hizo (Why)
- Cómo se validó (Validate)
- Qué sigue (Next)
- Screenshots o descripción visual si es relevante

---

## 4. Patrones UX/UI Reutilizables

### 4.1 Empty State con CTA
```tsx
// src/components/ui/empty-state.tsx
export function EmptyState({
  title,
  description,
  action,
  actionHref,
}: {
  title: string;
  description: string;
  action: string;
  actionHref: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="h-16 w-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <span className="text-2xl">🚁</span>
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="max-w-xs text-sm text-slate-500 dark:text-slate-400">{description}</p>
      <Link href={actionHref} className="btn-primary">
        {action}
      </Link>
    </div>
  );
}
```

**Uso en módulos vacíos:**
- `flight-plans/page.tsx` → "No hay misiones activas" → "Crear primera misión"
- `drones/page.tsx` → "No hay drones registrados" → "Registrar dron"
- `clients/page.tsx` → "No hay clientes" → "Agregar cliente"

### 4.2 Panel Operativo Sticky (T-026)
```tsx
// src/components/operational-panel.tsx
export function OperationalPanel() {
  const { activeMission } = useActiveMission(); // hook a crear

  if (!activeMission) {
    return (
      <div className="sticky top-0 z-40 flex h-10 items-center justify-center gap-2 bg-slate-100 text-xs text-slate-500 dark:bg-slate-900 dark:text-slate-400">
        <span>Sin misión activa</span>
        <Link href="/flight-plans/new" className="text-cyan-600 hover:underline">Crear</Link>
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-40 flex h-12 items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="flex items-center gap-3">
        <StatusBadge status={activeMission.status} />
        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{activeMission.code}</span>
      </div>
      <div className="flex items-center gap-3">
        <WeatherWidget location={activeMission.location} />
        <ValidityAlert expiry={activeMission.expiry} />
      </div>
    </div>
  );
}
```

### 4.3 Tooltips DGAC Inline (T-028)
```tsx
// src/components/help-center/inline-tooltip.tsx
export function InlineTooltip({ docId, label }: { docId: string; label: string }) {
  const [open, setOpen] = useState(false);

  return (
    <span className="inline-flex items-center gap-1">
      {label}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-xs text-slate-500 hover:bg-cyan-50 hover:text-cyan-600 dark:bg-slate-800 dark:text-slate-400"
        aria-label={`Ayuda: ${label}`}
      >
        ?
      </button>
      {open && <DocPreviewModal docId={docId} onClose={() => setOpen(false)} />}
    </span>
  );
}
```

### 4.4 Toast Contextual con Dato Útil (T-034)
```tsx
// Ejemplo de uso tras guardar geometría
toast.success(`Zona guardada — ${areaKm2} km²`, {
  description: "Perímetro: 4.2 km · Cierra el tab para continuar con documentos.",
  action: { label: "Ver detalle", onClick: () => router.push(`/flight-plans/${id}`) },
});
```

---

## 5. Mapa de Calor de Prioridades UX/UI

| Tarea | Impacto visual | Riesgo técnico | Esfuerzo | Orden recomendado |
|---|---|---|---|---|
| T-026 Panel operativo | ⭐⭐⭐⭐⭐ | ⭐⭐ | 3h | **1** |
| T-035 Dashboard semáforo | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | 3h | **2** |
| T-029 Empty states | ⭐⭐⭐⭐ | ⭐ | 2h | **3** |
| T-028 Tooltips DGAC | ⭐⭐⭐ | ⭐⭐ | 2h | **4** |
| T-034 Microinteracciones | ⭐⭐⭐ | ⭐⭐ | 2h | **5** |
| T-030 Calendario | ⭐⭐⭐ | ⭐⭐⭐⭐ | 4h | 6 |
| T-027 Alertas geográficas | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 4h | 7 |
| T-031 Modo Campo | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 3h | 8 |
| T-032 Preview paquete DGAC | ⭐⭐⭐ | ⭐⭐⭐ | 4h | 9 |
| T-033 Vista Revisor | ⭐⭐ | ⭐⭐⭐⭐⭐ | 5h | 10 |

---

## 6. Integración con Git Workflow

Cada cambio UX/UI sigue el **Git Context Protocol** del orchestrator:

```
ux(dashboard): T-035 — Dashboard semáforo operativo

[What] Agrega card principal con próxima misión AUTHORIZED, semáforo
listo/no listo, y widget de vigencias en dashboard.

[Why] El operador necesita responder "¿Puedo volar hoy?" en < 3 segundos
al abrir la app. El dashboard actual no muestra estado operativo claro.

[How] Server component con fetch de próxima misión autorizada. Card con
StatusBadge, semáforo de 3 estados (emerald/amber/slate), y widget de
vigencias con countdown visual. Sin librerías externas.

[Next] T-026 — Panel operativo persistente sticky bar, o T-029 si el
usuario prioriza empty states.

[Validate] npm run build ✅, npm run typecheck ✅, smoke visual en
/dashboard con datos demo y sin datos.

[Files] src/app/dashboard/page.tsx, src/components/dashboard/semáforo-card.tsx

[Agent] OpenCode
```

---

**Actualizado:** 2026-06-22
**Versión:** 1.0
**Base:** T-024 completado, T-025 completado, Fase 10 en progreso.
