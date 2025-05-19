"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileUp, AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import * as XLSX from "xlsx"

interface ExcelData {
  dias?: number
  mu_d?: number
  sigma_d?: number
  C?: number
  S?: number
  L?: number
  serviceLevel?: number
}

interface ExcelUploaderProps {
  onDataLoaded: (data: ExcelData) => void
}

export function ExcelUploader({ onDataLoaded }: ExcelUploaderProps) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const data = await readExcelFile(file)
      if (data) {
        onDataLoaded(data)
        setSuccess(`Datos cargados correctamente desde "${file.name}"`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar el archivo")
    } finally {
      setLoading(false)
      // Reset file input
      e.target.value = ""
    }
  }

  const readExcelFile = (file: File): Promise<ExcelData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const data = e.target?.result
          if (!data) {
            reject(new Error("No se pudo leer el archivo"))
            return
          }

          const workbook = XLSX.read(data, { type: "binary" })
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]

          // Convertir a JSON
          const jsonData = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 })

          // Procesar los datos
          const excelData: ExcelData = {}

          // Esperamos un formato específico: [parámetro, valor]
          for (const row of jsonData) {
            if (row.length >= 2 && typeof row[0] === "string") {
              const paramName = row[0].trim().toLowerCase()
              const paramValue = Number(row[1])

              if (!isNaN(paramValue)) {
                switch (paramName) {
                  case "dias":
                  case "período":
                  case "periodo":
                  case "días":
                    excelData.dias = paramValue
                    break
                  case "demanda diaria":
                  case "mu_d":
                  case "demanda promedio":
                    excelData.mu_d = paramValue
                    break
                  case "desviación estándar":
                  case "sigma_d":
                  case "desviacion estandar":
                    excelData.sigma_d = paramValue
                    break
                  case "costo por unidad":
                  case "c":
                    excelData.C = paramValue
                    break
                  case "costo por pedido":
                  case "s":
                    excelData.S = paramValue
                    break
                  case "tiempo de entrega":
                  case "l":
                    excelData.L = paramValue
                    break
                  case "nivel de servicio":
                  case "service level":
                    // Convertir porcentaje a decimal si es necesario
                    excelData.serviceLevel = paramValue > 1 ? paramValue / 100 : paramValue
                    break
                }
              }
            }
          }

          // Verificar que tenemos al menos algunos datos
          if (Object.keys(excelData).length === 0) {
            reject(new Error("No se encontraron datos válidos en el formato esperado"))
            return
          }

          resolve(excelData)
        } catch (err) {
          reject(new Error("Error al procesar el archivo Excel"))
        }
      }

      reader.onerror = () => {
        reject(new Error("Error al leer el archivo"))
      }

      reader.readAsBinaryString(file)
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" className="relative overflow-hidden" disabled={loading}>
          <FileUp className="h-4 w-4 mr-2" />
          {loading ? "Procesando..." : "Cargar Excel"}
          <input
            type="file"
            className="absolute inset-0 opacity-0 cursor-pointer"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            disabled={loading}
          />
        </Button>
        <p className="text-sm text-muted-foreground">Sube un archivo Excel con los parámetros del modelo</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert
          variant="default"
          className="bg-green-50 text-green-800 dark:bg-green-950/30 dark:text-green-400 border-green-200 dark:border-green-900"
        >
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Éxito</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-md p-3">
        <h3 className="text-sm font-medium text-amber-800 dark:text-amber-400 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Formato esperado del Excel
        </h3>
        <p className="text-xs text-amber-700 dark:text-amber-500 mt-1">
          El archivo debe contener filas con [parámetro, valor]. Parámetros soportados:
        </p>
        <ul className="text-xs text-amber-700 dark:text-amber-500 mt-1 list-disc list-inside">
          <li>Días / Período</li>
          <li>Demanda diaria / mu_d</li>
          <li>Desviación estándar / sigma_d</li>
          <li>Costo por unidad / C</li>
          <li>Costo por pedido / S</li>
          <li>Tiempo de entrega / L</li>
          <li>Nivel de servicio</li>
        </ul>
      </div>
    </div>
  )
}
