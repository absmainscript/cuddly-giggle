/**
 * LazyImage.tsx
 * 
 * Componente de imagem otimizada com lazy loading
 * Melhora a performance carregando imagens apenas quando necessário
 */

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
  webpSrc?: string;
  priority?: boolean;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className,
  fallback,
  webpSrc,
  priority = false,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [imageError, setImageError] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isInView, setIsInView] = useState<boolean>(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const [supportsWebP, setSupportsWebP] = useState<boolean>(false);

  // Check WebP support
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'rgba(0,0,0,0)';
      ctx.fillRect(0, 0, 1, 1);
      const dataURL = canvas.toDataURL('image/webp');
      setSupportsWebP(dataURL.indexOf('data:image/webp') === 0);
    }
  }, []);

  useEffect(() => {
    if (!priority) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        },
        { threshold: 0.1, rootMargin: '50px' }
      );

      if (imgRef.current) {
        observer.observe(imgRef.current);
      }

      return () => observer.disconnect();
    }
  }, [priority]);

  useEffect(() => {
    if (isInView && !imageSrc) {
      // Use WebP if supported and available
      const sourceToUse = (supportsWebP && webpSrc) ? webpSrc : src;
      setImageSrc(sourceToUse);
    }
  }, [isInView, src, webpSrc, supportsWebP, imageSrc]);

  const handleError = () => {
    if (webpSrc && !imageError && imageSrc === webpSrc) {
      // Fallback from WebP to original format
      setImageSrc(src);
      setImageError(true);
    } else if (!imageError && fallback) {
      setImageSrc(fallback);
      setImageError(true);
    }
  };

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={cn(
        'transition-opacity duration-500',
        isLoaded ? 'opacity-100' : 'opacity-0',
        className
      )}
      onLoad={() => setIsLoaded(true)}
      onError={handleError}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'low'}
      {...props}
    />
  );
};
interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  quality?: number;
}

export function LazyImage({ src, alt, className = '', placeholder, quality = 75 }: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {/* Placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          {placeholder && (
            <span className="text-gray-400 text-sm">{placeholder}</span>
          )}
        </div>
      )}

      {/* Lazy loaded image */}
      {isInView && (
        <motion.img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setIsLoaded(true)}
          loading="lazy"
          decoding="async"
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </div>
  );
}