"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Chart from "chart.js/auto"

interface TimeSeriesForecastingProps {
  results: {
    data: number[]
    forecast: {
      predictions: number[]
      lowerBounds: number[]
      upperBounds: number[]
    }
    trainingData: number[]
    testingData: number[]
    accuracy: {
      mape: number
      rmse: number
      mae: number
    }
    modelParams: {
      alpha: number
      beta: number | null
      gamma: number | null
      model: string
    }
  }
}

export function TimeSeriesForecasting({ results }: TimeSeriesForecastingProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Limpiar gráfico anterior si existe
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    // Preparar datos para el gráfico
    const trainingLength = results.trainingData.length
    const testingLength = results.testingData.length
    const totalLength = trainingLength + testingLength

    // Crear etiquetas para el eje X
    const labels = Array.from({ length: totalLength + results.forecast.predictions.length }, (_, i) => i + 1)

    // Crear datasets
    const datasets = [
      {
        label: "Datos de entrenamiento",
        data: [...results.trainingData, ...Array(testingLength + results.forecast.predictions.length).fill(null)],
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.1,
        fill: false,
      },
      {
        label: "Datos de prueba",
        data: [
          ...Array(trainingLength).fill(null),
          ...results.testingData,
          ...Array(results.forecast.predictions.length).fill(null),
        ],
        borderColor: "rgba(153, 102, 255, 1)",
        backgroundColor: "rgba(153, 102, 255, 0.2)",
        tension: 0.1,
        fill: false,
      },
      {
        label: "Pronóstico",
        data: [
          ...Array(trainingLength).fill(null),
          ...results.forecast.predictions.slice(0, testingLength),
          ...results.forecast.predictions.slice(testingLength),
        ],
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderDash: [5, 5],
        tension: 0.1,
        fill: false,
      },
      {
        label: "Intervalo de confianza (inferior)",
        data: [
          ...Array(trainingLength).fill(null),
          ...results.forecast.lowerBounds.slice(0, testingLength),
          ...results.forecast.lowerBounds.slice(testingLength),
        ],
        borderColor: "rgba(255, 99, 132, 0.3)",
        backgroundColor: "rgba(0, 0, 0, 0)",
        borderDash: [2, 2],
        tension: 0.1,
        fill: false,
      },
      {
        label: "Intervalo de confianza (superior)",
        data: [
          ...Array(trainingLength).fill(null),
          ...results.forecast.upperBounds.slice(0, testingLength),
          ...results.forecast.upperBounds.slice(testingLength),
        ],
        borderColor: "rgba(255, 99, 132, 0.3)",
        backgroundColor: "rgba(255, 99, 132, 0.1)",
        borderDash: [2, 2],
        tension: 0.1,
        fill: 3, // Rellena entre este dataset y el anterior
      },
    ]

    // Crear el gráfico
    const ctx = chartRef.current.getContext("2d")
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: "line",
        data: {
          labels: labels,
          datasets: datasets,
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              title: {
                display: true,
                text: "Tiempo",
              },
            },
            y: {
              title: {
                display: true,
                text: "Valor",
              },
            },
          },
          plugins: {
            tooltip: {
              mode: "index",
              intersect: false,
            },
            legend: {
              position: "top",
            },
          },
        },
      })
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [results])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Pronóstico con Suavización Exponencial</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <canvas ref={chartRef}></canvas>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Parámetros del Modelo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Modelo:</span>
                <span className="font-medium">{results.modelParams.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Alpha (nivel):</span>
                <span>{results.modelParams.alpha.toFixed(4)}</span>
              </div>
              {results.modelParams.beta !== null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Beta (tendencia):</span>
                  <span>{results.modelParams.beta.toFixed(4)}</span>
                </div>
              )}
              {results.modelParams.gamma !== null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gamma (estacionalidad):</span>
                  <span>{results.modelParams.gamma.toFixed(4)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Métricas de Precisión</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-md">
                <div className="text-xs text-muted-foreground">MAPE</div>
                <div className="text-xl font-semibold">{results.accuracy.mape.toFixed(2)}%</div>
                <div className="text-xs text-muted-foreground">Error porcentual</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-md">
                <div className="text-xs text-muted-foreground">RMSE</div>
                <div className="text-xl font-semibold">{results.accuracy.rmse.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">Error cuadrático</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-md">
                <div className="text-xs text-muted-foreground">MAE</div>
                <div className="text-xl font-semibold">{results.accuracy.mae.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">Error absoluto</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
