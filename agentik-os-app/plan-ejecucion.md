# Plan de ejecución — Fase 0 (limpieza del vault e instalación de dependencias)

> Generado: 2026-06-13 20:55
> Agente: general (branch session `mvs_a65a0ef498c44197a9adb354b5401610`)
> Plan: `plan_bd7c989b` — tarea `f0-vault-cleanup`

---

## Resumen ejecutivo

Fase 0 completada en su mayoría. Vault limpio, dependencias críticas instaladas, dos pasos bloqueados por permisos del usuario (FFmpeg standalone + Caveman skill) — se documentan como pasos manuales a continuación.

**Resultado:** 10 de 12 pasos completados. 2 pasos pendientes de confirmación manual del usuario.

---

## Pasos completados (10/12)

### ✅ Step 1 — Carpeta vieja `01-IronMonkey/` eliminada

- **Hallazgo:** la carpeta NO estaba vacía. Contenía 12 archivos (5 con contenido real, 7 vacíos) + 3 subcarpetas vacías.
- **Acción:** se movieron los 12 archivos a `01-IronMonkeyCharter/_archive-2026-06-13/` con un log detallado en `_archivo-log.md`.
- **Eliminación:** carpeta movida a la papelera con `mavis-trash` (recuperable).
- **Pendiente para Xisco:** revisar los 5 archivos con contenido (~36 KB) y decidir si mergear a `01-IronMonkeyCharter/` o descartar.

### ✅ Step 2 — LLMLingua2 limpiado de `index.md`

- **Menciones encontradas:** 2 (líneas 24 y 109)
- **Reemplazo aplicado:**
  - L24 (tabla de stack): `**Compresión input** | LLMLingua2 | 5x por defecto, 2x para propuestas formales` → `**Compresión input** | _(eliminada en v1)_ | LLMLingua2 retirada: no compensa vs. M3 nativo con Graphify como contexto curado`
  - L109 (tabla de comandos): `LLMLingua2 | Se aplica automáticamente (5x) antes de cada llamada a MiniMax` → `_(LLMLingua2)_ | _(retirada en v1 — ver nota en sección 2)_`
- **Consistencia:** AGENTS.md §4 ya decía "Sin LLMLingua2 en v1" — el cambio alinea `index.md` con la fuente de verdad operativa.

### ✅ Step 3 — `calendario-ejecucion.md` eliminado

- **Hallazgo:** archivo de 0 bytes (vacío).
- **Acción:** movido a la papelera con `mavis-trash`. No fue necesario archivarlo en `04-Conocimiento/guias-agentes/` (no tenía contenido).
- **Riesgo:** ninguno — `orquestacion.md` ya contiene las cadencias operativas.

### ✅ Step 4 — Caracteres chinos corregidos

- **Hallazgos:**
  - `00-Sistema/orquestacion.md` línea 165: `se积en` (caracteres `积` insertados en español)
  - `00-Sistema/dashboards.md` línea 305: `,考虑` (caracteres `考虑` insertados en español)
- **Corrección:**
  - L165: `ni se积en en un .md` → `ni se acumulan en un .md`
  - L305: `,考虑 indexar con Graphify` → `, considerar indexar con Graphify`
- **Verificación:** búsqueda regex `[\u4e00-\u9fff]+` en ambos archivos → 0 resultados.

### ✅ Step 5 — 4 carpetas creadas con `.gitkeep`

```
01-IronMonkeyCharter/leads/.gitkeep         (nueva)
01-IronMonkeyCharter/propuestas/.gitkeep    (nueva)
02-GrowingInmobiliario/prospectos/.gitkeep  (nueva)
03-Memoria/_logs/.gitkeep                   (nueva)
```

### ✅ Step 6 — `03-Memoria/_logs/log.md` inicial creado

- Timestamp usado: `20:50` (hora de creación del archivo).
- Contenido: cabecera + entrada inicial del sistema.

### ✅ Step 8 — Node.js y Python verificados

- **Node.js:** v24.14.0 (≥ 20 ✓)
- **Python:** 3.13.6 (≥ 3.10 ✓)

### ✅ Step 9 — Playwright Chromium instalado

- Carpeta creada: `C:\Users\xisco\OneDrive\Escritorio\GERVASI\agentik-os-app\packages\server\`
- `npm init -y` → `package.json` con `"type": "commonjs"`
- `npm install -D playwright` → 3 paquetes añadidos, 0 vulnerabilidades
- `npx playwright install chromium` → instaló:
  - Chromium 148.0.7778.96 (chromium-headless-shell v1223)
  - **FFmpeg v1011** (de Playwright) — `C:\Users\xisco\AppData\Local\ms-playwright\ffmpeg-1011`
  - Winldd v1007
- **Nota importante:** Playwright trae su propio FFmpeg. Esto mitiga el bloqueo del step 7 para captura de audio/video dentro del navegador.

### ✅ Step 10 — Graphify: nombre real verificado

- **PyPI:** `graphify` no existe (`No matching distribution found`).
- **Variantes probadas:** `graphifyy` ✓ (existe), `graphify-py` ✗, `knowledge-graphify` ✗.
- **Hallazgo clave:** `graphifyy` está **ya instalado** como plugin de Gemini CLI en `C:\Users\xisco\.gemini\config\plugins\graphify\` (editable install).
- **Top-level import:** `graphify` (no `graphifyy`) — el dist-info declara `top_level.txt = "graphify"`.
- **Verificación:** `import graphify` funciona con `PYTHONPATH=C:\Users\xisco\.gemini\config\plugins\graphify`. El módulo usa `__getattr__` lazy para `extract`, `build`, `cluster`, `analyze`, `report`, `export`, etc.
- **Decisión:** NO instalar nada nuevo. Para uso programático futuro, añadir `PYTHONPATH=C:\Users\xisco\.gemini\config\plugins\graphify` o instalarlo formalmente con `pip install -e C:\Users\xisco\.gemini\config\plugins\graphify`.

---

## Pasos bloqueados (2/12)

### ⚠️ Step 7 — FFmpeg standalone NO instalado

- **Estado:** comando requiere confirmación explícita del usuario (instalación de paquete externo vía winget).
- **Mitigación parcial:** Playwright bundle ya incluye ffmpeg v1011 (suficiente para captura en navegador, NO para conversión genérica de audio).
- **Para Xisco, ejecutar uno de:**
  ```powershell
  # Opción 1: winget
  winget install Gyan.FFmpeg --accept-package-agreements --accept-source-agreements

  # Opción 2: choco
  choco install ffmpeg -y

  # Opción 3: manual
  # Descargar release de https://www.gyan.dev/ffmpeg/builds/
  # Extraer y añadir al PATH
  ```
- **Verificación:** `ffmpeg -version`

### ⚠️ Step 11 — Caveman skill NO instalado

- **Estado:** `npx skills add juliusbrussee/caveman` requiere confirmación (instala código de repo GitHub externo).
- **Hallazgo:** `npx skills` SÍ está disponible; el repo `juliusbrussee/caveman` tiene 7 skills. La instalación sin `-y -g` es interactiva (pide seleccionar skills).
- **Para Xisco, ejecutar:**
  ```bash
  npx skills add juliusbrussee/caveman -y -g
  ```
  O sin `-g` para instalar local en el monorepo.
- **Verificación:** revisar `~/.mavis/skills/` o `C:\Users\xisco\OneDrive\Escritorio\GERVASI\agentik-os-app\.skills\`

---

## Comandos de verificación (resumen)

```powershell
# Vault
Test-Path "C:\Users\xisco\OneDrive\Escritorio\GERVASI\Agentik-OS-Vault\01-IronMonkey"   # debe ser False
Get-Content "C:\Users\xisco\OneDrive\Escritorio\GERVASI\Agentik-OS-Vault\index.md" | Select-String "LLMLingua2"   # solo notas de retirada
Test-Path "C:\Users\xisco\OneDrive\Escritorio\GERVASI\Agentik-OS-Vault\00-Sistema\calendario-ejecucion.md"   # debe ser False
Select-String -Path "C:\Users\xisco\OneDrive\Escritorio\GERVASI\Agentik-OS-Vault\00-Sistema\*.md" -Pattern "[\u4e00-\u9fff]+"   # debe estar vacío
Test-Path "C:\Users\xisco\OneDrive\Escritorio\GERVASI\Agentik-OS-Vault\01-IronMonkeyCharter\leads\.gitkeep"   # debe ser True

# Dependencias
node --version          # v24.14.0
python --version        # 3.13.6
ffmpeg -version         # (pendiente — bloqueado)
npx playwright --version   # debería funcionar vía C:\Users\xisco\OneDrive\Escritorio\GERVASI\agentik-os-app\packages\server

# Graphify
python -c "import sys; sys.path.insert(0, r'C:\Users\xisco\.gemini\config\plugins\graphify'); import graphify; print('OK')"
```

---

## Archivos modificados o creados (resumen)

**Vault (`C:\Users\xisco\OneDrive\Escritorio\GERVASI\Agentik-OS-Vault\`):**
- Modificado: `index.md` (2 menciones LLMLingua2 → notas de retirada)
- Modificado: `00-Sistema/orquestacion.md` (1 frase con caracteres chinos corregida)
- Modificado: `00-Sistema/dashboards.md` (1 frase con caracteres chinos corregida)
- Movido a papelera: `01-IronMonkey/` (12 archivos → `_archive-2026-06-13/`)
- Movido a papelera: `00-Sistema/calendario-ejecucion.md` (vacío)
- Creado: `01-IronMonkeyCharter/_archive-2026-06-13/_archivo-log.md`
- Creado: `01-IronMonkeyCharter/leads/.gitkeep`
- Creado: `01-IronMonkeyCharter/propuestas/.gitkeep`
- Creado: `02-GrowingInmobiliario/prospectos/.gitkeep`
- Creado: `03-Memoria/_logs/.gitkeep`
- Creado: `03-Memoria/_logs/log.md`

**Monorepo (`C:\Users\xisco\OneDrive\Escritorio\GERVASI\agentik-os-app\`):**
- Creado: `packages/server/package.json` (npm init)
- Creado: `packages/server/package-lock.json`
- Creado: `packages/server/node_modules/` (playwright + transitivas)
- Creado: `plan-ejecucion.md` (este archivo)

**Sistema (verificar manualmente):**
- FFmpeg standalone: NO instalado
- Caveman skill: NO instalado
- Playwright Chromium 148.0.7778.96: instalado en `C:\Users\xisco\AppData\Local\ms-playwright\`
- Playwright FFmpeg v1011: instalado (mitigación parcial para Step 7)
- Winldd v1007: instalado

---

## Notas y riesgos para el siguiente ciclo

1. **Xisco debe revisar `_archive-2026-06-13/`** — hay 5 archivos con contenido real (~36 KB) que podrían tener valor si la migración a `01-IronMonkeyCharter/` fue incompleta.
2. **FFmpeg standalone sigue pendiente** — necesario para conversión de audio (MP3→WAV, etc.) fuera del navegador. Si la app usa Playwright para procesar audios subidos, el ffmpeg bundled es suficiente; si no, se necesita la instalación global.
3. **Caveman skill pendiente** — la skill ya está disponible en Mavis (en `available_skills`), pero la versión `juliusbrussee/caveman` de GitHub es una implementación distinta para `npx skills`. Si Xisco quiere esa variante, debe instalarla manualmente.
4. **Graphify como plugin de Gemini CLI** — la decisión arquitectónica importante es si el `graphify` del vault se usará el plugin de Gemini (top-level `graphify`, instalado en `~/.gemini/config/plugins/graphify/`) o si se construirá/adoptará una alternativa. Esto afecta al `app-arquitectura.md` y `orquestacion.md` en la Fase 1.
5. **`agents.md` del proyecto (`AGENTS.md`) confirma que el sistema NUNCA borra archivos** — esta tarea respetó esa regla usando `mavis-trash` (papelera del SO) en vez de `Remove-Item`. Los archivos están recuperables.

---

_Generado por el agente general. Plan ID: `plan_bd7c989b`. Tarea: `f0-vault-cleanup`._
