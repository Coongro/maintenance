/**
 * @coongro/maintenance — Exportaciones server-only
 *
 * Schema tables y repositories (dependen de drizzle-orm).
 * NO importar desde el browser — usar '@coongro/maintenance' para hooks/componentes.
 */
export * from './schema/work-order.js';
export { WorkOrderRepository } from './repositories/work-order.repository.js';
