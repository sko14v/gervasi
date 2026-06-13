# Agentik O.S. — Index

> Mapa maestro del sistema. **Todo agente lee este archivo primero** para
> entender el contexto general antes de profundizar en su carpeta.

---

## 1. Negocios activos

| Negocio | Qué hace | Carpeta |
|---------|----------|---------|
| **Iron Monkey Charter** | Charter de barcos. Xisco contacta por teléfono, mete notas manualmente, el sistema genera oferta PDF y gestiona el pipeline + follow-ups. | `01-IronMonkey/` |
| **Growing Inmobiliario** | Consultoría inmobiliaria. Xisco graba las llamadas, el sistema transcribe y da feedback. | `02-GrowingInmobiliario/` |

---

## 2. Stack técnico

| Capa | Herramienta | Propósito |
|------|-------------|-----------|
| **Modelos de texto** | MiniMax M3 / M2.5 | Tareas complejas (M3) y clasificación/tracking (M2.5) |
| **Modelo de audio** | Gemini Flash Lite | Transcripción nativa de llamadas |
| **Contexto** | Graphify | Grafo de conocimiento sobre el vault `.md` |
| **Compresión input** | _(eliminada en v1)_ | LLMLingua2 retirada: no compensa vs. M3 nativo con Graphify como contexto curado |
| **Compresión output** | Caveman | Reportes internos, logs, feedback |
| **Vault** | Archivos `.md` locales | Obsidian / editor markdown |

Presupuesto operativo estimado: **~62 EUR/mes**.

---

## 3. Agentes activos (7)

| # | Agente | Negocio | Trigger | Modelo | Carpeta de skill |
|---|--------|---------|---------|--------|------------------|
| 1 | **ICP (Ingreso manual de leads)** | Iron Monkey | Xisco mete un lead o notas en la ficha | MiniMax M2.5 | `01-IronMonkey/` |
| 2 | **Proposal Generator** | Iron Monkey | Xisco marca "generar oferta" en una ficha | MiniMax M3 | `01-IronMonkey/` |
| 3 | **CRM Manager (Pipeline)** | Iron Monkey | Cada cambio de estado + diario 08:00 | MiniMax M2.5 | `01-IronMonkey/` |
| 4 | **Call Analyzer** | Growing | Audio subido (3-4x/día) | Gemini Flash Lite | `02-GrowingInmobiliario/` |
| 5 | **Feedback Coach** | Growing | Análisis completo + semanal | MiniMax M3 | `02-GrowingInmobiliario/` |
| 6 | **Prospect Note Taker** | Growing | Cita agendada | MiniMax M2.5 | `02-GrowingInmobiliario/` |
| 7 | **Goal Tracker** | Growing | Diario 18:00 + semanal | MiniMax M2.5 | `02-GrowingInmobiliario/` |

Detalle completo de cada agente en `AGENTIK-OS.md` (sección 5).

> **Nota importante Iron Monkey:** los tres agentes (ICP, Proposal
> Generator, CRM Manager) **nunca** contactan al cliente. Toda llamada,
> email o WhatsApp la hace Xisco. El sistema procesa lo que Xisco mete
> y le devuelve: fichas organizadas, ofertas listas para enviar,
> recordatorios de follow-up.

---

## 4. Mapa del vault

```
Agentik-OS-Vault/
├── index.md                          ← este archivo
├── MEMORY.md                         ← aprendizajes acumulados
├── log.md                            ← registro de cambios del sistema
├── AGENTS.md                         ← reglas operativas por agente
├── SOUL.md                           ← identidad, valores, principios
│
├── 00-Sistema/
│   ├── stack-tecnico.md              ← qué herramientas, versiones, costes
│   ├── reglas-prompts.md             ← cómo se formatean prompts a LLMs
│   ├── metricas-objetivos.md         ← KPIs globales del sistema
│   └── calendario-ejecucion.md       ← cadencias, triggers, horarios
│
├── 01-IronMonkey/
│   ├── catalogo-embarcaciones.md     ← barcos, capacidades, precios
│   ├── servicios-adicionales.md      ← catering, tripulación, extras
│   ├── precios-tarifas.md            ← tarifas por temporada
│   ├── politicas-comerciales.md      ← depósitos, cancelaciones, descuentos
│   ├── tono-marca.md                 ← voz, estilo, palabras prohibidas
│   ├── temporadas-calendario.md      ← alta/media/baja, eventos
│   ├── zonas-navegacion.md           ← rutas, puertos base
│   ├── guia-calificacion-leads.md    ← scorecard 1-10
│   ├── plantilla-propuesta.md        ← estructura del PDF
│   ├── faq-clientes.md               ← preguntas frecuentes
│   └── competencia.md                ← otros charter del mercado
│
└── 02-GrowingInmobiliario/
    ├── script-cold-calling.md        ← guion completo con estructura
    ├── perfil-prospecto-ideal.md     ← ICP: a quién llamar
    ├── objeciones-respuestas.md      ← top objeciones + manejo
    ├── scorecard-evaluacion.md       ← rúbrica 0-100
    ├── metricas-kpis.md              ← objetivos diarios/semanales/mensuales
    ├── objetivos-mensuales.md        ← targets del mes en curso
    ├── casos-exito.md                ← cierres destacados para argumentario
    ├── mercado-inmobiliario.md       ← contexto del sector
    ├── competencia-inmobiliaria.md    ← otras consultoras
    ├── servicios-consultoria.md      ← qué ofrece Growing
    ├── criterios-wins-improvements.md← qué cuenta como win / improvement
    ├── tracker-facturacion.md        ← registro de cierres
    ├── tracker-canceladas.md         ← llamadas perdidas / motivos
    ├── tracker-agendas.md            ← citas agendadas
    └── plantilla-nota-prospecto.md   ← estructura de ficha de prospecto
```

---

## 5. Comandos del sistema

| Comando | Función |
|---------|---------|
| `/graphify query "..."` | Consultar el grafo de conocimiento (devuelve solo el contexto relevante) |
| `/caveman` | Activar modo de respuesta concisa |
| _(LLMLingua2)_ | _(retirada en v1 — ver nota en sección 2)_ |
| `/log` | Registrar acción actual en `log.md` |

---

## 6. Reglas de oro

1. **Antes de actuar**, un agente debe haber leído `SOUL.md` + su carpeta de negocio.
2. **Si falta información**, pedirla. Nunca inventar.
3. **Toda acción que modifique estado** (CRM, prospecto, tracker) debe anotarse en `log.md`.
4. **Las propuestas a clientes** pasan por validación de Xisco antes de enviarse.
5. **Los precios y políticas** solo los modifica Xisco.

---

_Agentik O.S. v1.0 — Index. Si añades un agente o una carpeta, actualiza este mapa._
