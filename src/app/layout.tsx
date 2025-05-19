import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AppSidebar } from "@/components/app-sidebar";
import { DarkModeWrapper } from "@/providers/force-dark-mode";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Análisis Cuantitativo",
  description:
    "Herramientas para análisis cuantitativo y gestión de inventario",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          enableSystem={false}
          forcedTheme="dark"
          defaultTheme="dark"
        >
          <DarkModeWrapper>
            <AppSidebar>{children}</AppSidebar>
          </DarkModeWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
