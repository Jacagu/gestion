"use client"

import { useEffect, useRef } from "react"
import Chart from "chart.js/auto"

interface TimeSeriesChartProps {
  data: number[]
}

export function TimeSeriesChart({ data }: TimeSeriesChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current || data.length === 0) return

    // Limpiar gráfico anterior si existe
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    // Crear etiquetas para el eje X (índices o fechas)
    const labels = Array.from({ length: data.length }, (_, i) => i + 1)

    // Crear el gráfico
    const ctx = chartRef.current.getContext("2d")
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Serie Temporal",
              data: data,
              borderColor: "rgba(75, 192, 192, 1)",
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              tension: 0.1,
              fill: true,
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
          },
        },
      })
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data])

  return (
    <div className="w-full h-[400px]">
      {data.length > 0 ? (
        <canvas ref={chartRef}></canvas>
      ) : (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          No hay datos para visualizar
        </div>
      )}
    </div>
  )
}
