import {
  accountLineTable,
  accountTable,
  paymentTable,
  AccountLineRepository,
  AccountRepository,
} from '@coongro/billing/server';
import { contactTable } from '@coongro/contacts/server';
import type { ModuleDatabaseAPI } from '@coongro/plugin-sdk';
import { scopeMismatchMessage, unitLabel } from '@coongro/properties';
import { buildingTable, unitTable } from '@coongro/properties/server';
import { and, asc, desc, eq, getTableColumns, isNull, sql } from 'drizzle-orm';

import { workOrderTable } from '../schema/work-order.js';
import type { WorkOrderRow, NewWorkOrderRow } from '../schema/work-order.js';
import { expenseForWorkOrder, workOrderRef } from '../services/work-order-settlement.js';

/** Con qué nombre aparece en Caja el gasto de un arreglo. */
const EXPENSE_SOURCE = 'mantenimiento';

/** Con qué origen se le cobra al inquilino un arreglo que corrió por cuenta suya. */
const TENANT_EXPENSE_SOURCE = 'gasto_a_cargo';

/** Una orden con el inmueble, la unidad y quién la reportó resueltos. */
export interface WorkOrderListRow extends WorkOrderRow {
  property: string | null;
  unit: string | null;
  reported_by: string | null;
  urgency: number;
  /**
   * Qué pasó con la plata de este arreglo: `a_pagar` (el egreso está registrado y el
   * proveedor todavía espera), `pagado`, o vacío cuando no corresponde egreso.
   */
  expense_state: string;
  /**
   * Si el gasto ya entró en el recibo del inquilino: `cobrado` · `a_cobrar`. Vacío
   * cuando el arreglo no está a cargo suyo, que es el caso normal.
   */
  tenant_state: string;
}

/**
 * Lo que se puede escribir de una orden de trabajo.
 *
 * Se declara acá en vez de usar el `NewWorkOrderRow` de drizzle porque en 0.38.x el
 * `$inferInsert` **deja afuera las columnas nullable**: ese tipo dice `{ title, priority,
 * status }` y nada más, así que `building_id` y `unit_id` —los dos que definen el alcance— no
 * existen para TypeScript. Es el mismo tropiezo que en `properties`, y castear para esquivarlo
 * tiene el costo de que después nadie puede LEER un campo que el tipo no tiene.
 *
 * Es asignable a lo que drizzle espera, así que los `insert`/`update` compilan sin cast.
 */
export interface WorkOrderInput {
  /** La propiedad. Siempre — ver la regla de alcance en `@coongro/properties`. */
  building_id?: string | null;
  /** La unidad, cuando el arreglo es de una puntual. */
  unit_id?: string | null;
  reported_by_contact_id?: string | null;
  vendor_contact_id?: string | null;
  title: string;
  description?: string | null;
  priority: string;
  category?: string | null;
  status: string;
  paid_by?: string | null;
  reported_at?: string | null;
  scheduled_at?: string | null;
  completed_at?: string | null;
  estimated_cost?: string | null;
  cost?: string | null;
  notes?: string | null;
}

/** Lo que resume la cabecera de Mantenimiento. */
export interface MaintenanceOverview {
  /** Lo que sale del bolsillo del propietario y NO vuelve, en el año en curso. */
  gastoPropio: number;
  /** Cuántos arreglos lo componen: un promedio sin el conteo no dice nada. */
  ordenes: number;
  /** Lo que se le debe a proveedores: egresos registrados sin pago. */
  aPagar: number;
  aPagarOrdenes: number;
  /** Lo adelantado por cuenta del inquilino, que se recupera en su recibo. */
  aRecuperar: number;
  aRecuperarOrdenes: number;
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
    const filas = await this.db.ormQuery((tx) =>
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

    // Qué pasó con la plata se resuelve acá y no en la pantalla: cerrar una orden
    // ahora tiene dos consecuencias —el egreso al proveedor y, si es a cargo del
    // inquilino, la línea en su recibo— y hasta que no se vieran desde la orden, la
    // única forma de saber si ocurrieron era mirar la base.
    const [egresos, cobrados] = await Promise.all([this.estadoDeEgresos(), this.refsCobradas()]);

    return (filas ?? []).map((o) => ({
      ...o,
      expense_state: egresos.get(workOrderRef(String(o.id))) ?? '',
      tenant_state:
        String(o.paid_by ?? '') !== 'inquilino'
          ? ''
          : cobrados.has(workOrderRef(String(o.id)))
            ? 'cobrado'
            : 'a_cobrar',
    })) as WorkOrderListRow[];
  }

  /**
   * El resumen de arriba de Mantenimiento: cuánto cuesta mantener la cartera.
   *
   * Separa el gasto PROPIO del que se le recupera al inquilino porque son plata
   * distinta: lo que se adelanta por cuenta de otro entra y sale, y sumarlo al gasto
   * inflaría el número justo cuando sirve para decidir —a fin de año, si conviene
   * deducir gastos reales o el presunto—. Ese número tiene que ser el que de verdad
   * salió del bolsillo del propietario.
   *
   * El corte es el año en curso: la decisión que hay detrás es anual.
   */
  async overview({ year }: { year?: number } = {}): Promise<MaintenanceOverview> {
    const desde = `${year ?? new Date().getFullYear()}-01-01`;
    const hasta = `${year ?? new Date().getFullYear()}-12-31`;
    const ordenes = await this.list();

    const delAnio = ordenes.filter((o) => {
      const fecha = String(o.completed_at ?? '');
      return fecha >= desde && fecha <= hasta;
    });

    const monto = (o: WorkOrderListRow) => Number(o.cost ?? 0) || 0;
    const conEgreso = delAnio.filter((o) => o.expense_state !== '');
    const propios = conEgreso.filter((o) => String(o.paid_by ?? '') !== 'inquilino');
    const recuperables = conEgreso.filter((o) => String(o.paid_by ?? '') === 'inquilino');
    const aPagar = conEgreso.filter((o) => o.expense_state === 'a_pagar');

    return {
      gastoPropio: propios.reduce((acc, o) => acc + monto(o), 0),
      ordenes: propios.length,
      aPagar: aPagar.reduce((acc, o) => acc + monto(o), 0),
      aPagarOrdenes: aPagar.length,
      aRecuperar: recuperables.reduce((acc, o) => acc + monto(o), 0),
      aRecuperarOrdenes: recuperables.length,
    };
  }

  /** Por cada orden con egreso, si el proveedor ya cobró o todavía espera. */
  private async estadoDeEgresos(): Promise<Map<string, string>> {
    const cuentas = await this.db.ormQuery((tx) =>
      tx
        .select({
          id: accountTable.id,
          source_ref: accountTable.source_ref,
          pagado: sql<number>`coalesce((
            select sum(${paymentTable.amount}) from ${paymentTable}
            where ${paymentTable.account_id} = ${accountTable.id}
          ), 0)`,
        })
        .from(accountTable)
        .where(eq(accountTable.source, EXPENSE_SOURCE))
    );

    return new Map(
      (cuentas ?? []).map((c) => [
        String(c.source_ref ?? ''),
        Number(c.pagado ?? 0) > 0 ? 'pagado' : 'a_pagar',
      ])
    );
  }

  /** Las órdenes que ya figuran en el recibo de un inquilino. */
  private async refsCobradas(): Promise<Set<string>> {
    const lineas = await this.db.ormQuery((tx) =>
      tx
        .select({ source_ref: accountLineTable.source_ref })
        .from(accountLineTable)
        .where(eq(accountLineTable.source_type, TENANT_EXPENSE_SOURCE))
    );
    return new Set((lineas ?? []).map((l) => String(l.source_ref ?? '')).filter(Boolean));
  }

  async getById({ id }: { id: string }): Promise<WorkOrderRow | undefined> {
    const rows = await this.db.ormQuery((tx) =>
      tx.select().from(workOrderTable).where(eq(workOrderTable.id, id)).limit(1)
    );
    return rows[0];
  }

  /**
   * Frena la orden cuya unidad no pertenece a la propiedad elegida.
   *
   * La regla NO vive acá: es de `properties`, que es el dueño de edificios y unidades y el
   * único que puede contestar de cuál es realmente una unidad. Acá solo se le traen los dos
   * datos que no tiene a mano. Copiarla habría dejado dos versiones de la misma verdad, que
   * es exactamente cómo empiezan a divergir.
   *
   * Hace falta por lo mismo que en certificados: el desplegable de unidades del formulario
   * lista las de TODA la cartera, así que elegir una de otra propiedad es un click. Y el
   * resultado no sería un dato raro sino contradictorio — la orden aparecería en las dos
   * propiedades a la vez.
   */
  private async rejectIfScopeDoesNotMatch(order: Partial<WorkOrderInput>): Promise<void> {
    const unitId = String(order.unit_id ?? '').trim();
    const buildingId = String(order.building_id ?? '').trim();

    const [unidad] = unitId
      ? await this.db.ormQuery((tx) =>
          tx
            .select({
              name: unitTable.name,
              building_id: unitTable.building_id,
              building_name: buildingTable.name,
            })
            .from(unitTable)
            .leftJoin(buildingTable, eq(buildingTable.id, unitTable.building_id))
            .where(eq(unitTable.id, unitId))
            .limit(1)
        )
      : [];

    const [propiedad] = buildingId
      ? await this.db.ormQuery((tx) =>
          tx
            .select({ name: buildingTable.name })
            .from(buildingTable)
            .where(eq(buildingTable.id, buildingId))
            .limit(1)
        )
      : [];

    const blocked = scopeMismatchMessage(
      order,
      unidad
        ? {
            label: unitLabel({
              unitName: unidad.name,
              buildingName: unidad.building_name,
              buildingAddress: null,
            }),
            buildingId: unidad.building_id,
          }
        : undefined,
      propiedad,
      'Una orden de trabajo'
    );
    if (blocked) throw new Error(blocked);
  }

  async create({ data }: { data: WorkOrderInput }): Promise<WorkOrderRow[]> {
    await this.rejectIfScopeDoesNotMatch(data);

    const filas = await this.db.ormQuery((tx) =>
      tx.insert(workOrderTable).values(data).returning()
    );
    // Una orden puede nacer terminada: se carga el arreglo después de hacerlo, con el
    // costo ya sabido. Ese caso mueve plata igual que cerrar una abierta.
    if (filas[0]) await this._syncExpense(filas[0]);
    return filas;
  }

  async update({
    id,
    data,
  }: {
    id: string;
    data: Partial<WorkOrderInput>;
  }): Promise<WorkOrderRow[]> {
    // Se valida la orden COMO VA A QUEDAR: un update parcial que solo cambia la unidad
    // tiene que compararse contra la propiedad que ya tenía guardada.
    const previa = await this.getById({ id });
    await this.rejectIfScopeDoesNotMatch({ ...previa, ...data });

    const filas = await this.db.ormQuery((tx) =>
      tx.update(workOrderTable).set(data).where(eq(workOrderTable.id, id)).returning()
    );
    // El egreso se sincroniza acá y no en una acción «completar» aparte porque cerrar
    // una orden es guardar el formulario con el estado en «terminada»: una acción
    // separada quedaría sin invocar, que es exactamente cómo el punitorio terminó
    // calculándose en el navegador.
    if (filas[0]) await this._syncExpense(filas[0]);
    return filas;
  }

  /**
   * Mantiene en Caja la salida de plata que corresponde a una orden.
   *
   * Es una sincronización y no un alta: la orden es la dueña del dato, así que corregir
   * el costo corrige el egreso, y reabrir la orden o pasarla a «pagada por el consorcio»
   * lo elimina. Guardar dos veces no duplica nada — la cuenta se identifica por
   * `workorder:<id>` y el índice único de billing lo garantiza en la base.
   *
   * Deja la cuenta ABIERTA, sin registrar el pago al proveedor. Cerrar la orden dice
   * cuánto costó el arreglo, no que ya se le pagó al plomero ni con qué medio; dar el
   * pago por hecho descuadraría el arqueo del día con plata que sigue en el cajón. El
   * gasto aparece como deuda al proveedor y el pago se registra cuando ocurre.
   *
   * Un egreso que ya tiene pagos registrados NO se toca: si alguien ya cargó que se le
   * pagó al plomero, borrar la cuenta se llevaría puesto ese pago. En ese caso el
   * desajuste se resuelve a mano, que es lo correcto cuando hay plata ya movida.
   *
   * Prefijo `_`: el runtime registra como acción RPC todo método público del prototipo,
   * y esto no es algo que el Copilot deba poder invocar suelto — es la consecuencia de
   * guardar la orden.
   */
  private async _syncExpense(order: WorkOrderRow): Promise<void> {
    const hoy = new Date().toISOString().slice(0, 10);
    const egreso = expenseForWorkOrder(order, hoy);
    const ref = workOrderRef(order.id);

    const cuentas = await this.db.ormQuery((tx) =>
      tx
        .select({ id: accountTable.id })
        .from(accountTable)
        .where(and(eq(accountTable.source, EXPENSE_SOURCE), eq(accountTable.source_ref, ref)))
        .limit(1)
    );
    const cuentaId = cuentas[0]?.id;

    if (!egreso) {
      if (cuentaId && !(await this._tienePagos(cuentaId))) {
        await this.db.ormQuery((tx) =>
          tx.delete(accountLineTable).where(eq(accountLineTable.account_id, cuentaId))
        );
        await this.db.ormQuery((tx) =>
          tx.delete(accountTable).where(eq(accountTable.id, cuentaId))
        );
      }
      return;
    }

    if (!cuentaId) {
      await new AccountRepository(this.db).openForSource({
        source: EXPENSE_SOURCE,
        sourceRef: ref,
        contactId: egreso.vendorContactId,
        direction: 'payable',
        openedAt: egreso.date,
        notes: egreso.description,
        lines: [
          {
            description: egreso.description,
            subtotal: egreso.amount,
            sourceType: EXPENSE_SOURCE,
            sourceRef: ref,
          },
        ],
      });
      return;
    }

    // La cuenta ya existía: se actualiza el monto por si el costo final cambió.
    if (await this._tienePagos(cuentaId)) return;
    await new AccountLineRepository(this.db).syncSource({
      accountId: cuentaId,
      sourceType: EXPENSE_SOURCE,
      lines: [
        {
          description: egreso.description,
          unitPrice: egreso.amount,
          subtotal: egreso.amount,
          sourceRef: ref,
        },
      ],
    });
  }

  /** Si ya se registró un pago contra el egreso, deja de ser nuestro para reescribir. */
  private async _tienePagos(accountId: string): Promise<boolean> {
    const pagos = await this.db.ormQuery((tx) =>
      tx
        .select({ id: paymentTable.id })
        .from(paymentTable)
        .where(eq(paymentTable.account_id, accountId))
        .limit(1)
    );
    return pagos.length > 0;
  }

  // Los dos .set() van casteados: drizzle 0.38.x deja fuera de `$inferInsert` las columnas
  // nullable, así que el tipo del update no reconoce `deleted_at` y el typecheck falla.
  /**
   * Borra una orden que no debió cargarse.
   *
   * Se niega en cuanto la orden ya movió plata, que en mantenimiento pasa por dos
   * caminos distintos y cualquiera de los dos alcanza: el **egreso** que se le
   * abre al proveedor cuando el arreglo lo paga el propietario, y la **línea que
   * se le cobra al inquilino** cuando corrió por cuenta suya. Las dos referencian
   * la orden por `workorder:<id>`, así que borrarla las dejaría apuntando a un
   * arreglo que para el sistema no existió — y esas líneas ya se vieron en Caja o
   * en el recibo del mes.
   *
   * Una orden que sí se cargó mal, pero se pagó, no se borra: se cancela, que es
   * lo que su estado ya sabe expresar.
   */
  async delete({ id }: { id: string }): Promise<WorkOrderRow[]> {
    const ref = workOrderRef(id);

    const [egresos, cobros] = await Promise.all([
      this.db.ormQuery((tx) =>
        tx
          .select({ id: accountTable.id })
          .from(accountTable)
          .where(and(eq(accountTable.source, EXPENSE_SOURCE), eq(accountTable.source_ref, ref)))
          .limit(1)
      ),
      this.db.ormQuery((tx) =>
        tx
          .select({ id: accountLineTable.id })
          .from(accountLineTable)
          .where(
            and(
              eq(accountLineTable.source_type, TENANT_EXPENSE_SOURCE),
              eq(accountLineTable.source_ref, ref)
            )
          )
          .limit(1)
      ),
    ]);

    if (egresos.length > 0 || cobros.length > 0) {
      const donde =
        egresos.length > 0 && cobros.length > 0
          ? 'un egreso en Caja y un cargo al inquilino'
          : egresos.length > 0
            ? 'un egreso en Caja'
            : 'un cargo al inquilino';
      throw new Error(
        `Esta orden ya generó ${donde}: eliminarla dejaría ese movimiento apuntando a un arreglo que no existe. Si no había que hacerla, cambiale el estado a «Cancelada» — así queda dicho que se dio de baja y la plata sigue cuadrando.`
      );
    }

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
