# Agentik O.S. — v1 local en marcha

> **Estado:** App funcional en `localhost`. Vault limpio, monorepo con backend + frontend + tipos compartidos, smoke test del backend pasado, datos seeded.

---

## Cómo arrancarlo

```powershell
# Terminal 1 — backend
$env:AGENTIK_VAULT_PATH = "C:\Users\xisco\OneDrive\Escritorio\GERVASI\Agentik-OS-Vault"
cd "C:\Users\xisco\OneDrive\Escritorio\GERVASI\agentik-os-app\packages\server"
npm run dev
# → http://localhost:3001  (health: GET /health)

# Terminal 2 — frontend
cd "C:\Users\xisco\OneDrive\Escritorio\GERVASI\agentik-os-app\packages\app"
npm run dev
# → http://localhost:5173  (proxy /api/* → :3001)
```

> **Importante:** el backend lee la ruta del vault de `process.env.AGENTIK_VAULT_PATH`. Si no se exporta, intenta deducirla y puede apuntar a una carpeta fantasma de OneDrive (caso visto en smoke test — exporta la env var siempre).

---

## Lo que está hecho (v1)

### Vault — `C:\Users\xisco\OneDrive\Escritorio\GERVASI\Agentik-OS-Vault\`

- ✅ Limpieza de inconsistencias (carpeta `01-IronMonkey/` archivada, LLMLingua2 retirado, caracteres chinos corregidos)
- ✅ Iron Monkey Charter: 9 archivos `.md` con datos reales de SV Iron Monkey
- ✅ Growing Inmobiliario: script canónico + scorecard COL-Analyser v3.1 (32 criterios) + objeciones + KPIs
- ✅ 4 leads seeded: María García (cualificado, 8, caliente), Carlos Ruiz (propuesta enviada, 7), Ana López (en negociación, 9), Jordi Pons (nuevo, 4)
- ✅ Carpeta `03-Memoria/_logs/log.md` con log inicial

### Monorepo — `C:\Users\xisco\OneDrive\Escritorio\GERVASI\agentik-os-app\`

- ✅ **Root:** workspaces npm, scripts dev/build/typecheck/check-health
- ✅ **`packages/shared`:** tipos TS (Lead, Llamada, Sesion, Prospecto, Digest) + zod schemas + constantes
- ✅ **`packages/server`** (Hono 4 + @hono/node-server + gray-matter): health, leads, graphify/reindex, vault service, error handler, logger
- ✅ **`packages/app`** (React 19 + Vite 6 + Tailwind 3.4 + Zustand + dnd-kit): AppShell, Sidebar, Topbar, HealthIndicator, 6 páginas, Pipeline Iron Monkey con drag & drop

### Smoke test pasado
- `GET /health` → 200 OK con vault_path, ffmpeg_available, graphify_available
- `GET /leads` → 4 leads con todos los campos del frontmatter
- Vault I/O: gray-matter lee .md correctamente

---

## Lo que está pendiente (no es v1)

Las 4 fases del plan original son las que faltan:

| Fase | Qué falta | Cuándo |
|---|---|---|
| **2 — Escritura + ICP** | LeadForm, NoteEditor, ICP Agent (M2.5), Graphify integrado, re-index automático | Cuando quieras seguir |
| **3 — Inteligencia** | Proposal Generator con Playwright, AudioUploader + FFmpeg + Gemini, Call Analyzer, Feedback Coach, FIPAs | Cuando quieras seguir |
| **4 — Polish** | Digests 08:00/18:00, dashboard Recharts, memory graph, dark mode, atajos de teclado, skills custom | Cuando quieras seguir |

---

## Hallazgos y decisiones de la implementación

1. **Graphify NO está en PyPI** — está como plugin de Gemini CLI en `~/.gemini/config/plugins/graphify/`. El wrapper en `services/graphify.service.ts` lo detecta y funciona (devuelve `available: true`).
2. **FFmpeg no instalado globalmente** — el sandbox de Playwright trae uno bundled que sirve para v1. Para producción hay que `winget install Gyan.FFmpeg`.
3. **Caveman skill ya está instalado globalmente** — no hace falta reinstalar.
4. **OneDrive duplica la ruta del vault** — por eso la env var `AGENTIK_VAULT_PATH` es **obligatoria** para el backend.
5. **Ruta del vault canonical:** `C:\Users\xisco\OneDrive\Escritorio\GERVASI\Agentik-OS-Vault\` (la que tiene los datos reales, no la que OneDrive crea en `C:\Users\xisco\OneDrive\Escritorio\Agentik-OS-Vault\`).

---

*Versión: 1.0 · Lanzada: 2026-06-13 · Equivalente al final de Fase 1 del plan original*
