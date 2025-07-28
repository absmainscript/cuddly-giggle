import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { SiteConfig } from '@shared/schema';

export function useSectionColors() {
  const { data: configs } = useQuery<SiteConfig[]>({
    queryKey: ['/api/admin/config'],
    queryFn: () => apiRequest('GET', '/api/admin/config'),
  });

  const applySectionColors = () => {
    if (!configs) return;

    // Obtém configurações de cores das seções
    const sectionColorsConfig = configs.find(c => c.key === 'section_colors')?.value as any || {};

    // Obtém cor do botão de agendamento
    const generalInfo = configs.find(c => c.key === 'general_info')?.value as any || {};
    const schedulingButtonColor = generalInfo.schedulingButtonColor;

    // Mapeia IDs das seções para seletores CSS mais genéricos
    const sectionSelectors = {
      hero: ['#hero-section', '[data-section="hero"]', '.hero-section'],
      about: ['#about-section', '[data-section="about"]', '.about-section'],
      services: ['#services-section', '[data-section="services"]', '.services-section'],
      testimonials: ['#testimonials-section', '[data-section="testimonials"]', '.testimonials-section'],
      gallery: ['#photo-carousel-section', '[data-section="gallery"]', '.photo-carousel-section', '.gallery-section'],
      faq: ['#faq-section', '[data-section="faq"]', '.faq-section'],
      contact: ['#contact-section', '[data-section="contact"]', '.contact-section'],
      inspirational: ['#inspirational-section', '[data-section="inspirational"]', '.inspirational-section']
    };

    // Aplica cores para cada seção
    Object.entries(sectionColorsConfig).forEach(([sectionId, colors]: [string, any]) => {
      const selectors = sectionSelectors[sectionId as keyof typeof sectionSelectors];
      if (!selectors || !colors) return;

      let sectionElement: HTMLElement | null = null;

      // Tenta encontrar o elemento usando diferentes seletores
      for (const selector of selectors) {
        sectionElement = document.querySelector(selector) as HTMLElement;
        if (sectionElement) break;
      }

      if (sectionElement) {
        // Remove estilos antigos
        sectionElement.style.removeProperty('background');
        sectionElement.style.removeProperty('background-color');
        sectionElement.style.removeProperty('background-image');
        sectionElement.style.removeProperty('opacity');

        // Remove backgrounds fixos específicos das seções problemáticas
        if (sectionId === 'faq') {
          const faqContainer = sectionElement.querySelector('div[class*="bg-gradient-to-br"]');
          if (faqContainer) {
            (faqContainer as HTMLElement).className = (faqContainer as HTMLElement).className.replace(/bg-gradient-to-br[^\\s]*/, '').replace(/from-[^\\s]*/, '').replace(/via-[^\\s]*/, '').replace(/to-[^\\s]*/, '');
          }
        }

        if (colors.backgroundType === "solid") {
          sectionElement.style.backgroundColor = colors.backgroundColor;
        } else if (colors.backgroundType === "gradient" && colors.gradientColors) {
          const direction = colors.gradientDirection || "to-br";
          const cssDirection = direction.replace('to-', '');
          let gradientDirection = '';

          switch (cssDirection) {
            case 'r': gradientDirection = 'to right'; break;
            case 'l': gradientDirection = 'to left'; break;
            case 'b': gradientDirection = 'to bottom'; break;
            case 't': gradientDirection = 'to top'; break;
            case 'br': gradientDirection = 'to bottom right'; break;
            case 'bl': gradientDirection = 'to bottom left'; break;
            case 'tr': gradientDirection = 'to top right'; break;
            case 'tl': gradientDirection = 'to top left'; break;
            default: gradientDirection = 'to bottom right';
          }

          sectionElement.style.backgroundImage = `linear-gradient(${gradientDirection}, ${colors.gradientColors[0]}, ${colors.gradientColors[1]})`;
        } else if (colors.backgroundType === "pattern") {
          sectionElement.style.backgroundColor = colors.backgroundColor;
        }

        if (colors.opacity !== undefined && colors.opacity !== 1) {
          sectionElement.style.opacity = colors.opacity.toString();
        }

        if (colors.overlayColor && colors.overlayOpacity && colors.overlayOpacity > 0) {
          sectionElement.style.position = "relative";

          // Remove overlay anterior se existir
          const existingOverlay = sectionElement.querySelector('.section-overlay');
          if (existingOverlay) {
            existingOverlay.remove();
          }

          // Adiciona novo overlay
          const overlay = document.createElement('div');
          overlay.className = 'section-overlay';
          overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: ${colors.overlayColor};
            opacity: ${colors.overlayOpacity};
            pointer-events: none;
            z-index: 1;
          `;
          sectionElement.appendChild(overlay);

          // Garante que o conteúdo fique acima do overlay
          const content = sectionElement.children;
          for (let i = 0; i < content.length; i++) {
            if (content[i] !== overlay) {
              (content[i] as HTMLElement).style.position = 'relative';
              (content[i] as HTMLElement).style.zIndex = '2';
            }
          }
        }

        console.log(`Cores aplicadas para seção ${sectionId}:`, colors);
      } else {
        console.warn(`Elemento da seção ${sectionId} não encontrado`);
      }
    });

    // Aplicar cor aos botões de agendamento se especificada
    if (schedulingButtonColor) {
      // Encontrar botões que contenham texto "Agendar"
      const allButtons = document.querySelectorAll('button, a');
      allButtons.forEach(button => {
        const buttonText = button.textContent?.toLowerCase() || '';
        if (buttonText.includes('agendar') || buttonText.includes('consulta')) {
          (button as HTMLElement).style.backgroundColor = schedulingButtonColor;
        }
      });

      // Também aplicar aos botões com classes específicas
      const specificButtons = document.querySelectorAll('.scheduling-button, .btn-scheduling');
      specificButtons.forEach(button => {
        (button as HTMLElement).style.backgroundColor = schedulingButtonColor;
      });
    }
  };

  useEffect(() => {
    if (!configs) return;

    // Aplica imediatamente
    applySectionColors();

    // Observa mudanças no DOM para aplicar cores quando novas seções são carregadas
    const observer = new MutationObserver(() => {
      setTimeout(applySectionColors, 100);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Aplica cores após um delay para garantir que os elementos estejam carregados
    const timeouts = [
      setTimeout(applySectionColors, 500),
      setTimeout(applySectionColors, 1000),
      setTimeout(applySectionColors, 2000)
    ];

    return () => {
      observer.disconnect();
      timeouts.forEach(clearTimeout);
    };
  }, [configs]);

  return null;
}