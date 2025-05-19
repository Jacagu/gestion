// Tipos para el resultado de la prueba ADF
export interface ADFTestResult {
  statistic: number;
  pValue: number;
  isStationary: boolean;
}

// Tipo para la detección de tendencia
export interface TrendResult {
  hasTrend: boolean;
  slope: number | null;
}

// Tipo para la detección de estacionalidad
export interface SeasonalityResult {
  hasSeasonality: boolean;
  period: number | null;
}

// Tipo para estadísticas descriptivas
export interface Statistics {
  mean: number;
  median: number;
  min: number;
  max: number;
  std: number;
}

// Tipo para los resultados de suavización exponencial
export interface ExponentialSmoothingResult {
  predictions: number[];
  lowerBounds: number[];
  upperBounds: number[];
}

// Tipo para las métricas de precisión
export interface AccuracyMetrics {
  mae: number;   // Error absoluto medio
  rmse: number;  // Raíz del error cuadrático medio
  mape: number;  // Error porcentual absoluto medio
}

// Tipos para los tests en el análisis de residuos
export interface StatisticalTest {
  statistic: number;
  pValue: number;
}

export interface NormalityTest extends StatisticalTest {
  isNormal: boolean;
}

export interface AutocorrelationTest extends StatisticalTest {
  isIndependent: boolean;
}

export interface HomoscedasticityTest extends StatisticalTest {
  isHomoscedastic: boolean;
}

// Tipo para el análisis de residuos
export interface ResidualAnalysis {
  values: number[];
  mean: number;
  variance: number;
  normalityTest: NormalityTest;
  autocorrelationTest: AutocorrelationTest;
  homoscedasticityTest: HomoscedasticityTest;
}

// Tipo para los parámetros del modelo
export interface ModelParameters {
  alpha: number;
  beta: number | null;
  gamma: number | null;
  model: "ETS(A,A,A)" | "ETS(A,A,N)" | "ETS(A,N,A)" | "ETS(A,N,N)";
}

// Tipo principal para el resultado del análisis de series temporales
export interface TimeSeriesAnalysisResult {
  data: number[];
  trainingData: number[];
  testingData: number[];
  adfTest: ADFTestResult;
  trend: TrendResult;
  seasonality: SeasonalityResult;
  statistics: Statistics;
  forecast: ExponentialSmoothingResult;
  accuracy: AccuracyMetrics;
  residuals: ResidualAnalysis;
  modelParams: ModelParameters;
}
