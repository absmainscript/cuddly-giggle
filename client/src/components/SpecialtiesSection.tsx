import { motion } from "framer-motion";
import { 
  Brain, 
  Heart, 
  BookOpen, 
  Users, 
  Award, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Star,
  CheckCircle,
  Camera,
  Stethoscope, Activity, Zap, Shield, Target,
  UserPlus, UserCheck, UserX, UserCog, Sun, Moon, Sparkles,
  MessageCircle, MessageSquare, Mic, Volume2, TrendingUp, BarChart, PieChart, Gauge,
  Leaf, Flower, TreePine, Wind, Handshake, HelpCircle, LifeBuoy, Umbrella,
  Home, Gamepad2, Puzzle, Palette, Footprints, Waves, Mountain, Compass,
  Timer, Calendar, Hourglass
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Specialty } from "@shared/schema";
import { processTextWithGradient, processBadgeWithGradient, BADGE_GRADIENTS } from "@/utils/textGradient";

export default function SpecialtiesSection() {
  console.log('SpecialtiesSection: Componente está sendo renderizado');

  // Todos os hooks devem ser chamados no topo, antes de qualquer retorno condicional
  const { data: specialties = [], isLoading, error } = useQuery({
    queryKey: ["/api/specialties"],
    queryFn: async () => {
      const response = await fetch("/api/specialties");
      if (!response.ok) {
        console.error('Erro na resposta da API:', response.status, response.statusText);
        throw new Error(`Falha ao carregar especialidades: ${response.status}`);
      }
      const data = await response.json();
      console.log('Dados recebidos da API:', data);
      return data;
    },
    retry: 3,
    retryDelay: 1000,
  });

  const { data: configs } = useQuery({
    queryKey: ["/api/admin/config"],
    queryFn: async () => {
      const response = await fetch("/api/admin/config");
      return response.json();
    },
  });

  const [isVisible, setIsVisible] = useState(true); // Forçar como true para debug
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('SpecialtiesSection: Intersection Observer configurado');
    const observer = new IntersectionObserver(
      ([entry]) => {
        console.log('SpecialtiesSection: Intersection observed', entry.isIntersecting);
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -100px 0px" }
    );

    if (ref.current) {
      observer.observe(ref.current);
      console.log('SpecialtiesSection: Observer attached to ref');
    } else {
      console.log('SpecialtiesSection: Ref não está disponível');
    }

    return () => observer.disconnect();
  }, []);

  // Loading state - agora após todos os hooks
  if (isLoading) {
    return (
      <section className="py-32 bg-slate-50/30">
        <div className="container mx-auto px-6 text-center">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-slate-200 rounded-xl w-80 mx-auto"></div>
            <div className="h-6 bg-slate-200 rounded-lg w-96 mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  // Error state - agora após todos os hooks
  if (error) {
    return (
      <section className="py-32 bg-slate-50/30">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-light text-slate-800 mb-4">Especialidades</h2>
          <p className="text-slate-500">Erro ao carregar especialidades</p>
        </div>
      </section>
    );
  }

  // Mapeamento completo de ícones
  const iconMap: Record<string, any> = {
    Brain, Heart, BookOpen, Users, Award, Clock, MapPin, Phone, Mail, Star,
    CheckCircle, Camera, Stethoscope, Activity, Zap, Shield, Target,
    UserPlus, UserCheck, UserX, UserCog, Sun, Moon, Sparkles,
    MessageCircle, MessageSquare, Mic, Volume2, TrendingUp, BarChart, PieChart, Gauge,
    Leaf, Flower, TreePine, Wind, Handshake, HelpCircle, LifeBuoy, Umbrella,
    Home, Gamepad2, Puzzle, Palette, Footprints, Waves, Mountain, Compass,
    Timer, Calendar, Hourglass
  };

  // Função para converter cor hex em RGB com alpha
  const hexToRgba = (hex: string, alpha: number = 0.1) => {
    const hexValue = hex.replace('#', '');
    const r = parseInt(hexValue.substr(0, 2), 16);
    const g = parseInt(hexValue.substr(2, 2), 16);
    const b = parseInt(hexValue.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const activeSpecialties = specialties
    .filter((specialty: Specialty) => specialty.isActive)
    .sort((a: Specialty, b: Specialty) => a.order - b.order);

  // Debug logs mais detalhados
  console.log('=== SPECIALTIES SECTION DEBUG ===');
  console.log('Specialties raw data:', specialties);
  console.log('Specialties length:', specialties?.length);
  console.log('Active specialties:', activeSpecialties);
  console.log('Active specialties length:', activeSpecialties?.length);
  console.log('Is loading:', isLoading);
  console.log('Error:', error);
  console.log('Configs:', configs);
  console.log('==================================');

  // Se não há especialidades ativas, mostra uma mensagem ou seção vazia
  if (activeSpecialties.length === 0) {
    console.log('SpecialtiesSection: Renderizando estado vazio');
    return (
      <section 
        className="py-32 bg-slate-50/30" 
        data-section="specialties-empty"
        style={{ minHeight: '400px' }}
      >
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-light text-slate-800 mb-4">Especialidades (DEBUG)</h2>
          <p className="text-slate-600">Nenhuma especialidade ativa encontrada.</p>
          <p className="text-xs text-slate-400 mt-2">
            Total de especialidades: {specialties?.length || 0} | 
            Ativas: {activeSpecialties?.length || 0} | 
            Loading: {isLoading ? 'Sim' : 'Não'}
          </p>
        </div>
      </section>
    );
  }

  const specialtiesSection = configs?.find((c: any) => c.key === 'specialties_section')?.value || {};
  const badgeSettings = configs?.find((c: any) => c.key === 'badge_gradient')?.value || {};

  // Pega a chave do gradiente configurado no painel (tanto do 'gradient' global quanto do 'specialties' específico)
  const specialtiesGradientKey = badgeSettings.specialties || badgeSettings.gradient || 'pink-purple';

  const sectionTexts = {
    title: specialtiesSection.title || "Minhas (Especialidades)",
    subtitle: specialtiesSection.subtitle || "Áreas de atuação onde posso te ajudar a encontrar bem-estar e equilíbrio emocional",
    badge: specialtiesSection.badge || "ESPECIALIDADES"
  };

  // Para o badge, usa o CSS do gradiente configurado
  const badgeGradientCSS = BADGE_GRADIENTS[specialtiesGradientKey as keyof typeof BADGE_GRADIENTS] || "from-purple-500 to-pink-500";

  console.log('Badge settings encontradas:', badgeSettings);
  console.log('Gradiente key selecionada:', specialtiesGradientKey);
  console.log('CSS do gradiente aplicado:', badgeGradientCSS);

  console.log('SpecialtiesSection: Renderizando seção principal com', activeSpecialties.length, 'especialidades');

  return (
    <section 
      ref={ref}
      className="py-32 bg-slate-50/30 relative"
      data-section="specialties"
      style={{ minHeight: '400px' }}
    >
      {/* Background minimalista */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-gradient-to-br from-blue-100/40 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-gradient-to-br from-purple-100/40 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header minimalista */}
        <motion.div
          className="text-center mb-20 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Badge redesenhado */}
          <motion.div
            className="inline-flex items-center justify-center mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isVisible ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className={`text-xs font-medium uppercase tracking-wide ${badgeGradientCSS ? `text-transparent bg-clip-text bg-gradient-to-r ${badgeGradientCSS}` : 'text-purple-600'}`}>
              {sectionTexts.badge}
            </span>
          </motion.div>

          {/* Título redesenhado */}
          <motion.h2 
            className="font-light text-4xl md:text-5xl lg:text-6xl text-slate-800 mb-2 tracking-tight leading-tight"
            initial={{ opacity: 0, y: 15 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {(() => {
              console.log('Processando título com gradiente:', sectionTexts.title, 'usando chave:', specialtiesGradientKey);
              return processTextWithGradient(sectionTexts.title, specialtiesGradientKey);
            })()}
          </motion.h2>

          {/* Subtítulo redesenhado */}
          <motion.p 
            className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-light px-6 sm:px-8"
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {sectionTexts.subtitle}
          </motion.p>
        </motion.div>

        {/* Grid de especialidades redesenhado */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {activeSpecialties.map((specialty: Specialty, index: number) => {
              const IconComponent = iconMap[specialty.icon] || Brain;

              return (
                <motion.div
                  key={specialty.id}
                  className="group"
                  initial={{ opacity: 0, y: 30 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{ 
                    duration: 0.6, 
                    delay: 0.4 + index * 0.1,
                    ease: "easeOut"
                  }}
                >
                  {/* Card redesenhado */}
                  <div className="relative h-full p-8 bg-white/60 backdrop-blur-sm rounded-3xl border border-white/20 shadow-sm hover:shadow-lg transition-all duration-500 group-hover:-translate-y-2">
                    {/* Glow effect sutil */}
                    <div 
                      className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                      style={{ 
                        background: `linear-gradient(135deg, ${specialty.iconColor}40, transparent)` 
                      }}
                    />

                    {/* Container do ícone */}
                    <div className="relative mb-8">
                      <motion.div
                        className="relative w-16 h-16 mx-auto"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div 
                          className="w-full h-full rounded-2xl flex items-center justify-center relative overflow-hidden"
                          style={{ 
                            background: `linear-gradient(135deg, ${hexToRgba(specialty.iconColor, 0.15)}, ${hexToRgba(specialty.iconColor, 0.05)})`,
                            border: `1px solid ${hexToRgba(specialty.iconColor, 0.2)}`
                          }}
                        >
                          <IconComponent 
                            className="w-8 h-8 transition-transform duration-300 group-hover:scale-110" 
                            style={{ color: specialty.iconColor }}
                          />
                        </div>
                      </motion.div>
                    </div>

                    {/* Conteúdo */}
                    <div className="text-center space-y-3">
                      <h3 className="text-lg font-medium text-slate-800 group-hover:text-slate-900 transition-colors duration-300">
                        {specialty.title}
                      </h3>

                      <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors duration-300 text-xs font-light">
                        {specialty.description}
                      </p>
                    </div>

                    {/* Elemento decorativo minimalista */}
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-8 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent group-hover:via-slate-300 transition-colors duration-300" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}