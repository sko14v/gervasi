# Dashboards — Agentik O.S.

> Qué dashboards verá Xisco en la app React, qué métricas muestran
> y de dónde salen los datos.

---

## 1. Principios

- **Cifras, no párrafos.** Un dashboard no cuenta historias, muestra
  números y tendencias.
- **Comparación con objetivo** siempre visible.
- **Accionable:** cada bloque del dashboard sugiere un "qué hacer".
- **Filtrable por período:** día, semana, mes, trimestre, año, custom.
- **Filtrable por negocio:** Iron Monkey, Growing, ambos.

---

## 2. Dashboard global (Home)

Tarjetas de resumen + actividad reciente.

### 2.1 Tarjetas (4 principales)

```
┌──────────────────┐  ┌──────────────────┐
│ IRON MONKEY      │  │ GROWING          │
├──────────────────┤  ├──────────────────┤
• Leads activos    │  • Score: 72/100   │
• Propuestas vivas │  • Llamadas hoy    │
• Alertas          │  • Citas hoy       │
• €€€ mes          │  • Racha           │
└──────────────────┘  └──────────────────┘
```

### 2.2 Activity feed

Lista cronológica de las últimas 10 acciones del sistema:

```
hace 2 min  — Lead María García → cualificado
hace 1h    — Sesión 13/06 analizada: 78 calls
hace 3h    — PDF propuesto para IM-2026-001
hace 1d    — Racha Growing rota (5 días → 0)
```

### 2.3 Digest pendiente (banner)

Si hay un digest por leer, se muestra arriba con CTA.

---

## 3. Dashboard Iron Monkey

### 3.1 KPIs principales (4 tarjetas)

| KPI | Unidad | Color si va bien | Color si va mal |
|-----|--------|------------------|-----------------|
| Leads nuevos (semana) | número | Verde si >10 | Rojo si <5 |
| Propuestas enviadas (semana) | número | Verde si >5 | Rojo si <2 |
| Ratio propuesta → cierre | % | Verde si >25% | Rojo si <15% |
| Facturación del mes | € | Verde si >objetivo | Rojo si <80% |

### 3.2 Gráficos

**A. Leads por estado (barras horizontales, estático)**
```
nuevo              ████ 3
contactado         ███ 2
cualificado        ████████ 4
propuesta_borrador ████ 2
propuesta_enviada  ████ 2
en_negociacion     ██ 1
ganado (mes)       █ 1
```

**B. Evolución de cierres (línea temporal, 3 meses)**
```
€€
│      ╱╲
│     ╱  ╲___╱╲
│___╱        ╲___
└──────────────→
  mes-1  mes-2  mes-3
```

**C. Funnel de conversión (embudo)**
```
Leads nuevos          100%  ████████████
Contactados            75%  █████████
Cualificados           45%  █████
Propuesta enviada      30%  ████
Cierre ganado          18%  ██
```

**D. Tiempo medio lead → cierre (gauge)**
```
       7 días
    ┌────●────┐
    │ 6.2 días│
    └─────────┘
```

**E. Alertas activas (lista)**
```
🔴 María García — 3 días sin gestión
🟠 Carlos Ruiz — propuesta enviada hace 4 días, sin respuesta
🟡 Ana López — negociación parada hace 6 días
```

### 3.3 Acciones recomendadas (siempre visible)

```
1. Llamar a María García (estado: cualificado, 3 días sin gestión)
2. Mandar follow-up a Carlos Ruiz (propuesta enviada hace 4 días)
3. Revisar borrador de propuesta para Ana López
```

---

## 4. Dashboard Growing

### 4.1 KPIs principales (5 tarjetas)

| KPI | Unidad | Color si va bien | Color si va mal |
|-----|--------|------------------|-----------------|
| Score promedio (semana) | /100 | Verde si ≥75 | Rojo si <60 |
| Llamadas (semana) | número | Verde si ≥400 | Rojo si <300 |
| Citas (semana) | número | Verde si ≥12 | Rojo si <8 |
| Ratio citas/llamadas | % | Verde si ≥15% | Rojo si <10% |
| Racha objetivos | días | 🔥 | — |

### 4.1.1 FIPA — Feedback Insight Para Aplicar (digest 08:00)

Cada mañana, el digest de Growing muestra los **3-5 FIPAs** del día
anterior: insights accionables que Xisco debe aplicar HOY en sus
llamadas. Se generan a partir del Feedback Coach.

```
=== FIPA — Martes 14/06/2026 ===
(Insights de la sesión de ayer)

🎯 FIPA #1: BAJAR TALK RATIO
  Tu talk ratio ayer fue 65%. OBJETIVO HOY: < 55%.
  Cómo: haz 3 preguntas de descubrimiento antes de presentar nada.

🎯 FIPA #2: OBJECIÓN "NO TENEMOS TIEMPO"
  Usaste el "sí total" en 4 llamadas (respuesta contraproducente).
  OBJETIVO HOY: usa la respuesta validativa de O1 en el script.

🎯 FIPA #3: APERTURA
  Tu mejor patrón ayer: agenda con 2 opciones de horario en 3 cierres.
  OBJETIVO HOY: repite ese patrón en ≥ 5 llamadas.

🎯 FIPA #4: CIERRES PERDIDOS
  3 llamadas acabaron en "lo pensaré" sin follow-up.
  OBJETIVO HOY: agenda SIEMPRE un callback, aunque sea tibio.
```

Los FIPAs se muestran también como **tarjeta destacada** en el
dashboard Growing, con checkboxes para que Xisco los marque como
"aplicado" durante la sesión.

---

**A. Score en el tiempo (línea con 5+ sesiones)**
```
100│
 80│      ●───●
 72│  ●───╱     ╲
 60│ ●            ●───
   └──────────────────→
     S1  S2  S3  S4  S5
```

**B. Llamadas vs objetivo (barras agrupadas, por día de la semana)**
```
        L  M  X  J  V
obj.    80 80 80 80 80
real    82 78 85 78 75
```

**C. Distribución del score (histograma)**
```
0-20  │
20-40 │█
40-60 │██
60-80 │████████
80-100│███
```

**D. Conversión por día de la semana (heat map)**
```
        L    M    X    J    V
ratio   12%  18%  15%  10%  8%
```

**E. Top wins / improvements de la semana (texto)**
```
Wins esta semana:
• 4 cierres con objeciones en <5 min
• Apertura <20s en 85% de llamadas
• Pitch personalizado en dolor detectado

Improvements:
• Bajar talk ratio 65→55%
• Menos muletillas en apertura
• Preguntar más antes de presentar
```

**F. Gamificación**
```
🎯 Objetivo de hoy: 100 calls, 24 conversaciones
Progreso: 78/100 calls, 19/24 conversaciones
Racha actual: 🔥 5 días
Mejor marca: 12 días
```

---

## 5. Dashboard combinado (Ambos negocios)

Para vista semanal / mensual.

### 5.1 KPIs lado a lado

| | Iron Monkey | Growing |
|---|---|---|
| **Semana** | 12 leads / 4 prop / 1 cierre | 320 calls / 48 citas / 72 score |
| **vs semana pasada** | +3 / +1 / 0 | +40 / +6 / +3 |
| **Mes** | 45 leads / 18 prop / 4 cierres | 1.280 calls / 192 citas / 71 score |
| **vs mes pasado** | +8 / +4 / +1 | +150 / +22 / +2 |

### 5.2 Productividad (horas)

```
Horas trabajadas esta semana:
- Iron Monkey (CRM + llamadas): 18h
- Growing (llamadas + análisis): 22h
- Total facturable: ~40h
```

### 5.3 ROI

```
Ingresos:
- Iron Monkey (mes actual): 8.500€
- Growing (mes actual): 2.400€  (a confirmar)
- TOTAL: 10.900€

Costes:
- Modelos IA: 62€
- Tiempo dedicado: ~150h
- Coste/hora implícito: 0,07€ + tiempo
```

---

## 6. Vistas filtradas

### 6.1 "Mi día" (vista diaria)

Lo que Xisco necesita ver a primera hora:

- **Alertas** con prioridad.
- **Leads a llamar** hoy (estado: nuevo + 48h sin gestión).
- **Follow-ups pendientes** (propuesta_enviada >48h).
- **Sesión Growing de ayer**: resultado + 3 wins + 3 improvements.
- **Objetivo del día** (Growing) con progreso.
- **3 acciones recomendadas**.

### 6.2 "Mi semana" (vista semanal)

- Cierre de la semana anterior (números).
- Comparativa con semana previa.
- Top 3 wins / top 3 improvements.
- Proyección de cierre de mes.
- Gráficos de tendencia (5 semanas).

### 6.3 "Mi mes" (mensual)

- Cierre numérico del mes.
- Score promedio mensual.
- Facturación total.
- ROI.
- Comparativa con meses anteriores.
- Propuesta de objetivos del mes siguiente.

---

## 7. Implementación técnica

### 7.1 Fuente de datos

Los dashboards **leen del vault** mediante la capa `lib/vault/reader.ts`.
Cada gráfico se calcula on-the-fly a partir de:

- `01-IronMonkeyCharter/leads/*.md` (con su frontmatter).
- `02-GrowingInmobiliario/sesiones/*.md`.
- `02-GrowingInmobiliario/feedback/*.md`.
- `MEMORY.md` (objetivos del mes).
- `02-GrowingInmobiliario/tracker-*.md`.

> **Rendimiento:** con 100-200 leads y 100-200 sesiones, el cálculo
> es instantáneo. Si crece a 1.000+ leads, considerar indexar con
> Graphify server-side y cachear.

### 7.2 Filtros y rangos

```typescript
type Rango = 'dia' | 'semana' | 'mes' | 'trimestre' | 'ano' | 'custom';
type Negocio = 'ironmonkey' | 'growing' | 'ambos';

interface DashboardFilters {
  rango: Rango;
  fecha_inicio?: string;
  fecha_fin?: string;
  negocio: Negocio;
}
```

### 7.3 Componentes

```
components/dashboard/
├── KpiCards.tsx              # 4-5 tarjetas grandes
├── TrendLine.tsx             # Línea temporal (Recharts)
├── BarChart.tsx              # Barras verticales/horizontales
├── FunnelChart.tsx           # Embudo de conversión
├── Gauge.tsx                 # Indicador de tiempo medio
├── Histogram.tsx             # Distribución de scores
├── HeatMap.tsx               # Conversión por día
├── AlertList.tsx             # Lista priorizada
├── ActionList.tsx            # Acciones recomendadas
└── ComparisonTable.tsx       # Iron vs Growing lado a lado
```

---

## 8. Notificaciones y badges

- **Badge** en el sidebar con número de alertas activas.
- **Banner** arriba si hay digest pendiente.
- **Push notification** del SO a las 08:00 / 18:00 (digest).
- **Toast** en tiempo real cuando Xisco marca un objetivo como
  cumplido o se genera un nuevo feedback.

---

## 9. Lo que NO va en los dashboards (v1)

- Forecasting con ML (predicciones complejas).
- Comparativa con el sector / mercado.
- A/B testing de pitches.
- Análisis de sentimiento fino por interlocutor.
- Grabación de pantalla / replay de las llamadas en la app.
- Exportación a PDF del dashboard (Xisco puede hacer screenshot).

---

_Versión 1.0 — Dashboards. Esto es lo que Xisco ve cuando abre la
app. La implementación se hace junto con la app React (Fases 1-3
de `app-arquitectura.md`)._
