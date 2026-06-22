# ROADMAP.md

## Fase 1 - Base documental y seguimiento
- Mantener `AGENTS.md`, `PROJECT_STATUS.md`, `ROADMAP.md`, `TASKS.md` y `docs/OPENCODE_HANDOFF.md` como contexto corto.
- Crear indice documental y bitacora de avance.
- Registrar decisiones tecnicas estables en `DECISIONS.md`.

## Fase 2 - UX operacional
- Convertir dashboard en centro operativo claro.
- Mejorar flujo crear mision -> mapa -> documentos -> permiso -> cierre.
- Reducir sensacion de CRUD en listas y detalles.
- Repriorizar geometria como flujo mapa-first, no como edicion manual de GeoJSON.

## Fase 3 - Sistema visual ✅ COMPLETADA
- Definir tokens base, jerarquia tipografica, estados, botones y cards. ✅
- Adoptar tema claro como experiencia primaria y dark mode como secundario. ✅
- Aplicar gradualmente el sistema visual a dashboard, listas, formularios, ayuda, admin, maestros y flujo de mision. ✅
- Cerrar los restos heredados con cambios chicos, validacion continua y documentacion actualizada. ✅
- **Commit final:** `136c0b6` — 55 archivos, 673 inserciones.
- **Incluye:** migración light-first general, fix estructural en tablas seleccionables, accesibilidad, localización completa a español, documentación sincronizada.

## Fase 4 - Workflow DGAC y trazabilidad ✅ COMPLETADA
- Pulir checklist documental. ✅
- Mejorar timeline de permisos. ✅
- Reforzar mensajes de ayuda contextual. ✅
- Alinear la experiencia de permisos, documentos y geometria con el nuevo sistema visual. ✅
- FlightPlanChecklist: 9 tests de componente con jsdom + testing-library. ✅
- HelpDocs migrado de filesystem a Prisma DB. ✅
- Testing infra completa: @vitejs/plugin-react, jsdom, @testing-library/react. ✅
- Menú de usuario en sidebar con avatar, email y logout. ✅
- FlowGuide corrigió duplicados de patrones — 16 rutas alineadas. ✅

## Fase 5 - Comercializacion y entrega ✅ COMPLETADA
- README premium con posicionamiento comercial claro. ✅
- Landing premium: hero gradiente, proof points concretos, stats con datos reales. ✅
- Seed demo refinado con `SEED_DEMO=true`: demo user auto-creado, 4 FP, 17 eventos, 5 HelpDocs, 3 notificaciones. ✅
- Documentar handoff operativo para futuras mejoras. ✅

## Fase 6 — Centro de Conocimiento ✅ COMPLETADA
- Buscador en vivo de documentos internos (HelpDocs desde Prisma). ✅
- Mapa del flujo operacional de 7 pasos (planificación → cierre). ✅
- Vista previa de documentos sin descarga (PDF en línea, imágenes). ✅
- Ruta `/api/help-docs/[id]/preview` con `Content-Disposition: inline`. ✅
- Secciones normativas (DAN 151, DAN 91, etc.) con referencias dinámicas. ✅
- Checklist operativo DGAC persistido por plan de vuelo. ✅
- Componentes en `src/components/help-center/`: FlowMap, DocPreview, HelpCenterClient. ✅

## Fase 7 - Mapa operacional ✅ COMPLETADA
- Workspace visual con mapa amplio (720px), herramientas claras y panel de capas. ✅
- Mediciones en vivo: área (m²/km²) y perímetro (m/km) al dibujar. ✅
- Hint contextual que cambia según si hay figuras en el mapa. ✅
- GeoJSON oculto en sección "Intercambio técnico" como formato avanzado. ✅
- Import/export KML, KMZ, DXF funcional. ✅
- Indicador de área/perímetro flotante sobre el mapa. ✅

## Fase 8 - RBAC y perfiles de revisión 🔜 NUEVA
- Separar perfiles operativos de perfiles de revisión/lectura.
- Bloquear edición, borrado y transición de permisos según rol.
- Dejar admin con control total y revisores con acceso limitado y auditable.
- Reflejar permisos también en la UI: botones, menús y acciones invisibles o deshabilitadas.
- Revisar `requirePermission`, `requirePageAuth` y acciones de server para aplicar el contrato de forma consistente.

## Fase 9 - UX/UI refinada y mapa avanzado 🔜 NUEVA
- Centrar y alinear mejor la información, tipografía y bloques de contenido.
- Unificar colores de secciones/etapas con semántica útil, no decorativa.
- Mantener el panel operativo siempre destacado, aunque cambie la sección activa.
- Agregar navegación clara para volver a inicio/panel donde corresponda.
- Rediseñar el mapa como workspace integrado con panel lateral más ordenado y herramientas más intuitivas.
- Incorporar capas adicionales del contexto geográfico (ciudades, referencias, apoyo visual) sin saturar al operador.
- Mantener GeoJSON fuera del flujo normal y consolidar la barra lateral de intercambio técnico.
- Revisar errores de guardado/acciones sin uso y distribución de controles.

## Fase 10 — UX/UI Operacional y Semántica Visual 🔜 NUEVA
- Implementar sistema de colores semánticos por estado operacional (DRAFT/IN_REVIEW/AUTHORIZED/REJECTED/CLOSED).
- Crear componente `StatusBadge` reutilizable y aplicarlo en lista, detalle y dashboard.
- Agregar validación inline en wizard de misión (paso a paso, no al final).
- Implementar panel operativo persistente (sticky bar con misión activa + clima + alertas).
- Crear vista "Calendario de Operaciones" alternativa a tabla.
- Integrar tooltips DGAC inline en formulario de permiso (reutilizar HelpDocs).
- Diseñar empty states con acción contextual en todos los módulos.
- Implementar Modo Campo (Field Mode) para tablets en terreno.
- Agregar alertas geográficas en tiempo real (intersección con zonas restringidas).

## Fase 11 — Trazabilidad y Documentación 🔜 NUEVA
- Preview de paquete documental antes de enviar a DGAC.
- Vista Revisor con modo comparación y comentarios tipo pin.
- Microinteracciones de estado (transiciones animadas, toasts contextuales).
- Consolidar bitácora de avance y documentación técnica.
