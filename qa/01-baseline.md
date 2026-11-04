# Sprint 1 · QA · Entregable 1 — Baseline previo a la migración

Estado del sistema **antes** de la migración multi-local, para separar defectos que ya existían de regresiones introducidas durante el sprint.

| | |
|---|---|
| Fecha de la corrida oficial | 2026-11-04 11:35 (-05:00) · `runId` 20261104113513 |
| Commit | `17a2a79` "proyecto base" (sin multi-local: no existe `local_id` ni `X-Local-Id`) |
| Cambio local necesario | `store-backend/Dockerfile`: quitar CRLF de `mvnw` antes de ejecutarlo (ver §1) |
| Resultado | **58 casos · 49 pasaron · 9 fallaron** → 5 defectos previos (§4). Sin pérdida de datos ni fallas de integridad. |
| Evidencia | [evidencia/20261104113513/](evidencia/20261104113513/) — matriz en [resultados.md](evidencia/20261104113513/resultados.md) |

## 1. Entorno y cómo repetir el baseline

Requisitos: Docker Desktop y Node.js 18+ (Newman se ejecuta con `npx`, no hace falta instalarlo).

```powershell
# 1. Configurar secretos locales: crear .env en la raíz (DB_PASSWORD, JWT_SECRET, JWT_ISSUER,
#    SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD, SPRINGDOC_ENABLED, JPA_SHOW_SQL, CORS_ALLOWED_ORIGINS)
# 2. Levantar solo los servicios de la app (nginx-proxy y mysql no se usan en local)
docker compose up -d --build postgres redis backend frontend
# 3. Ejecutar el baseline
powershell -ExecutionPolicy Bypass -File qa\run-baseline.ps1
```

| Servicio | Contenedor | Acceso |
|---|---|---|
| Frontend Next.js 16 | `store-frontend` | http://localhost:3000 |
| API Spring Boot 4 (vía proxy de Next) | `store-backend` | http://localhost:3000/api |
| PostgreSQL 18 | `store-postgres` | `docker exec -it store-postgres psql -U postgres -d store_db` |
| Redis 7 | `store-redis` | interno |

**Defecto de entorno resuelto:** en Windows (`core.autocrlf=true`) `mvnw` se descarga con CRLF y el build del backend falla con `./mvnw: not found`. Se añadió `sed -i 's/\r$//' mvnw` en el Dockerfile. Debe integrarse por PR para que cualquiera pueda repetir el baseline.

**Repetibilidad:** cada corrida crea sus propios datos con sufijo `runId`, así que se puede repetir sin restaurar la BD. Se ejecutó 3 veces seguidas con las mismas 9 fallas (resultado determinista). El usuario, el rol y la configuración del superadmin vienen del `.env` y de los bootstraps del backend.

**Estado de la BD antes de la corrida oficial:** ya contenía los datos de 2 corridas exploratorias de la misma colección (2 ventas, 3 cajas…); ver [db-antes.txt](evidencia/20261104113513/db-antes.txt). Para un baseline desde cero: `docker compose down -v` (**borra la BD local**) y volver a levantar.

## 2. Checklist de regresión inicial

Colección Postman: [postman/KODA-baseline.postman_collection.json](postman/KODA-baseline.postman_collection.json) (generada desde [postman/build-collection.js](postman/build-collection.js)). Se puede importar en Postman junto con [postman/local.postman_environment.json](postman/local.postman_environment.json).

| Flujo (encargo §1.2) | Casos | Resultado |
|---|---|---|
| Acceso sin sesión y login | 001–004 | ✅ Pasa |
| Creación/edición de usuario y rol, búsqueda, paginación | 005–011 | ✅ Pasa |
| Usuario duplicado / inexistente | 012–013 | ❌ DEF-003, DEF-002 |
| Categoría: crear, detalle, editar, buscar, duplicado (409), inexistente (404) | 014–019 | ✅ Pasa |
| Producto, color, talla, variante, stock (+5), detalle, edición, búsqueda | 020–028 | ✅ Pasa |
| Producto inexistente | 029 | ❌ DEF-002 |
| Caja: crear, abrir con 100, estado, motivos de egreso | 030–033 | ✅ Pasa |
| Egreso contra el fondo inicial, antes de cualquier venta | 034 | ❌ DEF-005 |
| Venta 2 × 50, detalle, descuento de stock, **recibo PDF**, listado | 035–039 | ✅ Pasa (estado de la venta: `PAID`) |
| Egreso tras la venta y totales de caja (ventas 100, egresos 10, saldo 190) | 040–041 | ✅ Pasa |
| Cierre con 190 (diferencia 0), historial, venta con caja cerrada → 400 sin tocar stock | 042–045 | ✅ Pasa |
| Dashboard, PDF de productos, PDF de sesiones de caja, configuración | 046–049 | ✅ Pasa |
| Usuario ordinario: login y lectura permitida | 050–051 | ✅ Pasa |
| Usuario ordinario sin permiso: usuarios, crear categoría, configuración, dashboard | 052–055 | ❌ DEF-001 (se bloquea, pero con 400) |
| La categoría no autorizada no se creó (sin escritura parcial) | 056 | ✅ Pasa |
| Logout y sesión invalidada | 057–058 | ❌ DEF-004 en 058 |

**Fuera de este recorrido automático** (pendiente de hacerlo a mano en la UI, encargo §4.1): subida de imágenes de variante, logo y avatar; impresión directa ESC/POS; anulación de venta con reembolso automático; cambio de contraseña; flujo visual completo del POS.

## 3. Inventario de datos de prueba (corrida oficial)

Para probar consultas directas por ID. La lista completa está en [ids-de-prueba.json](evidencia/20261104113513/ids-de-prueba.json).

| Recurso | ID | Dato |
|---|---|---|
| Superadmin | user 1 | `admin@local.test` |
| Rol ordinario | role 4 | `QA_VENDEDOR_20261104113513`, permisos: orders.read/create, products.read, categories.read, cash.read/create |
| Usuario ordinario | user 4 | `qa.vendedor.20261104113513@local.test` / `Qa12345!` |
| Categoría | 3 | `QA Cat 20261104113513 Ed` |
| Color / talla | 3 / 3 | `QA Color …` / `QA-…` |
| Producto / variante | 3 / 3 | compra 20, venta 50; stock 10 → 15 → 13 |
| Caja física / sesión | 4 / 3 | apertura 100, cierre 190, diferencia 0 |
| Venta | 3 | 2 u. × 50 = 100, pago CASH |

**Local A / Local B:** no se pueden crear todavía porque el modelo no tiene locales. Cuando exista la migración, la colección se ampliará con un environment por local (usuario A, usuario B, superadmin con selección A/B) reutilizando estos mismos flujos.

### Conteos y totales de referencia

Generados con [sql/db-snapshot.sql](sql/db-snapshot.sql) (antes y después de cada corrida). La comparación posterior a la migración debe usar una instantánea tomada justo antes de migrar, no estos números.

| Indicador (después de la corrida oficial) | Filas | Suma |
|---|---|---|
| Ventas (`orders.total`) | 3 | 300.00 |
| Pagos | 3 | 300.00 |
| Ingresos de caja | 3 | 300.00 |
| Egresos de caja | 2 | 20.00 |
| Stock total de variantes | 3 | 39 |
| Saldo de cajas (`cash_register.balance`) | 4 | 280.00 |
| Referencias huérfanas (6 chequeos) | — | todas 0 |

## 4. Defectos preexistentes

Todos existen en el commit base `17a2a79`, así que **no son regresiones del sprint**. Varios bloquean la verificación del contrato de errores de la migración (`403`/`404`/`409`) y conviene corregirlos antes o junto con los PRs de seguridad.

| ID | Severidad | Caso | Descripción | Causa probable | Dueño sugerido |
|---|---|---|---|---|---|
| DEF-001 | **Alta** | 052–055 | Sin permiso se responde `400 "Access Denied"` en lugar de `403`. El acceso sí se bloquea (056 confirma que no hubo escritura). | `GlobalExceptionHandler.handleRuntimeException` captura `AccessDeniedException`/`AuthorizationDeniedException` (son `RuntimeException`) antes que Spring Security. | Backend 2 |
| DEF-002 | **Alta** | 013, 029 | Recurso inexistente devuelve `400 "… not found"` en usuarios y productos; categorías sí devuelven `404`. El contrato usa `404` para recursos de otro local, así que con este defecto no se puede distinguir. | `UserServiceImpl` / `ProductServiceImpl` lanzan `RuntimeException` en vez de `ResourceNotFoundException`. | Backend 2 |
| DEF-003 | Media | 012 | Email de usuario duplicado → `400 "User already exists"`; categorías sí devuelven `409`. | `UserServiceImpl:96` lanza `RuntimeException` en vez de `DuplicateResourceException`. | Backend 2 |
| DEF-004 | Media | 058 | `GET /auth/me` sin sesión → `400 "User not found"` en lugar de `401`. | `/auth/**` es `permitAll`; `AuthService.getCurrentUser` busca el usuario `anonymousUser`. | Backend 2 |
| DEF-005 | Media | 034 | Con la caja abierta con 100 y sin ventas, un egreso de 10 se rechaza con `400 "Insufficient cash balance"`. | `CashServiceImpl.createOutflow` valida contra `cash_register.balance` (acumula ventas − egresos de todas las sesiones y no incluye el fondo inicial), mientras que la sesión calcula `inicial + ventas − egresos`. Hay dos fuentes de saldo inconsistentes. | Backend 1 (caja) |

**Para el plan de migración (Backend 1):** `cash_register.balance` es un acumulado histórico de ventas − egresos (en la BD actual: 300 − 20 = 280) que ignora los fondos iniciales de las aperturas (3 × 100). En cambio, el saldo de cada sesión sí los incluye. Al repartir datos por local, conviene definir cuál de los dos saldos es la fuente de verdad antes de hacer el backfill.

## 5. Pendiente para cerrar el entregable 1

- [ ] Con Backend 1: acordar cómo se restaura la BD de ensayo desde una copia (encargo §1.3) y tomar la instantánea `db-snapshot.sql` sobre esa copia.
- [ ] Recorrido manual en la UI de los flujos de la sección 2 (capturas), sobre todo recibo/impresión.
- [ ] Integrar por PR el arreglo del Dockerfile (CRLF).
- [ ] Registrar DEF-001 a DEF-005 en el tablero del equipo con su dueño.
- [ ] Que otra persona ejecute `qa\run-baseline.ps1` en su equipo y confirme el mismo resultado (criterio de aceptación).
