# SDD Proposal: Alertas Programadas por Vencimiento

## Contexto actual

Ya existe detección de vencimientos en el dashboard:
- `Drone.insuranceExpiry`
- `Operator.licenseExpiry`
- `src/server/dashboard/queries.ts` calcula items próximos a vencer (30 días)
- El dashboard solo **muestra** el dato; no genera alertas

## Problema

Hoy no hay ningún proceso que, de forma automática, avise a los usuarios cuando un seguro o licencia está por vencer o ya venció.

## Propuesta

Agregar un **job programado** que:
1. Busque drones y operadores con vencimientos dentro de una ventana configurable.
2. Genere notificaciones in-app para los usuarios relevantes.
3. Opcionalmente registre email logs/avisos si el sistema de email está disponible.

## Scope (IN)

- Crear una rutina reutilizable de detección de vencimientos
- Exponerla como job/endpoint invocable por cron externo
- Generar notificaciones in-app con links al recurso afectado
- Evitar duplicados en la misma ventana de alerta

## Scope (OUT)

- No crear una UI nueva de configuración
- No reemplazar la lógica actual del dashboard
- No agregar una cola ni infraestructura nueva si no es estrictamente necesaria

## Esfuerzo estimado

- Detección + deduplicación: 2-3h
- Job invocable: 1h
- Notificaciones: 1-2h
- Verificación: 1h
