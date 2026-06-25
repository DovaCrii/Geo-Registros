# SDD Proposal: Documentación DGAC Cargable

## Estado actual

`/ayuda` muestra una lista estática de documentos internos.
No existe forma de subir, listar o bajar documentación desde la UI.

## Propuesta

Implementar un sistema simple de documentación DGAC cargable:

- **Admin page** para subir y borrar archivos
- **Manifest en filesystem** para persistir metadata
- **Endpoint de descarga** para servir los archivos subidos
- **Página pública /ayuda** consumiendo la lista real de docs

## Scope (IN)

- Subida de archivos desde admin
- Borrado lógico + unlink del archivo físico
- Listado público de docs activos en `/ayuda`
- Descarga desde endpoint dedicado

## Scope (OUT)

- No usar DB nueva
- No crear editor de contenido markdown
- No versionado avanzado

## Esfuerzo estimado

- Storage + manifest: 1-2h
- Upload/delete actions: 1-2h
- Admin UI + public page: 2-3h
- Verify: 1h
