# Métricas y KPIs — Growing Inmobiliario

> KPIs reales de Xisco basados en su operativa actual.
> Actualizado: 2026-06-13.

---

## 1. Definiciones

| Concepto | Definición |
|----------|------------|
| **Llamada** | Cada contacto telefónico realizado |
| **Conversación** | Llamada que dura más de 1 minuto (el prospecto no cuelga en 5s) |
| **Agenda** | Cita confirmada con el closer (prospecto acepta reunión) |
| **Show** | El prospecto se presenta a la reunión |
| **Cierre** | El prospecto firma / entra en el programa de Growing |
| **Nurturing** | Prospecto que no pasa los filtros pero tiene potencial a futuro |

---

## 2. KPIs de sesión (diarios)

| Métrica | Objetivo diario | Mejor marca | Notas |
|---------|---------------|-------------|-------|
| **Llamadas** | 100 | 117 | Conteo total de llamadas realizadas |
| **Conversaciones** | 25 | — | Llamadas > 1 min |
| **Ratio conversación/llamada** | ≥ 25% | — | conversaciones / llamadas |
| **Agendas** | 3 | 5 | Citas confirmadas con closer |
| **Ratio agenda/llamada** | ≥ 3% | — | agendas / llamadas |

---

## 3. KPIs semanales

| Métrica | Objetivo semanal | Notas |
|---------|---------------|-------|
| **Llamadas** | 500 (5 días × 100) | |
| **Conversaciones** | 125 (5 días × 25) | |
| **Agendas** | 15 (5 días × 3) | |

---

## 4. KPIs mensuales

| Métrica | Objetivo mensual | Notas |
|---------|---------------|-------|
| **Cierres** | ~20% de las agendas | El resto se marca manualmente en el CRM de Growing |
| **Show rate** | 70% | Objetivo de show (presentación) |
| **Show rate actual** | 60% | Marca actual — margen de mejora |

---

## 5. KPIs de calidad de llamada (scorecard — COL-Analyser v3.1)

> **Source of truth:** `scorecard-evaluacion.md`
> **Métrica principal:** ICL (Índice de Calidad de Llamada) — ponderada sobre 6 fases

| Métrica | Objetivo | Relevancia |
|---------|----------|------------|
| **ICL general** | ≥ 75/100 | Media de todas las sesiones |
| **Talk ratio (P2)** | Prospecto ≥ 70% | Setter pregunta, prospecto habla |
| **Apertura con permiso** | 100% | Nunca vender antes de tener permiso |
| **7 preguntas en orden (P2)** | 100% | Nunca saltar preguntas de diagnóstico |
| **Dolor verbalizado (P2)** | 100% | Prospecto articula consecuencia negativa |
| **Filtro dinero (P3)** | 100% | Nunca agendar en supervivencia real |
| **Filtro tiempo (P4)** | 100% | Solo VERDE agenda con closer |
| **Técnica BAMFAM (P5)** | 100% | Siempre 2 alternativas forzadas |
| **Cierre con resumen (P5)** | 100% | Nunca pedir hora sin resumir primero |

---

## 6. KPIs de pipeline del setter

| Fase | Conversión | Detalle |
|------|-----------|---------|
| Llamadas → Conversaciones | ~25% | Quien cuelga en 5s no cuenta |
| Conversaciones → Agendas | ~12% | 3 de 25 conversaciones |
| Agendas → Show | ~60-70% | 60% actual, 70% objetivo |
| Show → Cierre | ~20% | Se marca manualmente |

---

## 7. Comisiones

| Evento | Comisión | Detalle |
|--------|---------|---------|
| **Agenda generada** | 10 EUR | Prospecto acepta reunión |
| **Show (se presenta)** | 50 EUR (total) | La agenda se convierte a 50 EUR al presentarse |
| **Cierre (firma)** | 100 EUR (total) | Se completa al cerrar |

> **Nota:** el esquema es escalonado. Si un prospecto se presenta,
> se pasa de 10 a 50 EUR. Si se cierra, de 50 a 100 EUR.
> Las citas canceladas se pueden reagendar (no se pierde la oportunidad).

---

## 8. Tracking manual

> Xisco marca manualmente en el CRM de Growing:
> - Citas confirmadas
> - Citas con show (se presentó o no)
> - Cierres
> - Citas canceladas y reagendadas

El sistema de Agentik-OS:
- Registra las sesiones de llamadas con score
- Genera los FIPAs del día
- Hace el tracking de agendas cuando Xisco las marca

**Lo que Xisco mete manualmente:**
- Agendas confirmadas / canceladas / reagendadas
- Show o no-show
- Cierres

---

## 9. Dashboard de métricas (qué ve Xisco)

```
JORNADA TIPO — Martes 14/06

LLAMADAS          CONVERSACIONES    AGENDAS
100 / 100        25 / 25           3 / 3
████████████    ████████████████  ████████████████
100%              100%              100%

SHOW RATE         SCORE SESIÓN      RATIO
60% → 70% obj   72/100            25/100 = 25%

INGRESOS POTENCIALES HOY:
  3 agendas × 10€  = 30 EUR (base)
  + show 60%        = (si 2 se presentan: 40 EUR extra)
  + cierre 20%      = (si 1 cierra: 50 EUR extra)

RÉCORD:
  Llamadas en un día: 117
  Agendas en un día: 5
```

---

## 10. Tablero de objetivos del mes

```
MES: Junio 2026

Llamadas:    1.500 / objetivo 2.000  (75%)
Conversaciones: 375 / objetivo 500   (75%)
Agendas:        45 / objetivo 75     (60%)
Show rate:      60% → 70% objetivo
Cierres:        9 / objetivo 15     (60%)

INGRESOS ESTIMADOS:
  Agendas: 45 × 10€ = 450 EUR
  Shows: 27 × 40€  = 1.080 EUR (incremento de 10 a 50)
  Cierres: 9 × 50€ = 450 EUR (incremento de 50 a 100)
  TOTAL POTENCIAL: 1.980 EUR
```

---

_Actualizar KPIs cuando Xisco tenga 30 días de datos reales para ajustar los objetivos._
