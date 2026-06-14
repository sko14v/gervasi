# AGENTIK O.S.

> Sistema operativo de agentes de IA para Iron Monkey Charter y Growing Inmobiliario.
> **Open source. Local. Sin dependencias de terceros.**

---

## 1. Resumen Ejecutivo

**Agentik O.S. es el cerebro operativo que gestiona dos negocios mediante 7 agentes especializados.**

| Negocio | Que hace | Agentes |
|---------|----------|---------|
| **Iron Monkey** | Charter de barcos. Xisco contacta por telefono, mete notas, el sistema genera propuesta PDF y gestiona pipeline + follow-ups. | ICP (ingreso manual), Proposal Generator, CRM Manager |
| **Growing Inmobiliario** | Consultoria inmobiliaria via cold calling. Transcripcion, feedback, KPIs. | Call Analyzer, Feedback Coach, Prospect Notes, Goal Tracker |

**Presupuesto mensual:** ~62 EUR (MiniMax M3 50 EUR + Gemini Flash Lite 12 EUR transcripcion)

**Filosofia:** Todo el contexto vive en archivos `.md` locales. Los agentes consultan el vault, no memorizan. Zero dependencias de memoria propietaria.

---

## 2. Skills Open Source a Instalar (v1.0 corregida)

> **Decisión de v1:** se **elimina LLMLingua2**. La compresión de
> input se logra vía Graphify + estructura del vault. Reevaluar en v2.

### 2.1 Graphify (Knowledge Graph)

**Que hace:** Indexa tu vault `.md` como un grafo queryable. En lugar de leer archivos enteros, el agente pregunta al grafo y recibe solo los datos relevantes.

**Ahorro realista:** 5-10x en consultas de contexto. (**NO** 71.5x — ese número es un caso extremo teórico del paper original, no aplica a un vault de 20-30 archivos como el nuestro.)

**Instalacion:**
```bash
pip install graphify    # verificar nombre en PyPI; el doc original mencionaba 'graphifyy' con doble y, que no es paquete oficial
```

**Uso en los agentes:**
```
# Antes de cualquier tarea, consultar contexto via grafo
/graphify query "embarcaciones para 10 personas, presupuesto 5000 EUR"
/graphify query "objeciones frecuentes cold calling"
/graphify query "precios temporada alta catamaranes"
```

**Limitaciones a tener en cuenta:**
- Requiere re-indexación tras editar el vault.
- En vault pequeño (~30 archivos), el ahorro real es 5-10x, no 71x.
- No es una base de datos queryable en tiempo real: es un resumen
  estructurado que el agente lee.

---

### 2.2 Caveman (Compresion Ultra-Concisa)

**Que hace:** Modo de comunicacion que elimina articulos, preposiciones y conectores. Frases nominales sobre parrafos. **Reduccion: ~38% tokens en output (1.4-1.6x).**

**Instalacion correcta:**
```bash
# Para integrarlo como skill de agentes (NO el curl del doc original)
npx skills add juliusbrussee/caveman
```

> El script `curl` del documento original es para `caveman-code`
> (agente standalone), **no** es lo que necesitamos.

**Reglas del modo caveman:**
- Eliminar articulos, preposiciones innecesarias
- Verbos en infinitivo o imperativo
- Frases nominales ("Lead recibido. Score 8/10. Propuesta enviada.")
- Preservar URLs, paths, codigo exacto
- Sin saludos ni despedidas

**Cuando usar caveman:**
- TODAS las respuestas internas de agentes
- Reportes de feedback de llamadas
- Actualizaciones de CRM
- Logs y resumenes

**Cuando NO usar caveman:**
- Propuestas PDF para clientes (formato profesional)
- Emails a clientes externos

---

## 3. Estrategia de Ahorro de Tokens (3 Capas — recalibrada)

> ❌ El documento original multiplicaba las capas como si fueran
> independientes (570x combinado). **Eso era matemáticamente
> incorrecto**: las capas作用于 tokens diferentes y tienen rendimientos
> decrecientes cuando se combinan.

| Capa | Herramienta | Ahorro realista | Aplica a |
|------|-------------|-----------------|----------|
| **1. Contexto** | Graphify | 5-10x | Lectura de archivos del vault |
| **2. Output** | Caveman | 1.4-1.6x (~38%) | Respuestas de los agentes |
| **3. Vault** | Estructura `.md` | Evita releer | Organizacion eficiente |

**Multiplicador combinado realista: 10-20x** (no 570x). Sigue siendo
excelente, pero comunicamos expectativas correctas.

**Ejemplo practico recalibrado:**
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

## 4. Estructura del Vault (alineada con el vault real)

> ⚠️ El doc original usaba nombres cortos (`catalogo.md`, `tono.md`).
> El vault real usa **nombres descriptivos** (`catalogo-embarcaciones.md`,
> `tono-marca.md`). Esta versión usa los nombres reales del vault.
> Ver `index.md` sección 4 para el mapa completo.

Todo el conocimiento del sistema vive en archivos `.md`. Los agentes
leen via Graphify, nunca leen archivos enteros crudos.

```
vault/
|-- index.md                          # Mapa de todo el sistema
|-- memory.md                         # Aprendizajes y preferencias
|-- SOUL.md                           # Identidad, valores, principios
|-- AGENTS.md                         # Reglas operativas por agente
|-- log.md                            # Registro de cambios
|
|-- 00-Sistema/
|   |-- stack-tecnico.md              # Modelos, deps, ahorro
|   |-- reglas-prompts.md             # Cómo se formatean prompts
|   |-- metricas-objetivos.md         # KPIs globales
|   |-- calendario-ejecucion.md       # Cadencias y triggers
|   `-- orquestacion.md               # Capa React + digest
|
|-- 01-IronMonkeyCharter/
|   |-- catalogo-embarcaciones.md     # Embarcaciones
|   |-- competencia.md                # Otros charter
|   |-- faq-clientes.md               # Preguntas frecuentes
|   |-- pipeline-actual.md            # Pipeline + alertas
|   |-- politicas-comerciales.md      # Pagos, cancelaciones
|   |-- precios-tarifas.md            # Tarifas por temporada
|   |-- servicios-adicionales.md      # Catering, extras
|   |-- temporadas-calendario.md      # Alta/media/baja
|   |-- tono-marca.md                 # Voz, estilo
|   |-- zonas-navegacion.md           # Puertos, rutas
|   |-- leads/                        # Fichas individuales
|   `-- propuestas/                   # PDFs generados
|
`-- 02-GrowingInmobiliario/
    |-- script-cold-calling.md        # Guion completo
    |-- perfil-prospecto-ideal.md     # ICP
    |-- objeciones-respuestas.md      # Top objeciones
    |-- scorecard-evaluacion.md       # Rúbrica 0-100
    |-- metricas-kpis.md              # KPIs
    |-- objetivos-mensuales.md
    |-- gamificacion.md               # Apuestas + rachas
    |-- casos-exito.md
    |-- mercado-inmobiliario.md
    |-- competencia-inmobiliaria.md
    |-- servicios-consultoria.md
    |-- criterios-wins-improvements.md
    |-- tracker-facturacion.md
    |-- tracker-canceladas.md
    |-- tracker-agendas.md
    `-- plantilla-nota-prospecto.md
```

---

### 4.1 index.md

Mapa maestro del sistema. Todo agente lo lee primero.

```markdown
# AGENTIK O.S. — Index

## Negocios
- **Iron Monkey**: Charter de barcos (leads Facebook → propuesta PDF → CRM)
- **Growing Inmobiliario**: Cold calling (transcripcion → feedback → coaching)

## Stack
- Modelos: MiniMax M3 (texto), Gemini Flash Lite (audio)
- Contexto: Graphify (grafo local sobre vault .md)
- Compresion: LLMLingua2 (prompts), Caveman (output)
- Vault: .md locales, estructura por negocio

## Agentes Activos (7)
| Agente | Negocio | Trigger | Modelo |
|--------|---------|---------|--------|
| ICP (ingreso manual) | Iron Monkey | Xisco guarda NOTA en ficha (no al crear perfil) | MiniMax M2.5 |
| Proposal Generator | Iron Monkey | Xisco pulsa "Generar oferta" dentro de la nota | MiniMax M3 |
| CRM Manager | Iron Monkey | Cambio estado + diario 08:00 (digest priorizado) | MiniMax M2.5 |
| Call Analyzer | Growing | Xisco adjunta AUDIO en la app (cascada completa) | Gemini Flash |
| Feedback Coach | Growing | Análisis completo + domingo semanal (genera FIPAs) | MiniMax M3 |
| Prospect Notes | Growing | Cita agendada | MiniMax M2.5 |
| Goal Tracker | Growing | Daily 18:00 + FIPAs en digest 08:00 | MiniMax M2.5 |

## Vault
- `/01-IronMonkeyCharter/` — Catalogo, servicios, politicas, tono
- `/02-GrowingInmobiliario/` — Script, ICP, objeciones, scorecard

## Comandos del sistema
- `/graphify query "..."` — Consultar contexto
- `/caveman` — Activar modo conciso
- LLMLingua2 se aplica automaticamente (5x default)
```

---

### 4.2 memory.md

Aprendizajes acumulados. Se actualiza manualmente o por agente tras cada sesion relevante.

```markdown
# Memory — Aprendizajes del Sistema

## Iron Monkey
- Embarcacion mas solicitada: [rellenar]
- Objeciones mas comunes: [rellenar]
- Mejor horario respuesta leads: [rellenar]
- Promedio dias cierre: [rellenar]

## Growing Inmobiliario
- Score promedio llamadas: [rellenar]
- Objecion mas frecuente: [rellenar]
- Mejor respuesta a objeciones: [rellenar]
- Horario mayor tasa cita: [rellenar]

## Ajustes del Sistema
- Version: 1.0
- Compresion: LLMLingua2 medio (5x)
- Modo output: Caveman activo
- Indexacion Graphify: cada 24h

## Preferencias del Operador
- Formato comunicacion: Caveman interno, profesional externo
- Frecuencia reports: Daily digest + Weekly review
```

---

## 5. Los 7 Agentes

### Iron Monkey — Charter de Barcos

> **REGLA DE ORO:** el sistema **nunca** contacta al cliente. Toda
> llamada, email o WhatsApp lo hace Xisco. Los agentes procesan lo
> que Xisco mete manualmente y le devuelven ofertas + recordatorios.

#### ICP — Ingreso manual de leads y notas
**Trigger:** Xisco guarda una **NOTA** en la ficha del lead
(NO al crear el perfil vacío)
**Modelo:** MiniMax M2.5

```
TAREA: Estructurar la nota post-llamada y actualizar el lead

DISTINCION IMPORTANTE:
- Crear perfil (rellenar formulario inicial): NO activa nada.
  Solo se guarda el perfil vacio en el CRM.
- Guardar NOTA tras llamada: ESTE es el trigger principal.
  Activa todo el flujo del ICP.

ENTRADA (Xisco rellena al guardar la nota):
- Texto libre de lo que hablo con el cliente
- Sensacion (caliente / tibio / frio / descartado)
- Servicios extra mencionados (opcional)
- Proximo paso acordado (opcional)

PASOS:
1. Validar que la nota no este vacia y sensacion != "-"
2. /graphify query "criterios calificacion"
3. Estructurar la nota libre en 7 bullets:
   - que quiere, detalles grupo, restricciones, objeciones,
     por que nos eligio, urgencia, proximo paso
4. Calcular score 1-10 con los pesos
5. Asignar estado:
   - score >= 7 + caliente  -> cualificado
   - score 4-6 o tibio      -> tibio
   - score < 4 o frio       -> descartado
6. Programar follow-ups segun el "proximo paso acordado"
7. Actualizar la ficha del lead (frontmatter + seccion notas)
8. Si score >= 7: habilitar boton "Generar oferta" en la nota

OUTPUT (caveman):
Lead: {nombre} | Score: X/10 | Sensacion: {caliente/tibio/frio}
Estado: {cualificado/tibio/descartado}
Notas: [7 bullets estructurados]
Follow-ups: [lista con fecha y motivo]
Boton oferta: {activo/inactivo}
```

#### Proposal Generator
**Trigger:** Xisco marca "generar oferta" en una ficha de lead
**Modelo:** MiniMax M3 (generacion compleja)

```
TAREA: Generar propuesta PDF personalizada a partir de las notas de Xisco

ENTRADA: ficha del lead completa (datos + notas de la llamada)

PASOS:
1. /graphify query "embarcaciones para {grupo} personas, presupuesto {rango}"
2. /graphify query "tono de marca"
3. /graphify query "politicas comerciales"
4. Seleccionar embarcacion optima segun notas
5. Calcular precio total (barco + servicios + extras)
6. Aplicar politicas de deposito / cancelacion
7. Generar HTML con template profesional (ver plantilla-propuesta.md)
8. Convertir a PDF
9. Devolver a Xisco como [PENDIENTE VALIDACION]
10. CRM: estado "Proposal Draft" (no "Proposal Sent" hasta que Xisco envie)

INPUT comprimido via LLMLingua2 (modo ligero 2x por calidad)
OUTPUT: HTML + PDF (NO caveman — formato formal)

REGLA: el PDF NO se envia al cliente. Xisco lo revisa, ajusta si hace
falta y lo envia por su cuenta.
```

#### CRM Manager (Pipeline)
**Trigger:** Cada cambio de estado + diario 08:00 + on-demand
**Modelo:** MiniMax M2.5

```
TAREA: Mantener el pipeline actualizado y recordar los follow-ups

ESTADOS DEL PIPELINE:
- nuevo
- contactado
- cualificado
- propuesta_borrador
- propuesta_enviada
- en_negociacion
- ganado
- perdido
- descartado

REGLAS DE ALERTA:
- Sin actividad >48h → alerta a Xisco
- Propuesta_enviada sin respuesta >48h → recordatorio a Xisco
- Estancado en cualificado >7 dias → escalacion
- Cierre ganado → registrar para post-venta

CADENCIA:
- 08:00 daily: digest de Xisco con todo el pipeline
- On-demand: cuando Xisco cambia un estado manualmente
- Cuando Xisco lo pida: "dame el estado del pipeline"

OUTPUT (caveman):
Pipeline: {X} activos | {Y} propuestas | {Z} seguimiento
Alertas: [lista con lead + motivo + dias sin movimiento]
Acciones recomendadas: [lista priorizada]
```

#### Flujo visual Iron Monkey (con nota como trigger)

```
[Xisco recibe lead de cualquier canal]
        |
        v
[Xisco rellena formulario inicial en la app]  ──>  estado: nuevo
        |                                          (perfil vacio, sin trigger)
        v
[Xisco contacta por telefono al cliente]
        |
        v
[Xisco abre la ficha + pega NOTA en el campo de notas]  ← TRIGGER PRINCIPAL
        |
        v
[ICP: estructura nota, calcula score, asigna estado, programa follow-ups]
        |
        ├──> score >= 7 + caliente  ──>  estado: cualificado
        |                                (aparece boton "Generar oferta")
        ├──> score 4-6 o tibio      ──>  estado: tibio
        |                                (follow-up automatico)
        └──> score < 4 o frio       ──>  estado: descartado
        |
        v
[Xisco pulsa "Generar oferta" DENTRO de la nota]  ← TRIGGER EXPLICITO
        |
        v
[Proposal Generator: crea PDF]  ──>  estado: propuesta_borrador
        |
        v
[Xisco revisa, ajusta y envia]  ──>  estado: propuesta_enviada
        |
        v
[CRM Manager: 48h sin respuesta? alerta]
        |
        ├──> respuesta positiva  ──>  en_negociacion  ──>  ganado
        ├──> respuesta negativa  ──>  perdido
        └──> silencio  ──>  alerta + seguimiento
```

#### Flujo visual Growing (con audio como trigger en cascada)

```
[Xisco termina sesion de ~3h de llamadas]
        |
        v
[Xisco abre app Growing + ADJUNTA AUDIO en el campo]  ← TRIGGER UNICO
        |
        v
[Call Analyzer en cascada automatica, sin pasos manuales:]
        |
        1. chunking audio 15-20 min (solapamiento 5s)
        2. Gemini transcribe cada chunk
        3. M3 analiza contra script + scorecard + objeciones
        4. M3 genera feedback estructurado
        5. M3 genera FIPAs (3-5 insights para manana)
        |
        v
[Resultado visible en la app: "Sesion analizada. Score 72/100"]
        |
        v
[Dia siguiente 08:00 — Digest FIPA]
        |
        v
"Estos son los 3 FIPAs que tienes que aplicar HOY en tus llamadas:
 1. Bajar talk ratio 65% -> 55% con 3 preguntas de descubrimiento
 2. Manejar objeción O1 con respuesta validativa
 3. Repetir patrón de cierre con 2 opciones en >= 5 llamadas"
```

---

### Growing Inmobiliario — Cold Calling

> **Volumen:** Xisco sube 2-3h de audio al día, 5 días/semana.
> El sistema procesa las grabaciones y devuelve feedback accionable
> para la siguiente sesión.

#### Call Analyzer
**Trigger:** Xisco **adjunta audio** en el campo correspondiente
de la app (un solo paso, sin más interacción)
**Modelo:** Gemini Flash Lite (transcripción nativa) + MiniMax M3 (análisis)

```
TAREA: Procesar el audio en cascada automatica

PASOS (sin intervencion manual entre ellos):
1. Recibir el/los archivos de audio subidos
2. CHUNKING: cortar en segmentos de 15-20 min con solapamiento 5s
3. Gemini Flash Lite transcribe cada chunk con timestamps + diarizacion
4. MiniMax M3 analiza cada llamada contra el scorecard
5. Consolida resultados en una sesion
6. Guarda en /02-GrowingInmobiliario/sesiones/{fecha}.md
7. Activa Feedback Coach (sin esperar)

SCORECARD (5 bloques, 100 puntos):
- Apertura (15): opening <20s, presentacion, permiso
- Descubrimiento (25): 3+ preguntas abiertas, escucha
- Manejo objeciones (20): valida, pregunta, cierra
- Cierre (20): next step claro, cita, email
- Tecnico (20): talk<60%, sin muletillas

METRICAS:
- Talk-to-listen ratio (objetivo: <60% talk)
- Sentimiento (positivo/neutro/negativo)
- Keywords del script detectados
- Objeciones manejadas vs no manejadas
- Citas agendadas

OUTPUT (caveman):
Sesion: {id} | Score: X/100 | Calls: N
Appointments: M | Talk: X% | Sentimiento: {pos/neut/neg}
```

#### Feedback Coach
**Trigger:** Call Analyzer completa sesion + Weekly domingo
**Modelo:** MiniMax M3 (coaching, tarea compleja)

```
TAREA: Generar feedback estructurado + FIPAs (Feedback Insights Para Aplicar)

FORMATO:
=== SESSION ===
Score: X/100 (+/- vs previo) | Calls: N | Appointments: M

=== WINS ===
1. [timestamp] [descripcion breve]
2. ... (3-5 wins)

=== IMPROVEMENTS ===
1. [area] [accion concreta]
2. ... (3-5 improvements)

=== TREND ===
Promedio 5 sesiones: Y | Direccion: [up/down/stable]

=== FIPAs (para manana) ===
1. [area] [accion especifica con objetivo medible]
2. [area] [accion especifica con objetivo medible]
3. [area] [accion especifica con objetivo medible]

=== NEXT ===
1. [accion inmediata]
2. [accion esta semana]

REGLAS:
- Comparar vs promedio ultimas 5 sesiones
- Si score < 40: recomendar coaching 1:1
- Si score 40-59: plan de mejora detallado
- FIPAs: 3-5 insights accionables que Xisco aplicara MAÑANA
  - Cada FIPA tiene objetivo medible (%, numero, repeticiones)
  - Se muestran en el digest 08:00 del dia siguiente
  - Xisco puede marcarlos como "aplicado" durante la sesion
- Actualizar script.md si patrones consistentes
```

#### Prospect Note Taker
**Trigger:** Cita agendada en llamada
**Modelo:** MiniMax M2.5 (tarea simple)

```
TAREA: Crear y mantener fichas de prospectos

ACCIONES:
- Crear ficha al agendar cita
- Registrar objeciones y respuestas efectivas
- Documentar proximos pasos y fechas
- Generar resumen antes de siguiente interaccion
- Enlazar historial de llamadas previas (/graphify query)

OUTPUT: Ficha de prospecto actualizada
```

#### Goal Tracker
**Trigger:** Daily 18:00 + Weekly domingo + 08:00 con FIPAs
**Modelo:** MiniMax M2.5 (tracking)

```
TAREA: Tracking de KPIs + digest 08:00 con FIPAs

KPIs:
| Metrica | Objetivo | Frecuencia |
|---------|----------|------------|
| Llamadas | 80/dia | Diario |
| Citas | 12/semana | Semanal |
| Ratio citas/llamadas | 15% | Semanal |
| Cierres | 3/mes | Mensual |
| Score promedio | >75 | Por sesion |

ACCIONES:
- 08:00: Digest con FIPAs del dia anterior (3-5 insights aplicables HOY)
- 18:00: Digest con resultado del dia (llamadas, score, citas, objetivo)
- Domingo: Weekly review (tendencia, top wins, top improvements)
- Calcular ratios
- Proyeccion vs objetivo mensual
- Alertar si ritmo insuficiente

OUTPUT (caveman):
=== FIPAs 08:00 ===
1. [area] [objetivo medible]
2. [area] [objetivo medible]
3. [area] [objetivo medible]

=== DIGEST 18:00 ===
Dia: X llamadas | Semana: Y citas | Ratio: Z%
Proyeccion mes: X% del objetivo | Alertas: [si/none]
```

---

## 6. Tabla Resumen: Que Usa Cada Agente

| Agente | Modelo | Input Compresion | Contexto | Output | Skills |
|--------|--------|-----------------|----------|--------|--------|
| ICP (ingreso manual) | MiniMax M2.5 | LLMLingua2 5x | Graphify | Caveman | graphify, caveman |
| Proposal Generator | MiniMax M3 | LLMLingua2 2x | Graphify | Formal | graphify |
| CRM Manager | MiniMax M2.5 | LLMLingua2 5x | Graphify | Caveman | graphify, caveman |
| Call Analyzer | Gemini Flash | N/A (nativo) | Graphify | Caveman | graphify |
| Feedback Coach | MiniMax M3 | LLMLingua2 5x | Graphify + memory.md | Caveman | graphify, caveman |
| Prospect Notes | MiniMax M2.5 | LLMLingua2 5x | Graphify | Caveman | graphify, caveman |
| Goal Tracker | MiniMax M2.5 | LLMLingua2 5x | Graphify | Caveman | graphify, caveman |

---

## 7. Instalacion (2 deps open source + app React)

```bash
# 1. Graphify — Knowledge graph (verificar nombre real en PyPI)
pip install graphify

# 2. Caveman — Compresion de output (como skill, NO el curl del doc original)
npx skills add juliusbrussee/caveman

# 3. App React local (cuando esté lista)
cd ~/agentik-os-app
npm install
npm run dev    # → http://localhost:5173
```

> **Listo.** El resto son archivos `.md` en el vault (ya creados) y
> la app React que montaremos.

---

## 8. Checklist de Puesta en Marcha (v1.0 corregido)

- [ ] `pip install graphify` — instalado (verificar nombre real en PyPI)
- [ ] Caveman skill instalada (`npx skills add juliusbrussee/caveman`)
- [ ] ~~LLMLingua2~~ — **NO se instala en v1** (eliminado por análisis)
- [ ] Vault creado con `index.md`, `MEMORY.md`, y carpetas por negocio
- [ ] Graphify indexa el vault (rebuild cada 24h)
- [ ] App React arranca en `localhost:5173`
- [ ] ICP se activa al guardar NOTA (no al crear perfil)
- [ ] Proposal Generator se activa con botón "Generar oferta" en la nota
- [ ] Daily digest Iron Monkey llega a las 08:00 con 4 listas priorizadas
- [ ] Daily digest Growing con FIPAs llega a las 08:00 del día siguiente
- [ ] Call Analyzer en cascada se activa al adjuntar audio
- [ ] Primer lead Iron Monkey procesado end-to-end (sin envío al cliente)
- [ ] Primera sesión Growing analizada (audio 2-3h, chunking 15-20 min)

---

**Agentik O.S. v1.0 | 2 deps open source + 1 app React | 7 agentes | 2 negocios**
