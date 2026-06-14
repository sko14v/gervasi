# Plan: Módulo "Casa de Apuestas" para Growing Inmobiliario

> **Estado:** v1.1 — correcciones de Xisco integradas
> **Autor:** Mavis (Mavis) en respuesta a la solicitud de Xisco
> **Fecha:** 2026-06-14 (revisión 18:49)
> **Negocio:** Growing Inmobiliario (cold calling SDR)
> **Módulo dentro de:** Agentik-OS App, sección Growing
>
> ### Historial de versiones
>
> - **v1.1 (18:49)** — correcciones de Xisco:
>   - Eliminado sistema de stake/puntos/banca virtual. Es un
>     sistema de **hábitos y objetivos**, no de casino. El
>     "payout" no se apuesta — es una **proyección económica**
>     de lo que valdría el objetivo si se cumple con los
>     ratios del sector.
>   - Payout = función del **tipo de reto** (llamadas →
>     estimación de contesta + agendas, conversaciones →
>     estimación de agendas, agendas → estimación de
>     show + cierre).
>   - Payout tiene **dos caras**: **potencial** (calculado
>     al cerrar la apuesta con ratios objetivo) y **real**
>     (actualizado en diferido a medida que Xisco marca
>     shows/cierres/cancelaciones en el tracker de agendas).
>   - Digest del módulo pasa a las **20:00** (antes: 18:00
>     residual). Confeti/animation de "all-in" confirmado.
> - **v1.0 (18:41)** — primera versión del plan.

---

## 0. Resumen ejecutivo

Xisco quiere un **módulo de hábitos con payout económico realista**
dentro de Growing Inmobiliario con dos partes:

1. **Reto del día** — cada mañana (o la noche anterior) define
   el objetivo: "mañana 100 llamadas / 25 conversaciones / 3 agendas".
2. **Captura de estadísticas** — al cerrar el día, Xisco mete
   los números reales (llamadas, conversaciones, agendas, reagendas).

El sistema calcula automáticamente si el reto se cumplió, mantiene
la racha, muestra el mes entero de un vistazo y proyecta el **valor
económico del objetivo** según los ratios reales del sector.

### 0.1 La idea clave: payout por mercado, no por casino

> **Lo que se "apuesta" no es dinero. Es tiempo y esfuerzo.**
> El payout no se gana ni se pierde — es una **proyección
> económica** de lo que valdría el objetivo cumplido, calculada
> con los ratios reales del sector inmobiliario que Xisco ya
> documenta en `metricas-kpis.md`.

Cada reto (llamadas, conversaciones o agendas) tiene su **propio
mercado** con su propio sistema de valoración:

| Mercado | Ratio objetivo del sector | Valor unitario | Por qué |
|---------|---------------------------|----------------|---------|
| **Llamadas** | 30-40% contesta | 0 EUR directo | Es el "input". Su valor está en que habilita los siguientes mercados. |
| **Conversaciones** | 10-15% termina en agenda | 10 EUR / agenda generada | Cada 8-10 conversaciones ≈ 1 agenda (10€). |
| **Agendas** | 70% show rate | 50 EUR / show | Si Xisco mete 3 agendas y se presentan 2, eso son 2 × 50€ = 100€ de valor. |

> **No es un stake real.** Es una **estimación económica** de lo
> que el objetivo vale si se cumple, siguiendo la lógica del
> `tracker-facturacion.md` y `objetivos-mensuales.md` que ya
> existen. La idea es que Xisco vea cada mañana **"si cumplo,
> el valor esperado de hoy son X euros"** y se comprometa con ese
> objetivo sabiendo lo que vale.

### 0.2 Dos caras del payout: potencial vs real

- **Payout potencial** → se calcula al **cerrar el reto** del
  día, con los ratios objetivo del sector. Es la foto del
  "qué pasaría si todo va bien según ratios".
- **Payout real** → se actualiza **en diferido** a medida que
  Xisco marca shows / cierres / cancelaciones / reagendas en el
  `tracker-agendas.md`. Esta es la foto real, semanas después.

**Ejemplo del flujo completo de un día:**

```
14/06 — RETO CERRADO POR LA MAÑANA
  Llamadas: 100
  Conversaciones: 25
  Agendas: 3
  Payout potencial: 3 × 70% × 50€ = 105 €

14/06 — 20:00, STATS CERRADAS
  Llamadas: 117 ✅
  Conversaciones: 26 ✅
  Agendas: 4 ✅
  Payout potencial recalculado: 4 × 70% × 50€ = 140 €
  Racha: 8 días
  STATUS: RETO CUMPLIDO

15/06 — el prospect_1 hace show → 50€ al payout real
17/06 — el prospect_2 NO se presenta → 0€ (cancela)
18/06 — el prospect_3 hace show → 50€ al payout real
20/06 — el prospect_4 hace show + cierre → 100€ al payout real
21/06 — CIERRE DEL DÍA (vista retrospectiva):
  Payout real: 200 € (3 shows × 50€ + 1 cierre × 50€ extra)
  Payout potencial era: 140 €
  Real vs Potencial: +60 € (sobrerendimiento)
```

### 0.3 Por qué esto es mejor que un stake ficticio

- **Sin puntos, sin banca, sin riesgo percibido.** Es un sistema
  de hábitos, no de casino. El "premio" es ver el valor real que
  ha generado el esfuerzo, no acumular numeritos.
- **Los ratios son reales y del propio negocio.** No hay
  números inventados. Se usan los mismos ratios que ya están
  en `metricas-kpis.md` y `objetivos-mensuales.md`.
- **Conecta la motivación diaria con la facturación mensual.**
  Xisco ve que el reto de hoy **= X euros esperados**, que
  suman al mes. Es el mismo dinero que ya cobra, pero visualizado
  desde la mañana.
- **El payout real se ve con el paso del tiempo**, lo cual
  refuerza el aprendizaje: "los días que apuntoé 3 agendas y
  se presentaron 2, validé 100€". Eso es más potente que un
  "+1.5 puntos".

### 0.4 Decisiones integradas en v1.1

| Tema | Decisión |
|------|----------|
| ¿Stake de puntos? | **NO.** Es sistema de hábitos, no de casino. |
| ¿Banca virtual? | **NO.** Se elimina. |
| ¿Payout? | **SÍ**, pero como **proyección económica**, no como stake. |
| Ratios para calcular payout | Los del sector: 30-40% contesta, 10-15% conv→agenda, 70% show rate, 50€ show / 100€ cierre. |
| Payout al cierre del día | **Potencial** (proyección). |
| Payout días después | **Real** (actualizado desde tracker de agendas). |
| Digest del módulo | **20:00 cada día** (cuando ya cerró sesión). |
| Animación "all-in" | **SÍ**, integrada. |

---

## 1. El concepto: "Comprometer objetivos, no apostar"

### 1.1 El framing correcto: hábito + valor, no casino

Xisco corrigió el framing original: **no es una casa de apuestas,
es un sistema de hábitos con valor económico visible**. La
diferencia importa porque cambia la psicología:

| Casa de apuestas (v1.0, descartado) | Sistema de hábitos (v1.1) |
|-------------------------------------|---------------------------|
| Riesgo de perder algo | Cero riesgo |
| Recompensa artificial (puntos) | Recompensa real (€ esperados) |
| Subidón al ganar, bajón al perder | Consistencia diaria, aprendizaje |
| Banca virtual que hay que gestionar | Nada que gestionar, solo ejecutar |
| Stake ficticio | **El compromiso es el objetivo mismo** |

**El nombre del módulo sigue siendo "Casa de Apuestas"** porque
es la metáfora que Xisco usó y el framing le funciona, pero
**internamente no hay stake**. Hay un **reto diario** con un
**payout potencial** (valor esperado si se cumple con los ratios
del sector) y un **payout real** (lo que terminó valiendo cuando
llegaron los shows/cierres semanas después).

### 1.2 Las tres capas del módulo

```
┌─────────────────────────────────────────────────────────────┐
│ CAPA 1: RETO (input comprometido)                            │
│ Xisco define por la noche o por la mañana:                   │
│   - Modo (conservador / estándar / push / recuperación /     │
│     custom)                                                  │
│   - Métricas objetivo (llamadas, conv, agendas)              │
│   - Score mínimo opcional                                    │
│   - El sistema calcula el PAYOUT POTENCIAL con los ratios    │
│     del sector:                                              │
│     llamadas × 35% contesta × 12% agenda × 70% show × 50€  │
│                                                              │
│ CAPA 2: REALIDAD (input verificado)                          │
│ Al final del día Xisco mete:                                 │
│   - Llamadas reales                                          │
│   - Conversaciones reales                                    │
│   - Agendas reales                                           │
│   - Reagendas, canceladas                                    │
│   - Score promedio (si hubo análisis)                         │
│   → El sistema recalcula el PAYOUT POTENCIAL con los datos  │
│     reales del día                                           │
│                                                              │
│ CAPA 3: CÁLCULO RETROSPECTIVO (en diferido)                  │
│ Días/semanas después, según se van cerrando shows y          │
│ cierres en el tracker de agendas, el sistema actualiza el    │
│ PAYOUT REAL de cada reto.                                    │
│                                                              │
│ Output del sistema:                                          │
│   - ¿Cumplido? (todos los sub-objetivos)                     │
│   - Payout potencial (€ esperados con ratios)                 │
│   - Payout real (€ validados con shows/cierres reales)       │
│   - Racha actualizada                                        │
│   - Insights del día                                         │
│   - Logro si aplica                                          │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 Los tres "mercados" de un reto

Cada reto es en realidad **tres mercados** que se pueden apostar
por separado o todos a la vez. La forma natural de un día es
apostar por los tres (porque los tres se dan en cascada):

```
Mercado 1: LLAMADAS
  Input: 100 llamadas
  Pipeline esperado: 100 × 35% contesta = 35 conversaciones
                     35 × 12% agenda   = 4.2 agendas
                     4.2 × 70% show   = 2.94 shows
                     2.94 × 50€       = 147€ payout potencial
  ⚠️ El valor de las llamadas no es directo. Es "lo que habilita".

Mercado 2: CONVERSACIONES
  Input: 25 conversaciones
  Pipeline esperado: 25 × 12% = 3 agendas
                     3 × 70% = 2.1 shows
                     2.1 × 50€ = 105€ payout potencial
  💬 Sí tiene valor cuantificable: ratio conv→agenda.

Mercado 3: AGENDAS
  Input: 3 agendas
  Pipeline esperado: 3 × 70% = 2.1 shows
                     2.1 × 50€ = 105€ payout potencial
  🎯 El más directo. El que más importa.
```

**Decisión UX:** el módulo muestra los tres pero **solo el
"mercado de agendas" se traduce a € en pantalla**. Las llamadas
y conversaciones se muestran como **números y ratios** ("si
cumples, esperarías 4 agendas y 3 shows ≈ 150€"). La razón es
que Xisco mismo dijo: *"lo que cuentan son las agendas"*.

> Si Xisco quiere ver el desglose completo de los tres mercados,
> el sistema lo calcula internamente y lo muestra en un panel
> expandible tipo "detalle económico" — pero el **dashboard
> principal habla en agendas y € esperados**.

---

## 2. Modelo de datos (TypeScript)

> **Convención del proyecto:** tipos en `packages/app/src/types/`
> y `packages/shared/src/types/`. Sigo el mismo patrón.
>
> **Cambio v1.1:** eliminados `Stake`, `puntos_apostados`,
> `puntos_ganados`, `payout_multiplier`, `puntos_acumulados`.
> Añadidos `PayoutPotencial`, `PayoutReal`, `MercadoValoracion`.

### 2.1 Ratios del sector (configurables, no hardcodeados)

```typescript
// packages/shared/src/lib/ratios.ts

/**
 * Ratios del sector inmobiliario para Xisco.
 *
 * Fuente: metricas-kpis.md §6 y objetivos-mensuales.md §2.
 *
 * Estos ratios son los que se usan para calcular el payout
 * potencial de un reto. Son CONFIGURABLES desde Settings.tsx
 * porque el mercado cambia y Xisco puede ajustarlos cuando
 * tenga 30 días de datos reales (como dice metricas-kpis.md §10).
 */
export interface RatiosSector {
  /** Probabilidad de que una llamada sea "conversación" (>1 min) */
  ratio_contesta: number;        // default 0.35 (rango 0.30-0.40)
  /** Probabilidad de que una conversación termine en agenda */
  ratio_conv_agenda: number;     // default 0.12 (rango 0.10-0.15)
  /** Probabilidad de que una agenda agendada se presente (show) */
  show_rate: number;             // default 0.70
  /** Comisión cuando el prospecto se presenta (EUR) */
  eur_por_show: number;          // default 50
  /** Comisión extra cuando se cierra la venta (EUR) */
  eur_por_cierre: number;        // default 100
}

export const RATIOS_DEFAULT: RatiosSector = {
  ratio_contesta: 0.35,
  ratio_conv_agenda: 0.12,
  show_rate: 0.70,
  eur_por_show: 50,
  eur_por_cierre: 100,
};
```

### 2.2 Tipos nuevos

```typescript
// packages/shared/src/types/betting.ts

export type BetMode = 'conservador' | 'estandar' | 'push' | 'recuperacion' | 'custom';
export type BetStatus = 'pending' | 'in_progress' | 'won' | 'lost' | 'void';

/** Reto definido antes de la sesión (sin stake, sin banca) */
export interface DailyBet {
  id: string;                    // 'bet-2026-06-14'
  fecha: string;                 // 'YYYY-MM-DD'
  modo: BetMode;
  objetivos: {
    llamadas: number;
    conversaciones: number;
    agendas: number;
    score_minimo?: number;       // opcional
  };
  notas_pre?: string;            // nota libre de Xisco (opcional)
  created_at: string;            // ISO timestamp
}

/** Estadísticas reales introducidas al final del día */
export interface DailyStats {
  id: string;                    // 'stats-2026-06-14'
  fecha: string;                 // 'YYYY-MM-DD'
  llamadas: number;
  conversaciones: number;
  agendas: number;
  reagendas: number;             // agendas reagendadas
  canceladas: number;            // agendas canceladas
  score_promedio?: number;       // 0-100, opcional
  notas_post?: string;           // nota libre de Xisco (opcional)
  submitted_at: string;          // ISO timestamp
}

/** Estado de un agenda individual (espejo del tracker-agendas.md) */
export interface AgendaStatus {
  agenda_id: string;             // prospecto
  fecha_agendada: string;        // YYYY-MM-DD (de la apuesta)
  show: 'pendiente' | 'presentado' | 'no_presentado' | 'cancelado' | 'reagendado';
  cierre: 'pendiente' | 'cerrado' | 'nurturing' | 'perdido';
  updated_at: string;
}

/**
 * Payout potencial: lo que valdría el objetivo si se cumplen
 * los ratios del sector. Se calcula al cerrar el reto y se
 * recalcula al cerrar las stats del día (con datos reales
 * pero asumiendo ratios para los shows/cierres que aún no
 * se han producido).
 */
export interface PayoutPotencial {
  eur_esperado: number;
  detalle: {
    /** Valor derivado del mercado de llamadas (vía cascada) */
    llamadas: MercadoValoracion;
    /** Valor derivado del mercado de conversaciones */
    conversaciones: MercadoValoracion;
    /** Valor derivado del mercado de agendas (el principal) */
    agendas: MercadoValoracion;
  };
  ratios_usados: RatiosSector;
}

/**
 * Valoración económica de UN mercado concreto.
 * Usado para los 3 sub-mercados del reto.
 */
export interface MercadoValoracion {
  /** Cuántas unidades del input (llamadas/conv/agendas) */
  input: number;
  /** Conversiones estimadas a través del pipeline del sector */
  pipeline: {
    contesta?: number;           // solo para llamadas
    agendas_esperadas: number;   // 1ª conversión
    shows_esperados: number;     // 2ª conversión
    cierres_esperados: number;   // 3ª conversión
  };
  /** EUR esperado = shows × eur_por_show + cierres × eur_por_cierre */
  eur_esperado: number;
}

/**
 * Payout real: lo que terminó valiendo el objetivo cuando
 * se cerraron shows/cierres/cancelaciones en el tracker.
 * Se actualiza EN DIFERIDO.
 */
export interface PayoutReal {
  eur_real: number;
  detalle: {
    shows_cerrados: number;
    cierres_cerrados: number;
    canceladas: number;
    reagendadas: number;
  };
  /** Última fecha en que se actualizó desde el tracker */
  updated_at: string;
  /** Estado del cálculo: ¿están todas las agendas resueltas? */
  cerrado: boolean;
}

/** Resultado calculado: bet + stats + payout */
export interface DailyResult {
  bet: DailyBet;
  stats: DailyStats | null;      // null = no se han metido stats aún
  status: BetStatus;             // pending | in_progress | won | lost | void
  cumplimiento: {
    llamadas: { objetivo: number; real: number; pct: number; ok: boolean };
    conversaciones: { objetivo: number; real: number; pct: number; ok: boolean };
    agendas: { objetivo: number; real: number; pct: number; ok: boolean };
    score?: { objetivo: number; real: number; ok: boolean };
  };
  payout_potencial: PayoutPotencial | null;  // null si no hay bet
  payout_real: PayoutReal | null;            // null hasta que se cierra el ciclo
  racha_antes: number;
  racha_despues: number;
  mejor_racha_historica: number;
  logros_desbloqueados: AchievementUnlock[];
}

/** Racha persistente (ya no acumula puntos) */
export interface Streak {
  actual: number;
  mejor: number;
  fecha_inicio_actual: string | null;
  fecha_mejor: string | null;
  total_retos: number;
  total_cumplidos: number;
  total_no_cumplidos: number;
  /** Suma de payout real validado en los últimos 30 días (€) */
  eur_reales_30d: number;
  /** Suma de payout potencial de los últimos 30 días (€) */
  eur_potencial_30d: number;
}

/** Logro desbloqueable (mismos que gamificacion.md §6, +2 nuevos) */
export type AchievementId =
  | 'primera_sangre'
  | 'semana_perfecta'
  | 'quincena'
  | 'mes_completo'
  | 'volumen_100'
  | 'conversador_30'
  | 'cerrador_5'
  | 'record_personal'
  | 'vuelta_ruedo'
  | 'maraton_4h'
  | 'apuesta_5x_ganada'         // legacy de v1.0, ahora achievement "retos_duros"
  | 'doble_quincena';

export interface Achievement {
  id: AchievementId;
  nombre: string;
  descripcion: string;
  emoji: string;
  condicion: string;             // texto legible para mostrar
}

export interface AchievementUnlock {
  achievement: Achievement;
  fecha: string;
  bet_id: string;
}

/** Resumen mensual para la vista calendario */
export interface MonthSummary {
  mes: string;                   // 'YYYY-MM'
  dias: DayCell[];
  totales: {
    retos: number;
    cumplidos: number;
    no_cumplidos: number;
    void: number;
    pct_cumplimiento: number;
    total_llamadas: number;
    total_conversaciones: number;
    total_agendas: number;
    eur_potencial_total: number;  // suma payout potencial del mes
    eur_real_total: number;       // suma payout real validado
  };
  racha_mas_larga: number;
}

export interface DayCell {
  fecha: string;
  status: BetStatus | 'no_bet';  // no_bet = día sin reto definido
  pct_cumplimiento: number | null;
  eur_potencial: number;          // 0 si no cumplido o sin reto
  eur_real: number;               // 0 si no cerrado aún
  modo: BetMode | null;
}
```

### 2.3 Reglas de cálculo (lógica pura, testeable)

```typescript
// packages/shared/src/lib/betting.ts

import type { RatiosSector } from './ratios';
import { RATIOS_DEFAULT } from './ratios';

/**
 * Regla: el reto se cumple SOLO si TODOS los sub-objetivos
 * se cumplen. Cumplimiento parcial = no cumplido.
 * (Esta regla ya está en gamificacion.md §2 — la respetamos.)
 */
export function evaluarCumplimiento(
  bet: DailyBet,
  stats: DailyStats
): DailyResult['cumplimiento'] {
  const cmp = (obj: number, real: number) => ({
    objetivo: obj,
    real,
    pct: obj === 0 ? 0 : Math.round((real / obj) * 1000) / 10,
    ok: real >= obj,
  });

  const cumplimiento: DailyResult['cumplimiento'] = {
    llamadas: cmp(bet.objetivos.llamadas, stats.llamadas),
    conversaciones: cmp(bet.objetivos.conversaciones, stats.conversaciones),
    agendas: cmp(bet.objetivos.agendas, stats.agendas),
  };

  if (bet.objetivos.score_minimo !== undefined && stats.score_promedio !== undefined) {
    cumplimiento.score = {
      objetivo: bet.objetivos.score_minimo,
      real: stats.score_promedio,
      ok: stats.score_promedio >= bet.objetivos.score_minimo,
    };
  }

  return cumplimiento;
}

export function calcularStatus(result: DailyResult['cumplimiento']): BetStatus {
  const checks = [
    result.llamadas.ok,
    result.conversaciones.ok,
    result.agendas.ok,
    result.score?.ok ?? true,
  ];
  return checks.every(Boolean) ? 'won' : 'lost';
}

/**
 * Calcula la valoración de un mercado (llamadas / conversaciones / agendas).
 * Aplica la cascada del sector: input → contesta → agenda → show → cierre
 * y devuelve el EUR esperado según los ratios.
 *
 * Ejemplo Mercado AGENDAS con input=3 y ratios default:
 *   pipeline: agendas=3, shows=2.1, cierres=0.42
 *   eur = 2.1 × 50€ + 0.42 × 100€ = 105€ + 42€ = 147€
 *   (en realidad se redondea y se hace la cascada completa)
 */
export function valorarMercado(
  input: number,
  mercado: 'llamadas' | 'conversaciones' | 'agendas',
  ratios: RatiosSector = RATIOS_DEFAULT
): MercadoValoracion {
  // Cascada de conversiones según el mercado
  let agendas_esperadas = 0;
  let shows_esperados = 0;
  let cierres_esperados = 0;
  let contesta: number | undefined;

  switch (mercado) {
    case 'llamadas':
      contesta = input * ratios.ratio_contesta;
      agendas_esperadas = contesta * ratios.ratio_conv_agenda;
      break;
    case 'conversaciones':
      agendas_esperadas = input * ratios.ratio_conv_agenda;
      break;
    case 'agendas':
      agendas_esperadas = input;
      break;
  }

  shows_esperados = agendas_esperadas * ratios.show_rate;
  // Tasa de cierre: ~20% de los shows terminan en cierre (de metricas-kpis.md §6)
  cierres_esperados = shows_esperados * 0.20;

  const eur_esperado =
    shows_esperados * ratios.eur_por_show +
    cierres_esperados * ratios.eur_por_cierre;

  return {
    input,
    pipeline: {
      contesta,
      agendas_esperadas: round1(agendas_esperadas),
      shows_esperados: round1(shows_esperados),
      cierres_esperados: round1(cierres_esperados),
    },
    eur_esperado: round2(eur_esperado),
  };
}

/**
 * Calcula el payout potencial completo de un reto (los 3 mercados).
 * Si se pasa stats (al cerrar el día), se recalcula con los
 * datos reales del día pero asumiendo ratios para shows/cierres
 * que aún no se han producido.
 */
export function calcularPayoutPotencial(
  bet: DailyBet,
  stats: DailyStats | null,
  ratios: RatiosSector = RATIOS_DEFAULT
): PayoutPotencial {
  // Si hay stats, el "input" son los valores reales (ya conseguidos).
  // Si no hay stats, el "input" son los objetivos (estimación previa).
  const input_llamadas = stats?.llamadas ?? bet.objetivos.llamadas;
  const input_conversaciones = stats?.conversaciones ?? bet.objetivos.conversaciones;
  const input_agendas = stats?.agendas ?? bet.objetivos.agendas;

  return {
    eur_esperado:
      valorarMercado(input_llamadas, 'llamadas', ratios).eur_esperado +
      valorarMercado(input_conversaciones, 'conversaciones', ratios).eur_esperado +
      valorarMercado(input_agendas, 'agendas', ratios).eur_esperado,
    detalle: {
      llamadas: valorarMercado(input_llamadas, 'llamadas', ratios),
      conversaciones: valorarMercado(input_conversaciones, 'conversaciones', ratios),
      agendas: valorarMercado(input_agendas, 'agendas', ratios),
    },
    ratios_usados: ratios,
  };
}

/**
 * Calcula el payout REAL de un reto a partir de los statuses
 * de las agendas que estaban dentro del reto.
 *
 * Ejemplo: reto con 4 agendas, status real = [show, no_show, show+cierre, cancelada]
 *   shows_cerrados = 2
 *   cierres_cerrados = 1
 *   eur_real = 2 × 50€ + 1 × 50€ (extra de cierre sobre el show) = 150€
 *
 * ⚠️ El "extra" del cierre: el modelo de comisiones de
 * objetivos-mensuales.md §2 es escalonado:
 *   agenda=10€ → show=50€ (total) → cierre=100€ (total)
 *   Es decir, al cierre se cobra el total acumulado, no "extra".
 *   Pero para el payout del reto, lo que cuenta es el VALOR
 *   añadido: pasar de show a cierre añade +50€ sobre los 50€
 *   ya contabilizados del show. Esta es la visión correcta
 *   desde la perspectiva del reto.
 */
export function calcularPayoutReal(
  agendas: AgendaStatus[],
  ratios: RatiosSector = RATIOS_DEFAULT
): PayoutReal {
  let shows_cerrados = 0;
  let cierres_cerrados = 0;
  let canceladas = 0;
  let reagendadas = 0;

  for (const a of agendas) {
    if (a.show === 'presentado') shows_cerrados++;
    if (a.show === 'cancelado') canceladas++;
    if (a.show === 'reagendado') reagendadas++;
    if (a.cierre === 'cerrado') cierres_cerrados++;
  }

  const eur_real =
    shows_cerrados * ratios.eur_por_show +
    cierres_cerrados * (ratios.eur_por_cierre - ratios.eur_por_show); // extra de cierre

  return {
    eur_real: round2(eur_real),
    detalle: {
      shows_cerrados,
      cierres_cerrados,
      canceladas,
      reagendadas,
    },
    updated_at: new Date().toISOString(),
    cerrado: agendas.every((a) =>
      a.show !== 'pendiente' && a.cierre !== 'pendiente'
    ),
  };
}

const round1 = (n: number) => Math.round(n * 10) / 10;
const round2 = (n: number) => Math.round(n * 100) / 100;
```

### 2.4 Ejemplo end-to-end del cálculo de payout

**Reto del 14/06 (modo estándar):**
- Llamadas objetivo: 100
- Conversaciones objetivo: 25
- Agendas objetivo: 3
- Ratios default: 35% contesta, 12% conv→agenda, 70% show, 50€/show, 100€/cierre

**Payout potencial al CERRAR el reto (mañana, sin stats aún):**
```
Llamadas:     100 → 35 contesta → 4.2 agendas → 2.94 shows → 0.59 cierres = 206 €
Convers:       25 → 3 agendas   → 2.1 shows  → 0.42 cierres               = 147 €
Agendas:        3 → 3 agendas   → 2.1 shows  → 0.42 cierres               = 147 €
TOTAL POTENCIAL:                                                  ≈ 500 €
```

Pero ojo: los tres mercados se solapan. El sistema en pantalla
muestra **solo el mercado de agendas** (147€) como el payout
principal, porque es el que Xisco dijo que cuenta. El desglose
de los tres se muestra en un panel expandible.

**Cierre del día (20:00, con stats reales: 117/26/4):**
```
Llamadas:     117 → 41 contesta → 4.9 agendas → 3.43 shows → 0.69 cierres = 241 €
Convers:       26 → 3.1 agendas → 2.17 shows → 0.43 cierres               = 152 €
Agendas:        4 → 4 agendas   → 2.8 shows  → 0.56 cierres               = 196 €
TOTAL POTENCIAL RECALCULADO:                                    ≈ 589 €
```

STATUS: ✅ CUMPLIDO (4 ≥ 3 agendas). Racha +1.

**Cierre del ciclo (semanas después, cuando se cierren shows/cierres):**
- Agenda_1: show + cierre → +50€ (show) + 50€ (extra cierre) = 100€
- Agenda_2: show → +50€
- Agenda_3: cancelada → 0€
- Agenda_4: show → +50€

PAYOUT REAL = 200€

> **Comparación:** potencial era 196€ (mercado agendas), real 200€.
> Xisco **+4€ sobre lo esperado**. El sistema registra esto y lo
> muestra en la retrospectiva del mes.

---

## 3. Diseño UX (mockups textuales)

### 3.1 Vista principal: `/growing/betting` (Casa de Apuestas)

```
┌──────────────────────────────────────────────────────────────────────┐
│  GROWING · CASA DE APUESTAS                          [+ Nuevo Reto]   │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  🔥 RACHA: 7 días          💶 POTENCIAL 30D: 3.420 €  🏆 MEJOR: 12 │
│                                                                       │
│  ┌─ RETO DE HOY (14/06) ─────────────────────────────────────────┐  │
│  │                                                                 │  │
│  │  Modo:  [ESTÁNDAR ▾]                                            │  │
│  │                                                                 │  │
│  │  📞 Llamadas        100                                         │  │
│  │  💬 Conversaciones   25                                         │  │
│  │  📅 Agendas           3                                         │  │
│  │  ⭐ Score mínimo  (opcional)  [   70  ]                         │  │
│  │                                                                 │  │
│  │  💶 Payout potencial del día:  ~ 147 €  (mercado de agendas)   │  │
│  │      ▼ Ver desglose de los 3 mercados                           │  │
│  │                                                                 │  │
│  │  📝 Nota previa (opcional):                                     │  │
│  │  ┌─────────────────────────────────────────────────────────┐   │  │
│  │  │ Hoy me siento con energía, voy a por el push.           │   │  │
│  │  └─────────────────────────────────────────────────────────┘   │  │
│  │                                                                 │  │
│  │              [ 🎯 CERRAR RETO · 100/25/3 · ~147 € ]            │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌─ PROGRESO HOY (LIVE) ───────────────────────────────────────────┐  │
│  │  📞 ████████████░░  87/100  (87%)     ← en vivo                │  │
│  │  💬 ███████████░░░  22/25   (88%)     ← en vivo                │  │
│  │  📅 ████░░░░░░░░░░   1/3    (33%)     ← en vivo                │  │
│  │                                                                 │  │
│  │  [📊 Cargar estadísticas finales]   ← solo al cerrar sesión     │  │
│  └─────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

> **Animación "all-in":** el botón "Cerrar reto" tiene un hover con
> glow emerald + un micro-pulse. Al hacer click, los 3 números
> (100/25/3) hacen un tween corto de scale y luego aparece el
> payout potencial con un contador animado de 0 a 147€. Suena
> satisfactorio sin ser infantil. Configurable en settings.

### 3.2 Modal de captura de estadísticas (post-sesión)

```
┌─ CERRAR DÍA · 14/06/2026 ─────────────────────────────────────────┐
│                                                                     │
│  Reto: Estándar · 100 llamadas · 25 conv · 3 agendas               │
│  Payout potencial esperado: ~147 €                                 │
│                                                                     │
│  ┌─ RESULTADOS REALES ────────────────────────────────────────────┐ │
│  │  📞 Llamadas         [  117  ]    ✅ +17 vs objetivo           │ │
│  │  💬 Conversaciones   [   26  ]    ✅ +1  vs objetivo           │ │
│  │  📅 Agendas          [    4  ]    ✅ +1  vs objetivo           │ │
│  │  🔁 Reagendas        [    1  ]                                 │ │
│  │  ❌ Canceladas       [    0  ]                                 │ │
│  │  ⭐ Score promedio   [  74  ]                                  │ │
│  │                                                                 │ │
│  │  📝 Nota del día (opcional):                                   │ │
│  │  ┌─────────────────────────────────────────────────────────┐   │ │
│  │  │ Buenos cierres, fallé en 2 agendas por falta de filtro. │   │ │
│  │  └─────────────────────────────────────────────────────────┘   │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌─ VEREDICTO + PAYOUT POTENCIAL RECALCULADO ────────────────────┐ │
│  │  🏆 RETO CUMPLIDO                                               │ │
│  │  Racha: 7 → 8 días · Récord: a 4 del mejor (12)                │ │
│  │                                                                 │ │
│  │  💶 Payout potencial recalculado:  ~ 196 €                     │ │
│  │      (4 agendas × 70% show × 50€ + ajustes cascada)            │ │
│  │                                                                 │ │
│  │  📅 Payout real se actualizará cuando se cierren los shows     │ │
│  │     (lo verás en el digest diario y en la retrospectiva)       │ │
│  │                                                                 │ │
│  │  🩸 Logro desbloqueado: «Vuelta al ruedo» (volver tras rotura) │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│           [ Cancelar ]                  [ 💾 GUARDAR DÍA ]         │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 Panel expandible: desglose de los 3 mercados

```
┌─ 💶 DESGLOSE ECONÓMICO DEL RETO · 14/06 ────────────────────────┐
│                                                                  │
│  Mercado: LLAMADAS        Input: 117                             │
│  ├── 117 × 35% contesta   = 41 conversaciones                   │
│  ├── 41  × 12% agenda     = 4.9 agendas (esperadas)              │
│  ├── 4.9 × 70% show       = 3.4 shows                            │
│  ├── 0.69 cierres                                          → 241 €│
│                                                                  │
│  Mercado: CONVERSACIONES  Input: 26                              │
│  ├── 26  × 12% agenda     = 3.1 agendas                          │
│  ├── 3.1 × 70% show       = 2.2 shows                            │
│  ├── 0.43 cierres                                          → 152 €│
│                                                                  │
│  Mercado: AGENDAS         Input: 4      ← el principal          │
│  ├── 4   × 70% show       = 2.8 shows                            │
│  ├── 0.56 cierres                                           → 196 €│
│                                                                  │
│  ──────────────────────────────────────────────────────────────  │
│  TOTAL COMBINADO:                                          ≈ 589 €│
│  (se solapan los 3 mercados — el "real" útil es el de agendas)  │
│                                                                  │
│  Ratios usados: 35% contesta · 12% conv→agenda · 70% show        │
│  Editables en Settings → Gamificación                          │
└──────────────────────────────────────────────────────────────────┘
```

### 3.4 Vista mensual: `/growing/betting/calendar`

```
┌─ JUNIO 2026 ───────────────────────────  [< Mayo]  [Hoy]  [Julio >]┐
│                                                                       │
│  LUN   MAR   MIÉ   JUE   VIE   SÁB   DOM                              │
│  ┌────┬────┬────┬────┬────┬────┬────┐                                 │
│  │  1 │  2 │  3 │  4 │  5 │  6 │  7 │   Resumen mes:                 │
│  │ ✅  │ ✅  │ ❌  │ ✅  │ ✅  │ —  │ —  │   Retos: 18                    │
│  │ 147€│ 196€│ —  │ 150€│ 250€│    │    │   Cumplidos: 14 (78%)          │
│  │    │    │    │    │    │    │    │   Potencial mes: 2.940 €         │
│  ├────┼────┼────┼────┼────┼────┼────┤   Real validado: 1.620 € (55%)  │
│  │  8 │  9 │ 10 │ 11 │ 12 │ 13 │ 14 │   Racha actual: 1 día            │
│  │ ✅  │ ✅  │ ✅  │ ❌  │ ✅  │ —  │ 🔥│   Mejor racha: 5 días           │
│  │ 200€│ 300€│ 147€│ —  │ 147€│    │HOY│                                 │
│  ├────┼────┼────┼────┼────┼────┼────┤   🏆 Logros del mes:             │
│  │ 15 │ 16 │ 17 │ 18 │ 19 │ 20 │ 21 │   · Semana perfecta (5/5)        │
│  │ —  │ —  │ —  │ —  │ —  │ —  │ —  │   · Volumen 100 (3 días)         │
│  ├────┼────┼────┼────┼────┼────┼────┤                                 │
│  │ 22 │ 23 │ 24 │ 25 │ 26 │ 27 │ 28 │   📊 Tendencia:                  │
│  │ —  │ —  │ —  │ —  │ —  │ —  │ —  │   ↑  Agendas +12% vs mayo       │
│  ├────┼────┼────┼────┼────┼────┼────┤   ↑  Real vs potencial +8%        │
│  │ 29 │ 30 │    │    │    │    │    │   ↓  Score -3 pts vs mayo         │
│  │ —  │ —  │    │    │    │    │    │                                 │
│  └────┴────┴────┴────┴────┴────┴────┘                                 │
│                                                                       │
│  Leyenda:  ✅ Cumplido  ❌ No cumplido  🔥 Racha  — Sin reto        │
│            Los € debajo de cada día = payout potencial de ese día   │
└───────────────────────────────────────────────────────────────────────┘
```

### 3.5 Retrospectiva del payout real (modal desde día pasado)

Cuando Xisco click en un día del calendario que ya tiene shows/cierres
cerrados, ve:

```
┌─ RETROSPECTIVA · 09/06 (hace 5 días) ───────────────────────────┐
│                                                                  │
│  Reto cumplido ✅ · 3/3 agendas                                  │
│                                                                  │
│  Payout potencial al cerrar:   147 €                             │
│  Payout real (validado hoy):   250 €                             │
│                                ─────────                         │
│  Sobrerendimiento:           +103 € (+70%)                      │
│                                                                  │
│  Detalle de agendas:                                             │
│  · prospect_A   ✅ show + cierre  → 100 € (50 show + 50 extra)   │
│  · prospect_B   ✅ show           →  50 €                         │
│  · prospect_C   ❌ cancelada      →   0 € (reagendar)            │
│  · prospect_D   ✅ show + cierre  → 100 € (50 show + 50 extra)   │
│                                                                  │
│  Patrón detectado: las agendas con cierre cerraron con           │
│  promedio 2 días de anticipación respecto a la fecha pactada.    │
│                                                                  │
│              [ Cerrar ]                                           │
└──────────────────────────────────────────────────────────────────┘
```

### 3.6 Vista de logros: `/growing/betting/trophies`

Grid de 12 tarjetas. Cada logro: emoji grande + nombre + condición + estado
(obtenido / bloqueado con fecha). Al hacer hover en uno bloqueado, muestra
el progreso (ej. "Quincena: 8/15 días").

---

## 4. Flujo del usuario (user journey)

### 4.1 Día típico — flujo completo

```
21:30 NOCHE (opcional) o 08:30 MAÑANA
  │
  ▼
[Xisco abre app → Growing → Casa de Apuestas]
  │
  ├── ¿Hay reto para hoy? NO → Form "Nuevo Reto"
  │                            → Elige modo + objetivos
  │                            → Ve el payout potencial calculado
  │                            → Cierra reto (queda PENDING)
  │                            → Sigue su día normal
  │
  ├── ¿Hay reto para hoy? SÍ → Muestra el reto + progreso live
  │                            → Puede editar objetivos HASTA que
  │                              cierre la primera sesión de audio
  │                            → El progreso live se calcula de los
  │                              audios ya subidos
  │
  ▼
SESIÓN DE LLAMADAS (9-12h o 16-19h)
  │
  ▼
20:00 — DIGEST DEL DÍA (cron)
  │
  ├── [Toast/notification]: "¿Cerrar el día? Tienes stats
  │    listas para validar (o mete los números a mano)."
  │
  ▼
[Xisco pulsa "Cerrar día" o "Cargar estadísticas finales"]
  │
  ▼
[Modal con campos pre-rellenos desde audios procesados]
  (si hubo Call Analyzer, los números se sugieren)
  Xisco confirma o corrige
  │
  ▼
[Sistema evalúa: ¿cumplido?]
  │
  ├── CUMPLIDO → racha++ · muestra payout potencial recalculado
  │              · muestra logro si aplica
  │              · registra el reto del día en el vault
  │
  └── NO CUMPLIDO → racha rota · mensaje constructivo
                     (sigue la regla de gamificacion.md §3.3:
                      "constructivo, no culpabilizador")
                     · registra el reto del día en el vault
  │
  ▼
[Resultado se guarda en vault:
 02-GrowingInmobiliario/betting/2026-06-14.md]
  │
  ▼
[Streak y contadores actualizados en memoria + vault]
```

### 4.2 Flujo del payout real (en diferido)

Este flujo ocurre **días o semanas después**, no el mismo día:

```
DÍA SIGUIENTE / SEMANAS POSTERIORES
  │
  ▼
[Xisco marca en el tracker-agendas.md que prospect_X hizo show]
  │
  ▼
[El módulo Casa de Apuestas detecta que prospect_X
 estaba en el reto del día Y (leído del bet del día)]
  │
  ▼
[Recalcula el payout_real del día Y]
  - shows_cerrados++
  - eur_real += 50€
  │
  ▼
[Si todas las agendas del día están resueltas:
  payout_real.cerrado = true]
  │
  ▼
[Cuando Xisco abra el día Y en el calendario, ve la
 RETROSPECTIVA con el desglose prospecto a prospecto]
```

### 4.3 Captura rápida (alternativa mínima)

Si Xisco no quiere abrir el modal completo, puede usar la
**captura rápida** desde la home de Growing:

```
┌─ CIERRE RÁPIDO ──────────────────────────────────────┐
│  14/06 · Estándar · 100/25/3                         │
│  [📞  100] [💬 25] [📅 3]    [✓ Cerrar]              │
└───────────────────────────────────────────────────────┘
```

Un solo click en cada número para incrementarlo. Pensado para
"modo fin de sesión con prisa".

---

## 5. Integración con el sistema existente

### 5.1 Con el `tracker-agendas.md` (el más importante)

El `tracker-agendas.md` ya existente es **la fuente de verdad
para el payout real**. Cuando Xisco marca una agenda como
`show` o `cierre` en ese tracker, el módulo Casa de Apuestas
lo detecta y recalcula el payout real del día对应的 reto.

**Flujo de integración:**

```
[Xisco abre tracker-agendas.md del mes en curso]
  │
  ▼
[Marca la fila de prospect_X con:
   Confirmada: sí
   Show: sí
   Resultado: cierre]
  │
  ▼
[Módulo Casa de Apuestas lee la tabla
 ¿en qué apuesta estaba prospect_X?
 → busca en betting/YYYY-MM-DD.md los agendas del día]
  │
  ▼
[Actualiza payout_real de ese día:
 - shows_cerrados++ (si show = sí)
 - cierres_cerrados++ (si resultado = cierre)
 - eur_real += 50€ (show) o +50€ extra (cierre)]
  │
  ▼
[Si todas las agendas del día están en estado final:
  payout_real.cerrado = true]
```

> **Decisión clave:** el tracker-agendas.md **no se modifica**.
> Sigue siendo el registro manual de Xisco. El módulo Casa de
> Apuestas lo **lee** y se mantiene sincronizado.

### 5.2 Con `Goal Tracker` (agente existente)

El agente `Goal Tracker` en `AGENTIK-OS.md` §3.7 ya hace:
- KPIs diarios/semanales/mensuales
- Digest 18:00
- Tendencia semanal
- Proyección vs objetivo

**Decisión: NO duplicar.** La Casa de Apuestas es la **capa
gamificada con valor económico** que se apoya en los KPIs que
ya calcula el `Goal Tracker`. La división de responsabilidades:

| Responsabilidad | Quién |
|-----------------|-------|
| Cálculo de KPIs brutos (llamadas, conv, agendas) | `Call Analyzer` (del audio) o input manual |
| Acumulación mensual y proyecciones | `Goal Tracker` (agente) |
| **Reto del día + veredicto + racha** | **Módulo Casa de Apuestas (nuevo)** |
| **Cálculo payout potencial (con ratios del sector)** | **Módulo Casa de Apuestas (nuevo)** |
| **Cálculo payout real (lee tracker-agendas.md)** | **Módulo Casa de Apuestas (nuevo)** |
| **Logros y trofeos** | **Módulo Casa de Apuestas (nuevo)** |
| **Vista calendario mensual gamificada** | **Módulo Casa de Apuestas (nuevo)** |
| Digest 18:00 con FIPAs | `Feedback Coach` (sigue igual) |
| Digest 08:00 con FIPAs | `Feedback Coach` (sigue igual) |
| **Digest 20:00 del módulo apuestas** | **Módulo Casa de Apuestas (nuevo)** |

**Punto de integración concreto:** el `Goal Tracker` consume
`DailyResult` para enriquecer el digest 18:00 (que ya hace
hoy) con:

```
=== DIGEST 18:00 ===
Dia: 117 llamadas | 26 conversaciones | 4 agendas
Apuesta: ✅ CUMPLIDA · ~196€ potencial · racha 8
Proyeccion mes: 78% del objetivo | Alertas: ninguna
```

> El digest 18:00 del Goal Tracker **no cambia de hora**. Lo
> que cambia es que el módulo Casa de Apuestas tiene su **propio
> digest a las 20:00** (cuando Xisco ya cerró sesión).

### 5.3 Con `Call Analyzer` (autollenado)

Cuando Xisco sube el audio de la sesión, el `Call Analyzer`
extrae métricas. Esas métricas **sugieren** los valores en el
modal de captura, pero **Xisco siempre valida**. Esto está
alineado con la regla de AGENTS.md §1 ("el sistema nunca
toma decisiones que no le correspondan") y §5 (todo lo
accionable requiere validación de Xisco).

### 5.4 Con el vault

```
Agentik-OS-Vault/02-GrowingInmobiliario/
├── betting/                          # NUEVO — datos crudos por día
│   ├── 2026-06-14.md                 # bet + stats + payout_potencial + payout_real
│   ├── 2026-06-15.md
│   └── ...
├── _state/                           # NUEVO — estado agregado
│   ├── streak.md                     # racha + eur_reales_30d + mejor marca
│   ├── ratios.md                     # ratios del sector configurados
│   ├── achievements.md               # logros desbloqueados con fecha
│   └── monthly/
│       ├── 2026-06.md                # resumen mensual
│       ├── 2026-07.md
│       └── ...
├── tracker-agendas.md                # YA EXISTE — fuente del payout real
├── tracker-facturacion.md            # YA EXISTE
├── tracker-canceladas.md             # YA EXISTE
├── gamificacion.md                   # YA EXISTE — se mantiene
└── ...
```

Cada `betting/YYYY-MM-DD.md` sigue el patrón frontmatter del
resto del vault:

```markdown
---
id: bet-2026-06-14
fecha: 2026-06-14
modo: estandar
objetivos:
  llamadas: 100
  conversaciones: 25
  agendas: 3
status: won
ratios_usados:
  ratio_contesta: 0.35
  ratio_conv_agenda: 0.12
  show_rate: 0.70
  eur_por_show: 50
  eur_por_cierre: 100
payout_potencial:
  eur_esperado: 196
  detalle:
    agendas:
      input: 4
      pipeline: { agendas_esperadas: 4, shows_esperados: 2.8, cierres_esperados: 0.56 }
      eur_esperado: 196
payout_real: null    # aún no cerrado
racha_antes: 7
racha_despues: 8
logros: []
created_at: 2026-06-13T22:14:00Z
submitted_at: 2026-06-14T20:05:00Z
---

# Reto 14/06/2026

## Pre-sesión
- Modo: Estándar
- Nota: "Hoy me siento con energía, voy a por el push."

## Stats finales
| Métrica | Objetivo | Real | % | OK |
|---------|----------|------|---|----|
| Llamadas | 100 | 117 | 117% | ✅ |
| Conversaciones | 25 | 26 | 104% | ✅ |
| Agendas | 3 | 4 | 133% | ✅ |
| Reagendas | — | 1 | — | — |
| Canceladas | — | 0 | — | — |
| Score | — | 74 | — | — |

## Payout potencial recalculado
- Mercado agendas: 196 €
- (ver desglose completo en app)

## Payout real
- Estado: pendiente (a la espera de shows/cierres)
- Última actualización: —

## Veredicto
✅ CUMPLIDO · racha 7 → 8 · Récord 12 (a 4)
```

### 5.5 Con AGENTS.md (reglas operativas)

El módulo **NO** contacta clientes. Lee y escribe solo en su
propia carpeta del vault. Registra cambios en `log.md`. No
borra nada. Todo lo que afecte al negocio requiere validación
de Xisco. Cumple §1-§8 de AGENTS.md sin excepción.

---

## 6. Endpoints del servidor (Node/Express)

> Sigo el patrón del backend existente. Si no hay backend aún,
> esto va contra el filesystem del vault directamente. Decisión
> a tomar por el implementador según `packages/server`.

```typescript
// packages/server/src/routes/betting.ts

GET    /api/growing/betting/today
       → DailyResult de hoy (con bet si existe, stats si existen, status pending)
       → Incluye payout_potencial calculado con ratios actuales

POST   /api/growing/betting
       body: DailyBet (sin id, sin created_at)
       → crea el reto del día si no existe
       → 409 si ya existe reto para esa fecha

PATCH  /api/growing/betting/:fecha
       body: Partial<DailyBet> (solo editable HASTA primer stats submit)
       → actualiza objetivos antes de cerrar

POST   /api/growing/betting/:fecha/stats
       body: DailyStats (sin id, sin submitted_at)
       → mete las stats, evalúa, calcula resultado, recalcula
         payout_potencial, actualiza streak
       → devuelve DailyResult completo con logros desbloqueados

GET    /api/growing/betting/streak
       → Streak actual (racha, mejor, eur_potencial_30d, eur_reales_30d)

GET    /api/growing/betting/calendar/:mes
       → MonthSummary del mes 'YYYY-MM' (con eur_potencial y eur_real)

GET    /api/growing/betting/result/:fecha
       → DailyResult de un día concreto (histórico)
       → Incluye payout_real si ya está cerrado

POST   /api/growing/betting/:fecha/recompute-real
       → Recalcula el payout_real del día a partir del
         tracker-agendas.md actual
       → Útil cuando Xisco actualiza un show/cierre
       → Devuelve el PayoutReal actualizado

GET    /api/growing/betting/achievements
       → todos los Achievement + cuáles están desbloqueados

GET    /api/growing/betting/ratios
       → RatiosSector actualmente configurados

PUT    /api/growing/betting/ratios
       body: Partial<RatiosSector>
       → actualiza ratios del sector (Xisco puede ajustar)
```

Persistencia: el servidor lee/escribe los `.md` del vault. Cada
operación registra en `log.md` (regla de AGENTS.md §1.7).

---

## 7. Componentes React (frontend)

> Stack ya en uso: Vite + React 19 + Tailwind + Zustand + Recharts.
> Sigo el patrón de `components/growing/` y `stores/sessionStore.ts`.

```
packages/app/src/
├── pages/
│   └── Betting.tsx                      # NUEVO — home del módulo
├── components/
│   └── growing/
│       └── betting/                     # NUEVO
│           ├── BetCard.tsx              # tarjeta "Apuesta de hoy"
│           ├── BetForm.tsx              # form crear/editar apuesta
│           ├── ProgressLive.tsx         # barras de progreso en vivo
│           ├── StatsForm.tsx            # modal de captura de stats
│           ├── QuickClose.tsx           # captura rápida
│           ├── StreakHeader.tsx         # racha + eur_reales_30d + mejor
│           ├── MonthCalendar.tsx        # vista calendario heatmap
│           ├── ResultCard.tsx           # tarjeta de resultado del día
│           ├── AchievementsGrid.tsx     # grid de logros
│           ├── ModeSelector.tsx         # conservador/estándar/push/custom
│           ├── PayoutBreakdown.tsx      # desglose 3 mercados (expandible)
│           └── BetHistoryList.tsx       # lista histórica
├── stores/
│   └── bettingStore.ts                  # NUEVO — Zustand store
└── routes/
    └── index.tsx                        # añadir rutas:
                                          # /growing/betting
                                          # /growing/betting/calendar
                                          # /growing/betting/trophies
```

**Estado (Zustand store):**

```typescript
// stores/bettingStore.ts
interface BettingState {
  today: DailyResult | null;
  streak: Streak | null;
  monthSummary: MonthSummary | null;
  achievements: Achievement[];
  unlockedAchievements: AchievementUnlock[];
  ratios: RatiosSector;
  loading: boolean;
  error: string | null;

  fetchToday: () => Promise<void>;
  createBet: (bet: Omit<DailyBet, 'id' | 'created_at'>) => Promise<void>;
  updateBet: (fecha: string, patch: Partial<DailyBet>) => Promise<void>;
  submitStats: (fecha: string, stats: Omit<DailyStats, 'id' | 'submitted_at'>) => Promise<DailyResult>;
  fetchStreak: () => Promise<void>;
  fetchMonth: (mes: string) => Promise<void>;
  fetchAchievements: () => Promise<void>;
  fetchRatios: () => Promise<void>;
  updateRatios: (patch: Partial<RatiosSector>) => Promise<void>;
  recomputeReal: (fecha: string) => Promise<PayoutReal>;
}
```

**Navegación:** añadir tab en el header de Growing o un sub-router
dentro de `/growing`. Sugerencia visual:

```
Growing
├── Sesiones      (existente)
├── Casa de Apuestas  ← NUEVO (entrada principal del módulo)
│   ├── Hoy
│   ├── Calendario
│   └── Trofeos
└── Prospectos    (existente)
```

---

## 8. Estilos y dirección visual

Xisco quiere **oscuro, elegante, mission control, moderno, con
animaciones, minimalista pero informativo, con datos visuales**.

**Paleta (extender la ya usada en `Growing.tsx`):**

| Token | Color | Uso |
|-------|-------|-----|
| `--bet-won` | `emerald-500` | ✅ reto cumplido, racha |
| `--bet-lost` | `rose-500` | ❌ reto no cumplido, racha rota |
| `--bet-pending` | `sky-500` | ⏳ reto pendiente |
| `--bet-void` | `slate-500` | día sin reto |
| `--payout-potencial` | `emerald-400` | payout potencial calculado |
| `--payout-real` | `sky-400` | payout real validado |
| `--payout-extra` | `fuchsia-400` | sobrerendimiento (real > potencial) |
| `--payout-shortfall` | `amber-400` | shortfall (real < potencial) |

**Componentes visuales clave:**

- **Heatmap calendario:** cada día es un cuadrado, color según
  status (`emerald`/`rose`/`sky`/`slate`). Bajo cada cuadrado,
  payout potencial del día. Click → drawer con retrospectiva.
- **ProgressBar con animación:** `transition-all` de Tailwind.
  Relleno animado al cargar.
- **StreakBadge con llama:** contador + emoji 🔥 que crece
  con la racha (1=🔥, 5=🔥🔥, 7=⚡, 14=💎, 30=👑, 100=🌟).
  Tomado directo de `gamificacion.md` §3.2.
- **Animación "all-in" del botón Cerrar Reto:** hover con glow
  emerald, micro-pulse, al click los 3 números (100/25/3)
  hacen un tween corto de scale y aparece el payout potencial
  con un contador animado de 0 a 147€. Suena satisfactorio sin
  ser infantil.
- **Confetti al cerrar día WON:** `canvas-confetti` library,
  trigger al pulsar "Guardar día" con resultado cumplido.
  Configurable en settings.
- **Counter animado del payout:** los € en pantalla (potencial
  y real) usan un counter que sube de 0 al valor con easing
  cuando aparecen. Sensación de "subiendo el marcador".
- **Skeleton loaders:** mientras carga el mes, placeholders
  con `animate-pulse` de Tailwind.

**Tipografía:** la del sistema. Si no hay definida, usar
`Inter` para texto general y `JetBrains Mono` para los € y
números. Los números grandes en `tabular-nums`.

---

## 9. Configuración y settings

Añadir a `Settings.tsx` (página existente) una nueva sección
"Gamificación — Casa de Apuestas":

### 9.1 Modos y comportamiento

| Setting | Default | Descripción |
|---------|---------|-------------|
| Modo por defecto | `estandar` | Modo pre-seleccionado al crear reto |
| Modo estricto | `off` | Si ON, no definir reto = racha rota |
| Recordatorio 09:00 | `on` | Toast si no hay reto a las 09:00 |
| Digest del módulo | `20:00` | Hora del digest propio (no del Goal Tracker) |

### 9.2 Ratios del sector (lo más importante)

Estos ratios son los que **calculan el payout potencial**. Xisco
los puede ajustar aquí cuando tenga datos reales:

| Setting | Default | Rango esperado | Fuente |
|---------|---------|----------------|--------|
| Ratio contesta | `35%` | 30-40% | `metricas-kpis.md` §6 |
| Ratio conversación → agenda | `12%` | 10-15% | `metricas-kpis.md` §6 |
| Show rate objetivo | `70%` | — | `tracker-agendas.md` §1 |
| € por show | `50` | — | `objetivos-mensuales.md` §2 |
| € por cierre (extra) | `50` (sobre los 50 del show) | — | `objetivos-mensuales.md` §2 |

> La recomendación en `metricas-kpis.md` §10 es recalibrar
> tras 30 días de datos reales. El módulo puede mostrar un
> aviso: "Llevas X días, ¿quieres recalibrar los ratios
> con tus datos reales?"

### 9.3 Visual y animación

| Setting | Default | Descripción |
|---------|---------|-------------|
| Animación "all-in" | `on` | Counter animado + glow al cerrar reto |
| Confetti al ganar | `on` | `canvas-confetti` al cerrar día WON |
| Sonido al apostar | `off` | Sonido tipo casino al crear reto |
| Mostrar payout potencial en reto | `on` | Si OFF, el payout solo se ve al cerrar día |
| Mostrar payout real en calendario | `on` | Los € reales bajo cada día |

---

## 10. Modos de apuesta (referencia rápida)

> Tomado y refinado de `gamificacion.md` §1.1. Lo mantengo porque
> el implementador lo necesita claro.

| Modo | Llamadas | Conv | Agendas | Score mín | Cuándo |
|------|----------|------|---------|-----------|--------|
| **Conservador** | 60 | 15 | 2 | — | día duro, energía baja, viernes |
| **Estándar** | 100 | 25 | 3 | — | default, día normal |
| **Push** | 117+ | 30+ | 5 | 70 | día bueno, "hoy me siento con todo" |
| **Recuperación** | 80 | 20 | 2 | — | tras racha rota, reconstruir |
| **Custom** | X | X | X | opcional | el usuario define |

**Recomendación UX:** el modo "Estándar" debe ser el default
visible y el más fácil de seleccionar (un solo click). Los otros
modos en un dropdown o chips adicionales.

---

## 11. (Eliminado en v1.1)

> En v1.0 había una "tabla de pagos" ligada al stake (1x/2x/3x/5x).
> En v1.1 se elimina porque **no hay stake**. El payout es una
> función pura de los ratios del sector y del objetivo, no de
> un multiplicador apostado por Xisco. Ver §0.1 y §2.3.

---

## 12. Logros (12 en v1, ampliables)

> Mismos IDs que `gamificacion.md` §6 + dos nuevos (apuesta_5x_ganada,
> doble_quincena) para cubrir el aspecto "casa de apuestas".

| ID | Emoji | Nombre | Condición |
|----|-------|--------|-----------|
| `primera_sangre` | 🩸 | Primera sangre | Primer WON |
| `semana_perfecta` | ⚡ | Semana perfecta | 5/5 WON en una semana |
| `quincena` | 💎 | Quincena | 15 días seguidos WON |
| `mes_completo` | 👑 | Mes completo | 30 días seguidos WON |
| `volumen_100` | 📞 | Volumen | 100+ llamadas en un día |
| `conversador_30` | 💬 | Conversador | 30+ conversaciones en un día |
| `cerrador_5` | 🤝 | Cerrador | 5+ agendas en un día |
| `record_personal` | 🌟 | Récord personal | Superar mejor racha previa |
| `vuelta_ruedo` | 🔄 | Vuelta al ruedo | WON tras racha rota |
| `maraton_4h` | 🏃 | Maratón | Sesión de 4h+ sin parar |
| `apuesta_5x_ganada` | 🎲 | All-in winner | *(legacy v1.0, ya no se obtiene; dejar ID para no romper achievements.json)* |
| `doble_quincena` | 💎💎 | Doble quincena | 30 días seguidos WON |

**Storage:** `_state/achievements.md` con el formato:

```markdown
# Logros desbloqueados

- id: primera_sangre
  fecha: 2026-06-02
  bet_id: bet-2026-06-02
- id: volumen_100
  fecha: 2026-06-05
  bet_id: bet-2026-06-05
- id: vuelta_ruedo
  fecha: 2026-06-14
  bet_id: bet-2026-06-14
```

---

## 13. Edge cases y reglas de validación

### 13.1 Reto creado pero stats no metidas

- Status = `pending`.
- A las 23:59 del día siguiente sin stats → status = `void`
  (no cuenta para racha, ni a favor ni en contra).
- Toast recordatorio a las 21:00 si no hay stats.

### 13.2 Edición de reto tras iniciar

- Xisco puede editar objetivos HASTA que se suba el primer
  audio del día (Call Analyzer detecta y bloquea edición).
- Si ya hay stats, el reto NO se puede editar (solo archivar
  y crear nueva del día siguiente).

### 13.3 Múltiples sesiones en un día

- Xisco a veces hace 2-3 sesiones (mañana + tarde).
- Las stats del día **se suman** de todas las sesiones.
- El form de stats tiene un campo "nº de sesiones" para
  contexto, pero el cálculo es la suma.

### 13.4 Día festivo / descanso

- Xisco marca el día como `void` voluntariamente desde settings
  o desde el propio día en el calendario.
- `void` no afecta a la racha.
- El sistema **nunca** marca un día como `void` automáticamente.

### 13.5 Cambio de mes a mitad de día

- No debería pasar (un día = una fecha), pero si Xisco crea
  reto a las 23:50 del 30/06 y mete stats el 01/07, el
  sistema asigna todo al 30/06 (fecha del reto).

### 13.6 Reto custom con valores absurdos

- Validación: llamadas 1-500, conversaciones 0-200, agendas 0-50.
- Si Xisco quiere retos más allá, escribe una nota en
  `notas_pre` pero los inputs validan.

### 13.7 Payout real cuando una agenda se reagenda

- Una agenda reagendada cuenta como `reagendada` en el
  payout_real.detalle pero **no se contabiliza** en shows
  ni en cierres hasta que se resuelva.
- Si la reagendada termina haciendo show → cuenta como show
  (se suma al payout real del día **original** del reto, no
  del día del show).
- Esto preserva la trazabilidad: el reto del 14/06 tiene 4
  agendas, una se reagendó, el payout real final se cierra
  cuando todas se resuelvan (sean del día que sean).

### 13.8 Modo estricto activado y no se define reto

- Si Xisco tenía racha de 7 y un día no define reto:
  - Racha rota automáticamente a 0.
  - Aparece mensaje: "Modo estricto activo: hoy no definiste
    reto, racha rota en día 7. Mañana vuelve a apostar."
  - El `mejor racha` (12) se mantiene.

### 13.9 Recalibración de ratios del sector

- El sistema trackea la diferencia entre payout_potencial
  (calculado con ratios) y payout_real (validado con
  tracker-agendas).
- Cuando hay 30 días de datos, sugiere: "Tus datos reales
  muestran un show_rate del 62% (no 70%). ¿Quieres ajustar
  el ratio?"
- Xisco acepta o no. Si acepta, los ratios se actualizan y
  se aplica retroactivamente a todos los payout_potencial
  pendientes (no a los ya cerrados).

---

## 14. Roadmap de implementación (vertical slices)

> Cada slice es **independiente y entregable**. Si Xisco tiene
> prisa, se puede parar en cualquier slice y tener un módulo
> funcional. Sigo el principio de `brief-to-tasks`.

### Slice 1 — Tipos y lógica pura (sin UI)
**Esfuerzo:** XS
- Crear `packages/shared/src/types/betting.ts`
- Crear `packages/shared/src/lib/betting.ts` con `evaluarCumplimiento`,
  `calcularStatus`, `calcularPayout`
- Tests unitarios de la lógica
- **Entregable:** lógica testeable, sin UI ni storage

### Slice 2 — Storage en vault
**Esfuerzo:** S
- Helper para escribir/leer `betting/YYYY-MM-DD.md` con frontmatter
- Helper para mantener `_state/streak.md` y `_state/achievements.md`
- Helper para calcular `MonthSummary` a partir de los días
- **Entregable:** funciones puras de I/O sobre vault

### Slice 3 — Endpoints del servidor
**Esfuerzo:** S
- Implementar los 7 endpoints de §6
- Logging en `log.md` por cada operación (regla AGENTS.md §1.7)
- **Entregable:** API REST funcional

### Slice 4 — Store Zustand + página Betting (solo "Hoy")
**Esfuerzo:** M
- `stores/bettingStore.ts`
- `pages/Betting.tsx` con `BetCard` + `BetForm` + `StreakHeader`
- Ruta `/growing/betting`
- **Entregable:** Xisco puede crear apuesta y ver streak

### Slice 5 — Captura de estadísticas + resultado
**Esfuerzo:** M
- `StatsForm.tsx` modal
- `ResultCard.tsx` con veredicto
- `QuickClose.tsx` para captura rápida
- Integración con `Call Analyzer` para autollenado (sugerir, no imponer)
- **Entregable:** ciclo completo apuesta → stats → resultado

### Slice 6 — Vista calendario mensual
**Esfuerzo:** M
- `MonthCalendar.tsx` con heatmap
- Navegación entre meses
- Drawer de detalle al click en día
- `MonthSummary` en sidebar
- **Entregable:** vista `/growing/betting/calendar`

### Slice 7 — Logros y trofeos
**Esfuerzo:** S
- `AchievementsGrid.tsx` con 12 logros
- Lógica de detección en `submitStats`
- Animación de desbloqueo (toast + confeti opcional)
- **Entregable:** `/growing/betting/trophies`

### Slice 8 — Settings + modo estricto
**Esfuerzo:** XS
- Sección en `Settings.tsx`
- Toast recordatorio 09:00 (cron del front o al abrir app)
- Modo estricto con su regla
- **Entregable:** configuración completa

### Slice 9 — Pulido visual
**Esfuerzo:** S
- Animaciones, hover states, transiciones
- Confetti con `canvas-confetti`
- Skeleton loaders
- Empty states
- **Entregable:** "mission control feel"

### Slice 10 — Integración con digest 18:00
**Esfuerzo:** XS
- El `Goal Tracker` lee `DailyResult` del día y lo añade al digest
- Pequeño bloque extra en el digest
- **Entregable:** digest 18:00 enriquecido

### Orden de ejecución recomendado

1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10

Pero **4 y 5 son el MVP mínimo viable**. Si Xisco quiere ver
"algo funcionando" rápido, se puede parar ahí.

---

## 15. Riesgos y decisiones pendientes

### 15.1 Riesgos identificados

| Riesgo | Mitigación |
|--------|------------|
| La app actual no tiene backend listo | Slice 2-3 contra filesystem del vault funciona |
| Xisco abandona el módulo por fricción | Quick Close (captura en 4 clicks) + autollenado desde Call Analyzer |
| Racha rota desmoraliza | Mensaje constructivo de `gamificacion.md` §3.3, ya diseñado |
| Payout potencial y real divergen mucho | Recalibración guiada tras 30 días (§13.9) |
| El payout real llega semanas después → se "olvida" | Retrospectiva en el calendario + digest diario con la actualización |
| El módulo compite con `Goal Tracker` | Integración explícita en §5.2, no duplicación |

### 15.2 Decisiones que necesitan input de Xisco (restantes)

1. **¿Modo estricto por defecto?**
   El plan lo deja OFF por defecto. Xisco puede activarlo si
   quiere más compromiso.

2. **¿Confetti?**
   A algunos les encanta, a otros les molesta. Por eso está
   detrás de un toggle en settings.

3. **¿Mostrar al Goal Tracker los datos de apuestas?**
   El plan actual dice SÍ. Pero si Xisco prefiere mantenerlos
   separados, el digest 18:00 sigue funcionando sin el bloque
   de apuestas.

---

## 16. Definition of Done (MVP)

El módulo está listo para usar cuando:

- [ ] Xisco puede crear un reto desde la app en <30 segundos
- [ ] Xisco puede meter estadísticas con Quick Close en <20 segundos
- [ ] El payout potencial se calcula y muestra en la pantalla
       del reto con los ratios del sector
- [ ] El veredicto (WON/LOST) se calcula correctamente
- [ ] La racha se actualiza y persiste
- [ ] El calendario mensual muestra todos los días del mes
       con su payout potencial bajo cada día
- [ ] Los logros se desbloquean automáticamente
- [ ] El modo estricto funciona
- [ ] El digest 20:00 funciona y muestra el reto del día
- [ ] El payout real se actualiza cuando Xisco marca shows
       en el `tracker-agendas.md`
- [ ] La retrospectiva muestra el desglose prospecto a prospecto
       con sobrerendimiento / shortfall
- [ ] No hay regresiones en `Growing.tsx` (sesiones, audios, etc.)
- [ ] No hay regresiones en el `Goal Tracker` (digest 18:00 sigue bien)
- [ ] `npm run typecheck` pasa sin errores
- [ ] `npm run build` pasa sin warnings
- [ ] Los datos en vault siguen el patrón frontmatter del proyecto
- [ ] Cada operación queda registrada en `log.md` del vault

---

## 17. Recursos y referencias

### 17.1 Archivos del vault relevantes

- `gamificacion.md` — base de diseño original (modos, rachas, logros)
- `objetivos-mensuales.md` — KPIs y objetivos base
- `metricas-kpis.md` — definiciones de llamadas/conversaciones/agendas
- `AGENTS.md` — reglas operativas inquebrantables
- `00-Sistema/orquestacion.md` — capa de orquestación

### 17.2 Archivos de la app relevantes

- `packages/app/src/pages/Growing.tsx` — página actual
- `packages/app/src/stores/sessionStore.ts` — patrón de store
- `packages/app/src/components/growing/` — patrón de componentes
- `packages/app/src/types/index.ts` — tipos compartidos
- `packages/shared/src/` — lógica pura compartida

### 17.3 Librerías sugeridas (verificar disponibilidad)

- `framer-motion` — animaciones (alternativa: solo Tailwind)
- `canvas-confetti` — confeti al ganar (alternativa: CSS animation)
- `date-fns` — ya está en `package.json`, usar para formateo
- `clsx` + `tailwind-merge` — ya están, para `cn()`

---

## 18. Próximos pasos para Xisco

1. **Revisar este plan v1.1** y dar feedback sobre las 3
   decisiones restantes de §15.2.
2. **Validar que el MVP (slices 1-5 + ratios editables) es
   lo que quiere** o pedir ajustes.
3. **Asignar la implementación** a los agentes de programación
   (este plan está listo para que lo cojan).
4. **Probar el MVP** durante 1-2 semanas antes de seguir con
   slices 6-10.
5. **Recalibrar los ratios del sector** con datos reales
   cuando tenga 30 días de uso (§13.9).

---

_Plan v1.1 — Módulo Casa de Apuestas para Growing Inmobiliario.
Listo para implementación. Cualquier cambio se registra en el
`log.md` del vault._
