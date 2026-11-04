<#
  Baseline de regresión - Sprint 1 (07-qa-fullstack.md, entregable 1).

  Requisitos: Docker Desktop con la stack levantada y Node.js 18+ (Newman se ejecuta con npx).
    docker compose up -d --build postgres redis backend frontend

  Uso (desde la raíz del repo):
    powershell -ExecutionPolicy Bypass -File qa\run-baseline.ps1

  Deja la evidencia en qa\evidencia\<fecha-hora>\ :
    entorno.txt            commit, cambios locales, contenedores, imágenes, fecha
    db-antes.txt           conteos/totales/integridad antes de las pruebas
    newman-cli.txt         salida legible de la corrida
    newman-report.json     respuestas completas (evidencia por caso)
    newman-junit.xml       resultados para CI
    ids-de-prueba.json     IDs creados (inventario de datos de prueba)
    db-despues.txt         conteos/totales/integridad después
    resultados.md          matriz ID/actor/acción/esperado/real/estado
#>
$ErrorActionPreference = 'Stop'
$root   = Split-Path -Parent $PSScriptRoot
$runId  = Get-Date -Format 'yyyyMMddHHmmss'
$outDir = Join-Path $PSScriptRoot "evidencia\$runId"
New-Item -ItemType Directory -Force $outDir | Out-Null
Set-Location $root

function Save-DbSnapshot($file) {
  Get-Content -Raw "$PSScriptRoot\sql\db-snapshot.sql" |
    docker exec -i store-postgres psql -U postgres -d store_db -A -F ' | ' |
    Out-File -Encoding utf8 $file
}

# 1. Entorno
@(
  "Fecha (local): $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz')"
  "runId:         $runId"
  "Commit:        $(git rev-parse --short HEAD) - $(git log -1 --format=%s)"
  "Rama:          $(git rev-parse --abbrev-ref HEAD)"
  ''
  '== Cambios locales sin commit (git status --short)'
  (git status --short)
  ''
  '== Contenedores'
  (docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}')
  ''
  '== Imágenes de la app'
  (docker images --format 'table {{.Repository}}:{{.Tag}}\t{{.ID}}\t{{.CreatedAt}}' | Select-String 'koda|postgres|redis')
  ''
  "URL frontend: http://localhost:3000   API (vía proxy Next): http://localhost:3000/api"
) | Out-File -Encoding utf8 "$outDir\entorno.txt"

# 2. BD antes
Save-DbSnapshot "$outDir\db-antes.txt"

# 3. Generar colección y ejecutar Newman
node "$PSScriptRoot\postman\build-collection.js"
& npx.cmd -y newman@6.2.3 run "$PSScriptRoot\postman\KODA-baseline.postman_collection.json" `
  -e "$PSScriptRoot\postman\local.postman_environment.json" `
  --env-var "runId=$runId" --env-var "runIdFromCli=1" `
  --export-environment "$outDir\ids-de-prueba.json" `
  -r 'cli,json,junit' `
  --reporter-json-export "$outDir\newman-report.json" `
  --reporter-junit-export "$outDir\newman-junit.xml" `
  --color off | Tee-Object -FilePath "$outDir\newman-cli.txt"
$newmanExit = $LASTEXITCODE

# 4. BD después
Save-DbSnapshot "$outDir\db-despues.txt"

# 5. Matriz de resultados en Markdown
node "$PSScriptRoot\postman\report-to-md.js" $outDir

Write-Host ""
Write-Host "Evidencia en: $outDir"
Write-Host "Newman exit code: $newmanExit (0 = todos los asserts pasaron)"
exit $newmanExit
