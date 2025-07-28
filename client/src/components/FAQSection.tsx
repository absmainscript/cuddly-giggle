/**
 * FAQSection.tsx
 * 
 * Seção de Perguntas Frequentes (FAQ) sobre terapia
 * Contém accordion expansível com dúvidas comuns dos clientes
 * Animações suaves para abrir/fechar perguntas
 * Sistema de estado para controlar qual pergunta está aberta
 */

import { motion } from "framer-motion"; // Animações do accordion
import { ChevronDown, Plus, Minus } from "lucide-react"; // Ícones para expandir
import { useEffect, useRef, useState } from "react"; // Gerenciamento de estado
import { useQuery } from "@tanstack/react-query"; // Query para dados do servidor
import type { FaqItem } from "@shared/schema"; // Tipo dos FAQs
import { processTextWithGradient, processBadgeWithGradient, BADGE_GRADIENTS } from "@/utils/textGradient"; // Processa texto com gradiente

export function FAQSection() {
  // Busca FAQs do banco de dados
  const { data: faqs = [], isLoading } = useQuery<FaqItem[]>({
    queryKey: ["/api/admin/faq"],
    queryFn: async () => {
      const response = await fetch("/api/admin/faq");
      return response.json();
    },
  });

  // Buscar configurações da seção FAQ
  const { data: configs } = useQuery({
    queryKey: ["/api/admin/config"],
    queryFn: async () => {
      const response = await fetch("/api/admin/config");
      return response.json();
    },
  });

  // Extrair configurações da seção FAQ
  const faqSection = configs?.find((c: any) => c.key === 'faq_section')?.value as any || {};

  // Obtém o gradiente dos badges
  const badgeGradient = configs?.find(c => c.key === 'badge_gradient')?.value?.gradient;

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <section id="faq" data-section="faq" className="main-section relative overflow-hidden" ref={ref} style={{ margin: 0, padding: 0 }}>
      <div className="py-8 sm:py-12">
        <div className="container mx-auto max-w-4xl px-6 text-center">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <div className="relative inline-block mb-6">
              <span className={`inline-flex items-center px-3 py-1 text-xs font-medium tracking-wider uppercase bg-gradient-to-r ${badgeGradient ? BADGE_GRADIENTS[badgeGradient as keyof typeof BADGE_GRADIENTS] || 'from-pink-500 to-purple-500' : 'from-pink-500 to-purple-500'} text-transparent bg-clip-text relative`}>
                <span className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-30"></span>
                {faqSection.badge || ""}
              </span>
            </div>
            <h2 className="font-display font-semibold text-3xl sm:text-4xl lg:text-5xl text-gray-900 mb-2 tracking-tight">
              {processTextWithGradient(faqSection.title || "", badgeGradient)}
            </h2>
            {faqSection.subtitle && (
              <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed px-6 sm:px-8">
                {faqSection.subtitle}
              </p>
            )}
            {faqSection.description && (
              <p className="text-gray-500 text-base max-w-xl mx-auto mt-2 leading-relaxed px-6 sm:px-8">
                {faqSection.description}
              </p>
            )}
          </motion.div>

          <div className="space-y-0">
            {faqs.filter(faq => faq.isActive).map((faq, index) => (
              <motion.div
                key={faq.id}
                className="group"
                initial={{ opacity: 0, y: 30 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <div
                  className={`
                  relative overflow-hidden ${index === 0 ? 'rounded-t-2xl' : ''} ${index === faqs.filter(faq => faq.isActive).length - 1 ? 'rounded-b-2xl' : ''} border-l border-r border-t ${index === faqs.filter(faq => faq.isActive).length - 1 ? 'border-b' : ''} transition-all duration-500 ease-out cursor-pointer
                  ${openFaq === index
                      ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 shadow-xl shadow-purple-100/50 z-10'
                      : 'bg-white/70 backdrop-blur-sm border-gray-200/60 hover:border-purple-200 hover:shadow-lg hover:shadow-purple-100/30'
                    }
                `}
                  onClick={() => toggleFaq(index)}
                >
                  {/* Gradient overlay sutil */}
                  <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                  <div className="relative p-8">
                    <div className="flex items-center justify-between">
                      <h3 className={`
                      font-semibold text-lg leading-relaxed pr-6 transition-colors duration-300
                      ${openFaq === index ? 'text-purple-900' : 'text-gray-800 group-hover:text-purple-800'}
                    `}>
                        {faq.question}
                      </h3>

                      <div className={`
                      flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                      ${openFaq === index
                          ? 'bg-purple-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-600 group-hover:bg-purple-100 group-hover:text-purple-600'
                        }
                    `}>
                        <motion.div
                          animate={{ rotate: openFaq === index ? 180 : 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                          {openFaq === index ? (
                            <Minus size={20} />
                          ) : (
                            <Plus size={20} />
                          )}
                        </motion.div>
                      </div>
                    </div>

                    <motion.div
                      initial={false}
                      animate={{
                        height: openFaq === index ? "auto" : 0,
                        opacity: openFaq === index ? 1 : 0,
                        marginTop: openFaq === index ? 24 : 0
                      }}
                      transition={{
                        duration: 0.4,
                        ease: [0.4, 0.0, 0.2, 1]
                      }}
                      className="overflow-hidden"
                    >
                      <div className="pt-6">
                        <motion.p
                          className="text-gray-700 leading-relaxed text-lg font-light"
                          initial={{ y: 10, opacity: 0 }}
                          animate={{
                            y: openFaq === index ? 0 : 10,
                            opacity: openFaq === index ? 1 : 0
                          }}
                          transition={{ duration: 0.3, delay: openFaq === index ? 0.1 : 0 }}
                        >
                          {faq.answer}
                        </motion.p>
                      </div>
                    </motion.div>
                  </div>

                  {/* Borda brilhante no hover */}
                  <div className={`
                  absolute inset-0 ${index === 0 ? 'rounded-t-2xl' : ''} ${index === faqs.filter(faq => faq.isActive).length - 1 ? 'rounded-b-2xl' : ''} transition-opacity duration-300 pointer-events-none
                  ${openFaq === index
                      ? 'bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-purple-400/20 opacity-100'
                      : 'bg-gradient-to-r from-purple-400/10 via-pink-400/10 to-purple-400/10 opacity-0 group-hover:opacity-100'
                    }
                `}
                    style={{
                      background: openFaq === index
                        ? 'linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(236, 72, 153, 0.1) 50%, rgba(147, 51, 234, 0.1) 100%)'
                        : undefined
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default FAQSection;