# UI Navigation Consistency — Spanish Localization, Breadcrumbs & Context Links

**Estado:** Build-verified ✅
**Dependencias:** Master Data (01), FlightPlan foundation (02), Permission workflow (11)

## Resumen

Se cerró la pasada de consistencia visual y navegación operativa:

- UI principal traducida a español en landing, shell, forms y list views
- Manejo de errores honesto, sin exponer mensajes crudos al usuario
- `PageShell` con navegación operativa consistente en móvil y desktop
- Breadcrumbs reutilizables para detalle y creación de registros
- Links contextuales entre entidades maestras y planes de vuelo
- Bloques de relaciones cruzadas en fichas maestras con acceso directo a planes de vuelo vinculados
- Listados genéricos con empty states y filtros por defecto también localizados en español
- Ajustes de accesibilidad y microcopy en componentes compartidos

## Decisiones técnicas clave

| Decisión | Alternativa | Por qué |
|---|---|---|
| **Breadcrumbs como componente reusable** | Breadcrumbs ad hoc por página | Reduce duplicación y mantiene consistencia visual/navegacional. |
| **Links contextuales en tablas** | Solo navegación por detalle | Mejoran la exploración entre entidades relacionadas sin cargar el layout. |
| **Texto de error no técnico** | Mostrar `error.message` al usuario | Evita filtrar detalles internos y mejora la experiencia en fallos de DB. |
| **Shell operativa centralizada** | Menús dispersos por página | Unifica navegación y reduce drift de copy/estructura. |

## Alcance implementado

- `src/components/ui/breadcrumbs.tsx`
- `src/components/ui/page-shell.tsx`
- `src/components/ui/user-form.tsx`
- `src/components/ui/list-page.tsx`
- `src/modules/*/*.config.tsx` (listas maestras y plan de vuelo)
- `src/app/*/page.tsx` para detail/create pages
- `src/app/page.tsx` (landing)

## Lo que quedó conectado

- Flight plans → cost center, client, drone, operator
- Drone list → cost center
- Operator list → cost center
- Detail pages → breadcrumbs hacia el listado padre
- Create pages → breadcrumbs hacia el listado padre
- Cost center detail → drones, operators y flight plans vinculados
- Client/Drone/Operator detail → flight plans vinculados

## Lecciones aprendidas

1. **La navegación contextual funciona mejor cuando vive donde ya está el dato.** En flight plans, la relación ya estaba en la row/config; ahí es donde conviene hacer clickeable cada entidad.
2. **Breadcrumbs deben ser livianos y reutilizables.** Si se vuelven “framework”, sobran.
3. **No mostrar errores crudos al usuario es una regla, no una preferencia.** Especialmente en páginas que tocan la DB.

## Verificación

- `npm run build`: ✅
- `npm test`: ✅ (66 tests)

## Próximo paso recomendado

Revisar listados secundarios y estados vacíos para seguir reforzando la exploración cruzada sin saturar el layout.
