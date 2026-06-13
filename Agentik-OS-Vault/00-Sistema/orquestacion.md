# Orquestación — Agentik O.S. (v1.0)

> La capa que faltaba en el documento original. Define **quién
> dispara cada acción**, **cómo se comunican los agentes** y **cómo
> llegan los digests a Xisco**.
>
> En la v1, la orquestación es **una app React local** que consume
> el vault, dispara los agentes y muestra los resultados.

---

## 1. Principio fundamental

**El vault es la fuente de verdad. La app React es la cara visible.**

```
Xisco ──► App React ──► Vault .md ──► Agentes ──► Vault .md ──► App React ──► Xisco
 (input)  (interfaz)   (memoria)    (proceso)    (memoria)    (notificación)
```

- Xisco **nunca** escribe directamente en los `.md` del CRM. Lo hace
  a través de formularios en la app.
- La app **nunca** modifica el vault sin registrar el cambio.
- Los agentes **nunca** escriben fuera de su carpeta asignada.
- La app **nunca** habla con el cliente. Solo notifica a Xisco.

---

## 2. Triggers por agente (respuesta a "¿quién dispara qué?")

> **Principio clave (v1.0 refinado):** la **nota** es la unidad
> mínima de acción en Iron Monkey, y el **archivo subido** es la
> unidad mínima en Growing. Todo el sistema se activa a partir de
> estos dos disparadores, no de "crear perfil" o "iniciar sesión".

### 2.1 Iron Monkey

| Acción | Trigger | Quién dispara | Resultado |
|--------|---------|---------------|-----------|
| **Crear lead (perfil vacío)** | Xisco rellena el formulario inicial en la app | Xisco (manual) | Ficha en vault, estado `nuevo`. **No se genera nada todavía.** |
| **Añadir nota tras llamada** | Xisco pega sus notas en el campo de notas del lead | Xisco (manual) | **TRIGGER PRINCIPAL.** ICP estructura la nota, calcula score, actualiza estado, programa follow-ups |
| **Generar oferta** | Xisco pulsa botón "Generar oferta" **dentro de la nota** | Xisco (manual, explícito) | Proposal Generator crea PDF, marca `propuesta_borrador` |
| **Marcar propuesta enviada** | Xisco confirma envío al cliente | Xisco (manual) | Estado `propuesta_enviada` + timestamp |
| **Cambiar estado** | Xisco arrastra la tarjeta o usa menú | Xisco (manual) | Estado actualizado + log |
| **Daily digest 08:00** | Reloj de la app | App | Notificación con: leads a contactar, ofertas a crear, follow-ups pendientes, gente que no contesta |
| **Alertas de follow-up** | App revisa el pipeline | App (al abrir) | Notificación push en la app |

**Lógica de los triggers:**

```
Xisco rellena el formulario inicial
  → Se crea el perfil del lead (vacío, sin notas)
  → NO se activa nada todavía
  
Xisco llama por teléfono al cliente
  → Vuelve a la app, abre la ficha del lead
  → Pega sus notas en el campo de notas
  → Click "Guardar nota"
    → ICP procesa: estructura la nota, calcula score, asigna estado
    → Sistema programa follow-ups (siguiente contacto, fecha, motivo)
    
Xisco quiere una oferta
  → En la misma nota, click "Generar oferta"
  → Proposal Generator crea PDF [PENDIENTE VALIDACIÓN]
  
Cada día a las 08:00
  → App genera digest con TODO lo que Xisco tiene que hacer hoy:
    • Leads nuevos que requieren primer contacto
    • Follow-ups vencidos o próximos
    • Propuestas pendientes de envío
    • Clientes que no contestan hace > 48h
```

### 2.2 Growing Inmobiliario

| Acción | Trigger | Quién dispara | Resultado |
|--------|---------|---------------|-----------|
| **Adjuntar audio** | Xisco sube el archivo en el campo "Adjuntar audio" de la app | Xisco (manual, único paso) | **TRIGGER PRINCIPAL.** Call Analyzer chunking → transcripción → análisis → feedback estructurado. Todo en cascada. |
| **Daily digest 08:00** | Reloj de la app | App | Notificación con **FIPA** (Feedback Insight Para Aplicar): los 3-5 insights del día anterior que Xisco debe aplicar HOY en sus llamadas |
| **Marcar cita agendada** | Xisco marca en la app tras una llamada | Xisco (manual) | Ficha de prospecto creada, estado `cita_agendada` |
| **Weekly review domingo** | Reloj de la app, día domingo | App | Reporte semanal con tendencias |
| **Notificación de objetivo cumplido** | Llamadas/conversaciones llegan al target | App | Push positivo |
| **Notificación de objetivo no cumplido** | Final del día, target no alcanzado | App | Push constructivo |

**Lógica del trigger de audio:**

```
Xisco termina su sesión de ~3h de llamadas
  → Abre la app, va a la sección Growing
  → En el campo "Adjuntar audio" sube el/los archivos
  → Click "Analizar sesión"
    → Call Analyzer corta en chunks de 15-20 min
    → Gemini transcribe cada chunk
    → M3 analiza contra script + scorecard + objeciones
    → M3 genera feedback estructurado
    → Todo se guarda en sesiones/{fecha}.md y feedback/{fecha}.md
    → App muestra: "Sesión analizada. Score 72/100"
    
Cada día a las 08:00 (siguiente día)
  → App genera digest con FIPA:
    "Ayer detectamos estos 3 insights para aplicar HOY:
     1. Tu talk ratio está al 65%. Baja al 55% haciendo más preguntas.
     2. En las llamadas con objeción 'no tenemos tiempo', aplica la
        respuesta de la sección O1 del script.
     3. Hoy intenta hacer 3 preguntas de dolor antes de presentar."
```

### 2.3 Cadencias — tabla resumen

| Hora | Qué dispara | Negocio | Contenido |
|------|-------------|---------|-----------|
| 08:00 | Daily digest | Iron Monkey | Leads a contactar, ofertas a crear, follow-ups, no contesta |
| 08:00 | Daily digest con FIPA | Growing | 3-5 insights del día anterior para aplicar hoy |
| Domingo 20:00 | Weekly review completo | Ambos | Tendencias, top wins, top improvements, proyección |
| Subir nota | ICP procesa | Iron Monkey | Estructura, score, estado, follow-ups |
| Botón "Generar oferta" | Proposal Generator | Iron Monkey | PDF [PENDIENTE VALIDACIÓN] |
| Subir audio | Call Analyzer en cascada | Growing | Chunking → transcripción → análisis → feedback |

> **Decisión clave:** **no usamos cron del sistema operativo**. Las
> cadencias se evalúan **al abrir la app** (chequeo de hora) o
> **mientras la app está abierta** (intervalo). Si Xisco no abre la
> app un día, simplemente no recibe el digest. Es aceptable porque
> el digest se genera en cuanto abra la app al día siguiente.

---

## 3. Comunicación app ↔ agentes

### 3.1 Patrón general

```
[App] solicita acción al agente
        ↓
[App] escribe "request" en /requests/{agente}/{timestamp}.md
        ↓
[Worker Python] lee la request, ejecuta al agente
        ↓
[Worker] escribe respuesta en /responses/{agente}/{timestamp}.md
        ↓
[App] detecta el nuevo response, lo muestra a Xisco
        ↓
[App] mueve el response a su destino final (vault o UI)
```

### 3.2 Endpoints del worker (lo que la app llama)

```python
# Pseudo-endpoints (el worker es local, no HTTP real)
POST /agent/icp           # Estructurar ficha + score
POST /agent/proposal      # Generar PDF
POST /agent/crm-update    # Cambiar estado de un lead
POST /agent/call-analyzer # Procesar audio
POST /agent/feedback      # Generar feedback de sesión
POST /agent/goal-tracker  # Calcular KPIs y proyecciones
POST /agent/digest        # Generar digest (08:00 / 18:00)
```

Cada endpoint es una llamada a MiniMax o Gemini con el prompt
correspondiente (ver `reglas-prompts.md`).

---

## 4. Notificaciones push — el digest diario

> Las alertas NO llegan por chat ni se acumulan en un `.md`. Llegan como
> **notificación push en la app** a las 08:00 y 18:00.

### 4.1 Implementación

- **Web Notifications API** del navegador.
- **Service Worker** registrado al instalar la app.
- Permiso de notificación solicitado en el primer arranque.
- Si el usuario no concede permiso, fallback: la app muestra un badge
  en la barra de tareas con el número de alertas pendientes.

### 4.2 Formato de notificación (08:00 Iron Monkey)

```
🔔 Agentik OS — Digest Iron Monkey 08:00

Pipeline: 8 activos | 3 propuestas | 2 seguimiento

🔴 Llamar: María García (48h sin gestión)
🟠 Follow-up: Carlos Ruiz (propuesta enviada hace 3 días, sin respuesta)
🟡 Revisar: PDF borrador para Ana López

Abre la app para ver el detalle completo.
```

### 4.3 Formato de notificación (18:00 Growing)

```
🔔 Agentik OS — Digest Growing 18:00

Llamadas: 78 / 80 (objetivo casi cumplido ✓)
Score promedio: 72/100
Citas: 4 nuevas hoy

🏆 Top win: cierre con 3 objeciones en 4 min
💡 Improvement: bajar talk ratio del 65% al 55%

Abre la app para ver el detalle completo.
```

### 4.4 Si Xisco no abre la app

- La notificación push se manda **al reloj de la app**, no al SO.
- Si la app no está abierta, no se manda.
- Al abrir la app, la app **chequea si hay digestes pendientes** y
  los muestra todos de golpe (uno por cada día perdido).

---

## 5. Persistencia de datos

### 5.1 El vault como base de datos

Todos los datos estructurados viven en `.md` con frontmatter YAML.
La app los lee con un parser y los muestra como UI.

**Ejemplo — ficha de lead en el vault:**

```yaml
---
id: IM-2026-001
nombre: María García
telefono: "+34600000000"
email: maria@email.com
idioma: ES
origen: Facebook

estado: cualificado
score: 8
sensacion: caliente

fecha_evento: 2026-07-15
personas: 12
tipo_evento: cumpleaños
presupuesto_min: 3000
presupuesto_max: 4000

servicios_mencionados:
  - catering
  - barra_libre

created_at: 2026-06-01T10:30:00
updated_at: 2026-06-02T15:45:00
---

# Lead: María García

## Notas de la conversación
> Quiere sorprender a su pareja. Le gusta la idea de cala escondida
> para bañarse al atardecer...

## Historial
- 2026-06-01 10:30 — Creado por Xisco (origen: Facebook)
- 2026-06-01 14:20 — Llamada realizada (8 min, conversación buena)
- 2026-06-02 15:45 — Score 8/10, estado: cualificado
```

### 5.2 Estructura de carpetas de datos dinámicos

```
vault/
├── 01-IronMonkey/
│   ├── leads/                          ← fichas individuales
│   │   ├── IM-2026-001.md
│   │   ├── IM-2026-002.md
│   │   └── ...
│   ├── propuestas/                     ← PDFs generados
│   │   ├── IM-2026-001-v1.pdf
│   │   └── ...
│   └── pipeline-actual.md              ← vista rápida (generado por la app)
│
├── 02-GrowingInmobiliario/
│   ├── sesiones/                       ← análisis de cada sesión
│   │   ├── 2026-06-13.md
│   │   └── ...
│   ├── feedback/                       ← feedback estructurado
│   │   ├── 2026-06-13-wins.md
│   │   └── ...
│   ├── prospectos/                     ← fichas de prospectos
│   │   └── ...
│   └── audios/                         ← audios subidos
│       └── sesion-2026-06-13/
│           ├── llamada-01.mp3
│           ├── llamada-02.mp3
│           └── ...
```

### 5.3 Lo que la app **nunca** toca

- `SOUL.md` (identidad, valores)
- `MEMORY.md` (aprendizajes) — solo lectura
- `AGENTS.md` (reglas operativas) — solo lectura
- `00-Sistema/*.md` (configuración) — solo lectura
- `01-IronMonkey/catalogo-embarcaciones.md`, `precios-tarifas.md`,
  `politicas-comerciales.md` — solo lectura
- `02-GrowingInmobiliario/script-cold-calling.md`, `scorecard-evaluacion.md`,
  `objeciones-respuestas.md` — solo lectura

> Xisco edita estos archivos manualmente con Obsidian. La app los
> consume pero no los modifica.

---

## 6. Estados que la app entiende (tipados)

### 6.1 Estados Iron Monkey (TS-style)

```typescript
type EstadoLead =
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
```

### 6.2 Estados Growing (TS-style)

```typescript
type EstadoLlamada =
  | 'subida'
  | 'transcribiendo'
  | 'analizada'
  | 'con_feedback'
  | 'archivada';

type EstadoProspecto =
  | 'nuevo'
  | 'cita_agendada'
  | 'cita_confirmada'
  | 'cita_cancelada'
  | 'convertido';
```

### 6.3 Reglas de transición

Definidas en código TypeScript (en la app), pero documentadas en
`pipeline-crm.md` para mantener coherencia con el vault.

---

## 7. Manejo de errores y fallbacks

| Escenario | Comportamiento |
|-----------|----------------|
| MiniMax no responde | La app muestra error claro + reintenta en 30s |
| Gemini falla en transcripción | La app pide a Xisco subir de nuevo o retry |
| Vault no se puede escribir | La app bloquea la acción + alerta |
| Audio corrupto | La app lo marca y pide re-subida |
| Conflicto de estado (dos cambios simultáneos) | La app usa timestamp + log para resolver |
| App se cierra a mitad de proceso | Worker retoma la request al reabrir |

---

## 8. Privacidad y aislamiento

- La app **nunca** hace llamadas a internet.
- La app **nunca** envía datos a cloud.
- Las notificaciones push son **locales** (Web Notifications API sin
  servidor de push remoto).
- Los audios **nunca** salen del equipo.
- El backup del vault es **manual** (Xisco decide cuándo y a dónde).

---

## 9. Lo que queda fuera de la v1

- Sincronización entre dispositivos (Xisco solo usa 1 equipo).
- App móvil nativa (la app es web, responsive, pero no PWA offline
  completo en v1).
- Integración con WhatsApp / email (Xisco hace esas acciones).
- Multi-usuario (es un sistema personal).
- Dashboard en la nube (todo local).

---

_Versión 1.0 — Orquestación. Esta pieza es el pegamento entre vault,
agentes y Xisco. Cualquier cambio en cómo se disparan los agentes
debe reflejarse aquí primero._
