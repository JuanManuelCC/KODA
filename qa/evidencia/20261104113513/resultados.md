# Resultados de la corrida 20261104113513

Inicio (UTC): 2026-11-04T16:35:16.969Z · Casos: 58 · Pasaron: 49 · Fallaron: 9

Evidencia completa por caso (petición y respuesta): `newman-report.json` en esta carpeta.

| ID | Actor | Caso | Acción (HTTP) | Esperado | Real | Estado |
|---|---|---|---|---|---|---|
| S1-QA-001 | anónimo | Listar usuarios sin sesión | `GET /api/users` | HTTP 401 | 401 "Invalid credentials" | Pasó |
| S1-QA-002 | anónimo | Login con contraseña incorrecta | `POST /api/auth/login` | HTTP 401 | 401 "Invalid credentials" | Pasó |
| S1-QA-003 | superadmin | Login superadmin | `POST /api/auth/login` | HTTP 200 | 200 | Pasó |
| S1-QA-004 | superadmin | Usuario actual (/auth/me) | `GET /api/auth/me` | HTTP 200 | 200 | Pasó |
| S1-QA-005 | superadmin | Permisos agrupados por módulo | `GET /api/roles/permissions/group` | HTTP 200 | 200 | Pasó |
| S1-QA-006 | superadmin | Crear rol vendedor de prueba | `POST /api/roles` | HTTP 200/201 | 201 | Pasó |
| S1-QA-007 | superadmin | Crear usuario ordinario | `POST /api/users` | HTTP 200/201 | 201 | Pasó |
| S1-QA-008 | superadmin | Detalle de usuario por ID | `GET /api/users/4` | HTTP 200 | 200 | Pasó |
| S1-QA-009 | superadmin | Editar usuario | `PUT /api/users/4` | HTTP 200 | 200 | Pasó |
| S1-QA-010 | superadmin | Buscar usuario por email | `GET /api/users?search=qa.vendedor.20261104113513&limit=10&offset=0` | HTTP 200 | 200 | Pasó |
| S1-QA-011 | superadmin | Paginación de usuarios (limit=1) | `GET /api/users?limit=1&offset=0` | HTTP 200 | 200 | Pasó |
| S1-QA-012 | superadmin | Crear usuario con email duplicado | `POST /api/users` | HTTP 409 (duplicado); no crea registro | 400 "User already exists" | **Falló** (S1-QA-012 HTTP esperado 409 (real 400)) |
| S1-QA-013 | superadmin | Detalle de usuario inexistente | `GET /api/users/999999` | HTTP 404 | 400 "User not found" | **Falló** (S1-QA-013 HTTP esperado 404 (real 400)) |
| S1-QA-014 | superadmin | Crear categoría | `POST /api/categories` | HTTP 200/201 | 201 | Pasó |
| S1-QA-015 | superadmin | Detalle de categoría por ID | `GET /api/categories/3` | HTTP 200 | 200 | Pasó |
| S1-QA-016 | superadmin | Editar categoría | `PUT /api/categories/3` | HTTP 200 | 200 | Pasó |
| S1-QA-017 | superadmin | Buscar categoría | `GET /api/categories?search=QA%20Cat%2020261104113513&limit=10&offset=0` | HTTP 200 | 200 | Pasó |
| S1-QA-018 | superadmin | Crear categoría duplicada | `POST /api/categories` | HTTP 409 | 409 "Category QA Cat 20261104113513 Ed already exists" | Pasó |
| S1-QA-019 | superadmin | Detalle de categoría inexistente | `GET /api/categories/999999` | HTTP 404 | 404 "Category not found with id: 999999" | Pasó |
| S1-QA-020 | superadmin | Crear color | `POST /api/colors` | HTTP 200/201 | 201 | Pasó |
| S1-QA-021 | superadmin | Crear talla | `POST /api/sizes` | HTTP 200/201 | 201 | Pasó |
| S1-QA-022 | superadmin | Crear producto | `POST /api/products` | HTTP 200/201 | 201 | Pasó |
| S1-QA-023 | superadmin | Crear variante con stock 10 | `POST /api/product-variants` | HTTP 200/201 | 201 | Pasó |
| S1-QA-024 | superadmin | Agregar 5 unidades de stock | `PUT /api/product-variants/3/stock/add?quantity=5` | HTTP 200 | 200 | Pasó |
| S1-QA-025 | superadmin | Detalle de variante por ID | `GET /api/product-variants/3` | HTTP 200 | 200 | Pasó |
| S1-QA-026 | superadmin | Detalle de producto por ID | `GET /api/products/3` | HTTP 200 | 200 | Pasó |
| S1-QA-027 | superadmin | Editar producto | `PUT /api/products/3` | HTTP 200 | 200 | Pasó |
| S1-QA-028 | superadmin | Buscar producto | `GET /api/products?search=QA%20Producto%2020261104113513&limit=10&offset=0` | HTTP 200 | 200 | Pasó |
| S1-QA-029 | superadmin | Detalle de producto inexistente | `GET /api/products/999999` | HTTP 404 | 400 "Product not found" | **Falló** (S1-QA-029 HTTP esperado 404 (real 400)) |
| S1-QA-030 | superadmin | Crear caja física | `POST /api/cash/registers` | HTTP 200/201 | 201 | Pasó |
| S1-QA-031 | superadmin | Abrir caja con 100 | `POST /api/cash/opening/open` | HTTP 200/201 | 201 | Pasó |
| S1-QA-032 | superadmin | Estado de caja abierta | `GET /api/cash/opening/status?cashRegisterId=4` | HTTP 200 | 200 | Pasó |
| S1-QA-033 | superadmin | Listar motivos de egreso | `GET /api/cash/outflow-reasons` | HTTP 200 | 200 | Pasó |
| S1-QA-034 | superadmin | Egreso de 10 contra el fondo inicial (sin ventas aún) | `POST /api/cash/outflows` | HTTP 200/201: la caja tiene 100 de fondo inicial, un egreso de 10 debe aceptarse | 400 "Insufficient cash balance" | **Falló** (S1-QA-034 HTTP esperado 200/201 (real 400)) |
| S1-QA-035 | superadmin | Crear venta: 2 u. x 50 en efectivo | `POST /api/orders` | HTTP 200/201 | 201 | Pasó |
| S1-QA-036 | superadmin | Detalle de venta por ID | `GET /api/orders/3` | HTTP 200 | 200 | Pasó |
| S1-QA-037 | superadmin | Stock descontado tras la venta | `GET /api/product-variants/3` | HTTP 200 | 200 | Pasó |
| S1-QA-038 | superadmin | Recibo PDF de la venta | `GET /api/orders/3/receipt` | HTTP 200 | 200 | Pasó |
| S1-QA-039 | superadmin | Listado de ventas con paginación | `GET /api/orders?limit=10&offset=0` | HTTP 200 | 200 | Pasó |
| S1-QA-040 | superadmin | Egreso de 10 después de la venta | `POST /api/cash/outflows` | HTTP 200/201 | 201 | Pasó |
| S1-QA-041 | superadmin | Totales de la caja tras venta y egresos | `GET /api/cash/opening/status?cashRegisterId=4` | ventas 100, egresos = suma de egresos aceptados, saldo = 100 + 100 − egresos | 200 | Pasó |
| S1-QA-042 | superadmin | Cerrar caja con el monto esperado contado | `POST /api/cash/opening/close` | HTTP 200; saldo sistema = monto contado; diferencia 0 | 200 | Pasó |
| S1-QA-043 | superadmin | Historial de la caja | `GET /api/cash/opening/history?cashRegisterId=4&limit=10&offset=0` | HTTP 200 | 200 | Pasó |
| S1-QA-044 | superadmin | Vender con la caja cerrada | `POST /api/orders` | HTTP 400; no crea venta ni descuenta stock | 400 "La caja seleccionada no tiene una sesión abierta" | Pasó |
| S1-QA-045 | superadmin | Stock sin cambios tras venta rechazada | `GET /api/product-variants/3` | HTTP 200 | 200 | Pasó |
| S1-QA-046 | superadmin | Resumen del dashboard | `GET /api/dashboard/summary` | HTTP 200 | 200 | Pasó |
| S1-QA-047 | superadmin | Reporte de productos en PDF | `GET /api/reports/products/pdf` | HTTP 200 | 200 | Pasó |
| S1-QA-048 | superadmin | Reporte de sesiones de caja en PDF | `GET /api/reports/cash-sessions/pdf` | HTTP 200 | 200 | Pasó |
| S1-QA-049 | superadmin | Configuración de la tienda | `GET /api/store-config` | HTTP 200 | 200 | Pasó |
| S1-QA-050 | usuario ordinario | Login usuario ordinario | `POST /api/auth/login` | HTTP 200 | 200 | Pasó |
| S1-QA-051 | usuario ordinario | Listar productos (permitido) | `GET /api/products?limit=5&offset=0` | HTTP 200 | 200 | Pasó |
| S1-QA-052 | usuario ordinario | Listar usuarios (sin permiso) | `GET /api/users` | HTTP 403 | 400 "Access Denied" | **Falló** (S1-QA-052 HTTP esperado 403 (real 400)) |
| S1-QA-053 | usuario ordinario | Crear categoría (sin permiso) | `POST /api/categories` | HTTP 403 | 400 "Access Denied" | **Falló** (S1-QA-053 HTTP esperado 403 (real 400)) |
| S1-QA-054 | usuario ordinario | Ver configuración (sin permiso) | `GET /api/store-config` | HTTP 403 | 400 "Access Denied" | **Falló** (S1-QA-054 HTTP esperado 403 (real 400)) |
| S1-QA-055 | usuario ordinario | Ver dashboard (sin permiso) | `GET /api/dashboard/summary` | HTTP 403 | 400 "Access Denied" | **Falló** (S1-QA-055 HTTP esperado 403 (real 400)) |
| S1-QA-056 | usuario ordinario | Categoría sin permiso no se creó | `GET /api/categories?search=No%20debe%20crearse%2020261104113513&limit=10&offset=0` | HTTP 200 | 200 | Pasó |
| S1-QA-057 | usuario ordinario | Logout | `POST /api/auth/logout` | HTTP 200 | 200 "Session successfully closed" | Pasó |
| S1-QA-058 | anónimo | Sesión invalidada tras logout | `GET /api/auth/me` | HTTP 401 | 400 "User not found" | **Falló** (S1-QA-058 HTTP esperado 401 (real 400)) |
