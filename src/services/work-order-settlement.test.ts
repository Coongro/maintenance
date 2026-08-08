import { describe, expect, it } from 'vitest';

import { expenseForWorkOrder, workOrderRef } from './work-order-settlement.js';

const HOY = '2026-08-02';

const orden = {
  id: 'wo-1',
  title: 'Pérdida en la cocina del 1°B',
  status: 'terminada',
  paid_by: 'propietario',
  cost: '85000',
  completed_at: '2026-07-28',
  category: 'plomeria',
  vendor_contact_id: 'contacto-plomero',
};

describe('expenseForWorkOrder', () => {
  it('genera el egreso de una orden terminada con costo', () => {
    const egreso = expenseForWorkOrder(orden, HOY);

    expect(egreso).not.toBeNull();
    expect(egreso?.amount).toBe('85000');
    expect(egreso?.description).toBe('Plomería — Pérdida en la cocina del 1°B');
    expect(egreso?.date).toBe('2026-07-28');
    expect(egreso?.vendorContactId).toBe('contacto-plomero');
    expect(egreso?.sourceRef).toBe('workorder:wo-1');
  });

  it('lo paga el inquilino: igual sale plata, porque el propietario le paga al proveedor', () => {
    expect(expenseForWorkOrder({ ...orden, paid_by: 'inquilino' }, HOY)).not.toBeNull();
  });

  it('lo paga el consorcio: no hay egreso, llega por la liquidación de expensas', () => {
    expect(expenseForWorkOrder({ ...orden, paid_by: 'consorcio' }, HOY)).toBeNull();
  });

  it('sin «lo paga» cargado se comporta como propietario', () => {
    expect(expenseForWorkOrder({ ...orden, paid_by: null }, HOY)).not.toBeNull();
  });

  it('una orden todavía abierta no mueve plata', () => {
    expect(expenseForWorkOrder({ ...orden, status: 'en_curso' }, HOY)).toBeNull();
    expect(expenseForWorkOrder({ ...orden, status: 'abierta' }, HOY)).toBeNull();
  });

  it('una orden cancelada no mueve plata aunque tenga costo', () => {
    expect(expenseForWorkOrder({ ...orden, status: 'cancelada' }, HOY)).toBeNull();
  });

  it('terminada sin costo cargado todavía no genera egreso', () => {
    // Se resolvió el arreglo pero la factura del proveedor no llegó.
    expect(expenseForWorkOrder({ ...orden, cost: null }, HOY)).toBeNull();
    expect(expenseForWorkOrder({ ...orden, cost: '0' }, HOY)).toBeNull();
    expect(expenseForWorkOrder({ ...orden, cost: '' }, HOY)).toBeNull();
  });

  it('terminada sin fecha de finalización cae en el día de hoy', () => {
    expect(expenseForWorkOrder({ ...orden, completed_at: null }, HOY)?.date).toBe(HOY);
  });

  it('sin rubro cargado la descripción no queda coja', () => {
    expect(expenseForWorkOrder({ ...orden, category: null }, HOY)?.description).toBe(
      'Mantenimiento — Pérdida en la cocina del 1°B'
    );
  });

  it('la referencia es estable: la misma orden nunca genera dos egresos', () => {
    expect(workOrderRef('wo-1')).toBe('workorder:wo-1');
    expect(expenseForWorkOrder(orden, HOY)?.sourceRef).toBe(workOrderRef(orden.id));
  });
});
