/**
 * useIntersectionObserver.ts
 * 
 * Hook personalizado para observar quando elementos entram na viewport
 * Otimiza animations evitando executá-las antes do elemento ser visível
 */

import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useIntersectionObserver(options: UseIntersectionObserverOptions = {}) {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = true
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const targetRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        
        if (entry.isIntersecting && triggerOnce) {
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    if (targetRef.current) {
      observer.observe(targetRef.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return { targetRef, isIntersecting };
}