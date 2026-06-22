# SDD Proposal: T-027 — Alerta de zona restringida

## Contexto

El editor de geometría ya permite importar, editar y exportar el área operativa.
Para T-027 queremos agregar una alerta informativa cuando la geometría intersecte una zona restringida demo.

## Problema

- Hoy el usuario no recibe una señal clara cuando el área de operación cae sobre una zona sensible.
- La validación existe de forma parcial, pero no está unificada en el flujo completo.
- Queremos avisar sin bloquear la operación para mantener el flujo simple y rápido.

## Alcance (IN)

- Mostrar una alerta informativa si la geometría entra en una zona restringida.
- Reutilizar la misma evaluación en:
  - importación
  - exportación
  - validación previa al guardado
- Mostrar la alerta también al importar, no solo dentro del editor.
- Mantener el comportamiento no bloqueante.

## Fuera de alcance (OUT)

- Bloquear guardado o exportación.
- Motor geoespacial avanzado.
- Persistencia de alertas en base de datos.
- Nuevas capas o reglas regulatorias reales.

## Resultado esperado

- El usuario ve un aviso claro y temprano.
- El flujo sigue siendo rápido.
- La lógica queda centralizada para evitar duplicación.

## Archivos relevantes

- `src/lib/geo-restrictions.ts`
- `src/components/ui/alert-card.tsx`
- `src/modules/flight-plans/geometry-editor.tsx`
