/**
 * Lógica custom de «Mantenimiento» (MantenimientoView).
 *
 * Este archivo es TUYO: el Builder lo crea una sola vez y NUNCA lo pisa al
 * regenerar. Los archivos regenerables (`mantenimiento.view.ts`,
 * `use-mantenimiento.ts`, `index.ts`) invocan estos puntos de extensión si
 * existen — acá va lo que el diseño no puede expresar.
 *
 * Acá solo se decide cómo CONTAR lo que el servidor ya calculó
 * (`maintenance.workOrders.overview`): las sumas viven en el repositorio para que la
 * pantalla y el Copilot respondan lo mismo si alguien pregunta cuánto cuesta mantener
 * una cartera.
 */

import { formatMoney, plural, type CustomHandlers } from '@coongro/plugin-sdk';

/** El resumen de la plata de los arreglos, como lo devuelve el servidor. */
interface MaintenanceOverview {
  gastoPropio: number;
  ordenes: number;
  aPagar: number;
  aPagarOrdenes: number;
  aRecuperar: number;
  aRecuperarOrdenes: number;
}

export const customHandlers: CustomHandlers = {
  loadLiveValues: async ({ execute }) => {
    const o = await execute<MaintenanceOverview>('maintenance.workOrders.overview');
    const anio = new Date().getFullYear();

    return {
      k1: {
        value: formatMoney(o.gastoPropio),
        // El año va en el subtítulo y no en la etiqueta porque el número es lo que se
        // lee primero; el período es el contexto que lo hace interpretable.
        sub: o.ordenes
          ? `${plural(o.ordenes, 'arreglo', 'arreglos')} en ${anio}`
          : `sin gastos en ${anio}`,
      },
      k2: {
        value: formatMoney(o.aPagar),
        sub: o.aPagarOrdenes
          ? `${plural(o.aPagarOrdenes, 'egreso sin saldar', 'egresos sin saldar')}`
          : 'no le debés nada a nadie',
      },
      k3: {
        value: formatMoney(o.aRecuperar),
        sub: o.aRecuperarOrdenes ? 'adelantado por cuenta suya' : 'nada a recuperar',
      },
    };
  },
};
