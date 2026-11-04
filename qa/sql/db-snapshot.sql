-- Instantanea de la BD para comparar antes/después de la migracion.
-- Uso: docker exec -i store-postgres psql -U postgres -d store_db -A -F ' | ' < qa/sql/db-snapshot.sql

\echo '== Conteo exacto de filas por tabla'
SELECT table_name AS tabla,
       (xpath('/row/c/text()', query_to_xml(format('SELECT count(*) AS c FROM %I.%I', table_schema, table_name), false, true, '')))[1]::text::bigint AS filas
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY 1;

\echo '== Totales de negocio'
SELECT 'ventas (orders.total)'             AS indicador, count(*) AS filas, coalesce(sum(total), 0)  AS suma FROM orders
UNION ALL SELECT 'ventas no anuladas',        count(*), coalesce(sum(total), 0)  FROM orders WHERE status <> 'CANCELLED'
UNION ALL SELECT 'pagos (payments.amount)',   count(*), coalesce(sum(amount), 0) FROM payments
UNION ALL SELECT 'ingresos de caja',          count(*), coalesce(sum(amount), 0) FROM cash_inflows
UNION ALL SELECT 'egresos de caja',           count(*), coalesce(sum(amount), 0) FROM cash_outflows
UNION ALL SELECT 'stock total variantes',     count(*), coalesce(sum(stock), 0)  FROM product_variants
UNION ALL SELECT 'saldo cajas (balance)',     count(*), coalesce(sum(balance), 0) FROM cash_register
UNION ALL SELECT 'sesiones de caja abiertas', count(*), coalesce(sum(initial_amount), 0) FROM cash_openings WHERE is_active;

\echo '== Integridad: referencias huerfanas (todas deben ser 0)'
SELECT 'order_items sin orden'     AS chequeo, count(*) AS filas FROM order_items oi LEFT JOIN orders o ON o.id = oi.order_id WHERE o.id IS NULL
UNION ALL SELECT 'order_items sin variante', count(*) FROM order_items oi LEFT JOIN product_variants v ON v.id = oi.product_variant_id WHERE v.id IS NULL
UNION ALL SELECT 'variantes sin producto',   count(*) FROM product_variants v LEFT JOIN products p ON p.id = v.product_id WHERE p.id IS NULL
UNION ALL SELECT 'productos sin categoria',  count(*) FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE c.id IS NULL
UNION ALL SELECT 'usuarios sin rol',         count(*) FROM users u LEFT JOIN roles r ON r.id = u.role_id WHERE r.id IS NULL
UNION ALL SELECT 'pagos distintos al total',   count(*) FROM (SELECT o.id FROM orders o LEFT JOIN payments p ON p.order_id = o.id GROUP BY o.id, o.total HAVING coalesce(sum(p.amount), 0) <> o.total) x;
