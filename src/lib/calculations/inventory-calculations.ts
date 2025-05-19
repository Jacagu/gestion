import { InventoryParams, InventoryResults } from "../../types/calculate-results";

export function calculateResults(params: InventoryParams): InventoryResults {
  // Calcular EOQ
  const D = params.mu_d * params.dias;
  const Q = calculateEOQ(D, params.S, params.H);

  // Calcular punto de reorden
  const Z = calculateZScore(params.serviceLevel);
  const R = calculateReorderPoint(params.mu_d, params.L, params.sigma_d, Z);

  // Simular inventario
  const simulation = simulateInventory(
    params.dias,
    params.mu_d,
    params.sigma_d,
    Q,
    R,
  );

  return {
    Q,
    R,
    D,
    Z,
    simulation,
  };
}

export function calculateEOQ(D: number, S: number, H: number): number {
  return Math.sqrt((2 * D * S) / H);
}

/**
 * Calcula el punto de reorden
 */
export function calculateReorderPoint(
  mu_d: number,
  L: number,
  sigma_d: number,
  Z: number,
): number {
  const mu_L = mu_d * L;
  const sigma_L = sigma_d * Math.sqrt(L);
  return mu_L + Z * sigma_L;
}

/**
 * Simula el inventario diario
 */
export function simulateInventory(
  dias: number,
  mu_d: number,
  sigma_d: number,
  Q: number,
  R: number,
) {
  // Generar demanda aleatoria
  const demanda = generateDemand(dias, mu_d, sigma_d);

  const inventario: number[] = [];
  const ordenes: number[] = [];
  let stock = Q; // empezamos con un lote
  let faltantes_dias = 0;
  let unidades_faltantes = 0;

  for (let dia = 0; dia < dias; dia++) {
    stock -= demanda[dia];

    if (stock < 0) {
      faltantes_dias += 1;
      unidades_faltantes += Math.abs(stock);
      stock = 0; // se asume que no se puede vender más de lo que hay
    }

    if (stock <= R) {
      stock += Q; // reabastecimiento inmediato
      ordenes.push(dia);
    }

    inventario.push(stock);
  }

  return {
    inventario,
    ordenes,
    faltantes_dias,
    unidades_faltantes,
  };
}

/**
 * Genera demanda aleatoria siguiendo una distribución normal
 */
function generateDemand(dias: number, mu: number, sigma: number): number[] {
  // Usamos el algoritmo Box-Muller para generar números aleatorios con distribución normal
  const demanda: number[] = [];

  for (let i = 0; i < dias; i++) {
    // Generar dos números aleatorios uniformes entre 0 y 1
    const u1 = Math.random();
    const u2 = Math.random();

    // Transformar a distribución normal usando Box-Muller
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

    // Escalar y desplazar para obtener la distribución deseada
    let value = Math.round(mu + sigma * z);

    // No permitir demanda negativa
    value = Math.max(0, value);

    demanda.push(value);
  }

  return demanda;
}

const calculateZScore = (serviceLevel: number) => {
  // Aproximación del Z-score para niveles de servicio comunes
  const zScores: Record<string, number> = {
    "0.90": 1.28,
    "0.95": 1.65,
    "0.98": 2.05,
    "0.99": 2.33,
  };

  const key = serviceLevel.toString();
  return zScores[key] || 1.65; // Default a 95% si no se encuentra
};
