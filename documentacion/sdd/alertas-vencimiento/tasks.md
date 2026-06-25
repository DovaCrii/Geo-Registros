# SDD Tasks: Alertas Programadas por Vencimiento

1. Extender `NotificationType` con `EXPIRY_ALERT` y actualizar íconos/labels.
2. Crear `src/server/alerts/expiry-alerts.ts` con detección + deduplicación.
3. Agregar `POST /api/cron/expiry-alerts` con validación de secreto.
4. Actualizar UI/email helpers para reconocer el nuevo tipo.
5. Verificar build y tests.
