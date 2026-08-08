/**
 * Action Contracts de maintenance.
 *
 * El contrato vive JUNTO al handler y es el MISMO objeto que valida en
 * runtime: por eso lo que se publica no puede desincronizarse de lo que la
 * implementación acepta. Un input vacío se declara con `none()`; no poder
 * inferir los parámetros es un error, no un schema vacío.
 */

// `none` no se importa: ninguna action de maintenance tiene input vacío. Estaba en el
// import desde COONG-275 sin usarse, y el lint del plugin lo trata como ERROR — con eso
// `npm run quality` fallaba y el pre-push quedaba bloqueado (COONG-294).
import { defineAction } from '@coongro/plugin-sdk/agentic';

export const listWorkOrders = defineAction({
  id: 'maintenance.workOrders.list',
  title: 'Listar arreglos',
  description:
    'Las órdenes de trabajo de la cartera, ordenadas por lo que hay que resolver primero: lo abierto arriba y dentro de eso por urgencia. Cada una trae la propiedad, la unidad, quién la reportó, el costo y qué pasó con la plata — si el proveedor ya cobró y si el gasto entró en el recibo del inquilino.',
  effect: 'read',
  confirmation: 'never',
  tenantScope: 'required',
  input: {
    type: 'object',
    properties: {
      limit: {
        type: 'integer',
        description: 'Cantidad de resultados a devolver. Default 20; máximo 50.',
      },
      offset: {
        type: 'integer',
        description: 'Cantidad de resultados a saltear para pedir la página siguiente.',
      },
    },
    additionalProperties: false,
  },
  output: {
    kind: 'collection',
    fields: [
      {
        key: 'title',
        name: 'title',
        label: 'Trabajo',
        format: 'text',
      },
      {
        key: 'property',
        name: 'property',
        label: 'Propiedad',
        format: 'text',
      },
      {
        key: 'unit',
        name: 'unit',
        label: 'Unidad',
        format: 'text',
      },
      {
        key: 'priority',
        name: 'priority',
        label: 'Prioridad',
        format: 'text',
        values: [
          {
            value: 'urgente',
            label: 'Urgente',
          },
          {
            value: 'alta',
            label: 'Alta',
          },
          {
            value: 'normal',
            label: 'Normal',
          },
          {
            value: 'baja',
            label: 'Baja',
          },
        ],
      },
      {
        key: 'status',
        name: 'status',
        label: 'Estado',
        format: 'text',
        values: [
          {
            value: 'abierta',
            label: 'Abierta',
          },
          {
            value: 'asignada',
            label: 'Asignada',
          },
          {
            value: 'en_curso',
            label: 'En curso',
          },
          {
            value: 'terminada',
            label: 'Terminada',
          },
          {
            value: 'cancelada',
            label: 'Cancelada',
          },
        ],
      },
      {
        key: 'cost',
        name: 'cost',
        label: 'Costo',
        format: 'money',
      },
      {
        key: 'expense_state',
        name: 'expenseState',
        label: 'Egreso',
        format: 'text',
        values: [
          {
            value: 'a_pagar',
            label: 'A pagar',
          },
          {
            value: 'pagado',
            label: 'Pagado',
          },
        ],
      },
      {
        key: 'tenant_state',
        name: 'tenantState',
        label: 'Al inquilino',
        format: 'text',
        values: [
          {
            value: 'a_cobrar',
            label: 'Falta cargarlo',
          },
          {
            value: 'cobrado',
            label: 'En su recibo',
          },
        ],
      },
    ],
    identifierKey: 'id',
    defaultLimit: 20,
    maxLimit: 50,
  },
});

export const getByIdWorkOrders = defineAction({
  id: 'maintenance.workOrders.getById',
  title: 'Ver un arreglo',
  description:
    'Una orden de trabajo por su id: qué hay que arreglar, en qué propiedad y unidad, con qué prioridad, quién lo paga, en qué estado está y cuánto costó.',
  effect: 'read',
  confirmation: 'never',
  tenantScope: 'required',
  input: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'El arreglo que se quiere ver.',
        ref: { resource: 'maintenance.workOrders' },
      },
    },
    required: ['id'],
    additionalProperties: false,
  },
  output: {
    kind: 'record',
    fields: [
      {
        key: 'title',
        name: 'title',
        label: 'Trabajo',
        format: 'text',
      },
      {
        key: 'property',
        name: 'property',
        label: 'Propiedad',
        format: 'text',
      },
      {
        key: 'unit',
        name: 'unit',
        label: 'Unidad',
        format: 'text',
      },
      {
        key: 'priority',
        name: 'priority',
        label: 'Prioridad',
        format: 'text',
        values: [
          {
            value: 'urgente',
            label: 'Urgente',
          },
          {
            value: 'alta',
            label: 'Alta',
          },
          {
            value: 'normal',
            label: 'Normal',
          },
          {
            value: 'baja',
            label: 'Baja',
          },
        ],
      },
      {
        key: 'status',
        name: 'status',
        label: 'Estado',
        format: 'text',
        values: [
          {
            value: 'abierta',
            label: 'Abierta',
          },
          {
            value: 'asignada',
            label: 'Asignada',
          },
          {
            value: 'en_curso',
            label: 'En curso',
          },
          {
            value: 'terminada',
            label: 'Terminada',
          },
          {
            value: 'cancelada',
            label: 'Cancelada',
          },
        ],
      },
      {
        key: 'cost',
        name: 'cost',
        label: 'Costo',
        format: 'money',
      },
      {
        key: 'expense_state',
        name: 'expenseState',
        label: 'Egreso',
        format: 'text',
        values: [
          {
            value: 'a_pagar',
            label: 'A pagar',
          },
          {
            value: 'pagado',
            label: 'Pagado',
          },
        ],
      },
      {
        key: 'tenant_state',
        name: 'tenantState',
        label: 'Al inquilino',
        format: 'text',
        values: [
          {
            value: 'a_cobrar',
            label: 'Falta cargarlo',
          },
          {
            value: 'cobrado',
            label: 'En su recibo',
          },
        ],
      },
    ],
    identifierKey: 'id',
  },
});

export const createWorkOrders = defineAction({
  id: 'maintenance.workOrders.create',
  title: 'Registrar un arreglo',
  description:
    'Abre una orden de trabajo sobre una propiedad o una unidad. ⚠️ Mueve plata: si se registra ya terminada y con costo, queda asentado el egreso al proveedor en Caja como deuda a pagar; y si el arreglo corre por cuenta del inquilino, entra en su recibo. «Lo paga» es lo que decide quién se hace cargo — no cambiarlo por defecto.',
  effect: 'write',
  confirmation: 'always',
  tenantScope: 'required',
  input: {
    type: 'object',
    properties: {
      data: {
        type: 'object',
        description: 'Datos de Orden de trabajo a crear.',
        properties: {
          title: {
            type: 'string',
            description: 'Título',
          },
          description: {
            type: 'string',
            description: 'Descripción',
          },
          priority: {
            type: 'string',
            enum: ['urgente', 'alta', 'normal', 'baja'],
            description:
              'Prioridad. Opciones: urgente (Urgente), alta (Alta), normal (Normal), baja (Baja).',
          },
          category: {
            type: 'string',
            enum: [
              'plomeria',
              'electricidad',
              'gas',
              'pintura',
              'cerrajeria',
              'albanileria',
              'otro',
            ],
            description:
              'Rubro. Opciones: plomeria (Plomería), electricidad (Electricidad), gas (Gas), pintura (Pintura), cerrajeria (Cerrajería), albanileria (Albañilería), otro (Otro).',
          },
          building_id: {
            type: 'string',
            format: 'uuid',
            description: 'La propiedad donde está el problema.',
            ref: { resource: 'properties.buildings' },
          },
          unit_id: {
            type: 'string',
            format: 'uuid',
            description:
              'La unidad puntual, si el arreglo es de una y no del edificio. Va junto con la propiedad a la que esa unidad pertenece.',
            ref: { resource: 'properties.units' },
          },
          reported_by_contact_id: {
            type: 'string',
            format: 'uuid',
            description: 'Quién avisó del problema — normalmente el inquilino.',
            ref: { resource: 'contacts' },
          },
          reported_at: {
            type: 'string',
            format: 'date',
            description: 'El día que avisaron.',
          },
          vendor_contact_id: {
            type: 'string',
            format: 'uuid',
            description:
              'El proveedor que hace el trabajo. Es a quien se le va a deber el egreso cuando la orden se cierre con un costo.',
            ref: { resource: 'contacts' },
          },
          scheduled_at: {
            type: 'string',
            format: 'date',
            description: 'Para cuándo está previsto.',
          },
          estimated_cost: {
            type: 'string',
            pattern: '^-?\\d+(?:\\.\\d+)?$',
            description: 'Lo que se presupuestó. No mueve plata: la que cuenta es «Costo final».',
          },
          paid_by: {
            type: 'string',
            enum: ['propietario', 'inquilino', 'consorcio'],
            description:
              'Lo paga. Opciones: propietario (El propietario), inquilino (El inquilino), consorcio (El consorcio).',
          },
          status: {
            type: 'string',
            enum: ['abierta', 'asignada', 'en_curso', 'terminada', 'cancelada'],
            description:
              'Estado. Opciones: abierta (Abierta), asignada (Asignada), en_curso (En curso), terminada (Terminada), cancelada (Cancelada).',
          },
          notes: {
            type: 'string',
            description: 'Notas',
          },
          completed_at: {
            type: 'string',
            format: 'date',
            description: 'El día que quedó resuelto.',
          },
          cost: {
            type: 'string',
            pattern: '^-?\\d+(?:\\.\\d+)?$',
            description:
              'Lo que salió de verdad. Este número es el que mueve la plata: con la orden terminada, se le debe al proveedor. Corregirlo corrige el egreso; vaciarlo lo da de baja, salvo que ya se le haya pagado.',
          },
        },
        required: ['title', 'priority', 'building_id', 'status'],
        additionalProperties: false,
      },
    },
    required: ['data'],
    additionalProperties: false,
  },
  output: {
    kind: 'record',
    fields: [
      {
        key: 'title',
        name: 'title',
        label: 'Trabajo',
        format: 'text',
      },
      {
        key: 'property',
        name: 'property',
        label: 'Propiedad',
        format: 'text',
      },
      {
        key: 'unit',
        name: 'unit',
        label: 'Unidad',
        format: 'text',
      },
      {
        key: 'priority',
        name: 'priority',
        label: 'Prioridad',
        format: 'text',
        values: [
          {
            value: 'urgente',
            label: 'Urgente',
          },
          {
            value: 'alta',
            label: 'Alta',
          },
          {
            value: 'normal',
            label: 'Normal',
          },
          {
            value: 'baja',
            label: 'Baja',
          },
        ],
      },
      {
        key: 'status',
        name: 'status',
        label: 'Estado',
        format: 'text',
        values: [
          {
            value: 'abierta',
            label: 'Abierta',
          },
          {
            value: 'asignada',
            label: 'Asignada',
          },
          {
            value: 'en_curso',
            label: 'En curso',
          },
          {
            value: 'terminada',
            label: 'Terminada',
          },
          {
            value: 'cancelada',
            label: 'Cancelada',
          },
        ],
      },
      {
        key: 'cost',
        name: 'cost',
        label: 'Costo',
        format: 'money',
      },
      {
        key: 'expense_state',
        name: 'expenseState',
        label: 'Egreso',
        format: 'text',
        values: [
          {
            value: 'a_pagar',
            label: 'A pagar',
          },
          {
            value: 'pagado',
            label: 'Pagado',
          },
        ],
      },
      {
        key: 'tenant_state',
        name: 'tenantState',
        label: 'Al inquilino',
        format: 'text',
        values: [
          {
            value: 'a_cobrar',
            label: 'Falta cargarlo',
          },
          {
            value: 'cobrado',
            label: 'En su recibo',
          },
        ],
      },
    ],
    identifierKey: 'id',
  },
});

export const updateWorkOrders = defineAction({
  id: 'maintenance.workOrders.update',
  title: 'Actualizar un arreglo',
  description:
    'Cambia los datos de una orden de trabajo. ⚠️ Acá se cierra un arreglo: ponerle estado «terminada» junto con el costo final REGISTRA el egreso al proveedor en Caja —queda como deuda, no como pago— y, si corre por cuenta del inquilino, arma la línea de su recibo. Reabrirla o pasarla a «la paga el consorcio» da de baja ese egreso, salvo que ya se le haya pagado al proveedor: en ese caso no se toca y hay que resolverlo a mano.',
  effect: 'write',
  confirmation: 'always',
  tenantScope: 'required',
  input: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'El arreglo a actualizar.',
        ref: { resource: 'maintenance.workOrders' },
      },
      data: {
        type: 'object',
        description: 'Los campos del arreglo que se quieren cambiar.',
        properties: {
          title: {
            type: 'string',
            description: 'Título',
          },
          description: {
            type: 'string',
            description: 'Descripción',
          },
          priority: {
            type: 'string',
            enum: ['urgente', 'alta', 'normal', 'baja'],
            description:
              'Prioridad. Opciones: urgente (Urgente), alta (Alta), normal (Normal), baja (Baja).',
          },
          category: {
            type: 'string',
            enum: [
              'plomeria',
              'electricidad',
              'gas',
              'pintura',
              'cerrajeria',
              'albanileria',
              'otro',
            ],
            description:
              'Rubro. Opciones: plomeria (Plomería), electricidad (Electricidad), gas (Gas), pintura (Pintura), cerrajeria (Cerrajería), albanileria (Albañilería), otro (Otro).',
          },
          building_id: {
            type: 'string',
            format: 'uuid',
            description: 'La propiedad donde está el problema.',
            ref: { resource: 'properties.buildings' },
          },
          unit_id: {
            type: 'string',
            format: 'uuid',
            description:
              'La unidad puntual, si el arreglo es de una y no del edificio. Va junto con la propiedad a la que esa unidad pertenece.',
            ref: { resource: 'properties.units' },
          },
          reported_by_contact_id: {
            type: 'string',
            format: 'uuid',
            description: 'Quién avisó del problema — normalmente el inquilino.',
            ref: { resource: 'contacts' },
          },
          reported_at: {
            type: 'string',
            format: 'date',
            description: 'El día que avisaron.',
          },
          vendor_contact_id: {
            type: 'string',
            format: 'uuid',
            description:
              'El proveedor que hace el trabajo. Es a quien se le va a deber el egreso cuando la orden se cierre con un costo.',
            ref: { resource: 'contacts' },
          },
          scheduled_at: {
            type: 'string',
            format: 'date',
            description: 'Para cuándo está previsto.',
          },
          estimated_cost: {
            type: 'string',
            pattern: '^-?\\d+(?:\\.\\d+)?$',
            description: 'Lo que se presupuestó. No mueve plata: la que cuenta es «Costo final».',
          },
          paid_by: {
            type: 'string',
            enum: ['propietario', 'inquilino', 'consorcio'],
            description:
              'Lo paga. Opciones: propietario (El propietario), inquilino (El inquilino), consorcio (El consorcio).',
          },
          status: {
            type: 'string',
            enum: ['abierta', 'asignada', 'en_curso', 'terminada', 'cancelada'],
            description:
              'Estado. Opciones: abierta (Abierta), asignada (Asignada), en_curso (En curso), terminada (Terminada), cancelada (Cancelada).',
          },
          notes: {
            type: 'string',
            description: 'Notas',
          },
          completed_at: {
            type: 'string',
            format: 'date',
            description: 'El día que quedó resuelto.',
          },
          cost: {
            type: 'string',
            pattern: '^-?\\d+(?:\\.\\d+)?$',
            description:
              'Lo que salió de verdad. Este número es el que mueve la plata: con la orden terminada, se le debe al proveedor. Corregirlo corrige el egreso; vaciarlo lo da de baja, salvo que ya se le haya pagado.',
          },
        },
        additionalProperties: false,
      },
    },
    required: ['id', 'data'],
    additionalProperties: false,
  },
  output: {
    kind: 'record',
    fields: [
      {
        key: 'title',
        name: 'title',
        label: 'Trabajo',
        format: 'text',
      },
      {
        key: 'property',
        name: 'property',
        label: 'Propiedad',
        format: 'text',
      },
      {
        key: 'unit',
        name: 'unit',
        label: 'Unidad',
        format: 'text',
      },
      {
        key: 'priority',
        name: 'priority',
        label: 'Prioridad',
        format: 'text',
        values: [
          {
            value: 'urgente',
            label: 'Urgente',
          },
          {
            value: 'alta',
            label: 'Alta',
          },
          {
            value: 'normal',
            label: 'Normal',
          },
          {
            value: 'baja',
            label: 'Baja',
          },
        ],
      },
      {
        key: 'status',
        name: 'status',
        label: 'Estado',
        format: 'text',
        values: [
          {
            value: 'abierta',
            label: 'Abierta',
          },
          {
            value: 'asignada',
            label: 'Asignada',
          },
          {
            value: 'en_curso',
            label: 'En curso',
          },
          {
            value: 'terminada',
            label: 'Terminada',
          },
          {
            value: 'cancelada',
            label: 'Cancelada',
          },
        ],
      },
      {
        key: 'cost',
        name: 'cost',
        label: 'Costo',
        format: 'money',
      },
      {
        key: 'expense_state',
        name: 'expenseState',
        label: 'Egreso',
        format: 'text',
        values: [
          {
            value: 'a_pagar',
            label: 'A pagar',
          },
          {
            value: 'pagado',
            label: 'Pagado',
          },
        ],
      },
      {
        key: 'tenant_state',
        name: 'tenantState',
        label: 'Al inquilino',
        format: 'text',
        values: [
          {
            value: 'a_cobrar',
            label: 'Falta cargarlo',
          },
          {
            value: 'cobrado',
            label: 'En su recibo',
          },
        ],
      },
    ],
    identifierKey: 'id',
  },
});

export const overviewWorkOrders = defineAction({
  id: 'maintenance.workOrders.overview',
  title: 'Cuánto cuesta mantener la cartera',
  description:
    'Los totales de mantenimiento de un año. Separa lo que sale del bolsillo del propietario y no vuelve, de lo que se adelanta por cuenta del inquilino y se recupera en su recibo: sumarlos daría un gasto inflado justo cuando el número sirve para decidir, a fin de año, si conviene deducir gastos reales o el presunto. Cuenta solo arreglos terminados que generaron egreso.',
  effect: 'read',
  confirmation: 'never',
  tenantScope: 'required',
  input: {
    type: 'object',
    properties: {
      year: {
        type: 'integer',
        description: 'El año a mirar. Si se omite, el año en curso.',
      },
    },
    additionalProperties: false,
  },
  // Devuelve UN resumen de totales, no la lista de órdenes. El borrador había
  // copiado las columnas del listado: el agente habría pedido «cuánto gasté» y
  // el catálogo le prometía una tabla de arreglos.
  output: {
    kind: 'record',
    fields: [
      {
        key: 'gastoPropio',
        name: 'gastoPropio',
        label: 'Gasto del propietario',
        format: 'money',
      },
      {
        key: 'ordenes',
        name: 'ordenes',
        label: 'Arreglos que lo componen',
        format: 'number',
      },
      {
        key: 'aPagar',
        name: 'aPagar',
        label: 'Se le debe a proveedores',
        format: 'money',
      },
      {
        key: 'aPagarOrdenes',
        name: 'aPagarOrdenes',
        label: 'Arreglos impagos',
        format: 'number',
      },
      {
        key: 'aRecuperar',
        name: 'aRecuperar',
        label: 'A recuperar del inquilino',
        format: 'money',
      },
      {
        key: 'aRecuperarOrdenes',
        name: 'aRecuperarOrdenes',
        label: 'Arreglos a recuperar',
        format: 'number',
      },
    ],
  },
});
