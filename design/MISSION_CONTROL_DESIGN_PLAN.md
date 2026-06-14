# Mission Control — Design System & UI Plan
### Basado en Apple Human Interface Guidelines (HIG) · Liquid Glass (iOS 26)

> **Producto:** Mission control unificado para Xisco (Iron Monkey Charter + Growing Inmobiliario).
> **Stack objetivo:** React 18+ (Vite o Next.js) + Tailwind CSS + Framer Motion.
> **Inspiración:** Apple HIG, Liquid Glass, visionOS, SF Pro, Apple News, Apple Music.
> **Filosofía:** *"La mejor interfaz es la que desaparece. Lo que queda es la información, el ritmo y el control."*

---

## Tabla de contenidos
1. [Principios fundacionales](#1-principios-fundacionales)
2. [Identidad visual](#2-identidad-visual)
3. [Sistema tipográfico](#3-sistema-tipográfico)
4. [Color y semántica](#4-color-y-semántica)
5. [Espaciado, radios y grid](#5-espaciado-radios-y-grid)
6. [Material Liquid Glass (web)](#6-material-liquid-glass-web)
7. [Motion y micro-interacciones](#7-motion-y-micro-interacciones)
8. [Iconografía (SF Symbols style)](#8-iconografía-sf-symbols-style)
9. [Arquitectura de información](#9-arquitectura-de-información)
10. [Navegación global](#10-navegación-global)
11. [Pantallas principales](#11-pantallas-principales)
12. [Componentes reutilizables](#12-componentes-reutilizables)
13. [Estados, vacíos, errores](#13-estados-vacíos-errores)
14. [Modo oscuro](#14-modo-oscuro)
15. [Accesibilidad](#15-accesibilidad)
16. [Responsive y breakpoints](#16-responsive-y-breakpoints)
17. [Glosario de tokens (para Tailwind)](#17-glosario-de-tokens-para-tailwind)
18. [Hoja de ruta de implementación](#18-hoja-de-ruta-de-implementación)

---

## 1. Principios fundacionales

Aplicamos los **cuatro pilares de HIG** y añadimos tres reglas propias del producto:

### Los 4 pilares Apple
| Principio | Significado | Aplicación concreta |
|---|---|---|
| **Claridad** | Limpio, preciso, sin ruido | Una sola acción primaria por pantalla. Sin sombras decorativas. Sin gradientes donde no aportan. |
| **Consistencia** | Elementos estándar y predecibles | Mismo botón, mismo gesto, misma jerarquía en toda la app. Componentes centralizados. |
| **Deferencia (Deference)** | La UI se aparta; el contenido brilla | Tipografía grande, mucho aire, animaciones que celebran el contenido (no la chrome). |
| **Profundidad (Depth)** | Capas, sombras, motion con propósito | Liquid Glass para jerarquía. Sombras suaves para elevación. Transiciones que enseñan relaciones espaciales. |

### Las 3 reglas de Mission Control
1. **Dato > Decoración.** Si un elemento no aporta información o no habilita una acción, se quita.
2. **Un segundo para entender.** Cualquier pantalla debe comunicar su propósito en 1s. Si no, se rediseña.
3. **Emoción contenida.** Animaciones elegantes, nunca espectaculares. La elegancia es la ausencia de exceso.

### Anti-patrones prohibidos
- Sombras duras, glows neón, gradientes radiales chillones.
- Texto en mayúsculas como decoración.
- Botones con doble estado (relleno + borde) salvo casos justificados.
- Modales sobre modales.
- Confirmaciones destructivas sin deshacer.

---

## 2. Identidad visual

### Personalidad
**"Quiet Luxury Operativo"** — Como un Apple Watch Ultra visto a las 7 de la mañana, con la luz entrando por la ventana de un local en Mallorca. Limpio, denso en información cuando toca, silencioso cuando no.

### Tono
- Técnico cuando se trata de datos (cifras, métricas, comisiones).
- Humano cuando se trata de acción (un lead, una llamada, una agenda).
- Nunca infantil. Nunca corporativo-gris.

### Lenguaje
- ES-ES por defecto. Sin anglicismos forzados.
- Verbos en imperativo suave: *"Revisar", "Programar", "Cerrar"*.
- Números grandes, unidades pequeñas (`3 / 5 agendas`, `117 llamadas hoy`).

---

## 3. Sistema tipográfico

Familia: **Inter** (open source, drop-in replacement perfecto de SF Pro) o **SF Pro** si está disponible bajo licencia. Fallback: `system-ui, -apple-system, "Segoe UI", Roboto`.

> Nota: SF Pro no es redistribuible comercialmente sin licencia. **Recomendación:** usar **Inter** (gratis, idéntica en métricas) o **Geist** (Vercel, más moderna). Cargadas vía `@font-face` con `font-display: swap`.

### Escala tipográfica (basada en HIG iOS)

| Token | Tamaño | Peso | Line-height | Letter-spacing | Uso |
|---|---|---|---|---|---|
| `display-2xl` | 72px | 700 | 1.05 | -0.04em | Hero KPIs, pantalla digest matinal |
| `display-xl` | 56px | 700 | 1.05 | -0.035em | Números grandes de cierre |
| `display-lg` | 44px | 600 | 1.1 | -0.03em | Métrica principal de sección |
| `display-md` | 36px | 600 | 1.15 | -0.025em | Títulos de vista |
| `title-1` | 28px | 600 | 1.2 | -0.02em | Header de pantalla |
| `title-2` | 22px | 600 | 1.25 | -0.015em | Subtítulos de sección |
| `title-3` | 20px | 600 | 1.3 | -0.01em | Card title |
| `headline` | 17px | 600 | 1.4 | -0.005em | Fila de tabla, lista |
| `body` | 17px | 400 | 1.5 | 0 | Texto corrido |
| `callout` | 16px | 400 | 1.45 | 0 | Descripción, metadata |
| `subhead` | 15px | 400 | 1.4 | 0 | Texto secundario |
| `footnote` | 13px | 400 | 1.35 | 0 | Etiquetas, tags |
| `caption-1` | 12px | 500 | 1.3 | 0.01em | Status, badges |
| `caption-2` | 11px | 500 | 1.3 | 0.02em | Microcopy, axis labels |
| `mono-sm` | 13px | 500 | 1.4 | 0 | IDs, SKUs, timestamps |

### Reglas de oro tipográficas
- **Títulos:** nunca truncados, máximo 2 líneas con `line-clamp-2`.
- **Cuerpo:** máximo 65-75 caracteres por línea.
- **Números:** usar `font-variant-numeric: tabular-nums` en tablas y KPIs.
- **Capitalización:** Title Case para títulos ES (`Resumen del Día`), sentence case para el resto.
- **Alineación:** números siempre alineados a la derecha con `text-right` y `tabular-nums`.

---

## 4. Color y semántica

### Paleta base — Modo claro

| Token | Hex | Uso |
|---|---|---|
| `--bg-canvas` | `#FAFAFA` | Fondo de la app (off-white Apple-style) |
| `--bg-surface` | `#FFFFFF` | Cards, modales, sheets |
| `--bg-elevated` | `#FFFFFF` + sombra | Modales, popovers |
| `--bg-tint` | `#F2F2F7` | iOS-style grouped background, inputs |
| `--bg-tint-2` | `#E5E5EA` | Hover, pressed states |
| `--separator` | `rgba(60,60,67,0.12)` | Bordes 1px, hairlines |
| `--separator-opaque` | `#C6C6C8` | Bordes de cards sobre fondo tint |

### Tinta (texto)

| Token | Hex | Uso |
|---|---|---|
| `--label-primary` | `#1C1C1E` | Texto principal |
| `--label-secondary` | `rgba(60,60,67,0.7)` | Texto secundario |
| `--label-tertiary` | `rgba(60,60,67,0.5)` | Hints, placeholders |
| `--label-quaternary` | `rgba(60,60,67,0.3)` | Disabled |
| `--label-inverse` | `#FFFFFF` | Texto sobre fondo oscuro |

### Acento de marca

| Token | Hex | Significado |
|---|---|---|
| `--accent` | `#0A84FF` | Azul Apple (light mode: `#007AFF`) — acción primaria |
| `--accent-hover` | `#0066CC` | Pressed |
| `--accent-soft` | `rgba(10,132,255,0.12)` | Tints, badges, focus rings |

### Semánticos (estados)

| Token | Light | Significado |
|---|---|---|
| `--success` | `#30D158` | Agenda cerrada, lead ganado |
| `--warning` | `#FF9F0A` | Llamada pendiente, objetivo al 70% |
| `--danger` | `#FF3B30` | Pérdida, error destructivo |
| `--info` | `#5AC8FA` | Neutral informativo |
| `--premium` | `#BF5AF2` | Highlight, gamificación (logros) |

### Colores por negocio (código de color suave)

Para que Mission Control muestre dos negocios sin gritar:

| Negocio | Light | Dark | Uso |
|---|---|---|---|
| Iron Monkey (charter) | `#0891B2` cyan-600 | `#22D3EE` cyan-400 | Logo pequeño, dot de color en filas |
| Growing (SDR) | `#7C3AED` violet-600 | `#A78BFA` violet-400 | Mismo patrón |

> **Regla:** el color de negocio solo aparece como **dot de 8px** o **borde izquierdo de 3px** en cards. Nunca como fondo completo.

### Modo oscuro — Mapeo directo

| Light | Dark |
|---|---|
| `#FAFAFA` canvas | `#000000` canvas (true black OLED-friendly) |
| `#FFFFFF` surface | `#1C1C1E` surface |
| `#F2F2F7` tint | `#2C2C2E` tint |
| `#E5E5EA` tint-2 | `#3A3A3C` tint-2 |
| `rgba(60,60,67,0.12)` sep | `rgba(84,84,88,0.65)` sep |
| `#1C1C1E` label | `#FFFFFF` label |
| `#0A84FF` accent | `#0A84FF` accent (mismo, Apple mantiene acento) |

### Reglas de uso del color
- **Nunca** usar color para texto <13px (usar label-primary/secondary).
- **Semánticos** solo en dot, badge o icono. Nunca como fondo grande.
- **Acento** solo en CTA primario, focus ring, link. Máximo 1 acento visible por vista.
- **Contraste mínimo:** AA (4.5:1) en texto, AAA (7:1) en texto principal. Verificar con axe.

---

## 5. Espaciado, radios y grid

### Escala de espaciado (múltiplos de 4 — Apple-style)

| Token | px | Uso |
|---|---|---|
| `space-0` | 0 | — |
| `space-1` | 2 | Hairline gap |
| `space-2` | 4 | Icon-text inline |
| `space-3` | 8 | Padding interno de chips |
| `space-4` | 12 | Card inner padding vertical |
| `space-5` | 16 | Card inner padding general, gap en listas |
| `space-6` | 20 | Section gap pequeño |
| `space-7` | 24 | Section gap medio |
| `space-8` | 32 | Section gap grande |
| `space-9` | 40 | Top padding de vista |
| `space-10` | 48 | Hero spacing |
| `space-11` | 64 | Entre secciones mayores |
| `space-12` | 96 | Hero top |

### Radios (continuo iOS)

| Token | px | Uso |
|---|---|---|
| `radius-xs` | 4 | Tags, badges pequeños |
| `radius-sm` | 8 | Inputs, chips |
| `radius-md` | 12 | Botones, cards pequeñas |
| `radius-lg` | 16 | Cards estándar |
| `radius-xl` | 20 | Modales, sheets, cards grandes |
| `radius-2xl` | 28 | Hero cards, contenedores destacados |
| `radius-3xl` | 36 | FAB, elementos flotantes |
| `radius-full` | 9999 | Avatares, pills |

> **Regla Apple:** el radio de un card suele ser 1/4 de su altura. Si dudas, usa `radius-lg` (16).

### Grid
- **12 columnas** en desktop, gutter 24px, margin 32px.
- **6 columnas** en tablet, gutter 20px, margin 24px.
- **4 columnas** en mobile, gutter 16px, margin 16px.
- **Max content width:** 1280px en vistas densas (tabla), full width en dashboard.

### Densidad
- **Confort (default):** padding `space-5`, line-height 1.5, gap `space-5`.
- **Compacto (tablas, listas largas):** padding `space-3`, line-height 1.3, gap `space-2`.

Toggle de densidad en header (esquina superior derecha), persistido en `localStorage`.

---

## 6. Material Liquid Glass (web)

Implementación web de **Liquid Glass** (Apple, WWDC 2025). Es el material estrella de la app.

### Principios
- **Translucidez con refracción**: el cristal "dobla" la luz del fondo.
- **Highlight especular** en el borde superior.
- **Sombra interna** sutil en el borde inferior.
- **Reacción al cursor** (sutil desplazamiento del highlight en 3-4px).
- **Vibrancy**: texto blanco sobre el cristal gana un sutil contraste adaptativo.

### Implementación CSS

```css
/* === Liquid Glass — base === */
.liquid-glass {
  position: relative;
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.6) inset,        /* highlight superior */
    0 -1px 0 rgba(0, 0, 0, 0.04) inset,             /* sombra interna inferior */
    0 12px 40px -8px rgba(0, 0, 0, 0.18),           /* drop shadow */
    0 2px 6px -2px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  isolation: isolate;
}

/* Refracción: capa SVG con displacement map */
.liquid-glass::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.5) 0%,
    rgba(255, 255, 255, 0.1) 40%,
    rgba(255, 255, 255, 0) 60%,
    rgba(255, 255, 255, 0.15) 100%
  );
  pointer-events: none;
  z-index: 1;
}

/* Reflejo especular en el top edge */
.liquid-glass::after {
  content: '';
  position: absolute;
  top: 0;
  left: 10%;
  right: 10%;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.9),
    transparent
  );
  z-index: 2;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .liquid-glass {
    background: rgba(28, 28, 30, 0.6);
    border-color: rgba(255, 255, 255, 0.08);
    box-shadow:
      0 1px 0 rgba(255, 255, 255, 0.08) inset,
      0 -1px 0 rgba(0, 0, 0, 0.3) inset,
      0 12px 40px -8px rgba(0, 0, 0, 0.5),
      0 2px 6px -2px rgba(0, 0, 0, 0.3);
  }
  .liquid-glass::after {
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.4),
      transparent
    );
  }
}
```

### Variantes

```css
/* Variante: cristal de tab bar (más translúcido) */
.liquid-glass--tabbar {
  background: rgba(250, 250, 250, 0.72);
  backdrop-filter: blur(40px) saturate(200%);
  border-radius: 28px;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

/* Variante: sheet modal (más opaco, blur fuerte) */
.liquid-glass--sheet {
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(50px) saturate(180%);
  border-radius: 28px 28px 0 0;
}

/* Variante: card flotante (más sutil) */
.liquid-glass--card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px) saturate(160%);
  border-radius: 16px;
}

/* Variante: botón cristal (interactivo) */
.liquid-glass--button {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(12px) saturate(150%);
  border-radius: 12px;
  transition: background 150ms ease;
}
.liquid-glass--button:hover {
  background: rgba(255, 255, 255, 0.6);
}
.liquid-glass--button:active {
  background: rgba(255, 255, 255, 0.3);
}
```

### Uso de Liquid Glass en la app
| Componente | Variante | Notas |
|---|---|---|
| Tab bar (navegación inferior en mobile, top en desktop) | `--tabbar` | Siempre flotante sobre contenido, nunca pegado al borde |
| Top bar de vista | `--card` | Translúcida para dejar ver contenido al hacer scroll |
| Modal sheet (crear lead, registrar llamada) | `--sheet` | Máximo blur |
| Cards KPI del dashboard | `--card` | Sutil, no compite con números |
| Notificaciones toast | `--card` | Flotan sobre todo |
| Popovers de acción | `--card` | Sombra más pronunciada |
| Botones secundarios (cancelar, ver más) | `--button` | Reemplaza outline buttons |

> **Regla:** el contenido NUNCA debe ir dentro de un cristal con mucho blur (rompe legibilidad). El blur es para chrome, no para datos.

### Fallback sin `backdrop-filter`
```css
@supports not (backdrop-filter: blur(1px)) {
  .liquid-glass {
    background: rgba(255, 255, 255, 0.92);
  }
}
```

---

## 7. Motion y micro-interacciones

Apple motion = **spring-based, propósito pedagógico, ~300ms**.

### Curvas de easing (mapeadas a Apple HIG + visionOS)

| Token | Easing | Duración | Uso |
|---|---|---|---|
| `ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | 200ms | Hover, color changes |
| `ease-decelerate` | `cubic-bezier(0, 0, 0.2, 1)` | 300ms | Entradas, sheets |
| `ease-accelerate` | `cubic-bezier(0.4, 0, 1, 1)` | 200ms | Salidas, dismiss |
| `ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | 450ms | Bounce sutil, logros |
| `ease-emphasized` | `cubic-bezier(0.2, 0, 0, 1)` | 400ms | Transiciones de vista |

### Patrones de motion (Framer Motion presets)

```ts
// motion/presets.ts
export const fadeIn = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
  transition: { duration: 0.3, ease: [0, 0, 0.2, 1] }
};

export const slideUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 12 },
  transition: { type: 'spring', damping: 28, stiffness: 280 }
};

export const sheet = {
  initial: { y: '100%' },
  animate: { y: 0 },
  exit: { y: '100%' },
  transition: { type: 'spring', damping: 30, stiffness: 300 }
};

export const liquidHover = {
  whileHover: { y: -2, scale: 1.01 },
  whileTap: { scale: 0.98 },
  transition: { type: 'spring', damping: 20, stiffness: 400 }
};

export const numberTick = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.2, 0, 0, 1] }
};
```

### Reglas de motion
- **Nunca >500ms** para una transición de UI. Sensación de inmediatez.
- **Spring con damping alto** (28-32) — rebote mínimo, no juguetón.
- **Stagger de 40ms** al cargar listas (no más, no menos).
- **Numbers count-up** en KPIs: animar de 0 al valor en 800ms con `ease-out`.
- **Respetar `prefers-reduced-motion`**: reemplazar springs por fade simple de 150ms.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 8. Iconografía (SF Symbols style)

Usar **Lucide Icons** (open source, 1500+ iconos, estilo SF Symbols muy fiel) o **Phosphor** (más redondeado, también Apple-like).

```bash
npm i lucide-react
```

### Tamaños
| Token | px | Uso |
|---|---|---|
| `icon-xs` | 12 | Inline con caption |
| `icon-sm` | 16 | Botones pequeños, chips |
| `icon-md` | 20 | Icono de list item, input |
| `icon-lg` | 24 | Navegación, botones |
| `icon-xl` | 32 | Empty states, hero |
| `icon-2xl` | 48 | Ilustraciones de error |

### Stroke width
- `1.5px` para iconos decorativos.
- `2px` para iconos de acción / estado.
- Coincidir con `stroke` del texto adyacente.

### Regla
Iconos siempre con un par de pixels más pequeños que el texto que los acompaña. Si el texto es 17px body, el icono va a 16px.

---

## 9. Arquitectura de información

### Sitemap (3 niveles máximo)

```
/  (Dashboard — Mission Control)
├── /charter                (Negocio 1: Iron Monkey)
│   ├── /charter/leads
│   ├── /charter/leads/:id
│   ├── /charter/proposals
│   ├── /charter/calendar
│   └── /charter/pipeline
├── /sdr                    (Negocio 2: Growing)
│   ├── /sdr/dialer         (modo enfoque de llamadas)
│   ├── /sdr/leads
│   ├── /sdr/script         (guion + 8 objeciones)
│   ├── /sdr/leaderboard    (gamificación)
│   └── /sdr/metrics
├── /calls                  (unificado — todas las grabaciones)
│   ├── /calls/today
│   ├── /calls/:id
│   └── /calls/feedback
├── /digest                 (resumen matinal 08:00)
└── /settings
    ├── /settings/profile
    ├── /settings/notifications
    ├── /settings/appearance
    └── /settings/integrations
```

### Principios de IA (Information Architecture)
- **Un dashboard, dos modos de enfoque.** Visión global + drill-down por negocio.
- **Las llamadas son transversales.** No pertenecen a un negocio, son la materia prima.
- **El digest es una vista, no un email.** La URL es compartible, versionable, consultable.
- **Settings al final.** Pero accesible en 1 click desde el avatar (top-right).

---

## 10. Navegación global

### Estructura: **Adaptive Sidebar + Liquid Glass Tab Bar**

| Pantalla | Navegación |
|---|---|
| Desktop (≥1024px) | Sidebar fija a la izquierda (240px expandida, 64px colapsada) + Top bar |
| Tablet (768-1023px) | Sidebar colapsada por defecto + Top bar |
| Mobile (<768px) | Tab bar inferior flotante (Liquid Glass) + Top bar con título |

### Sidebar — Items (orden = prioridad operativa)
1. **Dashboard** (icon: `gauge`) — vista general
2. **Hoy** (icon: `sun`) — acciones del día (digest condensado)
3. **Llamadas** (icon: `phone`) — transversal
4. ─── separador ───
5. **Charter** (icon: `anchor`, color cyan) — Iron Monkey
6. **SDR** (icon: `phone-outgoing`, color violet) — Growing
7. ─── separador ───
8. **Métricas** (icon: `bar-chart-3`)
9. **Logros** (icon: `trophy`, color premium)
10. ─── separador (flex) ───
11. **Settings** (icon: `settings`)

### Tab bar mobile (Liquid Glass flotante)
5 items max: Dashboard · Hoy · Llamadas · [+] · Más

> El `[+]` central es el **Quick Capture**: registrar llamada o lead nuevo en 1 tap, abre un sheet modal.

### Top bar global
- **Izquierda:** breadcrumb contextual (Dashboard › Charter › Leads)
- **Centro:** búsqueda global (⌘K) — Spotlight Apple-style
- **Derecha:** densidad · theme toggle · avatar con menú

---

## 11. Pantallas principales

### 11.1 Dashboard (Mission Control)

**Propósito:** "En 3 segundos, saber si voy bien o no."

**Layout desktop (12 col):**

```
┌─────────────────────────────────────────────────────────────┐
│ [Top bar]  Mission Control           [⌘K]   [☀]  [Avatar]   │
├──────────┬──────────────────────────────────────────────────┤
│          │  Hero KPI: "Hoy"  (display-2xl)                  │
│  Side    │  ────────────────────────────────────             │
│  bar     │  117 llamadas · 25 conv · 3 agendas              │
│          │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━            │
│          │                                                   │
│          │  ┌──── Charter ────┐  ┌──── SDR ────────┐         │
│          │  │  € 2.450       │  │  117 / 100      │         │
│          │  │  leads esta sem │  │  ↗ +17% vs ayer│         │
│          │  │  [detalle →]    │  │  [detalle →]    │         │
│          │  └─────────────────┘  └─────────────────┘         │
│          │                                                   │
│          │  ┌──── Actividad Reciente ──────────────────┐    │
│          │  │ 10:32  Llamada a Marina — 4:21 — 5★      │    │
│          │  │ 10:18  Propuesta enviada a Carlos        │    │
│          │  │ 09:55  Lead nuevo: Inmobiliaria XYZ      │    │
│          │  └──────────────────────────────────────────┘    │
└──────────┴──────────────────────────────────────────────────┘
```

**Componentes:**
- `<HeroKPI>` — número enorme, label pequeño, sparkle indicator de tendencia
- `<BusinessCard>` — card de cristal con dot de color del negocio
- `<ActivityFeed>` — lista cronológica con avatares de lead y acciones
- `<QuickActionBar>` — 3 botones grandes: Llamar, Nuevo Lead, Ver Pipeline

**Estados:**
- Sin datos del día: empty state "Tu día empieza ahora. Pulsa [+] para registrar tu primera llamada."
- Con datos pero día tranquilo: "Hoy llevas 12 llamadas, estás a 88 de tu objetivo. Buen ritmo."

---

### 11.2 Charter › Pipeline

**Propósito:** ver el estado de cada oportunidad de charter de un vistazo.

**Layout:** Kanban horizontal con 4 columnas (drag & drop):

| Contacto | Propuesta | Negociando | Cerrado |
|---|---|---|---|
| Card 1 | Card 5 | Card 8 | Card 11 (€) |
| Card 2 | Card 6 | Card 9 | Card 12 (€) |
| ... | ... | ... | ... |

**Card del lead (200px ancho):**
```
┌──────────────────────────┐
│ ● Carlos R.   [12 jun]  │   ← dot cyan + fecha
│ Crucero 8 personas       │   ← tipo de servicio
│ ──────                   │
│ € 1.800                  │   ← valor estimado (display-md)
│ 3 notas · 2 emails       │   ← metadata
│ [📞] [✉] [⋯]             │   ← acciones rápidas
└──────────────────────────┘
```

**Interacciones:**
- Click en card → drawer lateral con detalle completo + timeline de actividades
- Drag a otra columna → actualiza estado, animación spring al soltar
- Quick call desde card (icono teléfono) → abre dialer

---

### 11.3 SDR › Dialer (modo enfoque)

**Propósito:** la pantalla más importante del día. Xisco pasa 3-4 horas aquí.

**Layout:** vista dividida, modo concentración (sin sidebar, top bar mínimo).

```
┌─────────────────────────────────────────────────────────────┐
│  [← Volver]  Modo Enfoque          [On Air 🔴]  [⏸ Pausa]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│        Llamada 47 de 100                                    │
│        ───────────────────                                  │
│                                                             │
│        📞 Inmobiliaria Costa Blanca                          │
│        👤 María García — Directora Comercial                │
│        📅 Lead desde hace 2 días                            │
│        🎯 ICP: ✓ 15k€/mes  ✓ Mallorca  ✓ dueña              │
│                                                             │
│        ┌──────────────────────────────────────┐             │
│        │  [⏺ Iniciar grabación]               │             │
│        │  Timer: 00:00                        │             │
│        └──────────────────────────────────────┘             │
│                                                             │
│        Progreso del día                                      │
│        ████████░░░░░░ 47/100 llamadas                      │
│        ████░░░░░░░░░ 12/25 conversaciones                   │
│        ██░░░░░░░░░░░ 1/3 agendas                            │
│                                                             │
│        [Siguiente lead →]                                   │
└─────────────────────────────────────────────────────────────┘
```

**Después de la llamada:** sheet modal con resultados:
- ⭐ Calidad (1-5)
- Resultado: Conversación / Agenda / No contesta / Rechazado
- Notas rápidas
- [Guardar y siguiente]

**Gamificación sutil:**
- Animación de confetti al cerrar 3 agendas
- Pulse suave en el número cuando subes de rango (Novato → Profesional → Veterano → Leyenda)
- Streak indicator (días consecutivos cumpliendo objetivo)

---

### 11.4 Llamadas › Detalle

**Propósito:** revisar la transcripción + feedback de IA de una llamada.

**Layout 2 columnas (desktop):**

```
┌──────────────────────┬──────────────────────┐
│ Reproductor          │ Transcripción        │
│ ┌──────────────────┐ │ 0:00  Hola María...   │
│ │  waveform        │ │ 0:08  Hola, ¿quién?   │
│ │  ~~~~~~~~~~~~    │ │ 0:14  Soy Xisco de... │
│ └──────────────────┘ │ ...                  │
│ [⏮] [▶] 04:21       │                      │
│ [vol] [vel]          │ Click en texto →     │
│                      │ salta al audio       │
│ ──────               │                      │
│ 📊 Análisis IA       │                      │
│ Talk ratio: 38/62    │                      │
│ Tono: profesional    │                      │
│ Keywords: 4          │                      │
│ ⭐ 4.2 / 5           │                      │
│                      │                      │
│ [✏ Editar análisis]  │                      │
└──────────────────────┴──────────────────────┘
```

---

### 11.5 Digest matinal (08:00)

**Propósito:** lo primero que Xisco ve al abrir la app. Resumen del día anterior + objetivos del día.

**Layout:** una sola columna, generosa, ceremonial.

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              Buenos días, Xisco.                            │
│              Domingo, 14 de junio                           │
│                                                             │
│  ─── Ayer ───                                               │
│  ✓  117 llamadas (+17% vs promedio)                         │
│  ✓  25 conversaciones                                        │
│  ✓  3 agendas (¡objetivo cumplido!)                          │
│                                                             │
│  Mejor llamada:  Marina — 4:21 — 5⭐                        │
│  Patrón detectado:  tus mejores calls son entre 10-12h      │
│                                                             │
│  ─── Hoy ───                                                 │
│  Meta:  100 llamadas · 25 conversaciones · 3 agendas        │
│  Clima: ☀ 28°C Mallorca — buen día para cold call           │
│  Sugerencia: empieza por leads de ayer sin respuesta        │
│                                                             │
│  [Empezar el día →]                                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

Tipografía: `display-2xl` para el saludo, `title-2` para las secciones, números con `display-lg`.

---

### 11.6 Settings › Apariencia

**Propósito:** control fino del look.

- Theme: Sistema / Claro / Oscuro
- Acento: Azul (default) / Cyan / Violet / Verde / Naranja
- Densidad: Confortable / Compacta
- Animaciones: Reducidas (respeta prefers-reduced-motion automáticamente)
- Tipografía: Inter (default) / SF Pro / System

---

## 12. Componentes reutilizables

Lista del design system que el agente de React debe construir. **Todos con variante dark, focus ring y estado disabled.**

### Primitivos
- `<Button variant="primary|secondary|tertiary|ghost|destructive" size="sm|md|lg">`
- `<IconButton icon size>` — para acciones en cards
- `<Input type size iconLeft iconRight>` — con floating label
- `<Textarea>`
- `<Select>` / `<Combobox>` / `<MultiSelect>` — usando Radix UI
- `<Checkbox>` / `<Radio>` / `<Switch>` / `<Slider>`
- `<DatePicker>` / `<DateRangePicker>`
- `<Tag color="cyan|violet|success|warning|danger|neutral">`
- `<Avatar src fallback size>` — con status dot opcional
- `<Badge>` — contador pequeño
- `<Tooltip>` — aparece en 400ms, con Liquid Glass

### Compuestos
- `<Card variant="default|elevated|glass|outlined" padding>`
- `<Modal>` / `<Sheet>` (bottom) / `<Drawer>` (right) / `<Popover>`
- `<Tabs>` / `<SegmentedControl>` — para vistas
- `<Accordion>` / `<Collapsible>`
- `<Toast>` / `<NotificationBanner>` / `<Alert>`
- `<EmptyState icon title description action>` — ilustración SF-Symbols-style
- `<Skeleton variant="text|circle|card">`
- `<ProgressBar>` / `<ProgressRing>` / `<Stepper>`
- `<KPI label value delta trend>` — el corazón de la app
- `<DataTable>` — columnas configurables, sort, filtros, densidad toggle
- `<KanbanColumn>` / `<KanbanCard>` — para pipelines
- `<ActivityFeed>` — cronológico, agrupado por día
- `<Waveform>` — visualización de audio, custom canvas
- `<NumberCounter from to duration>` — count-up animado

### Sistema de feedback
- `<ConfirmDialog>` — para acciones destructivas, con campo de texto para confirmar ("escribe ELIMINAR")
- `<UndoableAction>` — toast persistente con "Deshacer" durante 8 segundos
- `<LoadingState>` — variantes: skeleton, spinner, shimmer, progress

### Notificaciones
- Toast top-right, auto-dismiss 5s
- Banner persistente top (errores graves, sincronización)
- Notificación in-app (icono campana con badge)

---

## 13. Estados, vacíos, errores

Apple dedica mucho esfuerzo a esto. Reglas claras:

### Loading
- **<200ms:** no mostrar nada.
- **200ms-1s:** skeleton del componente exacto (mismo tamaño, mismo layout).
- **>1s:** skeleton + mensaje "Cargando…"
- **>5s:** skeleton + "Esto está tardando más de lo normal, [Reintentar]"

### Empty
Cada empty state tiene:
1. **Ilustración** SF-Symbols-style (estilo Apple, monocroma, 1 color)
2. **Título** descriptivo, no genérico
3. **Descripción** de 1 línea con el siguiente paso
4. **CTA principal** claro

**Ejemplos:**

| Vista | Empty |
|---|---|
| Leads | "Sin leads todavía" / "Cuando un lead entre por Facebook Ads, aparecerá aquí." / [+ Nuevo lead] |
| Llamadas | "Tu primera grabación estará aquí" / "Pulsa el botón rojo en modo enfoque para empezar a grabar." / [Ir a Dialer] |
| Métricas | "Aún no hay datos" / "Las métricas aparecen tras tu primera sesión del día." / — |
| Pipeline | "Pipeline vacío" / "Empieza añadiendo un lead o conecta tu fuente de Facebook Ads." / [+ Lead] / [Conectar Facebook] |

### Error
- **Inline error** (validación de form): rojo, microcopy clara, no chillar.
- **Component error** (falló la carga): card con icono, mensaje, [Reintentar].
- **Page error** (no se pudo cargar la vista): ilustración + "Algo ha ido mal" + [Reintentar] [Volver al inicio].
- **Catastrophic** (la app murió): pantalla completa, minimal, con link a status.

### Success
- Animación de check (spring 450ms) al guardar.
- Toast verde discreto: "Lead guardado" (sin exclamaciones, sin emojis spam).
- Para logros: animación premium con confetti y sonido suave opcional.

---

## 14. Modo oscuro

### Implementación
- **Default:** respeta `prefers-color-scheme`, con override manual.
- **Persistencia:** `localStorage.theme` ('system' | 'light' | 'dark').
- **Switch inmediato** sin reload (CSS variables en `:root`).

### Reglas específicas para dark mode
- **Fondo:** usar negro puro `#000` (OLED-friendly) en canvas, gris carbón `#1C1C1E` en surfaces.
- **Sombras:** mucho más sutiles (multiplicar opacidad por 0.4).
- **Blancos:** nunca `#FFF` puro para texto. Usar `#F2F2F7` (off-white Apple).
- **Acento:** mantener mismo color (Apple mantiene el azul igual).
- **Liquid Glass:** subir opacidad del background a 0.6, reducir saturate a 160%.
- **Charts:** usar versiones más brillantes de los colores semánticos.

### Tokens clave dark
```css
[data-theme="dark"] {
  --bg-canvas: #000000;
  --bg-surface: #1C1C1E;
  --bg-tint: #2C2C2E;
  --bg-tint-2: #3A3A3C;
  --separator: rgba(84, 84, 88, 0.65);
  --label-primary: #FFFFFF;
  --label-secondary: rgba(235, 235, 245, 0.7);
  --label-tertiary: rgba(235, 235, 245, 0.45);
  --liquid-glass-bg: rgba(28, 28, 30, 0.6);
  --liquid-glass-border: rgba(255, 255, 255, 0.08);
}
```

---

## 15. Accesibilidad

### Estándar mínimo
- **WCAG 2.2 AA** obligatorio, **AAA** en métricas del dashboard.
- Contraste mínimo: 4.5:1 en texto, 3:1 en UI grande.
- Focus ring visible en **todos** los elementos interactivos (outline 2px solid accent + 2px offset).
- Navegación completa por teclado: Tab, Shift+Tab, Enter, Esc, flechas, ⌘K para búsqueda.

### Implementación
- **Semantic HTML primero.** `<button>` para acciones, `<a>` para navegación, `<input>` para datos.
- **ARIA labels** en iconos sin texto.
- **Live regions** para toasts y actualizaciones dinámicas.
- **Skip link** al inicio de cada vista: "Saltar al contenido principal".
- **Reduced motion** respetado globalmente.

### Testing
- axe-core en CI
- Pruebas manuales con VoiceOver (macOS) / NVDA (Windows)
- Pruebas con zoom 200%

---

## 16. Responsive y breakpoints

### Breakpoints
```
sm:  640px   →  Mobile grande
md:  768px   →  Tablet portrait
lg:  1024px  →  Tablet landscape / laptop
xl:  1280px  →  Desktop
2xl: 1536px  →  Desktop grande
```

### Estrategia
- **Mobile-first.** Diseñar para 375px, escalar hacia arriba.
- **Touch targets:** mínimo 44x44px (regla Apple) en todos los elementos interactivos.
- **Gestos:** swipe-back en mobile (iOS-style), pull-to-refresh en listas.
- **Hover states solo en `:hover` con `(hover: hover)`** (evita sticky hover en touch).

```css
@media (hover: hover) {
  .card:hover { transform: translateY(-2px); }
}
```

### Tabla responsive
- **Desktop:** tabla completa.
- **Tablet:** tabla con columnas menos importantes ocultas, sticky first column.
- **Mobile:** vista card-stack — cada fila se convierte en una card vertical.

---

## 17. Glosario de tokens (para Tailwind)

```js
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        canvas: 'var(--bg-canvas)',
        surface: 'var(--bg-surface)',
        tint: 'var(--bg-tint)',
        'tint-2': 'var(--bg-tint-2)',
        separator: 'var(--separator)',
        label: {
          primary: 'var(--label-primary)',
          secondary: 'var(--label-secondary)',
          tertiary: 'var(--label-tertiary)',
          inverse: 'var(--label-inverse)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
          soft: 'var(--accent-soft)',
        },
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
        info: 'var(--info)',
        premium: 'var(--premium)',
        charter: 'var(--color-charter)',
        sdr: 'var(--color-sdr)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'display-2xl': ['72px', { lineHeight: '1.05', letterSpacing: '-0.04em', fontWeight: '700' }],
        'display-xl':  ['56px', { lineHeight: '1.05', letterSpacing: '-0.035em', fontWeight: '700' }],
        'display-lg':  ['44px', { lineHeight: '1.1',  letterSpacing: '-0.03em',  fontWeight: '600' }],
        'display-md':  ['36px', { lineHeight: '1.15', letterSpacing: '-0.025em', fontWeight: '600' }],
        'title-1':     ['28px', { lineHeight: '1.2',  letterSpacing: '-0.02em',  fontWeight: '600' }],
        'title-2':     ['22px', { lineHeight: '1.25', letterSpacing: '-0.015em', fontWeight: '600' }],
        'title-3':     ['20px', { lineHeight: '1.3',  letterSpacing: '-0.01em',  fontWeight: '600' }],
        'headline':    ['17px', { lineHeight: '1.4',  letterSpacing: '-0.005em', fontWeight: '600' }],
        'body':        ['17px', { lineHeight: '1.5',  letterSpacing: '0',         fontWeight: '400' }],
        'callout':     ['16px', { lineHeight: '1.45', letterSpacing: '0',         fontWeight: '400' }],
        'subhead':     ['15px', { lineHeight: '1.4',  letterSpacing: '0',         fontWeight: '400' }],
        'footnote':    ['13px', { lineHeight: '1.35', letterSpacing: '0',         fontWeight: '400' }],
        'caption-1':   ['12px', { lineHeight: '1.3',  letterSpacing: '0.01em',    fontWeight: '500' }],
        'caption-2':   ['11px', { lineHeight: '1.3',  letterSpacing: '0.02em',    fontWeight: '500' }],
      },
      spacing: {
        '0':  '0',
        '1':  '2px',
        '2':  '4px',
        '3':  '8px',
        '4':  '12px',
        '5':  '16px',
        '6':  '20px',
        '7':  '24px',
        '8':  '32px',
        '9':  '40px',
        '10': '48px',
        '11': '64px',
        '12': '96px',
      },
      borderRadius: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '28px',
        '3xl': '36px',
      },
      transitionTimingFunction: {
        'standard':     'cubic-bezier(0.4, 0, 0.2, 1)',
        'decelerate':   'cubic-bezier(0, 0, 0.2, 1)',
        'accelerate':   'cubic-bezier(0.4, 0, 1, 1)',
        'spring':       'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'emphasized':   'cubic-bezier(0.2, 0, 0, 1)',
      },
      backdropBlur: {
        'glass':  '24px',
        'tabbar': '40px',
        'sheet':  '50px',
      },
      boxShadow: {
        'liquid':  '0 12px 40px -8px rgba(0, 0, 0, 0.18), 0 2px 6px -2px rgba(0, 0, 0, 0.08)',
        'card':    '0 1px 2px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.06)',
        'popover': '0 10px 30px -10px rgba(0, 0, 0, 0.25), 0 2px 8px rgba(0, 0, 0, 0.08)',
      },
    },
  },
};
```

---

## 18. Hoja de ruta de implementación

### Fase 0 — Cimientos (Sprint 1)
1. Setup: Vite + React 18 + TypeScript + Tailwind + Framer Motion.
2. Configurar `tailwind.config.ts` con todos los tokens.
3. Crear `globals.css` con CSS variables light/dark y utilidades Liquid Glass.
4. Implementar `<ThemeProvider>` con persistencia.
5. Instalar Lucide React y configurar iconos.

### Fase 1 — Design System base (Sprint 2)
6. Componentes primitivos: Button, Input, IconButton, Tag, Avatar, Badge.
7. Componentes de layout: Card, Modal, Sheet, Drawer, Popover, Tooltip.
8. Sistema de notificaciones: Toast, Alert, Banner.
9. Empty states y Skeletons.
10. Storybook o Vitest + Histoire para documentar componentes.

### Fase 2 — Navegación y chrome (Sprint 3)
11. Sidebar con items del sitemap.
12. Top bar con búsqueda global (⌘K).
13. Tab bar mobile (Liquid Glass).
14. Layout adaptativo responsive.
15. Sistema de focus management y skip links.

### Fase 3 — Pantallas principales (Sprints 4-6)
16. **Sprint 4:** Dashboard con Hero KPI, Business Cards, Activity Feed.
17. **Sprint 5:** Charter (Pipeline kanban, Lista de leads, Detalle).
18. **Sprint 6:** SDR (Dialer modo enfoque, Leaderboard, Métricas).

### Fase 4 — Audio y llamadas (Sprint 7)
19. Reproductor de audio con waveform (canvas custom).
20. Transcripción con sincronización de highlight al audio.
21. Vista de análisis IA (talk ratio, tono, keywords).
22. Subida de archivos drag & drop con progress.

### Fase 5 — Polish (Sprint 8)
23. Digest matinal con count-up animado.
24. Settings completos (perfil, notificaciones, integraciones).
25. Gamificación (logros, streaks, rangos).
26. Onboarding (3 pasos la primera vez).
27. Audit completo de accesibilidad, performance y motion.

### Criterios de "Hecho" por pantalla
- [ ] Responsive: mobile, tablet, desktop
- [ ] Light + dark mode
- [ ] Estados: loading, empty, error, success
- [ ] Navegable por teclado
- [ ] Reduced motion respetado
- [ ] Contraste AA verificado
- [ ] Animaciones con propósito (no decorativas)
- [ ] Iconos con aria-label
- [ ] Sin console.log ni warnings
- [ ] Performance: <100ms TTI, <2.5s LCP

---

## Apéndice — Referencias de Apple

- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines)
- [Design Principles](https://developer.apple.com/design/human-interface-guidelines/design-principles)
- [Typography](https://developer.apple.com/design/human-interface-Guidelines/typography)
- [Color](https://developer.apple.com/design/human-interface-guidelines/color)
- [Dark Mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode)
- [Materials (Liquid Glass)](https://developer.apple.com/design/human-interface-guidelines/materials)
- [SF Symbols](https://developer.apple.com/sf-symbols/)
- WWDC25 — Meet Liquid Glass
- WWDC25 — Get to know the new design system

### Librerías recomendadas
- **Lucide React** — iconos
- **Framer Motion** — animaciones
- **Radix UI** — primitivos accesibles (dialog, popover, select…)
- **TanStack Table** — tablas potentes
- **dnd-kit** — drag & drop para kanban
- **Recharts** o **Visx** — gráficos (Visx si se quiere pixel-perfect)
- **Sonner** — toasts
- **Inter** font — tipografía
- **clsx** + **tailwind-merge** — utilidad de clases

---

> **Última nota para el agente de React:** este documento es la fuente de verdad para el look & feel. Si surge una duda, la respuesta siempre es: **"¿Qué haría Apple aquí?"** — minimalismo, claridad, deferencia al contenido, profundidad con propósito. Cuando termines una vista, pregúntate si se siente como un producto de Apple. Si no, no está listo.
