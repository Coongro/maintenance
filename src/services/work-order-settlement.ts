/**
 * Qué pasa con la plata cuando se cierra una orden de trabajo.
 *
 * Una orden terminada con un costo cargado no es solo un dato histórico: es plata que
 * salió. Mientras el cierre no genere el egreso, el costo del arreglo existe en la
 * ficha del inmueble pero no en la caja, y la pregunta «cuánto me cuesta mantener esta
 * propiedad» no se puede responder con lo que el sistema tiene.
 *
 * La decisión de si corresponde egreso la manda `paid_by`, el campo que dice de qué
 * bolsillo sale el arreglo:
 *
 * - **propietario** — le paga al proveedor. Egreso.
 * - **inquilino** — el arreglo lo gestiona el propietario, que le paga al proveedor y
 *   después se lo recupera en el recibo. Egreso igual: la plata salió, aunque vuelva.
 *   (El recupero lo hace `leases`, que es quien sabe qué contrato ocupa la unidad.)
 * - **consorcio** — NO hay egreso. El arreglo de las partes comunes lo paga el
 *   consorcio y al propietario le llega prorrateado en la liquidación de expensas
 *   extraordinarias, que el kit ya registra por otro lado. Anotarlo también como pago
 *   al proveedor contaría el mismo gasto dos veces.
 *
 * Este archivo decide; no escribe. El repositorio es el que aplica.
 */

/** Fecha de calendario `YYYY-MM-DD`. */
export type DateKey = string;

/** Lo único que mira la regla para decidir. */
export interface WorkOrderForSettlement {
  id: string;
  title: string;
  status: string;
  /** propietario · inquilino · consorcio. Vacío se trata como propietario. */
  paid_by?: string | null;
  cost?: string | number | null;
  completed_at?: string | null;
  category?: string | null;
  vendor_contact_id?: string | null;
}

/** El egreso que corresponde registrar por una orden cerrada. */
export interface WorkOrderExpense {
  /** `workorder:<id>` — la misma orden nunca genera dos egresos. */
  sourceRef: string;
  amount: string;
  /** «Arreglo de plomería — Pérdida en la cocina del 1°B». */
  description: string;
  /** Cuándo salió la plata: el día que se completó el trabajo. */
  date: DateKey;
  /** El proveedor al que se le pagó, si quedó registrado. */
  vendorContactId: string | null;
}

/** Estados en los que la orden ya no genera ni sostiene un egreso. */
const SIN_EGRESO = new Set(['cancelada']);

const RUBROS: Record<string, string> = {
  plomeria: 'Plomería',
  electricidad: 'Electricidad',
  gas: 'Gas',
  pintura: 'Pintura',
  cerrajeria: 'Cerrajería',
  albanileria: 'Albañilería',
  otro: 'Mantenimiento',
};

/** `workorder:<id>` — la clave con la que el egreso se reconoce y no se duplica. */
export function workOrderRef(id: string): string {
  return `workorder:${id}`;
}

/**
 * El egreso que corresponde a una orden, o `null` si todavía no corresponde ninguno.
 *
 * Devolver `null` es una respuesta con sentido y no un error: una orden abierta, sin
 * costo cargado o pagada por el consorcio simplemente no mueve plata. Quien la aplica
 * usa ese `null` para BORRAR un egreso que ya no corresponde —una orden que se reabre
 * o cuyo costo se pone en cero deja de tener su salida en la caja.
 */
export function expenseForWorkOrder(
  order: WorkOrderForSettlement,
  today: DateKey
): WorkOrderExpense | null {
  if (order.status !== 'terminada' || SIN_EGRESO.has(order.status)) return null;

  const monto = Number(order.cost);
  // Sin costo cargado no hay nada que registrar: una orden puede cerrarse sabiendo que
  // se resolvió y sin que todavía haya llegado la factura del proveedor.
  if (!Number.isFinite(monto) || monto <= 0) return null;

  // El consorcio le cobra al propietario por expensas, no por este camino.
  if ((order.paid_by ?? '') === 'consorcio') return null;

  const rubro = RUBROS[String(order.category ?? '')] ?? 'Mantenimiento';

  return {
    sourceRef: workOrderRef(order.id),
    amount: String(monto),
    description: `${rubro} — ${order.title}`,
    // Una orden terminada sin fecha de finalización se toma como cerrada hoy: el egreso
    // tiene que caer en algún día de la caja, y el de hoy es el único que no inventa.
    date: order.completed_at || today,
    vendorContactId: order.vendor_contact_id || null,
  };
}
