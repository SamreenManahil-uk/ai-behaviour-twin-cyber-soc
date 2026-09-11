import { useEffect, useState, type ReactNode } from 'react'
import { ThemeContext, type Theme } from '../contexts/theme-context'

interface ThemeProviderProps {
  children: ReactNode
}

function getInitialTheme(): Theme {
  const savedTheme = window.localStorage.getItem('cyber-soc-theme')

  if (savedTheme === 'dark' || savedTheme === 'light') {
    return savedTheme
  }

  return 'dark'
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    window.localStorage.setItem('cyber-soc-theme', theme)
  }, [theme])

  function toggleTheme() {
    setTheme((currentTheme) =>
      currentTheme === 'dark' ? 'light' : 'dark',
    )
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
