# Plan de Implementación v1 — Agentik O.S.

> **Fecha:** 2026-06-13
> **Estado:** Aprobado por Xisco (alcance: las 4 fases completas, stack a decisión del ingeniero, ubicación "dentro del mismo proyecto", instalar skills recomendadas)
> **Documento de referencia:** `analisis_tecnico_agentik_os.md` (Claude Opus 4.6)

---

## 0. Decisiones cerradas

| Decisión | Elección | Razón |
|---|---|---|
| **Backend** | Node.js 24 + TypeScript + Hono | Monorepo TS, tipos compartidos con frontend, Graphify va como subprocess Python |
| **Frontend** | React 19 + Vite 6 + Tailwind 4 + shadcn/ui | Stack estándar moderno, todo en TS |
| **Estructura** | Monorepo con `packages/app`, `packages/server`, `packages/shared` | Comparte tipos sin duplicar |
| **Vault I/O** | `gray-matter` para frontmatter, `fs/promises` para lectura | 200 archivos .md, sin necesidad de DB |
| **Comunicación** | HTTP localhost:3001 (backend) + SSE para tareas largas (Proposal, Call Analyzer) | Más simple que polling de archivos |
| **PDF** | Playwright/Chromium (HTML→PDF) | Más fiable en Windows que WeasyPrint |
| **Audio** | FFmpeg para chunking 15-20min + solapamiento 5s, Gemini Flash Lite para transcripción | Ya decidido en stack-tecnico.md |
| **Ubicación código** | `C:\Users\xisco\OneDrive\Escritorio\GERVASI\agentik-os-app\` (hermano del vault) | El vault queda limpio de node_modules, pero cerca para acceso fs |
| **Vault path desde app** | `../Agentik-OS-Vault` (relativo) | No hay paths absolutos hardcodeados |
| **Excluir de OneDrive** | `node_modules`, `dist`, `.turbo` | Carpetas regenerables, no aportan valor al backup |

---

## 1. Resolver inconsistencias del vault (Fase 0)

Esto se hace ANTES de programar, para no liar a los agentes:

| # | Acción | Archivo |
|---|---|---|
| 1 | Eliminar `01-IronMonkey/` vacío (dejar solo `01-IronMonkeyCharter/`) | filesystem |
| 2 | Eliminar `01-IronMonkeyCharter/buyer-personas/`, `historial-ofertas/`, `scripts-comunicacion/` si están vacíos | filesystem |
| 3 | Actualizar `index.md`: quitar referencias a LLMLingua2 (línea 24 y 109 según análisis) | `index.md` |
| 4 | Eliminar `calendario-ejecucion.md` (vacío) o rellenarlo con referencia a `orquestacion.md` | `00-Sistema/calendario-ejecucion.md` |
| 5 | Limpiar caracteres corruptos chinos en `orquestacion.md` y `dashboards.md` | varios |
| 6 | Archivar `analisis_tecnico_agentik_os.md` dentro de `04-Conocimiento/guias-agentes/` o dejarlo en raíz como referencia | filesystem |
| 7 | Crear estructura de carpetas que la app espera (vacías pero creadas): `01-IronMonkeyCharter/leads/`, `01-IronMonkeyCharter/propuestas/`, `02-GrowingInmobiliario/prospectos/`, `03-Memoria/_logs/` | filesystem |
| 8 | Crear `log.md` inicial vacío en `03-Memoria/_logs/` | nuevo archivo |
| 9 | Crear `package.json` raíz con workspaces, y `.gitignore` que excluya `node_modules` | `agentik-os-app/` |

---

## 2. Estructura del monorepo

```
C:\Users\xisco\OneDrive\Escritorio\GERVASI\agentik-os-app\
├── package.json                      # workspaces root
├── .gitignore                        # node_modules, dist, .turbo
├── README.md                         # cómo arrancar
├── pnpm-workspace.yaml o npm workspaces
│
├── packages/
│   ├── app/                          # React frontend (Vite)
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   ├── index.html
│   │   └── src/
│   │       ├── main.tsx
│   │       ├── App.tsx
│   │       ├── routes.tsx
│   │       ├── components/
│   │       │   ├── ui/              # shadcn primitives
│   │       │   ├── layout/          # AppShell, Sidebar, Topbar, DigestBanner
│   │       │   ├── ironmonkey/      # Pipeline, LeadCard, LeadForm, LeadDetail, NoteEditor, ProposalModal, AlertList
│   │       │   ├── growing/         # SessionList, SessionDetail, AudioUploader, CallTimeline, FipaCards, GamificationPanel, ScoreRadar
│   │       │   ├── dashboard/       # KpiCards, TrendLine, FunnelChart, ComparisonTable
│   │       │   └── shared/          # ErrorBoundary, SkeletonLoader, ConfirmDialog, EmptyState
│   │       ├── pages/               # Home, IronMonkey, Growing, Dashboard, Memory, Settings
│   │       ├── hooks/               # useAgent, useDigest, useKeyboard, useNotification
│   │       ├── lib/
│   │       │   ├── api/             # client (ky), agents.api, vault.api, digest.api
│   │       │   └── utils/           # date, format, id
│   │       ├── stores/              # pipelineStore, sessionStore, goalStore, digestStore, uiStore
│   │       └── types/               # re-exports de shared
│   │
│   ├── server/                       # Hono backend
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts              # entry, Hono app en :3001
│   │       ├── routes/
│   │       │   ├── agents.ts         # POST /agents/:name/run (SSE)
│   │       │   ├── vault.ts          # GET/POST /vault/*
│   │       │   ├── leads.ts          # CRUD /leads
│   │       │   ├── sessions.ts       # CRUD /sessions
│   │       │   ├── digest.ts         # GET /digest/:type
│   │       │   └── upload.ts         # POST /upload (audio)
│   │       ├── agents/               # 7 agentes
│   │       │   ├── base-agent.ts     # clase abstracta
│   │       │   ├── icp.agent.ts
│   │       │   ├── proposal.agent.ts
│   │       │   ├── crm-manager.agent.ts
│   │       │   ├── call-analyzer.agent.ts
│   │       │   ├── feedback-coach.agent.ts
│   │       │   ├── prospect-notes.agent.ts
│   │       │   └── goal-tracker.agent.ts
│   │       ├── services/
│   │       │   ├── vault.service.ts  # read/write .md con frontmatter
│   │       │   ├── minimax.service.ts
│   │       │   ├── gemini.service.ts
│   │       │   ├── graphify.service.ts
│   │       │   ├── pdf.service.ts    # Playwright
│   │       │   ├── audio.service.ts  # FFmpeg chunking
│   │       │   └── digest.service.ts
│   │       ├── middleware/
│   │       │   ├── logger.ts         # → 03-Memoria/_logs/log.md
│   │       │   └── error-handler.ts
│   │       └── config/
│   │           ├── paths.ts          # rutas absolutas al vault
│   │           ├── models.ts         # API keys, endpoints
│   │           └── prompts.ts        # plantillas
│   │
│   └── shared/                       # tipos compartidos
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── types/
│           │   ├── lead.ts
│           │   ├── llamada.ts
│           │   ├── prospecto.ts
│           │   ├── sesion.ts
│           │   ├── digest.ts
│           │   └── agente.ts
│           ├── constants/
│           │   ├── estados-lead.ts
│           │   └── temporadas.ts
│           └── validators/
│               ├── lead.schema.ts    # zod
│               └── sesion.schema.ts
│
└── scripts/
    ├── index-graphify.mjs            # rebuild del grafo
    └── check-health.mjs              # verifica que vault y ffmpeg están OK
```

---

## 3. Skills a instalar

| Skill | Tipo | Instalación | Cuándo |
|---|---|---|---|
| **Caveman** | Global agent skill | `npx skills add juliusbrussee/caveman` | Antes de Fase 1 |
| **Graphify (paquete PyPI)** | Python tool | `pip install graphify` (verificar nombre) | Antes de Fase 1 |
| **taskmaster-ai** | Agent helper | `npx skills add eyaltoledano/claude-task-master` | Antes de Fase 1 |
| **agentik-lead-qualifier** | Custom SKILL.md | Crear con skill-creator | Fase 2 |
| **agentik-pdf-proposal** | Custom SKILL.md | Crear con skill-creator | Fase 3 |
| **agentik-call-scorer** | Custom SKILL.md | Crear con skill-creator | Fase 3 |
| **agentik-fipa-generator** | Custom SKILL.md | Crear con skill-creator | Fase 4 |
| **agentik-digest** | Custom SKILL.md | Crear con skill-creator | Fase 4 |

---

## 4. Dependencias del sistema a instalar (one-time)

| Dependencia | Comando | Verificación |
|---|---|---|
| **Node.js ≥20** | Ya está (v24.14.0) | `node --version` ✓ |
| **Python 3.13** | Ya está | `python --version` ✓ |
| **FFmpeg** | `winget install Gyan.FFmpeg` | `ffmpeg -version` |
| **Playwright Chromium** | `npx playwright install chromium` | desde packages/server/ |
| **Graphify** | `pip install graphify` (verificar nombre real) | `python -c "import graphify"` |

---

## 5. Ajustes críticos del addendum (integrados)

> Documento fuente: `addendum-cerebro-transcripciones-persistencia.md`

### 5.1 Cerebro: Obsidian + Graphify en tándem (no elección única)

| Aspecto | Detalle |
|---|---|
| **Obsidian** | Editor humano. Xisco edita el vault (catálogo, precios, script, objeciones, MEMORY) |
| **Graphify** | Indexador máquinas. Agentes consultan grafo para reducir contexto 5-10x |
| **Ambos a la vez** | Vault `.md` es la fuente compartida. Obsidian es la cara humana, Graphify la cara máquina |
| **Re-indexación** | Backend llama `graphify .` como subprocess tras cada escritura significativa (~2-5s, en background) |
| **Endpoint dedicado** | `POST /graphify/reindex` para re-indexar manual o al arrancar el servidor |

**Re-indexar SÍ:** nuevo lead, nota añadida, sesión analizada, feedback generado, Xisco edita catálogo en Obsidian.
**Re-indexar NO:** digest generado (efímero), estado de lead cambiado (solo frontmatter).

### 5.2 Transcripción: Gemini 2.5 Flash-Lite (no 2.0)

| Cambio | Antes | Ahora |
|---|---|---|
| **Modelo** | "Gemini Flash Lite" (genérico) | **Gemini 2.5 Flash-Lite** (2.0 descontinuado 1 jun 2026) |
| **Duración audio** | 15-20 min pre-cortado | **~1 hora continua** (sistema corta) |
| **Chunking** | 15-20 min, 5s overlap | **15 min, 10s overlap** (más margen para frases) |
| **Diarización** | Mencionada vagamente | **Prompt estructurado: XISCO vs PROSPECTO, output JSON** |
| **Coste transcripción/mes** | ~12 EUR | **~$2-3** (incluso con 3h/día) |
| **Parallelización** | Secuencial | **4 chunks en paralelo** (más rápido) |
| **Merge** | No especificado | **Dedup por timestamp + unificación de speaker labels** |

### 5.3 Persistencia: ciclo completo

```
Crear (app/Obsidian) → Escribir .md con frontmatter → Graphify index
→ Agente consulta grafo → Procesa → Escribe resultado → Graphify re-index
→ App lee y visualiza → Si patrón 3+ veces → Promover a permanente
```

**Mapa de persistencia:**
- **Estático:** catálogo, precios, políticas, tono, script, scorecard, objeciones (Xisco edita en Obsidian)
- **Dinámico:** leads, sesiones, feedback, prospectos, propuestas (agentes + app)
- **Meta:** MEMORY, log, tracker-agendas, tracker-facturacion (auto)
- **Grafo:** graph.json (re-index tras escrituras)

### 5.4 Presupuesto real revisado

| Concepto | Coste |
|---|---|
| **MiniMax M3 plan** | ~50 EUR/mes |
| **Gemini 2.5 Flash-Lite** (1-3h audio/día) | ~$2-3/mes (~2-3 EUR) |
| **Total** | **~52-55 EUR/mes** (no 62 EUR) |

---

## 6. Roadmap de implementación

### Fase 0 — Limpieza del vault (1 día)
- [ ] Eliminar `01-IronMonkey/` vacío
- [ ] Eliminar carpetas vacías en `01-IronMonkeyCharter/`
- [ ] Limpiar referencias a LLMLingua2 en `index.md`
- [ ] Eliminar o rellenar `calendario-ejecucion.md`
- [ ] Limpiar caracteres chinos en `orquestacion.md` y `dashboards.md`
- [ ] Crear carpetas que la app necesita (vacías): `leads/`, `propuestas/`, `prospectos/`, `_logs/`
- [ ] Crear `log.md` inicial
- [ ] Instalar FFmpeg (`winget install Gyan.FFmpeg`)
- [ ] Instalar Playwright Chromium (`npx playwright install chromium`)
- [ ] Instalar Graphify (`pip install graphify` — verificar nombre real en PyPI)
- [ ] Instalar Caveman + taskmaster-ai
- [ ] Instalar Obsidian (opcional, pero recomendado para Xisco)
- [ ] Primer indexado del vault: `cd Agentik-OS-Vault && graphify .`

### Fase 1 — Esqueleto + lectura (1 semana)
**Objetivo:** app que LEE del vault, muestra el pipeline Iron Monkey con drag & drop, y expone endpoint de reindex Graphify.
- [ ] Crear monorepo + workspaces (`agentik-os-app/`)
- [ ] Backend Hono: endpoints `health`, `list-leads`, `get-lead`, `POST /graphify/reindex`
- [ ] Vault service con `gray-matter`
- [ ] Frontend Vite + React + Tailwind + shadcn
- [ ] AppShell + Sidebar + Topbar
- [ ] Pipeline Iron Monkey funcional (drag & drop con `dnd-kit`)
- [ ] Tipos compartidos en `packages/shared`
- [ ] Dev server arranca: `npm run dev` → http://localhost:5173 + http://localhost:3001
- [ ] Verificar: abrir app → ver el grafo de leads en columnas

### Fase 2 — Escritura + ICP (1 semana)
**Objetivo:** Xisco puede crear leads, meter notas, y el ICP Agent responde con score.
- [ ] LeadForm con zod (crear/editar leads)
- [ ] NoteEditor con "Guardar nota" → trigger ICP
- [ ] ICP Agent conectado a MiniMax M2.5
- [ ] Graphify integrado (subprocess wrapper, query por relevancia)
- [ ] Re-indexación automática tras cada escritura significativa
- [ ] Resultado ICP visible (score 1-10, estado, follow-ups)
- [ ] Botón "Generar oferta" condicional (score ≥ 7)
- [ ] Log de acciones en `03-Memoria/_logs/log.md`

### Fase 3 — Inteligencia completa: PDFs + audio (1-2 semanas)
**Objetivo:** end-to-end desde audio de 1h hasta feedback estructurado.
- [ ] Proposal Generator: Graphify queries → M3 → HTML → Playwright → PDF
- [ ] ProposalModal con preview del PDF
- [ ] AudioUploader con `react-dropzone` (drag & drop + progress)
- [ ] **Audio chunking con FFmpeg: 15 min + 10s overlap (no 5s)**
- [ ] **Transcripción paralela con Gemini 2.5 Flash-Lite (4 chunks simultáneos)**
- [ ] **Prompt de diarización estructurado (XISCO vs PROSPECTO, output JSON)**
- [ ] **Merge con dedup por timestamp + unificación de speaker labels**
- [ ] Call Analyzer: M3 analiza transcripción contra scorecard COL-Analyser v3.1
- [ ] Feedback Coach: wins + improvements + FIPAs
- [ ] SessionDetail con tabs (Transcripción / Feedback / Tendencia)
- [ ] Goal Tracker: KPIs + racha + gamificación
- [ ] 5 skills custom creadas (incluido `agentik-call-scorer` con COL-Analyser v3.1)

### Fase 4 — Polish + digests (1 semana)
**Objetivo:** producto terminado.
- [ ] Digest 08:00 Iron Monkey (4 listas priorizadas)
- [ ] Digest 08:00 Growing (FIPAs del día anterior, 3-5 insights)
- [ ] Digest 18:00 Growing (métricas del día)
- [ ] Service Worker para Web Notifications
- [ ] Dashboard con Recharts (KPI + trends + funnel)
- [ ] Memory Graph con `react-force-graph-2d` (visualización del grafo de Obsidian)
- [ ] Dark mode + atajos de teclado
- [ ] Error boundaries + skeleton loading
- [ ] Testing manual end-to-end
- [ ] README con instrucciones de arranque (incluye Obsidian + Graphify)

---

## 7. Convenciones

- **No** hacer commit sin que el usuario lo pida (regla del agente).
- **No** borrar archivos del vault — solo mover a `_archive/`.
- **No** inventar datos de clientes — la app lee lo que hay, no rellena huecos.
- **No** modificar el script canónico `guion_llamadas_frias_growing.md` sin que Xisco lo diga.
- **Sí** loguear cada acción del agente en `03-Memoria/_logs/log.md`.
- **Sí** respetar el trigger "NOTA" en Iron Monkey (crear perfil no dispara nada).
- **Sí** respetar el trigger "SUBIR AUDIO" en Growing (cascada completa automática).

---

## 8. Verificación de v1 completada

Cuando esté terminada la v1, debe poder hacerse lo siguiente end-to-end:

1. **Arrancar la app:** `cd agentik-os-app && npm run dev` → abre en `localhost:5173`
2. **Iron Monkey:** crear lead → meter nota → ver score ICP → generar propuesta → descargar PDF
3. **Growing:** subir audio de sesión → ver transcripción → ver feedback con score → ver FIPAs del digest 08:00
4. **Dashboard:** ver KPIs de ambos negocios actualizados
5. **Digest 08:00:** abrir la app a las 08:15 → ver banner con 4 listas priorizadas Iron Monkey + 3-5 FIPAs Growing
6. **Privacidad:** 100% local. `tcpdump` no captura nada saliendo a internet.

---

## 9. Lo que NO entra en v1

- Tauri / app empaquetada — sigue siendo web local
- Multi-usuario — sigue siendo 1 usuario
- Notificaciones push móviles — solo web local
- Sincronización entre dispositivos
- Backup automático cifrado (Syncthing se hace manual)

---

*Plan ejecutable — listo para delegar a `mavis-team` con tracks paralelos*
