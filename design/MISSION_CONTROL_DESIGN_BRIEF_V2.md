# Mission Control — Design Brief v2
### Dark Glassmorphism Premium · VisionOS-inspired · Apple Intelligence UI

> **Producto:** Mission control unificado para Xisco (Iron Monkey Charter + Growing Inmobiliario).
> **Stack objetivo:** React 18+ (Vite o Next.js) + Tailwind CSS + Framer Motion.
> **Referencias visuales:** visionOS / Apple Intelligence UI / WWDC25 Liquid Glass / Linear / Arc Browser / Vercel Dashboard / Smart Home Dashboard espacial.
> **Personalidad:** *"Spatial Premium Operativo"*. Sala de control holográfica en penumbra, no documento de Word.
> **Filosofía:** el usuario flota sobre sus datos. Cada elemento respira. La profundidad Z define la jerarquía.

---

## Tabla de contenidos
1. [Cambio de paradigma respecto al brief anterior](#1-cambio-de-paradigma)
2. [Sistema de capas (Z-index semántico)](#2-sistema-de-capas-z-index-semántico)
3. [Fondo atmosférico](#3-fondo-atmosférico)
4. [Glassmorphism — sistema de cristales](#4-glassmorphism-sistema-de-cristales)
5. [Paleta de color extendida](#5-paleta-de-color-extendida)
6. [Tipografía display](#6-tipografía-display)
7. [Gradientes y acentos](#7-gradientes-y-acentos)
8. [Iconografía](#8-iconografía)
9. [Botones y controles](#9-botones-y-controles)
10. [Charts y datos](#10-charts-y-datos)
11. [Animación y motion](#11-animación-y-motion)
12. [Arquitectura de información](#12-arquitectura-de-información)
13. [Layout del Dashboard principal](#13-layout-del-dashboard-principal)
14. [Las 6 pantallas principales (wireframes detallados)](#14-las-6-pantallas-principales-wireframes-detallados)
15. [Componentes del design system](#15-componentes-del-design-system)
16. [Estados: loading, vacío, error, success](#16-estados)
17. [Responsive y breakpoints](#17-responsive-y-breakpoints)
18. [Accesibilidad](#18-accesibilidad)
19. [Setup del proyecto React](#19-setup-del-proyecto-react)
20. [Tokens y configuración Tailwind](#20-tokens-y-configuración-tailwind)
21. [Snippets React listos para producción](#21-snippets-react-listos-para-producción)
22. [Hoja de ruta de implementación](#22-hoja-de-ruta-de-implementación)
23. [Checklist de calidad visual](#23-checklist-de-calidad-visual)

---

## 1. Cambio de paradigma respecto al brief anterior

| Aspecto | Brief v1 (HIG clásico) | Brief v2 (Spatial Premium) |
|---|---|---|
| Modo | Light mode primario, dark secundario | **Dark mode exclusivo**, sin opción clara |
| Material principal | Cards sólidos blancos | **Cristal translúcido sobre fondo atmosférico** |
| Fondo | Color plano (`#FAFAFA`) | **Imagen / gradiente atmosférico profundo** |
| Color de acento | Azul Apple (`#007AFF`) | **Cian eléctrico** (`#5DD4FF`) + verde lima (`#C4F542`) |
| Tipografía números | 17-22px, weight 600 | **48-72px, weight 300-400** (display, elegante) |
| Sombras | Sutiles 1-2px | **Profundas, difusas, 20-40px** (vidrio flotante) |
| Bordes | Hairlines `rgba(0,0,0,0.12)` | **Highlight especular blanco** `rgba(255,255,255,0.08-0.15)` |
| Espaciado | Generoso pero contenido | **Ultra generoso**, sensación de sala amplia |
| Layout | Cards en grid uniforme | **Bento grid asimétrico** + elementos flotantes sueltos |
| Botones | Rellenos azul sólido | **Píldoras de cristal** con highlight + acentos neón |
| Charts | Líneas simples | **Curvas Bézier con glow + área con gradiente** |

> **Regla máxima:** si dudas, mira el dashboard del Smart Home o el Financial Summary. Esa es la diana.

---

## 2. Sistema de capas (Z-index semántico)

El diseño vive en 3D. Cada capa tiene un "altura" que la UI representa visualmente con sombra + blur.

```css
/* Z-index layers (también usados como variable para sombras) */
--z-canvas:     0;   /* Fondo atmosférico, imagen desenfocada */
--z-base:      10;   /* Cards principales sobre el fondo */
--z-float:     20;   /* Elementos flotantes (sidebars, tab bars) */
--z-overlay:   30;   /* Modales, sheets, dropdowns */
--z-toast:     40;   /* Notificaciones, toasts */
--z-tooltip:   50;   /* Tooltips (siempre encima de todo) */
```

**Regla:** cada capa superior tiene **más blur** y **más sombra** que la inferior. La profundidad es información.

---

## 3. Fondo atmosférico

El fondo **no es un color**, es una **atmósfera**. En las referencias oscila entre:
- Foto de interior (salón oscuro, lámpara cálida) fuertemente desenfocada.
- Gradiente radial oscuro (carbón → negro absoluto) con tinte sutil.
- Combinación de ambos: gradiente sobre imagen.

### Implementación recomendada

**Opción A — Foto de fondo (la más impactante, usada en Smart Home + Financial Summary):**
```html
<div class="app-bg">
  <div class="app-bg__image" />  <!-- foto oscura, blur(40px), scale(1.1) -->
  <div class="app-bg__overlay" />  <!-- tinte oscuro encima -->
</div>
```

```css
.app-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
}
.app-bg__image {
  position: absolute;
  inset: -40px;  /* margen para que el blur no muestre bordes */
  background: url('/bg-mallorca-night.jpg') center/cover no-repeat;
  filter: blur(40px) saturate(120%) brightness(0.55);
  transform: scale(1.1);  /* compensa el blur */
}
.app-bg__overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse at 30% 20%,
    rgba(20, 30, 50, 0.4) 0%,
    rgba(0, 0, 0, 0.7) 70%,
    rgba(0, 0, 0, 0.9) 100%
  );
}
```

**Opción B — Gradiente puro (más seguro, sin dependencias):**
```css
.app-bg {
  background:
    radial-gradient(ellipse 80% 60% at 20% 10%, #0a1a2e 0%, transparent 60%),
    radial-gradient(ellipse 60% 80% at 90% 90%, #1a0a2e 0%, transparent 60%),
    radial-gradient(ellipse 100% 100% at 50% 50%, #050810 0%, #000 100%);
}
.app-bg::after {
  /* grano sutil para质感 */
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,...noise...");
  opacity: 0.04;
  mix-blend-mode: overlay;
  pointer-events: none;
}
```

### Decisión para Mission Control
Recomendación: **Opción A** con foto nocturna de Mallorca (puerto, mar, luces cálidas) si se quiere máxima inmersión. **Opción B** si se prefiere algo que funcione sin assets.

> **Importante:** la foto debe ser oscura (luminancia media <30%) para que el glassmorphism funcione. Si es demasiado clara, los cards pierden contraste.

---

## 4. Glassmorphism — sistema de cristales

Este es el corazón del diseño. Hay 4 niveles de cristal, cada uno con su rol.

### Tokens base
```css
:root {
  /* Cristales — light mode: NO APLICA. Esto es dark-only */
  /* Vidrio principal (cards de contenido) */
  --glass-bg-1: rgba(20, 22, 30, 0.55);
  --glass-bg-2: rgba(28, 32, 42, 0.65);
  --glass-bg-3: rgba(35, 40, 52, 0.75);
  --glass-bg-float: rgba(18, 20, 28, 0.72);

  /* Blur progresivo por capa */
  --blur-sm: blur(16px) saturate(140%);
  --blur-md: blur(24px) saturate(160%);
  --blur-lg: blur(32px) saturate(180%);
  --blur-xl: blur(48px) saturate(200%);

  /* Highlight especular — borde superior (luz cenital) */
  --edge-top: rgba(255, 255, 255, 0.12);
  --edge-bottom: rgba(255, 255, 255, 0.04);
  --edge-stroke: rgba(255, 255, 255, 0.08);

  /* Sombras externas */
  --shadow-glass-sm: 0 4px 12px rgba(0, 0, 0, 0.25), 0 1px 2px rgba(0, 0, 0, 0.15);
  --shadow-glass-md: 0 12px 32px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.2);
  --shadow-glass-lg: 0 24px 60px rgba(0, 0, 0, 0.55), 0 4px 12px rgba(0, 0, 0, 0.25);
  --shadow-glass-xl: 0 40px 100px rgba(0, 0, 0, 0.7), 0 8px 20px rgba(0, 0, 0, 0.3);
}
```

### Sistema de cristales

```css
/* === NIVEL 1: Card base (contenido principal) === */
.glass-1 {
  background: var(--glass-bg-1);
  backdrop-filter: var(--blur-md);
  -webkit-backdrop-filter: var(--blur-md);
  border: 1px solid var(--edge-stroke);
  border-top-color: var(--edge-top);
  border-bottom-color: var(--edge-bottom);
  border-radius: 20px;
  box-shadow: var(--shadow-glass-md);
  position: relative;
  isolation: isolate;
}

/* === NIVEL 2: Card elevado (KPI hero, métricas principales) === */
.glass-2 {
  background: var(--glass-bg-2);
  backdrop-filter: var(--blur-lg);
  -webkit-backdrop-filter: var(--blur-lg);
  border: 1px solid var(--edge-stroke);
  border-top-color: var(--edge-top);
  border-radius: 24px;
  box-shadow: var(--shadow-glass-lg);
}

/* === NIVEL 3: Card destacado (hero card, número del día) === */
.glass-3 {
  background: var(--glass-bg-3);
  backdrop-filter: var(--blur-xl);
  -webkit-backdrop-filter: var(--blur-xl);
  border: 1px solid var(--edge-stroke);
  border-top-color: rgba(255, 255, 255, 0.16);
  border-radius: 28px;
  box-shadow: var(--shadow-glass-xl);
}

/* === NIVEL FLOAT: Elementos flotantes (sidebars, tab bars, modales) === */
.glass-float {
  background: var(--glass-bg-float);
  backdrop-filter: var(--blur-xl) saturate(200%);
  -webkit-backdrop-filter: var(--blur-xl) saturate(200%);
  border: 1px solid var(--edge-stroke);
  border-top-color: var(--edge-top);
  border-radius: 24px;
  box-shadow: var(--shadow-glass-lg);
}
```

### Highlight especular (detalle premium)

Este es el detalle que hace que parezca cristal real. Se añade con un `::before` o un `::after` con un gradiente sutil en el borde superior:

```css
.glass-1::before {
  content: '';
  position: absolute;
  top: 0;
  left: 8%;
  right: 8%;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  pointer-events: none;
  z-index: 1;
}
```

### Refracción (opcional, ultra-premium)

Para cards que están sobre zonas con color vivo del fondo, añadir un gradiente diagonal que simule refracción:

```css
.glass-premium::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.08) 0%,
    rgba(255, 255, 255, 0) 30%,
    rgba(255, 255, 255, 0) 70%,
    rgba(255, 255, 255, 0.04) 100%
  );
  pointer-events: none;
  z-index: 1;
}
```

### Fallback sin `backdrop-filter`

```css
@supports not (backdrop-filter: blur(1px)) {
  .glass-1, .glass-2, .glass-3, .glass-float {
    background: rgba(15, 18, 25, 0.92);
  }
}
```

---

## 5. Paleta de color extendida

### Tinta (texto)

| Token | Hex/RGBA | Uso |
|---|---|---|
| `--ink-primary` | `#FFFFFF` | Números grandes, títulos |
| `--ink-secondary` | `rgba(255, 255, 255, 0.7)` | Labels, texto descriptivo |
| `--ink-tertiary` | `rgba(255, 255, 255, 0.45)` | Metadata, hints |
| `--ink-quaternary` | `rgba(255, 255, 255, 0.25)` | Disabled, placeholders |
| `--ink-inverse` | `#0A0C12` | Texto sobre botones brillantes |

### Superficies base (vidrio)

Ya definidos arriba. Resumen rápido:
- `--glass-bg-1`: `rgba(20, 22, 30, 0.55)` — cards
- `--glass-bg-2`: `rgba(28, 32, 42, 0.65)` — cards elevados
- `--glass-bg-3`: `rgba(35, 40, 52, 0.75)` — hero cards
- `--glass-bg-float`: `rgba(18, 20, 28, 0.72)` — flotantes

### Acentos primarios

| Token | Hex | Uso |
|---|---|---|
| `--accent-cyan` | `#5DD4FF` | **Acción primaria**, links, focus, success alternativo |
| `--accent-cyan-soft` | `rgba(93, 212, 255, 0.15)` | Tints, badges, glows |
| `--accent-cyan-glow` | `rgba(93, 212, 255, 0.4)` | Sombras de acento, hovers |

### Acento secundario (premium)

| Token | Hex | Uso |
|---|---|---|
| `--accent-lime` | `#C4F542` | **Highlight de éxito**, logros, objetivos cumplidos |
| `--accent-lime-soft` | `rgba(196, 245, 66, 0.18)` | Tints verdes |
| `--accent-lime-glow` | `rgba(196, 245, 66, 0.4)` | Sombras de éxito |

### Acentos por negocio

| Negocio | Color | Hex | Glow |
|---|---|---|---|
| Iron Monkey (charter) | Cyan | `#5DD4FF` | `rgba(93, 212, 255, 0.35)` |
| Growing (SDR) | Violet | `#A78BFA` | `rgba(167, 139, 250, 0.35)` |

### Semánticos

| Token | Hex | Uso |
|---|---|---|
| `--success` | `#34D399` (verde esmeralda) | KPI positivo, agenda cerrada |
| `--warning` | `#FBBF24` (ámbar) | Pendiente, objetivo al 70% |
| `--danger` | `#F87171` (rojo coral) | Pérdida, error destructivo |
| `--info` | `#60A5FA` (azul suave) | Neutral informativo |
| `--premium` | `#C4F542` (lime) | Logros, gamificación |

### Reglas de color
- **Nunca texto blanco puro < 13px** sobre cristal — usar `--ink-secondary` o más.
- **Acento cyan**: solo en CTA primario, focus ring, link, dot de estado activo.
- **Acento lime**: solo en éxito destacado, logros, números positivos grandes.
- **Negocio color**: solo como dot de 8px, borde izquierdo 3px, o glow en icono. Nunca como fondo.
- **Contraste mínimo:** AA (4.5:1) en texto blanco sobre cristal oscuro, AAA (7:1) en números grandes.

---

## 6. Tipografía display

### Familia

**`Inter`** (open source, perfecta para data-dense) o **`Geist`** (más moderna, Vercel). Cargadas vía `@font-face` con `font-display: swap`.

```css
:root {
  --font-sans: 'Inter', -apple-system, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif;
  --font-display: 'Inter', -apple-system, 'SF Pro Display', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', 'Roboto Mono', ui-monospace, monospace;
}
```

**Pesos preferidos:** `300` (Light), `400` (Regular), `500` (Medium), `600` (Semibold). **Evitar 700+** — los pesos gruesos chillan sobre cristal oscuro.

### Escala tipográfica

| Token | Size | Weight | Line-height | Tracking | Uso |
|---|---|---|---|---|---|
| `display-3xl` | 96px | 300 | 1.0 | -0.04em | Hero absoluto, número del digest matinal |
| `display-2xl` | 72px | 300 | 1.0 | -0.035em | KPI principal del dashboard |
| `display-xl` | 56px | 400 | 1.05 | -0.03em | Métrica grande de sección |
| `display-lg` | 44px | 400 | 1.1 | -0.025em | Número destacado en card |
| `display-md` | 36px | 500 | 1.15 | -0.02em | Hero card title |
| `display-sm` | 28px | 500 | 1.2 | -0.015em | Título de sección |
| `heading-lg` | 22px | 500 | 1.3 | -0.01em | Título de card |
| `heading-md` | 18px | 500 | 1.35 | -0.005em | Subtítulo |
| `heading-sm` | 15px | 600 | 1.4 | 0 | Label destacado, button |
| `body-lg` | 17px | 400 | 1.5 | 0 | Texto principal |
| `body` | 15px | 400 | 1.5 | 0 | Texto corrido |
| `body-sm` | 14px | 400 | 1.45 | 0 | Descripción |
| `caption` | 13px | 500 | 1.4 | 0.01em | Etiquetas, axis labels |
| `micro` | 11px | 600 | 1.3 | 0.05em | **UPPERCASE**, badges, eyebrow |

### Reglas de oro tipográficas
- **Números grandes:** weight 300-400, NO bold. Bold sobre cristal se ve barato.
- **Títulos:** weight 500-600, tracking negativo.
- **Eyebrows / categorías:** weight 600, UPPERCASE, tracking 0.05em, color `--ink-tertiary`.
- **Números en tablas/charts:** `font-variant-numeric: tabular-nums`.
- **Line-height display:** 1.0-1.1 (los números grandes respiran poco verticalmente).
- **Line-height body:** 1.5 (legibilidad).
- **Alineación de números:** siempre `text-right` en listas, con `tabular-nums`.

---

## 7. Gradientes y acentos

### Gradientes signature

```css
/* Gradiente cian — primary CTA glow */
.gradient-cyan {
  background: linear-gradient(135deg, #5DD4FF 0%, #3B82F6 100%);
}

/* Gradiente lima — success glow */
.gradient-lime {
  background: linear-gradient(135deg, #C4F542 0%, #84CC16 100%);
}

/* Gradiente violeta — SDR glow */
.gradient-violet {
  background: linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%);
}

/* Gradiente cálido — highlight decorativo */
.gradient-amber {
  background: linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%);
}

/* Gradiente frío — danger glow */
.gradient-danger {
  background: linear-gradient(135deg, #F87171 0%, #DC2626 100%);
}
```

### Texto con gradiente (números hero)

```css
.text-gradient-cyan {
  background: linear-gradient(135deg, #FFFFFF 0%, #5DD4FF 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

.text-gradient-lime {
  background: linear-gradient(135deg, #FFFFFF 0%, #C4F542 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.text-gradient-violet {
  background: linear-gradient(135deg, #FFFFFF 0%, #A78BFA 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### Glow effects (sombras con color)

```css
.glow-cyan { box-shadow: 0 0 24px rgba(93, 212, 255, 0.4), 0 0 8px rgba(93, 212, 255, 0.2); }
.glow-lime { box-shadow: 0 0 24px rgba(196, 245, 66, 0.4), 0 0 8px rgba(196, 245, 66, 0.2); }
.glow-violet { box-shadow: 0 0 24px rgba(167, 139, 250, 0.4), 0 0 8px rgba(167, 139, 250, 0.2); }
```

**Regla:** el glow se aplica **solo** a:
- CTAs primarios en hover.
- Botón de grabación (en vivo).
- Indicadores activos en sliders.
- Iconos de notificación importantes.

Nunca a texto. Nunca a cards pasivas.

---

## 8. Iconografía

**Librería:** `lucide-react` (1.500+ iconos, peso 1.5px, estilo SF Symbols).

**Pesos:**
- `1.5px` outline: estado normal.
- `2px` outline: alta prominencia.
- `filled`: estado activo / dentro de botón con color.

**Tamaños:**

| Token | px | Uso |
|---|---|---|
| `icon-xs` | 12 | Eyebrow labels |
| `icon-sm` | 16 | Inline con texto |
| `icon-md` | 20 | List items, inputs |
| `icon-lg` | 24 | Botones, navegación |
| `icon-xl` | 32 | Hero icons, empty states |
| `icon-2xl` | 48 | Empty states grandes |
| `icon-3xl` | 64 | Hero decorativo |

**Regla:** en estado activo, los iconos cambian a `fill` y adoptan el color de acento (cian o lime).

---

## 9. Botones y controles

### Botones — Sistema

```css
/* === PRIMARY — pill brillante === */
.btn-primary {
  background: linear-gradient(135deg, #5DD4FF 0%, #3B82F6 100%);
  color: #0A0C12;
  font-weight: 600;
  padding: 12px 24px;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow:
    0 0 24px rgba(93, 212, 255, 0.4),
    0 8px 20px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}
.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow:
    0 0 32px rgba(93, 212, 255, 0.5),
    0 12px 24px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
}
.btn-primary:active {
  transform: translateY(0);
}

/* === SECONDARY — pill de cristal === */
.btn-secondary {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  color: #FFFFFF;
  font-weight: 500;
  padding: 12px 24px;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 200ms ease;
}
.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.2);
}

/* === GHOST — sin fondo === */
.btn-ghost {
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  padding: 10px 16px;
  border-radius: 9999px;
  transition: all 150ms ease;
}
.btn-ghost:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #FFFFFF;
}

/* === DESTRUCTIVE — pill rojo con glow === */
.btn-destructive {
  background: linear-gradient(135deg, #F87171 0%, #DC2626 100%);
  color: #FFFFFF;
  font-weight: 600;
  padding: 12px 24px;
  border-radius: 9999px;
  box-shadow:
    0 0 20px rgba(248, 113, 113, 0.3),
    0 8px 20px rgba(0, 0, 0, 0.3);
}

/* === ICON BUTTON — circular cristal === */
.btn-icon {
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  color: rgba(255, 255, 255, 0.8);
  transition: all 150ms ease;
}
.btn-icon:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #FFFFFF;
  transform: scale(1.05);
}
```

### Tamaño touch target: mínimo 44×44px (regla Apple, también buena en desktop).

### Switches (iOS-style)

```css
.switch {
  width: 52px;
  height: 30px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 9999px;
  position: relative;
  transition: background 250ms cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.switch::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 24px;
  height: 24px;
  background: linear-gradient(180deg, #FFFFFF 0%, #E0E0E0 100%);
  border-radius: 9999px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4), inset 0 -1px 0 rgba(0, 0, 0, 0.1);
  transition: transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
.switch--on {
  background: linear-gradient(135deg, #5DD4FF 0%, #3B82F6 100%);
  box-shadow: 0 0 16px rgba(93, 212, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2);
}
.switch--on::after {
  transform: translateX(22px);
}
```

### Sliders (track hundido, thumb flotante)

```css
.slider-track {
  height: 6px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 9999px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.4);
  position: relative;
}
.slider-progress {
  height: 100%;
  background: linear-gradient(90deg, #5DD4FF 0%, #C4F542 100%);
  border-radius: 9999px;
  box-shadow: 0 0 8px rgba(93, 212, 255, 0.4);
}
.slider-thumb {
  width: 22px;
  height: 22px;
  background: radial-gradient(circle at 30% 30%, #FFFFFF 0%, #E5E5E5 100%);
  border-radius: 9999px;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.5),
    0 0 0 4px rgba(93, 212, 255, 0.15),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
  cursor: grab;
}
```

### Inputs (cristal con focus cian)

```css
.input {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px 16px;
  color: #FFFFFF;
  font-size: 15px;
  transition: all 200ms ease;
}
.input::placeholder { color: rgba(255, 255, 255, 0.3); }
.input:focus {
  outline: none;
  border-color: #5DD4FF;
  box-shadow: 0 0 0 4px rgba(93, 212, 255, 0.15);
  background: rgba(255, 255, 255, 0.08);
}
```

### Pills / Tags (segmented control)

```css
.pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 9999px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  font-weight: 500;
  transition: all 150ms ease;
}
.pill--active {
  background: linear-gradient(135deg, #5DD4FF 0%, #3B82F6 100%);
  border-color: rgba(93, 212, 255, 0.4);
  color: #0A0C12;
  font-weight: 600;
  box-shadow: 0 0 12px rgba(93, 212, 255, 0.3);
}
.pill--lime.pill--active {
  background: linear-gradient(135deg, #C4F542 0%, #84CC16 100%);
  box-shadow: 0 0 12px rgba(196, 245, 66, 0.3);
}
```

---

## 10. Charts y datos

### Línea de tendencia con área (signature del Financial Summary)

```css
.chart-area {
  position: relative;
  width: 100%;
  height: 240px;
}
.chart-area__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
  background-size: 20% 25%;
}
.chart-area__line {
  /* SVG path con stroke-dasharray animado */
  stroke: url(#lineGradient);  /* gradiente cian → lima */
  stroke-width: 2.5;
  fill: none;
  filter: drop-shadow(0 0 6px rgba(93, 212, 255, 0.5));
}
.chart-area__fill {
  fill: url(#areaGradient);  /* gradiente vertical con opacidad 0.4 → 0 */
}
```

```html
<svg viewBox="0 0 400 200" class="chart-area">
  <defs>
    <linearGradient id="lineGradient" x1="0" x2="1">
      <stop offset="0%" stop-color="#5DD4FF"/>
      <stop offset="100%" stop-color="#C4F542"/>
    </linearGradient>
    <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stop-color="#5DD4FF" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#5DD4FF" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <path class="chart-area__fill" d="M0,150 C50,100 100,180 150,120 ..."/>
  <path class="chart-area__line" d="M0,150 C50,100 100,180 150,120 ..."/>
</svg>
```

### Barras (Total spending)

```css
.bar {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px 8px 0 0;
  transition: all 300ms ease;
}
.bar--active {
  background: linear-gradient(180deg, #C4F542 0%, #84CC16 100%);
  box-shadow: 0 0 16px rgba(196, 245, 66, 0.4);
}
```

### Anillo de progreso (tipo termostato Smart Home)

```css
.ring {
  width: 200px;
  height: 200px;
  position: relative;
}
.ring__track {
  fill: none;
  stroke: rgba(255, 255, 255, 0.08);
  stroke-width: 12;
}
.ring__progress {
  fill: none;
  stroke: url(#ringGradient);
  stroke-width: 12;
  stroke-linecap: round;
  transform: rotate(-90deg);
  transform-origin: center;
  filter: drop-shadow(0 0 8px rgba(93, 212, 255, 0.5));
  transition: stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Tooltips flotantes

```css
.tooltip {
  position: absolute;
  background: rgba(10, 12, 18, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  padding: 8px 12px;
  color: #FFFFFF;
  font-size: 13px;
  font-weight: 500;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  pointer-events: none;
  white-space: nowrap;
}
.tooltip::before {
  /* pequeña flecha */
  content: '';
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 8px;
  height: 8px;
  background: inherit;
  border-right: 1px solid rgba(255, 255, 255, 0.12);
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}
```

---

## 11. Animación y motion

### Curvas (basadas en HIG + visionOS)

| Token | Easing | Duración | Uso |
|---|---|---|---|
| `ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | 200ms | Hover, color changes |
| `ease-decelerate` | `cubic-bezier(0, 0, 0.2, 1)` | 300ms | Entradas, sheets |
| `ease-accelerate` | `cubic-bezier(0.4, 0, 1, 1)` | 200ms | Salidas, dismiss |
| `ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | 450ms | Bounce sutil, success |
| `ease-emphasized` | `cubic-bezier(0.2, 0, 0, 1)` | 400ms | Transiciones de vista |
| `ease-bouncy` | `cubic-bezier(0.68, -0.55, 0.27, 1.55)` | 600ms | Solo en logros/celebración |

### Framer Motion presets

```ts
// motion/presets.ts
import { Variants } from 'framer-motion';

export const fadeIn: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.35, ease: [0, 0, 0.2, 1] }
};

export const fadeInSlow: Variants = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 10, scale: 0.98 },
  transition: { duration: 0.5, ease: [0.2, 0, 0, 1] }
};

export const sheetUp: Variants = {
  initial: { y: '100%', opacity: 0.5 },
  animate: { y: 0, opacity: 1 },
  exit: { y: '100%', opacity: 0 },
  transition: { type: 'spring', damping: 32, stiffness: 320, mass: 0.8 }
};

export const modalIn: Variants = {
  initial: { opacity: 0, scale: 0.96, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.98, y: 4 },
  transition: { type: 'spring', damping: 28, stiffness: 350 }
};

export const staggerContainer: Variants = {
  animate: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } }
};

export const numberTick: Variants = {
  initial: { opacity: 0, y: 20, filter: 'blur(8px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { duration: 0.6, ease: [0.2, 0, 0, 1] }
};

export const glassHover = {
  whileHover: { y: -3, scale: 1.005 },
  whileTap: { scale: 0.995 },
  transition: { type: 'spring', damping: 20, stiffness: 300 }
};

export const glowPulse = {
  animate: {
    boxShadow: [
      '0 0 20px rgba(93, 212, 255, 0.3)',
      '0 0 40px rgba(93, 212, 255, 0.6)',
      '0 0 20px rgba(93, 212, 255, 0.3)'
    ],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
  }
};
```

### Count-up animado para KPIs

```ts
// hooks/useCountUp.ts
import { useEffect, useState } from 'react';
import { useMotionValue, useTransform, animate } from 'framer-motion';

export function useCountUp(target: number, duration = 1.2) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, v => Math.round(v));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(count, target, {
      duration,
      ease: [0.2, 0, 0, 1]
    });
    const unsub = rounded.on('change', v => setDisplay(v));
    return () => { controls.stop(); unsub(); };
  }, [target]);

  return display;
}
```

### Reglas de motion
- **Máximo 500ms** en transiciones de UI estándar.
- **Spring damping 28-32** para sensación premium, no juguetona.
- **Stagger 60ms** al cargar listas (un poco más lento que Apple estándar, por la sensación espacial).
- **Glow pulse** solo en indicadores en vivo (grabación, conexión).
- **Confetti** solo al cerrar objetivos / desbloquear logros.
- **Respetar `prefers-reduced-motion`**: reemplazar springs por fade 150ms.

---

## 12. Arquitectura de información

### Sitemap (sin cambios respecto a v1)

```
/  (Dashboard — Mission Control)
├── /charter
│   ├── /charter/leads
│   ├── /charter/leads/:id
│   ├── /charter/proposals
│   ├── /charter/calendar
│   └── /charter/pipeline
├── /sdr
│   ├── /sdr/dialer
│   ├── /sdr/leads
│   ├── /sdr/script
│   ├── /sdr/leaderboard
│   └── /sdr/metrics
├── /calls
│   ├── /calls/today
│   ├── /calls/:id
│   └── /calls/feedback
├── /digest
└── /settings
```

### Principios de IA
- **Un dashboard, dos modos de enfoque.** Visión global + drill-down por negocio.
- **Llamadas transversales.** No pertenecen a un negocio.
- **El digest es una vista, no un email.**
- **Settings al final**, pero accesible en 1 click desde el avatar (top-right).

---

## 13. Layout del Dashboard principal

Inspirado en el Smart Home dashboard + Financial Summary.

### Desktop (≥1280px) — Bento grid asimétrico

```
┌──────────────────────────────────────────────────────────────────────┐
│  ┌─ SIDEBAR (80px collapsed / 240px expanded, glass-float) ─┐         │
│  │  ⌂   Dashboard                                            │         │
│  │  ☀   Hoy                                                  │         │
│  │  📞  Llamadas                                             │         │
│  │  ─────────────────                                        │         │
│  │  ⚓  Charter                                              │         │
│  │  📲  SDR                                                 │         │
│  │  ─────────────────                                        │         │
│  │  📊  Métricas                                            │         │
│  │  🏆  Logros                                              │         │
│  │  ─────────────────                                        │         │
│  │  ⚙   Settings                                            │         │
│  └────────────────────────────────────────────────────────┘         │
│                                                                       │
│  ┌─ TOP BAR (glass-float, h=64px) ───────────────────────┐          │
│  │  Good evening, Xisco  ·  19 jun 2026  ·  Mallorca 28°  │          │
│  │                                  [⌘K Buscar]  [☀]  [👤] │          │
│  └────────────────────────────────────────────────────────┘          │
│                                                                       │
│  ┌─ HERO CARD (glass-3, h=180px, full width) ──────────────────┐    │
│  │  TODAY'S MISSION                                              │    │
│  │  117 / 100 llamadas      (verde lime)                         │    │
│  │  ████████████████████  117% — ¡objetivo superado!             │    │
│  │  25/25 conversaciones · 3/3 agendas                          │    │
│  │  € 2,450 leads activos esta semana                           │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                       │
│  ┌─ CHART (2/3 width) ─────────────┐  ┌─ QUICK ACTIONS (1/3) ─┐    │
│  │  ACTIVIDAD ÚLTIMOS 7 DÍAS     │  │  📞 Iniciar Dialer     │    │
│  │  [Bézier chart con área]      │  │  [CTA primary, glow]   │    │
│  │  ─ cyan → lime gradient       │  │  ─────────────────     │    │
│  │  Tue Wed Thu Fri Sat Sun Mon  │  │  + Nuevo Lead          │    │
│  │  💬 tooltip flotante          │  │  📅 Programar Cita     │    │
│  └────────────────────────────────┘  │  📊 Ver Métricas       │    │
│                                       └─────────────────────────┘    │
│                                                                       │
│  ┌─ CHARTER (1/2) ─────────────┐  ┌─ SDR (1/2) ─────────────────┐  │
│  │  ⚓ IRON MONKEY CHARTER     │  │  📲 GROWING INMOBILIARIO    │  │
│  │  € 2,450 semanal           │  │  117 / 100 llamadas hoy      │  │
│  │  [bar chart 7 días]         │  │  ↗ +17% vs ayer              │  │
│  │  4 leads activos · 2 prop.  │  │  [progress ring 360°]        │  │
│  └─────────────────────────────┘  └──────────────────────────────┘  │
│                                                                       │
│  ┌─ FEED (2/3) ─────────────────────────────────────┐               │
│  │  ACTIVIDAD RECIENTE                                │               │
│  │  10:32  📞 Llamada a Marina — 4:21 — ⭐⭐⭐⭐⭐       │               │
│  │  10:18  📄 Propuesta enviada a Carlos              │               │
│  │  09:55  👤 Lead nuevo: Inmobiliaria XYZ            │               │
│  │  09:30  ✅ Agenda confirmada con María             │               │
│  │  ───                                                 │               │
│  │  [Ver todo →]                                       │               │
│  └────────────────────────────────────────────────────┘               │
│                                                                       │
│  ┌─ LEADERBOARD (1/3) ──────────────────────────────┐               │
│  │  🏆 RACHA DEL DÍA                                  │               │
│  │  7 días seguidos cumpliendo objetivo                │               │
│  │  [anillo de progreso grande]                        │               │
│  └────────────────────────────────────────────────────┘               │
└──────────────────────────────────────────────────────────────────────┘
```

### Características clave del layout
- **Sidebar flotante** (no pegado al borde) con `glass-float`, 80px collapsed.
- **Top bar** con glass-float, contiene saludo contextual + búsqueda + avatar.
- **Hero card** superior, ocupa todo el ancho, con el número del día en display-2xl.
- **Bento grid** debajo: chart grande (2/3) + quick actions (1/3), luego 2 cards de negocio, luego feed + leaderboard.
- **Cards de negocio** con glow cyan (Charter) o glow violet (SDR) en el icono.
- **Todo respira** — gap de 24px entre cards, padding interno 24-28px.

### Mobile (<768px)
- Sidebar → tab bar inferior flotante con glass-float.
- Top bar mantiene saludo, oculta búsqueda en favor de botón lupa.
- Bento grid colapsa a 1 columna, cards se apilan.
- Hero card se mantiene arriba con número más pequeño (display-xl en lugar de 2xl).

---

## 14. Las 6 pantallas principales (wireframes detallados)

### 14.1 Dashboard (ya descrito arriba en sección 13)

### 14.2 Charter › Pipeline (Kanban cristal)

```
┌────────────────────────────────────────────────────────────────────┐
│ [← back]  Pipeline Charter          [+ Nuevo Lead]   [Filtros ⌄]  │
│                                                                    │
│  ┌─ Contacto ─┐  ┌─ Propuesta ──┐  ┌─ Negociando ─┐  ┌─ Cerrado ─┐│
│  │  3 leads   │  │   2 leads    │  │   1 lead     │  │  4 leads  ││
│  │  € 4,200   │  │   € 2,800    │  │   € 1,500    │  │ € 8,900  ││
│  │            │  │              │  │              │  │          ││
│  │ ┌────────┐ │  │ ┌──────────┐ │  │ ┌──────────┐ │  │ ┌──────┐ ││
│  │ │Carlos R│ │  │ │María L.  │ │  │ │Juan P.   │ │  │ │€ Ana│ ││
│  │ │Crucero │ │  │ │Bautizo   │ │  │ │8 pax     │ │  │ │  ✦  │ ││
│  │ │€1,800  │ │  │ │€1,200    │ │  │ │€1,500    │ │  │ └──────┘ ││
│  │ │📞 ✉ ⋯  │ │  │ │📞 ✉ ⋯    │ │  │ │📞 ✉ ⋯    │ │  │          ││
│  │ └────────┘ │  │ └──────────┘ │  │ └──────────┘ │  │          ││
│  │ ┌────────┐ │  │ ┌──────────┐ │  │              │  │          ││
│  │ │Laura M │ │  │ │Pedro S.  │ │  │              │  │          ││
│  │ │Sunset  │ │  │ │8 pax     │ │  │              │  │          ││
│  │ │€2,400  │ │  │ │€1,600    │ │  │              │  │          ││
│  │ └────────┘ │  │ └──────────┘ │  │              │  │          ││
│  └────────────┘  └──────────────┘  └──────────────┘  └──────────┘│
└────────────────────────────────────────────────────────────────────┘
```

**Card de lead** (glass-1, 240px wide):
```
┌──────────────────────────┐
│ ⚓ Carlos R.    [12 jun] │  ← dot cyan + fecha caption
│ Crucero 8 personas      │  ← subtitle ink-secondary
│ ──────                   │  ← separador sutil
│ € 1,800                  │  ← display-md, gradient-cyan
│ 3 notas · 2 emails       │  ← ink-tertiary
│ ──────                   │
│ [📞] [✉] [⋯]            │  ← icon buttons glass
└──────────────────────────┘
```

### 14.3 SDR › Dialer (modo enfoque fullscreen)

```
┌────────────────────────────────────────────────────────────────────┐
│  [← Volver]     Modo Enfoque           [🔴 ON AIR 04:21]  [⏸ Pausa]│
│                                                                    │
│                                                                    │
│                  Llamada 47 de 100                                 │
│                  ──────────────────                                │
│                                                                    │
│   ┌──────────────────────────────────────────────────────────┐    │
│   │  ◉ Inmobiliaria Costa Blanca                              │    │
│   │  👤 María García — Directora Comercial                    │    │
│   │  📅 Lead desde hace 2 días · ICP: ✓                       │    │
│   │                                                           │    │
│   │  PROGRESS DEL DÍA                                         │    │
│   │  Llamadas        ████████░░░ 47/100    (47%)              │    │
│   │  Conversaciones  ████░░░░░░░ 12/25     (48%)              │    │
│   │  Agendas         ██░░░░░░░░░  1/3      (33%)              │    │
│   │                                                           │    │
│   │  [⏺ Iniciar grabación]  [📋 Ver notas]  [⏭ Siguiente]    │    │
│   └──────────────────────────────────────────────────────────┘    │
│                                                                    │
│   🎯 Tu racha: 7 días · € 220 ganados esta semana                 │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

- Background: `glass-float` fullscreen, contenido centrado.
- Botón de grabación: grande, circular, gradiente danger con glow pulsante.
- Cuando termina la llamada: sheet desde abajo con resultados (estrellas + resultado + notas).

### 14.4 Llamadas › Detalle

```
┌────────────────────────────────────────────────────────────────────┐
│ [← back]  Marina García — 14 jun 10:32        [✉ Compartir] [⋯]   │
│                                                                    │
│  ┌─ IZQUIERDA (1/3) ─────────────────────┐                         │
│  │  [waveform canvas]                     │                         │
│  │  ──────────────────────                │                         │
│  │  [⏮] [▶ Play] 04:21  [vol] [1x]        │                         │
│  │  ──────                                │                         │
│  │  📊 ANÁLISIS IA                        │                         │
│  │  Talk ratio        38% / 62%          │                         │
│  │  [horizontal bar cyan/lime]            │                         │
│  │  Tono predominante  Profesional        │                         │
│  │  Keywords detect.  4                   │                         │
│  │  Calidad general   ⭐⭐⭐⭐⭐ 4.2         │                         │
│  │  ──────                                │                         │
│  │  Duración          4:21                │                         │
│  │  Negocio           Charter             │                         │
│  │  Resultado         Conversación        │                         │
│  └────────────────────────────────────────┘                         │
│                                                                    │
│  ┌─ DERECHA (2/3) ──────────────────────┐                         │
│  │  TRANSCRIPCIÓN                         │                         │
│  │  [00:00] 🧑 Xisco: Hola Marina...     │                         │
│  │  [00:08] 👤 Marina: Hola, ¿quién es?  │                         │
│  │  [00:14] 🧑 Xisco: Soy Xisco de...    │                         │
│  │  [00:32] 👤 Marina: A ver, cuéntame.  │                         │
│  │  ...                                   │                         │
│  │  Click en línea → salta al audio       │                         │
│  │  Línea activa: highlight lime          │                         │
│  └────────────────────────────────────────┘                         │
└────────────────────────────────────────────────────────────────────┘
```

### 14.5 Digest matinal (08:00)

```
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│              Buenos días, Xisco.                                   │
│              Domingo, 14 de junio                                  │
│              Mallorca · 28°C · ☀ soleado                           │
│                                                                    │
│  ┌─ HOY ────────────────────────────────────────────────────────┐ │
│  │  [número enorme, display-2xl con gradient-lime]                │ │
│  │  3 / 3   agendas                                               │ │
│  │  ── objetivo del día cumplido                                  │ │
│  │  📈 +2 vs ayer · 🔥 Racha de 7 días                            │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌─ AYER ──────────────────────────────────────────────────────┐  │
│  │  Llamadas         117    (+17% vs promedio)                   │  │
│  │  Conversaciones   25     (100% del objetivo)                  │  │
│  │  Agendas          3      (100% del objetivo)                  │  │
│  │  € Ganados        2,450                                        │  │
│  │  Mejor llamada    Marina · 4:21 · ⭐⭐⭐⭐⭐                      │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌─ SUGERENCIA DEL DÍA ───────────────────────────────────────┐  │
│  │  Tus mejores calls son entre 10:00–12:00. Empieza el día    │  │
│  │  con los 12 leads pendientes de ayer. Hoy es buen día para   │  │
│  │  cold call.                                                  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│            [Empezar el día →]                                      │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### 14.6 Settings › Apariencia

```
┌────────────────────────────────────────────────────────────────────┐
│  Settings                                                          │
│                                                                    │
│  ┌─ PERFIL ──────────┐  ┌─ APARIENCIA ───────────────────────────┐│
│  │  Foto              │  │  TEMA                                  ││
│  │  Nombre            │  │  ( ) Sistema  ( ) Oscuro  (•) Siempre ││
│  │  Email             │  │  ───                                    ││
│  │  Teléfono          │  │  ACENTO DE COLOR                        ││
│  │  Zona horaria      │  │  [Cian] [Violet] [Lime] [Amber] [Coral]││
│  └────────────────────┘  │  ───                                    ││
│                          │  DENSIDAD                               ││
│  ┌─ NOTIFICACIONES ──┐  │  ( ) Confortable  (•) Compacta          ││
│  │  [switch: Digest]  │  │  ───                                    ││
│  │  [switch: Logros]  │  │  FONDO                                  ││
│  │  [switch: Llamadas]│  │  (•) Foto Mallorca  ( ) Gradiente       ││
│  └────────────────────┘  │  ( ) Sin fondo                          ││
│                          │  [Subir foto]                           ││
│                          │  ───                                    ││
│                          │  ANIMACIONES                            ││
│                          │  [switch: Reducidas]                    ││
│                          └─────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────────────┘
```

---

## 15. Componentes del design system

Lista completa que el agente de React debe construir en `/components/ui/`. Todos con variant dark, focus ring, y estado disabled.

### Primitivos
- `<Button variant="primary|secondary|ghost|destructive" size="sm|md|lg" iconLeft iconRight>`
- `<IconButton icon variant="glass|ghost|primary" size="sm|md|lg">`
- `<Input variant="glass" size="md" iconLeft iconRight>` — con floating label opcional
- `<Textarea variant="glass">`
- `<Select variant="glass">` (Radix)
- `<Combobox variant="glass" async>` (Radix Command)
- `<MultiSelect>` (chips con remove)
- `<Checkbox variant="glass">`
- `<Radio variant="glass">`
- `<Switch variant="default|cyan|lime" size="sm|md">`
- `<Slider variant="default" trackGradient="cyan-lime">`
- `<DatePicker>` / `<DateRangePicker>`
- `<Tag variant="cyan|violet|lime|amber|coral|neutral" glow>`
- `<Avatar src fallback size="xs|sm|md|lg" statusDot>`
- `<Badge variant="cyan|violet|lime|amber|coral" pulse>`
- `<Tooltip variant="glass" position>`
- `<Pill variant="default|active" glow>` — para segmented controls

### Compuestos
- `<Card variant="glass-1|glass-2|glass-3|glass-float" glow hover>`
- `<Modal variant="glass-float" size>`
- `<Sheet position="bottom|right" variant="glass-float">`
- `<Drawer position="right" variant="glass-float">`
- `<Popover variant="glass-float">`
- `<Tabs variant="pills-glass">`
- `<SegmentedControl>` — para filtros
- `<Accordion variant="glass-1">`
- `<Toast variant="success|info|warning|error" position="top-right">`
- `<NotificationBanner variant="info|warning|error" dismissible>`
- `<EmptyState icon title description action>` — ilustración con glow
- `<Skeleton variant="text|circle|card" shimmer>`
- `<ProgressBar variant="cyan|lime" glow>`
- `<ProgressRing size="sm|md|lg|xl" gradient="cyan-lime">`
- `<Stepper>` — para onboarding
- `<KPI label value delta trend variant="default|hero" gradient>` — corazón de la app
- `<DataTable>` — columnas configurables, sort, filtros
- `<KanbanColumn>` / `<KanbanCard>` — drag & drop
- `<ActivityFeed>` — cronológico, agrupado por día
- `<Waveform>` — visualización de audio (canvas custom)
- `<NumberCounter from to duration gradient>` — count-up animado
- `<LeaderboardPodium>` — top 3 con anillos
- `<StreakRing>` — anillo de racha con días

### Sistema de feedback
- `<ConfirmDialog>` — para acciones destructivas, requiere escribir "ELIMINAR"
- `<UndoableAction>` — toast persistente con "Deshacer" 8s
- `<LoadingState>` — variantes: skeleton, spinner (giro cyan), shimmer, progress
- `<SuccessAnimation>` — check spring 450ms + glow lime pulse
- `<ConfettiBurst>` — solo en logros

---

## 16. Estados

### Loading
- **<200ms:** nada.
- **200ms-1s:** skeleton con shimmer (gradiente de izquierda a derecha, 1.5s loop).
- **>1s:** skeleton + label "Cargando…".
- **>5s:** skeleton + "Esto está tardando más de lo normal" + [Reintentar].

```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.skeleton {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.04) 0%,
    rgba(255, 255, 255, 0.08) 50%,
    rgba(255, 255, 255, 0.04) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
}
```

### Empty
Cada empty state:
1. **Ilustración** SF-Symbols-style con glow cian, 80×80px.
2. **Título** en display-sm, blanco.
3. **Descripción** 1 línea, ink-secondary.
4. **CTA principal** en btn-primary.

| Vista | Empty |
|---|---|
| Leads | "Sin leads todavía" / "Cuando un lead entre por Facebook Ads, aparecerá aquí." / [+ Nuevo lead] |
| Llamadas | "Tu primera grabación estará aquí" / "Pulsa el botón rojo en modo enfoque para empezar." / [Ir a Dialer] |
| Métricas | "Aún no hay datos" / "Las métricas aparecen tras tu primera sesión del día." |
| Pipeline | "Pipeline vacío" / "Empieza añadiendo un lead o conecta tu fuente de Facebook Ads." / [+ Lead] |

### Error
- **Inline** (validación): rojo, microcopy, sin chillar.
- **Component** (falló la carga): card glass-1, icono, mensaje, [Reintentar].
- **Page**: ilustración + "Algo ha ido mal" + [Reintentar] [Volver al inicio].
- **Catastrophic**: pantalla completa, link a status.

### Success
- Animación de check (spring 450ms) con glow lime pulse.
- Toast lime discreto: "Lead guardado".
- Para logros: confetti lime + cyan + sound opcional.

---

## 17. Responsive y breakpoints

```
sm:  640px   →  Mobile grande
md:  768px   →  Tablet portrait
lg:  1024px  →  Tablet landscape
xl:  1280px  →  Desktop estándar (bento grid principal)
2xl: 1536px  →  Desktop grande
```

### Estrategia
- **Mobile-first**, diseñar para 375px.
- **Touch targets** mínimo 44×44px.
- **Gestos** swipe-back, pull-to-refresh.
- **Bento grid** colapsa a 1 columna en mobile.
- **Sidebar** se convierte en tab bar inferior flotante con `glass-float`.

### Tabla responsive
- **Desktop:** tabla completa.
- **Tablet:** columnas menos importantes ocultas, sticky first column.
- **Mobile:** card-stack (cada fila = card vertical).

---

## 18. Accesibilidad

- **WCAG 2.2 AA** mínimo, **AAA** en números grandes y CTAs.
- **Contraste blanco sobre cristal:** verificar con axe-core, mínimo 4.5:1, ideal 7:1 para números.
- **Focus ring:** `outline: 2px solid #5DD4FF; outline-offset: 2px;` siempre visible.
- **Navegación por teclado:** Tab, Shift+Tab, Enter, Esc, flechas, ⌘K.
- **Semantic HTML** primero.
- **ARIA labels** en iconos sin texto.
- **Live regions** para toasts.
- **Skip link** en cada vista.
- **Reduced motion** respetado.

### Pruebas
- axe-core en CI
- VoiceOver / NVDA manual
- Zoom 200%

---

## 19. Setup del proyecto React

### Dependencias

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.26.0",
    "framer-motion": "^11.5.0",
    "lucide-react": "^0.445.0",
    "@radix-ui/react-dialog": "^1.1.0",
    "@radix-ui/react-popover": "^1.1.0",
    "@radix-ui/react-dropdown-menu": "^2.1.0",
    "@radix-ui/react-tabs": "^1.1.0",
    "@radix-ui/react-tooltip": "^1.1.0",
    "@radix-ui/react-select": "^2.1.0",
    "@radix-ui/react-slider": "^1.2.0",
    "@radix-ui/react-switch": "^1.1.0",
    "@radix-ui/react-progress": "^1.1.0",
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "@tanstack/react-query": "^5.59.0",
    "@tanstack/react-table": "^8.20.0",
    "zustand": "^4.5.0",
    "recharts": "^2.12.0",
    "sonner": "^1.5.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.5.0",
    "date-fns": "^4.1.0"
  },
  "devDependencies": {
    "vite": "^5.4.0",
    "@vitejs/plugin-react": "^4.3.0",
    "typescript": "^5.5.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0"
  }
}
```

### Estructura de carpetas

```
src/
├── app/
│   ├── App.tsx
│   ├── router.tsx
│   └── providers.tsx
├── components/
│   ├── ui/              # Primitivos (Button, Card, Input, etc.)
│   ├── layout/          # AppShell, Sidebar, TopBar, TabBar
│   ├── dashboard/       # HeroCard, KPI, ActivityFeed, etc.
│   ├── charter/         # Pipeline, LeadCard
│   ├── sdr/             # Dialer, Leaderboard
│   ├── calls/           # Waveform, Transcript
│   └── shared/          # EmptyState, ErrorBoundary
├── features/
│   ├── auth/
│   ├── leads/
│   ├── calls/
│   └── digest/
├── hooks/
│   ├── useCountUp.ts
│   ├── useTheme.ts
│   └── useReducedMotion.ts
├── lib/
│   ├── utils.ts         # cn() helper
│   ├── api.ts
│   └── constants.ts
├── motion/
│   ├── presets.ts
│   └── transitions.ts
├── stores/
│   ├── themeStore.ts
│   └── sessionStore.ts
├── styles/
│   ├── globals.css      # CSS vars, glassmorphism, fondo
│   └── tokens.css
├── types/
└── utils/
```

### Comandos de setup
```bash
npm create vite@latest mission-control -- --template react-ts
cd mission-control
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
# ... añadir deps de la sección anterior
```

---

## 20. Tokens y configuración Tailwind

### `tailwind.config.ts`

```ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',  // dark es el único modo
  theme: {
    extend: {
      colors: {
        ink: {
          primary: '#FFFFFF',
          secondary: 'rgba(255, 255, 255, 0.7)',
          tertiary: 'rgba(255, 255, 255, 0.45)',
          quaternary: 'rgba(255, 255, 255, 0.25)',
          inverse: '#0A0C12',
        },
        glass: {
          1: 'rgba(20, 22, 30, 0.55)',
          2: 'rgba(28, 32, 42, 0.65)',
          3: 'rgba(35, 40, 52, 0.75)',
          float: 'rgba(18, 20, 28, 0.72)',
        },
        accent: {
          cyan: { DEFAULT: '#5DD4FF', soft: 'rgba(93, 212, 255, 0.15)', glow: 'rgba(93, 212, 255, 0.4)' },
          lime: { DEFAULT: '#C4F542', soft: 'rgba(196, 245, 66, 0.18)', glow: 'rgba(196, 245, 66, 0.4)' },
          violet: { DEFAULT: '#A78BFA', soft: 'rgba(167, 139, 250, 0.15)', glow: 'rgba(167, 139, 250, 0.4)' },
          amber: { DEFAULT: '#FCD34D', soft: 'rgba(252, 211, 77, 0.15)', glow: 'rgba(252, 211, 77, 0.4)' },
          coral: { DEFAULT: '#F87171', soft: 'rgba(248, 113, 113, 0.15)', glow: 'rgba(248, 113, 113, 0.4)' },
        },
        success: '#34D399',
        warning: '#FBBF24',
        danger: '#F87171',
        info: '#60A5FA',
        premium: '#C4F542',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'SF Pro Display', 'Segoe UI', 'system-ui', 'sans-serif'],
        display: ['Inter', '-apple-system', 'SF Pro Display', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Roboto Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'display-3xl': ['96px', { lineHeight: '1', letterSpacing: '-0.04em', fontWeight: '300' }],
        'display-2xl': ['72px', { lineHeight: '1', letterSpacing: '-0.035em', fontWeight: '300' }],
        'display-xl':  ['56px', { lineHeight: '1.05', letterSpacing: '-0.03em', fontWeight: '400' }],
        'display-lg':  ['44px', { lineHeight: '1.1', letterSpacing: '-0.025em', fontWeight: '400' }],
        'display-md':  ['36px', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '500' }],
        'display-sm':  ['28px', { lineHeight: '1.2', letterSpacing: '-0.015em', fontWeight: '500' }],
        'heading-lg':  ['22px', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '500' }],
        'heading-md':  ['18px', { lineHeight: '1.35', letterSpacing: '-0.005em', fontWeight: '500' }],
        'heading-sm':  ['15px', { lineHeight: '1.4', letterSpacing: '0', fontWeight: '600' }],
        'body-lg':     ['17px', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
        'body':        ['15px', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
        'body-sm':     ['14px', { lineHeight: '1.45', letterSpacing: '0', fontWeight: '400' }],
        'caption':     ['13px', { lineHeight: '1.4', letterSpacing: '0.01em', fontWeight: '500' }],
        'micro':       ['11px', { lineHeight: '1.3', letterSpacing: '0.05em', fontWeight: '600' }],
      },
      spacing: {
        '18': '72px', '22': '88px', '26': '104px',
      },
      borderRadius: {
        'glass': '20px',
        'glass-lg': '24px',
        'glass-xl': '28px',
      },
      backdropBlur: {
        'glass-sm': '16px',
        'glass': '24px',
        'glass-lg': '32px',
        'glass-xl': '48px',
      },
      boxShadow: {
        'glass-sm': '0 4px 12px rgba(0, 0, 0, 0.25), 0 1px 2px rgba(0, 0, 0, 0.15)',
        'glass':    '0 12px 32px rgba(0, 0, 0, 0.4), 0 2px 6px rgba(0, 0, 0, 0.2)',
        'glass-lg': '0 24px 60px rgba(0, 0, 0, 0.55), 0 4px 12px rgba(0, 0, 0, 0.25)',
        'glass-xl': '0 40px 100px rgba(0, 0, 0, 0.7), 0 8px 20px rgba(0, 0, 0, 0.3)',
        'glow-cyan':   '0 0 24px rgba(93, 212, 255, 0.4), 0 0 8px rgba(93, 212, 255, 0.2)',
        'glow-lime':   '0 0 24px rgba(196, 245, 66, 0.4), 0 0 8px rgba(196, 245, 66, 0.2)',
        'glow-violet': '0 0 24px rgba(167, 139, 250, 0.4), 0 0 8px rgba(167, 139, 250, 0.2)',
      },
      transitionTimingFunction: {
        'standard':   'cubic-bezier(0.4, 0, 0.2, 1)',
        'decelerate': 'cubic-bezier(0, 0, 0.2, 1)',
        'accelerate': 'cubic-bezier(0.4, 0, 1, 1)',
        'spring':     'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'emphasized': 'cubic-bezier(0.2, 0, 0, 1)',
        'bouncy':     'cubic-bezier(0.68, -0.55, 0.27, 1.55)',
      },
      backgroundImage: {
        'gradient-cyan':   'linear-gradient(135deg, #5DD4FF 0%, #3B82F6 100%)',
        'gradient-lime':   'linear-gradient(135deg, #C4F542 0%, #84CC16 100%)',
        'gradient-violet': 'linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)',
        'gradient-amber':  'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
        'gradient-danger': 'linear-gradient(135deg, #F87171 0%, #DC2626 100%)',
        'gradient-hero':   'linear-gradient(135deg, #FFFFFF 0%, #5DD4FF 100%)',
        'gradient-hero-lime': 'linear-gradient(135deg, #FFFFFF 0%, #C4F542 100%)',
        'gradient-mesh':
          'radial-gradient(ellipse 80% 60% at 20% 10%, #0a1a2e 0%, transparent 60%),' +
          'radial-gradient(ellipse 60% 80% at 90% 90%, #1a0a2e 0%, transparent 60%),' +
          'radial-gradient(ellipse 100% 100% at 50% 50%, #050810 0%, #000 100%)',
      },
      animation: {
        'shimmer': 'shimmer 1.5s infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'recording-pulse': 'recording-pulse 1.5s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(93, 212, 255, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(93, 212, 255, 0.6)' },
        },
        'recording-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(248, 113, 113, 0.7)' },
          '50%': { boxShadow: '0 0 0 16px rgba(248, 113, 113, 0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
} satisfies Config;
```

### `src/styles/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    color-scheme: dark;
  }
  html, body {
    @apply bg-[#050810] text-ink-primary font-sans antialiased;
    font-feature-settings: 'cv11', 'ss01', 'ss03';  /* Inter stylistic alternates */
  }
  body {
    min-height: 100vh;
    overflow-x: hidden;
  }
  /* Tabular nums por defecto en tablas/charts */
  .tabular-nums { font-variant-numeric: tabular-nums; }
  /* Focus ring global */
  :focus-visible {
    outline: 2px solid #5DD4FF;
    outline-offset: 2px;
    border-radius: 8px;
  }
}

@layer components {
  /* === GLASS SYSTEM === */
  .glass-1 {
    @apply bg-glass-1 border border-white/8 backdrop-blur-glass shadow-glass rounded-glass;
  }
  .glass-2 {
    @apply bg-glass-2 border border-white/8 backdrop-blur-glass-lg shadow-glass-lg rounded-glass-lg;
  }
  .glass-3 {
    @apply bg-glass-3 border border-white/10 backdrop-blur-glass-xl shadow-glass-xl rounded-glass-xl;
  }
  .glass-float {
    @apply bg-glass-float border border-white/8 backdrop-blur-glass-xl shadow-glass-lg rounded-glass-lg;
  }

  /* === HIGHLIGHT ESPECULAR (en todos los cristakes) === */
  .glass-1::before, .glass-2::before, .glass-3::before, .glass-float::before {
    content: '';
    position: absolute;
    top: 0; left: 8%; right: 8%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    pointer-events: none;
    border-radius: inherit;
  }
  /* Para que el ::before se vea, el container necesita position relative */
  .glass-1, .glass-2, .glass-3, .glass-float { position: relative; }

  /* === FONDOS === */
  .bg-app-mesh {
    background: radial-gradient(ellipse 80% 60% at 20% 10%, #0a1a2e 0%, transparent 60%),
                radial-gradient(ellipse 60% 80% at 90% 90%, #1a0a2e 0%, transparent 60%),
                radial-gradient(ellipse 100% 100% at 50% 50%, #050810 0%, #000 100%);
  }

  /* === BOTONES === */
  .btn-primary {
    @apply px-6 py-3 rounded-full font-semibold text-ink-inverse
           bg-gradient-cyan border border-white/20
           shadow-[0_0_24px_rgba(93,212,255,0.4),0_8px_20px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.3)]
           transition-all duration-200 ease-standard
           hover:-translate-y-0.5 hover:shadow-[0_0_32px_rgba(93,212,255,0.5),0_12px_24px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.4)]
           active:translate-y-0;
  }
  .btn-secondary {
    @apply px-6 py-3 rounded-full font-medium text-ink-primary
           bg-white/8 backdrop-blur-glass-sm border border-white/12
           shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]
           transition-all duration-200 ease-standard
           hover:bg-white/12 hover:border-white/20;
  }
  .btn-ghost {
    @apply px-4 py-2.5 rounded-full text-white/70
           transition-all duration-150
           hover:bg-white/6 hover:text-ink-primary;
  }
  .btn-destructive {
    @apply px-6 py-3 rounded-full font-semibold text-ink-primary
           bg-gradient-danger
           shadow-[0_0_20px_rgba(248,113,113,0.3),0_8px_20px_rgba(0,0,0,0.3)]
           transition-all duration-200;
  }

  /* === INPUTS === */
  .input-glass {
    @apply bg-white/5 backdrop-blur-glass-sm border border-white/10
           rounded-xl px-4 py-3 text-ink-primary placeholder:text-white/30
           transition-all duration-200
           focus:outline-none focus:border-accent-cyan focus:bg-white/8
           focus:shadow-[0_0_0_4px_rgba(93,212,255,0.15)];
  }

  /* === PILLS === */
  .pill {
    @apply inline-flex items-center gap-1.5 px-3.5 py-1.5
           bg-white/6 border border-white/8 rounded-full
           text-caption text-white/70
           transition-all duration-150;
  }
  .pill-active {
    @apply bg-gradient-cyan border-accent-cyan/40 text-ink-inverse
           font-semibold shadow-glow-cyan;
  }
  .pill-lime.pill-active {
    @apply bg-gradient-lime shadow-glow-lime;
  }
}

@layer utilities {
  .text-gradient-cyan {
    @apply bg-gradient-to-br from-white to-accent-cyan bg-clip-text text-transparent;
  }
  .text-gradient-lime {
    @apply bg-gradient-to-br from-white to-accent-lime bg-clip-text text-transparent;
  }
  .text-gradient-violet {
    @apply bg-gradient-to-br from-white to-accent-violet bg-clip-text text-transparent;
  }
  .text-balance { text-wrap: balance; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 21. Snippets React listos para producción

### `<AppShell>` — Layout root con fondo atmosférico

```tsx
// components/layout/AppShell.tsx
import { ReactNode } from 'react';
import { motion } from 'framer-motion';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen relative bg-app-mesh">
      {/* Fondo fotográfico opcional (comentado) */}
      {/* <div className="fixed inset-0 -z-10 bg-[url('/bg-mallorca.jpg')] bg-cover bg-center opacity-30 blur-3xl" /> */}

      {/* Grid de ruido sutil */}
      <div
        className="fixed inset-0 -z-10 opacity-[0.03] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-20 lg:ml-60 min-h-screen">
          <TopBar />
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] }}
            className="p-6 lg:p-10 max-w-[1600px] mx-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
```

### `<Sidebar>` — Flotante cristal

```tsx
// components/layout/Sidebar.tsx
import { motion } from 'framer-motion';
import { Home, Sun, Phone, Anchor, PhoneOutgoing, BarChart3, Trophy, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const items = [
  { icon: Home, label: 'Dashboard', path: '/' },
  { icon: Sun, label: 'Hoy', path: '/today' },
  { icon: Phone, label: 'Llamadas', path: '/calls' },
  { divider: true },
  { icon: Anchor, label: 'Charter', path: '/charter', color: 'cyan' },
  { icon: PhoneOutgoing, label: 'SDR', path: '/sdr', color: 'violet' },
  { divider: true },
  { icon: BarChart3, label: 'Métricas', path: '/metrics' },
  { icon: Trophy, label: 'Logros', path: '/achievements' },
  { divider: true },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function Sidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="fixed left-4 top-4 bottom-4 w-16 lg:w-56 z-30">
      <div className="glass-float h-full p-3 lg:p-5 flex flex-col gap-1">
        {/* Logo */}
        <div className="h-12 flex items-center justify-center lg:justify-start mb-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-cyan shadow-glow-cyan flex items-center justify-center">
            <span className="text-ink-inverse font-bold text-lg">M</span>
          </div>
          <span className="hidden lg:block ml-3 text-ink-primary font-semibold">Mission</span>
        </div>

        {items.map((item, i) =>
          item.divider ? (
            <div key={i} className="h-px bg-white/8 my-2" />
          ) : (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                'text-white/60 hover:text-ink-primary hover:bg-white/6',
                pathname === item.path && 'text-ink-primary'
              )}
            >
              {pathname === item.path && (
                <motion.div
                  layoutId="active-nav"
                  className="absolute inset-0 bg-white/10 border border-white/12 rounded-xl shadow-glow-cyan"
                  transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                />
              )}
              <item.icon
                size={20}
                strokeWidth={1.75}
                className={cn(
                  'relative z-10 shrink-0',
                  pathname === item.path && 'text-accent-cyan'
                )}
                style={
                  item.color === 'cyan' && pathname === item.path
                    ? { color: '#5DD4FF' }
                    : item.color === 'violet' && pathname === item.path
                    ? { color: '#A78BFA' }
                    : undefined
                }
              />
              <span className="hidden lg:block relative z-10 text-sm font-medium">{item.label}</span>
            </Link>
          )
        )}
      </div>
    </aside>
  );
}
```

### `<KPI>` — Card con número animado

```tsx
// components/dashboard/KPI.tsx
import { motion } from 'framer-motion';
import { useCountUp } from '@/hooks/useCountUp';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPIProps {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  delta?: { value: number; positive: boolean };
  variant?: 'default' | 'hero';
  gradient?: 'cyan' | 'lime' | 'violet';
}

export function KPI({ label, value, suffix, prefix, delta, variant = 'default', gradient = 'cyan' }: KPIProps) {
  const display = useCountUp(value, 1.2);
  const isHero = variant === 'hero';
  const gradientClass = {
    cyan: 'text-gradient-cyan',
    lime: 'text-gradient-lime',
    violet: 'text-gradient-violet',
  }[gradient];

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className={cn(
        'relative p-6 lg:p-8',
        isHero ? 'glass-3' : 'glass-1'
      )}
    >
      <div className="text-micro uppercase text-ink-tertiary mb-3 tracking-wider">{label}</div>
      <div className="flex items-baseline gap-2">
        {prefix && <span className="text-display-md text-ink-secondary">{prefix}</span>}
        <span className={cn(isHero ? 'text-display-2xl' : 'text-display-lg', 'tabular-nums', gradientClass)}>
          {display.toLocaleString('es-ES')}
        </span>
        {suffix && <span className="text-body text-ink-tertiary">{suffix}</span>}
      </div>
      {delta && (
        <div className={cn(
          'mt-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-caption font-medium',
          delta.positive ? 'bg-accent-lime-soft text-accent-lime' : 'bg-accent-coral-soft text-accent-coral'
        )}>
          {delta.positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {delta.value}%
        </div>
      )}
    </motion.div>
  );
}
```

### `<Waveform>` — Audio canvas con playback

```tsx
// components/calls/Waveform.tsx
import { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipBack, Volume2 } from 'lucide-react';

export function Waveform({ src, duration }: { src: string; duration: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [speed, setSpeed] = useState(1);

  // Generar waveform mock (en real, decodificar audio y muestrear)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width = canvas.offsetWidth * 2;
    const h = canvas.height = canvas.offsetHeight * 2;

    const bars = 200;
    const barWidth = w / bars;
    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < bars; i++) {
      const height = Math.abs(Math.sin(i * 0.3) * 40 + Math.random() * 30);
      const x = i * barWidth;
      const y = h / 2 - height;
      const isPast = (i / bars) * 100 < progress;
      ctx.fillStyle = isPast
        ? 'url(#wfGradient)'
        : 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth - 2, height * 2, 4);
      ctx.fill();
    }
  }, [progress]);

  const toggle = () => {
    if (audioRef.current) {
      isPlaying ? audioRef.current.pause() : audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="glass-1 p-6">
      <audio ref={audioRef} src={src} onTimeUpdate={(e) => setProgress((e.currentTarget.currentTime / duration) * 100)} />
      <canvas ref={canvasRef} className="w-full h-32 mb-4" />
      <div className="flex items-center gap-3">
        <button className="btn-icon"><SkipBack size={18} /></button>
        <button onClick={toggle} className="btn-primary !p-3 !rounded-full">
          {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
        </button>
        <span className="text-caption tabular-nums text-ink-secondary ml-2">
          {Math.floor((progress / 100) * duration / 60)}:{String(Math.floor((progress / 100) * duration % 60)).padStart(2, '0')}
          {' / '}
          {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}
        </span>
        <div className="ml-auto flex items-center gap-3">
          <Volume2 size={16} className="text-ink-tertiary" />
          <input type="range" min={0} max={1} step={0.05} value={volume} onChange={(e) => setVolume(+e.target.value)} className="w-24" />
          <select value={speed} onChange={(e) => setSpeed(+e.target.value)} className="input-glass !py-1 !px-2 text-caption">
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={1.5}>1.5x</option>
            <option value={2}>2x</option>
          </select>
        </div>
      </div>
    </div>
  );
}
```

### `<AnimatedChart>` — Línea Bézier con gradiente

```tsx
// components/dashboard/AnimatedChart.tsx
import { motion } from 'framer-motion';

const data = [
  { day: 'Mar', value: 45 },
  { day: 'Mié', value: 62 },
  { day: 'Jue', value: 58 },
  { day: 'Vie', value: 78 },
  { day: 'Sáb', value: 92 },
  { day: 'Dom', value: 65 },
  { day: 'Lun', value: 117 },
];

export function AnimatedChart() {
  const max = Math.max(...data.map(d => d.value));
  const w = 600, h = 240, pad = 20;
  const xStep = (w - pad * 2) / (data.length - 1);

  // Build smooth Bézier path
  const points = data.map((d, i) => [pad + i * xStep, h - pad - (d.value / max) * (h - pad * 2)]);
  const linePath = points.reduce((acc, [x, y], i, arr) => {
    if (i === 0) return `M ${x} ${y}`;
    const [px, py] = arr[i - 1];
    const cx = (px + x) / 2;
    return `${acc} C ${cx} ${py}, ${cx} ${y}, ${x} ${y}`;
  }, '');
  const areaPath = `${linePath} L ${points[points.length - 1][0]} ${h - pad} L ${points[0][0]} ${h - pad} Z`;

  return (
    <div className="glass-1 p-6 lg:p-8">
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <div className="text-micro uppercase text-ink-tertiary mb-1">Actividad últimos 7 días</div>
          <div className="text-display-md text-ink-primary tabular-nums">
            {data.reduce((a, b) => a + b.value, 0)} <span className="text-body text-ink-tertiary">llamadas</span>
          </div>
        </div>
        <div className="flex gap-1">
          <span className="pill pill-active text-caption">7D</span>
          <span className="pill text-caption">30D</span>
          <span className="pill text-caption">90D</span>
        </div>
      </div>

      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none" style={{ height: 240 }}>
        <defs>
          <linearGradient id="lineGradient" x1="0" x2="1">
            <stop offset="0%" stopColor="#5DD4FF" />
            <stop offset="100%" stopColor="#C4F542" />
          </linearGradient>
          <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#5DD4FF" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#5DD4FF" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map(t => (
          <line key={t} x1={pad} x2={w - pad} y1={pad + t * (h - pad * 2)} y2={pad + t * (h - pad * 2)} stroke="rgba(255,255,255,0.05)" strokeDasharray="2,4" />
        ))}

        {/* Area + Line */}
        <motion.path d={areaPath} fill="url(#areaGradient)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} />
        <motion.path
          d={linePath}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          filter="drop-shadow(0 0 6px rgba(93,212,255,0.5))"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: [0.2, 0, 0, 1] }}
        />

        {/* Points */}
        {points.map(([x, y], i) => (
          <motion.circle
            key={i}
            cx={x} cy={y} r="4"
            fill="#0A0C12" stroke="#5DD4FF" strokeWidth="2"
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 + i * 0.05, type: 'spring' }}
          />
        ))}

        {/* X axis labels */}
        {data.map((d, i) => (
          <text key={i} x={pad + i * xStep} y={h - 4} fill="rgba(255,255,255,0.4)" fontSize="11" textAnchor="middle" className="font-sans">
            {d.day}
          </text>
        ))}
      </svg>
    </div>
  );
}
```

---

## 22. Hoja de ruta de implementación

### Sprint 1 — Cimientos (3-4 días)
1. Setup Vite + React + TS + Tailwind + Framer Motion.
2. Configurar `tailwind.config.ts` y `globals.css` con todos los tokens y cristales.
3. Crear `<AppShell>` con fondo mesh + grid noise.
4. Crear `<Sidebar>` flotante con `glass-float`.
5. Crear `<TopBar>` con glass-float.
6. Instalar Inter, configurar variables CSS.

### Sprint 2 — Design system base (3-4 días)
7. Primitivos: Button, IconButton, Input, Textarea, Select, Switch, Slider.
8. Componentes layout: Card (glass-1/2/3), Modal, Sheet, Drawer, Popover, Tooltip.
9. Pills, Tags, Avatars, Badges.
10. Sistema de notificaciones: Toast (Sonner) configurado en dark.
11. Empty states + Skeletons.
12. Storybook o Vitest + Histoire.

### Sprint 3 — Dashboard (4-5 días)
13. Hero card "Today's Mission" con número enorme animado.
14. Componentes KPI (con `useCountUp`).
15. `<AnimatedChart>` con línea Bézier + área.
16. Cards de negocio (Charter, SDR) con glow de color.
17. Activity feed con timestamps.
18. Leaderboard con StreakRing.

### Sprint 4 — Charter (3-4 días)
19. Pipeline Kanban con `@dnd-kit`.
20. Lead cards en columnas.
21. Drawer de detalle de lead.
22. Filtros y búsqueda.

### Sprint 5 — SDR (3-4 días)
23. Modo enfoque (fullscreen, sin sidebar).
24. Dialer UI con progress bars.
25. Botón de grabación con `recording-pulse`.
26. Leaderboard con podium.
27. Sheet post-llamada (resultado, estrellas, notas).

### Sprint 6 — Llamadas (3-4 días)
28. `<Waveform>` con canvas.
29. Reproductor con controles.
30. Transcripción sincronizada.
31. Panel de análisis IA.
32. Drag & drop para subir audio.

### Sprint 7 — Digest y Polish (2-3 días)
33. Vista digest matinal con count-up.
34. Settings completos (tema, acento, fondo, densidad).
35. Onboarding (3 pasos).
36. Audit de accesibilidad, performance, motion.

### Criterios de "Hecho" por pantalla
- [ ] Responsive: mobile, tablet, desktop
- [ ] Solo dark mode
- [ ] Cristales con highlight especular visible
- [ ] Números grandes con gradient-cyan o gradient-lime
- [ ] Estados: loading skeleton con shimmer, empty con glow, error, success
- [ ] Focus ring cian visible
- [ ] Animaciones spring (damping 28-32)
- [ ] Reduced motion respetado
- [ ] Contraste AA verificado
- [ ] Performance: <100ms TTI, <2.5s LCP
- [ ] Sin `console.log` ni warnings

---

## 23. Checklist de calidad visual

Antes de declarar una vista "lista", verificar:

### Cristal
- [ ] El card tiene `glass-1`, `glass-2`, `glass-3` o `glass-float` aplicado
- [ ] El `::before` con highlight especular es visible en el borde superior
- [ ] El `backdrop-filter` está aplicado y funciona
- [ ] La sombra externa es visible y coherente con la capa Z

### Color
- [ ] Números grandes en `text-gradient-cyan` o `text-gradient-lime`
- [ ] CTAs primarios en `btn-primary` con glow
- [ ] Sin acentos compitiendo (max 1 acento visible por zona)
- [ ] Contraste blanco/cristal verificado

### Tipografía
- [ ] Display sizes para números grandes (44px+)
- [ ] Números en `tabular-nums`
- [ ] Eyebrows en UPPERCASE micro
- [ ] Line-height display 1.0-1.1, body 1.5

### Motion
- [ ] Hover en cards con spring (y: -3)
- [ ] Count-up en KPIs (1.2s, ease emphasized)
- [ ] Modales/sheets con spring damping 32
- [ ] Glow pulse solo en estados en vivo

### Estados
- [ ] Loading: skeleton con shimmer
- [ ] Empty: ilustración con glow + CTA
- [ ] Error: card con icono + retry
- [ ] Success: check spring + glow lime

### Responsive
- [ ] Mobile: tab bar flotante reemplaza sidebar
- [ ] Tablet: bento grid se ajusta
- [ ] Desktop: layout completo
- [ ] Touch targets ≥44px

### Accesibilidad
- [ ] Focus ring cian visible
- [ ] ARIA labels en iconos
- [ ] Skip link presente
- [ ] Reduced motion respetado
- [ ] Contraste WCAG AA mínimo

---

> **Última nota para el agente de React:** este es un producto **premium**. Cada detalle cuenta. La diferencia entre un diseño "bueno" y uno "wow" está en:
> - Que el highlight especular se vea en el borde del cristal.
> - Que el número del hero se anime con count-up + gradient.
> - Que el sidebar flote sobre el fondo con sombra visible.
> - Que el chart entre con `pathLength: 0 → 1` en 1.5s.
> - Que el empty state tenga un icono con glow cian.
> - Que el switch on tenga glow cian.
>
> Si cualquiera de esos detalles falta, el producto se siente "de 2019" y no "de 2026". Cuida los detalles.
