# Guía de uso — Flujo de permisos (Permission Workflow)

> Cómo gestionar el ciclo de vida de una misión desde el borrador hasta el cierre.

## ¿Qué es el flujo de permisos?

El Permission Workflow permite controlar el estado de cada misión (flight plan) a través de 10 estados, desde que se crea como borrador hasta que se cierra o cancela. Cada cambio de estado queda registrado en un **historial de auditoría** inmutable, y podés adjuntar documentos obligatorios en cada etapa.

## Los 10 estados

| Estado | Significado | Color |
|--------|-------------|-------|
| **DRAFT** | Borrador — la misión se está preparando | Gris |
| **IN_REVIEW** | En revisión interna — alguien está verificando los datos | Cian |
| **READY_FOR_SUBMISSION** | Listo para enviar — toda la documentación está completa | Cian |
| **SUBMITTED** | Enviado a la entidad correspondiente (DGAC, cliente, etc.) | Cian |
| **AUTHORIZED** | Autorizado — aprobado para operar | Verde |
| **OBSERVED** | Observado — requiere correcciones o documentación adicional | Amarillo |
| **REJECTED** | Rechazado — no se puede operar | Rojo |
| **EXPIRED** | Vencido — pasó la fecha de vigencia | Rojo |
| **CLOSED** | Cerrado — misión completada exitosamente | Gris |
| **CANCELLED** | Cancelado — no se va a realizar | Gris |

## Cómo avanzar una misión

### 1. Crear la misión

Desde la lista de Flight Plans, hacé clic en **"Create flight plan"**. Completá los datos obligatorios (código, título, fecha, centro de costo, cliente, dron, operador). La misión se crea automáticamente en estado **DRAFT**.

### 2. Avanzar estados

En la página de detalle de la misión, vas a ver una sección **"Permission Workflow"** con el badge del estado actual y los botones de transición disponibles.

Las transiciones válidas son:

| Desde | Hacia |
|-------|-------|
| DRAFT | IN_REVIEW |
| DRAFT | CANCELLED |
| IN_REVIEW | READY_FOR_SUBMISSION |
| IN_REVIEW | OBSERVED |
| IN_REVIEW | CANCELLED |
| READY_FOR_SUBMISSION | SUBMITTED |
| READY_FOR_SUBMISSION | DRAFT |
| SUBMITTED | AUTHORIZED |
| SUBMITTED | OBSERVED |
| SUBMITTED | REJECTED |
| AUTHORIZED | CLOSED |
| AUTHORIZED | EXPIRED |
| AUTHORIZED | OBSERVED |
| OBSERVED | IN_REVIEW |
| OBSERVED | CANCELLED |
| REJECTED | DRAFT |
| REJECTED | CANCELLED |
| EXPIRED | DRAFT |
| CLOSED | — (terminal) |
| CANCELLED | — (terminal) |

Simplemente hacé clic en el botón del estado al que querés avanzar y confirmá.

### 3. Agregar documentos

En la sección **"Documents"** de la misión:

1. Seleccioná el **tipo de documento** (Registro DGAC, Seguro, Resolución JAC, etc.)
2. Hacé clic en **"Choose file"** y seleccioná el archivo
3. Hacé clic en **"Upload"**

Los documentos se guardan en el servidor y quedan vinculados a la misión. Podés ver la lista de documentos subidos y eliminarlos si es necesario.

### 4. Ver el historial

En la sección **"Permission History"** se muestra una línea de tiempo con todos los cambios de estado, incluyendo:

- Quién hizo el cambio
- Fecha y hora
- Estado anterior y nuevo
- Descripción del cambio
- Documentos asociados

## Preguntas frecuentes

**¿Puedo volver a DRAFT después de haber avanzado?**
Sí, desde READY_FOR_SUBMISSION, REJECTED o EXPIRED podés volver a DRAFT para hacer correcciones.

**¿Qué pasa si una misión está en CLOSED o CANCELLED?**
Son estados terminales. No se puede avanzar a ningún otro estado desde ahí.

**¿Puedo subir documentos en cualquier estado?**
Sí. Los documentos se pueden adjuntar y eliminar en cualquier estado de la misión.

**¿Dónde se guardan los archivos?**
En el almacenamiento local del servidor (`storage/documents/`), organizados por misión.
