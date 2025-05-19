export function calculateEOQ(D: number, S: number, H: number): number {
  return Math.sqrt((2 * D * S) / H)
}

/**
 * Calcula el punto de reorden
 */
export function calculateReorderPoint(mu_d: number, L: number, sigma_d: number, Z: number): number {
  const mu_L = mu_d * L
  const sigma_L = sigma_d * Math.sqrt(L)
  return mu_L + Z * sigma_L
}

/**
 * Simula el inventario diario
 */
export function simulateInventory(dias: number, mu_d: number, sigma_d: number, Q: number, R: number) {
  // Generar demanda aleatoria
  const demanda = generateDemand(dias, mu_d, sigma_d)

  const inventario: number[] = []
  const ordenes: number[] = []
  let stock = Q // empezamos con un lote
  let faltantes_dias = 0
  let unidades_faltantes = 0

  for (let dia = 0; dia < dias; dia++) {
    stock -= demanda[dia]

    if (stock < 0) {
      faltantes_dias += 1
      unidades_faltantes += Math.abs(stock)
      stock = 0 // se asume que no se puede vender más de lo que hay
    }

    if (stock <= R) {
      stock += Q // reabastecimiento inmediato
      ordenes.push(dia)
    }

    inventario.push(stock)
  }

  return {
    inventario,
    ordenes,
    faltantes_dias,
    unidades_faltantes,
  }
}

/**
 * Genera demanda aleatoria siguiendo una distribución normal
 */
function generateDemand(dias: number, mu: number, sigma: number): number[] {
  // Usamos el algoritmo Box-Muller para generar números aleatorios con distribución normal
  const demanda: number[] = []

  for (let i = 0; i < dias; i++) {
    // Generar dos números aleatorios uniformes entre 0 y 1
    const u1 = Math.random()
    const u2 = Math.random()

    // Transformar a distribución normal usando Box-Muller
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)

    // Escalar y desplazar para obtener la distribución deseada
    let value = Math.round(mu + sigma * z)

    // No permitir demanda negativa
    value = Math.max(0, value)

    demanda.push(value)
  }

  return demanda
}
