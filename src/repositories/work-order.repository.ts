import { contactTable } from '@coongro/contacts/server';
import type { ModuleDatabaseAPI } from '@coongro/plugin-sdk';
import { buildingTable, unitTable } from '@coongro/properties/server';
import { asc, desc, eq, getTableColumns, isNull, sql } from 'drizzle-orm';

import { workOrderTable } from '../schema/work-order.js';
import type { WorkOrderRow, NewWorkOrderRow } from '../schema/work-order.js';

/** Una orden con el inmueble, la unidad y quién la reportó resueltos. */
export interface WorkOrderListRow extends WorkOrderRow {
  property: string | null;
  unit: string | null;
  reported_by: string | null;
  urgency: number;
}

export class WorkOrderRepository {
  constructor(private readonly db: ModuleDatabaseAPI) {}

  /**
   * Órdenes con su inmueble, unidad y quién la reportó ya resueltos.
   *
   * Ordenadas por urgencia y no por fecha: lo que se mira en esta lista es qué hay
   * que resolver primero. Una pérdida de gas de ayer va antes que una pintura de
   * hace un mes.
   */
  async list(): Promise<WorkOrderListRow[]> {
    return this.db.ormQuery((tx) =>
      tx
        .select({
          ...getTableColumns(workOrderTable),
          property: buildingTable.name,
          unit: unitTable.name,
          reported_by: contactTable.name,
          urgency: sql<number>`case ${workOrderTable.priority}
            when 'urgente' then 0 when 'alta' then 1 when 'normal' then 2 else 3 end`,
        })
        .from(workOrderTable)
        .leftJoin(buildingTable, eq(buildingTable.id, workOrderTable.building_id))
        .leftJoin(unitTable, eq(unitTable.id, workOrderTable.unit_id))
        .leftJoin(contactTable, eq(contactTable.id, workOrderTable.reported_by_contact_id))
        .where(isNull(workOrderTable.deleted_at))
        .orderBy(
          // lo abierto arriba, después por urgencia, después lo más viejo primero
          sql`case when ${workOrderTable.status} in ('terminada','cancelada') then 1 else 0 end`,
          asc(sql`case ${workOrderTable.priority}
            when 'urgente' then 0 when 'alta' then 1 when 'normal' then 2 else 3 end`),
          desc(workOrderTable.created_at)
        )
    );
  }

  async getById({ id }: { id: string }): Promise<WorkOrderRow | undefined> {
    const rows = await this.db.ormQuery((tx) =>
      tx.select().from(workOrderTable).where(eq(workOrderTable.id, id)).limit(1)
    );
    return rows[0];
  }

  async create({ data }: { data: NewWorkOrderRow }): Promise<WorkOrderRow[]> {
    return this.db.ormQuery((tx) => tx.insert(workOrderTable).values(data).returning());
  }

  async update({
    id,
    data,
  }: {
    id: string;
    data: Partial<NewWorkOrderRow>;
  }): Promise<WorkOrderRow[]> {
    return this.db.ormQuery((tx) =>
      tx.update(workOrderTable).set(data).where(eq(workOrderTable.id, id)).returning()
    );
  }

  // Los dos .set() van casteados: drizzle 0.38.x deja fuera de `$inferInsert` las columnas
  // nullable, así que el tipo del update no reconoce `deleted_at` y el typecheck falla.
  async delete({ id }: { id: string }): Promise<WorkOrderRow[]> {
    return this.db.ormQuery((tx) =>
      tx
        .update(workOrderTable)
        .set({
          deleted_at: new Date().toISOString(),
          is_active: false,
        } as unknown as Partial<NewWorkOrderRow>)
        .where(eq(workOrderTable.id, id))
        .returning()
    );
  }

  async restore({ id }: { id: string }): Promise<WorkOrderRow[]> {
    return this.db.ormQuery((tx) =>
      tx
        .update(workOrderTable)
        .set({ deleted_at: null, is_active: true } as unknown as Partial<NewWorkOrderRow>)
        .where(eq(workOrderTable.id, id))
        .returning()
    );
  }
}
