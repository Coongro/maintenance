/**
 * Orden de trabajo — datos y estado (generado por el Builder de Vistas).
 *
 * ⚠️ ARCHIVO REGENERABLE: se reescribe al guardar el diseño en el Builder.
 * La lógica custom va en `handlers.ts` (nunca se pisa). Diseño: `spec.json`.
 */
import { actions, getHostReact, usePlugin, views } from '@coongro/plugin-sdk';

import { customHandlers } from './handlers.js';

const React = getHostReact();
const { useState, useEffect, useCallback, useRef } = React;

export function useOrdenDeTrabajoView() {
  const {
    toast,
    views: { closeDialog },
  } = usePlugin();
  const mounted = useRef(true);
  // reset en el mount (no solo cleanup): StrictMode desmonta y REMONTA
  // conservando refs — con cleanup solo, el remonte quedaría muerto
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const [values, setValues] = useState<Record<string, any>>({
    title: null,
    description: null,
    priority: null,
    category: null,
    building_id: null,
    unit_id: null,
    reported_by_contact_id: null,
    reported_at: null,
    vendor_contact_id: null,
    scheduled_at: null,
    estimated_cost: null,
    paid_by: null,
    status: null,
    notes: null,
    completed_at: null,
    cost: null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const setField = useCallback((k: string, v: any) => {
    setValues((prev: any) => ({ ...prev, [k]: v }));
    setErrors((e: any) => ({ ...e, [k]: undefined }));
  }, []);
  useEffect(() => {
    const init = customHandlers.onInit;
    if (!init) return;
    void init({
      execute: function exec<T = unknown>(id: string, args?: unknown): Promise<T> {
        return actions.execute<T>(id, args);
      },
      editingId,
      record: initialRecord,
    })
      .then((initial) => {
        if (!initial || !mounted.current) return;
        setValues((prev: any) => {
          const next = { ...prev };
          for (const [k, v] of Object.entries(initial)) {
            if (next[k] === undefined || next[k] === '' || next[k] === null) next[k] = v;
          }
          return next;
        });
      })
      .catch(() => {});
    // deps intencionalmente fijas: el efecto corre una sola vez
  }, []);

  // record con el que se abrió la vista (views.open(id, { record })), si hubo — lo
  // reciben los handlers en onSubmit (ej. una acción de fila que necesita el id).
  const initialRecord = ((views.params as any)?.record ?? null) as Record<string, any> | null;
  // Abierta con { record } → modo edición: guardar actualiza, no crea
  const [editingId, setEditingId] = useState<string | null>(
    initialRecord?.id !== null && initialRecord?.id !== undefined ? String(initialRecord.id) : null
  );
  // …y los campos arrancan con lo que ya tenía el registro
  useEffect(() => {
    if (!initialRecord) return;
    const loose = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    setValues((prev: any) => {
      const next = { ...prev };
      const rks = Object.keys(initialRecord);
      for (const k of Object.keys(next)) {
        const rk = rks.find((x) => loose(x) === loose(k));
        if (rk) next[k] = initialRecord[rk];
      }
      return next;
    });
    // deps intencionalmente fijas: el efecto corre una sola vez
  }, []);
  const [refOptions, setRefOptions] = useState<Record<string, any[]>>({});
  const refLabel =
    customHandlers.refLabel ?? ((r: any) => String(r?.name ?? r?.title ?? r?.label ?? r?.id ?? ''));
  useEffect(() => {
    void Promise.all([
      actions
        .execute<any[]>('properties.buildings.list')
        .then((r) => {
          if (mounted.current)
            setRefOptions((o: any) => ({ ...o, building_id: Array.isArray(r) ? r : [] }));
        })
        .catch(() => {}),
      actions
        .execute<any[]>('properties.units.list')
        .then((r) => {
          if (mounted.current)
            setRefOptions((o: any) => ({ ...o, unit_id: Array.isArray(r) ? r : [] }));
        })
        .catch(() => {}),
      actions
        .execute<any[]>('contacts.list')
        .then((r) => {
          if (mounted.current)
            setRefOptions((o: any) => ({
              ...o,
              reported_by_contact_id: Array.isArray(r) ? r : [],
            }));
        })
        .catch(() => {}),
      actions
        .execute<any[]>('contacts.list')
        .then((r) => {
          if (mounted.current)
            setRefOptions((o: any) => ({ ...o, vendor_contact_id: Array.isArray(r) ? r : [] }));
        })
        .catch(() => {}),
    ]);
    // deps intencionalmente fijas: el efecto corre una sola vez
  }, []);

  const validate = useCallback((): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (
      values['title'] === null ||
      values['title'] === undefined ||
      values['title'] === '' ||
      values['title'] === false
    )
      errs['title'] = '«Título» es requerido';
    if (
      values['priority'] === null ||
      values['priority'] === undefined ||
      values['priority'] === '' ||
      values['priority'] === false
    )
      errs['priority'] = '«Prioridad» es requerido';
    if (
      values['building_id'] === null ||
      values['building_id'] === undefined ||
      values['building_id'] === '' ||
      values['building_id'] === false
    )
      errs['building_id'] = '«Propiedad» es requerido';
    if (
      values['status'] === null ||
      values['status'] === undefined ||
      values['status'] === '' ||
      values['status'] === false
    )
      errs['status'] = '«Estado» es requerido';
    return errs;
  }, [values]);

  const submit = useCallback(async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.warning('Revisá el formulario', 'Hay campos con errores.');
      return;
    }
    try {
      if (customHandlers.onSubmit) {
        const ctx = {
          execute: function exec<T = unknown>(id: string, args?: unknown): Promise<T> {
            return actions.execute<T>(id, args);
          },
          toast,
          editingId,
          record: initialRecord,
        };
        await customHandlers.onSubmit(values, ctx);
      } else if (editingId) {
        await actions.execute('maintenance.workOrders.update', { id: editingId, data: values });
      } else {
        await actions.execute('maintenance.workOrders.create', { data: values });
      }
      toast.success(editingId ? 'Actualizado' : 'Guardado', 'El registro se guardó correctamente');
      setEditingId(null);
      setValues({
        title: null,
        description: null,
        priority: null,
        category: null,
        building_id: null,
        unit_id: null,
        reported_by_contact_id: null,
        reported_at: null,
        vendor_contact_id: null,
        scheduled_at: null,
        estimated_cost: null,
        paid_by: null,
        status: null,
        notes: null,
        completed_at: null,
        cost: null,
      });
      closeDialog();
    } catch (err) {
      toast.error('Error', err instanceof Error ? err.message : 'No se pudo guardar');
    }
    // deps intencionalmente fijas: el efecto corre una sola vez
  }, [values, validate, editingId]);

  return { values, errors, setField, editingId, refOptions, refLabel, submit };
}
