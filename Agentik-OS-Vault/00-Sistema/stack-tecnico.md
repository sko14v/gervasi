# Stack técnico — Agentik O.S. (v1.0 corregido)

> Inventario de herramientas, modelos y dependencias de la **v1**.
> Esta versión es resultado del análisis de viabilidad del 2026-06-13.
> **Decisiones clave:** se elimina LLMLingua2 de la v1, se recalibran
> los multiplicadores de ahorro y se documenta la app React local.

---

## 1. Modelos de IA

| Modelo | Uso | Coste estimado | Notas |
|--------|-----|----------------|-------|
| **MiniMax M3** | Tareas complejas: propuestas PDF, feedback coaching, generación larga. | ~50 EUR/mes | Default para Proposal Generator y Feedback Coach. |
| **MiniMax M2.5** | Tareas de clasificación y tracking: estructurar fichas, actualizar CRM, KPIs. | Incluido en plan MiniMax M3 | Default para ICP, CRM Manager, Prospect Notes, Goal Tracker. |
| **Gemini Flash Lite** | Transcripción nativa de audio (llamadas de cold calling). | ~12 EUR/mes | Solo lo usa el Call Analyzer. |

> **Total modelos:** ~62 EUR/mes. Sin costes ocultos.

---

## 2. Herramientas de la v1 (2 dependencias open source)

> **Decisión:** se **elimina LLMLingua2** de la v1. Análisis de
> viabilidad: requiere modelo ML local pesado, integración con MiniMax
> no es automática, beneficio marginal cuando Graphify ya reduce el
> contexto. Se reevaluará en v2 si los tokens son problema real.

### 2.1 Graphify (grafo de conocimiento) ✅

- **Función:** indexa el vault `.md` y permite consultas por relevancia
  en lugar de leer archivos completos.
- **Ahorro realista:** 5-10x en contexto (NO 71.5x — ese número es un
  caso extremo teórico del paper original, no aplica a un vault de
  20-30 archivos como el nuestro).
- **Instalación:** `pip install graphify` (verificar nombre en PyPI; el
  documento original mencionaba `graphifyy` con doble y, que no es
  paquete oficial).
- **Uso en agentes:** antes de cada tarea, ejecutar
  `/graphify query "término relevante"`.
- **Indexación:** rebuild cada 24h o tras edición masiva del vault.

### 2.2 Caveman (compresión de output) ✅

- **Función:** estilo de respuesta que elimina artículos, preposiciones
  y conectores. Frases nominales, verbos en infinitivo.
- **Ahorro realista:** 1.4-1.6x (~38%) en output.
- **Instalación real (corregida):**
  - Para integrarlo como skill de agentes: `npx skills add juliusbrussee/caveman`
  - El script `curl` del documento original es para `caveman-code`
    (agente standalone), **no** es lo que necesitamos.
- **Aplicar a:** todas las respuestas internas, reportes, logs.
- **NO aplicar a:** PDFs, emails a clientes.

---

## 3. Multiplicador de ahorro recalibrado (realista)

> ❌ El documento original decía "570x combinado". Eso era
> matemáticamente incorrecto: las capas no se multiplican así
> (rendimientos decrecientes + capas作用于 diferentes tokens).

| Capa | Ahorro realista | Sobre qué actúa |
|------|-----------------|-----------------|
| **Graphify** | 5-10x | Contexto del vault (input) |
| **Caveman** | 1.4-1.6x | Output del agente |
| **Vault estructurado** | evita relectura | Organización |

**Multiplicador combinado realista: 10-20x** (no 570x). Es excelente,
pero comunicamos expectativas correctas.

### Ejemplo práctico recalibrado

```
Sin optimizar:
  - Prompt: 2.000 tokens
  - Contexto (5 archivos .md): 8.000 tokens
  - Output: 1.500 tokens
  - TOTAL: 11.500 tokens

Con Agentik O.S. v1:
  - Prompt: 2.000 tokens (sin LLMLingua2)
  - Contexto via Graphify: 1.000 tokens (8x ahorro)
  - Output caveman: 950 tokens (1.6x ahorro)
  - TOTAL: ~3.950 tokens
```

---

## 4. App local (capa de visualización y orquestación)

> **NUEVO en v1:** además del vault `.md`, montamos una **app local en
> React** que consume los datos del vault y los muestra de forma
> visual. No sustituye al vault — el vault sigue siendo la fuente
> de verdad. La app es la **cara visible**.

### 4.1 Qué hace la app

- **CRM visual** con pipeline de columnas (Iron Monkey).
- **Dashboard de KPIs** para ambos negocios.
- **Daily digest** con notificación push a las 08:00.
- **Visualización de la memoria** (grafo de nodos de Graphify).
- **Visor de feedbacks** y tendencias (Growing).
- **Lector de prospectos** y notas (Growing).
- **Gamificación** con objetivos y rachas (Growing).

### 4.2 Stack de la app

- **Framework:** React (Vite).
- **Lenguaje:** TypeScript.
- **Estilos:** TailwindCSS o CSS modules.
- **Visualización:** Recharts / visx para charts, dnd-kit para
  pipeline drag-and-drop.
- **Estado:** Zustand o Redux Toolkit.
- **Persistencia:** lectura/escritura de los `.md` del vault vía API
  local (Node + Express) o vía Tauri/Electron si queremos app de
  escritorio.
- **Notificaciones:** Web Push API + Service Worker para el digest
  08:00.

> **Decisión pendiente:** ¿la app corre como **web local** (localhost)
> o como **app de escritorio empaquetada** (Tauri)? Detalles en
> `app-arquitectura.md`.

### 4.3 Comunicación app ↔ vault ↔ agentes

```
┌─────────────┐
│  App React  │  ← lee/escribe → vault .md
│  (local)    │  ← dispara    → agentes (M3, M2.5, Gemini)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Vault .md  │  ← fuente de verdad
│  (Obsidian) │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Agentes    │  ← procesan y escriben de vuelta
│  (Python)   │
└─────────────┘
```

---

## 5. Capa de orquestación (decisiones)

> Claude marcó como punto crítico la falta de orquestación. Estas
> son las decisiones:

### 5.1 Iron Monkey

- **Entrada de leads:** Xisco rellena la ficha ICP **manualmente**
  (en la app, en un formulario). Sin trigger automático.
- **Cambios de estado:** Xisco los hace desde la app.
- **Generación de propuesta:** Xisco pulsa "Generar PDF" en la ficha.
- **Alertas:** la app las calcula y muestra en el digest 08:00.
- **Sin cron, sin file watcher, sin webhook externo** — todo es
  manual y visible.

### 5.2 Growing Inmobiliario

- **Subida de audio:** Xisco deja los archivos en `audios/sesion-YYYY-MM-DD/`.
  La app detecta los nuevos al abrirse y dispara el Call Analyzer.
- **Análisis:** automático al subir. Resultado se guarda en
  `02-GrowingInmobiliario/sesiones/{fecha}.md` y se muestra en la app.
- **Digest:** la app genera el digest de llamadas del día a las 18:00.
- **Feedback Coach:** corre semanal (domingo) y muestra resultados en
  la app con notificación.

### 5.3 Cadencias internas (digest y reportes)

- **08:00 daily** — digest Iron Monkey: pipeline, alertas, acciones.
- **18:00 daily** — digest Growing: llamadas, score, citas, objetivos.
- **Domingo 20:00** — weekly review de ambos negocios.

Todas las cadencias se ejecutan **al abrir la app** (no hay cron del
sistema). La app detecta la hora y, si coincide con una cadencia,
genera y muestra la notificación.

---

## 6. Vault

- **Tipo:** archivos Markdown (`.md`).
- **Editor recomendado:** Obsidian (soporta graph view nativo,
  sincronización opcional).
- **Estructura:** ver `index.md` sección 4.
- **Indexación Graphify:** rebuild cada 24h o tras edición masiva.
- **Alineación de nombres:** el vault usa **nombres descriptivos**
  (`catalogo-embarcaciones.md`, `tono-marca.md`, etc.). `AGENTIK-OS.md`
  y los prompts de los agentes referencian estos nombres, NO los
  cortos del documento original.

---

## 7. Privacidad y datos

- **Almacenamiento:** 100% local. Carpeta del vault en disco local.
- **App React:** corre en `localhost`, sin conexión a internet.
- **Audios de llamadas:** locales. Archivo original puede moverse a
  `_archive/` tras 30 días.
- **Datos de clientes:** NUNCA salen a cloud de terceros.
- **Backups:** backup semanal del vault a disco externo o sincronización
  cifrada (Syncthing).

---

## 8. Orden de instalación

```bash
# 1. Verificar paquete Graphify en PyPI
pip install graphify     # ajustar nombre real si es distinto

# 2. Caveman como skill (NO usar el curl del doc original)
npx skills add juliusbrussee/caveman

# 3. App React (cuando esté lista)
cd ~/agentik-os-app
npm install
npm run dev    # → http://localhost:5173
```

> **Acción pendiente:** verificar la disponibilidad real del paquete
> `graphify` antes de marcar el checklist como completo. Caveman ya
> está confirmado como skill instalable.

---

## 9. Stack NO usado (descartado conscientemente)

- **LLMLingua2** — complejidad no justificada en v1. Reevaluar en v2.
- **Notion / Obsidian Cloud** — evita dependencia de cloud propietario.
- **Pinecone / Weaviate hosted** — sustituido por Graphify local.
- **GPT-4 / Claude API** — sustituido por MiniMax por presupuesto.
- **Zapier / Make** — sustituido por la app React local + entrada manual.
- **WeasyPrint** — sustituido por Playwright (más fiable en Windows).
- **Google Sheets como CRM** — el CRM vive en el vault, la app lo
  renderiza. Sin dependencia de Google.

---

_Agentik O.S. v1.0 — Stack corregido. Si cambias algo, actualiza
`MEMORY.md` (sección 3) y `AGENTIK-OS.md` (sección 3)._
