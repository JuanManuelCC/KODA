# G02 - Crea los 5 issues de requisito y las 2 solicitudes de cambio a partir de ..\issues\*.md
# Uso:  .\02_crear_issues.ps1 -Repo "iccoscco/KODA"
# Guarda el número de cada issue en ..\issues\numeros.json (lo usan los demás scripts).
param([string]$Repo = "iccoscco/KODA")

$dir = Join-Path $PSScriptRoot "..\issues"
$items = @(
  @{ id = "RF-04"; t = "[RF-04] Registrar entradas, salidas y ajustes de inventario"; l = "tipo:requisito,estado:registrado,prioridad:alta" },
  @{ id = "RF-07"; t = "[RF-07] Registrar venta con IGV y método de pago validando stock"; l = "tipo:requisito,estado:registrado,prioridad:alta" },
  @{ id = "RF-08"; t = "[RF-08] Emitir boleta o factura electrónica y enviarla a SUNAT"; l = "tipo:requisito,estado:registrado,prioridad:alta" },
  @{ id = "RF-10"; t = "[RF-10] Anular comprobante con nota de crédito y reponer stock"; l = "tipo:requisito,estado:registrado,prioridad:alta" },
  @{ id = "RF-12"; t = "[RF-12] Reporte consolidado de ventas e inventario valorizado"; l = "tipo:requisito,estado:registrado,prioridad:alta" },
  @{ id = "CC-01"; t = "[CC-01] Mostrar alerta de stock mínimo al registrar la venta"; l = "tipo:cambio,estado:registrado" },
  @{ id = "CC-02"; t = "[CC-02] Enviar el comprobante por WhatsApp"; l = "tipo:cambio,estado:registrado" }
)

$numeros = @{}
foreach ($i in $items) {
  $body = Join-Path $dir ($i.id + ".md")
  $url = gh issue create --repo $Repo --title $i.t --body-file $body --label $i.l
  Write-Output "$($i.id) -> $url"
  $numeros[$i.id] = [int]($url -split "/")[-1]
}
$numeros | ConvertTo-Json | Out-File -Encoding utf8 (Join-Path $dir "numeros.json")
