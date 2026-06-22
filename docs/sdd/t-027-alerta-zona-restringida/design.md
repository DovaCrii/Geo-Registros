# SDD Design: T-027 — Alerta de zona restringida

## Enfoque

Usar un helper único para detectar intersecciones con zonas restringidas demo y renderizar una alerta reutilizando `AlertCard`.

## Flujo propuesto

1. El editor parsea el GeoJSON actual.
2. El helper evalúa si la geometría intersecta una zona demo.
3. La UI muestra una alerta informativa si hay coincidencia.
4. El mismo chequeo se usa en importación, exportación y pre-save.

## Puntos de integración

- `src/lib/geo-restrictions.ts`
  - contiene la evaluación bbox y el catálogo demo de zonas
- `src/modules/flight-plans/geometry-editor.tsx`
  - consume el helper y muestra la alerta
- `src/components/ui/alert-card.tsx`
  - muestra el aviso visual

## Decisiones técnicas

- No agregar dependencias nuevas.
- No bloquear flujos.
- Mantener el helper puro y determinista.
- Reusar la misma evaluación en todos los puntos para evitar drift.

## Riesgos

- Falsos positivos por bbox simple.
- La alerta puede volverse ruidosa si se expande sin criterio.
- Si la evaluación no se centraliza, el comportamiento puede divergir entre flujos.

## Verificación esperada

- Typecheck.
- Build.
- Prueba manual de importación y edición con geometría demo.
