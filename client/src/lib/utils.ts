/**
 * utils.ts
 * 
 * Utilitários globais da aplicação
 * Função `cn` para mesclar classes CSS do Tailwind de forma inteligente
 * Resolve conflitos de classes e otimiza bundle final
 * Essencial para sistema de componentes shadcn/ui
 */

import { clsx, type ClassValue } from "clsx" // Combina classes condicionalmente
import { twMerge } from "tailwind-merge" // Resolve conflitos do Tailwind

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
