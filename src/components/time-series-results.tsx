"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle } from "lucide-react"

interface TimeSeriesResultsProps {
  results: {
    adfTest: {
      statistic: number
      pValue: number
      isStationary: boolean
    }
    seasonality: {
      hasSeasonality: boolean
      period: number | null
    }
    trend: {
      hasTrend: boolean
      slope: number | null
    }
    statistics: {
      mean: number
      median: number
      min: number
      max: number
      std: number
    }
  }
}

export function TimeSeriesResults({ results }: TimeSeriesResultsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Prueba de Estacionariedad</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Estacionariedad:</span>
              {results.adfTest.isStationary ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Estacionaria
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  <XCircle className="h-3 w-3 mr-1" /> No estacionaria
                </Badge>
              )}
            </div>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estadístico ADF:</span>
                <span>{results.adfTest.statistic.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor p:</span>
                <span>{results.adfTest.pValue.toFixed(4)}</span>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {results.adfTest.isStationary
                  ? "El valor p es menor a 0.05, por lo que rechazamos la hipótesis nula y concluimos que la serie es estacionaria."
                  : "El valor p es mayor a 0.05, por lo que no podemos rechazar la hipótesis nula de no estacionariedad."}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Componentes de la Serie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Tendencia:</span>
              {results.trend.hasTrend ? (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Presente
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
                  <XCircle className="h-3 w-3 mr-1" /> No detectada
                </Badge>
              )}
            </div>
            {results.trend.hasTrend && results.trend.slope !== null && (
              <div className="text-sm">
                <span className="text-muted-foreground">Pendiente:</span> {results.trend.slope.toFixed(4)}
              </div>
            )}

            <div className="flex items-center justify-between mt-4">
              <span className="font-medium">Estacionalidad:</span>
              {results.seasonality.hasSeasonality ? (
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Presente
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
                  <XCircle className="h-3 w-3 mr-1" /> No detectada
                </Badge>
              )}
            </div>
            {results.seasonality.hasSeasonality && results.seasonality.period !== null && (
              <div className="text-sm">
                <span className="text-muted-foreground">Período:</span> {results.seasonality.period}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Estadísticas Descriptivas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-md">
              <div className="text-xs text-muted-foreground">Media</div>
              <div className="text-xl font-semibold">{results.statistics.mean.toFixed(2)}</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-md">
              <div className="text-xs text-muted-foreground">Mediana</div>
              <div className="text-xl font-semibold">{results.statistics.median.toFixed(2)}</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-md">
              <div className="text-xs text-muted-foreground">Mínimo</div>
              <div className="text-xl font-semibold">{results.statistics.min.toFixed(2)}</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-md">
              <div className="text-xs text-muted-foreground">Máximo</div>
              <div className="text-xl font-semibold">{results.statistics.max.toFixed(2)}</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-md">
              <div className="text-xs text-muted-foreground">Desv. Estándar</div>
              <div className="text-xl font-semibold">{results.statistics.std.toFixed(2)}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
