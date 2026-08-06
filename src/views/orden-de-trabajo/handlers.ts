/**
 * Lógica custom de «Orden de trabajo» (OrdenDeTrabajoView).
 *
 * Este archivo es TUYO: el Builder lo crea una sola vez y NUNCA lo pisa al
 * regenerar. Los archivos regenerables (`orden-de-trabajo.view.ts`,
 * `use-orden-de-trabajo.ts`, `index.ts`) invocan estos puntos de extensión si
 * existen — acá va lo que el diseño no puede expresar.
 */

import type { CustomHandlers } from '@coongro/plugin-sdk';

export const customHandlers: CustomHandlers = {
  // Cómo se lee cada unidad en el desplegable —«Belgrano 1240 · 1°A» con su detalle
  // debajo— NO se decide acá: es diseño del campo y se elige en el Builder («Texto de
  // cada opción» y «Subtítulo de cada opción»). Una orden cargada a la unidad equivocada
  // manda al plomero a otra dirección; por eso el campo tiene que identificarla.
};
