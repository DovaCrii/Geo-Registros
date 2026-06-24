# UX/UI Handoff — Geo-Registros

## Estado actual

El producto ya tiene una base visual mucho más clara y usable. En esta sesión se reforzaron:

- Home comercial con más aire y una entrada más evidente al workspace operativo.
- Dashboard con mejor jerarquía, accesos rápidos más claros y una lectura más premium.
- Detalle del plan con CTA de mapa más obvia y modo revisor mejor explicado.
- Workspace de geometría con más protagonismo, mejor carga visual y copy más útil.
- Loading / error states más amigables.
- Microinteracciones de cambio de estado en permisos con feedback visible.

## Qué quedó resuelto

- Descubrimiento del mapa y del flujo operativo.
- Claridad de Field Mode y Reviewer Mode.
- Jerarquía visual básica de home y dashboard.
- Mejor recuperación en error y feedback de carga.
- Base de pruebas mejorada con helpers puros para estado de permisos.

## Qué sigue pendiente

1. Pulido fino de consistencia visual en pantallas restantes.
2. Definición Figma-ready del sistema visual.
3. Alinear componentes clave como mapa, cards y badges en un spec de diseño.
4. Revisar si hace falta un pass GPT crítico solo para el cierre de diseño.

## Recomendación de siguiente orden

1. Convertir home, dashboard y detalle de plan en frames Figma.
2. Extraer tokens y estados visuales mínimos.
3. Cerrar el workspace de geometría como pantalla de referencia.
4. Hacer un último pass de microcopy si aparece fricción de uso.

## Nota para Figma

No conviene exportar el código directamente a Figma. Conviene usar este repo como referencia y recrear:

- tokens
- componentes
- estados
- layout de pantallas

de forma manual pero guiada, para no perder intención de producto.
