# Recorrido de requisitos y cambios - ForjaSys

Exportado: 2026-11-24 15:29

## #1 [RF-04] Registrar entradas, salidas y ajustes de inventario
Estado GitHub: OPEN - https://github.com/iccoscco/KODA/issues/1

- **Transición:** estado:registrado → estado:analizado | **Fecha:** 2026-11-24 15:27 | **Responsable:** DanLAQP | **Evidencia:** Criterio de aceptación Dado/Cuando/Entonces, fuente y pruebas vinculadas en la descripción del issue; estado del código revisado en store-backend (sección 'Estado en el código').
- **Transición:** estado:analizado → estado:aprobado | **Fecha:** 2026-11-24 15:27 | **Responsable:** DanLAQP | **Evidencia:** Requisito de prioridad Alta de la línea base (Definición de alcance ForjaSys v0.1, sección 5); entra a la ERS v1.1.

## #2 [RF-07] Registrar venta con IGV y método de pago validando stock
Estado GitHub: OPEN - https://github.com/iccoscco/KODA/issues/2

- **Transición:** estado:registrado → estado:analizado | **Fecha:** 2026-11-24 15:27 | **Responsable:** DanLAQP | **Evidencia:** Criterio de aceptación Dado/Cuando/Entonces, fuente y pruebas vinculadas en la descripción del issue; estado del código revisado en store-backend (sección 'Estado en el código').
- **Transición:** estado:analizado → estado:aprobado | **Fecha:** 2026-11-24 15:27 | **Responsable:** DanLAQP | **Evidencia:** Requisito de prioridad Alta de la línea base (Definición de alcance ForjaSys v0.1, sección 5); entra a la ERS v1.1.

## #3 [RF-08] Emitir boleta o factura electrónica y enviarla a SUNAT
Estado GitHub: OPEN - https://github.com/iccoscco/KODA/issues/3

- **Transición:** estado:registrado → estado:analizado | **Fecha:** 2026-11-24 15:28 | **Responsable:** DanLAQP | **Evidencia:** Criterio de aceptación Dado/Cuando/Entonces, fuente y pruebas vinculadas en la descripción del issue; estado del código revisado en store-backend (sección 'Estado en el código').
- **Transición:** estado:analizado → estado:aprobado | **Fecha:** 2026-11-24 15:28 | **Responsable:** DanLAQP | **Evidencia:** Requisito de prioridad Alta de la línea base (Definición de alcance ForjaSys v0.1, sección 5); entra a la ERS v1.1.

## #4 [RF-10] Anular comprobante con nota de crédito y reponer stock
Estado GitHub: OPEN - https://github.com/iccoscco/KODA/issues/4

- **Transición:** estado:registrado → estado:analizado | **Fecha:** 2026-11-24 15:28 | **Responsable:** DanLAQP | **Evidencia:** Criterio de aceptación Dado/Cuando/Entonces, fuente y pruebas vinculadas en la descripción del issue; estado del código revisado en store-backend (sección 'Estado en el código').
- **Transición:** estado:analizado → estado:aprobado | **Fecha:** 2026-11-24 15:28 | **Responsable:** DanLAQP | **Evidencia:** Requisito de prioridad Alta de la línea base (Definición de alcance ForjaSys v0.1, sección 5); entra a la ERS v1.1.

## #5 [RF-12] Reporte consolidado de ventas e inventario valorizado
Estado GitHub: OPEN - https://github.com/iccoscco/KODA/issues/5

- **Transición:** estado:registrado → estado:analizado | **Fecha:** 2026-11-24 15:28 | **Responsable:** DanLAQP | **Evidencia:** Criterio de aceptación Dado/Cuando/Entonces, fuente y pruebas vinculadas en la descripción del issue; estado del código revisado en store-backend (sección 'Estado en el código').
- **Transición:** estado:analizado → estado:aprobado | **Fecha:** 2026-11-24 15:28 | **Responsable:** DanLAQP | **Evidencia:** Requisito de prioridad Alta de la línea base (Definición de alcance ForjaSys v0.1, sección 5); entra a la ERS v1.1.

## #6 [CC-01] Mostrar alerta de stock mínimo al registrar la venta
Estado GitHub: OPEN - https://github.com/iccoscco/KODA/issues/6

- **Transición:** estado:registrado → estado:analizado | **Fecha:** 2026-11-24 15:28 | **Responsable:** DanLAQP | **Evidencia:** Análisis de impacto en CC-01.docx: OrderServiceImpl/OrderDTO/CreateSale.tsx, 8 h, sin cambios en BD, pruebas PU-01/03/14/16 y CP-04.
- **Transición:** estado:analizado → estado:aprobado | **Fecha:** 2026-11-24 15:29 | **Responsable:** DanLAQP | **Evidencia:** Costo bajo (8 h) dentro del plazo del 25-11-2026; afecta ERS v1.1 -> v1.2 y producto v0.9.0 (rama SVN branches/cc-01).

## #7 [CC-02] Enviar el comprobante por WhatsApp
Estado GitHub: CLOSED - https://github.com/iccoscco/KODA/issues/7

- **Transición:** estado:registrado → estado:analizado | **Fecha:** 2026-11-24 15:29 | **Responsable:** DanLAQP | **Evidencia:** Análisis de impacto en CC-02.docx: API WhatsApp Business, dato personal (Ley 29733), dependencia de RF-09, ~32 h.
- **Transición:** estado:analizado → estado:rechazado | **Fecha:** 2026-11-24 15:29 | **Responsable:** DanLAQP | **Evidencia:** Fuera de alcance: Definición de alcance ForjaSys v0.1, sección 3 ('envío por WhatsApp'); costo ~32 h no cabe antes del 02-12-2026. Alternativa: compartir el PDF (RF-09) manualmente.

