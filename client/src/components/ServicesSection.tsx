import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { 
  Brain, Heart, Baby, Users, User,
  Stethoscope, Activity, Zap, Shield, Target,
  UserPlus, UserCheck, UserX, UserCog,
  Sun, Moon, Star, Sparkles,
  MessageCircle, MessageSquare, Mic, Volume2,
  TrendingUp, BarChart, PieChart, Gauge,
  Leaf, Flower, TreePine, Wind,
  Handshake, HelpCircle, LifeBuoy, Umbrella,
  Home, Gamepad2, Puzzle, Palette,
  Footprints, Waves, Mountain, Compass,
  Clock, Timer, Calendar, Hourglass
} from "lucide-react";
import { processTextWithGradient, processBadgeWithGradient, BADGE_GRADIENTS } from "@/utils/textGradient";
import { useQuery } from "@tanstack/react-query";

interface Service {
  id: number;
  title: string;
  description: string;
  icon: string;
  gradient: string;
  duration?: string;
  price?: string;
  showDuration: boolean;
  showPrice: boolean;
  isActive: boolean;
}

export function ServicesSection() {
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

  // Buscar serviços usando React Query
  const { data: services = [], isLoading: isLoadingServices } = useQuery({
    queryKey: ["/api/services"],
    queryFn: async () => {
      const response = await fetch('/api/services');
      if (!response.ok) throw new Error('Failed to fetch services');
      return response.json();
    },
  });

  // Buscar configurações usando React Query
  const { data: configs = [], isLoading: isLoadingConfigs } = useQuery({
    queryKey: ["/api/config"],
    queryFn: async () => {
      const response = await fetch('/api/config');
      if (!response.ok) throw new Error('Failed to fetch config');
      return response.json();
    },
    staleTime: 0,
    cacheTime: 0,
  });

  const isLoading = isLoadingServices || isLoadingConfigs;
  const activeServices = services.filter((service: Service) => service.isActive);

  // Extrair textos da seção de services_section
  const servicesSection = configs.find((config: any) => config.key === 'services_section');

  const sectionTexts = {
    badge: servicesSection?.value?.badge || "SERVIÇOS",
    title: servicesSection?.value?.title || "Como posso ajudar você?",
    subtitle: servicesSection?.value?.subtitle || "",
    description: servicesSection?.value?.description || "Oferecendo cuidado personalizado e especializado para cada momento da sua jornada de crescimento pessoal"
  };

  // Lógica para determinar o grid layout baseado no número de serviços
  const getGridClass = (serviceCount: number) => {
    if (serviceCount === 1) {
      return "lg:grid-cols-1 lg:max-w-md lg:mx-auto"; // 1 serviço centralizado
    } else if (serviceCount === 2) {
      return "lg:grid-cols-2 lg:max-w-2xl lg:mx-auto"; // 2 serviços centralizados
    } else if (serviceCount === 4) {
      return "lg:grid-cols-2 lg:max-w-4xl lg:mx-auto"; // 2x2 para 4 serviços
    } else if (serviceCount === 3 || serviceCount === 6) {
      return "lg:grid-cols-3 lg:max-w-6xl lg:mx-auto"; // 3x3 para 3 ou 6 serviços
    } else {
      return "lg:grid-cols-3 lg:max-w-6xl lg:mx-auto"; // padrão 3 colunas
    }
  };

  // Obtém o gradiente dos badges
  const badgeGradient = configs?.find(c => c.key === 'badge_gradient')?.value?.gradient;

  return (
    <section id="services" data-section="services" className="py-12 sm:py-16 relative" ref={ref}>
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="relative inline-block mb-6">
            <span className={`inline-flex items-center px-3 py-1 text-xs font-medium tracking-wider uppercase bg-gradient-to-r ${badgeGradient ? BADGE_GRADIENTS[badgeGradient as keyof typeof BADGE_GRADIENTS] : 'from-pink-500 to-purple-500'} text-transparent bg-clip-text relative`}>
              <span className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-30"></span>
              {sectionTexts.badge}
            </span>
          </div>
          <h2 className="font-display font-semibold text-3xl sm:text-4xl lg:text-5xl text-gray-900 mb-2 tracking-tight">
            {processTextWithGradient(sectionTexts.title)}
          </h2>
          {sectionTexts.subtitle && (
            <h3 className="text-xl sm:text-2xl text-gray-700 mb-2 font-medium">
              {sectionTexts.subtitle}
            </h3>
          )}
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed font-light px-6 sm:px-8">
            {sectionTexts.description}
          </p>
        </motion.div>

        {isLoading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500 mx-auto"></div>
            <p className="mt-6 text-gray-600 text-lg">Carregando serviços...</p>
          </div>
        ) : activeServices.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">Nenhum serviço disponível no momento.</p>
          </div>
        ) : (
          <div className={`grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 ${getGridClass(activeServices.length)} gap-6 lg:gap-8 mx-auto justify-items-center`}>
            {activeServices.map((service, index) => {
              // Mapeamento completo de ícones
              const iconMap: Record<string, any> = {
                // Ícones Principais
                Brain, Heart, Baby, Users, User,
                // Ícones de Saúde Mental
                Stethoscope, Activity, Zap, Shield, Target,
                // Ícones de Relacionamento
                UserPlus, UserCheck, UserX, UserCog,
                // Ícones de Bem-estar
                Sun, Moon, Star, Sparkles,
                // Ícones de Comunicação
                MessageCircle, MessageSquare, Mic, Volume2,
                // Ícones de Crescimento
                TrendingUp, BarChart, PieChart, Gauge,
                // Ícones de Mindfulness
                Leaf, Flower, TreePine, Wind,
                // Ícones de Apoio
                Handshake, HelpCircle, LifeBuoy, Umbrella,
                // Ícones de Família
                Home, Gamepad2, Puzzle, Palette,
                // Ícones de Movimento
                Footprints, Waves, Mountain, Compass,
                // Ícones de Tempo
                Clock, Timer, Calendar, Hourglass
              };

              const IconComponent = iconMap[service.icon] || Brain;

              return (
                <motion.div
                  key={service.id}
                  className="group bg-white border border-gray-100 p-8 rounded-2xl text-center hover:border-purple-200 hover:shadow-lg transition-all duration-300 ease-out"
                  initial={{ opacity: 0, y: 15 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  {/* Ícone minimalista */}
                  <div className="mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-br ${service.gradient} rounded-full flex items-center justify-center mx-auto group-hover:scale-105 transition-transform duration-300`}>
                      <IconComponent className="text-white" size={24} />
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div>
                    <h3 className="font-display font-semibold text-xl text-gray-800 mb-4">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-6 text-base">
                      {service.description}
                    </p>

                    {/* Informações de preço e duração */}
                    {(service.showDuration || service.showPrice) && (
                      <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-50">
                        {service.showDuration && service.duration && (
                          <div className="flex items-center gap-1.5 text-gray-600 text-sm">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{service.duration}</span>
                          </div>
                        )}
                        {service.showPrice && service.price && (
                          <div className="text-gray-800 font-semibold">
                            {service.price}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}