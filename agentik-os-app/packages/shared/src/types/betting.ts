/**
 * Tipos del módulo "Casa de Apuestas" — Growing Inmobiliario.
 *
 * No hay stake ni banca virtual. El "payout" es una proyección
 * económica de lo que valdría el objetivo cumplido, usando los
 * ratios reales del sector inmobiliario.
 *
 * v1.1 — ver plan: Agentik-OS-Vault/02-GrowingInmobiliario/_plans/modulo-casa-apuestas.md
 */

export type BetMode = 'conservador' | 'estandar' | 'push' | 'recuperacion' | 'custom';
export type BetStatus = 'pending' | 'in_progress' | 'won' | 'lost' | 'void';

/** Ratios del sector inmobiliario (configurables en Settings). */
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

export const RATIOS_DEFAULT: RatiosSector = Object.freeze({
  ratio_contesta: 0.35,
  ratio_conv_agenda: 0.12,
  show_rate: 0.70,
  eur_por_show: 50,
  eur_por_cierre: 100,
});

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

/** Estado de una agenda individual (espejo del tracker-agendas.md) */
export interface AgendaStatus {
  agenda_id: string;             // prospecto
  fecha_agendada: string;        // YYYY-MM-DD (de la apuesta)
  show: 'pendiente' | 'presentado' | 'no_presentado' | 'cancelado' | 'reagendado';
  cierre: 'pendiente' | 'cerrado' | 'nurturing' | 'perdido';
  updated_at: string;
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
    score?: { objetivo: number; real: number; pct: number; ok: boolean };
  };
  payout_potencial: PayoutPotencial | null;  // null si no hay bet
  payout_real: PayoutReal | null;            // null hasta que se cierra el ciclo
  racha_antes: number;
  racha_despues: number;
  mejor_racha_historica: number;
  logros_desbloqueados: AchievementUnlock[];
}

/** Racha persistente */
export interface BetStreak {
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

/** ID de logros */
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
  | 'apuesta_5x_ganada'
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

/** Celda de un día en la vista calendario */
export interface DayCell {
  fecha: string;
  status: BetStatus | 'no_bet';  // no_bet = día sin reto definido
  pct_cumplimiento: number | null;
  eur_potencial: number;          // 0 si no cumplido o sin reto
  eur_real: number;               // 0 si no cerrado aún
  modo: BetMode | null;
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

/** Settings del módulo Casa de Apuestas (persiste en localStorage) */
export interface BettingSettings {
  modo_default: BetMode;
  modo_estricto: boolean;
  recordatorio_09: boolean;
  digest_hora: string;           // '20:00'
  animacion_allin: boolean;
  confetti: boolean;
  sonido: boolean;
  mostrar_payout_en_reto: boolean;
  mostrar_payout_real_calendario: boolean;
  ratios: RatiosSector;
}

export const BETTING_SETTINGS_DEFAULT: BettingSettings = Object.freeze({
  modo_default: 'estandar',
  modo_estricto: false,
  recordatorio_09: true,
  digest_hora: '20:00',
  animacion_allin: true,
  confetti: true,
  sonido: false,
  mostrar_payout_en_reto: true,
  mostrar_payout_real_calendario: true,
  ratios: { ...RATIOS_DEFAULT },
});

/** Definición de todos los logros disponibles */
export const ACHIEVEMENTS: readonly Achievement[] = Object.freeze([
  { id: 'primera_sangre', nombre: 'Primera sangre', descripcion: 'Primer reto cumplido', emoji: '🩸', condicion: 'Primer WON' },
  { id: 'semana_perfecta', nombre: 'Semana perfecta', descripcion: '5 días seguidos cumplidos', emoji: '⚡', condicion: '5/5 WON en una semana' },
  { id: 'quincena', nombre: 'Quincena', descripcion: '15 días seguidos cumplidos', emoji: '💎', condicion: '15 días seguidos WON' },
  { id: 'mes_completo', nombre: 'Mes completo', descripcion: '30 días seguidos cumplidos', emoji: '👑', condicion: '30 días seguidos WON' },
  { id: 'volumen_100', nombre: 'Volumen', descripcion: '100+ llamadas en un día', emoji: '📞', condicion: '100+ llamadas en un día' },
  { id: 'conversador_30', nombre: 'Conversador', descripcion: '30+ conversaciones en un día', emoji: '💬', condicion: '30+ conversaciones en un día' },
  { id: 'cerrador_5', nombre: 'Cerrador', descripcion: '5+ agendas en un día', emoji: '🤝', condicion: '5+ agendas en un día' },
  { id: 'record_personal', nombre: 'Récord personal', descripcion: 'Superar la mejor racha previa', emoji: '🌟', condicion: 'Superar mejor racha previa' },
  { id: 'vuelta_ruedo', nombre: 'Vuelta al ruedo', descripcion: 'WON tras racha rota', emoji: '🔄', condicion: 'WON tras racha rota' },
  { id: 'maraton_4h', nombre: 'Maratón', descripcion: 'Sesión de 4h+ sin parar', emoji: '🏃', condicion: 'Sesión de 4h+ continua' },
  { id: 'apuesta_5x_ganada', nombre: 'All-in winner', descripcion: 'Legacy v1.0', emoji: '🎲', condicion: 'Legacy — ya no se obtiene' },
  { id: 'doble_quincena', nombre: 'Doble quincena', descripcion: '30 días WON (alias mes_completo)', emoji: '💎💎', condicion: '30 días seguidos WON' },
]);

/** Modos de apuesta con sus objetivos por defecto */
export const MODOS_OBJETIVOS: Record<Exclude<BetMode, 'custom'>, DailyBet['objetivos']> = Object.freeze({
  conservador: { llamadas: 60, conversaciones: 15, agendas: 2 },
  estandar: { llamadas: 100, conversaciones: 25, agendas: 3 },
  push: { llamadas: 117, conversaciones: 30, agendas: 5, score_minimo: 70 },
  recuperacion: { llamadas: 80, conversaciones: 20, agendas: 2 },
});
