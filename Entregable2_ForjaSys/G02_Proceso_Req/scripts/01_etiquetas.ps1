# G02 - Crea las etiquetas de estado y de tipo en el repositorio de GitHub.
# Uso:  .\01_etiquetas.ps1 -Repo "iccoscco/KODA"
param([string]$Repo = "iccoscco/KODA")

$etiquetas = @(
  @{ n = "estado:registrado";   c = "BFD4F2"; d = "Requisito o cambio recién registrado" },
  @{ n = "estado:analizado";    c = "C5DEF5"; d = "Con criterio de aceptación / análisis de impacto" },
  @{ n = "estado:aprobado";     c = "0E8A16"; d = "Aprobado: entra a la línea base" },
  @{ n = "estado:rechazado";    c = "B60205"; d = "Rechazado con sustento" },
  @{ n = "estado:implementado"; c = "FBCA04"; d = "Implementado y con commit en SVN" },
  @{ n = "estado:verificado";   c = "5319E7"; d = "Pruebas vinculadas en verde" },
  @{ n = "estado:cerrado";      c = "000000"; d = "Cerrado con evidencia" },
  @{ n = "tipo:requisito";      c = "1D76DB"; d = "Requisito funcional o no funcional de la ERS" },
  @{ n = "tipo:cambio";         c = "D93F0B"; d = "Solicitud de cambio (CC-xx)" },
  @{ n = "tipo:defecto";        c = "E99695"; d = "Defecto encontrado en pruebas" },
  @{ n = "prioridad:alta";      c = "B60205"; d = "Línea base" },
  @{ n = "prioridad:media";     c = "FBCA04"; d = "Margen ante cambios" }
)

foreach ($e in $etiquetas) {
  gh label create $e.n --repo $Repo --color $e.c --description $e.d --force
}
gh label list --repo $Repo --limit 100
