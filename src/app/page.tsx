"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon, SlidersHorizontal } from "lucide-react"
import { CostChart } from "@/components/cost-chart"
import { InventorySimulation } from "@/components/inventory-simulation"
import { ResultsSummary } from "@/components/results-summary"
import { calculateResults } from "@/lib/calculations/inventory-calculations"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ExcelData, ExcelUploader } from "@/components/excel-uploader"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InventoryResults } from "@/types/calculate-results"


export default function InventoryManagementApp() {
  const [params, setParams] = useState({
    dias: 365,
    mu_d: 105,
    sigma_d: 13.3,
    C: 8000,
    H: 1600, // 20% de C
    S: 10000,
    serviceLevel: 0.95,
    L: 1,
  })

  const [results, setResults] = useState<InventoryResults | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  // Actualizar resultados automáticamente cuando cambian los parámetros
  useEffect(() => {
    // Actualizar H cuando cambia C
    const updatedH = params.C * 0.2

    if (params.H !== updatedH) {
      setParams((prev) => ({
        ...prev,
        H: updatedH,
      }))
      return // Evitar cálculos duplicados, ya que este cambio desencadenará otro useEffect
    }

    setResults(calculateResults(params))
  }, [params])


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setParams((prev) => ({
      ...prev,
      [name]: Number.parseFloat(value),
    }))
  }


  const handleExcelDataLoaded = (data: ExcelData) => {
    // Actualizar los parámetros con los datos del Excel
    setParams((prev) => ({
      ...prev,
      ...data,
      // Asegurarse de que H se actualice en el siguiente useEffect
    }))

    // Cerrar el panel lateral si está abierto
    setSheetOpen(false)
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Inventario - Modelo QR</h1>

        <div className="flex gap-2">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Parámetros
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Configuración del Modelo</SheetTitle>
              </SheetHeader>

              <Tabs defaultValue="manual" className="mt-6">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="manual">Entrada Manual</TabsTrigger>
                  <TabsTrigger value="excel">Cargar Excel</TabsTrigger>
                </TabsList>

                <TabsContent value="manual" className="space-y-4">
                  <div>
                    <Label htmlFor="dias">Días en el periodo</Label>
                    <Input id="dias" name="dias" type="number" value={params.dias} onChange={handleInputChange} />
                  </div>

                  <div>
                    <Label htmlFor="mu_d">Demanda diaria promedio</Label>
                    <Input id="mu_d" name="mu_d" type="number" value={params.mu_d} onChange={handleInputChange} />
                  </div>

                  <div>
                    <Label htmlFor="sigma_d">Desviación estándar de la demanda</Label>
                    <Input
                      id="sigma_d"
                      name="sigma_d"
                      type="number"
                      value={params.sigma_d}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <Label htmlFor="L">Tiempo de entrega (días)</Label>
                    <Input id="L" name="L" type="number" value={params.L} onChange={handleInputChange} />
                  </div>

                  <div>
                    <Label htmlFor="C">Costo por unidad</Label>
                    <Input id="C" name="C" type="number" value={params.C} onChange={handleInputChange} />
                  </div>

                  <div>
                    <Label htmlFor="H">Costo anual por mantener inventario (20% de C)</Label>
                    <Input id="H" name="H" type="number" value={params.H} disabled />
                  </div>

                  <div>
                    <Label htmlFor="S">Costo fijo por pedido</Label>
                    <Input id="S" name="S" type="number" value={params.S} onChange={handleInputChange} />
                  </div>

                  <div>
                    <Label htmlFor="serviceLevel">Nivel de servicio</Label>
                    <select
                      id="serviceLevel"
                      name="serviceLevel"
                      className="w-full p-2 border rounded"
                      value={params.serviceLevel}
                      onChange={(e) =>
                        setParams((prev) => ({
                          ...prev,
                          serviceLevel: Number.parseFloat(e.target.value),
                        }))
                      }
                    >
                      <option value="0.90">90%</option>
                      <option value="0.95">95%</option>
                      <option value="0.98">98%</option>
                      <option value="0.99">99%</option>
                    </select>
                  </div>

                  <Alert className="mt-6">
                    <InfoIcon className="h-4 w-4" />
                    <AlertTitle>Información</AlertTitle>
                    <AlertDescription>
                      El costo de mantener inventario (H) se calcula automáticamente como el 20% del costo por unidad
                      (C).
                    </AlertDescription>
                  </Alert>
                </TabsContent>

                <TabsContent value="excel">
                  <ExcelUploader onDataLoaded={handleExcelDataLoaded} />
                </TabsContent>
              </Tabs>

              <Button className="w-full mt-6" onClick={() => setSheetOpen(false)}>
                Aplicar Cambios
              </Button>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {results ? (
        <div className="space-y-8">
          {/* Cards de resultados en la parte superior */}
          <ResultsSummary results={results} params={params} />

          {/* Gráficas en la parte inferior, una al lado de la otra */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Costo Total vs Cantidad de Pedido (Q)</CardTitle>
              </CardHeader>
              <CardContent>
                <CostChart D={results.D} S={params.S} H={params.H} Q={results.Q} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Simulación del Inventario Diario</CardTitle>
              </CardHeader>
              <CardContent>
                <InventorySimulation simulation={results.simulation} R={results.R} />
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-64">
          <p className="text-lg text-gray-500">Cargando resultados...</p>
        </div>
      )}
    </main>
  )
}
