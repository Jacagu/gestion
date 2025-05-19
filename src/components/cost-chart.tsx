"use client"

import { useEffect, useRef } from "react"
import Chart from "chart.js/auto"

interface CostChartProps {
  D: number
  S: number
  H: number
  Q: number
}

export function CostChart({ D, S, H, Q }: CostChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Limpiar gráfico anterior si existe
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    // Generar datos para el gráfico
    const qVals = Array.from({ length: 300 }, (_, i) => i + 10)
    const costosTotales = qVals.map((q) => (D / q) * S + (q / 2) * H)

    // Encontrar el costo mínimo (en EOQ)
    const costoEOQ = (D / Q) * S + (Q / 2) * H

    // Crear el gráfico
    const ctx = chartRef.current.getContext("2d")
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: "line",
        data: {
          labels: qVals,
          datasets: [
            {
              label: "Costo total anual",
              data: costosTotales,
              borderColor: "rgba(75, 192, 192, 1)",
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              tension: 0.1,
              fill: false,
            },
            {
              label: `EOQ ≈ ${Q.toFixed(0)}`,
              data: qVals.map((q) => (q === Math.round(Q) ? costoEOQ : null)),
              pointBackgroundColor: "rgba(255, 99, 132, 1)",
              pointBorderColor: "#fff",
              pointRadius: 6,
              pointHoverRadius: 8,
              showLine: false,
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
                text: "Cantidad de pedido (Q)",
              },
            },
            y: {
              title: {
                display: true,
                text: "Costo total anual",
              },
            },
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.dataset.label || ""
                  const value = context.parsed.y
                  return `${label}: ${value.toFixed(2)}`
                },
              },
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
  }, [D, S, H, Q])

  return (
    <div className="w-full h-[300px]">
      <canvas ref={chartRef}></canvas>
    </div>
  )
}
