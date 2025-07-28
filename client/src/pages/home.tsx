/**
 * home.tsx
 * 
 * Página principal do site da psicóloga
 * Organiza todas as seções em uma single-page application
 * Layout: Header -> Hero -> About -> Services -> Quotes -> Testimonials -> FAQ -> Contact -> Footer
 * Controla botão "voltar ao topo" baseado na posição do scroll
 */

import React, { useState, useEffect, useRef, Suspense, lazy } from "react"; // Controle do botão scroll to top
import { ChevronUp } from "lucide-react"; // Ícone do botão voltar ao topo
import { useQuery } from "@tanstack/react-query";
import { HeroSection } from "@/components/HeroSection";
import { Navigation } from "@/components/Navigation";
import { MarketingPixels } from "@/components/MarketingPixels";
import { MaintenancePage } from "@/components/MaintenancePage";
import { LoadingFallback, SectionSkeleton } from "@/components/LoadingFallback";
import { useSectionVisibility } from "@/hooks/useSectionVisibility";
import { useSectionColors } from "@/hooks/useSectionColors";
import { apiRequest } from "@/lib/queryClient";
import type { SiteConfig } from "@shared/schema";

// Lazy loading para seções não críticas
const AboutAndSpecialtiesSection = lazy(() => import("@/components/AboutAndSpecialtiesSection").then(m => ({ default: m.default })));
const ServicesSection = lazy(() => import("@/components/ServicesSection").then(m => ({ default: m.ServicesSection })));
const TestimonialsCarousel = lazy(() => import("@/components/TestimonialsCarousel").then(m => ({ default: m.TestimonialsCarousel })));
const FAQSection = lazy(() => import("@/components/FAQSection").then(m => ({ default: m.default })));
const ContactSection = lazy(() => import("@/components/ContactSection").then(m => ({ default: m.ContactSection })));
const PhotoCarousel = lazy(() => import("@/components/PhotoCarousel").then(m => ({ default: m.PhotoCarousel })));
const InspirationalQuotes = lazy(() => import("@/components/InspirationalQuotes").then(m => ({ default: m.InspirationalQuotes })));
const Footer = lazy(() => import("@/components/Footer").then(m => ({ default: m.Footer })));
// Componente principal da página home
export default function Home() {
  // Verifica modo de manutenção usando endpoint público
  const { data: maintenanceCheck, isLoading: isMaintenanceLoading } = useQuery({
    queryKey: ["/api/maintenance-check"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/maintenance-check");
      return response.json();
    },
    staleTime: 30000, // Cache por 30 segundos
    retry: 1, // Menos tentativas para acelerar
  });

  const [showBackToTop, setShowBackToTop] = useState(false);
  const footerRef = useRef<HTMLDivElement>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // Hook para controlar visibilidade das seções
  const {
    isHeroVisible,
    isAboutVisible,
    isSpecialtiesVisible,
    isServicesVisible,
    isTestimonialsVisible,
    isFaqVisible,
    isContactVisible,
    isPhotoCarouselVisible,
    isInspirationalVisible
  } = useSectionVisibility();

  // Buscar ordem das seções
  const { data: configs, isLoading: isConfigsLoading } = useQuery({
    queryKey: ["/api/admin/config"],
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false, // Evita refetch desnecessário
  });

  const orderConfig = Array.isArray(configs) ? 
    configs.find((c: any) => c.key === 'sections_order')?.value as any || {} : 
    {};

  // Definir seções ordenáveis com seus componentes
  const sections = [
    {
      key: 'hero',
      component: <HeroSection />,
      visible: isHeroVisible,
      order: orderConfig.hero ?? 0
    },
    {
      key: 'about-specialties', 
      component: <AboutAndSpecialtiesSection />,
      visible: isAboutVisible || isSpecialtiesVisible,
      order: Math.min(orderConfig.about ?? 1, orderConfig?.specialties ?? 1.5)
    },
    {
      key: 'services',
      component: <ServicesSection />,
      visible: isServicesVisible, 
      order: orderConfig.services ?? 2
    },
    {
      key: 'testimonials',
      component: <TestimonialsCarousel />,
      visible: isTestimonialsVisible,
      order: orderConfig.testimonials ?? 3
    },
    {
      key: 'faq',
      component: <FAQSection />,
      visible: isFaqVisible,
      order: orderConfig.faq ?? 4
    },
    {
      key: 'contact',
      component: <ContactSection />,
      visible: isContactVisible,
      order: orderConfig.contact ?? 5
    },
    {
      key: 'photo-carousel',
      component: <PhotoCarousel />,
      visible: isPhotoCarouselVisible,
      order: orderConfig['photo-carousel'] ?? 3.5
    },

    {
      key: 'inspirational',
      component: <InspirationalQuotes />,
      visible: isInspirationalVisible,
      order: orderConfig.inspirational ?? 6
    }
  ].sort((a, b) => a.order - b.order);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;

      // Botão aparece quando usuário rola mais que 300px
      setShowBackToTop(scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 1500);

    // Check if critical content is loaded
    const checkContentReady = () => {
      const heroSection = document.querySelector('[data-section="hero"]');
      const navigation = document.querySelector('nav');

      if (heroSection && navigation) {
        setInitialLoading(false);
        clearTimeout(timer);
      }
    };

    // Check immediately and after a short delay
    checkContentReady();
    const readyTimer = setTimeout(checkContentReady, 500);

    return () => {
      clearTimeout(timer);
      clearTimeout(readyTimer);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  // Verifica se o modo de manutenção está ativo
  const isMaintenanceMode = maintenanceCheck?.maintenance?.enabled || false;

  const sectionVisibility = useSectionVisibility();
  useSectionColors(); // Aplica as cores das seções

  // Loading inicial para evitar flash de conteúdo
  if (isMaintenanceLoading || isConfigsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 flex items-center justify-center">
        <LoadingFallback type="spinner" />
      </div>
    );
  }

  // Se o modo de manutenção estiver ativo, exibe apenas a página de manutenção
  if (isMaintenanceMode) {
    return (
      <>
        <MarketingPixels />
        <MaintenancePage />
      </>
    );
  }

  return (
    // Container principal com fonte e overflow controlado - flexbox vertical
    <div className="main-page-container font-sans text-gray-800 overflow-x-hidden bg-gradient-to-br from-slate-50 via-white to-gray-50 min-h-screen flex flex-col relative">
      {/* Background decorativo sutil */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-blue-100/20 to-purple-100/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-100/15 to-blue-100/15 rounded-full blur-3xl"></div>
      </div>

      {/* Navegação fixa no topo - sempre visível */}
      <Navigation />

      {/* Container principal das seções - ocupa o espaço disponível */}
      <main className="relative z-10 w-full flex-grow">
        {/* Seções dinâmicas ordenadas pelo admin */}
        {sections.map((section, index) => 
          section.visible ? (
            <Suspense 
              key={section.key} 
              fallback={<SectionSkeleton />}
            >
              <section className="w-full">
                {section.component}
              </section>
            </Suspense>
          ) : null
        )}
      </main>

      {/* Rodapé - informações finais - sempre colado na parte inferior */}
      <Suspense fallback={<SectionSkeleton className="bg-gray-100" />}>
        <footer ref={footerRef} className="relative z-10 w-full">
          <Footer />
        </footer>
      </Suspense>

      {/* Botão voltar ao topo - aparece quando scroll > 300px */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-6 z-[120] card-aesthetic p-4 text-gray-700 hover:text-purple-600 hover:scale-110 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 group"
          aria-label="Voltar ao topo"
        >
          <ChevronUp size={24} className="group-hover:animate-bounce" />
        </button>
      )}

      <MarketingPixels />
    </div>
  );
}