# codex-qa-check

## Objetivo
Revisar build, lint, bugs, regresiones, errores de tipado y archivos modificados.

## Cuándo usarla
- Después de un cambio de código.
- Antes de cerrar una tarea.
- Cuando haya fallos de compilación, pruebas o tipado.

## Qué hace
- Verifica comandos de QA relevantes.
- Revisa archivos tocados por el cambio.
- Detecta regresiones visibles y errores obvios de integración.

## Límites
- No implementa correcciones salvo instrucción explícita.
- No cambia la configuración del proyecto.
- No guarda memoria duplicada.

## Resultado esperado
- Estado de QA por comando.
- Lista de fallos concretos.
- Recomendación de corrección o siguiente validación.
