# seed-leads-utf8.ps1
# Uses Out-File -Encoding utf8 (PS5: adds BOM, which is what we need for OneDrive FS to read correctly)
# All content in ASCII to avoid encoding roundtrip issues.

$dir = 'C:\Users\xisco\OneDrive\Escritorio\GERVASI\Agentik-OS-Vault\01-IronMonkeyCharter\leads'
if (!(Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }

# Borra lo viejo
Remove-Item -Path (Join-Path $dir 'IM-2026-*.md') -Force -ErrorAction SilentlyContinue
Start-Sleep -Milliseconds 500

function Write-Lead($id, $content) {
    $path = Join-Path $dir "$id.md"
    $content | Out-File -FilePath $path -Encoding utf8 -NoNewline
    Write-Host "wrote $id"
    Start-Sleep -Milliseconds 600
}

$content1 = @"
--- yaml
---
id: IM-2026-001
nombre: Maria Garcia
telefono: '+34 600 000 001'
email: maria@example.com
idioma: ES
origen: facebook
estado: cualificado
score: 8
sensacion: caliente
fecha_evento: 2026-07-15
personas: 10
tipo_evento: Day Charter - cumpleanos
presupuesto_min: 3000
presupuesto_max: 4500
servicios_mencionados:
  - catering
  - musica
created_at: 2026-06-10T10:00:00Z
updated_at: 2026-06-12T14:30:00Z
---

# Lead: Maria Garcia

## Notas
- Interesada en Day Charter para 10 personas
- Celebracion familiar (cumpleanos)
- Presupuesto entre 3K y 4.5K
- Quiere catering incluido
"@

# Use a more reliable method: build the file content as a string, then write
$files = @(
    @{
        id = 'IM-2026-001'
        body = @'
# Lead: Maria Garcia

## Notas
- Interesada en Day Charter para 10 personas
- Celebracion familiar (cumpleanos)
- Presupuesto entre 3K y 4.5K
- Quiere catering incluido
'@
        data = @{
            id = 'IM-2026-001'
            nombre = 'Maria Garcia'
            telefono = '+34 600 000 001'
            email = 'maria@example.com'
            idioma = 'ES'
            origen = 'facebook'
            estado = 'cualificado'
            score = 8
            sensacion = 'caliente'
            fecha_evento = '2026-07-15'
            personas = 10
            tipo_evento = 'Day Charter - cumpleanos'
            presupuesto_min = 3000
            presupuesto_max = 4500
            servicios_mencionados = @('catering', 'musica')
            created_at = '2026-06-10T10:00:00Z'
            updated_at = '2026-06-12T14:30:00Z'
        }
    }
    @{
        id = 'IM-2026-002'
        body = @'
# Lead: Carlos Ruiz

## Notas
- Empresa tecnologica, team building
- 25 personas, dia completo
- Presupuesto abierto
'@
        data = @{
            id = 'IM-2026-002'
            nombre = 'Carlos Ruiz'
            telefono = '+34 600 000 002'
            email = 'carlos@techco.example'
            idioma = 'ES'
            origen = 'referido'
            estado = 'propuesta_enviada'
            score = 7
            sensacion = 'caliente'
            fecha_evento = '2026-08-22'
            personas = 25
            tipo_evento = 'Team building'
            presupuesto_min = 6000
            presupuesto_max = 8000
            servicios_mencionados = @('barra libre', 'musica', 'catering')
            created_at = '2026-05-28T09:00:00Z'
            updated_at = '2026-06-11T16:00:00Z'
        }
    }
    @{
        id = 'IM-2026-003'
        body = @'
# Lead: Ana Lopez

## Notas
- Boda pequena, 30 personas, sunset
- Acepto el borrador pero lleva 6 dias sin confirmar
'@
        data = @{
            id = 'IM-2026-003'
            nombre = 'Ana Lopez'
            telefono = '+34 600 000 003'
            email = 'ana@example.com'
            idioma = 'ES'
            origen = 'web'
            estado = 'en_negociacion'
            score = 9
            sensacion = 'caliente'
            fecha_evento = '2026-09-05'
            personas = 30
            tipo_evento = 'Boda sunset'
            presupuesto_min = 8000
            presupuesto_max = 12000
            servicios_mencionados = @('catering premium', 'musica en vivo', 'barra libre')
            created_at = '2026-05-10T12:00:00Z'
            updated_at = '2026-06-06T18:00:00Z'
        }
    }
    @{
        id = 'IM-2026-004'
        body = @'
# Lead: Jordi Pons

## Notas
- Contactado por Facebook el lunes
- Pidio info general, sin urgencia
'@
        data = @{
            id = 'IM-2026-004'
            nombre = 'Jordi Pons'
            telefono = '+34 600 000 004'
            email = 'jordi@example.com'
            idioma = 'CAT'
            origen = 'facebook'
            estado = 'nuevo'
            score = 4
            sensacion = 'tibio'
            created_at = '2026-06-12T08:00:00Z'
            updated_at = '2026-06-12T08:00:00Z'
        }
    }
)

foreach ($lead in $files) {
    $yaml = '---' + "`n"
    foreach ($k in $lead.data.Keys) {
        $v = $lead.data[$k]
        if ($v -is [System.Array]) {
            $arr = ($v | ForEach-Object { '  - ' + $_ }) -join "`n"
            $yaml += "$k`:`n$arr`n"
        } else {
            $yaml += "$k`: $v`n"
        }
    }
    $yaml += '---' + "`n"
    $content = $yaml + "`n" + $lead.body + "`n"
    Write-Lead $lead.id $content
}

Write-Host "All 4 leads seeded (ASCII, Out-File utf8)"
