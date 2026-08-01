import { sql } from 'drizzle-orm';
import { boolean, index, numeric, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

/**
 * Orden de trabajo: un arreglo pedido o detectado en un inmueble.
 *
 * Sirve para dos cosas distintas y por eso guarda ambas puntas: para el propietario
 * es la lista de lo que hay que resolver; para una discusión posterior es la prueba
 * de qué reclamó el inquilino y cuándo se atendió.
 *
 * `paid_by` existe porque en un alquiler es la pregunta del millón: lo que se rompe
 * por uso lo paga el inquilino y lo estructural el propietario. Dejarlo escrito al
 * momento del arreglo evita la discusión seis meses después.
 */
export const workOrderTable = pgTable(
  'module_maintenance_work_orders',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    /** El inmueble. Un arreglo del palier no tiene unidad; uno de la cocina del 3°B sí. */
    building_id: uuid('building_id'),
    unit_id: uuid('unit_id'),
    /** Quién lo reportó — normalmente el inquilino. */
    reported_by_contact_id: uuid('reported_by_contact_id'),
    /** A quién se le encargó: el plomero, el electricista. */
    vendor_contact_id: uuid('vendor_contact_id'),
    title: text('title').notNull(),
    description: text('description'),
    /** baja · normal · alta · urgente. Una pérdida de gas no espera al lunes. */
    priority: text('priority').notNull(),
    /** plomería · electricidad · gas · pintura · cerrajería · albañilería · otro. */
    category: text('category'),
    /** abierta · asignada · en_curso · terminada · cancelada. */
    status: text('status').notNull(),
    /** propietario · inquilino · consorcio. */
    paid_by: text('paid_by'),
    reported_at: text('reported_at'),
    scheduled_at: text('scheduled_at'),
    completed_at: text('completed_at'),
    /** Lo que se presupuestó antes de hacerlo. */
    estimated_cost: numeric('estimated_cost'),
    /** Lo que salió finalmente. Se compara con el presupuesto. */
    cost: numeric('cost'),
    notes: text('notes'),
    created_at: timestamp('created_at', { mode: 'string' })
      .notNull()
      .default(sql`now()`),
    updated_at: timestamp('updated_at', { mode: 'string' })
      .notNull()
      .default(sql`now()`),
    is_active: boolean('is_active').notNull().default(true),
    deleted_at: timestamp('deleted_at', { mode: 'string' }),
  },
  (t) => ({
    // Lo abierto (lo que hay que resolver) y lo de cada inmueble o unidad.
    statusIdx: index('idx_work_orders_status').on(t.status),
    buildingIdx: index('idx_work_orders_building').on(t.building_id),
    unitIdx: index('idx_work_orders_unit').on(t.unit_id),
  })
);

export type WorkOrderRow = typeof workOrderTable.$inferSelect;
export type NewWorkOrderRow = typeof workOrderTable.$inferInsert;
