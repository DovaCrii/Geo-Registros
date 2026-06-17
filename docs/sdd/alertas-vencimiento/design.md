# SDD Design: Alertas Programadas por Vencimiento

## Arquitectura

### 1. Service layer
Create `src/server/alerts/expiry-alerts.ts` with a reusable job function:

- query expiring drones/operators
- determine alert kind (`expiring-soon` / `expired`)
- dedupe against existing notifications
- create in-app notifications for active users

### 2. Cron route

`POST /api/cron/expiry-alerts`
- validates `CRON_SECRET`
- calls the job function
- returns JSON summary

### 3. Notification type extension

Add `EXPIRY_ALERT` to:
- `src/server/notifications/service.ts`
- `src/modules/notifications/notification-panel.tsx`
- `src/server/notifications/email-service.ts`

## Deduplication strategy

Use a cooldown window (30 days) keyed by:
- `userId`
- `type`
- `link`
- `title`

If a matching notification exists in the last 30 days, skip creation.

## Data flow

```
cron POST → expiry alert service → query expiring items → active users
          → dedupe notifications → createNotification per user
          → JSON summary
```

## Notes

- Keep existing dashboard queries untouched
- No schema migration needed
- No email sending in v1 (in-app only)
