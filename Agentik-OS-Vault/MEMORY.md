# MEMORY — Aprendizajes del Sistema

> Acumulación de conocimiento operativo. Se actualiza tras cada sesión
> relevante o cuando aparece un patrón repetido.
> **Regla:** si un aprendizaje aparece 3+ veces, se promueve a un archivo
> permanente (ej. `objeciones-respuestas.md`).

---

## 1. Iron Monkey Charter

### Embarcación (datos reales, fuente: documento Monkey's Charter B.V.)
- **Barco:** SV Iron Monkey — Velero ketch de acero Jongert Yachts (1982, refit 2025)
- **Eslora:** 22.4m | **Manga:** 5.8m | **Calado:** 2.7–3.0m | **Desplazamiento:** 84–87 ton
- **Puerto base:** La Lonja Marina Charter, Palma de Mallorca
- **Certificación:** MCA bajo Red Ensign Code
- **Tripulación:** Capitán + Azafata (fijos, siempre incluidos)
- **Capacidad día:** 12 máx | **Pernocta:** 9 máx | **Cabinas:** 3 (triple + cuádruple + doble) | **Baños:** 5
- **Velocidad:** 8 nudos cruise, 10 nudos máx
- **Water toys incluidos:** SUP, wakeboard, esquís, pesca, snorkel, dinghy, plataforma basculante — sin coste extra
- **Web:** svironmonkey.nl

### Tarifas reales (por temporada) — actualizadas 2026-06-13
| Producto | Low | Shoulder | High | Peak |
|---|---|---|---|---|
| Sunset (2.5–3h) | 1,250 € | 1,450 € | 1,650 € | 1,850 € |
| Day (7h) | 2,350 € | 2,750 € | 3,150 € | 3,450 € |
| Pernocta (por día) | 3,450 €/día | 3,950 €/día | 4,450 €/día | 4,950 €/día |
| Semanal (7 noches) | 14,500 € | 16,900 € | 18,900 € | 20,900 € |

- Temporada **Low:** Mar, Abr, Nov | **Shoulder:** May, Oct | **High:** Jun, Sep | **Peak:** Jul, Ago
- **IVA siempre incluido** en todos los precios
- **Pernocta = precio por día** (se multiplica por el número de días)
- **APA opcional y personalizable** — Xisco decide en cada oferta si incluirlo y con qué %
- Sin paquetes cerrados de comida/bebida — se envía documento de preferencias post-reserva

### Política de cancelación (actualizada 2026-06-13)
- >14 días antes del zarpe → Reembolso completo (100%)
- 7–14 días antes → 50% reembolso
- <7 días antes → Sin reembolso (0%)

### Paquetes opcionales (bebidas + comida)
- Bebidas: Cortesía básica (incluida) / Estándar / Premium (champagne, vinos de finca)
- Comida: Aperitivo Board / Mallorca Lunch Board / Premium Onboard Lunch / A la carta via APA
- Regla: no prometer almuerzo caliente durante navegación

### Eventos que disparan demanda
- Palma Vela (inicios mayo), Copa del Rey (Jul/Ago), San Juan (final jun), vacaciones escolares europeas

### Eventos clave para reservas
- Palma Vela → mayo | Copa del Rey → julio/agosto | San Juan → finales junio
- Antelación temporada pico/semanal: meses de antelación
- Antelación menú: 48–72h obligatorio

### Leads
- **Fuente principal:** Facebook Ads.
- **Entrada al sistema:** Xisco mete el lead manualmente en la app (no entra automático).
- **Flujo:** crear perfil → llamar → meter nota (TRIGGER) → ICP procesa → generar oferta si score ≥ 7.
- **Pipeline visual:** columnas drag-and-drop en la app React.

### Competencia clave
1. **Vita Bel Boat Trips** — velero clásico 16m, Cala d'Or, tours compartidos, 1,120–1,800 € privado
2. **Catamaranes modernos** (Lagoon 450, Oceanis) — 665–1,200 €/día, bareboat
3. **Yates a motor** (MyMallorcaCharter) — 2,500–3,500 €/día + combustible, 20–25 nudos

### KPI pipeline (pendiente de datos reales)
- **Días medios lead → cierre:** _[Xisco: medir desde primer contacto hasta firma]_
- **Ratio lead → propuesta:** _[Xisco: leads contactados / propuestas generadas]_
- **Ratio propuesta → cierre:** _[Xisco: propuestas enviadas / contratos firmados]_
- **Ticket medio:** _[Xisco: facturación total / número de reservas]_

### Aprendizajes operativos
- Regla: nunca ofrecer descuentos — ofrecer valor añadido (upgrades)
- Regla: nunca vender bareboat — siempre destacar la tripulación incluida
- Regla: gestionar expectativas de velocidad — no es un yate a motor
- APA opcional — preguntar a Xisco en cada oferta
- Pernocta = por día (no por 24h) — no olvidar multiplicar
- Documento de preferencias = proceso estándar para comida y bebidas

---

## 2. Growing Inmobiliario

### Llamadas
- **Objetivo diario:** 100 llamadas / 25 conversaciones / 3 agendas.
- **Mejor marca:** 117 llamadas en un día, 5 agendas en un día.
- **Duración típica:** 1-14 min según la calidad de la llamada.
- **Score promedio sesiones anteriores:** _[Xisco: calcular media ICL de últimas 10 sesiones]_.
- **Score objetivo:** ≥ 75/100.

### Script
- **Guion oficial:** `guion_llamadas_frias_growing.md` (178 líneas, 5 pasos, 8 objeciones).
- El guion es RÍGIDO. Xisco debe seguirlo al pie de la letra.
- Objetivo: calificar con 3 filtros (dolor, dinero, tiempo) y agendar solo si pasan los 3.

### Objeciones más frecuentes (según Xisco, 2026-06-13)
1. "Mándame un correo, no le interesa antes de saber qué vendemos."
2. "Ir a éxito, no pagar hasta que consiga resultados."
3. "Llámame en otro momento" sin fijar fecha.
4. "¿De dónde sacas mi número?"

### ICP (perfil prospecto ideal)
- Agencias o agentes independientes en España.
- Facturación mínima: 10.000 EUR/mes.
- Con o sin estructura (preferible con equipos).
- Actitud buena + ambición + apertura a inversión + quiere moverse.
- Dolor: captación de exclusivas ha bajado, métodos tradicionales en crisis.
- Solo hablar con dueños/directores comerciales. NUNCA secretarias.

### Comisiones (escalonadas)
| Evento | Comisión |
|--------|---------|
| Agenda generada | 10 EUR |
| Show (se presenta) | 50 EUR total (40 extra) |
| Cierre (firma) | 100 EUR total (50 extra) |
| Canceladas → reagendadas | Se pueden reactivar sin penalización |

### Citas
- **Objetivo:** 3 agendas/día → 15/semana → 60/mes.
- **Show rate actual:** 60%. Objetivo: 70%.
- **Cierre:** ~20% de las agendas (se marca manualmente en el CRM de Growing).

### Métricas pipeline
| Conversión | Ratio |
|-----------|-------|
| Llamadas → Conversaciones | ~25% |
| Conversaciones → Agendas | ~12% |
| Agendas → Show | ~60% |
| Show → Cierre | ~20% |

### Operación sesiones
- **Sesiones:** 3-4 al día, 1-1.5h cada una.
- **Horario:** Mañana 9:00-12:00 / Tarde 16:00-19:00.
- **Subida de audio:** al final de cada sesión, manualmente.
- **Formato audio:** MP3 o M4A.
- **Chunking:** la app corta en segmentos de 15-20 min con solapamiento 5s.

### CRM real — Growing
- **GoHighLevel (GHL):** gestión de contactos + notas para el Closer. Agentik-OS NO toca GHL.
- **Google Sheets tracker:** registro manual de métricas. Agentik-OS NO toca Sheets.
- **Agentik-OS CRM propio:** necesita su propio CRM para:
  - Registro de comisiones (agenda/show/cierre por persona)
  - Registro de agendas y show rates
  - Registro de re-agendas
  - Registro de análisis de sesiones (transcripción + score)
- **Post-llamada:** Xisco apunta notas en papel → mete en GHL para el Closer. El audio se sube a Agentik-OS para transcripción + análisis.

### Definiciones clave (Growing)
- **Llamada / contacto:** intento realizado, aunque no contesten. Es una "llamada realizada".
- **Conversación:** llamada con >1 minuto de habla real con el prospecto.
- **Agenda:** sesión concretada con fecha y hora específica.

### Script de llamadas
- **Source of truth:** `guion_llamadas_frias_growing.md` (178 líneas, 5 pasos + 8 objeciones).
- El script es el mismo para todos los mercados y zonas en España.
- Se actualiza desde dirección comercial. Xisco me avisa y lo actualizo.
- Minor tono variations según perfil del prospecto, pero el guion base no cambia.

### Filtros de cualificación (los 3 que hay que passar)
1. **Dolor:** ¿articula el problema? ¿Captaciones bajas / depende de referidos?
2. **Dinero:** ¿Modo inversión o supervivencia? (rango 5.000–10.000 €)
3. **Tiempo:** ¿Puede empezar en 5–10 días? Si no, nurturing/recordatorio — NO closer.

### Scorecard — COL-Analyser v3.1
- **Source of truth:** `scorecard-evaluacion.md` (32 criterios, 5 fases + gatekeeper)
- **Métrica:** ICL (Índice de Calidad de Llamada) 0–100
- **Pesos:** P2 Diagnóstico 30%, P5 Cierre 25%, P1 Apertura 15%, P4 Tiempo 15%, P3 Dinero 10%, P0 Gatekeeper 5%
- **Grados:** A (90-100), B (80-89), C (65-79), D (45-64), F (0-44)
- **Errores Fatales (FE-0 a FE-5):** anulan puntuación de su fase a 0
- **Errores Críticos Globales (ECG-1 a ECG-3):** tapan ICL máximo a 44 (F)
- **Técnica BAMFAM:** alternativa forzada en 2 niveles en cierre (mañanas/tardes → martes/jueves)
- **Dolor verbalizado:** clave — prospecto debe articular consecuencia negativa concreta
- **Score objetivo Xisco:** ≥75/100

### Gamificación
- **Modo estándar:** 100 calls / 25 conversaciones / 3 agendas.
- **Racha actual:** _[Xisco: días consecutivos cumpliendo objetivo]_
- **Mejor marca:** 117 calls / 5 agendas.
- Digest 08:00 con FIPAs (Feedback Insights Para Aplicar).

### Aprendizajes operativos
- Xisco tiene problema de "mapa mental" para responder objeciones. Archivado en `objeciones-respuestas.md`.
- El guion es la fuente de verdad. No modificar sin autorización.

---

## 3. Ajustes del sistema

| Parámetro | Valor | Última actualización |
|-----------|-------|---------------------|
| Versión Agentik O.S. | 1.0 | 2026-06-13 |
| ~~LLMLingua2~~ | **ELIMINADO en v1** | 2026-06-13 |
| Compresión de input | Graphify (5-10x realista) | 2026-06-13 |
| Compresión de output | Caveman (1.4-1.6x) | 2026-06-13 |
| Multiplicador combinado | 10-20x (no 570x) | 2026-06-13 |
| Modo output (interno) | Caveman | 2026-06-13 |
| Modo output (cliente) | Formal | 2026-06-13 |
| Indexación Graphify | cada 24h | 2026-06-13 |
| Modelos activos | MiniMax M3, M2.5, Gemini Flash Lite | 2026-06-13 |
| Capa de orquestación | App React local (no cron del SO) | 2026-06-13 |
| Generación de PDF | Playwright (no WeasyPrint) | 2026-06-13 |
| Chunking de audio | 15-20 min con solapamiento 5s | 2026-06-13 |
| Contacto con cliente | NUNCA por el sistema (decisión v1) | 2026-06-13 |

---

## 4. Preferencias del operador (Xisco)

- **Comunicación interna:** Caveman (conciso, sin floritura).
- **Comunicación externa (clientes):** Formal, profesional, cálido.
- **Reportes:** Digest diario + review semanal (domingo).
- **Validación humana:** obligatoria para propuestas económicas, cierres,
  y cualquier mensaje que salga del sistema hacia un cliente.
- **Privacidad:** 100% local. Ningún dato de cliente sale a cloud de terceros.

---

## 5. Backlog de mejoras del sistema

- [ ] _[Xisco: ideas de mejoras que surjan durante operación]_
- [ ] _[Xisco: ajustes de prompts o flujos]_
- [ ] _[Xisco: integraciones deseadas]_

---

## 6. Cambios recientes (últimos 10)

| Fecha | Cambio | Agente / persona |
|-------|--------|------------------|
| 2026-06-13 | v1.0 — fundación del vault y los 7 agentes | Xisco + Mavis |
| 2026-06-13 | Eliminado LLMLingua2 de v1 por análisis de viabilidad | Xisco + Mavis |
| 2026-06-13 | Recalibrado multiplicador de ahorro a 10-20x (no 570x) | Xisco + Mavis |
| 2026-06-13 | Iron Monkey reescrito: sistema = CRM, no contactador | Xisco + Mavis |
| 2026-06-13 | Añadida app React local como capa de orquestación | Xisco + Mavis |
| 2026-06-13 | Pipeline-crm.md: estados tipados + frontmatter YAML | Xisco + Mavis |
| 2026-06-13 | Gamificación Growing: sistema de apuestas y rachas | Xisco + Mavis |
| 2026-06-13 | Chunking audio 15-20 min para Gemini | Xisco + Mavis |
| 2026-06-13 | **Trigger Iron Monkey refinado: la NOTA es la unidad de acción** (crear perfil no activa nada) | Xisco + Mavis |
| 2026-06-13 | **Trigger Growing refinado: SUBIR AUDIO dispara cascada completa** (Call Analyzer + Feedback Coach) | Xisco + Mavis |
| 2026-06-13 | Añadido sistema FIPA: 3-5 insights del día anterior en digest 08:00 Growing | Xisco + Mavis |
| 2026-06-13 | Digest 08:00 Iron Monkey reescrito: 4 listas priorizadas (contactar / ofertar / follow-up / recontactar) | Xisco + Mavis |
| 2026-06-13 | Iron Monkey vault completado con datos reales del documento Monkey's Charter B.V. — especificaciones, tarifas, temporadas, rutas, servicios, competencia, FAQ, tono de marca, políticas | Xisco + Mavis |
| 2026-06-13 | Políticas Iron Monkey actualizadas: APA opcional + % personalizable, IVA siempre incluido, pernocta = precio por día, documento de preferencias a la carta, política de cancelación del cliente (14+/7-14/<7 días) | Xisco + Mavis |
| 2026-06-13 | Growing: GHL es externo (no lo tocamos), Agentik-OS necesita su propio CRM para comisiones/agendas/show rates/sesiones. Definiciones: llamada=intento, conversación=>1min, agenda=sesión con fecha. Script canónico leído. Scorecard COL-Analyser v3.1 integrada (32 criterios, ICL 0-100, 5 fases + gatekeeper) | Xisco + Mavis |
| 2026-06-13 | Addendum técnico integrado: Obsidian+Graphify en tándem, Gemini 2.5 Flash-Lite (2.0 descontinuado), audio 1h con chunking 15min+10s solapamiento, diarización XISCO/PROSPECTO, presupuesto 52-55 EUR/mes. Plan completo v1 (4 fases) escrito | Xisco + Mavis |

---

_Regla de mantenimiento: cada viernes al cerrar la semana, el agente
**Feedback Coach** revisa este archivo y propone entradas nuevas._
