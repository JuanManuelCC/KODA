# G02 · Proceso de requerimientos (ForjaSys)

## Estado comprobado de la entrega (24-11-2026)

Los siete issues ya fueron creados en [`iccoscco/KODA`](https://github.com/iccoscco/KODA/issues): cinco requisitos (#1–#5), CC-01 (#6) y CC-02 (#7). El recorrido documentado está en `recorrido.md`; CC-02 está rechazado y cerrado. **No vuelvan a ejecutar `02_crear_issues.ps1`**, pues duplicaría las solicitudes. Las instrucciones de abajo explican cómo se preparó el material y cómo actualizarlo en un entorno nuevo.

CC-01 cuenta con una propuesta de código y prueba en la rama de integración. Véase `CC-01_trazabilidad.md` para el contrato, el caso límite y los pasos pendientes de verificación. No se debe etiquetar como `verificado` ni cerrar hasta que estén la evidencia de ejecución, la actualización de ERS/SDD y el registro de configuración exigido por G05.

## Qué hay aquí

| Archivo | Para qué |
|---|---|
| `Informe_G02_Proceso_Requerimientos.docx` | Informe de la guía (objetivo, herramienta, procedimiento, resultados, seguimiento, comparación con Jira, ficha). Lo resaltado en amarillo se completa con los datos reales. |
| `CC-01.docx` / `CC-02.docx` | Solicitudes de cambio con análisis de impacto (aprobada / rechazada) |
| `flujo_requerimientos.puml` / `flujo.png` | Diagrama de estados del proceso |
| `issues/*.md` | Cuerpo de los 7 issues (RF-04, RF-07, RF-08, RF-10, RF-12, CC-01, CC-02) |
| `scripts/*.ps1` | Crear etiquetas e issues, mover estados y exportar |
| `../../.github/ISSUE_TEMPLATE/` | Plantillas de issue: requisito, solicitud de cambio, defecto |

## Pasos (en este orden)

```powershell
# 0. Una vez: instalar y autenticar GitHub CLI (se necesita permiso de escritura en iccoscco/KODA)
winget install GitHub.cli
gh auth login
gh auth refresh -s project

# 1. Subir las plantillas al repo (rama main, para que GitHub las use)
git add .github/ISSUE_TEMPLATE && git commit -m "[G02] Plantillas de issue" && git push

cd Entregable2_ForjaSys/G02_Proceso_Req/scripts
# 2. Etiquetas
.\01_etiquetas.ps1
# 3. Issues (guarda los números en issues/numeros.json)
.\02_crear_issues.ps1
```

**4. Tablero (manual, 3 min):** en GitHub → Projects → New project → *Board* → nombre «ForjaSys — Requisitos». En el campo **Status** crear las opciones Registrado, Analizado, Aprobado, Rechazado, Implementado, Verificado, Cerrado. Añadir los 7 issues. Captura → `tablero.png`.

**5. Recorrido:** cada paso con evidencia real (cambiar también la columna en el tablero):

```powershell
.\03_transicion.ps1 -Id RF-07 -Estado analizado    -Responsable "Integrante B" -Evidencia "ERS v1.1 §3.2, criterio Dado/Cuando/Entonces"
.\03_transicion.ps1 -Id RF-07 -Estado aprobado     -Responsable "Integrante B" -Evidencia "Línea base ERS v1.1 aprobada por el cliente"
.\03_transicion.ps1 -Id RF-07 -Estado implementado -Responsable "Integrante A" -Evidencia "SVN r7 [RF-07] Validar stock al registrar venta"
.\03_transicion.ps1 -Id RF-07 -Estado verificado   -Responsable "Integrante C" -Evidencia "PU-01..05 OK (surefire), CP-04 OK"
.\03_transicion.ps1 -Id RF-07 -Estado cerrado      -Responsable "Integrante A" -Evidencia "Incluido en tags/v0.9.0"

.\03_transicion.ps1 -Id CC-02 -Estado analizado -Responsable "Integrante B" -Evidencia "CC-02.docx"
.\03_transicion.ps1 -Id CC-02 -Estado rechazado -Responsable "Integrante B" -Evidencia "Fuera de alcance: Definición de alcance v0.1 §3"
```

Solo avanzar un requisito hasta donde haya evidencia de verdad (RF-08 y RF-10 dependen del módulo SUNAT del integrante A).

```powershell
# 6. Exportar (genera export_issues.csv/json y recorrido.md en esta carpeta)
.\04_exportar.ps1
```

7. Completar lo resaltado en el informe y en CC-01/CC-02, y exportar el informe a PDF como `seguimiento.pdf`.
