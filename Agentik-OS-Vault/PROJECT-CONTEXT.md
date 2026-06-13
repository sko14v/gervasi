# Project Context — Agentik-OS-Vault

> Nota para futuros agentes que trabajen en este vault.
> `AGENTS.md` (raíz del vault) tiene reglas inquebrantables y solo Xisco lo modifica.
> Este archivo añade contexto operativo descubierto durante Fase 0 (2026-06-13).

## Stack verificado (2026-06-13)

- **Node.js:** v24.14.0 (en `C:\Python313\`)
- **Python:** 3.13.6 (en `C:\Python313\`)
- **Playwright Chromium:** 148.0.7778.96 (instalado en `C:\Users\xisco\OneDrive\Escritorio\GERVASI\agentik-os-app\packages\server\`, browsers en `%LOCALAPPDATA%\ms-playwright\`)
- **FFmpeg standalone:** ✅ 8.1.1-full_build instalado en `C:\Users\xisco\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.1-full_build\bin\`, PATH de usuario configurado. Playwright bundle trae ffmpeg-1011 adicional (suficiente para captura en navegador).
- **Caveman skill (juliusbrussee/caveman):** ✅ Instalado globalmente con `npx skills add juliusbrussee/caveman -y -g`. 7 sub-skills en `C:\Users\xisco\.agents\skills\`: `caveman`, `caveman-commit`, `caveman-compress`, `caveman-help`, `caveman-review`, `caveman-stats`, `cavecrew`.

## Graphify: fuente real

- **NO existe `graphify` en PyPI** (probado: error "No matching distribution").
- **El paquete real es `graphifyy`** (con doble y), instalable como `pip install graphifyy`.
- En la máquina de Xisco, está **pre-instalado como plugin de Gemini CLI** (editable install):
  - Ubicación: `C:\Users\xisco\.gemini\config\plugins\graphify\`
  - Top-level import: `graphify` (NO `graphifyy` — el dist-info declara `top_level.txt = "graphify"`)
  - API: `__getattr__` lazy con módulos `extract`, `build`, `cluster`, `analyze`, `report`, `export`
  - Para uso programático: `import sys; sys.path.insert(0, r'C:\Users\xisco\.gemini\config\plugins\graphify'); import graphify`
- **Decisión arquitectónica pendiente (Fase 1):** ¿invocar `graphify` como subprocess del CLI de Gemini, o como import Python directo?

## Historial de limpiezas

### 2026-06-13 (Fase 0)
- `01-IronMonkey/` (carpeta vieja) → movida a papelera; contenido (12 archivos) a `01-IronMonkeyCharter/_archive-2026-06-13/` con `_archivo-log.md`.
- `_archive-2026-06-13/` contiene 5 archivos con contenido real (~36 KB) que requieren revisión de Xisco antes de descartar.
- `00-Sistema/calendario-ejecucion.md` (vacío) → papelera.
- `index.md`: 2 menciones de LLMLingua2 reemplazadas por notas de retirada en v1 (alineado con `AGENTS.md` §4).
- Caracteres chinos corruptos corregidos en `00-Sistema/orquestacion.md` L165 y `00-Sistema/dashboards.md` L305.
- 4 carpetas creadas con `.gitkeep`: `01-IronMonkeyCharter/leads`, `01-IronMonkeyCharter/propuestas`, `02-GrowingInmobiliario/prospectos`, `03-Memoria/_logs`.
- `03-Memoria/_logs/log.md` inicial creado con timestamp 20:50.

## Convenciones de timestamp

Las entradas en `03-Memoria/_logs/log.md` y `01-IronMonkeyCharter/log.md` siguen el formato:

```
[YYYY-MM-DD HH:MM] [agente] [acción] [detalle]
```

Ejemplo: `[2026-06-13 20:50] [system] [init] Vault inicializado y limpiado.`

## Reglas operativas clave (resumen, ver `AGENTS.md` completo)

1. **NUNCA borrar archivos** — solo mover a `_archive/` o usar `mavis-trash` (papelera del SO).
2. **NUNCA contactar al cliente** — sin llamadas, emails, WhatsApp desde el sistema.
3. **NUNCA enviar PDFs/emails** sin validación explícita de Xisco.
4. **NUNCA modificar precios.**
5. **NUNCA inventar datos** que no estén en el vault.
6. **Toda acción que modifique estado se registra** en el archivo correspondiente + log.

## Negociós

- **Iron Monkey Charter** (`01-IronMonkeyCharter/`) — charter de barcos. Xisco contacta por teléfono, mete notas, sistema genera PDF y gestiona pipeline.
- **Growing Inmobiliario** (`02-GrowingInmobiliario/`) — SDR/cold calling para consultoría inmobiliaria. ICP: agencias con ≥10K EUR/mes en España. Target: 100 llamadas/día, 25 conversaciones, 3 agendas. Comisiones: 10€ agenda / 50€ show / 100€ cierre.

## Horarios

- Mañana: 09:00-12:00
- Tarde: 16:00-19:00
- Digest matutino: 08:00 (estado del día + FIPAs)
- Digest vespertino: 18:00 (KPIs del día)
- Grabación: 3-4 sesiones/día, 5 días/semana (L-V)

---

_Nota: este archivo es contexto de proyecto, modificable por cualquier agente para reflejar descubrimientos futuros. NO contiene reglas inquebrantables — esas viven en `AGENTS.md`._
