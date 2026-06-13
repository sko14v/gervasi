# Reglas de prompts — Agentik O.S. (v1.0)

> Cómo se formatean y procesan los prompts en la v1.
> **Cambio importante respecto al doc original:** se elimina
> LLMLingua2. La compresión de input se delega a **Graphify** (que
> ya reduce el contexto) y a la **estructura del vault**.

---

## 1. Estructura estándar de prompt

Todo prompt a un LLM sigue esta estructura:

```
[CONTEXTO]    — Output de /graphify query + datos del vault relevantes
[TAREA]       — Verbo en infinitivo. Una sola acción principal.
[PASOS]       — Lista numerada de pasos a ejecutar.
[RESTRICCIONES] — Lo que NO debe hacer el agente.
[OUTPUT]      — Formato exacto esperado.
[SCORECARD]   — (Opcional) Criterios de autoevaluación.
```

---

## 2. Compresión de input

> **NO se aplica LLMLingua2.** La compresión se logra por dos vías:

### 2.1 Contexto via Graphify (principal)

Antes de redactar el prompt, el agente ejecuta:

```
/graphify query "<término relevante al negocio>"
```

Reglas:
- **Siempre** una query por agente por tarea.
- **No más de 3 queries** por prompt (si necesitas más, el contexto
  está mal segmentado en el vault).
- Si la query no devuelve nada útil, pedir a Xisco que añada el dato
  al vault en lugar de improvisar.

### 2.2 Vault bien estructurado (secundario)

- Los archivos del vault son **cortos y específicos** (no megadocumentos).
- Cada archivo cubre **un solo tema**.
- Los agentes leen **solo los archivos relevantes** para su tarea.
- La app React indexa los archivos y expone solo lo necesario.

### 2.3 Excepciones a "no comprimir"

Solo si en el futuro (v2) el consumo de tokens es un problema real,
se reevalúa LLMLingua2. Mientras tanto, no añadir complejidad.

---

## 3. Contexto via Graphify — detalle

### 3.1 Queries típicas por agente

| Agente | Query ejemplo |
|--------|---------------|
| **ICP** | "criterios de calificación de leads charter" |
| **Proposal Generator** | "embarcaciones para 12 personas, presupuesto 4000 EUR, julio" |
| **CRM Manager** | "estados del pipeline" |
| **Call Analyzer** | "script cold calling + objeciones frecuentes" |
| **Feedback Coach** | "scorecard evaluación + últimas 5 sesiones" |
| **Prospect Notes** | "ficha prospecto + historial llamadas" |
| **Goal Tracker** | "KPIs + objetivos del mes" |

### 3.2 Formato esperado de respuesta Graphify

El agente recibe del query un bloque como:

```
[CONTEXTO RELEVANTE]
- <archivo>: <sección>: <dato relevante>
- <archivo>: <sección>: <otro dato>
[FIN CONTEXTO]
```

---

## 4. Reglas de output

### 4.1 Modo Caveman (default interno)

- Sin artículos innecesarios.
- Verbos en infinitivo o imperativo.
- Frases nominales sobre párrafos.
- Preservar URLs, paths y código exacto.
- Sin saludos ni despedidas.

**Ejemplo:**
```
Lead: María García | Score: 8/10 | Necesidad: charter corporativo
Fecha: 2026-07-15 | Presupuesto: 4.000-5.000 EUR | Next: enviar propuesta
```

### 4.2 Modo formal (cliente externo)

- Lenguaje profesional, cálido, claro.
- Estructura visible (títulos, bullets).
- Sin jerga interna ni referencias al sistema de agentes.
- Personalización obvia (nombre del cliente, su evento, su fecha).

---

## 5. Lo que un agente NUNCA debe hacer

1. **Inventar datos** que no estén en el vault.
2. **Asumir precios** no autorizados por Xisco.
3. **Hacer promesas al cliente** que no pueda cumplir.
4. **Saltarse la validación humana** en propuestas económicas o cierres.
5. **Borrar archivos** del vault.
6. **Contactar al cliente por ningún canal.** (Decisión de v1 — Xisco
   hace todo el contacto humano.)
7. **Enviar comunicaciones externas** sin marcar `[PENDIENTE VALIDACIÓN]`.

---

## 6. Plantillas de prompt por tipo de agente

### 6.1 Prompt de estructuración de ficha (ICP, M2.5)

```
[CONTEXTO]
(graphify query: "criterios calificación leads")

[TAREA]
Estructurar ficha de lead y aplicar score.

[ENTRADA]
{ficha rellenada por Xisco en la app}

[PASOS]
1. Validar campos mínimos (nombre, fecha, grupo)
2. Estructurar notas libres en bullets accionables
3. Aplicar scorecard (ver criterios)
4. Sugerir siguiente paso

[OUTPUT]
<caveman>

Lead: {nombre} | Score: X/10 | Sensacion: {caliente/tibio/frio}
Fecha: {fecha} | Grupo: {X} | Presupuesto: {rango} EUR
Notas: [bullets]
Next: {accion}
```

### 6.2 Prompt de generación de propuesta (M3)

```
[CONTEXTO]
(graphify query: "embarcaciones para {n} personas, presupuesto {rango}")
(graphify query: "tono de marca")
(graphify query: "politicas comerciales")
(graphify query: "servicios adicionales")

[TAREA]
Generar propuesta PDF personalizada para {cliente}.

[ENTRADA]
{ficha ICP completa con notas de Xisco}

[PASOS]
1. Seleccionar embarcación óptima según datos
2. Calcular precio total (barco + servicios seleccionados)
3. Aplicar políticas de pago
4. Redactar con tono de marca
5. Renderizar HTML + PDF

[RESTRICCIONES]
- Devolver como [PENDIENTE VALIDACIÓN]
- No enviar al cliente
- No modificar precios

[OUTPUT]
HTML + PDF (NO caveman — formato formal)
```

### 6.3 Prompt de análisis de llamada (M3)

```
[CONTEXTO]
(graphify query: "script cold calling")
(graphify query: "objeciones frecuentes")
(graphify query: "scorecard evaluación")
(transcripción de la llamada en chunks de 15-20 min)

[TAREA]
Evaluar la llamada y dar feedback estructurado.

[PASOS]
1. Aplicar scorecard 0-100 (5 bloques)
2. Calcular talk-to-listen ratio
3. Identificar objeciones manejadas vs no
4. Detectar 3-5 wins con timestamp
5. Detectar 3-5 mejoras accionables
6. Comparar con promedio últimas 5 sesiones
7. Recomendar 1 acción inmediata + 1 semanal

[OUTPUT]
<caveman>

=== SESSION ===
Score: X/100 | Calls: N | Appointments: M

=== WINS ===
1. [timestamp] [desc]

=== IMPROVEMENTS ===
1. [área] [acción]

=== TREND ===
Promedio 5 sesiones: Y | Dirección: {up/down/stable}

=== NEXT ===
1. [acción inmediata]
2. [acción semanal]
```

### 6.4 Prompt de daily digest (M2.5)

```
[CONTEXTO]
(lectura del pipeline actual desde el vault)
(lectura de sesiones del día anterior)

[TAREA]
Generar daily digest de ambos negocios.

[PASOS]
1. Iron Monkey: contar leads por estado
2. Iron Monkey: identificar alertas (>48h, propuestas sin respuesta)
3. Growing: contar llamadas, score promedio, citas
4. Growing: comparar con objetivo del día
5. Listar 3-5 acciones recomendadas priorizadas

[OUTPUT]
<caveman>

=== IRON MONKEY — {fecha} ===
Pipeline: {X} activos | {Y} propuestas | {Z} seguimiento
Alertas: [lista con lead + motivo + días]
Acciones: [lista priorizada]

=== GROWING — {fecha} ===
Llamadas: X / objetivo Y | Citas: M | Score: Z
Wins del día: [bullets]
Improvements: [bullets]
```

---

## 7. Checklist antes de enviar un prompt

- [ ] He ejecutado `/graphify query` para traer contexto relevante.
- [ ] He definido el formato de output (caveman o formal).
- [ ] He añadido restricciones si la tarea las requiere.
- [ ] El prompt no contiene datos inventados.
- [ ] La acción resultante NO requiere que el sistema contacte al cliente.

---

_Versión 1.0 — Sin LLMLingua2. Compresión via Graphify + estructura
del vault. Reevaluar en v2 si los tokens son cuello de botella._
