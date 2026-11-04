# QA — Sprint 1

| Archivo | Qué es |
|---|---|
| [01-baseline.md](01-baseline.md) | Entregable 1: entorno, checklist de regresión, datos de prueba y defectos previos |
| [run-baseline.ps1](run-baseline.ps1) | Ejecuta todo y guarda la evidencia en `evidencia/<fecha-hora>/` |
| [postman/build-collection.js](postman/build-collection.js) | Fuente de los casos `S1-QA-xxx`. Genera la colección |
| [postman/KODA-baseline.postman_collection.json](postman/KODA-baseline.postman_collection.json) | Colección importable en Postman |
| [postman/local.postman_environment.json](postman/local.postman_environment.json) | Environment local (URL y credenciales del `.env` de desarrollo) |
| [postman/report-to-md.js](postman/report-to-md.js) | Convierte el reporte de Newman en `resultados.md` |
| [sql/db-snapshot.sql](sql/db-snapshot.sql) | Conteos por tabla, totales de negocio e integridad referencial |

## Ejecutar

```powershell
docker compose up -d --build postgres redis backend frontend
powershell -ExecutionPolicy Bypass -File qa\run-baseline.ps1
```

El código de salida es `0` si todas las aserciones pasan. Hoy es `1` por los defectos previos DEF-001…005 (ver [01-baseline.md](01-baseline.md#4-defectos-preexistentes)).

## Añadir o cambiar casos

Edita `postman/build-collection.js` y ejecuta `node qa/postman/build-collection.js`. No edites el JSON a mano, porque se sobrescribe. Si prefieres trabajar en la interfaz de Postman, exporta la colección y avisa: a partir de ese momento el JSON pasa a ser la fuente.

## Desde Postman (sin Newman)

1. Usa Postman **Desktop** (la versión web no llega a `localhost` sin el Desktop Agent).
2. *Import* → arrastra `postman/KODA-baseline.postman_collection.json` y `postman/local.postman_environment.json`.
3. Selecciona el environment **KODA local (docker compose)** arriba a la derecha.
4. Abre la colección → *Run* → ejecuta todas las carpetas **en orden** (00 → 09). Los casos dependen de los IDs que crean los anteriores.
5. El caso S1-QA-001 genera solo un `runId` nuevo en cada corrida, así que se puede repetir sin tocar nada.

La sesión va en cookies: deja activado el cookie jar (viene activado por defecto). Si ejecutas un caso suelto, primero ejecuta S1-QA-003 (login) y los casos que crean los IDs que necesita.
