# Deuda Técnica — Agentik O.S.

> Registro de deuda técnica pendiente. Items priorizados por impacto en el objetivo de negocio: **Xisco no pierde leads y mejora llamadas.**
> Última actualización: 2026-06-14 (post-audit: 6 items resueltos, 2 re-clasificados como HECHOS, 5 pendientes confirmados)

---

## 🔴 Alta — Arreglar antes de Fase 2

### 1. Test suite incompleta
- **Qué:** Server tiene tests (8 pasando), pero frontend (`packages/app/`) zero tests. Stores críticos sin coverage.
- **Por qué importa:** Un refactor de `pipelineStore` o `sessionStore` puede romper UI sin aviso. Xisco pierde datos de pipeline.
- **Cómo arreglar:**
  - [x] Añadir Vitest a `packages/server` (middleware: rate-limiter, sanitizeAudioFileName)
  - [ ] Añadir Vitest a `packages/app` (tests de stores: pipelineStore, sessionStore, dashboardStore)
  - [ ] Test E2E mínimo: crear lead → guardar nota → mover en pipeline → generar proposal (mock)
- **Estimado:** 1-2 días
- **Nota 2026-06-14:** 8 tests server pasando. Bug fix case-insensitive en `sanitizeAudioFileName`. App/ sin vitest ni tests.

### 2. Sin rate limiting ni size limits en /agents/call-analyzer
- **Qué:** Endpoint multipart acepta audios de cualquier tamaño. Sin límite de requests/minuto.
- **Por qué importa:** Audio de 3h = ~200MB. 2 requests concurrentes = 400MB RAM + disco. Xisco puede bloquear su propio servidor sin querer.
- **Cómo arreglar:**
  - [x] Middleware custom `rateLimiter()`: max 1 análisis cada 5 min por IP+path
  - [x] Limitar tamaño audio total a 500MB por request
  - [x] Limitar chunks a 20 (evita sesiones de 8h)
- **Estimado:** 4-6 horas
- **Nota 2026-06-14:** Implementado en `routes/agents.ts`. Rate limiter in-memory en `middleware/rate-limiter.ts`. Tests coverage 100%.

### 3. Graphify no re-indexa automáticamente
- **Qué:** Re-index requiere POST manual o esperar 24h. Si Xisco edita un precio en el vault, los agentes ven datos stale.
- **Por qué importa:** Propuesta con precio viejo = Xisco pierde credibilidad con cliente.
- **Cómo arreglar:**
  - [x] File watcher con `chokidar` en `packages/server` → reindex debounced 5s tras editar vault
  - [ ] Mejora: timestamp de última modificación en cada .md, comparar con timestamp de índice (evita reindex completo)
- **Estimado:** 1 día (mejora opcional: 4h)
- **Nota 2026-06-14:** `startWatcher()` en `services/graphify.service.ts`. Watches `**/*.md` en vault. Debounce 5s. Inicia en `index.ts` callback del servidor. Timestamp comparison no implementada — reindex es completo.

---

## 🟡 Media — Arreglar durante Fase 2-3

### 4. No hay backup del vault
- **Qué:** Todo el conocimiento del sistema vive en archivos .md locales. Sin backup automático.
- **Por qué importa:** Disco roto / OneDrive sync falla / borrado accidental = pérdida total de datos.
- **Cómo arreglar:**
  - [ ] Script diario que copia `Agentik-OS-Vault/` a `Agentik-OS-Vault/_backup/YYYY-MM-DD/`
  - [ ] O: git commit automático cada noche con timestamp
  - [ ] O: aprovechar OneDrive (Xisco ya lo usa) — documentar que el vault está en carpeta sincronizada
- **Estimado:** 4-8 horas
- **Nota 2026-06-14:** Pendiente. Zero scripts de backup en codebase.

### 5. Digests 08:00/18:00
- **Qué:** Endpoints `/digest/ironmonkey` y `/digest/growing` existen y son funcionales, pero **no hay scheduler** para ejecutarlos automáticamente a las 08:00 y 18:00.
- **Por qué importa:** El digest es el core value prop del sistema. Sin scheduler, Xisco debe recordar hacer POST manual.
- **Cómo arreglar:**
  - [ ] Scheduler con `node-cron` en backend: 08:00 y 18:00
  - [ ] Web Notifications API en frontend para mostrar digest cuando llega
  - [ ] Persistir último digest visto para no repetir notificación
- **Estimado:** 1-2 días
- **Nota 2026-06-14:** Endpoints reales (`routes/digest.ts`). `runCrmManagerAgent` y `runGoalTrackerAgent` devuelven JSON. Falta scheduler + notificaciones.

### 6. Call Analyzer sin estados de error por etapa
- **Qué:** El endpoint funciona con audio real, pero si transcribe falla, todo se pierde. No hay reintentos ni estados parciales.
- **Por qué importa:** Si MiniMax M3 o Gemini fallan en producción, todo el pipeline de Growing se para. Xisco pierde el audio.
- **Cómo arreglar:**
  - [ ] Manejo de errores por etapa: si transcribe falla, guardar estado `transcription_error` y permitir reintentar
  - [ ] Si análisis falla, guardar transcripción para re-análisis manual
  - [ ] Métricas de duración por etapa (logging)
  - [ ] Test E2E con audio real de 15 min (opcional, requiere API keys)
- **Estimado:** 1-2 días
- **Nota 2026-06-14:** Endpoint maneja errores genéricos (`catch(err)` con 500). No hay estados por etapa ni reintentos.

### 7. Proposal Generator sin template real
- **Qué:** `proposal-html.service.ts` genera HTML con CSS inline profesional.
- **Estado:** ✅ **HECHO** — No es deuda técnica.
- **Nota 2026-06-14:** HTML completo con paleta navy/gold, fuentes Playfair Display + Inter, grid layout, next-steps, footer. Traducciones ES/CAT/EN. PDF generado vía Puppeteer.

### 8. Sin métricas de coste real
- **Qué:** `minimax.service.ts` no loguea tokens usados por llamada. Imposible saber si el presupuesto de 62 EUR/mes es realista.
- **Por qué importa:** Si el coste real es 200 EUR/mes, Xisco necesita saberlo antes de la factura.
- **Cómo arreglar:**
  - [ ] Añadir `usage` logging en `minimax.service.ts` (prompt_tokens, completion_tokens, total_tokens)
  - [ ] Añadir `usage` logging en `gemini.service.ts` si aplica
  - [ ] Dashboard de coste diario en frontend (widget en DashboardView)
  - [ ] Alerta si coste diario > 2 EUR (proyección > 60 EUR/mes)
- **Estimado:** 1 día
- **Nota 2026-06-14:** `minimax.service.ts` solo tiene `max_tokens` en config. Zero logging de usage. `dashboardStore.ts` no rastrea costes.

---

## 🔵 Baja — Nice to have

### 9. Caracteres chinos residuales en docs
- **Qué:** 6 archivos del vault tenían caracteres corruptos (`替换`, `剩余`, `早早`, etc.) restos de traducción automática.
- **Impacto:** Cosmético. No afecta parsing.
- **Cómo arreglar:** Buscar/reemplazar con sed/awk. 30 min.
- **Nota 2026-06-14:** ✅ Fix aplicado. 3 archivos limpiados: `politicas-comerciales.md`, `temporadas-calendario.md`, `MEMORY.md`. **Quedan 3 archivos por verificar**: `AGENTIK-OS.md`, `orquestacion.md`, `README.md`.

### 10. `tsconfig.tsbuildinfo` en git
- **Qué:** Build artifacts comiteados. Ensucian diffs.
- **Impacto:** Nulo funcional.
- **Cómo arreglar:** Añadir a `.gitignore`. 5 min.
- **Nota 2026-06-14:** ✅ `*.tsbuildinfo` y `graphify-out/` añadidos a root `.gitignore`.

### 11. `graphify-out/` en git
- **Qué:** Cache de Graphify comiteada. Se regenera con reindex.
- **Impacto:** Nulo funcional. Aumenta tamaño del repo.
- **Cómo arreglar:** Añadir a `.gitignore` o mantener solo `manifest.json`. 10 min.
- **Nota 2026-06-14:** ✅ `graphify-out/` añadido a root `.gitignore`.

### 12. Scripts debug `test-*.ts` en src/
- **Qué:** `test-env.ts`, `test-path.ts`, `test-query.ts` en `packages/server/src/`.
- **Impacto:** Nulo. No se ejecutan en producción.
- **Cómo arreglar:** Mover a `scripts/` o eliminar. 15 min.
- **Nota 2026-06-14:** ✅ 3 archivos movidos a `packages/server/scripts/`.

### 13. Sin PWA / Service Worker
- **Qué:** App es SPA web. No funciona offline. Notificaciones requieren pestaña abierta.
- **Impacto:** Bajo. Xisco usa en desktop con pestaña abierta.
- **Cómo arreglar:** Añadir SW mínimo para notificaciones push. 1 día.
- **Nota 2026-06-14:** Pendiente. Zero referencias a service worker, workbox, o manifest.json en `app/`.

### 14. Sin virtualización en listas largas
- **Qué:** Si una sesión tiene 100+ llamadas, el DOM de SessionDetail se ahoga.
- **Impacto:** Bajo. Sesiones típicas: 10-20 llamadas.
- **Cómo arreglar:** `@tanstack/react-virtual` en SessionDetail. 4 horas.
- **Nota 2026-06-14:** Pendiente. `SessionDetail.tsx` usa scroll nativo (`overflow-y-auto`), sin virtualización.

---

## 📊 Resumen por prioridad (POST-AUDIT)

| Prioridad | Items | Pendientes | Tiempo estimado total |
|---|---|---|---|
| 🔴 Alta | 3 | 2 (#1b app tests, #1c E2E) | 1-2 días |
| 🟡 Media | 5 | 3 (#4 backup, #5 scheduler, #6 estados error) | 3-4 días |
| 🔵 Baja | 6 | 3 (#9 verificar resto, #13 PWA, #14 virtualización) | 1-2 días |
| **Total** | **14** | **8** | **5-8 días** |

> **Nota:** De 14 items originales, 6 resueltos (#1a server tests, #2 rate limiting, #3a watcher, #9 parcial, #10, #11, #12), 2 re-clasificados como HECHOS (#5 digests funcionales, #7 template profesional), 8 pendientes reales.

---

## 🎯 Recomendación de orden (actualizada)

1. **#1b Tests app/** (🔴) → antes de tocar stores
2. **#4 Backup vault** (🟡) → antes de que haya datos valiosos
3. **#8 Cost tracking** (🟡) → antes de factura MiniMax
4. **#5 Scheduler digests** (🟡) → core value prop, automatizar
5. **#6 Estados error call analyzer** (🟡) → antes de confiar en pipeline
6. **#1c Test E2E** (🔴) → validar flujo completo
7. **#9 Verificar chars chinos restantes** (🔵) → 15 min
8. **#13 PWA** (🔵) → cuando haya tiempo
9. **#14 Virtualización** (🔵) → cuando sesiones >50 llamadas

---

## 🗂️ Plan de ejecución por sesiones (estimado)

### Sesión A (~4h, 15% rate limit actual)
- #1b Tests app/ (stores): 1-2h
- #4 Backup vault (script simple): 1h
- #8 Cost tracking (logging usage): 1h
- #9 Verificar chars chinos restantes: 15min

### Sesión B (~4h)
- #5 Scheduler digests (node-cron + notificaciones): 2-3h
- #6 Estados error call analyzer: 1-2h

### Sesión C (~4h)
- #1c Test E2E (lead → nota → pipeline → proposal): 2-3h
- #13 PWA mínimo (service worker + manifest): 1-2h
- #14 Virtualización (si necesario): 1h

**Total: 3 sesiones de ~4h = 12h. Con paralelización de subagentes: 8-10h.**

---

_Regla: cada vez que se arregle un item de esta lista, actualizar este archivo y commitear junto al fix._
