# SDD Design: Documentación DGAC Cargable

## Arquitectura

- `src/server/help-docs/storage.ts` gestiona manifest + filesystem
- `src/server/help-docs/actions.ts` implementa upload/delete con control ADMIN
- `src/app/api/help-docs/[id]/route.ts` sirve el archivo descargable
- `src/app/admin/help-docs/page.tsx` permite gestión desde UI
- `src/app/ayuda/page.tsx` consume el manifest real

## Modelo de datos

Sin DB nueva. El manifest guarda:
- id, title, slug, category
- fileName, storedName, filePath
- mimeType, size
- createdAt, updatedAt, deletedAt

## Decisiones

- Borrado lógico + unlink físico
- Descarga por ID para evitar path traversal
- UI pública agrupada por categoría
