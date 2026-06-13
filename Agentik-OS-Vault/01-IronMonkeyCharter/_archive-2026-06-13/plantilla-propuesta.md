# Plantilla de propuesta — Iron Monkey

> Estructura del PDF que genera el agente **Proposal Generator** a
> partir de la **ficha ICP rellenada por Xisco** (no de un lead
> automático).
> **NO se aplica LLMLingua2 agresivo** a este prompt.
> **NO se usa modo Caveman** en el output (es para cliente).
>
> **REGLA:** el PDF se devuelve a Xisco marcado como
> `[PENDIENTE VALIDACIÓN]`. **Nunca** se envía al cliente desde el
> sistema. Xisco lo revisa, ajusta si hace falta y lo envía por su
> cuenta.

---

## 1. Datos que el sistema extrae de la ficha ICP

El sistema genera el PDF usando estos datos (los toma de la ficha que
Xisco ha rellenado manualmente):

| Dato | Fuente en la ficha |
|------|---------------------|
| Nombre del cliente | campo "Nombre" |
| Email / teléfono | campos respectivos |
| Fecha del evento | campo "Fecha preferida" |
| Personas | campo "Personas" |
| Tipo de evento | campo "Tipo" |
| Presupuesto orientativo | campo "Presupuesto" |
| Servicios extra mencionados | checklist en la ficha |
| Notas relevantes | campo "Notas de la conversación" |
| Objeciones | campo "Dudas / objeciones" |
| Por qué nos eligió | campo "Por qué nos eligió" |
| Sensación | campo "Sensación" (caliente/tibio/frío) |

> Si falta algún dato crítico, el sistema **[PENDIENTE]** lo deja
> marcado y pregunta a Xisco antes de continuar.

---

## 2. Datos de cabecera

```
Iron Monkey Charter
{logo}
Tel: {X} | Email: {X} | Web: {X}
```

---

## 3. Datos del cliente (extraídos de la ficha)

```
Propuesta para: {nombre cliente}
Fecha de la propuesta: {fecha emisión}
Validez de la oferta: 7 días
Referencia: IM-{YYYYMMDD}-{iniciales cliente}

Contacto:
- Tel: {teléfono}
- Email: {email}
- Idioma: {ES / CAT / EN}
```

---

## 4. Resumen ejecutivo (1 párrafo)

Personalizado, 3-4 líneas. Tono cálido y directo (ver `tono-marca.md`).
**El sistema intenta reflejar en este párrafo lo que Xisco haya
escrito en "Por qué nos eligió" y "Notas de la conversación"** para
que el cliente sienta que es una propuesta hecha a medida.

**Ejemplo:**
> Hola {nombre}, hemos preparado esta propuesta para {tipo de evento}
> del {fecha}, basada en lo que comentamos por teléfono. Te recomendamos
> el {embarcación} por {razón principal — capacidad, ruta,
> presupuesto}. Salida desde {puerto}, duración {X} h, con
> {servicios clave que el cliente mencionó}. Si todo encaja, basta
> con confirmarlo y bloquear la fecha.

---

## 5. Detalle de la embarcación

| Campo | Valor |
|-------|-------|
| **Embarcación** | {nombre} |
| **Eslora** | {X} m |
| **Capacidad máxima** | {X} personas |
| **Capacidad recomendada** | {X} personas (confort, alineado con el grupo del cliente) |
| **Año / última reforma** | {YYYY} |
| **Equipamiento** | {lista} |
| **Tripulación** | {capitán + marinero / solo capitán} |
| **Puerto base** | {puerto} |

**Imagen:** foto profesional de la embarcación. Si no hay, dejar
marcado `[AÑADIR FOTO — Xisco]`.

---

## 6. Ruta y duración

**Opción A (recomendada):**
- Salida: {hora} desde {puerto}
- Recorrido: {calas / playas / puntos de interés}
- Paradas para baño: {X}
- Regreso: {hora} a {puerto}
- Duración total: {X} h

**Opción B (alternativa):**
- Salida: {hora} desde {puerto}
- Recorrido: {otro itinerario}
- Regreso: {hora} a {puerto}
- Duración total: {X} h

> Si el cliente no ha definido ruta, proponer 2 opciones estándar.

---

## 7. Servicios incluidos

Marcar con ✓ los que van en el precio base:

- ✓ Capitán profesional
- ✓ Tripulación (si aplica)
- ✓ Combustible
- ✓ Seguro de pasajeros
- ✓ Equipo de sonido
- ✓ Paddle surf / snorkel
- ✓ Hielo + vasos
- ✓ WC y ducha

---

## 8. Servicios opcionales (a añadir)

| Servicio | Precio | Seleccionado por cliente |
|----------|--------|--------------------------|
| Catering (menú X) | {€€} | ✅ / ❌ (lo marca el sistema según ficha) |
| Catering premium | {€€} | ✅ / ❌ |
| Barra libre (X horas) | {€€} | ✅ / ❌ |
| DJ / música en vivo | {€€} | ✅ / ❌ |
| Decoración | {€€} | ✅ / ❌ |
| Fotógrafo | {€€} | ✅ / ❌ |
| Servicio de transporte | {€€} | ✅ / ❌ |

> El sistema marca ✅ solo si Xisco marcó el servicio en la ficha ICP.
> Si el cliente no lo pidió, aparece como ❌ con la opción de añadir.

---

## 9. Precio

### 9.1 Desglose

| Concepto | Importe |
|----------|---------|
| Charter base ({X} h, {X} pax) | {€€€} |
| Servicios opcionales seleccionados | {€€€} |
| Combustible | incluido |
| Limpieza final | incluida |
| IVA (si aplica) | {€€} |
| **TOTAL** | **{€€€ EUR}** |

### 9.2 Forma de pago (de `politicas-comerciales.md`)

| Concepto | Importe | Momento |
|----------|---------|---------|
| Señal de reserva | {X} EUR (30%) | Al confirmar |
| Segundo pago | {X} EUR (40%) | 7 días antes del charter |
| Pago final | {X} EUR (30%) | Día del charter |

**Datos bancarios:** {incluir}

---

## 10. Política de cancelación (resumen)

Ver `politicas-comerciales.md` para detalle completo.

| Antelación | Penalización |
|------------|--------------|
| > 30 días | Devolución 100% de la señal |
| 15–30 días | Pérdida del 50% de la señal |
| 7–14 días | Pérdida del 100% de la señal |
| < 7 días o no-show | Pérdida del 100% del importe |

**Climatología:** si las condiciones impiden navegar con seguridad, se
reprograma sin coste o se devuelve el 100%.

---

## 11. Próximos pasos

```
1. Revisar esta propuesta y confirmarme por email o WhatsApp
2. Realizar la señal de {X} EUR
3. {X} días antes: segundo pago
4. Día del charter: presentarse 15 min antes en {punto}
```

**Contacto para dudas o confirmación:**
- {nombre de Xisco}
- Tel: {X}
- Email: {X}
- WhatsApp: {X}

> **Importante:** este PDF **no se envía al cliente** desde el sistema.
> Xisco lo revisa, ajusta y lo envía él mismo. Cuando Xisco confirma
> que lo ha enviado, el CRM Manager cambia el estado a
> `propuesta_enviada`.

---

## 12. Footer

```
Iron Monkey Charter | {web} | {redes sociales}
Reservas sujetas a disponibilidad. Esta propuesta tiene validez de 7 días
desde su emisión.
```

---

## 13. Notas para el agente (NO incluir en el PDF)

- Si la ficha ICP tiene algún campo crítico vacío (fecha, grupo,
  nombre), el sistema **no genera el PDF** y avisa a Xisco.
- Si el presupuesto de la ficha es < 1.500 EUR, marcar
  `[PRECIOS BAJOS — REVISAR]`.
- Si la fecha es < 7 días, marcar `[DISPONIBILIDAD URGENTE]`.
- Si Xisco marcó "Sensación: frío" o "Descartado", el sistema
  **no genera propuesta automáticamente** — propone primero una
  acción de follow-up.
- Siempre incluir 2-3 fotos profesionales de la embarcación si
  están disponibles.
- Si la ficha menciona objeciones (precio, fecha, dudas), el sistema
  las refleja en el resumen ejecutivo para que Xisco las trate en la
  llamada, no en el PDF.

---

## 14. Flujo completo: ficha → PDF

```
[Xisco rellena ficha ICP]
        |
        v
[Sistema valida campos mínimos]
        | (si falta algo)  ──>  pide datos a Xisco
        | (si todo OK)
        v
[Sistema extrae datos + servicios marcados]
        |
        v
[Sistema consulta Graphify: embarcaciones, precios, políticas]
        |
        v
[Sistema genera HTML + PDF]
        |
        v
[Devuelve a Xisco como [PENDIENTE VALIDACIÓN]]
        |
        v
[Xisco revisa, ajusta si hace falta, envía él mismo]
        |
        v
[Xisco marca "enviado" en el sistema]
        |
        v
[CRM Manager: estado → propuesta_enviada]
```
