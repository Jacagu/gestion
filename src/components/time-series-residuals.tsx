"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle } from "lucide-react"
import Chart from "chart.js/auto"

interface TimeSeriesResidualsProps {
  results: {
    residuals: {
      values: number[]
      mean: number
      variance: number
      normalityTest: {
        statistic: number
        pValue: number
        isNormal: boolean
      }
      autocorrelationTest: {
        statistic: number
        pValue: number
        isIndependent: boolean
      }
      homoscedasticityTest: {
        statistic: number
        pValue: number
        isHomoscedastic: boolean
      }
    }
  }
}

export function TimeSeriesResiduals({ results }: TimeSeriesResidualsProps) {
  const residualsChartRef = useRef<HTMLCanvasElement>(null)
  const histogramChartRef = useRef<HTMLCanvasElement>(null)
  const residualsChartInstance = useRef<Chart | null>(null)
  const histogramChartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!residualsChartRef.current || !histogramChartRef.current) return

    // Limpiar gráficos anteriores si existen
    if (residualsChartInstance.current) {
      residualsChartInstance.current.destroy()
    }
    if (histogramChartInstance.current) {
      histogramChartInstance.current.destroy()
    }

    // Crear etiquetas para el eje X
    const labels = Array.from({ length: results.residuals.values.length }, (_, i) => i + 1)

    // Crear gráfico de residuos
    const residualsCtx = residualsChartRef.current.getContext("2d")
    if (residualsCtx) {
      residualsChartInstance.current = new Chart(residualsCtx, {
        type: "scatter",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Residuos",
              data: results.residuals.values.map((value, index) => ({ x: index + 1, y: value })),
              backgroundColor: "rgba(75, 192, 192, 0.6)",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              title: {
                display: true,
                text: "Observación",
              },
            },
            y: {
              title: {
                display: true,
                text: "Residuo",
              },
              beginAtZero: false,
            },
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: (context) => {
                  const index = context.dataIndex
                  const value = results.residuals.values[index]
                  return `Residuo: ${value.toFixed(4)}`
                },
              },
            },
          },
        },
      })
    }

    // Crear histograma de residuos
    const histogramCtx = histogramChartRef.current.getContext("2d")
    if (histogramCtx) {
      // Calcular bins para el histograma
      const min = Math.min(...results.residuals.values)
      const max = Math.max(...results.residuals.values)
      const binCount = 15
      const binWidth = (max - min) / binCount

      const bins = Array.from({ length: binCount }, (_, i) => min + i * binWidth)
      const counts = Array(binCount).fill(0)

      results.residuals.values.forEach((value) => {
        const binIndex = Math.min(Math.floor((value - min) / binWidth), binCount - 1)
        if (binIndex >= 0) counts[binIndex]++
      })

      histogramChartInstance.current = new Chart(histogramCtx, {
        type: "bar",
        data: {
          labels: bins.map((bin) => bin.toFixed(2)),
          datasets: [
            {
              label: "Frecuencia",
              data: counts,
              backgroundColor: "rgba(153, 102, 255, 0.6)",
              borderColor: "rgba(153, 102, 255, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              title: {
                display: true,
                text: "Valor del residuo",
              },
            },
            y: {
              title: {
                display: true,
                text: "Frecuencia",
              },
              beginAtZero: true,
            },
          },
        },
      })
    }

    return () => {
      if (residualsChartInstance.current) {
        residualsChartInstance.current.destroy()
      }
      if (histogramChartInstance.current) {
        histogramChartInstance.current.destroy()
      }
    }
  }, [results])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Gráfico de Residuos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <canvas ref={residualsChartRef}></canvas>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución de Residuos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <canvas ref={histogramChartRef}></canvas>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Diagnóstico de Residuos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Normalidad:</span>
                {results.residuals.normalityTest.isNormal ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Normal
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    <XCircle className="h-3 w-3 mr-1" /> No normal
                  </Badge>
                )}
              </div>
              <div className="text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estadístico:</span>
                  <span>{results.residuals.normalityTest.statistic.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor p:</span>
                  <span>{results.residuals.normalityTest.pValue.toFixed(4)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Independencia:</span>
                {results.residuals.autocorrelationTest.isIndependent ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Independientes
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    <XCircle className="h-3 w-3 mr-1" /> Autocorrelacionados
                  </Badge>
                )}
              </div>
              <div className="text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estadístico:</span>
                  <span>{results.residuals.autocorrelationTest.statistic.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor p:</span>
                  <span>{results.residuals.autocorrelationTest.pValue.toFixed(4)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Homocedasticidad:</span>
                {results.residuals.homoscedasticityTest.isHomoscedastic ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Varianza constante
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    <XCircle className="h-3 w-3 mr-1" /> Heterocedasticidad
                  </Badge>
                )}
              </div>
              <div className="text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estadístico:</span>
                  <span>{results.residuals.homoscedasticityTest.statistic.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor p:</span>
                  <span>{results.residuals.homoscedasticityTest.pValue.toFixed(4)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-md">
              <div className="text-xs text-muted-foreground">Media de residuos</div>
              <div className="text-xl font-semibold">{results.residuals.mean.toFixed(4)}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {Math.abs(results.residuals.mean) < 0.01
                  ? "La media es cercana a cero, lo que es deseable."
                  : "La media no es cercana a cero, lo que podría indicar un sesgo en el modelo."}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-md">
              <div className="text-xs text-muted-foreground">Varianza de residuos</div>
              <div className="text-xl font-semibold">{results.residuals.variance.toFixed(4)}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {results.residuals.homoscedasticityTest.isHomoscedastic
                  ? "La varianza es constante (homocedasticidad)."
                  : "La varianza no es constante (heterocedasticidad)."}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
