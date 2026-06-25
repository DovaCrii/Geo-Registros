# SDD Spec: Documentación DGAC Cargable

## Objetivo
Permitir que un admin cargue y publique documentación DGAC desde la UI, y que `/ayuda` consuma esa documentación real.

## Requisitos

### R1 — Administración
- Debe existir una página admin para subir documentos
- Debe poder eliminarse un documento publicado

### R2 — Persistencia
- La metadata debe persistirse en filesystem mediante un manifest JSON
- El archivo físico debe guardarse en `storage/help-docs/`

### R3 — Consumo público
- `/ayuda` debe mostrar los documentos activos reales
- Cada documento debe poder descargarse desde un endpoint dedicado

### R4 — Seguridad
- Solo ADMIN puede crear o borrar documentos

## Criterios de aceptación
- [ ] El admin puede subir un archivo y verlo publicado en `/ayuda`
- [ ] El admin puede borrar un documento y desaparece de `/ayuda`
- [ ] La descarga sirve el archivo real
- [ ] Usuarios no admin no acceden a la administración
