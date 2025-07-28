import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { PhotoCarousel as PhotoCarouselType } from "@shared/schema";
import { processTextWithGradient, processBadgeWithGradient, BADGE_GRADIENTS } from "@/utils/textGradient";

export function PhotoCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0])); // Carrega apenas a primeira imagem
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Buscar fotos do carrossel
  const { data: photos = [], isLoading } = useQuery<PhotoCarouselType[]>({
    queryKey: ["/api/photo-carousel"],
    queryFn: async () => {
      const response = await fetch("/api/photo-carousel");
      return response.json();
    },
  });

  // Buscar configurações da seção de galeria
  const { data: configs } = useQuery({
    queryKey: ["/api/admin/config"],
    staleTime: 5 * 60 * 1000,
  });

  const photoCarouselConfig = configs?.find((c: any) => c.key === 'photo_carousel_section')?.value as any || {};
  const badgeGradient = configs?.find(c => c.key === 'badge_gradient')?.value?.gradient;

  const activePhotos = photos.filter(photo => photo.isActive);

  // Função para carregar imagem com lazy loading
  const preloadImage = useCallback((index: number) => {
    if (activePhotos[index] && !loadedImages.has(index)) {
      const img = new Image();
      img.onload = () => {
        setLoadedImages(prev => new Set([...prev, index]));
      };
      img.src = activePhotos[index].imageUrl;
    }
  }, [activePhotos, loadedImages]);

  // Carregar imagens adjacentes quando necessário
  useEffect(() => {
    if (activePhotos.length > 0) {
      // Carrega imagem atual
      preloadImage(currentSlide);

      // Carrega próxima imagem
      const nextIndex = (currentSlide + 1) % activePhotos.length;
      preloadImage(nextIndex);

      // Carrega imagem anterior
      const prevIndex = (currentSlide - 1 + activePhotos.length) % activePhotos.length;
      preloadImage(prevIndex);
    }
  }, [currentSlide, activePhotos.length, preloadImage]);

  // Auto play do carrossel
  useEffect(() => {
    if (isAutoPlaying && activePhotos.length > 1 && !isTransitioning) {
      intervalRef.current = setInterval(() => {
        nextSlide();
      }, 4000); // Reduzido para 4 segundos para ser mais dinâmico
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoPlaying, activePhotos.length, isTransitioning, currentSlide]);

  // Navegação com prevenção de cliques duplos
  const goToSlide = useCallback((index: number) => {
    if (isTransitioning || index === currentSlide) return;

    setIsTransitioning(true);
    setCurrentSlide(index);
    preloadImage(index);

    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  }, [currentSlide, isTransitioning, preloadImage]);

  const nextSlide = useCallback(() => {
    if (isTransitioning) return;
    const nextIndex = (currentSlide + 1) % activePhotos.length;
    goToSlide(nextIndex);
  }, [currentSlide, activePhotos.length, goToSlide, isTransitioning]);

  const prevSlide = useCallback(() => {
    if (isTransitioning) return;
    const prevIndex = (currentSlide - 1 + activePhotos.length) % activePhotos.length;
    goToSlide(prevIndex);
  }, [currentSlide, activePhotos.length, goToSlide, isTransitioning]);

  // Pausar/retomar auto play
  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  // Touch/swipe para mobile com melhor responsividade
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setIsAutoPlaying(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;

    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > 75; // Aumentado o threshold para evitar swipes acidentais
    const isRightSwipe = distance < -75;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }

    setTimeout(() => setIsAutoPlaying(true), 2000);
  };

  if (isLoading || activePhotos.length === 0) {
    return null;
  }

  const currentPhoto = activePhotos[currentSlide];

  return (
    <section 
      id="photo-carousel" 
      data-section="gallery"
      className="py-8 sm:py-16 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden"
      ref={sectionRef}
    >
      {/* Background decorativo */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        {/* Título da seção */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 max-w-4xl mx-auto"
        >
          <div className="relative inline-block mb-6">
            <motion.span 
              className={`inline-flex items-center px-3 py-1 text-xs font-medium tracking-wider uppercase bg-gradient-to-r ${badgeGradient ? BADGE_GRADIENTS[badgeGradient as keyof typeof BADGE_GRADIENTS] : 'from-purple-500 to-pink-500'} text-transparent bg-clip-text relative`}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <span className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-30"></span>
              {photoCarouselConfig.badge || "GALERIA"}
            </motion.span>
          </div>
          <h2 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-gray-900 mb-2 tracking-tight leading-tight">
            {processTextWithGradient(photoCarouselConfig.title || "Nossa (Galeria)", badgeGradient)}
          </h2>
          <p className="text-gray-600 text-xl max-w-3xl mx-auto leading-relaxed px-6 sm:px-8xed font-light">
            {photoCarouselConfig.subtitle || "Um olhar pelo ambiente acolhedor onde acontece o cuidado"}
          </p>
        </motion.div>

        {/* Carrossel principal */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div 
            className="relative rounded-3xl overflow-hidden shadow-2xl bg-white border border-gray-100"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ aspectRatio: '16/10' }}
          >
            {/* Container da imagem */}
            <div className="relative w-full h-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ 
                    duration: 0.25,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                  className="absolute inset-0"
                >
                  {loadedImages.has(currentSlide) ? (
                    <img
                      src={currentPhoto?.imageUrl}
                      alt={currentPhoto?.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse flex items-center justify-center">
                      <div className="w-12 h-12 border-4 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}

                  {/* Overlay de texto com gradiente suave */}
                  {currentPhoto?.showText && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
                      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-12">
                        <motion.div
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1, duration: 0.4 }}
                          className="text-white max-w-3xl"
                        >
                          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 leading-tight">
                            {currentPhoto?.title}
                          </h3>
                          {currentPhoto?.description && (
                            <p className="text-lg sm:text-xl text-gray-200 leading-relaxed font-light">
                              {currentPhoto?.description}
                            </p>
                          )}
                        </motion.div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Controles de navegação */}
            {activePhotos.length > 1 && (
              <>
                {/* Setas laterais */}
                <motion.button
                  whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 1)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={prevSlide}
                  disabled={isTransitioning}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 sm:p-4 rounded-full shadow-xl transition-all duration-200 backdrop-blur-sm border border-white/20 disabled:opacity-50"
                  aria-label="Foto anterior"
                >
                  <ChevronLeft size={24} className="sm:w-6 sm:h-6" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 1)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={nextSlide}
                  disabled={isTransitioning}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 sm:p-4 rounded-full shadow-xl transition-all duration-200 backdrop-blur-sm border border-white/20 disabled:opacity-50"
                  aria-label="Próxima foto"
                >
                  <ChevronRight size={24} className="sm:w-6 sm:h-6" />
                </motion.button>

                {/* Botão play/pause */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleAutoPlay}
                  className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 sm:p-3 rounded-full shadow-lg transition-all duration-200 backdrop-blur-sm"
                  aria-label={isAutoPlaying ? "Pausar slideshow" : "Reproduzir slideshow"}
                >
                  {isAutoPlaying ? (
                    <Pause size={16} className="sm:w-5 sm:h-5" />
                  ) : (
                    <Play size={16} className="sm:w-5 sm:h-5" />
                  )}
                </motion.button>
              </>
            )}
          </div>

          {/* Indicadores modernos */}
          {activePhotos.length > 1 && (
            <div className="flex justify-center mt-8 space-x-3">
              {activePhotos.map((_, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => goToSlide(index)}
                  disabled={isTransitioning}
                  className={`relative transition-all duration-300 disabled:opacity-50 ${
                    index === currentSlide
                      ? "w-12 h-3"
                      : "w-3 h-3 hover:w-6"
                  }`}
                  aria-label={`Ir para foto ${index + 1}`}
                >
                  <div className={`w-full h-full rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? "bg-gray-600 shadow-lg"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`} />
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

export default PhotoCarousel;