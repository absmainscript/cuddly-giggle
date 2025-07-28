/**
 * AboutSection.tsx
 * 
 * Seção "Sobre a Psicóloga" do site
 * Apresenta informações profissionais, qualificações e abordagem terapêutica
 * Contém cards com especialidades e animações de entrada suave
 * Utiliza Intersection Observer para ativar animações ao rolar a página
 */

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
import { processTextWithGradient, processBadgeWithGradient } from "@/utils/textGradient";
import Avatar from "./Avatar";
import type { Specialty } from "@shared/schema";

export function AboutSection() {
  const { data: configs } = useQuery({
    queryKey: ["/api/admin/config"],
    queryFn: async () => {
      const response = await fetch("/api/admin/config");
      return response.json();
    },
  });

  

  const heroImage = configs?.find((c: any) => c.key === "hero_image");
  const customImage = heroImage?.value?.path || null;

  const generalInfo = configs?.find((c: any) => c.key === "general_info")?.value as any || {};
  // Obtém dados das configurações
  const aboutSection = configs?.find((c: any) => c.key === 'about_section')?.value as any || {};
  const badgeGradient = configs?.find(c => c.key === 'badge_gradient')?.value?.gradient;
  const currentCrp = generalInfo.crp || "08/123456";
  const aboutText = aboutSection.description || "";

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

  return (
    <section 
      id="about" 
      data-section="about" 
      className="main-section relative overflow-hidden" 
      style={{ margin: 0, padding: 0 }}
      ref={ref}
    >
      <div className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="w-full max-w-3xl">
            {/* Card Sobre Mim */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="card-aesthetic px-6 pt-4 pb-6 sm:px-8 sm:pt-5 sm:pb-8 lg:px-10 lg:pt-6 lg:pb-10 h-fit"
            >
              <div className="text-left">
                {/* Subtítulo com espaçamento padronizado */}
                <div className="relative inline-block mb-3">
                  <span className={`inline-flex items-center px-3 py-1 text-xs font-medium tracking-wider uppercase bg-gradient-to-r ${badgeGradient ? badgeGradient : 'from-pink-500 to-purple-500'} text-transparent bg-clip-text relative`}>
                    <span className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-30"></span>
                    {aboutSection.subtitle || "SOBRE MIM"}
                  </span>
                </div>
                
                <h3 className="font-display font-semibold text-3xl sm:text-4xl lg:text-5xl text-gray-900 mb-2 tracking-tight leading-tight">
                  {processTextWithGradient(aboutSection.title || "Dra. (Adrielle Benhossi)", badgeGradient)}
                </h3>
                <p className="text-pink-500 text-sm mb-6 font-medium">
                    {(() => {
                      const professionalTitleInfo = configs?.find((c: any) => c.key === "professional_title")?.value as any || {};
                      return professionalTitleInfo.title || "Psicóloga Clínica";
                    })()} • CRP: {currentCrp}</p>

                <div className="text-gray-600 leading-relaxed mb-6 text-lg font-light">
                  {(aboutText || "Este é o espaço para escrever sobre você no painel administrativo.")
                    .split('\n')
                    .map((paragraph, index) => (
                      <p key={index} className={index > 0 ? "mt-4" : ""}>
                        {paragraph}
                      </p>
                    ))
                  }
                </div>

                {/* Credenciais */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                  {(() => {
                    const aboutCredentials = configs?.find((c: any) => c.key === "about_credentials")?.value as any[] || [];
                    const activeCredentials = aboutCredentials
                      .filter(cred => cred.isActive !== false)
                      .sort((a, b) => (a.order || 0) - (b.order || 0));

                    if (activeCredentials.length === 0) {
                      // Fallback para dados padrão se não houver credenciais configuradas
                      return (
                        <>
                          <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-4 rounded-2xl border border-pink-100/50">
                            <div className="text-sm font-semibold text-gray-700">Centro Universitário Integrado</div>
                            <div className="text-xs text-gray-500 mt-1">Formação Acadêmica</div>
                          </div>
                          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-2xl border border-purple-100/50">
                            <div className="text-sm font-semibold text-gray-700">Terapia Cognitivo-Comportamental</div>
                            <div className="text-xs text-gray-500 mt-1">Abordagem Terapêutica</div>
                          </div>
                          <div className="bg-gradient-to-br from-green-50 to-teal-50 p-4 rounded-2xl border border-green-100/50 sm:col-span-2 lg:col-span-1 xl:col-span-2">
                            <div className="text-sm font-semibold text-gray-700">Mais de 5 anos de experiência</div>
                            <div className="text-xs text-gray-500 mt-1">Experiência Profissional</div>
                          </div>
                        </>
                      );
                    }

                    return activeCredentials.map((credential: any, index: number) => (
                      <div 
                        key={credential.id} 
                        className={`bg-gradient-to-br ${credential.gradient} p-4 rounded-2xl border border-white/20 ${
                          activeCredentials.length === 3 && index === 2 ? 'sm:col-span-2 lg:col-span-1 xl:col-span-2' : ''
                        }`}
                      >
                        <div className="text-sm font-semibold text-gray-700">{credential.title}</div>
                        <div className="text-xs text-gray-500 mt-1">{credential.subtitle}</div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </motion.div>

            
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;