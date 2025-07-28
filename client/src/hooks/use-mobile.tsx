/**
 * use-mobile.tsx
 * 
 * Hook customizado para detectar dispositivos mobile
 * Monitora tamanho da tela e retorna boolean indicando se é mobile
 * Breakpoint configurável (768px padrão)
 * Utilizado para renderização responsiva condicional
 */

import * as React from "react" // React para hooks

const MOBILE_BREAKPOINT = 768 // Breakpoint mobile em pixels

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
