// Generado por el Coongro Builder desde contributes.permissions. No editar a mano.

export const MaintenancePermissions = {
  /** Eliminar órdenes de trabajo */
  workOrdersDelete: 'maintenance.workOrders.delete',
  /** Gestionar órdenes de trabajo */
  workOrdersManage: 'maintenance.workOrders.manage',
  /** Ver órdenes de trabajo */
  workOrdersRead: 'maintenance.workOrders.read',
} as const;

export type MaintenancePermission =
  (typeof MaintenancePermissions)[keyof typeof MaintenancePermissions];
