/**
 * Parámetros necesarios para los cálculos de inventario
 */
export interface InventoryParams {
  mu_d: number;        // Demanda media diaria
  sigma_d: number;     // Desviación estándar de la demanda
  dias: number;        // Período de simulación en días
  S: number;           // Costo de pedido
  H: number;           // Costo de mantenimiento
  L: number;           // Tiempo de entrega
  serviceLevel: number; // Nivel de servicio deseado (porcentaje)
}

/**
 * Resultados de los cálculos de inventario
 */
export interface InventoryResults {
  Q: number;           // Cantidad óptima de pedido (EOQ)
  R: number;           // Punto de reorden
  D: number;           // Demanda total
  Z: number;           // Valor Z para el nivel de servicio
  simulation: {
    inventario: number[];
    ordenes: number[];
    faltantes_dias: number;
    unidades_faltantes: number;
  };
}
