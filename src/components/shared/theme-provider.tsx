"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps as NextThemesProviderProps } from "next-themes/dist/types"

import { useTheme as useNextTheme } from "next-themes"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: "dark" | "light" | "system"
  storageKey?: string
}

type ThemeProviderState = {
  theme: "dark" | "light" | "system"
  setTheme: (theme: "dark" | "light" | "system") => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState)

// This is a temporary wrapper to bridge the old context API with next-themes
// and avoid having to refactor every component that uses useTheme.
function ThemeProviderBridge({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useNextTheme()

  const value = {
    theme: theme as "dark" | "light" | "system",
    setTheme,
  }

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export function ThemeProvider({
  children,
  ...props
}: NextThemesProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <ThemeProviderBridge>{children}</ThemeProviderBridge>
    </NextThemesProvider>
  )
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
