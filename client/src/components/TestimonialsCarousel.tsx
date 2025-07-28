/**
 * TestimonialsCarousel.tsx
 * 
 * Carrossel de depoimentos dos clientes da psicóloga
 * Funcionalidades: autoplay, navegação manual, animações suaves
 * Contém avatares personalizados para cada tipo de terapia
 */

import { motion } from "framer-motion"; // Animações suaves
import { ChevronLeft, ChevronRight, Star } from "lucide-react"; // Ícones
import { useEffect, useRef, useState } from "react"; // Hooks do React
import { TestimonialAvatar } from "./Avatar"; // Avatar dos depoimentos
import { useQuery } from "@tanstack/react-query"; // Query para dados do servidor
import type { Testimonial } from "@shared/schema"; // Tipo dos depoimentos
import { processTextWithGradient, processBadgeWithGradient, BADGE_GRADIENTS } from "@/utils/textGradient"; // Processa texto com gradiente

export function TestimonialsCarousel() {
  // Sempre chamar hooks na mesma ordem
  // busca depoimentos do banco de dados
  const { data: testimonials = [], isLoading, error } = useQuery<Testimonial[]>({
    queryKey: ["/api/testimonials"],
    queryFn: async () => {
      const response = await fetch("/api/testimonials");
      if (!response.ok) {
        throw new Error('Erro ao buscar depoimentos');
      }
      const data = await response.json();
      console.log('Depoimentos carregados:', data);
      return data;
    },
  });

  // Buscar configurações da seção depoimentos
  const { data: configs } = useQuery({
    queryKey: ["/api/config"],
    queryFn: async () => {
      const response = await fetch("/api/config");
      return response.json();
    },
  });

  // Extrair configurações da seção depoimentos
  const testimonialsSection = configs?.find((c: any) => c.key === 'testimonials_section')?.value as any || {};

  // Verificar visibilidade da seção
  const sectionVisibility = configs?.find((c: any) => c.key === 'section_visibility')?.value as any || {};
  const isTestimonialsVisible = sectionVisibility?.testimonials !== false;

  // Debug para verificar se os dados estão chegando
  console.log('Testimonials Section Data:', testimonialsSection);
  console.log('Section Visibility:', sectionVisibility);
  console.log('Is Testimonials Visible:', isTestimonialsVisible);
  console.log('Testimonials Count:', testimonials.length);
  console.log('Testimonials Data:', testimonials);

  // Obtém o gradiente dos badges
  const badgeGradient = configs?.find(c => c.key === 'badge_gradient')?.value?.gradient;

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isAutoPlaying && testimonials.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % testimonials.length);
      }, 4000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoPlaying, testimonials.length]);

  // Initialize autoplay when testimonials load
  useEffect(() => {
    if (testimonials.length > 1) {
      setIsAutoPlaying(true);
    }
  }, [testimonials]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  // Touch handlers for swipe functionality
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  // Conditional returns after all hooks
  if (isLoading) {
    return (
      <section className="section-spacing bg-gradient-to-r from-purple-100 via-pink-100 to-purple-100">
        <div className="mobile-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-800 mb-4">
              Carregando depoimentos...
            </h2>
          </div>
        </div>
      </section>
    );
  }

  // Se a seção estiver oculta, não renderizar
  if (!isTestimonialsVisible) {
    console.log('Seção de depoimentos está oculta');
    return null;
  }

  if (!testimonials.length) {
    console.log('Nenhum depoimento encontrado');
    return null;
  }

  return (
    <section id="testimonials" data-section="testimonials" className="main-section relative" style={{ margin: 0, padding: 0 }}>
      <div className="relative py-16 sm:py-20 lg:py-24">
        {/* Título e descrição da seção */}
        <div className="text-center mb-16">
          <div className="relative inline-block mb-6">
            <span className={`inline-flex items-center px-3 py-1 text-xs font-medium tracking-wider uppercase bg-gradient-to-r ${badgeGradient ? BADGE_GRADIENTS[badgeGradient as keyof typeof BADGE_GRADIENTS] : 'from-pink-500 to-purple-500'} text-transparent bg-clip-text relative`}>
              <span className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-30"></span>
              {testimonialsSection.badge || "DEPOIMENTOS"}
            </span>
          </div>
          <h2 className="font-display font-semibold text-3xl sm:text-4xl lg:text-5xl text-gray-900 mb-2 tracking-tight">
            {processTextWithGradient(testimonialsSection.title || "Histórias de (transformação)", badgeGradient)}
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed px-6 sm:px-8">
            {testimonialsSection.subtitle || "Experiências reais de pessoas que encontraram equilíbrio e bem-estar através do acompanhamento psicológico"}
          </p>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="overflow-hidden rounded-3xl"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <motion.div
              className="flex transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={index} className="w-full flex-shrink-0 px-4">
                  <div className="bg-white p-8 rounded-2xl text-center border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:shadow-lg">
                    {/* Avatar ou foto */}
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                      {testimonial.photo ? (
                        <img 
                          src={testimonial.photo} 
                          alt={`Foto de ${testimonial.name}`} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error('Erro ao carregar foto do depoimento:', testimonial.photo);
                            // Em caso de erro, volta para o avatar
                            e.currentTarget.style.display = 'none';
                            const avatarDiv = e.currentTarget.nextElementSibling as HTMLDivElement;
                            if (avatarDiv) avatarDiv.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full flex items-center justify-center ${testimonial.photo ? 'hidden' : ''}`}>
                        <TestimonialAvatar gender={testimonial.gender || "maria" | "male" | "couple" | "childtherapy" | "darthvader"} />
                      </div>
                    </div>

                    {/* Estrelas amarelas clean */}
                    <div className="flex justify-center mb-6 gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                      {[...Array(5 - testimonial.rating)].map((_, i) => (
                        <Star key={i + testimonial.rating} className="w-4 h-4 text-gray-200" />
                      ))}
                    </div>

                    {/* Depoimento sem aspas decorativas */}
                    <blockquote className="text-gray-700 text-lg leading-relaxed mb-6 font-normal">
                      "{testimonial.testimonial}"
                    </blockquote>

                    {/* Informações do cliente */}
                    <div className="pt-4 border-t border-gray-50">
                      <cite className="not-italic">
                        <div className="font-medium text-gray-900 mb-1">{testimonial.name}</div>
                        <div className="text-gray-500 text-sm">{testimonial.service}</div>
                      </cite>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Navigation arrows simples */}
          <button
            onClick={prevSlide}
            className="absolute -left-4 sm:-left-6 lg:-left-12 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all duration-200 border border-gray-200 shadow-sm z-20"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute -right-4 sm:-right-6 lg:-right-12 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all duration-200 border border-gray-200 shadow-sm z-20"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dot indicators simples */}
          <div className="flex justify-center space-x-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentSlide 
                    ? "bg-gray-600 w-6" 
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Ir para depoimento ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}