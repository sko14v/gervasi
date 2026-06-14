# Deuda Técnica — Agentik O.S.

> Registro de deuda técnica pendiente. Items priorizados por impacto en el objetivo de negocio: **Xisco no pierde leads y mejora llamadas.**
> Última actualización: 2026-06-14

---

## 🔴 Alta — Arreglar antes de Fase 2

### 1. Test suite vacía
- **Qué:** Zero tests unitarios, zero tests de integración, zero tests E2E.
- **Por qué importa:** Cada fix que aplicamos (35+ archivos) se verificó solo con `typecheck`. Un refactor futuro puede romper sin aviso.
- **Cómo arreglar:**
  - [ ] Añadir Vitest a `packages/server` (tests de servicios: vault, minimax mock, pdf)
  - [ ] Añadir Vitest a `packages/app` (tests de stores: pipelineStore, sessionStore)
  - [ ] Test E2E mínimo: crear lead → guardar nota → mover en pipeline → generar proposal (mock)
- **Estimado:** 1-2 días

### 2. Sin rate limiting ni size limits en /agents/call-analyzer
- **Qué:** Endpoint multipart acepta audios de cualquier tamaño. Sin límite de requests/minuto.
- **Por qué importa:** Audio de 3h = ~200MB. 2 requests concurrentes = 400MB RAM + disco. Xisco puede bloquear su propio servidor sin querer.
- **Cómo arreglar:**
  - [ ] Añadir `hono-rate-limiter` o middleware custom: max 1 análisis cada 5 min
  - [ ] Limitar tamaño audio total a 500MB por request
  - [ ] Limitar chunks a 20 (evita sesiones de 8h)
- **Estimado:** 4-6 horas

### 3. Graphify no re-indexa automáticamente
- **Qué:** Re-index requiere POST manual o esperar 24h. Si Xisco edita un precio en el vault, los agentes ven datos stale.
- **Por qué importa:** Propuesta con precio viejo = Xisco pierde credibilidad con cliente.
- **Cómo arreglar:**
  - [ ] File watcher con `chokidar` en `packages/server` → reindex debounced 5s tras editar vault
  - [ ] O: timestamp de última modificación en cada .md, comparar con timestamp de índice
- **Estimado:** 1 día

---

## 🟡 Media — Arreglar durante Fase 2-3

### 4. No hay backup del vault
- **Qué:** Todo el conocimiento del sistema vive en archivos .md locales. Sin backup automático.
- **Por qué importa:** Disco roto / OneDrive sync falla / borrado accidental = pérdida total de datos.
- **Cómo arreglar:**
  - [ ] Script diario que copia `Agentik-OS-Vault/` a `Agentik-OS-Vault/_backup/YYYY-MM-DD/`
  - [ ] O: git commit automático cada noche con timestamp
  - [ ] O: zip a Dropbox/Google Drive (Xisco ya usa OneDrive, aprovechar versionado)
- **Estimado:** 4-8 horas

### 5. Digests 08:00/18:00 no implementados
- **Qué:** Endpoints `/digest/ironmonkey` y `/digest/growing` existen pero son placeholders (Fase 4 según comentarios).
- **Por qué importa:** El digest es el core value prop del sistema. Sin él, Xisco sigue revisando manualmente.
- **Cómo arreglar:**
  - [ ] Scheduler con `node-cron` en backend: 08:00 y 18:00
  - [ ] Iron Monkey digest: pipeline + alertas + acciones priorizadas
  - [ ] Growing digest: FIPAs del día anterior + KPIs
  - [ ] Web Notifications API en frontend para mostrar digest
- **Estimado:** 2-3 días

### 6. Call Analyzer cascada incompleta
- **Qué:** El flujo descrito en AGENTIK-OS.md (chunking → transcripción → análisis → feedback → FIPAs) tiene mocks en dev pero no se ha probado end-to-end con API keys reales.
- **Por qué importa:** Si MiniMax M3 o Gemini fallan en producción, todo el pipeline de Growing se para.
- **Cómo arreglar:**
  - [ ] Test E2E con audio real de 15 min
  - [ ] Manejo de errores por etapa: si transcribe falla, guardar estado "transcripción_error" y reintentar
  - [ ] Si análisis falla, guardar transcripción para re-análisis manual
  - [ ] Métricas de duración por etapa (logging)
- **Estimado:** 2-3 días

### 7. Proposal Generator sin template real
- **Qué:** `proposal-html.service.ts` genera HTML pero no se ha validado que el PDF resultante sea profesional.
- **Por qué importa:** Xisco envía el PDF al cliente. Si es feo, pierde la venta.
- **Cómo arreglar:**
  - [ ] Diseñar template HTML con CSS inline (no dependencias externas)
  - [ ] Preview en ProposalModal con react-pdf o iframe
  - [ ] Test de generación con 5 leads diferentes
- **Estimado:** 1-2 días

### 8. Sin métricas de coste real
- **Qué:** `minimax.service.ts` no loguea tokens usados por llamada. Imposible saber si el presupuesto de 62 EUR/mes es realista.
- **Por qué importa:** Si el coste real es 200 EUR/mes, Xisco necesita saberlo antes de la factura.
- **Cómo arreglar:**
  - [ ] Añadir `usage` logging (prompt_tokens, completion_tokens, total_tokens)
  - [ ] Dashboard de coste diario en frontend
  - [ ] Alerta si coste diario > 2 EUR (proyección > 60 EUR/mes)
- **Estimado:** 1 día

---

## 🔵 Baja — Nice to have

### 9. Caracteres chinos residuales en docs
- **Qué:** 6 archivos del vault tienen caracteres corruptos (`替换`, `剩余`, `早早`, etc.) restos de traducción automática.
- **Impacto:** Cosmético. No afecta parsing.
- **Cómo arreglar:** Buscar/reemplazar con sed/awk. 30 min.

### 10. `tsconfig.tsbuildinfo` en git
- **Qué:** Build artifacts comiteados. Ensucian diffs.
- **Impacto:** Nulo funcional.
- **Cómo arreglar:** Añadir a `.gitignore`. 5 min.

### 11. `graphify-out/` en git
- **Qué:** Cache de Graphify comiteada. Se regenera con reindex.
- **Impacto:** Nulo funcional. Aumenta tamaño del repo.
- **Cómo arreglar:** Añadir a `.gitignore` o mantener solo `manifest.json`. 10 min.

### 12. Scripts debug `test-*.ts` en src/
- **Qué:** `test-env.ts`, `test-path.ts`, `test-query.ts` en `packages/server/src/`.
- **Impacto:** Nulo. No se ejecutan en producción.
- **Cómo arreglar:** Mover a `scripts/` o eliminar. 15 min.

### 13. Sin PWA / Service Worker
- **Qué:** App es SPA web. No funciona offline. Notificaciones requieren pestaña abierta.
- **Impacto:** Bajo. Xisco usa en desktop con pestaña abierta.
- **Cómo arreglar:** Añadir SW mínimo para notificaciones push. 1 día.

### 14. Sin virtualización en listas largas
- **Qué:** Si una sesión tiene 100+ llamadas, el DOM de SessionDetail se ahoga.
- **Impacto:** Bajo. Sesiones típicas: 10-20 llamadas.
- **Cómo arreglar:** `@tanstack/react-virtual` en SessionDetail. 4 horas.

---

## 📊 Resumen por prioridad

| Prioridad | Items | Tiempo estimado total |
|---|---|---|
| 🔴 Alta | 3 | 2-3 días |
| 🟡 Media | 5 | 6-9 días |
| 🔵 Baja | 6 | 2-3 días |
| **Total** | **14** | **10-15 días** |

---

## 🎯 Recomendación de orden

1. **Test suite** (🔴) → antes de tocar cualquier agente real
2. **Rate limiting call-analyzer** (🔴) → antes de que Xisco suba audio real
3. **Graphify auto-reindex** (🔴) → antes de que Xisco edite precios
4. **Digests** (🟡) → core value prop, hacerlo pronto
5. **Backup vault** (🟡) → antes de que haya datos valiosos
6. **Call Analyzer E2E** (🟡) → antes de confiar en el pipeline
7. **Proposal template** (🟡) → antes de enviar primer PDF a cliente
8. **Cost tracking** (🟡) → antes de factura MiniMax
9. Resto (🔵) → cuando haya tiempo

---

_Regla: cada vez que se arregle un item de esta lista, actualizar este archivo y commitear junto al fix._
