// Genera KODA-baseline.postman_collection.json (Postman v2.1).
// Uso: node qa/postman/build-collection.js
// Los casos se escriben aquí como funciones JS reales (con verificación de sintaxis);
// la colección generada se puede importar en Postman o ejecutar con Newman.
const fs = require('fs');
const path = require('path');

// Extrae el cuerpo de una función para usarlo como script de Postman.
const body = (fn) => {
  const src = fn.toString();
  return src.slice(src.indexOf('{') + 1, src.lastIndexOf('}')).split('\n');
};

let seq = 0;
const nextId = () => `S1-QA-${String(++seq).padStart(3, '0')}`;

/**
 * @param {string} name     descripción corta del caso
 * @param {string} method   verbo HTTP
 * @param {string} url      path relativo a {{baseUrl}} (puede incluir query y variables)
 * @param {object} o        { expect: number|number[], body?: object, actor?: string, test?: fn, pre?: fn, expected?: string }
 */
function req(name, method, url, o) {
  const id = nextId();
  const exps = [].concat(o.expect);
  const statusTest = `pm.test("${id} HTTP esperado ${exps.join('/')} (real " + pm.response.code + ")", () => pm.expect(pm.response.code).to.be.oneOf(${JSON.stringify(exps)}));`;
  const events = [{ listen: 'test', script: { type: 'text/javascript', exec: [statusTest, ...(o.test ? body(o.test) : [])] } }];
  if (o.pre) events.push({ listen: 'prerequest', script: { type: 'text/javascript', exec: body(o.pre) } });
  const [p, q] = url.split('?');
  const item = {
    name: `${id} · ${name}`,
    event: events,
    request: {
      method,
      header: o.body ? [{ key: 'Content-Type', value: 'application/json' }] : [],
      url: {
        raw: `{{baseUrl}}${url}`,
        host: ['{{baseUrl}}'],
        path: p.split('/').filter(Boolean),
        ...(q ? { query: q.split('&').map((kv) => { const [key, ...v] = kv.split('='); return { key, value: v.join('=') }; }) } : {}),
      },
      description: `**Actor:** ${o.actor || 'superadmin'}\n\n**Esperado:** ${o.expected || 'HTTP ' + exps.join('/')}`,
    },
  };
  if (o.body) item.request.body = { mode: 'raw', raw: JSON.stringify(o.body, null, 2), options: { raw: { language: 'json' } } };
  return item;
}

const folder = (name, items) => ({ name, item: items });

const items = [
  folder('00 Sin sesión', [
    req('Listar usuarios sin sesión', 'GET', '/users', {
      actor: 'anónimo', expect: 401,
      // En Postman se genera un runId nuevo por corrida; con Newman lo fija run-baseline.ps1.
      pre() {
        if (!pm.environment.get('runIdFromCli')) {
          const d = new Date();
          const p = (n) => String(n).padStart(2, '0');
          pm.environment.set('runId', `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`);
        }
        console.log('runId de esta corrida: ' + pm.environment.get('runId'));
      },
    }),
    req('Login con contraseña incorrecta', 'POST', '/auth/login', {
      actor: 'anónimo', expect: 401,
      body: { email: '{{superadminEmail}}', password: 'contraseña-incorrecta' },
    }),
  ]),

  folder('01 Autenticación', [
    req('Login superadmin', 'POST', '/auth/login', {
      expect: 200,
      body: { email: '{{superadminEmail}}', password: '{{superadminPassword}}' },
      test() {
        const j = pm.response.json();
        pm.test('rol SUPERADMIN', () => pm.expect(j.user.role).to.eql('SUPERADMIN'));
        pm.test('emite cookie de sesión', () => pm.expect(pm.response.headers.filter((h) => h.key.toLowerCase() === 'set-cookie').length).to.be.above(0));
        pm.environment.set('superadminId', j.user.id);
      },
    }),
    req('Usuario actual (/auth/me)', 'GET', '/auth/me', {
      expect: 200,
      test() {
        pm.test('email coincide', () => pm.expect(pm.response.json().email).to.eql(pm.environment.get('superadminEmail')));
      },
    }),
  ]),

  folder('02 Roles y usuarios', [
    req('Permisos agrupados por módulo', 'GET', '/roles/permissions/group', {
      expect: 200,
      test() {
        const wanted = JSON.parse(pm.environment.get('sellerPermNames'));
        const all = Object.values(pm.response.json()).flat();
        const ids = all.filter((p) => wanted.includes(p.name)).map((p) => p.id);
        pm.test('existen los permisos del rol vendedor', () => pm.expect(ids.length).to.eql(wanted.length));
        pm.environment.set('sellerPermIds', JSON.stringify(ids));
      },
    }),
    req('Crear rol vendedor de prueba', 'POST', '/roles', {
      expect: [200, 201],
      pre() {
        pm.request.body.update(pm.request.body.raw.replace('"__PERM_IDS__"', pm.environment.get('sellerPermIds')));
      },
      body: { name: 'QA_VENDEDOR_{{runId}}', description: 'Rol de pruebas QA', permissionIds: '__PERM_IDS__' },
      test() { pm.environment.set('sellerRoleId', pm.response.json().id); },
    }),
    req('Crear usuario ordinario', 'POST', '/users', {
      expect: [200, 201],
      body: { name: 'QA Vendedor {{runId}}', email: 'qa.vendedor.{{runId}}@local.test', password: '{{sellerPassword}}', roleId: '{{sellerRoleId}}' },
      test() {
        const j = pm.response.json();
        pm.environment.set('sellerUserId', j.id);
        pm.environment.set('sellerEmail', j.email);
      },
    }),
    req('Detalle de usuario por ID', 'GET', '/users/{{sellerUserId}}', {
      expect: 200,
      test() { pm.test('email coincide', () => pm.expect(pm.response.json().email).to.eql(pm.environment.get('sellerEmail'))); },
    }),
    req('Editar usuario', 'PUT', '/users/{{sellerUserId}}', {
      expect: 200,
      body: { name: 'QA Vendedor {{runId}} Editado' },
      test() { pm.test('nombre actualizado', () => pm.expect(pm.response.json().name).to.match(/Editado$/)); },
    }),
    req('Buscar usuario por email', 'GET', '/users?search=qa.vendedor.{{runId}}&limit=10&offset=0', {
      expect: 200,
      test() { pm.test('encuentra exactamente 1', () => pm.expect(pm.response.json().count).to.eql(1)); },
    }),
    req('Paginación de usuarios (limit=1)', 'GET', '/users?limit=1&offset=0', {
      expect: 200,
      test() {
        const j = pm.response.json();
        // Por diseño el listado excluye al SUPERADMIN (findAllWithoutSuperAdmin).
        pm.test('máx. 1 resultado', () => pm.expect(j.results.length).to.be.at.most(1));
        pm.test('count total >= 1', () => pm.expect(j.count).to.be.at.least(1));
        pm.test('no lista al superadmin', () => pm.expect(j.results.map((u) => u.role)).to.not.include('SUPERADMIN'));
      },
    }),
    req('Crear usuario con email duplicado', 'POST', '/users', {
      expect: 409, expected: 'HTTP 409 (duplicado); no crea registro',
      body: { name: 'Duplicado', email: 'qa.vendedor.{{runId}}@local.test', password: '{{sellerPassword}}', roleId: '{{sellerRoleId}}' },
    }),
    req('Detalle de usuario inexistente', 'GET', '/users/999999', { expect: 404 }),
  ]),

  folder('03 Categorías', [
    req('Crear categoría', 'POST', '/categories', {
      expect: [200, 201],
      body: { name: 'QA Cat {{runId}}', description: 'Categoría de pruebas' },
      test() { pm.environment.set('categoryId', pm.response.json().id); },
    }),
    req('Detalle de categoría por ID', 'GET', '/categories/{{categoryId}}', { expect: 200 }),
    req('Editar categoría', 'PUT', '/categories/{{categoryId}}', {
      expect: 200,
      body: { name: 'QA Cat {{runId}} Ed', description: 'Editada' },
      test() { pm.test('nombre actualizado', () => pm.expect(pm.response.json().name).to.match(/ Ed$/)); },
    }),
    req('Buscar categoría', 'GET', '/categories?search=QA Cat {{runId}}&limit=10&offset=0', {
      expect: 200,
      test() { pm.test('encuentra la categoría', () => pm.expect(pm.response.json().count).to.be.at.least(1)); },
    }),
    req('Crear categoría duplicada', 'POST', '/categories', {
      expect: 409, body: { name: 'QA Cat {{runId}} Ed', description: 'dup' },
    }),
    req('Detalle de categoría inexistente', 'GET', '/categories/999999', { expect: 404 }),
  ]),

  folder('04 Productos, variantes y stock', [
    req('Crear color', 'POST', '/colors', {
      expect: [200, 201],
      body: { name: 'QA Color {{runId}}', hexCode: '#112233' },
      test() { pm.environment.set('colorId', pm.response.json().id); },
    }),
    req('Crear talla', 'POST', '/sizes', {
      expect: [200, 201],
      body: { name: 'QA-{{runId}}' },
      test() { pm.environment.set('sizeId', pm.response.json().id); },
    }),
    req('Crear producto', 'POST', '/products', {
      expect: [200, 201],
      body: { name: 'QA Producto {{runId}}', purchasePrice: 20, salePrice: 50, categoryId: '{{categoryId}}', minStock: 2 },
      test() { pm.environment.set('productId', pm.response.json().id); },
    }),
    req('Crear variante con stock 10', 'POST', '/product-variants', {
      expect: [200, 201],
      body: { productId: '{{productId}}', colorId: '{{colorId}}', sizeId: '{{sizeId}}', stock: 10, minStock: 2, sku: 'QA-SKU-{{runId}}', salePrice: 50, purchasePrice: 20 },
      test() {
        const j = pm.response.json();
        pm.test('stock inicial 10', () => pm.expect(j.stock).to.eql(10));
        pm.environment.set('variantId', j.id);
      },
    }),
    req('Agregar 5 unidades de stock', 'PUT', '/product-variants/{{variantId}}/stock/add?quantity=5', {
      expect: 200,
      test() { pm.test('stock = 15', () => pm.expect(pm.response.json().stock).to.eql(15)); },
    }),
    req('Detalle de variante por ID', 'GET', '/product-variants/{{variantId}}', {
      expect: 200,
      test() { pm.test('stock persistido = 15', () => pm.expect(pm.response.json().stock).to.eql(15)); },
    }),
    req('Detalle de producto por ID', 'GET', '/products/{{productId}}', { expect: 200 }),
    req('Editar producto', 'PUT', '/products/{{productId}}', {
      expect: 200,
      body: { name: 'QA Producto {{runId}} Ed' },
      test() { pm.test('nombre actualizado', () => pm.expect(pm.response.json().name).to.match(/ Ed$/)); },
    }),
    req('Buscar producto', 'GET', '/products?search=QA Producto {{runId}}&limit=10&offset=0', {
      expect: 200,
      test() { pm.test('encuentra el producto', () => pm.expect(pm.response.json().count).to.be.at.least(1)); },
    }),
    req('Detalle de producto inexistente', 'GET', '/products/999999', { expect: 404 }),
  ]),

  folder('05 Caja: apertura y egreso', [
    req('Crear caja física', 'POST', '/cash/registers', {
      expect: [200, 201],
      body: { name: 'QA Caja {{runId}}' },
      test() { pm.environment.set('cashRegisterId', pm.response.json().id); },
    }),
    req('Abrir caja con 100', 'POST', '/cash/opening/open', {
      expect: [200, 201],
      body: { cashRegisterId: '{{cashRegisterId}}', initialAmount: 100 },
      test() { pm.environment.set('cashSessionId', pm.response.json().id); },
    }),
    req('Estado de caja abierta', 'GET', '/cash/opening/status?cashRegisterId={{cashRegisterId}}', {
      expect: 200,
      test() { pm.test('monto inicial 100', () => pm.expect(Number(pm.response.json().initialAmount)).to.eql(100)); },
    }),
    req('Listar motivos de egreso', 'GET', '/cash/outflow-reasons', {
      expect: 200,
      test() {
        const r = pm.response.json().find((x) => x.isActive && !/devoluci|refund/i.test(x.name));
        pm.test('hay un motivo activo utilizable', () => pm.expect(r).to.exist);
        if (r) pm.environment.set('outflowReasonId', r.id);
      },
    }),
    req('Egreso de 10 contra el fondo inicial (sin ventas aún)', 'POST', '/cash/outflows', {
      expect: [200, 201], expected: 'HTTP 200/201: la caja tiene 100 de fondo inicial, un egreso de 10 debe aceptarse',
      body: { cashRegisterId: '{{cashRegisterId}}', reasonId: '{{outflowReasonId}}', amount: 10, description: 'Egreso QA fondo inicial {{runId}}' },
      test() {
        if (pm.response.code < 300) {
          pm.environment.set('outflowId', pm.response.json().id);
          pm.environment.set('outflowsSoFar', 10);
        } else {
          pm.environment.set('outflowsSoFar', 0);
        }
      },
    }),
  ]),

  folder('06 Venta y recibo', [
    req('Crear venta: 2 u. x 50 en efectivo', 'POST', '/orders', {
      expect: [200, 201],
      body: {
        userId: '{{superadminId}}',
        orderItems: [{ productVariantId: '{{variantId}}', quantity: 2 }],
        shippingAddress: { fullName: 'Cliente QA {{runId}}' },
        payments: [{ method: 'CASH', amount: 100 }],
        cashRegisterId: '{{cashRegisterId}}',
      },
      test() {
        const j = pm.response.json();
        pm.test('total = 100', () => pm.expect(Number(j.total)).to.eql(100));
        pm.test('asociada a la caja QA', () => pm.expect(j.cashRegisterId).to.eql(Number(pm.environment.get('cashRegisterId'))));
        pm.environment.set('orderId', j.id);
      },
    }),
    req('Detalle de venta por ID', 'GET', '/orders/{{orderId}}', {
      expect: 200,
      test() {
        const j = pm.response.json();
        pm.test('1 ítem, cantidad 2', () => pm.expect(j.orderItems[0].quantity).to.eql(2));
        console.log('Estado de la venta: ' + j.status);
      },
    }),
    req('Stock descontado tras la venta', 'GET', '/product-variants/{{variantId}}', {
      expect: 200,
      test() { pm.test('stock = 13', () => pm.expect(pm.response.json().stock).to.eql(13)); },
    }),
    req('Recibo PDF de la venta', 'GET', '/orders/{{orderId}}/receipt', {
      expect: 200,
      test() {
        pm.test('Content-Type PDF', () => pm.expect(pm.response.headers.get('Content-Type')).to.include('pdf'));
        pm.test('cuerpo no vacío', () => pm.expect(pm.response.responseSize).to.be.above(500));
      },
    }),
    req('Listado de ventas con paginación', 'GET', '/orders?limit=10&offset=0', {
      expect: 200,
      test() { pm.test('incluye la venta creada', () => pm.expect(pm.response.json().results.map((o) => o.id)).to.include(Number(pm.environment.get('orderId')))); },
    }),
    req('Egreso de 10 después de la venta', 'POST', '/cash/outflows', {
      expect: [200, 201],
      body: { cashRegisterId: '{{cashRegisterId}}', reasonId: '{{outflowReasonId}}', amount: 10, description: 'Egreso QA post-venta {{runId}}' },
      test() {
        if (pm.response.code < 300) pm.environment.set('outflowsSoFar', Number(pm.environment.get('outflowsSoFar')) + 10);
      },
    }),
    req('Totales de la caja tras venta y egresos', 'GET', '/cash/opening/status?cashRegisterId={{cashRegisterId}}', {
      expect: 200, expected: 'ventas 100, egresos = suma de egresos aceptados, saldo = 100 + 100 − egresos',
      test() {
        const j = pm.response.json();
        const out = Number(pm.environment.get('outflowsSoFar'));
        pm.environment.set('expectedClosing', 200 - out);
        pm.test('ventas = 100', () => pm.expect(Number(j.totalSales)).to.eql(100));
        pm.test(`egresos = ${out}`, () => pm.expect(Number(j.totalOutflows)).to.eql(out));
        pm.test(`saldo sistema = ${200 - out}`, () => pm.expect(Number(j.systemBalance)).to.eql(200 - out));
      },
    }),
  ]),

  folder('07 Cierre de caja', [
    req('Cerrar caja con el monto esperado contado', 'POST', '/cash/opening/close', {
      expect: 200, expected: 'HTTP 200; saldo sistema = monto contado; diferencia 0',
      body: { cashRegisterId: '{{cashRegisterId}}', closingAmount: '{{expectedClosing}}' },
      test() {
        const j = pm.response.json();
        const exp = Number(pm.environment.get('expectedClosing'));
        pm.test(`saldo sistema ${exp}`, () => pm.expect(Number(j.systemBalance)).to.eql(exp));
        pm.test('diferencia 0', () => pm.expect(Number(j.difference)).to.eql(0));
      },
    }),
    req('Historial de la caja', 'GET', '/cash/opening/history?cashRegisterId={{cashRegisterId}}&limit=10&offset=0', {
      expect: 200,
      test() {
        const j = pm.response.json();
        const rows = Array.isArray(j) ? j : j.results;
        pm.test('incluye la sesión cerrada', () => pm.expect(rows.map((s) => s.id)).to.include(Number(pm.environment.get('cashSessionId'))));
      },
    }),
    req('Vender con la caja cerrada', 'POST', '/orders', {
      expect: 400, expected: 'HTTP 400; no crea venta ni descuenta stock',
      body: {
        userId: '{{superadminId}}',
        orderItems: [{ productVariantId: '{{variantId}}', quantity: 1 }],
        shippingAddress: { fullName: 'Cliente QA' },
        payments: [{ method: 'CASH', amount: 50 }],
        cashRegisterId: '{{cashRegisterId}}',
      },
    }),
    req('Stock sin cambios tras venta rechazada', 'GET', '/product-variants/{{variantId}}', {
      expect: 200,
      test() { pm.test('stock sigue en 13', () => pm.expect(pm.response.json().stock).to.eql(13)); },
    }),
  ]),

  folder('08 Reportes y dashboard', [
    req('Resumen del dashboard', 'GET', '/dashboard/summary', { expect: 200 }),
    req('Reporte de productos en PDF', 'GET', '/reports/products/pdf', {
      expect: 200,
      test() { pm.test('Content-Type PDF', () => pm.expect(pm.response.headers.get('Content-Type')).to.include('pdf')); },
    }),
    req('Reporte de sesiones de caja en PDF', 'GET', '/reports/cash-sessions/pdf', {
      expect: 200,
      test() { pm.test('Content-Type PDF', () => pm.expect(pm.response.headers.get('Content-Type')).to.include('pdf')); },
    }),
    req('Configuración de la tienda', 'GET', '/store-config', { expect: 200 }),
  ]),

  folder('09 Permisos de usuario ordinario', [
    req('Login usuario ordinario', 'POST', '/auth/login', {
      actor: 'usuario ordinario', expect: 200,
      body: { email: '{{sellerEmail}}', password: '{{sellerPassword}}' },
      test() { pm.test('rol QA_VENDEDOR', () => pm.expect(pm.response.json().user.role).to.match(/^QA_VENDEDOR_/)); },
    }),
    req('Listar productos (permitido)', 'GET', '/products?limit=5&offset=0', { actor: 'usuario ordinario', expect: 200 }),
    req('Listar usuarios (sin permiso)', 'GET', '/users', { actor: 'usuario ordinario', expect: 403 }),
    req('Crear categoría (sin permiso)', 'POST', '/categories', {
      actor: 'usuario ordinario', expect: 403, body: { name: 'No debe crearse {{runId}}' },
    }),
    req('Ver configuración (sin permiso)', 'GET', '/store-config', { actor: 'usuario ordinario', expect: 403 }),
    req('Ver dashboard (sin permiso)', 'GET', '/dashboard/summary', { actor: 'usuario ordinario', expect: 403 }),
    req('Categoría sin permiso no se creó', 'GET', '/categories?search=No debe crearse {{runId}}&limit=10&offset=0', {
      actor: 'usuario ordinario', expect: 200,
      test() { pm.test('0 resultados', () => pm.expect(pm.response.json().count).to.eql(0)); },
    }),
    req('Logout', 'POST', '/auth/logout', { actor: 'usuario ordinario', expect: 200 }),
    req('Sesión invalidada tras logout', 'GET', '/auth/me', { actor: 'anónimo', expect: 401 }),
  ]),
];

const collection = {
  info: {
    name: 'KODA · Sprint 1 · Baseline de regresión (pre-migración)',
    description: 'Recorrido de regresión del entregable 1 (07-qa-fullstack.md). Cada ejecución usa un {{runId}} distinto, por lo que se puede repetir sin restaurar la BD. Generado por qa/postman/build-collection.js: no editar a mano, regenerar.',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
  },
  item: items,
};

fs.writeFileSync(path.join(__dirname, 'KODA-baseline.postman_collection.json'), JSON.stringify(collection, null, 2) + '\n');
console.log(`Colección generada: ${seq} casos (S1-QA-001 … S1-QA-${String(seq).padStart(3, '0')})`);
