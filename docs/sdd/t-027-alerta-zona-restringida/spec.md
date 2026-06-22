# SDD Spec: T-027 — Alerta de zona restringida

## Requisitos funcionales

### R1 — Evaluación compartida
- El sistema debe evaluar una geometría contra zonas restringidas demo usando la misma lógica en todos los puntos de entrada.
- La evaluación debe aceptar GeoJSON válido y devolver una alerta o `null`.

### R2 — Alerta informativa
- Si hay intersección, debe mostrarse una alerta visible e informativa.
- La alerta no debe bloquear el guardado ni la exportación.

### R3 — Cobertura de flujo
- La alerta debe aparecer al:
  - importar geometría
  - editar geometría en pantalla
  - validar antes de guardar
  - preparar exportación

### R4 — Simplicidad
- La solución debe evitar dependencias nuevas.
- La lógica debe permanecer en un helper reutilizable.

## Requisitos no funcionales

- La evaluación debe ser rápida y determinista.
- La UI debe seguir siendo legible y no invasiva.
- El comportamiento debe ser consistente entre flujos.

## Criterios de aceptación

- [ ] Una geometría que intersecta una zona demo muestra una alerta.
- [ ] Una geometría fuera de zona no muestra alerta.
- [ ] Importar un archivo con intersección muestra el aviso.
- [ ] Editar una geometría en zona muestra el aviso en el editor.
- [ ] Guardar o exportar no quedan bloqueados por la alerta.
- [ ] La lógica de evaluación se comparte y no se duplica.

## Suposiciones

- La validación usa geometría demo basada en bbox.
- La feature es informativa, no regulatoria real.
