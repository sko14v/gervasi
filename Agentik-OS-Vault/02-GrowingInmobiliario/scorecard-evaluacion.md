# COL-Analyser — Sistema de Evaluación de Llamadas en Frío

**Versión:** 3.1 | **Total criterios:** 32 | **Escala:** 0–100 por fase

---

## Distribución de Pesos

| Fase | Peso | Justificación |
|---|---|---|
| Paso 2: Diagnóstico + Dolor | **30%** | El prospecto debe sentir el problema. Sin dolor verbalizado, no hay urgencia y el closer no tiene palanca. |
| Paso 5: Cierre / Booking | **25%** | Determina el show rate. Un lead calificado con cierre débil = no-show. |
| Paso 1: Apertura | **15%** | Sin permiso conseguido aquí, el resto de la llamada no existe. |
| Paso 4: Filtro de Tiempo | **15%** | Urgencia real y prioridad. Un prospecto que no puede empezar es un no-show estadístico. |
| Paso 3: Filtro de Dinero | **10%** | Cualificación financiera. Evita enviar leads rotos al closer. Ya se explora en el diagnóstico. |
| Paso 0: Gatekeeper | **5%** | Barrera de entrada. Fallar aquí mata la llamada, pero es una variable binaria rápida. |
| **TOTAL** | **100%** | |

> **Nota sobre objeciones:** Las objeciones ya no son una fase separada. Se evaluúan dentro de la fase donde ocurren (apertura, diagnóstico, dinero, tiempo, cierre), distribuyendo su peso real donde pertenecen.

---

## Fórmula del ICL (Índice de Calidad de Llamada)

```
ICL = (P2 × 0.30) + (P5 × 0.25) + (P1 × 0.15) + (P4 × 0.15) + (P3 × 0.10) + (P0 × 0.05)
```

### Clasificación

| ICL | Grado | Significado |
|---|---|---|
| 90–100 | **A** | Setter modelo, referencia para training |
| 80–89 | **B** | Ejecución sólida, micro-ajustes |
| 65–79 | **C** | Errores significativos, coaching requerido |
| 45–64 | **D** | Fallos graves, NO enviar lead al closer |
| 0–44 | **F** | Llamada destructiva, re-entrenamiento completo |

---

## Errores Fatales por Fase

Un Error Fatal anula la puntuación de su fase a 0, independientemente del resto de criterios.

| Código | Fase | Error Fatal |
|---|---|---|
| FE-0 | Gatekeeper | Explicar el servicio al empleado: mencionar "consultora", "sistema de captación", "exclusivas", precios o pitch. |
| FE-1 | Apertura | Vender en la apertura: precios, plazos, resultados garantizados, o proponer agendar antes del diagnóstico. |
| FE-2 | Diagnóstico | Vender durante el diagnóstico: mencionar el programa, precios, resultados de otros clientes, o proponer soluciones antes de completar los filtros. |
| FE-2b | Diagnóstico | Pitch + agendar sin completar los filtros de dinero y tiempo. |
| FE-3 | Dinero | Agendar con prospecto que declaró supervivencia real (sin capacidad de 5.000–10.000 €). |
| FE-4 | Tiempo | Agendar con prospecto que no puede empezar en 5–10 días. |
| FE-5 | Cierre | Agendar con closer sin haber validado filtro de dinero y filtro de tiempo en verde. |

---

## Errores Críticos Globales (ECG)

Activar cualquiera de estos **tapa el ICL máximo a 44** (grado F):

| Código | Error |
|---|---|
| ECG-1 | Enviar prospecto no calificado al closer: agenda a pesar de supervivencia real, incapacidad de empezar en >10 días, o diagnóstico incompleto. |
| ECG-2 | Mentir o exaggerar sobre el servicio: resultados garantizados, precios falsos, características inexistentes. |
| ECG-3 | Agresividad o falta de respeto: interrumpe sistemáticamente, tono condescendiente, ignora respuestas del prospecto. |

---

## Paso 0: Gatekeeper / Recepcionista
**Peso en ICL: 5%**

### [P0-C1] Pregunta directa por el dueño sin rodeos
- **SI (100 pts):** "Eres el dueño de [NOMBRE AGENCIA]?" como primera o segunda frase, sin introducciones previas.
- **NO (0 pts):** Da explicaciones antes de preguntar o explica el servicio al empleado.

### [P0-C2] Extracción de datos alternativos si el dueño no está
- **SI (100 pts):** Pide correo o número directo ofreciendo un vídeo corto como excusa de valor.
- **NO (0 pts):** Se conforma con "no está" sin pedir contacto.
- **NA (100 pts):** El dueño estaba disponible.

### [P0-C3] Cierre limpio en menos de 60 segundos
- **SI (100 pts):** Cierra rápido tras obtener datos o confirmar ausencia.
- **NO (0 pts):** Se extiende con el empleado más de 60 segundos sin propósito claro.
- **NA (100 pts):** Habló directamente con el dueño.

```
P0 = (P0-C1 × 0.40) + (P0-C2 × 0.30) + (P0-C3 × 0.30)
Si FE-0 activo: P0 = 0
```

---

## Paso 1: Apertura con el Propietario
**Peso en ICL: 15%**

### [P1-C1] Declaración explícita de "llamada comercial"
- **SI (100 pts):** Dice literalmente "esto es una llamada comercial" o equivalente en las primeras 3 frases.
- **NO (0 pts):** Omite la declaración o la suaviza ("llamaba por si te interesa...").

### [P1-C2] Propuesta del trato de los 10 segundos
- **SI (100 pts):** Plantea explicación en ~10 segundos + libertad de colgar si no le cuadra.
- **NO (0 pts):** No menciona el plazo explícito o no otorga el permiso de colgar.

### [P1-C3] Posicionamiento correcto: consultora de sistemas, NO agencia de leads
- **SI (100 pts):** "Consultora especializada solo en inmobiliarias", "sistema de captación y ventas". Diferencia explícita de agencia de marketing.
- **NO (0 pts):** Se describe como "agencia de marketing", "generamos leads", "hacemos publicidad".

### [P1-C4] Cierre de boca tras "te parece bien?"
- **SI (100 pts):** Tras la pregunta de permiso, guarda silencio ≥2 segundos hasta que el prospecto responda.
- **NO (0 pts):** Habla inmediatamente sin esperar respuesta o rellena el silencio con justificaciones.

### [P1-C5] Obtención de permiso explícito del prospecto
- **SI (100 pts):** El prospecto responde afirmativamente ("vale", "sí", "dale", "cuéntame") antes de continuar.
- **NO (0 pts):** Continúa sin esperar confirmación.

### [P1-C6] Manejo de objeciones en la apertura (solo si aplica)
- **SI (100 pts):** Valida + respuesta del guión + cierra con pregunta de recuperación de frame. Suelta si objeta 2 veces seguidas.
- **NO (0 pts):** Se pone a la defensiva o no sabe responder.
- **NA (100 pts):** No hubo objeciones.

```
P1 = (P1-C1 × 0.18) + (P1-C2 × 0.18) + (P1-C3 × 0.18) + (P1-C4 × 0.18) + (P1-C5 × 0.18) + (P1-C6 × 0.10)
Si FE-1 activo: P1 = 0
```

---

## Paso 2: Diagnóstico + Activación del Dolor
**Peso en ICL: 30%**

### [P2-C1] Secuencia de las 7 preguntas completa y en orden
- **SI (100 pts):** Las 7 preguntas del guión en orden correcto (1 a 7).
- **PARCIAL (50 pts):** 4 a 6 preguntas, o cambio de orden.
- **NO (0 pts):** Menos de 4 preguntas, o salta al pitch sin diagnóstico.

### [P2-C2] Extracción de datos numéricos o rangos concretos
- **SI (100 pts):** Cifras específicas en ≥4 preguntas ("firmamos 3 exclusivas", "facturamos unos 25.000").
- **PARCIAL (50 pts):** Datos concretos en 2–3 preguntas. Resto vagas.
- **NO (0 pts):** La mayoría de respuestas son vagas y el setter no concreta.

### [P2-C3] Ratio de escucha activa: prospecto habla ≥70%
- **SI (100 pts):** Prospecto habla más del 70% del tiempo del Paso 2.
- **PARCIAL (50 pts):** Ratio 50–70%.
- **NO (0 pts):** Setter habla más del 50%. Monólogos, justificaciones, pitch parcial.

### [P2-C4] Pregunta de clavado de dolor ejecutada correctamente
- **SI (100 pts):** "Si esto sigue igual 6–12 meses, ¿qué crees que puede pasar en la agencia?" Y guarda silencio.
- **NO (0 pts):** No usa la pregunta o responde él sin dejar que el prospecto hable.
- **NA (100 pts):** Prospecto ya mostró dolor explícito antes y el setter lo validó.

### [P2-C5] Profundización en respuestas vagas
- **SI (100 pts):** Cuando el prospecto responde evasivo, pide concreta ("¿cuántos más o menos?", "¿bien serían cuántas?").
- **NO (0 pts):** Acepta respuestas vagas sin profundizar.

### [P2-C6] Activación del dolor: prospecto verbaliza consecuencia negativa
- **SI (100 pts):** Prospecto articula una consecuencia concreta ("tendré que cerrar", "seguiré sin crecer", "no podré pagar las nóminas").
- **PARCIAL (50 pts):** Respuesta genérica ("pues no sé, la verdad").
- **NO (0 pts):** La pregunta no se hizo o el prospecto no conectó.
- **NA (100 pts):** Ya se detectó dolor previo.

### [P2-C7] Manejo de objeciones en el diagnóstico (solo si aplica)
- **SI (100 pts):** Valida + respuesta del guión + redirige con pregunta. No insiste si no es avatar.
- **NO (0 pts):** Insiste de forma agresiva o no sabe responder.
- **NA (100 pts):** No hubo objeciones.

```
P2 = (P2-C1 × 0.17) + (P2-C2 × 0.17) + (P2-C3 × 0.13) + (P2-C4 × 0.13) + (P2-C5 × 0.10) + (P2-C6 × 0.17) + (P2-C7 × 0.13)
Si FE-2 o FE-2b activo: P2 = 0
```

---

## Paso 3: Filtro de Dinero
**Peso en ICL: 10%**

### [P3-C1] Contextualización previa antes de preguntar por dinero
- **SI (100 pts):** Menciona que "crecer requiere invertir" como transición desde el diagnóstico.
- **NO (0 pts):** Suelta la pregunta de dinero de forma abrupta.

### [P3-C2] Mención del rango de precio (5.000–10.000 €)
- **SI (100 pts):** Menciona explícitamente "entre los 5.000 y los 10.000 euros".
- **NO (0 pts):** No menciona cifras o lo hace de forma vaga ("una inversión", "no es barato").
- **NOTA:** Si el prospecto declara supervivencia ANTES de que el setter mencione el rango, cuenta como SI.

### [P3-C3] Precisión en la pregunta: modo supervivencia vs. inversión
- **SI (100 pts):** Pregunta explícitamente el modo y aclara ("¿si inviertes te quedarías en apuros?").
- **NO (0 pts):** Pregunta ambigua ("¿tienes presupuesto?").

### [P3-C4] Descarte correcto en modo supervivencia real
- **SI (100 pts):** Supervivencia = NO agenda con closer. Ofrece recursos gratuitos / nurturing.
- **NO (0 pts):** Intenta agendar igual o presiona.
- **NA (100 pts):** Prospecto declaró modo inversión.

### [P3-C5] Diferenciación entre excusa de valor y supervivencia real
- **SI (100 pts):** Ante "no tengo dinero", pregunta si es falta de liquidez o falta de confianza en el retorno. Si es confianza: sigue al Paso 4.
- **NO (0 pts):** Acepta "no tengo dinero" como respuesta final sin profundizar.
- **NA (100 pts):** Prospecto declaró inversión sin objeciones.

```
P3 = (P3-C1 × 0.15) + (P3-C2 × 0.25) + (P3-C3 × 0.20) + (P3-C4 × 0.20) + (P3-C5 × 0.20)
Si FE-3 activo: P3 = 0
```

---

## Paso 4: Filtro de Tiempo
**Peso en ICL: 15%**

### [P4-C1] Anclaje al objetivo verbalizado de exclusivas
- **SI (100 pts):** Menciona el número de exclusivas objetivo del prospecto ("para llegar a esas [Y] exclusivas...").
- **NO (0 pts):** Filtro genérico sin conectar con el objetivo específico.

### [P4-C2] Planteamiento de la dicotomía 5–10 días vs. semanas/meses
- **SI (100 pts):** Expone ambas opciones claramente.
- **NO (0 pts):** Pregunta abierta ("¿cuándo podrías empezar?") sin contraste temporal.

### [P4-C3] Clasificación correcta del semáforo
- **SI (100 pts):** VERDE (5–10 días) = closer. AMARILLO (semanas) = seguimiento setter. ROJO (meses/sin dinero) = nurturing.
- **NO (0 pts):** Clasifica incorrectamente por miedo o presión.

### [P4-C4] Gestión correcta de prospecto AMARILLO
- **SI (100 pts):** Fija fecha concreta de seguimiento propio ("te llamo el [FECHA, 7–10 días antes]"). No delega.
- **NO (0 pts):** Deja seguimiento en el aire o pide que contacte él.
- **NA (100 pts):** Prospecto fue VERDE o ROJO.

### [P4-C5] No agendar con closer si no es VERDE
- **SI (100 pts):** AMARILLO o ROJO no terminan con cita en calendario del closer.
- **NO (0 pts):** Agenda con closer aunque no pueda empezar en 5–10 días.
- **NA (100 pts):** Prospecto fue VERDE.

### [P4-C6] Manejo de objeciones de tiempo (solo si aplica)
- **SI (100 pts):** Valida + respuesta del guión + fija fecha concreta. No acepta evasivas.
- **NO (0 pts):** Acepta "ya te llamo yo" sin fecha.
- **NA (100 pts):** No hubo objeciones.

```
P4 = (P4-C1 × 0.17) + (P4-C2 × 0.17) + (P4-C3 × 0.22) + (P4-C4 × 0.17) + (P4-C5 × 0.13) + (P4-C6 × 0.14)
Si FE-4 activo: P4 = 0
```

---

## Paso 5: Cierre / Booking
**Peso en ICL: 25%**

### [P5-C1] Resumen de calificación antes de proponer hora
- **SI (100 pts):** Repite datos clave del diagnóstico ANTES de pedir hora.
- **PARCIAL (50 pts):** Resumen parcial (faltan 1–2 datos clave).
- **NO (0 pts):** Salta directamente a "cuándo te viene bien?" sin resumen.

### [P5-C2] Edificación de autoridad del closer con resultado concreto
- **SI (100 pts):** Nombre del closer + resultado demostrable ("David... escaló nuestra inmobiliaria en Mallorca a 100.000 € estables al mes").
- **PARCIAL (50 pts):** Menciona al closer sin resultado concreto.
- **NO (0 pts):** No menciona al closer o lo presenta genéricamente.

### [P5-C3] Técnica BAMFAM: alternativa forzada en dos niveles
- **SI (100 pts):** Primera: "¿mañanas o tardes?". Segunda: "¿martes o jueves?".
- **PARCIAL (50 pts):** Primera correcta, segunda abierta ("¿a qué hora?").
- **NO (0 pts):** Pregunta abierta desde el inicio ("¿cuándo te viene bien?").

### [P5-C4] Marco anti-cancelación con humor
- **SI (100 pts):** "¿No serás de los que cancelan a última hora, no? jiji" (con humor).
- **NO (0 pts):** No menciona nada o lo hace de forma seria/agresiva.

### [P5-C5] Cierre de datos: confirmación de móvil y correo
- **SI (100 pts):** Pide explícitamente "mejor móvil" y "correo" para el envío de recordatorio.
- **NO (0 pts):** Asume los datos sin confirmar o no los pide.

### [P5-C6] Entrega de valor prometido en el cierre
- **SI (100 pts):** "Vas a salir de allí con el plan exacto para escalar tu inmobiliaria en los próximos 3 meses, independientemente de que entres al programa o no."
- **NO (0 pts):** No menciona el beneficio o lo condiciona a la compra.

### [P5-C7] Manejo de objeciones en el booking (solo si aplica)
- **SI (100 pts):** Usa BAMFAM con fuerza. No acepta evasivas. Fija día/hora concretos.
- **NO (0 pts):** Acepta "ya te llamo yo" o deja la cita sin día/hora.
- **NA (100 pts):** No hubo objeciones.

```
P5 = (P5-C1 × 0.17) + (P5-C2 × 0.13) + (P5-C3 × 0.20) + (P5-C4 × 0.13) + (P5-C5 × 0.10) + (P5-C6 × 0.13) + (P5-C7 × 0.14)
Si FE-5 activo: P5 = 0
```

---

## Matriz de Decisión

| ICL | Grado | Acción sobre el lead | Acción sobre el setter |
|---|---|---|---|
| 90–100 | A | Enviar al closer con prioridad. Lead modelo. | Usar llamada como referencia para training. |
| 80–89 | B | Enviar al closer normalmente. Lead sólido. | Micro-ajuste en 1 criterio específico. |
| 65–79 | C | Revisar manualmente antes de enviar. | Coaching focalizado en la fase de menor puntuación. |
| 45–64 | D | NO enviar al closer. | Sesión de roleplay obligatoria antes de volver a llamar. |
| 0–44 | F | NO enviar. Lead a nurturing o descartado. | Revisión completa del guión + re-entrenamiento. |

---

## Formato de Reporte por Llamada

```
============================================================
COL-ANALYSER — REPORTE DE EVALUACIÓN
Llamada ID: [XXX] | Setter: [NOMBRE] | Fecha: [DD/MM/AAAA]
============================================================

ICL: [XX]/100 | Grado: [A/B/C/D/F]

PUNTUACIÓN POR FASES:
  [P0] Gatekeeper (5%)    : [XX]/100
  [P1] Apertura (15%)     : [XX]/100
  [P2] Diagnóstico (30%)  : [XX]/100
  [P3] Filtro Dinero (10%): [XX]/100
  [P4] Filtro Tiempo (15%): [XX]/100
  [P5] Cierre (25%)       : [XX]/100

ERRORES FATALES DETECTADOS:
  [ ] Ninguno
  [X] [Código] - [Descripción] - Minuto [MM:SS]

ERRORES CRÍTICOS GLOBALES:
  [ ] Ninguno
  [X] [Código] - [Descripción]

TOP 3 ACCIONABLES:
  1. [Fase-Criterio] - Minuto [MM:SS] - [Qué hacer]
  2. [Fase-Criterio] - Minuto [MM:SS] - [Qué hacer]
  3. [Fase-Criterio] - Minuto [MM:SS] - [Qué hacer]

RECOMENDACIÓN:
  [ ] Enviar al closer con prioridad (ICL 90-100)
  [ ] Enviar al closer normalmente (ICL 80-89)
  [ ] Revisar manualmente antes de enviar (ICL 65-79)
  [ ] NO enviar - Coaching requerido (ICL 45-64)
  [ ] NO enviar - Re-entrenamiento completo (ICL 0-44)

TIEMPOS:
  Total: [MM:SS]
  P0 Gatekeeper : [MM:SS]
  P1 Apertura   : [MM:SS]
  P2 Diagnóstico: [MM:SS] | Escucha: [XX]%
  P3 Dinero     : [MM:SS]
  P4 Tiempo     : [MM:SS]
  P5 Cierre     : [MM:SS]
```

---

*Fuente: COL-Analyser v3.1 / Criterios de evaluación internos Growing Inmobiliario*
