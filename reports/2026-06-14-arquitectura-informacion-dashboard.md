# Reporte de Arquitectura de Información — Agentik O.S. v2

> **Objetivo:** Replantear la organización a nivel de páginas del Dashboard para que Xisco (operador único de dos negocios — Iron Monkey Charter y Growing Inmobiliario) pueda ver **de un vistazo** lo importante de cada negocio y actuar en segundos.
>
> **Enfoque:** usabilidad pura. No se define paleta, tipografía ni componentes visuales (eso ya está decidido en `AGENTIK-OS.md` y el estilo actual dark mission-control). Aquí se decide **qué páginas existen, qué información va en cada una, cómo se conectan, y en qué orden aparecen en la navegación**.
>
> **Audiencia del reporte:** agentes de programación que construirán la primera versión.
>
> **Fecha:** 2026-06-14 · **Versión:** 1.0

---

## 1. Diagnóstico del estado actual

### 1.1 Inventario de páginas existentes

Inspección de `agentik-os-app/packages/app/src/App.tsx` y `Sidebar.tsx`:

| Ruta actual | Página | Qué muestra | Problema detectado |
|-------------|--------|-------------|--------------------|
| `/` | `Home` | Resumen narrativo del día, alertas prioritarias, 2 cards grandes (Iron Monkey + Growing) | **Solapa con Dashboard** — ambos son resúmenes; ninguno es claramente "lo que tengo que hacer HOY" |
| `/iron-monkey` | `IronMonkey` | Pipeline drag&drop, leads | Es vista operativa del negocio, no un dashboard. **Bien en concepto**, mal en nombre (debería ser "CRM" o "Pipeline") |
| `/growing` | `Growing` | Datos de cold calling | Igual: es vista operativa, no un dashboard. **Bien en concepto** |
| `/dashboard` | `Dashboard` | 4 KPI cards + Trend + Funnel + Semáforos + Alertas | **Es la vista de números agregados de los dos negocios**, pero compite con `Home` por el mismo territorio |
| `/memory` | `Memory` | Grafo de memoria, aprendiajes | Bien — vista exploratoria, no compite |
| `/settings` | `Settings` | Configuración general | Bien |

### 1.2 Problemas de usabilidad detectados

1. **Ambigüedad Home vs. Dashboard.** Xisco abre la app y tiene dos pantallas candidatas a "lo primero del día": Home (digest narrativo) y Dashboard (KPIs). ¿Cuál mira primero? No está claro. Ambas contienen alertas.

2. **Jerarquía invertida en el sidebar.** El orden actual es: `Home → Iron Monkey → Growing → Dashboard → Memory → Settings`. Esto coloca "Home" (un digest opcional) **antes** que los dos negocios que generan el 100% del revenue. Para un freelance con dos negocios, el sidebar debe empezar por los negocios, no por una vista agregada.

3. **Etiquetas "Iron Monkey" y "Growing" como navegación top-level.** El nombre del negocio no es la acción. Xisco no piensa "voy a Iron Monkey"; piensa **"tengo que mirar leads", "tengo que llamar", "tengo que subir audio"**. El nombre del negocio es un nombre propio, no una categoría de navegación. Confunde con nombres de productos externos.

4. **Dashboard no prioriza.** Mezcla KPIs de Iron Monkey y Growing sin que Xisco pueda filtrar por negocio. Si en una mañana Xisco solo va a hacer llamadas (Growing), el Dashboard le está gritando sobre propuestas pendientes (Iron Monkey) y viceversa.

5. **Falta de "Hoy" como concepto.** El sistema emite un digest 08:00 con FIPAs (Growing) y alertas CRM (Iron Monkey), pero **no hay una pantalla dedicada a "qué tengo que hacer hoy"**. Ese contenido se reparte entre Home y Dashboard y se pierde.

6. **Falta de atajo para las dos acciones críticas del día:**
   - Iron Monkey: **"Añadir nota a lead"** (trigger del ICP)
   - Growing: **"Subir audio"** (trigger del Call Analyzer)
   Estas dos acciones son los **dos eventos más importantes** del flujo y no tienen un CTA visible permanente.

7. **"Memory" como top-level.** El grafo de memoria es una vista técnica, no operativa. Xisco no lo abre a diario (lo abren los agentes, no él). Debería estar subordinado o accesible vía menú de usuario.

---

## 2. Principios de diseño (decisiones de fondo)

Estos principios guían todas las decisiones concretas del reporte. Cada uno está justificado con un dato del usuario o del sistema.

### P1. **Los negocios van primero, siempre.**

> Xisco abre la app cada mañana con una sola pregunta en la cabeza: **"¿qué negocio toca hoy?"**. El 100% de su revenue viene de Iron Monkey y Growing. El sidebar debe reflejarlo literalmente.

- Iron Monkey y Growing son los **dos objetos top-level** del sidebar.
- El resto cuelga de ellos o es transversal.

### P2. **Una pantalla = una pregunta.**

> "Mission control" no significa "todo en una pantalla". Significa **"la respuesta a tu pregunta más importante está a 1 click"**.

- `Hoy` → "¿qué tengo que hacer hoy?"
- `Iron Monkey > Pipeline` → "¿en qué estado está cada lead?"
- `Growing > Llamadas` → "¿cuánto llevo hoy / qué sesión voy a analizar?"
- `KPIs` → "¿estoy cumpliendo objetivos?"
- `Vault` → "¿qué sabe el sistema sobre X?"

Si una pantalla intenta responder dos preguntas, se divide.

### P3. **Acción crítica visible, no escondida.**

> El ICP se activa al guardar nota. El Call Analyzer se activa al subir audio. **Esas dos acciones son el motor del sistema.** No pueden vivir 3 clicks adentro.

- Cada negocio expone su acción primaria en **dos lugares**: en su página principal (botón grande) y en el **Topbar global** (botones siempre visibles, con color de marca del negocio).

### P4. **Filtros por defecto, no por configuración.**

> Xisco alterna entre negocios por sesión (mañana = Growing, tarde = Iron Monkey, o según el día). No debería tener que filtrar manualmente cada vez.

- El sistema **recuerda el último negocio activo** y arranca ahí al abrir la app.
- En el Topbar hay un **switcher de negocio** explícito para alternar en 1 click.
- Las vistas agregadas (KPIs, Hoy) tienen un toggle "ambos / Iron Monkey / Growing".

### P5. **Jerarquía de información: del presente al histórico.**

> En cualquier dashboard, la lectura natural es: **1) ¿qué pasa ahora? → 2) ¿qué tenía que pasar? → 3) ¿qué pasó ayer? → 4) ¿qué tendencia llevo?**. La estructura de página debe respetar ese orden visual (arriba = presente, abajo = histórico).

### P6. **Frecuencia de uso = profundidad en el sidebar.**

> Un ítem del sidebar se abre a diario → top-level. Se abre una vez por semana → segundo nivel. Se abre una vez al mes → menú de usuario o sub-página.

Aplicado:
- **A diario:** Hoy, los dos negocios, KPIs, subir audio / añadir nota.
- **Semanal:** Prospectos (Growing), Propuestas borrador (Iron Monkey), Weekly review.
- **Esporádico:** Vault, Settings, Memory.

### P7. **Cero redundancia entre Home y Dashboard.**

> Decisión dura: **se elimina "Home" como página narrativa**. Su contenido se redistribuye así:
> - Alertas del CRM Manager → al **Topbar** (badge con número, panel desplegable) y a **Hoy** (lista priorizada).
> - KPIs agregados → van a **KPIs** (nueva página, antes llamada "Dashboard").
> - Resumen narrativo del día → se queda en **Hoy**, con tono escueto tipo briefing.

---

## 3. Sitemap propuesto (arquitectura final)

```
/                                →  HOY                [resumen del día, 1 click al abrir]
├─ /iron-monkey                  →  IRON MONKEY        [objeto: negocio]
│  ├─ /iron-monkey/pipeline      →  Pipeline           [kanban de leads]
│  ├─ /iron-monkey/leads         →  Leads              [lista + filtros]
│  │  └─ /iron-monkey/leads/:id  →  Lead (ficha)       [datos + notas + ICP]
│  ├─ /iron-monkey/propuestas    →  Propuestas         [drafts y enviadas]
│  └─ /iron-monkey/seguimiento   →  Seguimiento        [follow-ups programados]
│
├─ /growing                      →  GROWING            [objeto: negocio]
│  ├─ /growing/sesiones          →  Sesiones           [lista de sesiones]
│  │  └─ /growing/sesiones/:id   →  Sesión (ficha)     [transcripción + análisis]
│  ├─ /growing/sesion-nueva      →  Subir audio        [acción primaria: CTA grande]
│  ├─ /growing/prospectos        →  Prospectos         [fichas]
│  ├─ /growing/fipas             →  FIPAs              [insights para mañana]
│  └─ /growing/weekly            →  Weekly Review      [solo domingos]
│
├─ /kpis                         →  KPIs               [métricas agregadas, filtrables por negocio]
├─ /hoy                          →  HOY                [redirect desde "/", briefing diario]
│
└─ Menú de usuario (avatar arriba derecha):
   ├─ /vault                      →  Vault              [grafo de memoria, índice del sistema]
   ├─ /memory                     →  Memory             [grafo técnico, vista dev]
   └─ /settings                   →  Settings           [configuración]
```

### 3.1 Rutas renombradas (migración)

Para evitar romper nada, los agentes de programación pueden mantener las rutas actuales como alias:

| Ruta nueva (preferida) | Alias de ruta vieja | Página |
|------------------------|---------------------|--------|
| `/hoy` | `/` | Briefing diario (antes Home) |
| `/kpis` | `/dashboard` | Métricas agregadas (antes Dashboard) |
| `/iron-monkey` | — | Vista de negocio (se mantiene) |
| `/iron-monkey/pipeline` | `/iron-monkey` (vista por defecto) | Pipeline |
| `/growing` | — | Vista de negocio (se mantiene) |
| `/growing/sesiones` | `/growing` (vista por defecto) | Sesiones |
| `/growing/sesion-nueva` | nuevo | Subir audio (acción primaria) |
| `/vault` | `/memory` (movido) | Vault |
| `/settings` | — | Settings (se mantiene) |

---

## 4. Sidebar — Diseño final

### 4.1 Estructura visual

```
┌─────────────────────────────┐
│ [logo] Agentik O.S.         │  Header
├─────────────────────────────┤
│ 🏠  Hoy                  3  │  ← badge con alertas del día
├─────────────────────────────┤
│                             │
│ IRON MONKEY          [⚓]   │  ← header de sección (color ámbar)
│   Pipeline              4   │  ← badge = leads con follow-up hoy
│   Leads                 12  │  ← badge = leads activos
│   Propuestas            2   │  ← badge = drafts sin enviar
│   Seguimiento               │
│                             │
│ GROWING              [📞]   │  ← header de sección (color primary/azul)
│   Subir audio          +    │  ← CTA destacado (no badge, símbolo +)
│   Sesiones             3    │  ← badge = sesiones sin analizar
│   Prospectos                │
│   FIPAs                        ← muestra nº de FIPAs pendientes como badge
│   Weekly                       │
│                             │
├─────────────────────────────┤
│ 📊  KPIs                    │  ← vista transversal
├─────────────────────────────┤
│ [avatar] Xisco              │  ← menú de usuario
│   ▸ Vault                   │
│   ▸ Memory                  │
│   ▸ Settings                │
│   ▸ Ayuda (?)               │
├─────────────────────────────┤
│ 🕐 18:42:55   v0.1.0        │  ← footer (reloj + versión)
└─────────────────────────────┘
```

### 4.2 Reglas del sidebar

1. **Orden de secciones (de arriba a abajo):**
   1. **Hoy** (transversal al sistema)
   2. **Iron Monkey** (negocio 1 — va primero porque tiene más "urgencia silenciosa" — leads sin follow-up, propuestas sin respuesta, son pérdidas de dinero si no se miran a diario)
   3. **Growing** (negocio 2)
   4. **KPIs** (vista transversal)
   5. Menú de usuario (abajo, agrupado)

2. **Headers de sección (Iron Monkey, Growing):** clickables. Llevan a la vista de resumen del negocio (`/iron-monkey` y `/growing`).

3. **Items de sección (Pipeline, Leads, etc.):** solo aparecen cuando su sección está expandida. **Por defecto, ambas secciones están expandidas** (porque Xisco las mira a diario). Se puede colapsar si la pantalla es pequeña.

4. **Badges numéricos:**
   - Calculados en vivo desde los datos.
   - Color ámbar (`bg-amber-600/90`) para Iron Monkey (consistente con el actual).
   - Color primary (`bg-primary-600/95`) para Growing.
   - Si el badge es 0, no se muestra (no se muestra "0" — silencio).

5. **CTA "Subir audio":** no es un NavLink más, es un **botón de acción** con icono `+` y color primary. Visualmente diferenciado del resto (borde sutil, fondo semitransparente). Esto refuerza la regla P3: la acción crítica es visible.

6. **Frecuencia de uso semanal/mensual** (Vault, Memory, Settings) **fuera del sidebar principal**, dentro del menú de usuario (avatar abajo a la izquierda). Esto sigue la regla P6.

### 4.3 Switcher de negocio (en el Topbar)

Además del sidebar, **el Topbar lleva un switcher de negocio explícito**:

```
[ 🏠 Hoy ]  [ ⚓ Iron Monkey ▾ ]  [ 📞 Growing ▾ ]      ← siempre visible
```

- Es un **segmented control** o un **dropdown**.
- Al cambiar de negocio, se carga la vista por defecto de ese negocio (`/iron-monkey` o `/growing`).
- El estado del switcher se persiste en `localStorage` (regla P4: recordar el último activo).

---

## 5. Páginas — Diseño detallado

Para cada página defino: propósito, pregunta que responde, contenido (de arriba a abajo), y comportamiento.

### 5.1 `HOY` (`/hoy`, ruta por defecto `/`)

> **Pregunta que responde:** *"¿qué tengo que hacer hoy?"*

**Audiencia:** vista diaria de la mañana (llega con el digest 08:00) o re-entradas a media jornada.

**Contenido (orden de lectura):**

1. **Header — saludo contextual:** "Buenos días, Xisco. Hoy es sábado 14 de junio." (tono escueto, no Marketero)
2. **Resumen ejecutivo (1 línea):** "3 leads Iron Monkey piden follow-up · 2 FIPAs de Growing para aplicar hoy · 0 prospectos pendientes"
3. **Bloque IRON MONKEY — "Tareas de hoy":**
   - Lista priorizada de los 3-5 leads con acción hoy (follow-up, propuesta pendiente de revisar, lead nuevo que requiere primera llamada)
   - Cada item: nombre del lead + acción + chip de urgencia (hace 2 días / hoy / vence hoy)
   - CTA al final: `+ Añadir nota a lead` (abre la ficha del lead elegido o un modal de selección)
4. **Bloque GROWING — "Tareas de hoy":**
   - **FIPAs del día** (3-5 insights accionables con objetivo medible, del digest 08:00)
   - **Estado de la última sesión** (si hay audio pendiente de analizar: "1 sesión sin analizar · Subir audio")
   - **Racha / gamificación** (mini-card con la racha actual, opcional pero motivante)
   - CTA: `+ Subir audio de hoy`
5. **Bloque KPIs — "Cómo vas":**
   - Una sola fila: 4 indicadores clave (Hoy: 0/100 llamadas · 0/3 citas · 0% mes · Score promedio: —)
   - Cada uno con su objetivo al lado y color semáforo (verde / ámbar / rojo)
6. **Alertas del sistema:** listado consolidado de alertas CRM (Iron Monkey) + alertas Growing (sesiones sin analizar > 24h, etc.)
7. **Footer — última actualización:** "Digest generado 08:00 · refrescado hace 4 min"

**Comportamiento:**
- Refresco automático cada 5 minutos (silent).
- Pull-to-refresh en mobile (futuro).
- Si no hay tareas pendientes en un bloque, el bloque se colapsa a una sola línea: "Iron Monkey · 0 tareas pendientes".
- Modo "vacío" (sin datos, app recién instalada): mensaje claro de "Sube tu primera sesión o crea tu primer lead para empezar".

**Frecuencia de uso:** diaria, varias veces al día.

---

### 5.2 `IRON MONKEY` (`/iron-monkey`)

> **Pregunta que responde:** *"¿cuál es el estado de mi pipeline de charters?"*

**Sub-páginas (sección expandible en el sidebar):**

#### 5.2.1 `/iron-monkey/pipeline` — **Pipeline** (vista por defecto)

**Contenido:**
1. Header con título "Pipeline" + CTA destacado `+ Nuevo lead` (esquina superior derecha).
2. **Filtros rápidos (sticky en la parte superior):** Todos / Cualificados / Tibios / Calientes / Sin actividad >48h.
3. **Vista Kanban** (ya existe drag&drop) con las columnas del pipeline:
   - `nuevo` · `contactado` · `cualificado` · `propuesta_borrador` · `propuesta_enviada` · `en_negociacion` · `ganado` · `perdido` · `descartado`
4. Cada card de lead: nombre, embarcación de interés, score ICP (1-10), días desde último contacto, próximo paso.
5. Click en card → abre ficha de lead en panel lateral (drawer) o navega a `/iron-monkey/leads/:id`.

**Badge en el sidebar:** número de leads con follow-up vencido (estado `cualificado` o `propuesta_enviada` sin actividad en 48h).

#### 5.2.2 `/iron-monkey/leads` — **Leads** (lista)

**Contenido:**
1. Header + CTA `+ Nuevo lead`.
2. Barra de búsqueda (por nombre, email, teléfono).
3. Filtros: estado, sensación, score mínimo, fecha de creación, asignado a campaña (futuro).
4. Tabla/lista compacta con columnas: nombre, fecha, estado, score, último contacto, próximo paso, acción.
5. Click en fila → ficha de lead.

**Badge en el sidebar:** número de leads activos (no perdidos, no descartados).

#### 5.2.3 `/iron-monkey/leads/:id` — **Ficha de lead**

**Contenido (en este orden):**
1. Header: nombre del lead + score + sensación (chip de color).
2. Datos de contacto (email, teléfono, fuente).
3. **Bloque "Embarcación de interés"** (si está definido) — con link al catálogo.
4. **Historial de notas** (cronológico, la más reciente arriba). Cada nota es la entrada que dispara el ICP.
5. **Botón "Generar oferta"** — solo visible si `score >= 7 && sensacion === 'caliente'`. Es un CTA destacado.
6. **Propuestas asociadas** (link a `/iron-monkey/propuestas/:id`).
7. **Próximos pasos / Follow-ups** (lista con fecha y motivo).
8. **Timeline** (todos los eventos: notas, cambios de estado, propuestas, follow-ups).

**Comportamiento:**
- La ficha es el lugar canónico donde Xisco pega la NOTA. Al guardar la nota, se dispara el agente ICP (ya documentado en AGENTIK-OS.md §5.2.1).
- La ficha es accesible desde HOY (tareas) y desde Pipeline (cards).
- Estado del lead editable inline (cambia a otro estado arrastrando en Pipeline o con dropdown aquí).

#### 5.2.4 `/iron-monkey/propuestas` — **Propuestas**

**Contenido:**
1. Header + CTA `+ Nueva propuesta` (aunque en la práctica, se generan desde la ficha del lead).
2. Filtros: `borrador` / `enviada` / `aceptada` / `rechazada`.
3. Lista de propuestas: nombre del lead, embarcación, precio total, fecha de creación, fecha de envío (si aplica), estado.
4. Cada item expandible: preview de la propuesta, botones `Editar`, `Descargar PDF`, `Marcar como enviada`, `Marcar como aceptada/rechazada`.

**Badge en el sidebar:** número de propuestas en estado `borrador` (porque son las que requieren acción de Xisco: revisar y enviar).

#### 5.2.5 `/iron-monkey/seguimiento` — **Seguimiento**

**Contenido:**
1. Header: "Próximos follow-ups".
2. **Tres pestañas:** `Hoy` · `Esta semana` · `Vencidos` (con badge en la última).
3. Lista de follow-ups programados (los que el agente ICP o CRM Manager programó tras la última nota).
4. Cada item: nombre del lead + motivo del follow-up + fecha + botones `Hecho` / `Posponer` / `Cancelar`.
5. Al marcar como `Hecho`, se registra en el timeline del lead y se elimina de la lista.

**Sin badge permanente** (es de uso puntual, no diario).

---

### 5.3 `GROWING` (`/growing`)

> **Pregunta que responde:** *"¿cómo va mi actividad de cold calling?"*

**Sub-páginas:**

#### 5.3.1 `/growing` (vista por defecto) — **Resumen del día**

**Contenido:**
1. Header: "Growing — hoy, [fecha]".
2. **Estado del día:**
   - Llamadas hechas hoy: X / 100 (barra de progreso)
   - Citas agendadas hoy: X / 3
   - Talk ratio promedio: X% (objetivo <60%)
   - Score promedio de la última sesión: X / 100
3. **Última sesión analizada** (resumen): score, calls, appointments, talk, sentimiento. Click para abrir ficha.
4. **FIPAs de hoy** (los 3-5 insights para aplicar, en formato checkable: Xisco puede marcarlos como "aplicado" durante la sesión).
5. CTA grande: `+ Subir audio de hoy` (lleva a `/growing/sesion-nueva`).
6. **Mini-card de racha / gamificación** (días consecutivos, mejor marca, etc.).
7. **Botón "Empezar sesión ahora"** (abre el script de cold calling y el scorecard de la sesión, opcional para v2).

**Badge en el sidebar:** número de sesiones sin analizar (audio pendiente de procesar).

#### 5.3.2 `/growing/sesion-nueva` — **Subir audio** (acción primaria)

> Esta es **LA página más importante de Growing** porque es el trigger del Call Analyzer. Tiene que ser directa, sin distracciones.

**Contenido:**
1. Header: "Subir audio de sesión".
2. **Dropzone grande** (drag&drop o click) — acepta MP3, M4A, WAV.
3. Selector de fecha de la sesión (default: hoy).
4. Notas opcionales de contexto (Xisco puede pegar aquí el tipo de prospectos a los que llamó, su objetivo de la sesión, etc.).
5. Botón `Analizar sesión` (CTA grande, color primary).
6. **Estado del procesamiento** (cuando hay un audio en cola): barra de progreso, paso actual (transcribiendo / analizando / generando feedback).
7. **Historial rápido:** últimos 3 análisis con link a su ficha.

**Comportamiento:**
- Al subir, el archivo se envía al backend y se dispara la cascada del Call Analyzer (chunking 15-20min → Gemini transcribe → M3 analiza → Feedback Coach).
- Mientras se procesa, Xisco puede navegar a otras páginas. Cuando termina, recibe notificación en el Topbar.
- Errores: reintento manual, mensaje claro ("Audio corrupto", "Transcripción falló", etc.).

**Acceso rápido:** desde el Topbar (botón `+ Subir audio` siempre visible) Y desde el sidebar (CTA con símbolo `+`).

#### 5.3.3 `/growing/sesiones` — **Sesiones** (lista)

**Contenido:**
1. Header: "Sesiones".
2. Filtros: rango de fechas, rango de score, presencia/ausencia de FIPAs.
3. Lista de sesiones (más reciente arriba): fecha, duración, calls, score, appointments, sentimiento (chip).
4. Click en fila → ficha de sesión.

**Badge en el sidebar:** número de sesiones sin analizar (mismo que en la vista por defecto, para consistencia).

#### 5.3.4 `/growing/sesiones/:id` — **Ficha de sesión**

**Contenido:**
1. Header: fecha + duración + score grande.
2. **Resumen ejecutivo:** calls, appointments, talk ratio, sentimiento.
3. **Wins** (3-5 bullets con timestamp).
4. **Improvements** (3-5 bullets por área).
5. **Tendencia:** comparación con las 5 sesiones anteriores (↑ / ↓ / =).
6. **Llamadas individuales** (lista de llamadas de la sesión): expandable con su transcripción, score por bloque (apertura, descubrimiento, objeciones, cierre, técnico), objeciones detectadas, cita agendada (sí/no).
7. **FIPAs generados** (los insights específicos para después de esta sesión).
8. Botones: `Descargar reporte PDF` (futuro), `Volver a analizar` (re-trigger del agente, opcional).

**Comportamiento:**
- Es la página donde Xisco va a leer su feedback.
- Layout diseñado para scroll vertical largo (es lo más denso del sistema).
- Las llamadas individuales se pueden expandir/colapsar para no abrumar.

#### 5.3.5 `/growing/prospectos` — **Prospectos**

**Contenido:**
1. Header: "Prospectos".
2. Filtros: cita agendada / pendiente / perdido, ICP match, fecha.
3. Tabla/lista de prospectos: nombre, empresa, cita agendada (fecha), score de match ICP, próxima acción.
4. Click → ficha de prospecto (datos + historial de llamadas + objeciones + próxima cita).

**Sin badge permanente** (uso semanal).

#### 5.3.6 `/growing/fipas` — **FIPAs** (Feedback Insights Para Aplicar)

**Contenido:**
1. Header: "FIPAs".
2. Pestañas: `Hoy` · `Archivados` (los que Xisco marcó como aplicados o descartados).
3. Lista de FIPAs: área + acción específica + objetivo medible + checkbox `Aplicado hoy`.
4. Cada FIPA es de un día. Los de días anteriores se archivan automáticamente (siguen visibles en `Archivados`).
5. Botón `Ver Weekly Review` (link a `/growing/weekly`).

**Badge en el sidebar:** número de FIPAs pendientes (los que Xisco aún no ha marcado como aplicados del día).

#### 5.3.7 `/growing/weekly` — **Weekly Review** (solo domingos)

**Contenido:**
1. Header: "Weekly Review — semana del [fecha]".
2. Resumen de la semana: total llamadas, citas, cierres, score promedio.
3. **Top 3 wins de la semana.**
4. **Top 3 improvements.**
5. **Tendencia semanal** (gráfico: lunes a domingo).
6. **Comparativa con la semana anterior.**
7. **Proyección mensual** (al ritmo actual, ¿llego al objetivo de 3 cierres?).
8. **Plan de acción para la próxima semana** (3-5 FIPAs a aplicar).

**Sin badge permanente** (uso semanal). Visibilidad alta solo los domingos (puede tener un banner "Weekly Review disponible" en HOY el domingo).

---

### 5.4 `KPIs` (`/kpis`, antes `/dashboard`)

> **Pregunta que responde:** *"¿estoy cumpliendo los objetivos globales de mis dos negocios?"*

**Contenido:**
1. Header: "KPIs" + selector de rango de fechas (Hoy / Esta semana / Este mes / Personalizado) + toggle de negocio (Ambos / Iron Monkey / Growing).
2. **Fila 1 — KPIs Iron Monkey (visibles solo si filtro los incluye):**
   - Leads totales (período)
   - Tasa de cierre (leads ganados / leads totales)
   - Pipeline value (suma de propuestas activas)
   - Ciclo de venta promedio (días)
   - Follow-ups vencidos (alerta)
3. **Fila 1 — KPIs Growing (visibles solo si filtro los incluye):**
   - Llamadas (período vs objetivo)
   - Citas (período vs objetivo)
   - Ratio citas/llamadas (objetivo: 15%)
   - Score promedio (objetivo: >75)
   - Cierres (período)
4. **Fila 2 — Tendencias (gráficos Recharts):**
   - Línea temporal de score (Growing)
   - Funnel de pipeline (Iron Monkey)
5. **Fila 3 — Semáforos:** estado de cada objetivo grande (verde / ámbar / rojo).
6. **Fila 4 — Alertas priorizadas:** lista de cosas que requieren atención.

**Comportamiento:**
- Toggle "Ambos / Iron Monkey / Growing" en el header (regla P4: filtros por defecto).
- Gráficos interactivos con hover para ver detalle.
- Exportable a CSV (botón secundario).

**Frecuencia de uso:** diaria (vista rápida) o semanal (vista profunda).

---

### 5.5 Menú de usuario (avatar abajo en el sidebar)

#### 5.5.1 `Vault` (`/vault`, antes `/memory`)

> **Pregunta que responde:** *"¿qué sabe el sistema sobre [tema]?"*

**Contenido:**
1. Header: "Vault".
2. Buscador grande (es lo principal — la búsqueda es la acción).
3. Resultados agrupados por sección: `00-Sistema/`, `01-IronMonkeyCharter/`, `02-GrowingInmobiliario/`, `03-Memoria/`.
4. Click en resultado → vista del archivo `.md` renderizado.
5. Sidebar interno con el árbol de carpetas (navegación clásica de vault).

**Comportamiento:**
- El buscador usa Graphify (ya documentado en AGENTIK-OS.md).
- Los resultados son fragmentos relevantes, no el archivo entero (ahorro de tokens — citado en §3 del AGENTIK-OS.md).

#### 5.5.2 `Memory` (`/memory`)

> Vista técnica del grafo de memoria. **Acceso solo desde el menú de usuario** (no en el sidebar principal).

Sin cambios respecto a lo ya implementado.

#### 5.5.3 `Settings` (`/settings`)

Sin cambios.

---

## 6. Topbar — Comportamiento

El Topbar (ya implementado) gana nuevos elementos:

```
[ Logo pequeño ]   [ 🏠 Hoy | ⚓ Iron Monkey | 📞 Growing ]   [ 🔔 3 ]   [ avatar Xisco ▾ ]
                    └─────── switcher de negocio ──────────┘   └─ alertas
```

- **Switcher de negocio:** persistente en todas las páginas, refleja el "foco" actual de Xisco.
- **Icono de campana con badge:** muestra el número total de alertas (Iron Monkey + Growing consolidadas). Click → panel desplegable con la lista de alertas, link a cada una.
- **Avatar:** menú de usuario (Vault, Memory, Settings, Ayuda, Cerrar sesión).

---

## 7. Mapa de acciones críticas (CTAs)

Para que ningún flujo crítico quede escondido:

| Acción | Trigger del agente | Dónde se ofrece | Prioridad visual |
|--------|--------------------|-----------------|------------------|
| **Añadir nota a lead** (Iron Monkey) | ICP | (1) Topbar siempre visible · (2) `/iron-monkey/pipeline` esquina superior derecha · (3) `/iron-monkey/leads` · (4) ficha de lead (botón principal) · (5) bloque Iron Monkey en HOY | Color ámbar (marca de negocio) |
| **Generar propuesta** (Iron Monkey) | Proposal Generator | (1) ficha de lead (solo si score ≥7 y caliente) | Color ámbar |
| **Subir audio** (Growing) | Call Analyzer | (1) Topbar siempre visible · (2) CTA destacado en `/growing` · (3) CTA principal en `/growing/sesion-nueva` · (4) bloque Growing en HOY | Color primary (azul) |
| **Marcar FIPA como aplicado** (Growing) | Goal Tracker | (1) bloque Growing en HOY · (2) `/growing/fipas` | Color primary, secundario |
| **Revisar propuesta** (Iron Monkey) | — | (1) badge en sidebar · (2) bloque Iron Monkey en HOY | Secundario |

---

## 8. Estados vacíos y errores (política)

Para que la app no rompa la confianza del usuario:

| Estado | Comportamiento |
|--------|----------------|
| **Sin leads** | Pipeline muestra columnas vacías con un placeholder "Sin leads en este estado" + CTA grande `+ Nuevo lead`. Si la columna entera está vacía, mensaje más elaborado. |
| **Sin sesiones** | `/growing/sesiones` muestra ilustración + CTA `+ Subir tu primera sesión`. |
| **Audio en procesamiento** | Banner persistente en la app: "Analizando sesión del 14 jun · 65% · hace 3 min" con progreso. |
| **Backend caído** | Banner rojo en la parte superior: "Sin conexión con el sistema. Algunas funciones no están disponibles." Las páginas de solo lectura (KPIs históricos) funcionan con caché. |
| **Vault no configurado** | Settings muestra alerta roja con instrucciones para configurar `AGENTIK_VAULT_PATH`. |
| **Día sin actividad** | HOY muestra mensaje motivante: "Hoy no tienes tareas pendientes. Buen momento para revisar el catálogo de Growing." |
| **FIPAs agotados** (todos aplicados) | `/growing/fipas` muestra "Has aplicado todos los FIPAs de hoy. Nos vemos en el digest 08:00." |

---

## 9. Atajos de teclado (extensión de lo existente)

| Atajo | Acción | Notas |
|-------|--------|-------|
| `g + h` | Ir a Hoy | Mantener (ya existe) |
| `g + i` | Ir a Iron Monkey | Mantener (ya existe) |
| `g + w` | Ir a Growing | Mantener (ya existe) |
| `g + k` | Ir a KPIs | Nuevo (cambia "Dashboard" → "KPIs") |
| `g + s` | Ir a Settings | Mantener (ya existe) |
| `g + m` | Ir a Memory | Mantener (ya existe) |
| `n` | Nueva nota (en Iron Monkey) | Abre selector de lead → editor de nota |
| `u` | Subir audio (en Growing) | Abre dropzone |
| `?` | Ayuda de atajos | Mantener (ya existe) |
| `Esc` | Cerrar panel/modal | Mantener |
| `/` | Focus en buscador del Vault | Nuevo (cuando estás en /vault) |

---

## 10. Persistencia y comportamiento por defecto

| Comportamiento | Implementación |
|----------------|----------------|
| Último negocio activo | `localStorage.ultimoNegocio = "iron-monkey" \| "growing"` |
| Vista por defecto al entrar | Si hay `ultimoNegocio`, redirige a `/iron-monkey` o `/growing`. Si no, va a `/hoy`. |
| Filtros de KPIs recordados | `localStorage.kpisFiltro = { rango, negocio }` |
| Sidebar colapsado por sección | `localStorage.sidebar.ironMonkey.collapsed = bool` (idem Growing) |
| FIPAs archivados automáticamente | Cuando Xisco marca como aplicado, se mueven a "Archivados" ese día. Al día siguiente, se filtran automáticamente. |

---

## 11. Migración desde la versión actual

### 11.1 Cambios que rompen el sidebar

| Antes | Ahora | Acción de los programadores |
|-------|-------|------------------------------|
| `/` = Home (digest narrativo) | `/` = HOY (briefing diario, contenido redistribuido) | Redirigir `/` → `/hoy` (mismo contenido reorganizado). Renombrar `pages/Home.tsx` → `pages/Hoy.tsx`. |
| `/dashboard` = vista de KPIs | `/kpis` = vista de KPIs | Mover `pages/Dashboard.tsx` → `pages/Kpis.tsx` con nueva ruta. |
| `Iron Monkey` y `Growing` como top-level (sin sub-páginas en sidebar) | Mismo top-level, ahora con sub-páginas | Expandir el `Sidebar.tsx` con `<SubItem />` anidado y badges. |

### 11.2 Cambios internos (no rompen UI pero sí la estructura)

| Antes | Ahora |
|-------|-------|
| Una sola página `IronMonkey.tsx` con todo el pipeline dentro | Dividir en `pages/iron-monkey/Pipeline.tsx`, `Leads.tsx`, `LeadDetail.tsx`, `Propuestas.tsx`, `Seguimiento.tsx` |
| Una sola página `Growing.tsx` con todo | Dividir en `pages/growing/Resumen.tsx`, `Sesiones.tsx`, `SesionDetail.tsx`, `SesionNueva.tsx`, `Prospectos.tsx`, `Fipas.tsx`, `Weekly.tsx` |
| `Memory.tsx` en el sidebar | `Memory.tsx` se mueve al menú de usuario. `Vault.tsx` lo sustituye en el sidebar con un rename. |

### 11.3 Aliases de ruta (mantener compatibilidad)

```ts
// router.tsx
<Route path="/" element={<Navigate to="/hoy" replace />} />
<Route path="/dashboard" element={<Navigate to="/kpis" replace />} />
<Route path="/memory" element={<Navigate to="/vault" replace />} />
```

---

## 12. Criterios de aceptación (Definition of Done)

Para dar por buena la primera versión:

1. ✅ El sidebar muestra Hoy, Iron Monkey (expandido), Growing (expandido), KPIs, en ese orden.
2. ✅ Menú de usuario con Vault, Memory, Settings, Ayuda.
3. ✅ Switcher de negocio en el Topbar funciona y persiste.
4. ✅ Las dos acciones críticas (`+ Nueva nota` Iron Monkey, `+ Subir audio` Growing) están accesibles desde el Topbar en cualquier página.
5. ✅ `HOY` consolida el briefing de los dos negocios en una sola pantalla, sin scrollear más de 2 pantallas en escritorio medio.
6. ✅ `Pipeline` y `Sesiones` funcionan como vistas independientes con su propia URL.
7. ✅ Las fichas de lead y sesión son deep-linkables (compartibles por URL).
8. ✅ Los badges numéricos del sidebar reflejan el estado real en vivo.
9. ✅ Todos los atajos de teclado del §9 funcionan.
10. ✅ Los estados vacíos del §8 están implementados con mensajes reales (no lorem ipsum).
11. ✅ Las redirects de §11.3 funcionan (ninguna ruta vieja queda huérfana).
12. ✅ El último negocio activo se restaura al recargar la app.

---

## 13. Lo que NO entra en este reporte (fuera de alcance)

- **Diseño visual** (paleta exacta, tipografías, espaciados, animaciones) → ya definido en el estilo actual de la app.
- **Componentes UI concretos** (cómo se renderiza un badge, un kanban card, un KPI tile) → tarea de los programadores con el sistema de design actual (Tailwind + componentes en `components/ui`).
- **Estructura de datos / API** → ya definida en `packages/shared/src/types/` y los endpoints de `packages/server/`.
- **Lógica de los agentes** (ICP, Call Analyzer, etc.) → ya definida en `AGENTIK-OS.md` §5.
- **Sistema de gamificación** completo → queda como `Mini-card` opcional en Growing. El sistema completo (apuestas, rachas, niveles) está documentado en `02-GrowingInmobiliario/gamificacion.md` y se implementa en una fase posterior.
- **Mobile** → todos los wireframes son para desktop. La versión mobile es una fase posterior; los principios de usabilidad (jerarquía, switcher, CTAs visibles) se mantienen pero el layout cambia (sidebar → bottom tabs).

---

## 14. Resumen ejecutivo (1 minuto de lectura)

**Decisión clave:** eliminar la ambigüedad Home vs. Dashboard fusionándolos en una sola pantalla de "Hoy" + mover Dashboard a "KPIs" como vista transversal, y reorganizar el sidebar para que **los dos negocios sean los dos primeros elementos de navegación**, no la vista agregada.

**Estructura final del sidebar (5 ítems principales):**
1. **Hoy** (briefing diario, ruta `/`)
2. **Iron Monkey** (con sub-páginas: Pipeline, Leads, Propuestas, Seguimiento)
3. **Growing** (con sub-páginas: Subir audio, Sesiones, Prospectos, FIPAs, Weekly)
4. **KPIs** (vista transversal, filtrable por negocio)
5. Menú de usuario (Vault, Memory, Settings)

**Acciones críticas siempre visibles:**
- Topbar: `+ Nueva nota` (Iron Monkey) + `+ Subir audio` (Growing)
- Switcher de negocio: persistente en todas las páginas

**Frecuencia de uso reflejada en jerarquía:**
- Diario: Hoy, los dos negocios, KPIs
- Semanal: Prospectos, Propuestas borrador, FIPAs, Weekly
- Esporádico: Vault, Memory, Settings (menú de usuario)

**Migración:** los agentes de programación pueden hacerlo en 3 pasos: (1) renombrar Home → Hoy y Dashboard → KPIs, (2) partir Iron Monkey y Growing en sub-páginas con rutas, (3) reordenar el sidebar. Los aliases de URL evitan romper nada.

---

**Versión del reporte:** 1.0 · **Audiencia:** agentes de programación de Agentik-OS · **Próxima revisión:** tras primera ronda de testing con Xisco como usuario.
