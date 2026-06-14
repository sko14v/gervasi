# App Agentik O.S. — Arquitectura React local

> Especificación de la app que Xisco y yo programaremos para
> visualizar el CRM, los dashboards, los feedbacks y la gamificación.
> **100% local. Corre en `localhost`. Lee y escribe en el vault.**

---

## 1. Visión de la app

Una SPA (Single Page Application) en React + TypeScript que ofrece:

- **CRM visual** con pipeline de columnas drag-and-drop (Iron Monkey).
- **Formularios** para crear fichas de leads y meter notas.
- **Visor de propuestas** PDF generadas.
- **Dashboard de KPIs** con gráficos para ambos negocios.
- **Visor de sesiones** de llamadas con transcripción + feedback.
- **Gamificación** con objetivos, rachas, ranking personal.
- **Daily digest** como notificación push.
- **Visualización del grafo** de memoria (los nodos del vault).

### 1.1 Principios de diseño

- **Cero internet.** Todo el procesamiento y almacenamiento es local.
- **Datos tipados.** TypeScript estricto, estados bien definidos.
- **Mobile-friendly** (responsive). Xisco a veces revisa desde el móvil.
- **Visual y bonito.** No es un backoffice gris — es la herramienta
  con la que Xisco trabaja a diario.
- **Velocidad de teclado.** Atajos para crear lead, marcar estado,
  abrir feedback, etc.

---

## 2. Stack técnico

| Capa | Herramienta | Justificación |
|------|-------------|---------------|
| **Build** | Vite | Rápido, HMR, TypeScript first-class |
| **Framework** | React 18 | Ecosistema, componentes |
| **Lenguaje** | TypeScript (strict) | Tipos en estados, props, datos del vault |
| **Estilos** | TailwindCSS + shadcn/ui | Velocidad, componentes accesibles |
| **Estado** | Zustand | Simple, sin boilerplate |
| **Routing** | React Router | Estándar |
| **Gráficos** | Recharts | Simple, cubre los casos |
| **Drag & drop** | dnd-kit | Pipeline de columnas |
| **Markdown parser** | react-markdown + remark-gfm | Para previews |
| **PDF viewer** | react-pdf | Ver propuestas generadas |
| **Formularios** | react-hook-form + zod | Validación tipada |
| **Notificaciones** | Web Notifications API + Service Worker | Digest push local |
| **Fechas** | date-fns | Ligero, sin Moment |

### 2.1 Worker de agentes (backend local)

- **Node.js + Express** o **Hono** (más moderno, más rápido).
- Corre en `localhost:3001`.
- Endpoints para cada agente (ver `orquestacion.md` sección 3.2).
- Lee/escribe en el vault directamente.
- Worker simple, sin base de datos propia — el vault es la DB.

### 2.2 ¿Web local o app empaquetada?

| Opción | Pros | Contras |
|--------|------|---------|
| **Web local (localhost)** | Simple, sin instalación, dev rápido | Xisco necesita abrir el navegador |
| **Tauri (empaquetada)** | App nativa, sin chrome, atajos OS | +30 min setup, build más pesado |
| **Electron** | Maduro, mucha doc | Pesado (~200 MB Chromium) |

**Recomendación:** empezar con **web local** (Vite dev server) y
empaquetar con **Tauri** en v2 si Xisco quiere app de escritorio.

---

## 3. Estructura de carpetas de la app

```
agentik-os-app/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── routes.tsx
│   │
│   ├── components/
│   │   ├── ui/                    # shadcn primitives
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Topbar.tsx
│   │   │   └── DigestBanner.tsx   # Notificación del digest
│   │   ├── ironmonkey/
│   │   │   ├── Pipeline.tsx       # Vista de columnas
│   │   │   ├── LeadCard.tsx       # Tarjeta drag-and-drop
│   │   │   ├── LeadForm.tsx       # Form crear/editar
│   │   │   ├── ProposalModal.tsx  # Visor PDF + generar
│   │   │   └── AlertList.tsx      # Alertas del pipeline
│   │   ├── growing/
│   │   │   ├── SessionList.tsx
│   │   │   ├── SessionDetail.tsx  # Transcripción + feedback
│   │   │   ├── AudioUploader.tsx
│   │   │   ├── ProspectCard.tsx
│   │   │   └── GamificationPanel.tsx
│   │   ├── dashboard/
│   │   │   ├── KpiCards.tsx
│   │   │   ├── Charts.tsx
│   │   │   └── TrendLines.tsx
│   │   └── memory/
│   │       └── KnowledgeGraph.tsx # Visor del grafo
│   │
│   ├── pages/
│   │   ├── Home.tsx               # Dashboard general
│   │   ├── IronMonkey.tsx         # CRM + pipeline
│   │   ├── Growing.tsx            # Sesiones + feedback
│   │   ├── Dashboard.tsx          # KPIs detallados
│   │   ├── Memory.tsx             # Grafo de conocimiento
│   │   └── Settings.tsx
│   │
│   ├── lib/
│   │   ├── vault/
│   │   │   ├── reader.ts          # Lee .md del vault
│   │   │   ├── writer.ts          # Escribe .md
│   │   │   ├── parser.ts          # Frontmatter YAML
│   │   │   └── types.ts           # Tipos compartidos
│   │   ├── agents/
│   │   │   ├── client.ts          # Llama al worker
│   │   │   └── prompts.ts         # Plantillas de prompts
│   │   ├── digest/
│   │   │   ├── generator.ts       # Genera el digest
│   │   │   ├── notifier.ts        # Web Notifications
│   │   │   └── scheduler.ts       # Chequeo de cadencias
│   │   └── utils/
│   │       ├── date.ts
│   │       ├── format.ts
│   │       └── id.ts
│   │
│   ├── stores/                    # Zustand
│   │   ├── pipelineStore.ts
│   │   ├── sessionStore.ts
│   │   ├── goalStore.ts
│   │   └── digestStore.ts
│   │
│   └── types/
│       ├── lead.ts
│       ├── llamada.ts
│       ├── prospecto.ts
│       ├── sesion.ts
│       └── digest.ts
│
├── worker/                        # Backend local Node
│   ├── src/
│   │   ├── server.ts
│   │   ├── agents/
│   │   │   ├── icp.ts
│   │   │   ├── proposal.ts
│   │   │   ├── crm.ts
│   │   │   ├── call-analyzer.ts
│   │   │   ├── feedback.ts
│   │   │   ├── prospect-notes.ts
│   │   │   └── goal-tracker.ts
│   │   ├── integrations/
│   │   │   ├── minimax.ts         # Cliente M3 / M2.5
│   │   │   ├── gemini.ts          # Cliente audio
│   │   │   └── graphify.ts        # Cliente grafo
│   │   └── services/
│   │       ├── pdf-generator.ts   # Playwright
│   │       ├── audio-chunker.ts   # Ffmpeg 15-20 min
│   │       └── digest-builder.ts
│   └── package.json
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.ts
```

---

## 4. Vistas principales

### 4.1 Home / Dashboard general

```
┌─────────────────────────────────────────────────────┐
│  Agentik OS                          🔔 3 alertas   │
├─────────────────────────────────────────────────────┤
│  [Digest banner si hay]                              │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐                │
│  │ IRON MONKEY  │  │   GROWING    │                │
│  │ 8 leads      │  │ Score 72/100 │                │
│  │ 3 propuestas │  │ 78/80 calls  │                │
│  │ 2 alertas    │  │ 4 citas      │                │
│  └──────────────┘  └──────────────┘                │
│                                                      │
│  Últimas acciones:                                   │
│  • Lead María García → cualificado (hace 2h)       │
│  • Sesión 13/06 analizada: 78 calls, score 72      │
│  • PDF propuesto para IM-2026-001 (hace 5h)         │
└─────────────────────────────────────────────────────┘
```

### 4.2 Iron Monkey — Pipeline

```
┌──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
│  NUEVO   │CONTACTADO│CUALIFICA.│PROPUESTA │PROPUESTA │EN NEGOC. │
│  (3)     │  (2)     │  (4)     │BORRADOR  │ ENVIADA  │  (1)     │
│          │          │          │  (2)     │  (2)     │          │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ [Card]   │ [Card]   │ [Card]   │ [Card]   │ [Card]   │ [Card]   │
│ [Card]   │ [Card]   │ [Card]   │ [Card]   │ [Card]   │          │
│ [Card]   │          │ [Card]   │          │          │          │
│          │          │ [Card]   │          │          │          │
└──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘
   [+ Nuevo lead]                                  [🔔 3 alertas]
```

- Drag & drop entre columnas para cambiar estado.
- Click en card abre el detalle (modal lateral).
- Botón flotante "+ Nuevo lead" abre el formulario.

### 4.3 Growing — Sesión

```
┌──────────────────────────────────────────────────────┐
│ ◀ Sesiones │ Sesión 13/06/2026 (jueves)              │
├──────────────────────────────────────────────────────┤
│  Resumen                                             │
│  ────────                                            │
│  Llamadas: 78  |  Citas: 4  |  Score: 72/100        │
│  Talk ratio: 62%  |  Sentimiento: neutro            │
│                                                      │
│  Wins (3)              Improvements (4)              │
│  ─────                 ─────────────                  │
│  • Cierre con 3        • Bajar talk ratio 65→55%     │
│    objeciones en 4 min • Menos muletillas en apertura│
│  • Apertura <15s       • Preguntar más dolor         │
│    en 12/78 llamadas   • Mejor manejo "no tenemos   │
│                          tiempo"                     │
│                                                      │
│  [▶ Llamada 12 (cierre)]  [▶ Llamada 23 (objeción)] │
│  [▶ Llamada 45 (cita)]    [▶ Todas]                  │
│                                                      │
│  Tendencia (5 sesiones)                              │
│  ────────────────────                                │
│  Score: 65 → 68 → 70 → 71 → 72 ↗ +7 puntos          │
└──────────────────────────────────────────────────────┘
```

### 4.4 Dashboard — KPIs

```
┌──────────────────────────────────────────────────────┐
│ Período: [Esta semana ▾]    Negocio: [Ambos ▾]      │
├──────────────────────────────────────────────────────┤
│ IRON MONKEY                                          │
│  Leads/semana    Propuestas    Ratio cierre   €€€     │
│  12              4             25%            8.500€  │
│  ↗ +3            ↗ +1          →              ↗ +2K  │
│                                                      │
│  [Gráfico de barras: leads por estado]              │
│  [Línea temporal: cierres últimos 3 meses]           │
│                                                      │
│ GROWING INMOBILIARIO                                 │
│  Llamadas  Citas  Conversión  Score  Racha           │
│  320       48     15%         72     5 días          │
│  ↗ +40     ↗ +6   →           ↗ +3   🔥              │
│                                                      │
│  [Línea: score 5 sesiones]                           │
│  [Barras: llamadas vs objetivo diario, esta semana]  │
└──────────────────────────────────────────────────────┘
```

### 4.5 Memory — Grafo de conocimiento

Visualización tipo Obsidian Graph del vault:

```
   [01-IronMonkey]──────[catalogo-embarcaciones]
         │                       │
         ▼                       ▼
   [guia-calificacion]──[precios-tarifas]──[propuesta-v1]
         │
         ▼
   [lead: María García]──[propuesta: IM-2026-001]

   [02-GrowingInmobiliario]──[script-cold-calling]
         │
         ▼
   [sesión 2026-06-13]──[feedback 2026-06-13]
         │
         ▼
   [objeciones: "no tenemos tiempo"]
```

- Librería: **react-force-graph-2d** o **cytoscape.js**.
- Cada nodo es un archivo del vault.
- Click en nodo abre el archivo en un panel lateral.

---

## 5. Componentes clave — detalle

### 5.1 LeadForm (crear/editar lead)

Campos (ver `guia-calificacion-leads.md`):

- **Bloque 1 — Datos de contacto**
  - Nombre, teléfono, email, idioma, origen.
- **Bloque 2 — Datos del evento**
  - Fecha preferida, fecha alternativa, personas, tipo, presupuesto.
- **Bloque 3 — Notas**
  - Textarea grande con placeholder que sugiere qué escribir.
  - Botón "Estructurar con IA" → llama al ICP.
- **Bloque 4 — Sensación**
  - Selector visual: 🔥 Caliente / 🟡 Tibio / 🟠 Frío / ⛔ Descartado.
- **Bloque 5 — Servicios mencionados**
  - Checklist de catering, barra libre, música, etc.

Al guardar:
- Validación con zod.
- Escritura en `vault/01-IronMonkeyCharter/leads/IM-YYYY-NNN.md`.
- Si la app detecta score alto, sugiere "Generar propuesta".

### 5.2 ProposalModal (generar PDF)

Pasos:
1. Xisco confirma el lead.
2. App llama al worker → Proposal Generator.
3. Worker consulta Graphify (catálogo, precios, tono, políticas).
4. Worker genera HTML → Playwright → PDF.
5. PDF se guarda en `vault/01-IronMonkeyCharter/propuestas/IM-YYYY-NNN-v1.pdf`.
6. Modal muestra el PDF con preview + botón "Descargar".
7. Estado del lead → `propuesta_borrador` (NO `propuesta_enviada`
   hasta que Xisco confirme envío).

### 5.3 SessionDetail (sesión Growing)

- Header con resumen (score, llamadas, citas).
- Tabs: **Transcripción** | **Feedback** | **Tendencia**.
- Transcripción: lista de llamadas con timestamps + botón ▶.
- Feedback: wins + improvements + acciones recomendadas.
- Tendencia: línea con últimas 5 sesiones.

### 5.4 DigestBanner (notificación visual en la app)

Si hay un digest pendiente (por hora o por día perdido):

```
┌─────────────────────────────────────────────────────┐
│ 🔔 Digest Iron Monkey pendiente — 08:00 (hace 3h)  │
│ [Ver resumen]                          [Descartar]  │
└─────────────────────────────────────────────────────┘
```

---

## 6. Tipos TypeScript compartidos

```typescript
// types/lead.ts
export type EstadoLead =
  | 'nuevo'
  | 'contactado'
  | 'cualificado'
  | 'tibio'
  | 'propuesta_borrador'
  | 'propuesta_enviada'
  | 'en_negociacion'
  | 'ganado'
  | 'perdido'
  | 'descartado';

export interface Lead {
  id: string;             // IM-2026-001
  nombre: string;
  telefono: string;
  email: string;
  idioma: 'ES' | 'CAT' | 'EN';
  origen: 'facebook' | 'referido' | 'web' | 'evento' | 'otro';
  estado: EstadoLead;
  score: number;          // 1-10
  sensacion: 'caliente' | 'tibio' | 'frio' | 'descartado';
  fecha_evento?: string;  // ISO
  fecha_evento_alt?: string;
  personas?: number;
  tipo_evento?: string;
  presupuesto_min?: number;
  presupuesto_max?: number;
  servicios_mencionados?: string[];
  notas?: string;
  created_at: string;
  updated_at: string;
}

// types/llamada.ts
export interface Llamada {
  id: string;             // LL-2026-06-13-001
  sesion_id: string;
  audio_path: string;
  duracion_seg: number;
  transcripcion?: string;
  transcripcion_con_timestamps?: Array<{ t: number; speaker: string; text: string }>;
  score?: number;         // 0-100
  score_detalle?: {
    apertura: number;
    descubrimiento: number;
    objeciones: number;
    cierre: number;
    tecnico: number;
  };
  talk_ratio?: number;    // 0-1
  sentimiento?: 'positivo' | 'neutro' | 'negativo';
  objeciones_detectadas?: string[];
  cita_agendada?: boolean;
  prospecto_id?: string;
}

// types/sesion.ts
export interface Sesion {
  id: string;             // SES-2026-06-13
  fecha: string;          // ISO date
  duracion_total_seg: number;
  num_llamadas: number;
  num_citas: number;
  score_promedio: number;
  estado: 'subida' | 'transcribiendo' | 'analizada' | 'con_feedback' | 'archivada';
  feedback_id?: string;
  audio_paths: string[];
}
```

---

## 7. Flujos de uso frecuentes

### 7.1 Xisco crea un lead nuevo (sin trigger)

```
1. Xisco abre la app → click "+ Nuevo lead"
2. Rellena el formulario inicial (datos de contacto + evento)
3. Click "Guardar perfil"
4. App escribe vault/01-IronMonkeyCharter/leads/IM-2026-NNN.md
5. Estado: "nuevo" — PERFIL VACÍO
6. La app NO hace nada más. Es solo un registro.
7. La app muestra: "Perfil creado. Llama al cliente y vuelve
   para meter las notas."
```

### 7.2 Xisco añade notas tras una llamada (TRIGGER PRINCIPAL)

```
1. Xisco llama por teléfono al cliente
2. Vuelve a la app, abre la card del lead
3. En el campo de notas (textarea grande), pega lo que habló
4. Click "Guardar nota" (o Cmd/Ctrl+Enter)
5. ICP procesa la nota:
   - Estructura el texto libre en bullets accionables
   - Calcula score 1-10
   - Asigna estado (cualificado / tibio / descartado)
   - Programa follow-ups (siguiente contacto, fecha, motivo)
6. App actualiza el lead con score + estado + follow-ups
7. Si score >= 7: aparece el botón "Generar oferta" en la misma nota
```

### 7.3 Xisco genera una propuesta

```
1. Xisco está en la vista de la nota del lead
2. Click "Generar oferta" (botón dentro de la nota)
3. App muestra modal: "Esto tardará ~30s. ¿Continuar?"
4. Click "Sí"
5. Worker → Proposal Generator con datos del lead
6. Worker consulta Graphify (catálogo, precios, tono, políticas)
7. Worker genera HTML → Playwright → PDF
8. PDF se guarda en propuestas/IM-2026-NNN-v1.pdf
9. Modal muestra el PDF con previsualización
10. Xisco revisa, ajusta si hace falta
11. Click "Marcar como enviado al cliente" → estado "propuesta_enviada"
    (Xisco es quien lo envía por su cuenta, no la app)
```

### 7.4 Xisco sube audio de una sesión Growing (TRIGGER PRINCIPAL)

```
1. Xisco termina su sesión de ~3h de llamadas
2. Abre la app → sección Growing → "Nueva sesión"
3. En el campo "Adjuntar audio" sube el/los archivos (drag & drop o click)
4. Click "Analizar sesión"
5. La app procesa en cascada (sin más pasos manuales):
   - Call Analyzer: chunking 15-20 min con solapamiento 5s
   - Gemini Flash Lite: transcripción de cada chunk
   - MiniMax M3: análisis contra script + scorecard + objeciones
   - M3: feedback estructurado (wins, improvements, next)
6. Todo se guarda en:
   - sesiones/2026-06-13.md (datos crudos)
   - feedback/2026-06-13.md (feedback accionable)
7. App muestra: "Sesión analizada. Score 72/100. Ver feedback"
```

### 7.5 Daily digest Iron Monkey (08:00)

```
1. Xisco abre la app a las 08:15
2. App chequea: ¿hay digest pendiente para hoy 08:00?
3. Sí → genera digest (lee vault, cuenta leads, identifica alertas)
4. Contenido del digest Iron Monkey:
   - "Tienes 3 leads sin primer contacto de hace > 48h"
   - "5 leads con follow-up vencido hoy"
   - "2 propuestas en borrador pendientes de enviar"
   - "1 cliente que no contesta hace 5 días"
5. App muestra DigestBanner arriba
6. Service Worker dispara notificación push del SO
7. Xisco ve: "🔔 Digest Iron Monkey 08:00 — 11 acciones hoy"
```

### 7.6 Daily digest Growing con FIPA (08:00)

```
1. Mismo mecanismo que Iron Monkey
2. Contenido del digest Growing (FIPA = Feedback Insight Para Aplicar):
   - "FIPA #1: Tu talk ratio ayer fue 65%. OBJETIVO HOY: < 55%.
      Aplica 3 preguntas de descubrimiento antes de presentar."
   - "FIPA #2: En 8 llamadas usaste 'sí total' a las objeciones.
      OBJETIVO HOY: usa la respuesta validativa de O3."
   - "FIPA #3: Tu mejor cierre fue 'agenda con 2 opciones'.
      OBJETIVO HOY: repite ese patrón en ≥ 5 llamadas."
3. Notificación: "🔔 Digest Growing 08:00 — 3 FIPAs para hoy"
```

---

## 8. Atajos de teclado (velocidad)

| Atajo | Acción |
|-------|--------|
| `n` | Nuevo lead |
| `p` | Abrir pipeline |
| `g` | Abrir Growing |
| `d` | Dashboard |
| `m` | Memory graph |
| `?` | Mostrar todos los atajos |
| `Cmd/Ctrl+K` | Buscar lead / prospecto |
| `Esc` | Cerrar modal |
| `→` | Siguiente tab |
| `←` | Tab anterior |

---

## 9. Configuración inicial

```bash
# Clonar / crear el proyecto
npm create vite@latest agentik-os-app -- --template react-ts
cd agentik-os-app
npm install

# Dependencias principales
npm install zustand react-router-dom react-hook-form zod
npm install @hookform/resolvers date-fns
npm install react-markdown remark-gfm
npm install react-pdf
npm install recharts
npm install @dnd-kit/core @dnd-kit/sortable
npm install lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# shadcn/ui
npx shadcn-ui@latest init

# Worker (backend)
mkdir worker
cd worker
npm init -y
npm install express cors
npm install -D typescript @types/express @types/cors ts-node nodemon
```

---

## 10. Lo que se construirá primero (MVP)

**Fase 1 — Lectura (1 semana)**
- App que **solo lee** del vault.
- Pipeline Iron Monkey funcional (drag & drop).
- Visor de sesiones Growing.
- Dashboard básico con KPIs.

**Fase 2 — Escritura (1 semana)**
- Formularios para crear leads.
- Formularios para meter notas.
- Subida de audio + trigger del Call Analyzer.
- Generación de PDFs.

**Fase 3 — Inteligencia (1 semana)**
- Integración con el worker (M3, M2.5, Gemini).
- Generación de propuesta PDF end-to-end.
- Feedback Coach semanal.
- Digest push a 08:00 y 18:00.

**Fase 4 — Polish (1 semana)**
- Memory graph.
- Gamificación con rachas.
- Atajos de teclado completos.
- Tema visual cuidado.

---

_Versión 1.0 — Arquitectura. Este es el mapa para construir la app.
Empezamos por la Fase 1 cuando tú digas._
