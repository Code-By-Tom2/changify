import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export interface UseMountedTheme {
  theme: string | undefined
  setTheme: (theme: string) => void
  mounted: boolean
}

export function useMountedTheme(): UseMountedTheme {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  return {
    theme: mounted ? theme : undefined,
    setTheme,
    mounted
  }
} 