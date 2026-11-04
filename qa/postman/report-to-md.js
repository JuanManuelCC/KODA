// Convierte newman-report.json en una matriz Markdown con el formato mínimo de 07-qa-fullstack.md.
// Uso: node qa/postman/report-to-md.js <carpeta-evidencia>
const fs = require('fs');
const path = require('path');

const dir = process.argv[2];
const report = JSON.parse(fs.readFileSync(path.join(dir, 'newman-report.json'), 'utf8'));
const env = JSON.parse(fs.readFileSync(path.join(dir, 'ids-de-prueba.json'), 'utf8'));
const vars = Object.fromEntries(env.values.map((v) => [v.key, v.value]));
const fecha = report.run.timings.started ? new Date(report.run.timings.started).toISOString() : '';

const cell = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ').trim();
const resolve = (s) => String(s).replace(/\{\{(\w+)\}\}/g, (m, k) => (k in vars ? vars[k] : m));

const rows = report.run.executions.map((e) => {
  const [id, ...rest] = e.item.name.split(' · ');
  const desc = (e.item.request && e.item.request.description && (e.item.request.description.content || e.item.request.description)) || '';
  const actor = (/\*\*Actor:\*\* ([^\n]+)/.exec(desc) || [])[1] || 'superadmin';
  const esperado = (/\*\*Esperado:\*\* ([^\n]+)/.exec(desc) || [])[1] || '';
  const r = e.response || {};
  const url = e.request && e.request.url ? '/' + e.request.url.path.join('/') + (e.request.url.query && e.request.url.query.length ? '?' + e.request.url.query.map((q) => `${q.key}=${q.value}`).join('&') : '') : '';
  const fails = (e.assertions || []).filter((a) => a.error);
  const body = r.stream ? Buffer.from(r.stream.data).toString('utf8') : '';
  let msg = '';
  try { msg = JSON.parse(body).message || ''; } catch { /* binario (PDF) o vacío */ }
  const real = `${r.code ?? '—'}${msg ? ` "${msg}"` : ''}`;
  const estado = fails.length ? `**Falló** (${fails.map((a) => a.assertion).join('; ')})` : 'Pasó';
  return `| ${cell(id)} | ${cell(actor)} | ${cell(rest.join(' · '))} | \`${cell(e.request.method + ' ' + resolve(url))}\` | ${cell(esperado)} | ${cell(real)} | ${cell(estado)} |`;
});

const ok = rows.filter((r) => r.endsWith('| Pasó |')).length;
const md = [
  `# Resultados de la corrida ${vars.runId}`,
  '',
  `Inicio (UTC): ${fecha} · Casos: ${rows.length} · Pasaron: ${ok} · Fallaron: ${rows.length - ok}`,
  '',
  'Evidencia completa por caso (petición y respuesta): `newman-report.json` en esta carpeta.',
  '',
  '| ID | Actor | Caso | Acción (HTTP) | Esperado | Real | Estado |',
  '|---|---|---|---|---|---|---|',
  ...rows,
  '',
].join('\n');
fs.writeFileSync(path.join(dir, 'resultados.md'), md);
console.log(`resultados.md: ${ok}/${rows.length} casos pasaron`);
