# Pipeline CRM — Iron Monkey Charter

> **El sistema es un CRM centralizado.** Esta pieza es la columna
> vertebral de Iron Monkey. Aquí se concentran: leads, estados,
> alertas, follow-ups. Todo lo demás orbita alrededor.

> **REGLA DE ORO:** el sistema **nunca** contacta al cliente. Solo
> recuerda, avisa, estructura y propone. Xisco hace todas las
> llamadas, emails y WhatsApps.

---

## 1. El pipeline — vista de columnas

```
┌──────────┬──────────────┬──────────────┬─────────────────┬────────────────────┬──────────────┬─────────┐
│  NUEVO   │ CONTACTADO   │ CUALIFICADO  │ PROPUESTA       │ PROPUESTA          │ EN           │ GANADO  │
│          │              │              │ BORRADOR        │ ENVIADA            │ NEGOCIACIÓN  │         │
├──────────┼──────────────┼──────────────┼─────────────────┼────────────────────┼──────────────┼─────────┤
│ Lead     │ Llamada      │ Score ≥ 7    │ PDF generado    │ Xisco confirma     │ Cliente      │ Señal   │
│ entra    │ hecha,       │ Notas        │ Pendiente       │ que lo ha          │ responde,    │ o       │
│ (Xisco   │ notas        │ completas    │ revisión de     │ enviado al         │ contraprop.  │ cierre  │
│ rellena  │ metidas      │              │ Xisco           │ cliente            │              │ total   │
│ ficha)   │              │              │                 │                    │              │         │
└──────────┴──────────────┴──────────────┴─────────────────┴────────────────────┴──────────────┴─────────┘
                                                                                       │
                                                                       ┌───────────────┼──────────────┐
                                                                       ▼               ▼              ▼
                                                                    PERDIDO       SILENCIO      DESCARTADO
                                                                  (motivo)      (alerta 48h)   (sin interés)
```

---

## 2. Estados y sus definiciones

| Estado | Significado | Quién lo pone | Cómo se sale |
|--------|-------------|---------------|--------------|
| `nuevo` | Lead acaba de entrar, aún sin contactar | Xisco al crear la ficha | Xisco marca tras llamar |
| `contactado` | Llamada hecha, notas metidas | Xisco al guardar notas | ICP aplica score |
| `cualificado` | Score ≥ 7, listo para oferta | Sistema (tras ICP) | Xisco pide propuesta |
| `tibio` | Score 4-6, necesita seguimiento | Sistema | Xisco decide seguir o descartar |
| `descartado` | Score < 4 o sensación fría | Sistema o Xisco | Final |
| `propuesta_borrador` | PDF generado, pendiente revisión | Sistema (Proposal Generator) | Xisco valida y envía |
| `propuesta_enviada` | Xisco confirmó que envió el PDF | Xisco | Cliente responde |
| `en_negociacion` | Cliente respondió, hablando de condiciones | Xisco | Cierre o pérdida |
| `ganado` | Reserva confirmada, señal pagada | Xisco | Final |
| `perdido` | Cliente descartó o eligió competencia | Xisco | Final |
| `silencio` | Sin respuesta > 48h | Sistema (alerta) | Xisco reactiva o descarta |

---

## 3. Reglas de alerta automática

El CRM Manager vigila **cada cambio de estado** y **diariamente a las
08:00** para generar alertas:

| Condición | Alerta |
|-----------|--------|
| Estado `nuevo` o `contactado` sin actividad > 48h | 🔴 **Llamar pendiente** — Lead lleva 2 días sin gestión |
| Estado `cualificado` o `tibio` sin movimiento > 7 días | 🟠 **Estancado** — Decidir: follow-up o descartar |
| Estado `propuesta_enviada` sin respuesta > 48h | 🟡 **Seguimiento** — Mandar WhatsApp/email amable |
| Estado `en_negociacion` sin movimiento > 5 días | 🟠 **Negociación fría** — Xisco decide si insistir |
| Estado `silencio` reactivado (cliente responde) | ✅ **Reactivado** — Volver a `en_negociacion` |
| Cierre `ganado` | 🎉 **Post-venta** — Iniciar流程 de confirmación |

---

## 4. Digest diario (08:00) — lo que Xisco ve

```
=== IRON MONKEY — DAILY DIGEST ===
Fecha: {YYYY-MM-DD}

🔴 CONTACTAR HOY ({X})
- {lead} ({motivo, ej: nuevo hace 3 días})
- {lead} ({motivo})

🟠 CREAR OFERTA ({X})
- {lead} (score 8, nota del {fecha}, sin propuesta)

🟡 HACER FOLLOW-UP ({X})
- {lead} (propuesta enviada hace 4 días, sin respuesta)

⛔ RECONTACTAR ({X})
- {lead} (no contesta hace 5 días)

PIPELINE (resumen):
- Nuevos: {X}
- Contactados: {X}
- Cualificados: {X}
- Propuestas borrador: {X}
- Propuestas enviadas: {X}
- En negociación: {X}

TENDENCIA SEMANA:
- Leads nuevos: +X vs semana pasada
- Propuestas enviadas: +X
- Cierres: +X
```

---

## 5. Comandos que Xisco puede usar

| Comando | Qué hace |
|---------|----------|
| `/pipeline` | Muestra el estado actual de todos los leads |
| `/pipeline estado=ganado` | Filtra por estado |
| `/alertas` | Lista las alertas activas |
| `/alertas sin_movimiento` | Solo leads sin actividad |
| `/lead {nombre}` | Muestra la ficha completa de un lead |
| `/lead {nombre} estado=en_negociacion` | Cambia el estado de un lead |
| `/lead {nombre} nota "texto"` | Añade una nota a un lead |
| `/propuesta {nombre}` | Genera propuesta PDF para ese lead |
| `/digest` | Genera el digest diario bajo demanda |
| `/semana` | Resumen de la semana actual vs anterior |

---

## 6. Vistas filtradas (las que más usa Xisco)

### 6.1 "Lo que tengo que hacer hoy" (digest 08:00)

Esta es la vista principal que ve Xisco cada mañana. La app genera
4 listas priorizadas:

```
🔴 CONTACTAR HOY
- Lead nuevo sin primer contacto > 48h
- Lead tibio con follow-up vencido

🟠 CREAR OFERTA
- Leads con score >= 7 y nota reciente
- Propuestas en borrador pendientes de revisar

🟡 HACER FOLLOW-UP
- Propuestas enviadas sin respuesta > 48h
- Negociación parada > 5 días

⛔ RECONTACTAR
- Clientes que no contestan hace > 3 días
- Stale leads (> 7 días sin movimiento)
```

### 6.2 "Lo que está caliente"

```
Estados: cualificado + en_negociacion
Ordenado por score descendente + fecha nota ascendente
```

### 6.3 "Lo que se está escapando"

```
Todos los leads con > 7 días sin movimiento
Ordenado por valor potencial estimado
```

### 6.4 "Cierres del mes"

```
Estado: ganado en el mes en curso
+ suma total facturada / pendiente
```

---

## 7. Métricas del pipeline

El CRM Manager reporta semanalmente:

| Métrica | Cómo se calcula |
|---------|-----------------|
| **Leads nuevos/semana** | Conteo de `nuevo` en los últimos 7 días |
| **Tasa de contacto** | (Leads contactados / Leads nuevos) × 100 |
| **Tasa de cualificación** | (Cualificados / Contactados) × 100 |
| **Tasa propuesta→cierre** | (Ganados / Propuestas enviadas) × 100 |
| **Tiempo medio lead→cierre** | Promedio de días desde `nuevo` a `ganado` |
| **Ticket medio** | Suma ganada / número de ganados |
| **Leads estancados** | Conteo de > 7 días sin movimiento |
| **Pipeline value** | Suma del valor estimado de cualificados + en negociación |

---

## 8. Datos que se guardan por lead

> **Formato:** frontmatter YAML al inicio del archivo `.md` del lead.
> La app React lee esto para construir el pipeline visual.

```yaml
---
id: IM-2026-001
nombre: María García
telefono: "+34600000000"
email: maria@email.com
idioma: ES
origen: facebook

estado: cualificado
score: 8
sensacion: caliente

fecha_evento: 2026-07-15
fecha_evento_alt: 2026-07-22
personas: 12
tipo_evento: cumpleaños
presupuesto_min: 3000
presupuesto_max: 4000

servicios_mencionados:
  - catering
  - barra_libre

created_at: 2026-06-01T10:30:00
updated_at: 2026-06-02T15:45:00
historial_estados:
  - estado: nuevo
    fecha: 2026-06-01T10:30:00
  - estado: contactado
    fecha: 2026-06-01T14:20:00
    nota: "Llamada de 8 min, conversación buena"
  - estado: cualificado
    fecha: 2026-06-02T15:45:00
alertas: []
---

# Lead: María García

## Notas de la conversación
> Quiere sorprender a su pareja. Le gusta la idea de cala escondida
> para bañarse al atardecer. Ha mirado competencia y le hemos gustado
> por la atención personal.
```

### 8.1 Tipos TypeScript (en la app)

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

type Sensacion = 'caliente' | 'tibio' | 'frio' | 'descartado';
type Origen = 'facebook' | 'referido' | 'web' | 'evento' | 'otro';
type Idioma = 'ES' | 'CAT' | 'EN';

interface Lead {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  idioma: Idioma;
  origen: Origen;
  estado: EstadoLead;
  score: number;
  sensacion: Sensacion;
  fecha_evento?: string;
  fecha_evento_alt?: string;
  personas?: number;
  tipo_evento?: string;
  presupuesto_min?: number;
  presupuesto_max?: number;
  servicios_mencionados?: string[];
  created_at: string;
  updated_at: string;
  historial_estados: Array<{
    estado: EstadoLead;
    fecha: string;
    nota?: string;
  }>;
  alertas: string[];
}
```

### 8.2 Validación (zod, en la app)

La app valida el frontmatter con zod antes de mostrar el lead.
Si falta un campo obligatorio (nombre, fecha, grupo), la ficha se
marca como `incompleto` y se pide a Xisco completarla.

### 8.3 Convención de archivos

- Un archivo por lead: `vault/01-IronMonkeyCharter/leads/IM-2026-001.md`.
- El ID es inmutable y se asigna al crear.
- Las propuestas PDF se guardan separadas:
  `vault/01-IronMonkeyCharter/propuestas/IM-2026-001-v1.pdf`.
- El campo `propuesta_actual` en el frontmatter apunta a la última
  versión generada.

---

## 9. Post-venta (cuando un lead se cierra)

Cuando un lead pasa a `ganado`, el CRM Manager abre un sub-flujo:

1. **Confirmación inmediata** — Xisco envía email de "reservado"
   (plantilla en `tono-marca.md`).
2. **Segundo pago** — Alerta 7 días antes del evento.
3. **Pago final** — Alerta 1 día antes del evento.
4. **Día del charter** — Recordatorio 3h antes con punto de encuentro.
5. **Post-charter** — 24h después: email de agradecimiento + pedir
   review/testimonio.
6. **Archivo** — Tras 30 días del charter, mover a `_archive/`.

---

## 10. Lo que el CRM NO hace

- ❌ No envía emails. Xisco lo hace.
- ❌ No llama al cliente. Xisco lo hace.
- ❌ No cierra ventas. Xisco decide.
- ❌ No modifica precios. Xisco decide.
- ❌ No borra fichas. Solo se mueven a `_archive/`.

---

_Agentik O.S. v1.0 — Pipeline. Esta es la pieza central. Cualquier
mejora del sistema debería reflejarse aquí primero._
