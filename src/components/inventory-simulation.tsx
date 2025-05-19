"use client"

import { useEffect, useRef } from "react"
import Chart from "chart.js/auto"

interface InventorySimulationProps {
  simulation: {
    inventario: number[]
    ordenes: number[]
  }
  R: number
}

export function InventorySimulation({ simulation, R }: InventorySimulationProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Limpiar gráfico anterior si existe
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const dias = Array.from({ length: simulation.inventario.length }, (_, i) => i + 1)

    // Crear el gráfico
    const ctx = chartRef.current.getContext("2d")
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: "line",
        data: {
          labels: dias,
          datasets: [
            {
              label: "Nivel de inventario",
              data: simulation.inventario,
              borderColor: "rgba(75, 192, 192, 1)",
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              fill: true,
            },
            {
              label: "Pedidos",
              data: dias.map((dia) => (simulation.ordenes.includes(dia - 1) ? simulation.inventario[dia - 1] : null)),
              backgroundColor: "rgba(255, 99, 132, 1)",
              pointRadius: 6,
              pointHoverRadius: 8,
              showLine: false,
            },
            {
              label: `Punto de reorden (R ≈ ${R.toFixed(0)})`,
              data: dias.map(() => R),
              borderColor: "rgba(255, 159, 64, 1)",
              borderDash: [5, 5],
              fill: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 500, // Animación más rápida para actualizaciones en tiempo real
          },
          scales: {
            x: {
              title: {
                display: true,
                text: "Día",
              },
            },
            y: {
              title: {
                display: true,
                text: "Unidades en inventario",
              },
              min: 0,
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
  }, [simulation, R])

  return (
    <div className="w-full h-[300px]">
      <canvas ref={chartRef}></canvas>
    </div>
  )
}
