"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";

export function DarkModeWrapper({ children }: { children: React.ReactNode }) {
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme("dark");
    return () => {
      setTheme("light");
    };
  }, [setTheme]);

  return children;
}
