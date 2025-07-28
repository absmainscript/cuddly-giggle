/**
 * MarketingPixels.tsx
 * 
 * Componente responsável por injetar dinamicamente os pixels de marketing no head da página
 * Inclui Facebook Pixel e Google Analytics/Ads baseado nas configurações do admin
 * Carrega as configurações da API e aplica os scripts apropriados
 */

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

export function MarketingPixels() {
  // Buscar configurações de marketing
  const { data: configs } = useQuery({
    queryKey: ["/api/admin/config"],
    queryFn: async () => {
      const response = await fetch("/api/admin/config");
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  useEffect(() => {
    // Extrair configurações de marketing
    const marketingConfig = configs?.find((c: any) => c.key === 'marketing_pixels');
    const marketingData = marketingConfig?.value as any || {};

    const { facebookPixel1, facebookPixel2, googlePixel } = marketingData;

    // Função para adicionar script no head
    const addScript = (content: string, id: string) => {
      // Remove script existente se houver
      const existingScript = document.getElementById(id);
      if (existingScript) {
        existingScript.remove();
      }

      // Adiciona novo script
      const script = document.createElement('script');
      script.id = id;
      script.innerHTML = content;
      document.head.appendChild(script);
    };

    // Adicionar Facebook Pixel #1
    if (facebookPixel1) {
      const fbPixel1Script = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${facebookPixel1}');
        fbq('track', 'PageView');
      `;
      addScript(fbPixel1Script, 'facebook-pixel-1');

      // Adicionar noscript para Facebook Pixel #1
      const noscript1 = document.createElement('noscript');
      noscript1.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${facebookPixel1}&ev=PageView&noscript=1" />`;
      document.head.appendChild(noscript1);
    }

    // Adicionar Facebook Pixel #2 (se configurado)
    if (facebookPixel2) {
      const fbPixel2Script = `
        fbq('init', '${facebookPixel2}');
        fbq('track', 'PageView');
      `;
      addScript(fbPixel2Script, 'facebook-pixel-2');

      // Adicionar noscript para Facebook Pixel #2
      const noscript2 = document.createElement('noscript');
      noscript2.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${facebookPixel2}&ev=PageView&noscript=1" />`;
      document.head.appendChild(noscript2);
    }

    // Adicionar Google Analytics/Ads
    if (googlePixel) {
      const googleScript = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${googlePixel}');
      `;
      addScript(googleScript, 'google-analytics');

      // Adicionar script do Google Analytics
      const gtagScript = document.createElement('script');
      gtagScript.async = true;
      gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${googlePixel}`;
      document.head.appendChild(gtagScript);
    }

  }, [configs]);

  return null; // Este componente não renderiza nada
}

export default MarketingPixels;