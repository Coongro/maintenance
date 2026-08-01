/**
 * Orden de trabajo — composición y render (generado por el Builder de Vistas).
 *
 * ⚠️ ARCHIVO REGENERABLE: se reescribe al guardar el diseño en el Builder.
 * La lógica custom va en `handlers.ts` (nunca se pisa). Diseño: `spec.json`.
 */
import { getHostReact, getHostUI, usePlugin } from '@coongro/plugin-sdk';

import { useOrdenDeTrabajoView } from './use-orden-de-trabajo.js';

const React = getHostReact();
const h = React.createElement;
// Componentes del HOST: el diseño vive en core — una actualización de
// ui-components se refleja acá sin regenerar esta vista.
const UI = getHostUI() as any;

export function OrdenDeTrabajoView() {
  const {
    views: { closeDialog },
  } = usePlugin();
  const { values, errors, setField, refOptions, refLabel, submit, editingId } =
    useOrdenDeTrabajoView();

  return h(
    'div',
    { style: { display: 'flex', flexDirection: 'column' as const } },
    h(
      'div',
      {
        style: { padding: '20px', display: 'flex', flexDirection: 'column' as const, gap: '16px' },
      },
      h(
        'div',
        { 'data-cg-block-id': 's1', style: { display: 'contents' } },
        h(
          UI.FormSection,
          { icon: 'Wrench', title: 'El trabajo' },
          h(
            'div',
            {
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                alignItems: 'stretch',
              },
            },
            h(
              'div',
              { 'data-cg-block-id': 'f_title', style: { display: 'contents' } },
              h(
                'div',
                { style: { flex: '1 1 100%', minWidth: 0 } },
                h(
                  UI.Label,
                  { htmlFor: 'title', style: { display: 'block', marginBottom: '6px' } },
                  'Título',
                  h('span', { style: { color: 'var(--cg-danger)' } }, ' *')
                ),
                h(UI.Input, {
                  id: 'title',
                  type: 'text',
                  value: String(values['title'] ?? ''),
                  placeholder: 'Ej: pérdida en la cocina',
                  onChange: (e: any) => setField('title', e.target.value),
                }),
                errors['title']
                  ? h(
                      'div',
                      { style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' } },
                      errors['title']
                    )
                  : null
              )
            ),
            h(
              'div',
              { 'data-cg-block-id': 'f_desc', style: { display: 'contents' } },
              h(
                'div',
                { style: { flex: '1 1 100%', minWidth: 0 } },
                h(
                  UI.Label,
                  { htmlFor: 'description', style: { display: 'block', marginBottom: '6px' } },
                  'Descripción'
                ),
                h(UI.Input, {
                  id: 'description',
                  type: 'text',
                  value: String(values['description'] ?? ''),
                  placeholder: 'Ej: pierde la canilla de la bacha, moja el mueble de abajo',
                  onChange: (e: any) => setField('description', e.target.value),
                }),
                errors['description']
                  ? h(
                      'div',
                      { style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' } },
                      errors['description']
                    )
                  : null
              )
            ),
            h(
              'div',
              { style: { display: 'flex', gap: '14px', alignItems: 'flex-start' } },
              h(
                'div',
                { 'data-cg-block-id': 'f_priority', style: { display: 'contents' } },
                h(
                  'div',
                  { style: { flex: '1 1 260px', minWidth: 0 } },
                  h(
                    UI.Label,
                    { htmlFor: 'priority', style: { display: 'block', marginBottom: '6px' } },
                    'Prioridad',
                    h('span', { style: { color: 'var(--cg-danger)' } }, ' *')
                  ),
                  h(
                    UI.Select,
                    {
                      value: String(values['priority'] ?? ''),
                      onValueChange: (v: string) => setField('priority', v),
                      placeholder: 'Elegir…',
                      clearable: true,
                    },
                    h(
                      UI.SelectItem,
                      {
                        key: 'urgente',
                        value: 'urgente',
                        icon: h(UI.DynamicIcon, { icon: 'TriangleAlert', size: 16 }),
                      },
                      'Urgente'
                    ),
                    h(
                      UI.SelectItem,
                      {
                        key: 'alta',
                        value: 'alta',
                        icon: h(UI.DynamicIcon, { icon: 'ArrowUp', size: 16 }),
                      },
                      'Alta'
                    ),
                    h(
                      UI.SelectItem,
                      {
                        key: 'normal',
                        value: 'normal',
                        icon: h(UI.DynamicIcon, { icon: 'Minus', size: 16 }),
                      },
                      'Normal'
                    ),
                    h(
                      UI.SelectItem,
                      {
                        key: 'baja',
                        value: 'baja',
                        icon: h(UI.DynamicIcon, { icon: 'ArrowDown', size: 16 }),
                      },
                      'Baja'
                    )
                  ),
                  errors['priority']
                    ? h(
                        'div',
                        {
                          style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' },
                        },
                        errors['priority']
                      )
                    : null
                )
              ),
              h(
                'div',
                { 'data-cg-block-id': 'f_category', style: { display: 'contents' } },
                h(
                  'div',
                  { style: { flex: '1 1 260px', minWidth: 0 } },
                  h(
                    UI.Label,
                    { htmlFor: 'category', style: { display: 'block', marginBottom: '6px' } },
                    'Rubro'
                  ),
                  h(
                    UI.Select,
                    {
                      value: String(values['category'] ?? ''),
                      onValueChange: (v: string) => setField('category', v),
                      placeholder: 'Elegir…',
                      clearable: true,
                    },
                    h(
                      UI.SelectItem,
                      {
                        key: 'plomeria',
                        value: 'plomeria',
                        icon: h(UI.DynamicIcon, { icon: 'Droplet', size: 16 }),
                      },
                      'Plomería'
                    ),
                    h(
                      UI.SelectItem,
                      {
                        key: 'electricidad',
                        value: 'electricidad',
                        icon: h(UI.DynamicIcon, { icon: 'Zap', size: 16 }),
                      },
                      'Electricidad'
                    ),
                    h(
                      UI.SelectItem,
                      {
                        key: 'gas',
                        value: 'gas',
                        icon: h(UI.DynamicIcon, { icon: 'Flame', size: 16 }),
                      },
                      'Gas'
                    ),
                    h(
                      UI.SelectItem,
                      {
                        key: 'pintura',
                        value: 'pintura',
                        icon: h(UI.DynamicIcon, { icon: 'Paintbrush', size: 16 }),
                      },
                      'Pintura'
                    ),
                    h(
                      UI.SelectItem,
                      {
                        key: 'cerrajeria',
                        value: 'cerrajeria',
                        icon: h(UI.DynamicIcon, { icon: 'KeyRound', size: 16 }),
                      },
                      'Cerrajería'
                    ),
                    h(
                      UI.SelectItem,
                      {
                        key: 'albanileria',
                        value: 'albanileria',
                        icon: h(UI.DynamicIcon, { icon: 'Hammer', size: 16 }),
                      },
                      'Albañilería'
                    ),
                    h(
                      UI.SelectItem,
                      {
                        key: 'otro',
                        value: 'otro',
                        icon: h(UI.DynamicIcon, { icon: 'Wrench', size: 16 }),
                      },
                      'Otro'
                    )
                  ),
                  errors['category']
                    ? h(
                        'div',
                        {
                          style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' },
                        },
                        errors['category']
                      )
                    : null
                )
              )
            )
          )
        )
      ),
      h(
        'div',
        { 'data-cg-block-id': 's2', style: { display: 'contents' } },
        h(
          UI.FormSection,
          { icon: 'MapPin', title: 'Dónde' },
          h(
            'div',
            {
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                alignItems: 'stretch',
              },
            },
            h(
              'div',
              { style: { display: 'flex', gap: '14px', alignItems: 'flex-start' } },
              h(
                'div',
                { 'data-cg-block-id': 'f_building', style: { display: 'contents' } },
                h(
                  'div',
                  { style: { flex: '1 1 260px', minWidth: 0 } },
                  h(
                    UI.Label,
                    { htmlFor: 'building_id', style: { display: 'block', marginBottom: '6px' } },
                    'Propiedad',
                    h('span', { style: { color: 'var(--cg-danger)' } }, ' *')
                  ),
                  h(
                    UI.Select,
                    {
                      value: String(values['building_id'] ?? ''),
                      onValueChange: (v: string) => setField('building_id', v),
                      placeholder: 'Elegir…',
                      clearable: true,
                    },
                    ...(refOptions['building_id'] ?? []).map((r: any) =>
                      h(UI.SelectItem, { key: String(r.id), value: String(r.id) }, refLabel(r))
                    )
                  ),
                  errors['building_id']
                    ? h(
                        'div',
                        {
                          style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' },
                        },
                        errors['building_id']
                      )
                    : null
                )
              ),
              h(
                'div',
                { 'data-cg-block-id': 'f_unit', style: { display: 'contents' } },
                h(
                  'div',
                  { style: { flex: '1 1 260px', minWidth: 0 } },
                  h(
                    UI.Label,
                    { htmlFor: 'unit_id', style: { display: 'block', marginBottom: '6px' } },
                    'Unidad'
                  ),
                  h(
                    UI.Select,
                    {
                      value: String(values['unit_id'] ?? ''),
                      onValueChange: (v: string) => setField('unit_id', v),
                      placeholder: 'Elegir…',
                      clearable: true,
                    },
                    ...(refOptions['unit_id'] ?? []).map((r: any) =>
                      h(UI.SelectItem, { key: String(r.id), value: String(r.id) }, refLabel(r))
                    )
                  ),
                  errors['unit_id']
                    ? h(
                        'div',
                        {
                          style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' },
                        },
                        errors['unit_id']
                      )
                    : null
                )
              )
            ),
            h(
              'div',
              { style: { display: 'flex', gap: '14px', alignItems: 'flex-start' } },
              h(
                'div',
                { 'data-cg-block-id': 'f_reported_by', style: { display: 'contents' } },
                h(
                  'div',
                  { style: { flex: '1 1 260px', minWidth: 0 } },
                  h(
                    UI.Label,
                    {
                      htmlFor: 'reported_by_contact_id',
                      style: { display: 'block', marginBottom: '6px' },
                    },
                    'Lo reportó'
                  ),
                  h(
                    UI.Select,
                    {
                      value: String(values['reported_by_contact_id'] ?? ''),
                      onValueChange: (v: string) => setField('reported_by_contact_id', v),
                      placeholder: 'Elegir…',
                      clearable: true,
                    },
                    ...(refOptions['reported_by_contact_id'] ?? []).map((r: any) =>
                      h(UI.SelectItem, { key: String(r.id), value: String(r.id) }, refLabel(r))
                    )
                  ),
                  errors['reported_by_contact_id']
                    ? h(
                        'div',
                        {
                          style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' },
                        },
                        errors['reported_by_contact_id']
                      )
                    : null
                )
              ),
              h(
                'div',
                { 'data-cg-block-id': 'f_reported_at', style: { display: 'contents' } },
                h(
                  'div',
                  { style: { flex: '1 1 260px', minWidth: 0 } },
                  h(
                    UI.Label,
                    { htmlFor: 'reported_at', style: { display: 'block', marginBottom: '6px' } },
                    'Fecha del reclamo'
                  ),
                  h(UI.Input, {
                    id: 'reported_at',
                    type: 'date',
                    value: String(values['reported_at'] ?? ''),
                    onChange: (e: any) => setField('reported_at', e.target.value),
                  }),
                  errors['reported_at']
                    ? h(
                        'div',
                        {
                          style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' },
                        },
                        errors['reported_at']
                      )
                    : null
                )
              )
            )
          )
        )
      ),
      h(
        'div',
        { 'data-cg-block-id': 's3', style: { display: 'contents' } },
        h(
          UI.FormSection,
          { icon: 'UserCheck', title: 'Quién lo hace' },
          h(
            'div',
            {
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                alignItems: 'stretch',
              },
            },
            h(
              'div',
              { style: { display: 'flex', gap: '14px', alignItems: 'flex-start' } },
              h(
                'div',
                { 'data-cg-block-id': 'f_vendor', style: { display: 'contents' } },
                h(
                  'div',
                  { style: { flex: '1 1 260px', minWidth: 0 } },
                  h(
                    UI.Label,
                    {
                      htmlFor: 'vendor_contact_id',
                      style: { display: 'block', marginBottom: '6px' },
                    },
                    'Proveedor'
                  ),
                  h(
                    UI.Select,
                    {
                      value: String(values['vendor_contact_id'] ?? ''),
                      onValueChange: (v: string) => setField('vendor_contact_id', v),
                      placeholder: 'Elegir…',
                      clearable: true,
                    },
                    ...(refOptions['vendor_contact_id'] ?? []).map((r: any) =>
                      h(UI.SelectItem, { key: String(r.id), value: String(r.id) }, refLabel(r))
                    )
                  ),
                  errors['vendor_contact_id']
                    ? h(
                        'div',
                        {
                          style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' },
                        },
                        errors['vendor_contact_id']
                      )
                    : null
                )
              ),
              h(
                'div',
                { 'data-cg-block-id': 'f_scheduled', style: { display: 'contents' } },
                h(
                  'div',
                  { style: { flex: '1 1 260px', minWidth: 0 } },
                  h(
                    UI.Label,
                    { htmlFor: 'scheduled_at', style: { display: 'block', marginBottom: '6px' } },
                    'Fecha prevista'
                  ),
                  h(UI.Input, {
                    id: 'scheduled_at',
                    type: 'date',
                    value: String(values['scheduled_at'] ?? ''),
                    onChange: (e: any) => setField('scheduled_at', e.target.value),
                  }),
                  errors['scheduled_at']
                    ? h(
                        'div',
                        {
                          style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' },
                        },
                        errors['scheduled_at']
                      )
                    : null
                )
              )
            ),
            h(
              'div',
              { style: { display: 'flex', gap: '14px', alignItems: 'flex-start' } },
              h(
                'div',
                { 'data-cg-block-id': 'f_estimate', style: { display: 'contents' } },
                h(
                  'div',
                  { style: { flex: '1 1 260px', minWidth: 0 } },
                  h(
                    UI.Label,
                    { htmlFor: 'estimated_cost', style: { display: 'block', marginBottom: '6px' } },
                    'Presupuesto estimado'
                  ),
                  h(
                    'div',
                    { style: { position: 'relative', display: 'flex', alignItems: 'center' } },
                    h(
                      'span',
                      {
                        style: {
                          position: 'absolute',
                          left: '11px',
                          color: 'var(--cg-text-muted)',
                          fontSize: '13px',
                          pointerEvents: 'none',
                        },
                      },
                      '$'
                    ),
                    h(UI.Input, {
                      id: 'estimated_cost',
                      type: 'number',
                      inputMode: 'decimal',
                      value: values['estimated_cost'] ?? '',
                      placeholder: 'Ej: 85000',
                      onChange: (e: any) =>
                        setField(
                          'estimated_cost',
                          e.target.value === '' ? null : Number(e.target.value)
                        ),
                      style: { paddingLeft: '22px', textAlign: 'right' as const },
                    })
                  ),
                  errors['estimated_cost']
                    ? h(
                        'div',
                        {
                          style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' },
                        },
                        errors['estimated_cost']
                      )
                    : null
                )
              ),
              h(
                'div',
                { 'data-cg-block-id': 'f_paid_by', style: { display: 'contents' } },
                h(
                  'div',
                  { style: { flex: '1 1 260px', minWidth: 0 } },
                  h(
                    UI.Label,
                    { htmlFor: 'paid_by', style: { display: 'block', marginBottom: '6px' } },
                    'Lo paga'
                  ),
                  h(
                    UI.Select,
                    {
                      value: String(values['paid_by'] ?? ''),
                      onValueChange: (v: string) => setField('paid_by', v),
                      placeholder: 'Elegir…',
                      clearable: true,
                    },
                    h(
                      UI.SelectItem,
                      { key: 'propietario', value: 'propietario' },
                      'El propietario'
                    ),
                    h(UI.SelectItem, { key: 'inquilino', value: 'inquilino' }, 'El inquilino'),
                    h(UI.SelectItem, { key: 'consorcio', value: 'consorcio' }, 'El consorcio')
                  ),
                  errors['paid_by']
                    ? h(
                        'div',
                        {
                          style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' },
                        },
                        errors['paid_by']
                      )
                    : null
                )
              )
            )
          )
        )
      ),
      h(
        'div',
        { 'data-cg-block-id': 's4', style: { display: 'contents' } },
        h(
          UI.FormSection,
          { icon: 'Activity', title: 'Estado' },
          h(
            'div',
            {
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                alignItems: 'stretch',
              },
            },
            h(
              'div',
              { 'data-cg-block-id': 'f_status', style: { display: 'contents' } },
              h(
                'div',
                { style: { flex: '1 1 100%', minWidth: 0 } },
                h(
                  UI.Label,
                  { htmlFor: 'status', style: { display: 'block', marginBottom: '6px' } },
                  'Estado',
                  h('span', { style: { color: 'var(--cg-danger)' } }, ' *')
                ),
                h(
                  UI.Select,
                  {
                    value: String(values['status'] ?? ''),
                    onValueChange: (v: string) => setField('status', v),
                    placeholder: 'Elegir…',
                    clearable: true,
                  },
                  h(
                    UI.SelectItem,
                    {
                      key: 'abierta',
                      value: 'abierta',
                      icon: h(UI.DynamicIcon, { icon: 'CircleDot', size: 16 }),
                    },
                    'Abierta'
                  ),
                  h(
                    UI.SelectItem,
                    {
                      key: 'asignada',
                      value: 'asignada',
                      icon: h(UI.DynamicIcon, { icon: 'UserCheck', size: 16 }),
                    },
                    'Asignada'
                  ),
                  h(
                    UI.SelectItem,
                    {
                      key: 'en_curso',
                      value: 'en_curso',
                      icon: h(UI.DynamicIcon, { icon: 'Hammer', size: 16 }),
                    },
                    'En curso'
                  ),
                  h(
                    UI.SelectItem,
                    {
                      key: 'terminada',
                      value: 'terminada',
                      icon: h(UI.DynamicIcon, { icon: 'CircleCheck', size: 16 }),
                    },
                    'Terminada'
                  ),
                  h(
                    UI.SelectItem,
                    {
                      key: 'cancelada',
                      value: 'cancelada',
                      icon: h(UI.DynamicIcon, { icon: 'CircleSlash', size: 16 }),
                    },
                    'Cancelada'
                  )
                ),
                errors['status']
                  ? h(
                      'div',
                      { style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' } },
                      errors['status']
                    )
                  : null
              )
            ),
            h(
              'div',
              { 'data-cg-block-id': 'f_notes', style: { display: 'contents' } },
              h(
                'div',
                { style: { flex: '1 1 100%', minWidth: 0 } },
                h(
                  UI.Label,
                  { htmlFor: 'notes', style: { display: 'block', marginBottom: '6px' } },
                  'Notas'
                ),
                h(UI.Input, {
                  id: 'notes',
                  type: 'text',
                  value: String(values['notes'] ?? ''),
                  placeholder: 'Ej: el encargado tiene la llave',
                  onChange: (e: any) => setField('notes', e.target.value),
                }),
                errors['notes']
                  ? h(
                      'div',
                      { style: { fontSize: '12px', color: 'var(--cg-danger)', marginTop: '4px' } },
                      errors['notes']
                    )
                  : null
              )
            )
          )
        )
      )
    ),
    h(
      UI.DialogFooter,
      null,
      h(
        UI.Button,
        {
          variant: 'ghost',
          onClick: () => {
            closeDialog();
          },
        },
        'Cancelar'
      ),
      h(
        UI.Button,
        {
          onClick: () => {
            void submit();
          },
        },
        editingId ? 'Actualizar' : 'Guardar'
      )
    )
  );
}
