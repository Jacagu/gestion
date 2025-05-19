import { TimeSeriesAnalysisResult } from "../../types/analysis-results"

export function analyzeTimeSeries(data: number[]): TimeSeriesAnalysisResult {
  // Dividir los datos en conjuntos de entrenamiento y prueba
  const splitIndex = Math.floor(data.length * 0.7)
  const trainingData = data.slice(0, splitIndex)
  const testingData = data.slice(splitIndex)

  // Realizar prueba de estacionariedad (ADF)
  const adfTest = performADFTest(data)

  // Detectar componentes de la serie
  const trend = detectTrend(data)
  const seasonality = detectSeasonality(data)

  // Calcular estadísticas descriptivas
  const statistics = calculateStatistics(data)

  // Realizar pronóstico con suavización exponencial
  const forecast = performExponentialSmoothing(trainingData, testingData.length + 10)

  // Calcular métricas de precisión
  const accuracy = calculateAccuracy(testingData, forecast.predictions.slice(0, testingData.length))

  // Analizar residuos
  const residuals = analyzeResiduals(testingData, forecast.predictions.slice(0, testingData.length))

  return {
    data,
    trainingData,
    testingData,
    adfTest,
    trend,
    seasonality,
    statistics,
    forecast,
    accuracy,
    residuals,
    modelParams: {
      alpha: 0.2, // Parámetro de suavización para el nivel
      beta: trend.hasTrend ? 0.1 : null, // Parámetro de suavización para la tendencia
      gamma: seasonality.hasSeasonality ? 0.1 : null, // Parámetro de suavización para la estacionalidad
      model: trend.hasTrend
        ? seasonality.hasSeasonality
          ? "ETS(A,A,A)"
          : "ETS(A,A,N)"
        : seasonality.hasSeasonality
          ? "ETS(A,N,A)"
          : "ETS(A,N,N)",
    },
  }
}

// Prueba de Dickey-Fuller Aumentada (ADF) para estacionariedad
function performADFTest(data: number[]) {
  // Implementación simplificada de la prueba ADF
  // En una implementación real, se usaría una biblioteca estadística

  // Calcular diferencias
  const diff = []
  for (let i = 1; i < data.length; i++) {
    diff.push(data[i] - data[i - 1])
  }

  // Calcular autocorrelación de las diferencias
  let sum = 0
  for (let i = 0; i < diff.length - 1; i++) {
    sum += diff[i] * diff[i + 1]
  }

  const autocorr = sum / diff.reduce((acc, val) => acc + val * val, 0)

  // Estadístico ADF simplificado
  const n = data.length
  const statistic = (autocorr - 1) * Math.sqrt(n)

  // Valor p aproximado (simplificado)
  const pValue = Math.exp(-0.5 * Math.abs(statistic)) / 2

  return {
    statistic,
    pValue,
    isStationary: pValue < 0.05,
  }
}

// Detectar tendencia en la serie
function detectTrend(data: number[]) {
  // Implementación simplificada de detección de tendencia
  // Usamos regresión lineal simple

  const n = data.length
  const x = Array.from({ length: n }, (_, i) => i)

  // Calcular medias
  const meanX = x.reduce((sum, val) => sum + val, 0) / n
  const meanY = data.reduce((sum, val) => sum + val, 0) / n

  // Calcular pendiente
  let numerator = 0
  let denominator = 0

  for (let i = 0; i < n; i++) {
    numerator += (x[i] - meanX) * (data[i] - meanY)
    denominator += (x[i] - meanX) ** 2
  }

  const slope = numerator / denominator

  // Determinar si hay tendencia significativa
  const hasTrend = Math.abs(slope) > (0.01 * (Math.max(...data) - Math.min(...data))) / n

  return {
    hasTrend,
    slope: hasTrend ? slope : null,
  }
}

// Detectar estacionalidad en la serie
function detectSeasonality(data: number[]) {
  // Implementación simplificada de detección de estacionalidad
  // Buscamos autocorrelaciones significativas en diferentes rezagos

  const maxLag = Math.min(50, Math.floor(data.length / 4))
  const autocorrelations = []

  const mean = data.reduce((sum, val) => sum + val, 0) / data.length

  // Calcular varianza
  let variance = 0
  for (const val of data) {
    variance += (val - mean) ** 2
  }
  variance /= data.length

  // Calcular autocorrelaciones para diferentes rezagos
  for (let lag = 1; lag <= maxLag; lag++) {
    let sum = 0
    for (let i = 0; i < data.length - lag; i++) {
      sum += (data[i] - mean) * (data[i + lag] - mean)
    }

    const autocorr = sum / (data.length - lag) / variance
    autocorrelations.push(autocorr)
  }

  // Buscar picos en las autocorrelaciones
  let maxAutocorr = 0
  let period = null

  for (let i = 1; i < autocorrelations.length - 1; i++) {
    if (
      autocorrelations[i] > 0.2 &&
      autocorrelations[i] > autocorrelations[i - 1] &&
      autocorrelations[i] > autocorrelations[i + 1] &&
      autocorrelations[i] > maxAutocorr
    ) {
      maxAutocorr = autocorrelations[i]
      period = i + 1
    }
  }

  return {
    hasSeasonality: maxAutocorr > 0.3,
    period,
  }
}

// Calcular estadísticas descriptivas
function calculateStatistics(data: number[]) {
  const n = data.length
  const mean = data.reduce((sum, val) => sum + val, 0) / n

  // Ordenar datos para calcular la mediana
  const sortedData = [...data].sort((a, b) => a - b)
  const median = n % 2 === 0 ? (sortedData[n / 2 - 1] + sortedData[n / 2]) / 2 : sortedData[Math.floor(n / 2)]

  const min = Math.min(...data)
  const max = Math.max(...data)

  // Calcular desviación estándar
  let sumSquaredDiff = 0
  for (const val of data) {
    sumSquaredDiff += (val - mean) ** 2
  }
  const std = Math.sqrt(sumSquaredDiff / n)

  return {
    mean,
    median,
    min,
    max,
    std,
  }
}

// Realizar pronóstico con suavización exponencial
function performExponentialSmoothing(data: number[], horizon: number) {
  // Implementación simplificada de suavización exponencial simple
  const alpha = 0.2 // Parámetro de suavización

  // Inicializar con el primer valor
  let level = data[0]
  const fitted = [level]

  // Ajustar el modelo a los datos históricos
  for (let i = 1; i < data.length; i++) {
    level = alpha * data[i] + (1 - alpha) * level
    fitted.push(level)
  }

  // Generar pronósticos
  const predictions = [...fitted]
  for (let i = 0; i < horizon; i++) {
    predictions.push(level)
  }

  // Calcular intervalos de confianza
  const residuals = data.map((val, i) => val - fitted[i])
  const rmse = Math.sqrt(residuals.reduce((sum, val) => sum + val ** 2, 0) / residuals.length)

  const lowerBounds = predictions.map((val) => val - 1.96 * rmse)
  const upperBounds = predictions.map((val) => val + 1.96 * rmse)

  return {
    predictions,
    lowerBounds,
    upperBounds,
  }
}

// Calcular métricas de precisión
function calculateAccuracy(actual: number[], forecast: number[]) {
  const n = Math.min(actual.length, forecast.length)

  let sumAbsError = 0
  let sumSquaredError = 0
  let sumAbsPercentError = 0

  for (let i = 0; i < n; i++) {
    const error = actual[i] - forecast[i]
    sumAbsError += Math.abs(error)
    sumSquaredError += error ** 2

    // Evitar división por cero
    if (actual[i] !== 0) {
      sumAbsPercentError += Math.abs(error / actual[i]) * 100
    }
  }

  const mae = sumAbsError / n
  const rmse = Math.sqrt(sumSquaredError / n)
  const mape = sumAbsPercentError / n

  return {
    mae,
    rmse,
    mape,
  }
}

// Analizar residuos
function analyzeResiduals(actual: number[], forecast: number[]) {
  const n = Math.min(actual.length, forecast.length)
  const residuals = []

  for (let i = 0; i < n; i++) {
    residuals.push(actual[i] - forecast[i])
  }

  // Calcular media y varianza de los residuos
  const mean = residuals.reduce((sum, val) => sum + val, 0) / n

  let variance = 0
  for (const val of residuals) {
    variance += (val - mean) ** 2
  }
  variance /= n

  // Prueba simplificada de normalidad (aproximación)
  const skewness = calculateSkewness(residuals)
  const kurtosis = calculateKurtosis(residuals)

  const normalityStatistic = (skewness ** 2 + kurtosis ** 2) / 6
  const normalityPValue = Math.exp(-0.5 * normalityStatistic)

  // Prueba simplificada de autocorrelación
  const autocorr = calculateAutocorrelation(residuals, 1)
  const autocorrStatistic = autocorr * Math.sqrt(n)
  const autocorrPValue = 2 * (1 - normCDF(Math.abs(autocorrStatistic)))

  // Prueba simplificada de homocedasticidad
  const homoscedasticityStatistic = calculateHomoscedasticityStatistic(residuals, forecast.slice(0, n))
  const homoscedasticityPValue = 1 - chiSquareCDF(homoscedasticityStatistic, 1)

  return {
    values: residuals,
    mean,
    variance,
    normalityTest: {
      statistic: normalityStatistic,
      pValue: normalityPValue,
      isNormal: normalityPValue > 0.05,
    },
    autocorrelationTest: {
      statistic: autocorrStatistic,
      pValue: autocorrPValue,
      isIndependent: autocorrPValue > 0.05,
    },
    homoscedasticityTest: {
      statistic: homoscedasticityStatistic,
      pValue: homoscedasticityPValue,
      isHomoscedastic: homoscedasticityPValue > 0.05,
    },
  }
}

// Funciones auxiliares para el análisis de residuos

function calculateSkewness(data: number[]) {
  const n = data.length
  const mean = data.reduce((sum, val) => sum + val, 0) / n

  let sumCubedDiff = 0
  let sumSquaredDiff = 0

  for (const val of data) {
    const diff = val - mean
    sumCubedDiff += diff ** 3
    sumSquaredDiff += diff ** 2
  }

  return sumCubedDiff / n / (sumSquaredDiff / n) ** 1.5
}

function calculateKurtosis(data: number[]) {
  const n = data.length
  const mean = data.reduce((sum, val) => sum + val, 0) / n

  let sumQuarticDiff = 0
  let sumSquaredDiff = 0

  for (const val of data) {
    const diff = val - mean
    sumQuarticDiff += diff ** 4
    sumSquaredDiff += diff ** 2
  }

  return sumQuarticDiff / n / (sumSquaredDiff / n) ** 2 - 3
}

function calculateAutocorrelation(data: number[], lag: number) {
  const n = data.length
  const mean = data.reduce((sum, val) => sum + val, 0) / n

  let numerator = 0
  let denominator = 0

  for (let i = 0; i < n - lag; i++) {
    numerator += (data[i] - mean) * (data[i + lag] - mean)
  }

  for (let i = 0; i < n; i++) {
    denominator += (data[i] - mean) ** 2
  }

  return numerator / denominator
}

function calculateHomoscedasticityStatistic(residuals: number[], fitted: number[]) {
  // Implementación simplificada de la prueba de Breusch-Pagan
  const n = residuals.length

  // Calcular residuos al cuadrado
  const squaredResiduals = residuals.map((r) => r ** 2)

  // Calcular regresión de residuos al cuadrado sobre valores ajustados
  const meanSquaredResiduals = squaredResiduals.reduce((sum, val) => sum + val, 0) / n
  const meanFitted = fitted.reduce((sum, val) => sum + val, 0) / n

  let numerator = 0
  let denominator = 0

  for (let i = 0; i < n; i++) {
    numerator += (fitted[i] - meanFitted) * (squaredResiduals[i] - meanSquaredResiduals)
    denominator += (fitted[i] - meanFitted) ** 2
  }

  const slope = numerator / denominator

  // Calcular estadístico
  let explainedSS = 0
  for (let i = 0; i < n; i++) {
    explainedSS += (slope * (fitted[i] - meanFitted)) ** 2
  }

  let totalSS = 0
  for (let i = 0; i < n; i++) {
    totalSS += (squaredResiduals[i] - meanSquaredResiduals) ** 2
  }

  return (explainedSS / totalSS) * n
}

// Funciones de distribución para cálculos estadísticos

function normCDF(x: number) {
  // Aproximación de la función de distribución acumulativa normal estándar
  const t = 1 / (1 + 0.2316419 * Math.abs(x))
  const d = 0.3989423 * Math.exp((-x * x) / 2)
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
  return x > 0 ? 1 - p : p
}

function chiSquareCDF(x: number, df: number) {
  // Aproximación muy simplificada de la función de distribución acumulativa chi-cuadrado
  if (x <= 0) return 0
  
  // const k = df / 2
  const z = x / 2
  
  // Para df=1, usamos una aproximación basada en la normal
  if (df === 1) {
    return 2 * normCDF(Math.sqrt(x)) - 1
  }
  
  // Para df=2, usamos la fórmula exacta
  if (df === 2) {
    return 1 - Math.exp(-z);
  }

  return 0
}
