# CHANGELOG.md

## 2026-06-17

### Documentation and GitHub visibility
- Se agrega base documental para trabajo futuro con OpenCode y Codex.
- Se define estado maestro del proyecto, roadmap, handoff, planes UX/visual y bitacora IA.
- Se reorganiza la entrada documental para que GitHub muestre rapido que leer primero.

### UX and visual optimization
- El dashboard se reordena como centro operativo mas claro.
- La experiencia visual pasa a una direccion mas premium y menos CRUD en la capa de presentacion.
- La ayuda contextual del dashboard queda alineada con el flujo operativo.

### Visual rollout closeout and docs alignment
- El rollout light-first se extiende a auth, admin, maestros, detalles, permisos, geometria y pantalla principal.
- `PROJECT_STATUS.md`, `ROADMAP.md`, `TASKS.md` y `docs/AI_PROGRESS_LOG.md` quedan sincronizados con el avance real.
- `docs/OPENCODE_HANDOFF.md` se actualiza para reflejar el cierre de T-011 y el siguiente corte limpio.

### Design system (T-011)
- Se expande `docs/DESIGN_SYSTEM_PLAN.md` con plan visual completo: tema, tipografía, espaciado, componentes base, layouts de pantalla, accesibilidad y errores a evitar.
- Se agregan tokens de diseño a `src/app/globals.css`: font-size, spacing, shadows y border-radius en `:root` y `.dark`.
- Se extiende `tailwind.config.ts` con tema visual: font sizes, font families, border radius, shadows y colores de superficie/accent/status.

### Componentes base (T-005)
- `StatusBadge`: 8 estados operacionales con dot + label, light/dark.
- `MetricCard`: icono + valor + label + trend opcional.
- `SectionCard`: colapsable con header + contenido + acciones.
- `AlertCard`: barra lateral 4px + icono + mensaje, 4 severidades.
- `StatusChip` legacy actualizado para compatibilidad con light mode.

### Layout y legibilidad (T-003)
- `globals.css`: body background ahora usa `--background` CSS variable con gradiente sutil en light y gradiente oscuro en `.dark`.
- `layout.tsx`: eliminado inline style redundante.
- `page-shell.tsx`: refactor completo con soporte light/dark via `dark:` prefix, sidebar extraído a componente reutilizable, nav links con clases semánticas, bordes y sombras adaptados por tema.

### Accesibilidad y contraste (T-010)
- `docs/A11Y_AUDIT.md`: auditoría WCAG AA completa de tokens base y componentes.
- `primary-button.tsx`, `submit-button.tsx`: migrados a design tokens + `focus-visible:ring-2`.
- `pagination.tsx`: refactor con soporte light/dark + `focus-visible:ring-2`.
- `alert-card.tsx`: `role="status"` agregado.

### Dashboard operacional (T-004)
- KPIs migrados a `MetricCard` con íconos SVG.
- Banners reemplazados por `AlertCard` (error/warning).
- StatusChip reemplazado por `StatusBadge` en sección de estados.
- Todas las secciones con soporte light/dark completo.
- Consistencia visual: bordes `rounded-xl`, sombras unificadas.

- No se modifica lógica de negocio.

### Scope
- Se mantiene el alcance en documentacion; no se modifica logica de negocio.
