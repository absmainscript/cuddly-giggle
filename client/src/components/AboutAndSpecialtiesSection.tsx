import { motion } from "framer-motion";
import { 
  Brain, Heart, BookOpen, Users, Award, Clock, MapPin, Phone, Mail, Star,
  CheckCircle, Camera, Stethoscope, Activity, Zap, Shield, Target,
  UserPlus, UserCheck, UserX, UserCog, Sun, Moon, Sparkles,
  MessageCircle, MessageSquare, Mic, Volume2, TrendingUp, BarChart, PieChart, Gauge,
  Leaf, Flower, TreePine, Wind, Handshake, HelpCircle, LifeBuoy, Umbrella,
  Home, Gamepad2, Puzzle, Palette, Footprints, Waves, Mountain, Compass,
  Timer, Calendar, Hourglass
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Specialty } from "@shared/schema";
import { processTextWithGradient, BADGE_GRADIENTS } from "@/utils/textGradient";

export default function AboutAndSpecialtiesSection() {
  const { data: configs } = useQuery({
    queryKey: ["/api/admin/config"],
    queryFn: async () => {
      const response = await fetch("/api/admin/config");
      return response.json();
    },
  });

  const { data: specialties = [], isLoading: isSpecialtiesLoading } = useQuery({
    queryKey: ["/api/specialties"],
    queryFn: async () => {
      const response = await fetch("/api/specialties");
      if (!response.ok) throw new Error(`Falha ao carregar especialidades: ${response.status}`);
      return response.json();
    },
    retry: 3,
  });

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

  // Configurações das seções
  const generalInfo = configs?.find((c: any) => c.key === "general_info")?.value as any || {};
  const aboutSection = configs?.find((c: any) => c.key === 'about_section')?.value as any || {};
  const specialtiesSection = configs?.find((c: any) => c.key === 'specialties_section')?.value || {};
  const badgeSettings = configs?.find((c: any) => c.key === 'badge_gradient')?.value || {};
  const heroImage = configs?.find((c: any) => c.key === "hero_image");

  // Visibilidade das seções
  const sectionVisibility = configs?.find((c: any) => c.key === 'section_visibility')?.value || {};
  const isAboutVisible = sectionVisibility.about !== false;
  const isSpecialtiesVisible = sectionVisibility.specialties !== false;

  // Se ambas estão desabilitadas, não renderiza nada
  if (!isAboutVisible && !isSpecialtiesVisible) {
    return null;
  }

  // Dados da seção About
  const currentCrp = generalInfo.crp || "08/123456";
  const aboutText = aboutSection.description || "";
  const badgeGradient = badgeSettings?.gradient;

  // Dados da seção Specialties
  const activeSpecialties = specialties
    .filter((specialty: Specialty) => specialty.isActive)
    .sort((a: Specialty, b: Specialty) => a.order - b.order);

  const specialtiesGradientKey = badgeSettings.specialties || badgeSettings.gradient || 'pink-purple';
  const badgeGradientCSS = BADGE_GRADIENTS[specialtiesGradientKey as keyof typeof BADGE_GRADIENTS] || "from-purple-500 to-pink-500";

  // Mapeamento de ícones
  const iconMap: Record<string, any> = {
    Brain, Heart, BookOpen, Users, Award, Clock, MapPin, Phone, Mail, Star,
    CheckCircle, Camera, Stethoscope, Activity, Zap, Shield, Target,
    UserPlus, UserCheck, UserX, UserCog, Sun, Moon, Sparkles,
    MessageCircle, MessageSquare, Mic, Volume2, TrendingUp, BarChart, PieChart, Gauge,
    Leaf, Flower, TreePine, Wind, Handshake, HelpCircle, LifeBuoy, Umbrella,
    Home, Gamepad2, Puzzle, Palette, Footprints, Waves, Mountain, Compass,
    Timer, Calendar, Hourglass
  };

  const hexToRgba = (hex: string, alpha: number = 0.1) => {
    const hexValue = hex.replace('#', '');
    const r = parseInt(hexValue.substr(0, 2), 16);
    const g = parseInt(hexValue.substr(2, 2), 16);
    const b = parseInt(hexValue.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Textos das seções
  const aboutTexts = {
    title: aboutSection.title || generalInfo.aboutSectionName || "Dra. (Adrielle Benhossi)",
    subtitle: aboutSection.subtitle || "SOBRE MIM",
  };

  const specialtiesTexts = {
    title: specialtiesSection.title || "Minhas (Especialidades)",
    subtitle: specialtiesSection.subtitle || "Áreas de atuação onde posso te ajudar a encontrar bem-estar e equilíbrio emocional",
    badge: specialtiesSection.badge || "ESPECIALIDADES"
  };

  return (
    <section 
      id="about" data-section="about" className="py-8 sm:py-12 relative" ref={ref}
    >
      {/* Background decorativo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-gradient-to-br from-blue-100/30 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-gradient-to-br from-purple-100/30 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Layout responsivo: grid único que se adapta */}
        <div className={`grid gap-8 lg:gap-12 ${
          isAboutVisible && isSpecialtiesVisible 
            ? 'grid-cols-1 lg:grid-cols-2' 
            : 'grid-cols-1 justify-items-center'
        }`}>

          {/* Card Sobre Mim */}
          {isAboutVisible && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className={`${!isSpecialtiesVisible ? 'max-w-3xl' : ''} w-full`}
            >
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-white/20 shadow-sm hover:shadow-lg transition-all duration-500 p-8 lg:p-10 h-full flex flex-col">

                {/* Header do About */}
                <div className="mb-8 text-center">
                  <motion.div
                    className="inline-flex items-center justify-center mb-6"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={isVisible ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <div className="relative inline-block mb-6">
                      <span className={`inline-flex items-center px-3 py-1 text-xs font-medium tracking-wider uppercase bg-gradient-to-r ${badgeGradient ? BADGE_GRADIENTS[badgeGradient as keyof typeof BADGE_GRADIENTS] : 'from-pink-500 to-purple-500'} text-transparent bg-clip-text relative`}>
                        <span className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-30"></span>
                        {aboutTexts.subtitle}
                      </span>
                    </div>
                  </motion.div>

                  <h3 className="font-light text-3xl lg:text-4xl text-gray-900 mb-4 tracking-tight leading-tight">
                    {processTextWithGradient(aboutTexts.title, badgeGradient)}
                  </h3>

                  <p className="text-pink-500 text-sm mb-6 font-medium">
                    {(() => {
                      const professionalTitleInfo = configs?.find((c: any) => c.key === "professional_title")?.value as any || {};
                      return professionalTitleInfo.title || "Psicóloga Clínica";
                    })()} • CRP: {currentCrp}
                  </p>
                </div>

                {/* Conteúdo About - Flex grow para ocupar espaço disponível */}
                <div className="flex-1 flex flex-col">
                  <div className="text-gray-600 leading-relaxed text-base font-light mb-8">
                    {(aboutText || "Este é o espaço para escrever sobre você no painel administrativo.")
                      .split('\n')
                      .map((paragraph, index) => (
                        <p key={index} className={index > 0 ? "mt-4" : ""}>
                          {paragraph}
                        </p>
                      ))
                    }
                  </div>

                  {/* Credenciais fixas na parte inferior */}
                  <div className="mt-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(() => {
                        const aboutCredentials = configs?.find((c: any) => c.key === "about_credentials")?.value as any[] || [];
                        const activeCredentials = aboutCredentials
                          .filter(cred => cred.isActive !== false)
                          .sort((a, b) => (a.order || 0) - (b.order || 0));

                        if (activeCredentials.length === 0) {
                          return (
                            <>
                              <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-3 rounded-xl border border-pink-100/50">
                                <div className="text-xs font-semibold text-gray-700">Centro Universitário Integrado</div>
                                <div className="text-xs text-gray-500 mt-1">Formação Acadêmica</div>
                              </div>
                              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-3 rounded-xl border border-purple-100/50">
                                <div className="text-xs font-semibold text-gray-700">Terapia Cognitivo-Comportamental</div>
                                <div className="text-xs text-gray-500 mt-1">Abordagem Terapêutica</div>
                              </div>
                            </>
                          );
                        }

                        return activeCredentials.map((credential: any) => (
                          <div 
                            key={credential.id} 
                            className={`bg-gradient-to-br ${credential.gradient} p-3 rounded-xl border border-white/20`}
                          >
                            <div className="text-xs font-semibold text-gray-700">{credential.title}</div>
                            <div className="text-xs text-gray-500 mt-1">{credential.subtitle}</div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Card Especialidades */}
          {isSpecialtiesVisible && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: "easeOut", delay: isAboutVisible ? 0.2 : 0 }}
              className={`${!isAboutVisible ? 'max-w-4xl' : ''} w-full`}
            >
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-white/20 shadow-sm hover:shadow-lg transition-all duration-500 p-8 lg:p-10 h-full flex flex-col">

                {/* Header das Especialidades */}
                <div className="text-center mb-6">
                  <motion.div
                    className="inline-flex items-center justify-center mb-4"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={isVisible ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <span className={`text-xs font-medium uppercase tracking-wide ${badgeGradientCSS ? `text-transparent bg-clip-text bg-gradient-to-r ${badgeGradientCSS}` : 'text-purple-600'}`}>
                      {specialtiesTexts.badge}
                    </span>
                  </motion.div>

                  <h3 className="font-light text-2xl lg:text-3xl text-gray-900 mb-3 tracking-tight leading-tight">
                    {processTextWithGradient(specialtiesTexts.title, specialtiesGradientKey)}
                  </h3>

                  <p className="text-gray-600 text-xs leading-relaxed font-light">
                    {specialtiesTexts.subtitle}
                  </p>
                </div>

                {/* Conteúdo de especialidades que cresce conforme necessário */}
                <div className="flex-1">

                {/* Lista de Especialidades - Design minimalista */}
                {isSpecialtiesLoading ? (
                  <div className="space-y-3">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="animate-pulse bg-gray-200 h-16 rounded-xl"></div>
                    ))}
                  </div>
                ) : (
                  <div className={`space-y-3 pr-2 ${activeSpecialties.length >= 5 ? 'max-h-96 overflow-y-auto' : ''}`}>
                    {activeSpecialties.map((specialty: Specialty, index: number) => {
                      const IconComponent = iconMap[specialty.icon] || Brain;

                      return (
                        <motion.div
                          key={specialty.id}
                          className="group"
                          initial={{ opacity: 0, y: 10 }}
                          animate={isVisible ? { opacity: 1, y: 0 } : {}}
                          transition={{ 
                            duration: 0.3, 
                            delay: 0.4 + index * 0.05,
                            ease: "easeOut"
                          }}
                        >
                          <div className="relative p-3 bg-gradient-to-br from-white/90 to-white/60 backdrop-blur-sm rounded-xl border border-white/40 hover:shadow-sm transition-all duration-300 group-hover:-translate-y-0.5">

                            <div className="flex items-start space-x-3">
                              {/* Ícone compacto */}
                              <div 
                                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ 
                                  background: `linear-gradient(135deg, ${hexToRgba(specialty.iconColor, 0.15)}, ${hexToRgba(specialty.iconColor, 0.05)})`,
                                  border: `1px solid ${hexToRgba(specialty.iconColor, 0.2)}`
                                }}
                              >
                                <IconComponent 
                                  className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" 
                                  style={{ color: specialty.iconColor }}
                                />
                              </div>

                              {/* Conteúdo com texto completo */}
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-gray-800 mb-1 group-hover:text-gray-900 transition-colors">
                                  {specialty.title}
                                </h4>
                                <p className="text-xs text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                                  {specialty.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                {/* Indicador de mais especialidades se houver */}
                {activeSpecialties.length > 6 && (
                  <div className="text-center mt-6">
                    <p className="text-xs text-gray-500">
                      +{activeSpecialties.length - 6} especialidades adicionais
                    </p>
                  </div>
                )}

                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}