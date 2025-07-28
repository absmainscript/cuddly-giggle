
/**
 * performance.ts
 * 
 * Utilitários para otimização de performance
 */

// Debounce para eventos de scroll/resize
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle para eventos frequentes
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Preload de imagens críticas
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

// Preload de componentes lazy
export function preloadComponent(importFn: () => Promise<any>): void {
  const timer = setTimeout(() => {
    importFn().catch(() => {
      // Silenciar erro de preload
    });
  }, 2000); // Preload após 2 segundos

  // Limpar timer se componente for carregado antes
  return () => clearTimeout(timer);
}

// Detectar conexão lenta
export function isSlowConnection(): boolean {
  if (typeof navigator === 'undefined') return false;
  
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  if (!connection) return false;
  
  return connection.effectiveType === 'slow-2g' || 
         connection.effectiveType === '2g' ||
         connection.saveData === true;
}
