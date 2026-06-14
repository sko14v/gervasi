---
actualizado: 2026-06-14
version: 1.0
---

# Calendario de Ejecución — Agentik O.S.

> Cadencias documentadas en `orquestacion.md`. La app evalúa estas horas al abrirse (no usa cron del SO).

## Diario

### 08:00 — Daily Digest (ambos negocios)
| Negocio | Contenido |
|---------|-----------|
| Iron Monkey | Leads a contactar, ofertas a crear, follow-ups, no contesta >48h |
| Growing | FIPA: 3-5 insights del día anterior para aplicar hoy |

### 18:00 — Digest tarde (Growing)
| Negocio | Contenido |
|---------|-----------|
| Growing | Llamadas realizadas, score promedio, citas nuevas, top win, top improvement |

## Semanal

### Domingo 20:00 — Weekly Review
| Negocio | Contenido |
|---------|-----------|
| Ambos | Tendencias, top wins, top improvements, proyección |

## Triggers manuales (Xisco dispara)
| Acción | Negocio | Resultado |
|--------|---------|-----------|
| Subir nota | Iron Monkey | ICP procesa, score, estado, follow-ups |
| Botón "Generar oferta" | Iron Monkey | Proposal Generator crea PDF |
| Subir audio | Growing | Call Analyzer: chunking → transcripción → análisis → feedback |
| Marcar cita agendada | Growing | Ficha prospecto, estado `cita_agendada` |

## Notas
- Si Xisco no abre la app, los digestes pendientes se muestran al abrir.
- No hay notificaciones push si la app está cerrada (v1).

## Tags
- `#calendario`
- `#orquestacion`
