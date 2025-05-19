import { Card, CardContent } from "@/components/ui/card"
import {
  Package,
  AlertTriangle,
  TrendingUp,
  ShoppingCart,
  BarChart4,
  ArrowDownCircle,
  LineChart,
  Calendar,
} from "lucide-react"

interface ResultsSummaryProps {
  results: {
    Q: number
    R: number
    D: number
    simulation: {
      inventario: number[]
      ordenes: number[]
      faltantes_dias: number
      unidades_faltantes: number
    }
  }
  params: {
    dias: number
    mu_d: number
    sigma_d: number
    C: number
    H: number
    S: number
    L: number
  }
}

export function ResultsSummary({ results, params }: ResultsSummaryProps) {
  const inventarioPromedio =
    results.simulation.inventario.reduce((a, b) => a + b, 0) / results.simulation.inventario.length
  const stockMinimo = Math.min(...results.simulation.inventario)

  // Definir los datos de las cards con sus iconos y colores
  const cards = [
    {
      title: "EOQ",
      subtitle: "Cantidad económica de pedido",
      value: results.Q.toFixed(0),
      unit: "unidades",
      icon: <Package size={20} />,
      color: "bg-emerald-50 dark:bg-emerald-950/30",
      iconColor: "text-emerald-500",
    },
    {
      title: "Punto de reorden",
      subtitle: "Nivel para realizar pedido",
      value: results.R.toFixed(0),
      unit: "unidades",
      icon: <AlertTriangle size={20} />,
      color: "bg-amber-50 dark:bg-amber-950/30",
      iconColor: "text-amber-500",
    },
    {
      title: "Pedidos anuales",
      subtitle: "Total de reabastecimientos",
      value: results.simulation.ordenes.length.toString(),
      unit: "pedidos",
      icon: <ShoppingCart size={20} />,
      color: "bg-sky-50 dark:bg-sky-950/30",
      iconColor: "text-sky-500",
    },
    {
      title: "Días con faltantes",
      subtitle: "Stock insuficiente",
      value: results.simulation.faltantes_dias.toString(),
      unit: "días",
      icon: <Calendar size={20} />,
      color: "bg-rose-50 dark:bg-rose-950/30",
      iconColor: "text-rose-500",
    },
    {
      title: "Unidades no atendidas",
      subtitle: "Demanda insatisfecha",
      value: results.simulation.unidades_faltantes.toString(),
      unit: "unidades",
      icon: <BarChart4 size={20} />,
      color: "bg-red-50 dark:bg-red-950/30",
      iconColor: "text-red-500",
    },
    {
      title: "Inventario promedio",
      subtitle: "Nivel medio de stock",
      value: inventarioPromedio.toFixed(0),
      unit: "unidades",
      icon: <TrendingUp size={20} />,
      color: "bg-indigo-50 dark:bg-indigo-950/30",
      iconColor: "text-indigo-500",
    },
    {
      title: "Stock mínimo",
      subtitle: "Nivel más bajo registrado",
      value: stockMinimo.toString(),
      unit: "unidades",
      icon: <ArrowDownCircle size={20} />,
      color: "bg-purple-50 dark:bg-purple-950/30",
      iconColor: "text-purple-500",
    },
    {
      title: "Demanda anual",
      subtitle: "Total de unidades requeridas",
      value: results.D.toFixed(0),
      unit: "unidades",
      icon: <LineChart size={20} />,
      color: "bg-teal-50 dark:bg-teal-950/30",
      iconColor: "text-teal-500",
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {cards.map((card, index) => (
        <Card key={index} className={`overflow-hidden border-0 shadow-sm ${card.color}`}>
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div className={`rounded-full p-2 ${card.color} ${card.iconColor}`}>{card.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground truncate">{card.subtitle}</p>
                <div className="flex items-baseline gap-1">
                  <h3 className="text-xl font-bold truncate">{card.value}</h3>
                  <span className="text-xs text-muted-foreground">{card.unit}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
