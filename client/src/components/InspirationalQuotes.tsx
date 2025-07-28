/**
 * InspirationalQuotes.tsx
 * 
 * Seção de frases inspiracionais sobre saúde mental
 * Carrossel automático com citações motivacionais
 * Efeitos de fade in/out suaves entre as frases
 * Contribui para engajamento emocional do usuário
 */

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { SiteConfig } from "@shared/schema";
import { processTextWithGradient, processBadgeWithGradient } from "@/utils/textGradient";
import { apiRequest } from "@/lib/queryClient";

// Assuming BADGE_GRADIENTS is defined elsewhere in your project
const BADGE_GRADIENTS = {
  // Example gradients, replace with your actual gradients
  "coral-purple": "from-coral to-purple-soft",
  "pink-purple": "from-pink-500 to-purple-500",
};

export function InspirationalQuotes() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Busca configurações das citações
  const { data: configs } = useQuery({
    queryKey: ["/api/admin/config"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/config");
      return response.json();
    },
  });

  // Extrair configurações da seção inspiracional
  const inspirationalSection = configs?.find((c: any) => c.key === 'inspirational_section')?.value as any || {};

  // Obtém o gradiente dos badges
  const badgeGradient = configs?.find(c => c.key === 'badge_gradient')?.value?.gradient;

  // Extrair quote e author dos dados
  const quote = inspirationalSection.quote || "A transformação começa quando decidimos cuidar de nós mesmos.";
  const author = inspirationalSection.author || "Dra. Adrielle Benhossi";

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

  return (
    <section id="inspirational" data-section="inspirational" className="main-section relative overflow-hidden" ref={ref} style={{ margin: 0, padding: 0 }}>
      <div className="py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            {/* Improved INSPIRAÇÃO badge design */}
            <div className="relative inline-block mb-6">
              <span className={`inline-flex items-center px-3 py-1 text-xs font-medium tracking-wider uppercase bg-gradient-to-r ${badgeGradient ? BADGE_GRADIENTS[badgeGradient as keyof typeof BADGE_GRADIENTS] : 'from-pink-500 to-purple-500'} text-transparent bg-clip-text relative`}>
                <span className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-30"></span>
                INSPIRAÇÃO
              </span>
            </div>

            <div className="glass p-6 sm:p-12 rounded-3xl max-w-4xl mx-auto hover:scale-105 transition-all duration-300 cursor-pointer">
              <Quote className="text-4xl text-coral mb-4 mx-auto" size={48} />
              <blockquote className="font-display text-lg sm:text-2xl md:text-3xl text-gray-700 font-light leading-relaxed mb-4">
                "{quote}"
              </blockquote>
              <div className="w-16 h-1 bg-gradient-to-r from-coral to-purple-soft mx-auto mb-2"></div>
              <cite className="text-gray-500 text-lg">{author}</cite>
            </div>
            <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto px-6 sm:px-8">
              {inspirationalSection.subtitle || "Reflexões e pensamentos que podem inspirar seu crescimento pessoal e bem-estar emocional."}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default InspirationalQuotes;