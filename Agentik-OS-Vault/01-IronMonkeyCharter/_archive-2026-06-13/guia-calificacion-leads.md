# Ficha ICP — Iron Monkey Charter

> **ICP = Ingreso y Cualificación de Prospectos.**
> Este archivo define **cómo Xisco registra manualmente cada lead** y
> qué información mínima debe meter tras la llamada. El sistema
> procesa esa ficha y devuelve: lead estructurado, score, sugerencia
> de siguiente paso.

> **Recordatorio:** el sistema **nunca** contacta al cliente. Xisco
> hace la llamada y luego rellena la ficha.

---

## 1. Cuándo crear una ficha

- Lead nuevo que entra por cualquier canal (Facebook, referido, web,
  walk-in, evento, lo que sea).
- Xisco rellena el **perfil inicial** (datos de contacto + evento).
  → Se crea la ficha vacía. **No se activa nada todavía.**
- Xisco llama por teléfono al cliente.
- Xisco vuelve a la app y mete la **nota** con lo que habló.
  → **ESTE es el trigger principal:** ICP estructura, calcula score,
  asigna estado, programa follow-ups.

---

## 2. Dos fases, dos formularios

### Fase A — Crear perfil (sin trigger)

Xisco rellena estos campos al crear el lead. La ficha queda en estado
`nuevo` y la app **no hace nada más** hasta que Xisco meta una nota.

| Campo | Tipo | Obligatorio | Ejemplo |
|-------|------|-------------|---------|
| **Nombre** | texto | ✅ | María García |
| **Teléfono** | texto | ✅ | +34 600 000 000 |
| **Email** | texto | ✅ | maria@email.com |
| **Origen del lead** | selección | ✅ | Facebook, referido, web, evento, otro |
| **Fecha preferida del evento** | fecha | ✅ | 2026-07-15 |
| **Número de personas** | número | ✅ | 12 |
| **Tipo de evento** | selección | ✅ | cumpleaños, corporate, despedida, boda, otro |
| **Presupuesto orientativo** | rango | ⬜ | 3.000–4.000 EUR |
| **Idioma** | selección | ⬜ | ES / CAT / EN |

### Fase B — Añadir nota (TRIGGER principal)

Tras la llamada, Xisco abre la ficha y rellena el campo de notas
con texto libre. La app muestra un campo grande con placeholder que
sugiere qué escribir. Al hacer click en "Guardar nota" se activa el
ICP.

| Campo | Tipo | Obligatorio | Notas |
|-------|------|-------------|-------|
| **Notas de la conversación** | texto libre | ✅ | (ver guía en sección 4) |
| **Sensación general** | selección | ✅ | 🔥 caliente / 🟡 tibio / 🟠 frío / ⛔ descartado |
| **Servicios extra mencionados** | checklist | ⬜ | catering, barra libre, etc. |
| **Próximo paso acordado** | texto corto | ⬜ | ej: "Llamar el viernes" |

> **Si la nota está vacía o sensación = "—" → ICP no procesa.**

---

## 3. Campos opcionales (recomendados)

| Campo | Cuándo rellenarlo |
|-------|-------------------|
| Decisor (si es distinto del contacto) | Cuando Xisco habla con un intermediario |
| Fecha alternativa | Si el cliente tiene flexibilidad |
| Servicios extra mencionados | Cuando el cliente pide catering, barra libre, etc. |
| Punto de embarque preferido | Si lo menciona |
| Referido por | Cuando viene de un cliente actual |
| Idiomas | Si el cliente habla solo inglés u otro idioma |
| Mejor horario para llamar | Si Xisco no logra contactar a la primera |

---

## 4. Cómo escribir las notas de la conversación

Xisco escribe en **texto libre**, pero el sistema estructura después.
Para que el sistema pueda trabajar bien, las notas idealmente cubren:

1. **Qué quiere el cliente** (tipo de evento, vibe, expectativas).
2. **Detalles del grupo** (composición: adultos, niños, perfil).
3. **Restricciones / preferencias** (ruta, comida, bebidas, música).
4. **Objeciones mencionadas** (precio, fecha, dudas, competencia).
5. **Por qué eligió Iron Monkey** (lo que le convenció).
6. **Nivel de urgencia** (cuándo quiere decidir).
7. **Próximo paso concreto** (cuándo llamar de nuevo, qué enviar).

> No hace falta ser perfecto. Mientras haya contexto, el sistema
> extrae lo accionable.

### 4.1 Qué hace el ICP al guardar la nota

```
1. Recibe el texto libre
2. Lo estructura en bullets con las 7 secciones de arriba
3. Calcula score 1-10 con los criterios de sección 5
4. Asigna estado:
   - score >= 7 + sensación caliente  → cualificado
   - score 4-6 o sensación tibio     → tibio
   - score < 4 o sensación frío      → descartado
5. Programa follow-ups según el "próximo paso acordado":
   - "Llamar el viernes" → follow-up para ese día
   - "Mandar info" → follow-up en 24h
   - "Piense y me dice" → follow-up en 7 días
6. Actualiza la ficha del lead
7. Muestra el resultado a Xisco en la app
8. Si score >= 7: muestra el botón "Generar oferta" en la misma nota
```

---

## 5. Criterios de scoring (lo que aplica el sistema)

El sistema asigna un **score 1-10** automáticamente en función de
los datos de la ficha. Pesos:

| Criterio | Puntos |
|----------|--------|
| Presupuesto explícito > 3.000 EUR | +3 |
| Presupuesto 1.500–3.000 EUR | +1 |
| Fecha flexible (± 1 mes) | +2 |
| Fecha concreta lejana (> 30 días) | +1 |
| Fecha concreta cercana (< 7 días) | -1 |
| Grupo > 8 personas | +2 |
| Grupo 4–8 personas | +1 |
| Evento corporate / privado | +1 |
| Celebración personal | +1 |
| Contacto directo (responde rápido) | +2 |
| Cliente referido | +2 |
| Idioma español/catalán | +1 |

### Interpretación

| Score | Acción que propone el sistema |
|-------|------------------------------|
| **9–10** | 🔥 Propuesta inmediata. Xisco confirma y dispara Proposal Generator. |
| **7–8** | ✅ Propuesta. Proposal Generator en cuanto Xisco diga "generar". |
| **5–6** | 🟡 Follow-up. Propuesta en 24h si el cliente confirma interés. |
| **3–4** | 🟠 Follow-up largo (72h) o esperar a que el cliente vuelva. |
| **1–2** | ⛔ Descartar. No invertir tiempo. |

---

## 6. Estados del pipeline (lo que el CRM Manager usa)

```
nuevo  ──>  contactado  ──>  cualificado  ──>  propuesta_borrador
            │                  │                  │
            │                  ├──> tibio         v
            │                  └──> descartado  propuesta_enviada
            │                                       │
            └──> sin_contacto                       ├──> en_negociacion ──> ganado
                                                    ├──> perdido
                                                    └──> silencio (alerta)
```

**Quién cambia el estado:** Xisco, manualmente, o el sistema cuando
sucede un trigger claro (ej.Proposal Generator devuelve el PDF → estado
`propuesta_borrador`).

---

## 7. Plantilla de ficha vacía (para copiar)

```markdown
## Lead: {Nombre}
**Fecha de entrada:** {YYYY-MM-DD}
**Origen:** {Facebook / referido / web / otro}
**Teléfono:** {+34 ...}
**Email:** {email}
**Idioma:** {ES / CAT / EN}

### Evento
- **Fecha preferida:** {YYYY-MM-DD}
- **Fecha alternativa:** {YYYY-MM-DD} (si hay)
- **Personas:** {X}
- **Tipo:** {cumple / corporate / despedida / boda / otro}
- **Presupuesto orientativo:** {X-Y EUR}

### Notas de la conversación
> {texto libre de Xisco}

### Sensación
- 🔥 Caliente / 🟡 Tibio / 🟠 Frío / ⛔ Descartado

### Sensación detallada
- **Urgencia:** {alta / media / baja}
- **Dudas / objeciones:** {lista}
- **Por qué nos eligió:** {frase}
- **Próximo paso acordado:** {qué y cuándo}

### Decisor (si distinto)
- **Nombre:** {X}
- **Contacto:** {X}

### Servicios extra mencionados
- [ ] Catering
- [ ] Barra libre
- [ ] Música / DJ
- [ ] Decoración
- [ ] Fotógrafo
- [ ] Transporte
- [ ] Otro: {X}
```

---

## 8. Errores comunes a evitar al rellenar

- ❌ Dejar el campo "Notas" vacío. Aunque sea corto, algo de contexto.
- ❌ Poner presupuesto "depende" sin rango aproximado. Pedir rango.
- ❌ No anotar la sensación. Sin eso, el sistema no puede priorizar.
- ❌ Confundir fecha del evento con fecha de la llamada.
- ❌ Olvidar idioma si no es español.
- ❌ Meter dos leads distintos en la misma ficha.

---

## 9. Revisión de la guía

- Xisco revisa los pesos del scorecard cada 30 días tras tener datos
  de cierres reales.
- Si el ratio de cierre sube o baja más de 10%, ajustar.
- Mantener histórico en `MEMORY.md`.
