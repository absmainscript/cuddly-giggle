/**
 * useSectionVisibility.ts
 * 
 * Hook personalizado para controlar a visibilidade das seções do site
 * Verifica configurações do admin e retorna se cada seção deve ser exibida
 * Permite ativar/desativar seções inteiras através do painel administrativo
 */

import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { SiteConfig } from "@shared/schema";

interface SectionVisibilityConfig {
  hero?: boolean;
  about?: boolean;
  services?: boolean;
  testimonials?: boolean;
  faq?: boolean;
  contact?: boolean;
}

export function useSectionVisibility() {
  const { data: configs } = useQuery({
    queryKey: ["/api/admin/config"],
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const visibilityConfig = configs?.find((c: any) => c.key === 'section_visibility')?.value as any || {};

  const isHeroVisible = visibilityConfig?.hero !== false;
  const isAboutVisible = visibilityConfig?.about !== false;
  const isSpecialtiesVisible = visibilityConfig?.specialties !== false;
  const isServicesVisible = visibilityConfig?.services !== false;
  const isTestimonialsVisible = visibilityConfig?.testimonials !== false;
  const isFaqVisible = visibilityConfig?.faq !== false;
  const isContactVisible = visibilityConfig?.contact !== false;
  const isPhotoCarouselVisible = visibilityConfig?.['photo-carousel'] !== false;
  const isInspirationalVisible = visibilityConfig?.inspirational !== false;

  return {
    isHeroVisible,
    isAboutVisible,
    isSpecialtiesVisible,
    isServicesVisible,
    isTestimonialsVisible,
    isFaqVisible,
    isContactVisible,
    isPhotoCarouselVisible,
    isInspirationalVisible,
  };
}