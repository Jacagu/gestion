"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Package, LineChart, BarChart4, Info } from "lucide-react"

export function AppSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(true)

  const routes = [
    {
      title: "Gestión de Inventario",
      href: "/",
      icon: Package,
      description: "Modelo EOQ para gestión de inventario",
    },
    {
      title: "Análisis de Series Temporales",
      href: "/time-series",
      icon: LineChart,
      description: "Análisis y pronóstico de series temporales",
    },
  ]

  return (
    <SidebarProvider defaultOpen={open} onOpenChange={setOpen}>
      <div className="flex h-screen">
        <Sidebar>
          <SidebarHeader className="border-b pb-2">
            <div className="flex items-center gap-2 px-2">
              <BarChart4 className="h-6 w-6" />
              <div className="font-semibold text-lg">Análisis Cuantitativo</div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {routes.map((route) => (
                <SidebarMenuItem key={route.href}>
                  <SidebarMenuButton asChild isActive={pathname === route.href} tooltip={route.description}>
                    <Link href={route.href} className="flex items-center">
                      <route.icon className="h-4 w-4 mr-2" />
                      <span>{route.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t pt-2">
            <div className="px-3 py-2 text-xs text-muted-foreground flex items-center gap-2">
              <Info className="h-3 w-3" />
              <span>v1.0.0</span>
            </div>
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 md:p-8">
            <div className="flex items-center mb-6">
              <SidebarTrigger />
              <div className="ml-4">{routes.find((route) => route.href === pathname)?.title || "Dashboard"}</div>
            </div>
            {children}
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}
