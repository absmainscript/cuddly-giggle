/**
 * Footer.tsx
 * 
 * Rodapé do site com informações finais
 * Contém links de redes sociais, informações profissionais e créditos
 * Layout em grid responsivo com gradiente de fundo elegante
 * Avatar da psicóloga com estrela de destaque profissional
 */

import { FaWhatsapp, FaInstagram, FaLinkedin, FaFacebook, FaTwitter } from "react-icons/fa"; // Redes sociais
import { Star } from "lucide-react"; // Ícones decorativos
import { Avatar } from "./Avatar"; // Avatar da psicóloga
import { useQuery } from "@tanstack/react-query"; // Para buscar configurações do site

export function Footer() {
  // Buscar configurações do site incluindo a imagem do hero
  const { data: configs } = useQuery({
    queryKey: ["/api/admin/config"],
    queryFn: async () => {
      const response = await fetch("/api/admin/config");
      return response.json();
    },
  });

  // Buscar configurações do footer
  const { data: footerSettings } = useQuery({
    queryKey: ["/api/footer-settings"],
    queryFn: async () => {
      const response = await fetch("/api/footer-settings");
      return response.json();
    },
  });

  // Extrair a imagem personalizada do hero se disponível
  const heroImage = configs?.find((c: any) => c.key === 'hero_image');
  const customImage = heroImage?.value?.path || null;

  // Extrair informações gerais das configurações
  const generalInfo = configs?.find((c: any) => c.key === 'general_info')?.value as any || {};
  const currentName = generalInfo.headerName || generalInfo.name || "Dra. Adrielle Benhossi";
  const currentCrp = generalInfo.crp || "08/123456";

  // Configurações do footer com fallbacks
  const footerData = footerSettings || {};
  const generalFooterInfo = footerData.general_info || {};
  const contactButtons = footerData.contact_buttons || [];
  const certificationItems = footerData.certification_items || [];
  const trustSeals = footerData.trust_seals || [];
  const bottomInfo = footerData.bottom_info || {};

  // Mapeamento de ícones
  const iconMap: Record<string, any> = {
    FaWhatsapp,
    FaInstagram, 
    FaLinkedin,
    FaFacebook,
    FaTwitter
  };

  const getIconComponent = (iconName: string) => {
    return iconMap[iconName] || FaWhatsapp;
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 text-white z-10 w-full">
      {/* Subtle decorative elements */}
      <div className="absolute top-0 left-1/4 w-32 h-32 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-24 h-24 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-2xl"></div>

      <div className="relative py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-full mx-auto">
          {/* Main footer content - lateralizado */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
            {/* Brand section - esquerda */}
            <div className="lg:col-span-1">
              <div className="flex items-start space-x-3 mb-6">
                {customImage ? (
                  <div className="relative">
                    <img 
                      src={customImage} 
                      alt={currentName} 
                      className="w-12 h-12 rounded-full object-cover border-2 border-white/20 shadow-lg"
                    />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-300 to-orange-300 rounded-full flex items-center justify-center">
                      <Star className="w-1.5 h-1.5 text-white" fill="currentColor" />
                    </div>
                  </div>
                ) : (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 shadow-lg flex items-center justify-center bg-gradient-to-br from-purple-100/30 to-pink-100/30">
                    {/* Silhueta aesthetic de perfil para footer */}
                    <svg viewBox="0 0 48 48" className="w-10 h-10">
                      <path d="M 24 10 Q 30 10 34 15 Q 36 18 36 24 Q 36 28 34 31 Q 30 34 26 34 Q 24 36 22 34 Q 18 31 18 24 Q 18 18 22 15 Q 24 10 24 10 Z" 
                            fill="white" opacity="0.7"/>
                      <path d="M 14 34 Q 18 32 24 32 Q 30 32 34 34 Q 36 36 36 42 L 12 42 Q 12 36 14 34 Z" 
                            fill="white" opacity="0.7"/>
                    </svg>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-300 to-orange-300 rounded-full flex items-center justify-center">
                      <Star className="w-1.5 h-1.5 text-white" fill="currentColor" />
                    </div>
                  </div>
                )}
                <div>
                  <span className="font-display font-semibold text-xl text-white mb-1 block">
                    {currentName}
                  </span>
                  <p className="text-xs text-gray-400">CRP: {currentCrp}</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed max-w-xs">
                {generalFooterInfo.description || "Cuidando da sua saúde mental com carinho e dedicação"}
              </p>
            </div>



            {/* Social media & Contact dinâmico */}
            <div>
              <h5 className="font-semibold text-white text-sm mb-4">Contato</h5>
              <div className="space-y-3 mb-4">
                {contactButtons
                  .filter((button: any) => button.isActive)
                  .sort((a: any, b: any) => a.order - b.order)
                  .map((button: any) => {
                    const IconComponent = getIconComponent(button.icon);
                    return (
                      <a
                        key={button.id}
                        href={button.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors duration-300"
                      >
                        <div className={`w-8 h-8 bg-gradient-to-r ${button.gradient} rounded-lg flex items-center justify-center`}>
                          <IconComponent className="text-white text-sm" />
                        </div>
                        <span className="text-sm">{button.label}</span>
                      </a>
                    );
                  })}
              </div>
            </div>

            {/* Trust seals dinâmicos */}
            <div>
              <div className="flex space-x-3 mb-4">
                {trustSeals
                  .filter((seal: any) => seal.isActive)
                  .sort((a: any, b: any) => a.order - b.order)
                  .map((seal: any) => (
                    <div 
                      key={seal.id}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        seal.label === "🔒" ? "bg-green-500" : `bg-gradient-to-r ${seal.gradient}`
                      }`}
                    >
                      <span className="text-white text-xs font-bold">{seal.label}</span>
                    </div>
                  ))}
              </div>
              {/* Texto pequeno de certificações editável */}
              {bottomInfo.certificationText && (
                <p 
                  className="text-xs text-gray-400 mt-3"
                  dangerouslySetInnerHTML={{ __html: bottomInfo.certificationText }}
                />
              )}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-gray-700 pt-6 pb-6">
            <div className="flex flex-col md:flex-row justify-between items-start space-y-4 md:space-y-0">
              <div className="text-left">
                <p className="text-sm text-gray-300 mb-1">
                  {bottomInfo.copyright || `© 2024 ${currentName} • Todos os direitos reservados`}
                </p>
                {generalFooterInfo.showCnpj && generalFooterInfo.cnpj && (
                  <p className="text-xs text-gray-400 mb-2">
                    CNPJ: {generalFooterInfo.cnpj}
                  </p>
                )}
                <p className="text-xs text-gray-400">
                  Made with <span className="text-yellow-400">♥</span> and ☕ by ∞
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Footer;