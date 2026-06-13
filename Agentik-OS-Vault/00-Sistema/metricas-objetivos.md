# Métricas y objetivos — Agentik O.S.

> KPIs globales del sistema. Los agentes miden, reportan y proponen
> acciones correctivas cuando se desvían de los objetivos.

---

## 1. KPIs de Iron Monkey Charter

| Métrica | Objetivo | Frecuencia de medición | Reporta |
|---------|----------|------------------------|---------|
| **Leads recibidos** | tracking | Diario | CRM Manager |
| **Leads cualificados (score ≥ 7)** | ≥ 30% de leads | Semanal | Lead Qualifier |
| **Tiempo medio de respuesta al lead** | < 5 min | Por lead | CRM Manager |
| **Propuestas enviadas** | tracking | Semanal | Proposal Generator |
| **Ratio propuesta → cierre** | ≥ 25% | Mensual | CRM Manager |
| **Ticket medio** | tracking | Mensual | CRM Manager |
| **Días medios lead → cierre** | < 7 días | Mensual | CRM Manager |
| **Leads estancados > 48h** | 0 | Diario | CRM Manager (alerta) |

---

## 2. KPIs de Growing Inmobiliario

### 2.1 Operación diaria

| Métrica | Objetivo | Mejor marca | Frecuencia | Reporta |
|---------|----------|------------|------------|---------|
| **Llamadas/día** | 100 | 117 | Diario | Goal Tracker |
| **Conversaciones/día** | 25 | — | Diario | Goal Tracker |
| **Ratio conversación/llamada** | ≥ 25% | — | Diario | Goal Tracker |
| **Agendas/día** | 3 | 5 | Diario | Goal Tracker |
| **Ratio agenda/llamada** | ≥ 3% | — | Diario | Goal Tracker |
| **Score promedio por sesión** | ≥ 75/100 | — | Por sesión | Feedback Coach |
| **Show rate** | 70% | — | Semanal | Xisco (manual) |

### 2.2 Crecimiento mensual

| Métrica | Objetivo | Frecuencia | Reporta |
|---------|----------|------------|---------|
| **Llamadas/mes** | 2.000 (20 días) | Mensual | Goal Tracker |
| **Agendas/mes** | 60 (3 × 20) | Mensual | Goal Tracker |
| **Cierres/mes** | ~20% de agendas | Mensual | Xisco (manual en CRM Growing) |
| **Show rate** | 70% (de 60% actual) | Mensual | Xisco (manual) |
| **Mejora de score promedio vs mes anterior** | +3 puntos | Mensual | Feedback Coach |
| **Objeciones nuevas documentadas** | tracking | Mensual | Feedback Coach |
| **Racha de objetivos diarios cumplidos** | tracking | Continuo | Goal Tracker |

### 2.3 Calidad de las llamadas

| Métrica | Objetivo | Frecuencia | Reporta |
|---------|----------|------------|---------|
| **Talk-to-listen ratio** | < 60% talk | Por sesión | Call Analyzer |
| **Apertura < 20s** | ≥ 80% de llamadas | Por sesión | Call Analyzer |
| **Objeciones manejadas vs no manejadas** | ≥ 70% manejadas | Por sesión | Call Analyzer |
| **Muletillas detectadas** | tracking, tendencia ↓ | Por sesión | Call Analyzer |
| **Citas confirmadas vs agendadas** | ≥ 80% confirmadas | Semanal | Prospect Note Taker |

---

## 3. KPIs del sistema (Agentik O.S. en sí)

| Métrica | Objetivo | Frecuencia | Reporta |
|---------|----------|------------|---------|
| **Coste mensual modelos** | ≤ 62 EUR | Mensual | Xisco (revisión manual) |
| **Tiempo ahorrado por Xisco/semana** | tracking, tendencia ↑ | Semanal | Xisco |
| **% tareas automatizadas** | tendencia ↑ | Mensual | Xisco |
| **Tokens consumidos/mes** | tracking, tendencia ↓ si sube | Mensual | Sistema |
| **Incidentes / errores** | 0 críticos | Continuo | log.md |

---

## 4. Cálculo de proyecciones

El agente **Goal Tracker** proyecta cierre de mes con esta fórmula:

```
ritmo_actual = citas_agendadas_a_la_fecha / días_transcurridos
proyección_mes = ritmo_actual × días_del_mes
%_objetivo = (proyección_mes / objetivo_mes) × 100
```

**Estados:**
- `≥ 100%` → en meta ✅
- `80–99%` → atención ⚠️
- `< 80%` → alerta 🔴 (escalar a Xisco)

---

## 5. Gamificación (Growing Inmobiliario)

Xisco puede fijar objetivos diarios personalizables. Ejemplos:

- 100 llamadas + 24 conversaciones.
- 50 llamadas + 15 conversaciones.
- 30 llamadas + 10 conversaciones (modo conservación).

**El sistema:**
- Registra el objetivo de la mañana.
- Compara con el resultado al final del día.
- Acumula rachas y mejores marcas personales.
- Genera reporte motivacional (positivo si se cumple, constructivo si no).

**Visualización:** tablero simple con % de cumplimiento, racha actual,
mejor marca, tendencia semanal.

---

## 6. Reportes

### 6.1 Daily digest (18:00)

- Resumen de leads del día (Iron Monkey).
- Resumen de llamadas y score (Growing).
- KPIs del día vs objetivo.
- Alertas activas.

### 6.2 Weekly review (domingo)

- Comparativa semana actual vs anterior.
- Top 3 wins de la semana.
- Top 3 áreas de mejora.
- Proyección de cierre de mes.
- Aprendizajes nuevos para `MEMORY.md`.

### 6.3 Monthly close (último día del mes)

- Cierre numérico del mes.
- Score promedio mensual.
- Ratio global citas/llamadas.
- ROI estimado (charter facturado vs horas invertidas).
- Propuesta de objetivos del mes siguiente.

---

## 7. Cuándo escalar a Xisco

Un agente debe **escalar a Xisco** (no decidir solo) cuando:

- Hay un cambio de política o precio que afecta un cierre activo.
- Un lead propone condiciones fuera de lo estándar.
- Una llamada tiene un patrón nuevo o insight crítico.
- El sistema detecta un error propio.
- Un KPI cae por debajo del 80% del objetivo 2 semanas seguidas.

---

_Actualizar cuando cambie un objetivo o se añada un KPI nuevo._
