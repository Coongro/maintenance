/**
 * @coongro/maintenance — Exportaciones server-only
 *
 * Schema tables y repositories (dependen de drizzle-orm).
 * NO importar desde el browser — usar '@coongro/maintenance' para hooks/componentes.
 */
export * from './schema/work-order.js';
export { WorkOrderRepository } from './repositories/work-order.repository.js';
// `workOrderRef` la usa también `leases` para recuperarle el gasto al inquilino: las dos
// puntas —la salida al proveedor y el cargo en el recibo— tienen que referirse a la misma
// orden con la misma clave, o el gasto se cargaría dos veces.
export { expenseForWorkOrder, workOrderRef } from './services/work-order-settlement.js';
export type { WorkOrderExpense, WorkOrderForSettlement } from './services/work-order-settlement.js';
