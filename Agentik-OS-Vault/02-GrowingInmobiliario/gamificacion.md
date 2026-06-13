# Gamificación — Growing Inmobiliario

> Sistema de objetivos diarios tipo "apuesta" + rachas + ranking
> personal. Aplicado al negocio de cold calling de Xisco.

> **Nota:** esta pieza es **opcional y motivacional**. No afecta a
> los KPIs reales del negocio. Su objetivo es mantener la
> consistencia de Xisco en sesiones largas (3h/día, 5 días/semana).

---

## 1. Concepto: "La apuesta"

Cada día, Xisco define **un objetivo diario** antes de empezar la
sesión. La "apuesta" es consigo mismo: si lo cumple, suma a su racha;
si no, la racha se rompe.

### 1.1 Objetivos diarios (basados en la operativa real de Xisco)

| Modo | Llamadas | Conversaciones | Agendas | Score mín |
|------|----------|----------------|---------|-----------|
| **Estándar** | 100 | 25 | 3 | — |
| **Push** | 117+ | 30+ | 5 | 70 |
| **Recuperación** | 60 | 15 | 2 | — |

> **El modo estándar es el default.** Xisco lo cambia cada mañana
> según su energía y agenda.

### 1.2 Definiciones del día

| Concepto | Definición |
|----------|------------|
| **Llamada** | Contacto telefónico realizado |
| **Conversación** | Llamada que dura más de 1 minuto |
| **Agenda** | Prospecto acepta reunión con el closer |

**Ratio objetivo:**
- Conversaciones / Llamadas: ≥ 25%
- Agendas / Llamadas: ≥ 3%
- Agendas / Conversaciones: ≥ 12%

---

## 2. Cálculo del progreso

Al final de la sesión (cuando Xisco cierra la app o marca "fin de
sesión"), la app compara:

```
llamadas_realizadas >= objetivo.llamadas  ✓ / ✗
conversaciones_realizadas >= objetivo.conversaciones  ✓ / ✗
citas_realizadas >= objetivo.citas  ✓ / ✗ (si aplica)
score_promedio >= objetivo.score  ✓ / ✗ (si aplica)
```

Si **todos** los sub-objetivos se cumplen → objetivo cumplido.
Si **alguno** no se cumple → objetivo no cumplido.

> **Regla importante:** "cumplido parcial" cuenta como NO cumplido.
> La idea es mantener la vara alta, no recompensar casi-lo-gracias.

---

## 3. Rachas

### 3.1 Definición

- **Racha actual:** número de días consecutivos con objetivo cumplido.
- **Mejor racha histórica:** la más larga que Xisco haya conseguido.
- **Racha rota:** la app marca el día que no se cumplió.

### 3.2 Badges visuales

| Días | Emoji | Nivel |
|------|-------|-------|
| 1 | ✓ | Inicio |
| 3 | 🔥 | En llamas |
| 5 | 🔥🔥 | On fire |
| 7 | ⚡ | Semana perfecta |
| 14 | 💎 | Quincena sólida |
| 30 | 👑 | Mes completo |
| 60 | 🏆 | Doble mes |
| 100 | 🌟 | Leyenda |

### 3.3 Penalización de racha rota

Cuando la racha se rompe:
- El contador vuelve a 0.
- La mejor marca histórica se mantiene.
- La app muestra un mensaje **constructivo, no culpabilizador**:

> "Racha rota en el día 12. Mañana empiezas de nuevo. Lo que hiciste
> en 12 días no se borra — sigue siendo tu mejor marca. A por el 13."

---

## 4. Reporte del día (post-sesión)

Al cerrar la sesión, la app muestra:

```
=== GAMIFICACIÓN — {fecha} ===

🎯 OBJETIVO DE HOY
80 llamadas | 24 conversaciones | 3 citas

📊 RESULTADO
Llamadas: 78/80 (97.5%)     ⚠️  por debajo
Conversaciones: 26/24 (108%) ✅
Citas: 4/3 (133%)           ✅

🏆 STATUS: OBJETIVO CUMPLIDO
- Conversaciones y citas superadas
- Faltaron 2 llamadas para el target

🔥 RACHA: 5 días
Mejor marca: 12 días (mes pasado)

💡 INSIGHT DEL DÍA
"Llevas 3 días con ratio de llamadas 97-99%. Subir el target
a 82 llamadas te haría respirar mejor y mantener la racha."
```

Si el objetivo NO se cumplió:

```
=== GAMIFICACIÓN — {fecha} ===

🎯 OBJETIVO DE HOY
100 llamadas | 24 conversaciones

📊 RESULTADO
Llamadas: 78/100 (78%)
Conversaciones: 19/24 (79%)

⚠️ STATUS: OBJETIVO NO CUMPLIDO

🔥 RACHA: rota en 5 días
Mejor marca: 12 días (se mantiene)

💡 ¿Qué pasó?
- 22 llamadas por debajo del target
- 5 conversaciones por debajo
- Posible causa: sesión más corta de lo habitual

📌 RECOMENDACIÓN
"Mañana vuelve al modo estándar (80/24) para recuperar
la racha con un target alcanzable. Si los 100 son demasiado
para tu cadencia actual, no pasa nada: el objetivo es
constancia, no heroicidades."
```

---

## 5. Insights semanales (gamificación)

Cada domingo, la app genera un mini-reporte:

```
=== TENDENCIA SEMANAL ===

Lun  Mar  Mié  Jue  Vie  Sáb  Dom
✓    ✓    ✓    ✗    ✓    —    —
                    ↑ racha rota

Insights:
• 4 de 5 días con objetivo cumplido (80%)
• Día más débil: jueves (cuelga antes de las 12h)
• Récord personal de llamadas en un día: 102 (martes)

Recomendación para próxima semana:
• Aceptar que jueves es el día más flojo
• Planificar objetivo conservador los jueves
```

---

## 6. Logros desbloqueables (achievements)

Logros que la app otorga al alcanzarse ciertos hitos:

| Logro | Condición | Emoji |
|-------|-----------|-------|
| **Primera sangre** | Primer objetivo cumplido | 🩸 |
| **Semana perfecta** | 5/5 días cumplidos | ⚡ |
| **Quincena** | 15 días seguidos | 💎 |
| **Mes completo** | 30 días | 👑 |
| **Volumen** | 100+ llamadas en un día | 📞 |
| **Conversador** | 30+ conversaciones en un día | 💬 |
| **Cerrador** | 5+ citas en un día | 🤝 |
| **Récord personal** | Superar mejor racha previa | 🌟 |
| **Vuelta al ruedo** | Volver a cumplir tras racha rota | 🔄 |
| **Maratón** | Sesión de 4h+ sin parar | 🏃 |

> Los logros se muestran en una página de "Trofeos" en la app.

---

## 7. Configuración por Xisco

Xisco puede ajustar las reglas en `Settings`:

- **Modo por defecto:** estándar (80/24).
- **Objetivos semanales sugeridos:** la app puede sugerir
  automáticamente según histórico.
- **Recordatorio de objetivo:** toast a las 09:00 si aún no se ha
  definido.
- **Modo estricto:** si Xisco lo activa, la racha se rompe también
  si no define objetivo a tiempo.

---

## 8. Lo que la gamificación NO hace

- ❌ No compara con otros SDRs (es un sistema personal, no competitivo).
- ❌ No asigna recompensas externas (no hay premios reales).
- ❌ No afecta al KPI real del negocio (la facturación manda).
- ❌ No presiona: si Xisco necesita un día de descanso, lo toma y la
  racha se resetea sin drama.

---

## 9. Implementación en la app

### 9.1 Componentes

```
components/gamification/
├── GoalSetter.tsx          # Form para definir objetivo del día
├── ProgressBar.tsx          # Barra con llamadas/conversaciones
├── StreakBadge.tsx          # Racha con emoji
├── AchievementsGrid.tsx     # Grid de logros
├── DailyReportCard.tsx      # Reporte del día
└── WeeklyTrendChart.tsx     # Tendencia de la semana
```

### 9.2 Datos

```typescript
// types/goal.ts
type ModoObjetivo = 'conservador' | 'estandar' | 'push' | 'demo' | 'recuperacion' | 'custom';

interface ObjetivoDiario {
  fecha: string;            // YYYY-MM-DD
  modo: ModoObjetivo;
  llamadas_objetivo: number;
  conversaciones_objetivo: number;
  citas_objetivo?: number;
  score_minimo?: number;
  cumplido: boolean;
  llamadas_realizadas: number;
  conversaciones_realizadas: number;
  citas_realizadas: number;
  score_promedio?: number;
  racha_despues: number;
}

interface Racha {
  actual: number;
  mejor: number;
  fecha_inicio_actual: string | null;
  fecha_mejor: string | null;
}
```

---

## 10. Anti-patrones a evitar

- ❌ Comparar con estándares del sector que no aplican a Xisco.
- ❌ Mensajes culpabilizadores cuando se rompe la racha.
- ❌ Subir el target cuando va bien (debe subirlo Xisco
  conscientemente, no la app).
- ❌ Gamificar el resultado (citas, cierres) en lugar del esfuerzo
  (llamadas, conversaciones). El resultado ya tiene su propio KPI.
- ❌ Castigar descansos. Un día de descanso es legítimo.

---

_Versión 1.0 — Gamificación. Pensado para mantener la consistencia
de Xisco en sesiones largas, no para añadir presión innecesaria._
