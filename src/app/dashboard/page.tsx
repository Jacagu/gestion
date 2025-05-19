"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, SlidersHorizontal } from "lucide-react";
import { CostChart } from "@/components/cost-chart";
import { InventorySimulation } from "@/components/inventory-simulation";
import { ResultsSummary } from "@/components/results-summary";
import {
  calculateEOQ,
  calculateReorderPoint,
  simulateInventory,
} from "@/lib/inventory-calculations";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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
  });

  const [results, setResults] = useState<any>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Actualizar resultados automáticamente cuando cambian los parámetros
  useEffect(() => {
    // Actualizar H cuando cambia C
    const updatedH = params.C * 0.2;

    if (params.H !== updatedH) {
      setParams((prev) => ({
        ...prev,
        H: updatedH,
      }));
      return; // Evitar cálculos duplicados, ya que este cambio desencadenará otro useEffect
    }

    calculateResults();
  }, [params]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setParams((prev) => ({
      ...prev,
      [name]: Number.parseFloat(value),
    }));
  };

  const calculateResults = () => {
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

    setResults({
      Q,
      R,
      D,
      Z,
      simulation,
    });
  };

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

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          Gestión de Inventario - Modelo EOQ
        </h1>

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Parámetros
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full overflow-y-auto sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Parámetros del Modelo</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              <div>
                <Label htmlFor="dias">Días en el periodo</Label>
                <Input
                  id="dias"
                  name="dias"
                  type="number"
                  value={params.dias}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label htmlFor="mu_d">Demanda diaria promedio</Label>
                <Input
                  id="mu_d"
                  name="mu_d"
                  type="number"
                  value={params.mu_d}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label htmlFor="sigma_d">
                  Desviación estándar de la demanda
                </Label>
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
                <Input
                  id="L"
                  name="L"
                  type="number"
                  value={params.L}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label htmlFor="C">Costo por unidad</Label>
                <Input
                  id="C"
                  name="C"
                  type="number"
                  value={params.C}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label htmlFor="H">
                  Costo anual por mantener inventario (20% de C)
                </Label>
                <Input
                  id="H"
                  name="H"
                  type="number"
                  value={params.H}
                  disabled
                />
              </div>

              <div>
                <Label htmlFor="S">Costo fijo por pedido</Label>
                <Input
                  id="S"
                  name="S"
                  type="number"
                  value={params.S}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label htmlFor="serviceLevel">Nivel de servicio</Label>
                <select
                  id="serviceLevel"
                  name="serviceLevel"
                  className="w-full rounded border p-2"
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
                  El costo de mantener inventario (H) se calcula automáticamente
                  como el 20% del costo por unidad (C).
                </AlertDescription>
              </Alert>

              <Button
                className="mt-4 w-full"
                onClick={() => setSheetOpen(false)}
              >
                Aplicar Cambios
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {results ? (
        <div className="space-y-8">
          {/* Cards de resultados en la parte superior */}
          <ResultsSummary results={results} params={params} />

          {/* Gráficas en la parte inferior, una al lado de la otra */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Costo Total vs Cantidad de Pedido (Q)</CardTitle>
              </CardHeader>
              <CardContent>
                <CostChart
                  D={results.D}
                  S={params.S}
                  H={params.H}
                  Q={results.Q}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Simulación del Inventario Diario</CardTitle>
              </CardHeader>
              <CardContent>
                <InventorySimulation
                  simulation={results.simulation}
                  R={results.R}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="flex h-64 items-center justify-center">
          <p className="text-lg text-gray-500">Cargando resultados...</p>
        </div>
      )}
    </main>
  );
}
