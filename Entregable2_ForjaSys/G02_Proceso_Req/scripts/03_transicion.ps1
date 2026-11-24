# G02 - Mueve un issue al siguiente estado: cambia la etiqueta estado:* y deja el comentario
#       con fecha, responsable y evidencia que pide la guía.
# Uso:
#   .\03_transicion.ps1 -Id RF-07 -Estado analizado -Responsable "Integrante B" -Evidencia "Criterio Dado/Cuando/Entonces en ERS v1.1, sección 3.2"
#   .\03_transicion.ps1 -Id RF-07 -Estado implementado -Responsable "Integrante A" -Evidencia "SVN r7: [RF-07] Validar stock al registrar venta"
#   .\03_transicion.ps1 -Id CC-02 -Estado rechazado -Responsable "Integrante B" -Evidencia "Fuera de alcance (Definición de alcance v0.1, sección 3)"
param(
  [Parameter(Mandatory)][string]$Id,
  [Parameter(Mandatory)][ValidateSet("analizado","aprobado","rechazado","implementado","verificado","cerrado")][string]$Estado,
  [Parameter(Mandatory)][string]$Responsable,
  [Parameter(Mandatory)][string]$Evidencia,
  [string]$Repo = "iccoscco/KODA"
)

$numeros = Get-Content (Join-Path $PSScriptRoot "..\issues\numeros.json") -Raw | ConvertFrom-Json
$n = $numeros.$Id
if (-not $n) { throw "No hay número de issue para $Id en numeros.json" }

$actuales = (gh issue view $n --repo $Repo --json labels | ConvertFrom-Json).labels.name |
            Where-Object { $_ -like "estado:*" }
$anterior = ($actuales -join ", ")
foreach ($a in $actuales) { gh issue edit $n --repo $Repo --remove-label $a | Out-Null }
gh issue edit $n --repo $Repo --add-label "estado:$Estado" | Out-Null

$fecha = Get-Date -Format "yyyy-MM-dd HH:mm"
$comentario = @"
**Transición:** $anterior → estado:$Estado
**Fecha:** $fecha
**Responsable:** $Responsable
**Evidencia:** $Evidencia
"@
gh issue comment $n --repo $Repo --body $comentario | Out-Null

# Mover la tarjeta en el tablero de GitHub Projects (campo "Estado")
$pj = Join-Path $PSScriptRoot "..\issues\proyecto.json"
if (Test-Path $pj) {
  $p = Get-Content $pj -Raw | ConvertFrom-Json
  $item = $p.items."$n"
  if ($item) {
    gh project item-edit --id $item --project-id $p.projectId --field-id $p.fieldId `
      --single-select-option-id $p.options.$Estado | Out-Null
  }
}

if ($Estado -eq "cerrado")   { gh issue close $n --repo $Repo --reason completed | Out-Null }
if ($Estado -eq "rechazado") { gh issue close $n --repo $Repo --reason "not planned" | Out-Null }

Write-Output "$Id (#$n): $anterior -> estado:$Estado"
