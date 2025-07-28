import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export function useTheme() {
  const { data: configs } = useQuery<any[]>({
    queryKey: ["/api/admin/config"],
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  useEffect(() => {
    if (!configs) return;

    const colorsConfig = configs.find(c => c.key === 'colors')?.value;
    if (!colorsConfig) return;

    // Função para aplicar cores dinamicamente ao site
    const applyColorsToSite = (colors: any) => {
      const root = document.documentElement;

      // Converte hex para HSL para compatibilidade
      const hexToHsl = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0, s = 0, l = (max + min) / 2;

        if (max !== min) {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
          }
          h /= 6;
        }

        return `${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%`;
      };

      // Aplica as cores personalizadas
      if (colors.primary) {
        root.style.setProperty('--coral', colors.primary);
        root.style.setProperty('--primary', `hsl(${hexToHsl(colors.primary)})`);
      }

      if (colors.secondary) {
        root.style.setProperty('--purple-soft', colors.secondary);
        root.style.setProperty('--secondary', `hsl(${hexToHsl(colors.secondary)})`);
      }

      if (colors.accent) {
        root.style.setProperty('--accent', `hsl(${hexToHsl(colors.accent)})`);
      }

      // Atualiza background gradient se especificado
      if (colors.background && colors.background.includes('gradient')) {
        // Remove estilos anteriores
        const existingStyle = document.getElementById('dynamic-gradient');
        if (existingStyle) {
          existingStyle.remove();
        }

        const style = document.createElement('style');
        style.id = 'dynamic-gradient';

        // Verifica se é um gradiente animado
        const isAnimated = colors.background.includes('#');

        if (isAnimated) {
          // Adiciona animações CSS para gradientes animados
          style.innerHTML = `
            @keyframes aurora-gradient {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }

            @keyframes sunset-gradient {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }

            @keyframes ocean-gradient {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }

            @keyframes spring-gradient {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }

            .gradient-bg, 
            body,
            .main-bg { 
              background: ${colors.background};
              background-size: 400% 400%;
              animation: aurora-gradient 15s ease infinite;
            }
          `;
        } else {
          style.innerHTML = `
            .gradient-bg, 
            body,
            .main-bg { 
              background: ${colors.background} !important; 
            }
          `;
        }

        document.head.appendChild(style);
      }
    };

    // Listener para mudanças de cores das seções
    const handleColorsUpdated = (event: CustomEvent) => {
      const { sectionId, colors } = event.detail;
      console.log(`Aplicando cores para seção ${sectionId}:`, colors);

      // Força a aplicação das cores
      const section = document.querySelector(`[data-section="${sectionId}"]`);
      if (section) {
        const element = section as HTMLElement;
        element.classList.add('section-colored');

        // Aplica as cores com !important para garantir precedência
        if (colors.backgroundType === 'solid') {
          element.style.setProperty('background-color', colors.backgroundColor, 'important');
          element.style.removeProperty('background-image');
        } else if (colors.backgroundType === 'gradient') {
          element.style.setProperty('background-image', colors.backgroundColor, 'important');
          element.style.removeProperty('background-color');
        }

        element.style.setProperty('opacity', colors.opacity.toString(), 'important');
      }
    };

    // Remove listener anterior se existir
    window.removeEventListener('colorsUpdated', handleColorsUpdated as EventListener);
    // Adiciona novo listener
    window.addEventListener('colorsUpdated', handleColorsUpdated as EventListener);

    applyColorsToSite(colorsConfig);
  }, [configs]);

  return { configs };
}