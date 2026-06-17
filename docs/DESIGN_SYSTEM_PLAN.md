# DESIGN_SYSTEM_PLAN.md

## Dirección visual

Base clara, profesional y operacional. Dark mode queda como modo secundario.
La interfaz debe sentirse confiable para operaciones técnicas y suficientemente elegante para demo comercial.

**Principio rector**: Una tarea principal por pantalla. El usuario debe saber qué hacer ahora, qué falta y qué queda auditado.

---

## 1. Tema

| Aspecto | Primario | Secundario |
|---|---|---|
| Tema por defecto | **Claro** | Dark mode |
| Ratio de uso esperado | ~80% | ~20% |
| Implementación | Clase `.dark` en `<html>` | Toggle en layout |
| Contraste mínimo | WCAG AA (4.5:1 texto normal, 3:1 texto grande) | Igual |

### 1.1 Paleta base

| Token | Light | Dark | Uso |
|---|---|---|---|
| `--background` | `#f8fafc` | `#080f1e` | Fondo general |
| `--background-elevated` | `#f1f5f9` | `#0f172a` | Cards, paneles |
| `--background-panel` | `rgba(241,245,249,0.85)` | `rgba(15,23,42,0.72)` | Paneles superpuestos |
| `--border-strong` | `rgba(148,163,184,0.7)` | `rgba(51,65,85,0.9)` | Bordes de componente |
| `--border-soft` | `rgba(148,163,184,0.35)` | `rgba(51,65,85,0.45)` | Bordes sutiles |
| `--text-primary` | `#0f172a` | `#e5eef9` | Títulos, cuerpo |
| `--text-secondary` | `#475569` | `#94a3b8` | Labels, descripciones |
| `--accent` | `#0891b2` | `#22d3ee` | Acciones primarias, links |
| `--accent-strong` | `#0e7490` | `#0891b2` | Hover de acciones |
| `--success` | `#16a34a` | `#22c55e` | Operacional verde |
| `--warning` | `#d97706` | `#f59e0b` | Precaución |
| `--danger` | `#dc2626` | `#ef4444` | Error, bloqueante |

### 1.2 Estados operacionales (StatusBadge)

| Estado | Color | Icono sugerido | Fondo |
|---|---|---|---|
| Planificado | `--accent` | `FileText` | `accent/10` |
| En revisión | `--warning` | `Clock` | `warning/10` |
| Aprobado | `--success` | `CheckCircle` | `success/10` |
| Rechazado | `--danger` | `XCircle` | `danger/10` |
| En ejecución | `--accent` | `PlayCircle` | `accent/10` |
| Completado | `--success` | `CheckCircle` | `success/10` |
| Cancelado | `--text-secondary` | `Slash` | `secondary/10` |
| Vencido | `--danger` | `AlertTriangle` | `danger/10` |

---

## 2. Tipografía

| Uso | Font | Tamaño | Peso |
|---|---|---|---|
| Títulos de página | Space Grotesk | 24-30px (text-2xl/3xl) | 600 |
| Subtítulos de sección | Space Grotesk | 18-20px (text-lg/xl) | 500 |
| Cuerpo principal | Inter | 15-16px (text-base) | 400 |
| Labels de formulario | Inter | 13-14px (text-sm) | 500 |
| Texto auxiliar | Inter | 12-13px (text-xs/sm) | 400 |
| Badges / chips | Inter | 12px (text-xs) | 500 |
| Datos en tabla | Inter / Mono | 14px (text-sm) | 400 |
| Código / coordenadas | JetBrains Mono | 13px | 400 |

**Reglas**:
- Mínimo absoluto: 12px (solo badges y etiquetas auxiliares).
- Labels de formulario: mínimo 13px.
- Cuerpo de tarjetas y tablas: mínimo 14px, preferido 15-16px.
- No usar font-size menor a 12px en ninguna interfaz.

---

## 3. Espaciado y layout

Grid base de 4px. Usar escala Tailwind estándar:

| Clase | Píxeles | Uso común |
|---|---|---|
| `p-2` / `gap-2` | 8px | Padding interno compacto |
| `p-4` | 16px | Padding estándar de card |
| `p-6` | 24px | Padding de página / panel |
| `gap-4` | 16px | Gap entre componentes |
| `gap-6` | 24px | Gap entre secciones |
| `space-y-4` | 16px | Separación vertical entre items |

**Layouts clave**:

| Pantalla | Layout |
|---|---|
| Dashboard | Grid 2-4 columnas, card métrica + timeline |
| Listas | Tabla con header fijo, paginación abajo |
| Detalle de misión | Sidebar de metadatos + contenido principal |
| Wizard de misión | Stepper vertical + panel de paso |
| Mapa | Full height, panel flotante superpuesto |

---

## 4. Componentes base

### 4.1 Button

| Variante | Background | Texto | Borde | Hover |
|---|---|---|---|---|
| Primary | `--accent` | White | Ninguno | `--accent-strong` |
| Secondary | Transparent | `--text-primary` | `--border-strong` | Background sutil |
| Destructive | `--danger` | White | Ninguno | 10% más oscuro |
| Ghost | Transparent | `--text-secondary` | Ninguno | `--background-elevated` |
| Icon | Transparent | `--text-secondary` | Ninguno | `--background-elevated` |

Altura mínima: 36px. Padding horizontal: 12-16px.
Botones con solo ícono: 36x36px.

### 4.2 Card

- Background: `--background-elevated`
- Border-radius: 8px (`rounded-lg`)
- Shadow: sm (0 1px 2px rgba(0,0,0,0.05)) en claro, más sutil en dark
- Padding: 16-24px (`p-4` o `p-6`)
- Header opcional con título y acciones

### 4.3 StatusBadge

```
[●] Estado
```

- Dot + label textual
- Color según estado operacional (tabla en sección 1.2)
- Background semitransparente del color correspondiente
- Border-radius: 4px
- Padding: 2px 8px
- Font-size: 12px, weight 500

### 4.4 MetricCard

```
┌─────────────────────┐
│ [icon]  42          │
│        Misiones activas │
└─────────────────────┘
```

- Icono a la izquierda
- Número grande (text-2xl, Space Grotesk)
- Label descriptivo debajo (text-sm, --text-secondary)
- Trend opcional (↑12% vs ayer)

### 4.5 SectionCard

```
┌─────────────────────────────┐
│ ▼ Información del cliente   │
├─────────────────────────────┤
│ Contenido colapsable...    │
└─────────────────────────────┘
```

- Header clickeable con ícono de expandir/colapsar
- Estado expandido por defecto en pantallas grandes
- Animación suave de transición

### 4.6 AlertCard

| Severidad | Borde izquierdo | Icono | Background |
|---|---|---|---|
| Info | `--accent` | Info | `--accent` al 8% |
| Warning | `--warning` | AlertTriangle | `--warning` al 8% |
| Error | `--danger` | XCircle | `--danger` al 8% |
| Success | `--success` | CheckCircle | `--success` al 8% |

- Sin borde completo, solo barra izquierda de 4px
- Título opcional en semibold
- Mensaje en tamaño base
- Acción opcional (botón ghost)

### 4.7 EmptyState

```
┌──────────────────────┐
│                      │
│     [icon 64px]      │
│  No hay misiones     │
│  Crea tu primera     │
│  misión para empezar │
│                      │
│  [+ Nueva misión]    │
│                      │
└──────────────────────┘
```

- Icono grande centrado (64px, opacidad 40%)
- Título: text-lg, semibold
- Descripción: text-sm, secondary
- CTA opcional centrado
- Padding generoso (py-12)

### 4.8 DataTable

- Header con fondo sutil, texto semibold
- Filas con hover highlight
- Striped opcional (zebra)
- Sort指示器 en header
- Paginación: "Mostrando 1-10 de 42" + controles

### 4.9 Form

- Labels arriba del input (stacked, no floating)
- Input height mínimo 36px
- Error state: borde danger + mensaje abajo
- Helper text opcional abajo (text-xs, secondary)
- Grupo de campos relacionados con gap-4

### 4.10 Wizard Step

```
  1 ───── 2 ───── 3 ───── 4
 ● ──── ○ ──── ○ ──── ○
```

- Pasos completados: check + color success
- Paso actual: número + accent
- Pasos pendientes: número + muted
- Línea conectora entre pasos

---

## 5. Layout de pantalla

### 5.1 Dashboard

```
┌──────────────────────────────────────────┐
│ Header: logo + búsqueda + usuario + tema │
├──────────────────────────────────────────┤
│ MetricCard  MetricCard  MetricCard       │
├──────────────────────────────────────────┤
│ Gráfico / Mapa miniatura  │ Timeline     │
│                           │ de actividad │
├──────────────────────────────────────────┤
│ Tabla: próximas misiones                 │
└──────────────────────────────────────────┘
```

### 5.2 Mapa

```
┌──────────────────────────────────────────┐
│ Mapa (full height, -header)              │
│ ┌─────────────────┐                      │
│ │ Panel flotante   │                     │
│ │ - Capas          │                     │
│ │ - Herramientas   │                     │
│ │ - Coordenadas    │                     │
│ └─────────────────┘                      │
└──────────────────────────────────────────┘
```

### 5.3 Wizard de misión

```
┌──────────────────────────────────────────┐
│ Stepper: ① Datos  ② Mapa  ③ Docs  ④ OK  │
├──────────────────────────────────────────┤
│                                          │
│   [Paso actual - contenido del paso]    │
│                                          │
├──────────────────────────────────────────┤
│           [← Atrás]    [Siguiente →]      │
└──────────────────────────────────────────┘
```

---

## 6. Accesibilidad

| Regla | Estándar |
|---|---|
| Contraste texto normal | WCAG AA ≥ 4.5:1 |
| Contraste texto grande (≥18px bold o ≥24px) | ≥ 3:1 |
| Target táctil mínimo | 44x44px |
| Focus visible | Outline 2px accent + offset 2px |
| No solo color | Badges incluyen texto |
| Labels asociados | `htmlFor` en formularios |
| Roles semánticos | ARIA donde no baste HTML semántico |

---

## 7. Errores a evitar

- **Fuentes menores a 12px** en cualquier parte de la interfaz.
- **Dependencia exclusiva del color** para comunicar estado.
- **Dark mode como tema default** — el claro es la experiencia primaria.
- **Floating labels** — usar stacked labels (label arriba del input).
- **Animaciones decorativas sin propósito funcional**.
- **Cards sin jerarquía** — usar padding y sombra consistente.
- **Tablas sin hover ni sort** en listas operacionales.
- **Mapa sin contexto** — el mapa debe incluir indicadores de estado y capas.

---

## 8. Implementación sugerida

1. Documentar tokens y variantes (este documento).
2. Agregar tokens a `globals.css` y `tailwind.config.ts`.
3. Crear componentes base: `Button`, `StatusBadge`, `MetricCard`, `SectionCard`, `AlertCard`, `EmptyState`, `WizardStep`.
4. Aplicar por pantalla en orden: dashboard → lista de planes → detalle de plan → wizard → mapa.
5. Validar contraste WCAG AA en tema claro y oscuro.
6. Iterar con feedback de usuario.

## 9. Referencia rápida de tokens CSS

Ver `src/app/globals.css` para los valores actuales de:

| Categoría | Tokens existentes | Por agregar |
|---|---|---|
| Color | `--background`, `--accent`, `--success`, etc. | ✓ Ya existen |
| Font-size | No hay tokens CSS | `--text-xs` a `--text-3xl` |
| Spacing | No hay tokens CSS | `--space-1` a `--space-12` |
| Shadow | No hay tokens CSS | `--shadow-sm`, `--shadow-md`, `--shadow-lg` |
| Radius | No hay tokens CSS | `--radius-sm`, `--radius-md`, `--radius-lg` |
| Font family | `--font-inter`, `--font-space-grotesk`, `--font-mono` | ✓ Ya existen |
