# SDD Tasks: T-027 — Alerta de zona restringida

## Task 1 — Centralizar evaluación
- [ ] Confirmar que `geo-restrictions.ts` expone una función pura y reutilizable.
- [ ] Mantener la evaluación simple y determinista.

## Task 2 — Integrar en el editor
- [ ] Mostrar `AlertCard` cuando la geometría intersecte una zona demo.
- [ ] Mostrar el aviso también al cargar/importar contenido.

## Task 3 — Cubrir el flujo completo
- [ ] Reusar la misma evaluación en importación.
- [ ] Reusar la misma evaluación en exportación.
- [ ] Reusar la misma evaluación antes de guardar.

## Task 4 — Verificación
- [ ] Ejecutar typecheck.
- [ ] Ejecutar build.
- [ ] Revisar manualmente el comportamiento con geometrías dentro/fuera de zona.
