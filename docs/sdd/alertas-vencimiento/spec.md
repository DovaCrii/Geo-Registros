# SDD Spec: Alertas Programadas por Vencimiento

## Objetivo
Generar alertas automáticas por vencimiento de seguros y licencias usando el modelo de notificaciones existente.

## Requisitos

### R1 — Job invocable
- Exponer una ruta `POST /api/cron/expiry-alerts`
- La ruta debe requerir un secreto compartido (`CRON_SECRET`)
- La ruta debe poder ejecutarse desde un cron externo

### R2 — Detección de vencimientos
- Buscar drones con `insuranceExpiry`
- Buscar operadores con `licenseExpiry`
- Generar alertas para items próximos a vencer o vencidos

### R3 — Notificaciones
- Crear notificaciones in-app para usuarios activos
- Cada alerta debe incluir link al recurso afectado
- Añadir tipo `EXPIRY_ALERT` al sistema de notificaciones

### R4 — Anti-duplicados
- No generar alertas repetidas en la misma ventana de tiempo
- Usar deduplicación por tipo + link + título dentro de una ventana de cooldown

## Criterios de aceptación
- [ ] `POST /api/cron/expiry-alerts` responde 401/403 sin secreto válido
- [ ] Con secreto válido, devuelve resumen de alertas generadas
- [ ] Los íconos/textos de notificaciones reconocen `EXPIRY_ALERT`
- [ ] No se duplican alertas en ejecuciones repetidas cercanas

## Fuera de scope
- No agregar UI de configuración
- No agregar queue/worker externo
- No cambiar la lógica del dashboard actual
