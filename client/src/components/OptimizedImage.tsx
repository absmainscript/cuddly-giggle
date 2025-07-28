
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
  webpSrc?: string;
  priority?: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  fallback,
  webpSrc,
  priority = false,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState<string>(webpSrc || src);
  const [imageError, setImageError] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleError = () => {
    if (webpSrc && !imageError) {
      setImageSrc(src);
      setImageError(true);
    } else if (fallback) {
      setImageSrc(fallback);
    }
  };

  const handleLoad = () => {
    setIsLoaded(true);
  };

  // Check WebP support
  useEffect(() => {
    if (webpSrc) {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'rgba(0,0,0,0)';
        ctx.fillRect(0, 0, 1, 1);
        const dataURL = canvas.toDataURL('image/webp');
        const supportsWebP = dataURL.indexOf('data:image/webp') === 0;
        
        if (!supportsWebP) {
          setImageSrc(src);
        }
      }
    }
  }, [src, webpSrc]);

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={cn(
        'transition-opacity duration-300',
        isLoaded ? 'opacity-100' : 'opacity-0',
        className
      )}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      onError={handleError}
      onLoad={handleLoad}
      {...props}
    />
  );
};
