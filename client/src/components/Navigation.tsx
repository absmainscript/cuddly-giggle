/**
 * Navigation.tsx
 * 
 * Barra de navegação responsiva do site
 * Funcionalidades: menu fixo, navegação smooth scroll, menu mobile hambúrguer
 * Contém informações profissionais da psicóloga (nome, CRP, avatar)
 */

import { useState, useEffect } from "react"; // Hooks do React
import { Menu, X, Mail, MapPin, Clock, MessageCircle } from "lucide-react"; // Ícones para menu mobile
import { Avatar } from "./Avatar"; // Componente do avatar
import { useQuery } from "@tanstack/react-query"; // Para buscar configurações
import { useSectionVisibility } from "@/hooks/useSectionVisibility"; // Para controlar visibilidade das seções

export function Navigation() {
  // Buscar configurações do site incluindo a imagem do hero
  const { data: configs } = useQuery({
    queryKey: ["/api/admin/config"],
    queryFn: async () => {
      const response = await fetch("/api/admin/config");
      return response.json();
    },
  });

  // Hook para verificar visibilidade das seções
  const { 
    isAboutVisible, 
    isServicesVisible, 
    isTestimonialsVisible, 
    isContactVisible 
  } = useSectionVisibility();

  // Extrair a imagem personalizada do hero se disponível
  const heroImage = configs?.find((c: any) => c.key === 'hero_image');
  const customImage = heroImage?.value?.path || null;

  // Extrair CRP das configurações
  const generalInfo = configs?.find((c: any) => c.key === 'general_info')?.value as any || {};
  const currentCrp = generalInfo.crp || "08/123456";

  // Estado para controlar se a página foi rolada (muda aparência da nav)
  const [isScrolled, setIsScrolled] = useState(false);
  // Estado para controlar se menu mobile está aberto
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Effect para detectar scroll da página
  useEffect(() => {
    const handleScroll = () => {
      // Ativa fundo opaco após rolar 100px
      setIsScrolled(window.scrollY > 100);
    };

    // Adiciona listener de scroll
    window.addEventListener("scroll", handleScroll);
    // Remove listener quando componente é desmontado
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled ? "glass-strong" : "glass"
        } border-b border-gray-200/30`}
      >
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 max-w-7xl relative">
          <div className="flex items-center justify-center sm:justify-between w-full">
            {/* Avatar no canto esquerdo - apenas mobile */}
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 sm:hidden">
              {customImage ? (
                <img 
                  src={customImage} 
                  alt="Dra. Adrielle" 
                  className="w-7 h-7 rounded-full object-cover border border-gray-300 shadow-sm"
                />
              ) : (
                <div className="relative w-7 h-7 rounded-full overflow-hidden border border-gray-300 shadow-sm flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
                  <svg viewBox="0 0 40 40" className="w-5 h-5">
                    <path d="M 20 8 Q 25 8 28 12 Q 30 15 30 20 Q 30 24 28 26 Q 25 28 22 28 Q 20 30 18 28 Q 15 26 15 20 Q 15 15 18 12 Q 20 8 20 8 Z" 
                          fill="#9ca3af" opacity="0.7"/>
                    <path d="M 12 28 Q 15 26 20 26 Q 25 26 28 28 Q 30 30 30 34 L 10 34 Q 10 30 12 28 Z" 
                          fill="#9ca3af" opacity="0.7"/>
                  </svg>
                </div>
              )}
            </div>

            {/* Nome centralizado */}
            {/* Avatar e nome para desktop - canto esquerdo */}
            <div className="hidden sm:flex items-center space-x-3">
              {/* 
                SUBSTITUIÇÃO POR PNG - HEADER:
                Para usar foto PNG, substitua por:
                <img 
                  src="/sua-foto-header.png" 
                  alt="Dra. Adrielle" 
                  className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-lg"
                />
              */}
              {customImage ? (
                <img 
                  src={customImage} 
                  alt="Dra. Adrielle" 
                  className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-lg"
                />
              ) : (
                <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-lg flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
                  <svg viewBox="0 0 40 40" className="w-8 h-8">
                    <path d="M 20 8 Q 25 8 28 12 Q 30 15 30 20 Q 30 24 28 26 Q 25 28 22 28 Q 20 30 18 28 Q 15 26 15 20 Q 15 15 18 12 Q 20 8 20 8 Z" 
                          fill="#d1c4e9" opacity="0.8"/>
                    <path d="M 12 28 Q 15 26 20 26 Q 25 26 28 28 Q 30 30 30 34 L 10 34 Q 10 30 12 28 Z" 
                          fill="#d1c4e9" opacity="0.8"/>
                  </svg>
                </div>
              )}
              <div>
                <div className="font-display font-medium text-base md:text-lg text-gray-500">
                  {generalInfo.headerName || "Dra. Adrielle Benhossi"}
                </div>
                <div className="text-xs text-gray-400 font-light">
                  CRP {currentCrp}
                </div>
              </div>
            </div>

            {/* Apenas nome centralizado no mobile */}
            <div className="sm:hidden text-center">
              <div className="font-display font-medium text-base text-gray-500">
                {generalInfo.headerName || "Dra. Adrielle Benhossi"}
              </div>
              <div className="text-xs text-gray-400 font-light">
                CRP {currentCrp}
              </div>
            </div>

            {/* Menu desktop - no canto direito */}
            <div className="hidden md:flex space-x-8 text-sm font-light text-gray-600">
              <button
                onClick={() => scrollToSection("home")}
                className="hover:text-purple-soft transition-colors duration-300"
              >
                Início
              </button>
              {isAboutVisible && (
                <button
                  onClick={() => scrollToSection("about")}
                  className="hover:text-purple-soft transition-colors duration-300"
                >
                  Sobre
                </button>
              )}
              {isServicesVisible && (
                <button
                  onClick={() => scrollToSection("services")}
                  className="hover:text-purple-soft transition-colors duration-300"
                >
                  Serviços
                </button>
              )}
              {isTestimonialsVisible && (
                <button
                  onClick={() => scrollToSection("testimonials")}
                  className="hover:text-purple-soft transition-colors duration-300"
                >
                  Depoimentos
                </button>
              )}
              {isContactVisible && (
                <button
                  onClick={() => scrollToSection("contact")}
                  className="hover:text-purple-soft transition-colors duration-300"
                >
                  Contato
                </button>
              )}
            </div>

            {/* Botão menu mobile */}
            <button
              className="absolute right-4 top-1/2 transform -translate-y-1/2 md:hidden text-gray-600"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-gray-800 bg-opacity-25" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed top-0 right-0 w-full max-w-xs h-full bg-white shadow-xl z-50">
            <div className="p-6 pt-20">
              <nav className="space-y-6">
                <button
                  onClick={() => scrollToSection("home")}
                  className="block w-full text-left text-gray-600 hover:text-purple-soft transition-colors duration-300 py-2"
                >
                  Início
                </button>
                {isAboutVisible && (
                  <button
                    onClick={() => scrollToSection("about")}
                    className="block w-full text-left text-gray-600 hover:text-purple-soft transition-colors duration-300 py-2"
                  >
                    Sobre
                  </button>
                )}
                {isServicesVisible && (
                  <button
                    onClick={() => scrollToSection("services")}
                    className="block w-full text-left text-gray-600 hover:text-purple-soft transition-colors duration-300 py-2"
                  >
                    Serviços
                  </button>
                )}
                {isTestimonialsVisible && (
                  <button
                    onClick={() => scrollToSection("testimonials")}
                    className="block w-full text-left text-gray-600 hover:text-purple-soft transition-colors duration-300 py-2"
                  >
                    Depoimentos
                  </button>
                )}
                {isContactVisible && (
                  <button
                    onClick={() => scrollToSection("contact")}
                    className="block w-full text-left text-gray-600 hover:text-purple-soft transition-colors duration-300 py-2"
                  >
                    Contato
                  </button>
                )}
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
}