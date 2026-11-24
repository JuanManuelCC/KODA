# G02 - Exporta los issues y el recorrido de cada uno (evidencia del informe de seguimiento).
# Genera en ..\ :
#   export_issues.json  - salida cruda de gh
#   export_issues.csv   - una fila por issue (número, ID, título, tipo, estado, fechas)
#   recorrido.md        - todas las transiciones comentadas, issue por issue
# Uso:  .\04_exportar.ps1 -Repo "iccoscco/KODA"
param([string]$Repo = "iccoscco/KODA")

$out = Join-Path $PSScriptRoot ".."
$json = gh issue list --repo $Repo --state all --limit 200 --json number,title,labels,state,createdAt,closedAt,url
$json | Out-File -Encoding utf8 (Join-Path $out "export_issues.json")

$issues = $json | ConvertFrom-Json
$issues | ForEach-Object {
  $labels = $_.labels.name
  [pscustomobject]@{
    numero    = $_.number
    id        = if ($_.title -match "^\[([A-Z]+-\d+)\]") { $Matches[1] } else { "" }
    titulo    = $_.title
    tipo      = ($labels | Where-Object { $_ -like "tipo:*" }) -join ";"
    estado    = ($labels | Where-Object { $_ -like "estado:*" }) -join ";"
    prioridad = ($labels | Where-Object { $_ -like "prioridad:*" }) -join ";"
    github    = $_.state
    creado    = $_.createdAt
    cerrado   = $_.closedAt
    url       = $_.url
  }
} | Sort-Object numero | Export-Csv -NoTypeInformation -Encoding UTF8 (Join-Path $out "export_issues.csv")

$md = @("# Recorrido de requisitos y cambios - ForjaSys", "", "Exportado: $(Get-Date -Format 'yyyy-MM-dd HH:mm')", "")
foreach ($i in ($issues | Sort-Object number)) {
  $md += "## #$($i.number) $($i.title)"
  $md += "Estado GitHub: $($i.state) - $($i.url)"
  $md += ""
  $c = (gh issue view $i.number --repo $Repo --json comments | ConvertFrom-Json).comments
  foreach ($k in $c) { $md += "- " + ($k.body -replace "`r?`n", " | ") }
  $md += ""
}
$md | Out-File -Encoding utf8 (Join-Path $out "recorrido.md")
Write-Output "Exportados $($issues.Count) issues en $out"
