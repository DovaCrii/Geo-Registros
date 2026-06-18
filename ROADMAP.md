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

## Fase 4 - Workflow DGAC y trazabilidad
- Pulir checklist documental.
- Mejorar timeline de permisos.
- Reforzar mensajes de ayuda contextual.
- Alinear la experiencia de permisos, documentos y geometria con el nuevo sistema visual.

## Fase 5 - Comercializacion y entrega
- Ajustar README y home para explicar valor comercial con foco en mapa, permisos y trazabilidad.
- Pulir landing para que se sienta mas premium, clara y profesional.
- Preparar demo guiada con datos de ejemplo despues de cerrar el flujo mapa-first.
- Documentar handoff operativo para futuras mejoras.

## Fase 6 - Mapa operacional
- Convertir el editor de geometria en workspace visual con mapa amplio, herramientas claras y panel de capas.
- Ocultar GeoJSON del flujo normal y mantenerlo solo como formato interno/avanzado.
- Validar dibujo, edicion, guardado, recarga e import/export.
