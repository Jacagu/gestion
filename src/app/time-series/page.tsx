"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { FileUp, Info, AlertCircle, CheckCircle2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import * as XLSX from "xlsx"
import { TimeSeriesChart } from "@/components/time-series-chart"
import { TimeSeriesResults } from "@/components/time-series-results"
import { TimeSeriesForecasting } from "@/components/time-series-forecasting"
import { TimeSeriesResiduals } from "@/components/time-series-residuals"
import { analyzeTimeSeries } from "@/lib/time-series-analysis"

export default function TimeSeriesAnalysisPage() {
  const [data, setData] = useState<number[]>([])
  const [fileName, setFileName] = useState<string>("")
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError(null)
    setFileName(file.name)

    try {
      const data = await readDataFile(file)
      if (data && data.length > 0) {
        setData(data)
        const analysisResults = analyzeTimeSeries(data)
        setResults(analysisResults)
      } else {
        setError("No se encontraron datos válidos en el archivo")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar el archivo")
      setData([])
      setResults(null)
    } finally {
      setLoading(false)
      // Reset file input
      e.target.value = ""
    }
  }

  const readDataFile = (file: File): Promise<number[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const data = e.target?.result
          if (!data) {
            reject(new Error("No se pudo leer el archivo"))
            return
          }

          // Intentar procesar como Excel primero
          if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
            const workbook = XLSX.read(data, { type: "binary" })
            const firstSheetName = workbook.SheetNames[0]
            const worksheet = workbook.Sheets[firstSheetName]
            const jsonData = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 })

            // Extraer valores numéricos
            const numericData = jsonData
              .flat()
              .filter((val) => typeof val === "number" || (typeof val === "string" && !isNaN(Number(val))))
              .map((val) => Number(val))

            if (numericData.length === 0) {
              reject(new Error("No se encontraron datos numéricos en el archivo Excel"))
            }

            resolve(numericData)
          }
          // Procesar como archivo de texto
          else {
            const text = data.toString()
            const lines = text.split(/\r?\n/)

            const numericData = lines
              .map((line) => line.trim())
              .filter((line) => line.length > 0)
              .flatMap((line) => {
                // Intentar extraer números de cada línea
                const values = line.split(/[,\s]+/)
                return values.filter((val) => !isNaN(Number(val)) && val.trim() !== "").map((val) => Number(val))
              })

            if (numericData.length === 0) {
              reject(new Error("No se encontraron datos numéricos en el archivo de texto"))
            }

            resolve(numericData)
          }
        } catch (err) {
          reject(new Error("Error al procesar el archivo"))
        }
      }

      reader.onerror = () => {
        reject(new Error("Error al leer el archivo"))
      }

      if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        reader.readAsBinaryString(file)
      } else {
        reader.readAsText(file)
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Análisis de Series Temporales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" className="relative overflow-hidden" disabled={loading}>
                  <FileUp className="h-4 w-4 mr-2" />
                  {loading ? "Procesando..." : "Cargar Datos"}
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept=".xlsx,.xls,.csv,.txt"
                    onChange={handleFileUpload}
                    disabled={loading}
                  />
                </Button>
                <p className="text-sm text-muted-foreground">
                  Sube un archivo con los datos de la serie temporal (.xlsx, .csv, .txt)
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {fileName && !error && (
                <Alert
                  variant="default"
                  className="bg-green-50 text-green-800 dark:bg-green-950/30 dark:text-green-400 border-green-200 dark:border-green-900"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Archivo cargado</AlertTitle>
                  <AlertDescription>
                    Se han cargado {data.length} observaciones desde "{fileName}"
                  </AlertDescription>
                </Alert>
              )}

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Información</AlertTitle>
                <AlertDescription>
                  Esta herramienta analiza series temporales, evalúa estacionariedad y realiza pronósticos utilizando
                  suavización exponencial.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        {results && (
          <Tabs defaultValue="visualization" className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="visualization">Visualización</TabsTrigger>
              <TabsTrigger value="analysis">Análisis</TabsTrigger>
              <TabsTrigger value="forecasting">Pronóstico</TabsTrigger>
              <TabsTrigger value="residuals">Residuos</TabsTrigger>
            </TabsList>

            <TabsContent value="visualization">
              <Card>
                <CardHeader>
                  <CardTitle>Visualización de la Serie Temporal</CardTitle>
                </CardHeader>
                <CardContent>
                  <TimeSeriesChart data={data} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis">
              <TimeSeriesResults results={results} />
            </TabsContent>

            <TabsContent value="forecasting">
              <TimeSeriesForecasting results={results} />
            </TabsContent>

            <TabsContent value="residuals">
              <TimeSeriesResiduals results={results} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}
