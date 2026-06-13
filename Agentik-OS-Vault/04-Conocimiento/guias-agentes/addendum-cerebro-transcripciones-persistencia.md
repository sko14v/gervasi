# Addendum Técnico — Cerebro, Transcripciones y Persistencia

> **Complementa:** `analisis_tecnico_agentik_os.md`
> **Tipo:** Análisis puro. No se programa ni se modifica nada.
> **Fecha:** 13 junio 2026

---

## 1. El Cerebro: Obsidian + Graphify en tándem

### 1.1 No es "o" — es "y"

| | Obsidian | Graphify |
|--|---------|----------|
| **Para quién** | Para Xisco (humano) | Para los agentes (IA) |
| **Qué hace** | Editor visual de `.md` con graph view, links, búsqueda | Indexa los `.md` como grafo queryable para que los agentes no relean todo |
| **Formato** | Markdown + wikilinks `[[]]` humano-legible | JSON/graph machine-readable |
| **Acceso** | GUI de escritorio | CLI + API programática |
| **Coste** | Gratis (core) | Gratis (open source) |

### 1.2 Arquitectura del tándem

```
👤 Xisco → Obsidian → Vault .md (disco local)
                         ↓
                    Graphify index
                         ↓
              🤖 Agentes consultan grafo
                         ↓
                    Escriben resultados
                         ↓
                    Graphify re-index
                         ↓
🖥️ App React ← Backend Hono lee/escribe vault
```

**Flujo:**
1. **Xisco edita** el vault en Obsidian (catálogo, precios, script, políticas)
2. **Graphify re-indexa** el vault automáticamente (o manualmente con `graphify .`)
3. **Los agentes** consultan el grafo para obtener solo el contexto relevante
4. **La app React** lee/escribe en el vault directamente y también puede consultar el grafo

### 1.3 Comparativa

**Obsidian — pros:**
- Graph view visual nativo
- Wikilinks `[[archivo]]` crean conexiones automáticas
- Búsqueda full-text instantánea
- Templates, daily notes, canvas
- 2000+ community plugins
- Gratis para uso personal
- Windows, Mac, Linux, iOS, Android

**Obsidian — contras:**
- No tiene API propia para agentes (necesita plugin)
- El graph view es bonito pero no queryable programáticamente
- Sync (multi-dispositivo) es de pago ($4/mes)

**Graphify — pros:**
- Convierte el vault en grafo queryable
- Ahorro real de tokens: 5-10x en contexto
- Integración nativa con agentes (`/graphify query "..."`)
- Genera `graph.json` + `GRAPH_REPORT.md` + `graph.html` interactivo
- Puede exportar al formato de Obsidian (wikilinks)

**Graphify — contras:**
- Requiere Python (pip install)
- Re-indexación necesaria tras cada cambio significativo
- No tiene GUI — es puro CLI
- El grafo puede quedar stale si no se re-indexa

### 1.4 Recomendación

> **Usar AMBOS:**
> - **Obsidian** para que Xisco edite, navegue y visualice
> - **Graphify** para indexar el grafo que consultan los agentes

**¿Por qué no solo Obsidian?** No tiene mecanismo eficiente para queries semánticas. El plugin `Local REST API` solo hace CRUD.

**¿Por qué no solo Graphify?** Es CLI sin interfaz visual. Xisco necesita editar, ver el grafo, buscar.

### 1.5 Integración práctica

```bash
# Primera vez: indexar
cd Agentik-OS-Vault
graphify .

# Resultado:
# → graphify-out/graph.json
# → graphify-out/GRAPH_REPORT.md
# → graphify-out/graph.html

# Re-indexar tras cambios
graphify .  # ~2-5 segundos para vault de 30-50 archivos

# Desde un agente
/graphify query "embarcaciones para 12 personas, presupuesto 4000 EUR"
```

**Automatización en backend Hono:**
- Endpoint `POST /graphify/reindex` que ejecute `graphify .` como subprocess
- Llamarlo tras cada escritura significativa en el vault
- Llamarlo al arrancar el servidor

---

## 2. Transcripciones de 1 hora con diarización

### 2.1 Cambio respecto a planificación anterior

| Parámetro | Antes | Ahora |
|-----------|-------|-------|
| **Duración por audio** | 15-20 min pre-cortado | **~1 hora** continua |
| **Sesiones por día** | 3-4 | 1-3 (cada una de ~1h) |
| **Total audio/día** | ~1h | **1-3 horas** |
| **Chunking** | Xisco pre-corta | **El sistema corta automáticamente** |
| **Diarización** | Mencionada vagamente | **Obligatoria: XISCO vs PROSPECTO** |

### 2.2 Modelo: Gemini 2.5 Flash-Lite

> ⚠️ **Gemini 2.0 Flash-Lite descontinuado** (desde 1 junio 2026). Usar **Gemini 2.5 Flash-Lite**.

| Modelo | Input audio/1M | Output/1M | Diarización | Recomendación |
|--------|----------------|-----------|-------------|---------------|
| **Gemini 2.5 Flash-Lite** | ~$0.30 | $0.40 | ✅ Via prompting | **← USAR ESTE** |
| Gemini 2.5 Flash | ~$0.90 | $2.50 | ✅ Via prompting | Solo si Lite no da calidad |
| Gemini 2.5 Pro | $1.25+ | $10.00+ | ✅ Nativo | Overkill |

### 2.3 Coste real por sesión de 1 hora

```
1 hora = 3.600 segundos
3.600 × 25 = 90.000 tokens de input (audio)

Input (audio, Flash-Lite): 90.000 / 1M × $0.30 = $0.027
Output (transcripción, ~15.000 tokens): 15.000 / 1M × $0.40 = $0.006

TOTAL POR SESIÓN DE 1 HORA: ~$0.033 ≈ 0.03 EUR
```

| Escenario | Sesiones/día | Coste/día | Coste/mes (20 días) |
|-----------|-------------|-----------|---------------------|
| 1 sesión de 1h | 1 | ~$0.03 | ~$0.66 |
| 3 sesiones de 1h | 3 | ~$0.10 | ~$2.00 |
| **Máximo realista** | 3 | **~$0.10** | **~$2.00** |

> **Coste transcripción despreciable.** 1-3h diarias = $2-3/mes (no 12 EUR/mes como se estimaba).

### 2.4 Arquitectura de transcripción

```
1. Audio 1h (MP3/M4A, ~60-120 MB)
         ↓
2. FFmpeg: chunks 15 min + 10s solapamiento
   → Chunk 1: 0:00 — 15:10
   → Chunk 2: 15:00 — 30:10
   → Chunk 3: 30:00 — 45:10
   → Chunk 4: 45:00 — 60:00
         ↓
3. Gemini 2.5 Flash-Lite: transcripción + diarización (paralelo)
         ↓
4. Merge: dedup zona solapamiento + unificar speaker labels
         ↓
5. MiniMax M3: scorecard ICL + talk ratio + wins/improvements
         ↓
6. Output: sesiones/YYYY-MM-DD.md + feedback/YYYY-MM-DD.md
         ↓
7. Graphify re-index del nuevo contenido
```

### 2.5 Prompt de diarización

```
[TAREA]
Transcribir este audio de una llamada de ventas fría (cold calling).
Identificar exactamente 2 locutores:
- XISCO: el vendedor (voz masculina, español, inicia la llamada)
- PROSPECTO: el receptor de la llamada

[FORMATO DE OUTPUT]
JSON array. Cada elemento es un turno de habla:

[
  {"t": "00:00:03", "speaker": "XISCO", "text": "Hola buenas tardes, ¿hablo con...?"},
  {"t": "00:00:08", "speaker": "PROSPECTO", "text": "Sí, dígame..."},
  ...
]

[REGLAS]
- Si hay silencios > 3 segundos, marcar como {"t": "...", "speaker": "SILENCIO", "text": "[pausa 5s]"}
- Si no puedes identificar quién habla, usar "DESCONOCIDO"
- Preservar muletillas, titubeos y expresiones coloquiales (son relevantes para el scoring)
- No corregir gramática — transcribir literal
- Timestamps relativos al inicio del chunk
```

### 2.6 Por qué chunks de 15 min

| Enviar 1h completa | Chunks de 15 min |
|--------------------|-----------------|
| ❌ 90.000 tokens de golpe | ✅ ~22.500 tokens por chunk |
| ❌ Si falla, se pierde todo | ✅ Si falla 1, se retransmite solo ese |
| ❌ Modelo pierde precisión al final | ✅ Cada chunk recibe atención completa |
| ❌ Timeout en conexiones lentas | ✅ Parallelizable (4 chunks simultáneos) |
| ❌ No hay feedback de progreso | ✅ SSE: "Chunk 2/4 transcrito..." |

**Solapamiento de 10s:** Evita cortar palabras a mitad de frase. Merge posterior elimina duplicados por timestamp.

### 2.7 Proceso de merge

```
Chunk 1: [00:00:00 — 00:15:10]
Chunk 2: [00:15:00 — 00:30:10]  ← 10s de solapamiento

Zona solapamiento: [00:15:00 — 00:15:10]
→ Buscar la última frase completa de chunk 1 en este rango
→ Cortar chunk 2 justo después
→ Resultado: transición limpia sin duplicados
```

**Speaker label unification:** Si Gemini asigna "SPEAKER_1" en chunk 1 y "SPEAKER_A" en chunk 2, el backend normaliza comparando las primeras frases de cada chunk con el contexto previo.

---

## 3. Persistencia total — Todo queda en el grafo

### 3.1 Principio

```
Todo dato que entra al sistema → se escribe como .md → se indexa en Graphify
Todo agente que necesita contexto → consulta Graphify → recibe SOLO lo relevante
```

### 3.2 Mapa de persistencia

**Conocimiento estático (Xisco edita en Obsidian):**
- `catalogo-embarcaciones.md`
- `precios-tarifas.md`
- `politicas-comerciales.md`
- `tono-marca.md`
- `script-cold-calling.md`
- `scorecard-evaluacion.md`
- `objeciones-respuestas.md`

**Datos dinámicos (agentes + app):**
- `leads/IM-2026-NNN.md` (frontmatter + notas + historial)
- `sesiones/YYYY-MM-DD.md` (transcripción completa + score)
- `feedback/YYYY-MM-DD.md` (wins + improvements + FIPAs)
- `prospectos/nombre.md` (ficha de prospecto Growing)
- `propuestas/IM-NNN-v1.pdf` (PDF generado)

**Meta-conocimiento (auto-actualizado):**
- `MEMORY.md` (aprendizajes)
- `log.md` (historial acciones)
- `tracker-agendas.md`
- `tracker-facturacion.md`

**Graphify index:**
- `graph.json` (relaciones entre todo)

### 3.3 Qué indexa Graphify

| Archivo | Queryable | Ejemplo query |
|---------|-----------|---------------|
| `leads/IM-2026-001.md` | Nombre, score, estado, fecha, presupuesto, servicios | `"leads calientes julio presupuesto > 3000"` |
| `catalogo-embarcaciones.md` | Barco, capacidad, amenities, precios | `"embarcaciones 12 personas sunset"` |
| `sesiones/2026-06-13.md` | Score, llamadas, citas, objeciones, talk ratio | `"sesiones con score < 60 últimos 7 días"` |
| `feedback/2026-06-13.md` | Wins, improvements, FIPAs, tendencia | `"mejoras recurrentes últimas 5 sesiones"` |
| `objeciones-respuestas.md` | Objeciones, respuestas, frecuencia | `"objeción 'no tenemos tiempo' respuesta"` |
| `MEMORY.md` | Aprendizajes, KPIs, ajustes del sistema | `"mejor horario para llamadas"` |

### 3.4 Ciclo de vida de un dato

```
1. CREACIÓN
   Xisco introduce dato (formulario app / nota / audio)
       ↓
2. PERSISTENCIA
   Backend escribe .md con frontmatter YAML en el vault
       ↓
3. INDEXACIÓN
   Graphify re-indexa el vault (automático tras cada escritura)
       ↓
4. CONSULTA
   Agente necesita contexto → /graphify query "término"
       ↓
5. PROCESAMIENTO
   Agente ejecuta su tarea con el contexto mínimo necesario
       ↓
6. PERSISTENCIA (del resultado)
   Agente escribe el resultado como .md en el vault
       ↓
7. RE-INDEXACIÓN
   Graphify indexa el nuevo archivo
       ↓
8. VISUALIZACIÓN
   App React lee el .md y lo muestra a Xisco
       ↓
9. APRENDIZAJE
   Si el patrón aparece 3+ veces, se promueve a archivo permanente
```

### 3.5 Estrategia de re-indexación

| Evento | Re-indexar? | Por qué |
|--------|------------|---------|
| Nuevo lead creado | ✅ Sí | Necesario para queries futuras |
| Nota añadida a lead | ✅ Sí | Contenido del lead cambió |
| Sesión analizada | ✅ Sí | Nueva transcripción y score |
| Feedback generado | ✅ Sí | Nuevos wins, improvements, FIPAs |
| Xisco edita catálogo en Obsidian | ✅ Sí (al abrir app) | Precios o servicios pueden haber cambiado |
| Digest generado | ❌ No | Efímero, no necesita indexarse |
| Estado de lead cambiado | ❌ No | Solo frontmatter, Graphify ya lo tenía |

**Implementación:** Backend llama `graphify .` como subprocess tras cada escritura significativa. ~2-5s, no bloquea UI.

### 3.6 Impacto en tokens

| Operación | Sin Graphify | Con Graphify | Ahorro |
|-----------|--------------|--------------|--------|
| ICP estructura una nota | ~1.500 tokens | ~300 tokens | 5x |
| Proposal Generator | ~6.000 tokens | ~800 tokens | 7.5x |
| Feedback Coach | ~8.000 tokens | ~1.200 tokens | 6.7x |
| Call Analyzer | ~3.000 tokens | ~500 tokens | 6x |
| Digest diario | ~5.000 tokens | ~600 tokens | 8.3x |

**Ahorro medio: ~6.5x en input.** Con Caveman (1.5x en output) → combinado **~10x**.

---

## 4. Resumen de ajustes al plan técnico

| Aspecto | Plan anterior | Plan actualizado |
|---------|--------------|------------------|
| **Cerebro** | "Graphify O Obsidian" | **Ambos en tándem** |
| **Modelo transcripción** | "Gemini Flash Lite" | **Gemini 2.5 Flash-Lite** |
| **Duración audio** | 15-20 min pre-cortados | **1 hora continua** |
| **Chunking** | 15-20 min, 5s solapamiento | **15 min, 10s solapamiento** |
| **Diarización** | Mencionada vagamente | **Prompt estructurado, 2 speakers fijos** |
| **Coste transcripción/mes** | ~12 EUR | **~$2-3** |
| **Persistencia** | "Todo en .md" | **Ciclo completo crear→indexar→consultar→re-persistir** |
| **Re-indexación Graphify** | "Cada 24h" | **Tras cada escritura significativa** |
| **Coste mensual total** | ~62 EUR | **~52-55 EUR** |

> **Presupuesto real baja de ~62 EUR/mes a ~52-55 EUR/mes.**

---

*Fuente: Addendum técnico / Análisis 13 junio 2026*
