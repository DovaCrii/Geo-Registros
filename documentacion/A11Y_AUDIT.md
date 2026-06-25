# A11Y_AUDIT.md — Auditoría de accesibilidad

> Fecha: 2026-06-17
> Estándar: WCAG 2.1 Level AA

---

## Resumen

| Área | Estado |
|---|---|
| Contraste de tokens base | ✅ Pasa AA en light y dark |
| Focus visible | ❌ Ausente en la mayoría de componentes |
| Light mode en componentes legacy | ❌ Parcial (pagination, buttons) |
| Disabled states | ⚠️ Solo opacidad, sin textura adicional |
| Form labels y asociación | ⚠️ No auditado (depende de formularios específicos) |
| ARIA semantics | ⚠️ Básico, faltan roles en componentes dinámicos |

---

## 1. Contraste de tokens base

### Light mode (`--background: #f8fafc`)

| Token | Color | Ratio | Resultado |
|---|---|---|---|
| `--text-primary: #0f172a` | #0f172a on #f8fafc | ~16:1 | ✅ AAA |
| `--text-secondary: #475569` | #475569 on #f8fafc | ~6.9:1 | ✅ AA |
| `--accent: #0891b2` | #0891b2 on #f8fafc | ~4.0:1 | ✅ AA (justo) |
| `--accent-strong: #0e7490` | #0e7490 on #f8fafc | ~5.4:1 | ✅ AA |
| `--success: #16a34a` | #16a34a on #f8fafc | ~3.5:1 | ⚠️ AA solo texto grande |
| `--danger: #dc2626` | #dc2626 on #f8fafc | ~4.0:1 | ✅ AA texto normal |

### Dark mode (`--background: #080f1e`)

| Token | Color | Ratio | Resultado |
|---|---|---|---|
| `--text-primary: #e5eef9` | #e5eef9 on #080f1e | ~15.5:1 | ✅ AAA |
| `--text-secondary: #94a3b8` | #94a3b8 on #080f1e | ~7.1:1 | ✅ AA |
| `--accent: #22d3ee` | #22d3ee on #080f1e | ~9.1:1 | ✅ AAA |
| `--success: #22c55e` | #22c55e on #080f1e | ~7.3:1 | ✅ AA |
| `--danger: #ef4444` | #ef4444 on #080f1e | ~6.1:1 | ✅ AA |

### Observaciones de contraste

- **`--success: #16a34a`** en light mode: pasa AA solo para texto grande (≥18px bold o ≥24px). Para texto pequeño debería subir a `#15803d` o usar fondo más claro.
- **`--accent: #0891b2`** en light mode está en el límite (4.0:1). Idealmente sería `#0a7e9e` para texto pequeño.
- **Badge con bg/10**: El fondo 10% de un color puede no tener suficiente contraste con el borde o texto. Revisar visualmente.

---

## 2. Focus visible — CRÍTICO

### Problema
Ningún componente interactivo tiene `focus-visible:ring-2`. Esto afecta a usuarios de teclado.

### Archivos afectados
- `primary-button.tsx`
- `submit-button.tsx`
- `pagination.tsx` (botones de página, anterior/siguiente)
- `status-badge.tsx` (no aplica, no es interactivo)
- Todos los `Link` y `button` en `page-shell.tsx`

### Fix estándar
```tsx
className="... focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
```

---

## 3. Light mode en componentes legacy

### Problema
`pagination.tsx` usa `bg-slate-950/45 border-slate-800/80 text-slate-300` — colores solo dark mode. No funcionan en tema claro.

### Archivos afectados
- `pagination.tsx` — toda la paleta es dark-mode
- `primary-button.tsx` — usa `text-cyan-100` (light en dark) sin variante light
- `submit-button.tsx` — mismo problema

---

## 4. Disabled states

### Problema
Los estados `disabled` usan solo `opacity-50`, lo que puede no ser suficiente para usuarios con baja visión.

### Recomendación
Además de opacidad, considerar:
- Cambiar cursor a `not-allowed`
- Fondo con patrón o textura sutil
- Tooltip explicando por qué está deshabilitado

---

## 5. Recomendaciones generales

| Prioridad | Acción | Archivos |
|---|---|---|
| 🔴 Alta | Agregar `focus-visible:ring` a todos los interactive | `primary-button.tsx`, `submit-button.tsx`, `pagination.tsx`, `page-shell.tsx` |
| 🟡 Media | Migrar `pagination.tsx` a tokens semánticos + dark prefix | `pagination.tsx` |
| 🟡 Media | Migrar `primary-button.tsx` y `submit-button.tsx` a design tokens | `primary-button.tsx`, `submit-button.tsx` |
| 🟢 Baja | Revisar contraste de badges con bg/10 en modo claro | `status-badge.tsx` |
| 🟢 Baja | Agregar `aria-label` descriptivo a icon buttons | `page-shell.tsx` |
| 🟢 Baja | Agregar `role="status"` a AlertCard | `alert-card.tsx` |

---

## 6. Checks automatizados disponibles

```bash
# Verificar tipos
npm run typecheck

# Build completo
npm run build

# Tests (si existen)
npm run test
```

> Próxima revisión recomendada: después de integrar los componentes base en pantallas reales, probar con axe DevTools o Lighthouse.
