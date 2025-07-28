import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, MessageSquare, HelpCircle, Briefcase, Users, Eye, EyeOff, Edit, Trash2, Plus, LogOut, Home, Palette, Star, GripVertical, Upload, Camera, Image, TrendingUp, Globe, Search, Ban, Target, Brain, Heart, BookOpen, Award, Shield, Sun, Moon, Sparkles, Handshake, MessageCircle, Leaf, Flower, Compass, ChevronUp, ChevronDown, TreePine, Wind, Umbrella, LifeBuoy, Puzzle, Waves, Mountain, Timer, Clock, Activity, Zap, MapPin, X } from "lucide-react";
import { motion } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { HeroColorSettings } from "@/components/admin/HeroColorSettings";
import { SectionColorManager } from "@/components/admin/SectionColorManager";
import type { SiteConfig, Testimonial, FaqItem, Service, PhotoCarousel, Specialty } from "@shared/schema";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Imports dos componentes que existem
import { HeroImageUpload } from "@/components/admin/HeroImageUpload";
import { TestimonialImageUpload } from "@/components/admin/TestimonialImageUpload";
import { PhotoCarouselImageUpload } from "@/components/admin/PhotoCarouselImageUpload";
import { BasicInfoForm } from "@/components/admin/BasicInfoForm";
import { NavigationForm } from "@/components/admin/NavigationForm";
import { HeroSectionForm } from "@/components/admin/HeroSectionForm";
import { AboutSectionTextsForm } from "@/components/admin/AboutSectionTextsForm";
import { AboutCredentialsManager } from "@/components/admin/AboutCredentialsManager";
import { PhotoCarouselTextsForm } from "@/components/admin/PhotoCarouselTextsForm";
import { PhotoCarouselManager } from "@/components/admin/PhotoCarouselManager";
import { InspirationalSectionForm } from "@/components/admin/InspirationalSectionForm";
import { TestimonialsSectionTextsForm } from "@/components/admin/TestimonialsSectionTextsForm";
import { TestimonialsManager } from "@/components/admin/TestimonialsManager";
import { ServicesSectionTextsForm } from "@/components/admin/ServicesSectionTextsForm";
import { ServicesManager } from "@/components/admin/ServicesManager";
import { FaqSectionTextsForm } from "@/components/admin/FaqSectionTextsForm";
import { FaqManager } from "@/components/admin/FaqManager";
import { SchedulingCardForm } from "@/components/admin/SchedulingCardForm";
import { ContactScheduleManager } from "@/components/admin/ContactScheduleManager";
import { FooterManager } from "@/components/admin/FooterManager";
import { SectionVisibilitySettings } from "@/components/admin/SectionVisibilitySettings";
import { MarketingSettings } from "@/components/admin/MarketingSettings";
import { AppearanceSettings } from "@/components/admin/AppearanceSettings";
import { MaintenanceForm } from "@/components/admin/MaintenanceForm";
import { SpecialtiesManager } from "@/components/admin/SpecialtiesManager";
import { SpecialtiesSectionTextsForm } from "@/components/admin/SpecialtiesSectionTextsForm";
import { FaviconUpload } from "@/components/admin/FaviconUpload";
import { BadgeGradientManager } from "@/components/admin/BadgeGradientManager";
import { DeveloperContactForm } from "@/components/admin/DeveloperContactForm";
import { ContactSectionForm } from "@/components/admin/ContactSectionForm";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(() => {
    const saved = localStorage.getItem('admin_welcome_banner');
    return saved ? JSON.parse(saved) : true;
  });
  const [showTips, setShowTips] = useState(() => {
    const saved = localStorage.getItem('admin_show_tips');
    return saved ? JSON.parse(saved) : true;
  });
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem('admin_active_tab');
    return saved || "general";
  });
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  // Persist state changes
  React.useEffect(() => {
    localStorage.setItem('admin_welcome_banner', JSON.stringify(showWelcomeBanner));
  }, [showWelcomeBanner]);

  React.useEffect(() => {
    localStorage.setItem('admin_show_tips', JSON.stringify(showTips));
  }, [showTips]);

  React.useEffect(() => {
    localStorage.setItem('admin_active_tab', activeTab);
  }, [activeTab]);

  // Configuração otimizada de sensores para mobile e desktop
  const sensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    }),
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Check authentication
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("admin_logged_in");
    if (!isLoggedIn) {
      setLocation("/09806446909");
    }
  }, [setLocation]);

  const logout = () => {
    localStorage.removeItem("admin_logged_in");
    setLocation("/09806446909");
  };

  // Queries com staleTime para evitar refetch excessivo
  const { data: siteConfigs = [] } = useQuery<SiteConfig[]>({
    queryKey: ["/api/admin/config"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/config");
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
  });

  const { data: testimonials = [] } = useQuery<Testimonial[]>({
    queryKey: ["/api/admin/testimonials"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/testimonials");
      return response.json();
    },
    staleTime: 60 * 60 * 1000, // 1 hora - cache muito longo
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    gcTime: 2 * 60 * 60 * 1000, // Cache por 2 horas
    notifyOnChangeProps: ['data'], // Só notifica mudanças nos dados
  });

  const { data: faqItems = [] } = useQuery<FaqItem[]>({
    queryKey: ["/api/admin/faq"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/faq");
      return response.json();
    },
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
  });

  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ["/api/admin/services"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/services");
      return response.json();
    },
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
  });

  const { data: photoCarousel = [] } = useQuery<PhotoCarousel[]>({
    queryKey: ["/api/admin/photo-carousel"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/photo-carousel");
      return response.json();
    },
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
  });

  const { data: specialties = [] } = useQuery<Specialty[]>({
    queryKey: ["/api/admin/specialties"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/specialties");
      return response.json();
    },
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
  });

  const { data: contactSettings } = useQuery({
    queryKey: ["/api/admin/contact-settings"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/contact-settings");
      return response.json();
    },
  });

  const { data: footerSettings } = useQuery({
    queryKey: ["/api/admin/footer-settings"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/footer-settings");
      return response.json();
    },
  });

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null);
  };

  // Componente de Tab Trigger móvel otimizado
  const MobileTabTrigger = ({ value, children, icon }: { value: string; children: React.ReactNode; icon: React.ReactNode }) => (
    <div
      className={`
        flex items-center gap-3 p-4 rounded-xl transition-all duration-200 cursor-pointer touch-manipulation
        ${activeTab === value 
          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
          : 'bg-white/70 hover:bg-white/90 text-gray-700 hover:text-gray-900'
        }
      `}
      onClick={() => setActiveTab(value)}
    >
      <div className={`p-2 rounded-lg ${activeTab === value ? 'bg-white/20' : 'bg-gray-100'}`}>
        {icon}
      </div>
      <div className="flex-1 text-left">
        <div className="font-medium">{children}</div>
      </div>
      {activeTab === value && (
        <div className="w-2 h-2 bg-white rounded-full"></div>
      )}
    </div>
  );

  // Componente de Card responsivo
  const ResponsiveCard = ({ children, className = "", ...props }: any) => (
    <Card className={`
      bg-white/90 backdrop-blur-sm border-0 shadow-lg 
      hover:shadow-xl transition-all duration-300
      ${className}
    `} {...props}>
      {children}
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50">
      {/* Header Mobile Otimizado */}
      <div className="bg-white/95 backdrop-blur-md shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-semibold text-gray-900">
                  Painel Admin
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">
                  Dra. Adrielle Benhossi
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/">
                <Button variant="outline" size="sm" className="hidden sm:flex h-9">
                  <Home className="w-4 h-4 mr-2" />
                  Ver Site
                </Button>
                <Button variant="outline" size="sm" className="sm:hidden h-9 w-9 p-0">
                  <Home className="w-4 h-4" />
                </Button>
              </Link>
              <Button onClick={logout} variant="destructive" size="sm" className="hidden sm:flex h-9">
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
              <Button onClick={logout} variant="destructive" size="sm" className="sm:hidden h-9 w-9 p-0">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8 pb-20">
        {/* Welcome Banner */}
        {showWelcomeBanner && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="mb-4 sm:mb-6"
          >
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 rounded-2xl p-4 relative overflow-hidden">
              <button
                onClick={() => setShowWelcomeBanner(false)}
                className="absolute top-3 right-3 text-gray-600 hover:text-gray-800 transition-all duration-200 bg-white/90 hover:bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md border border-gray-200 hover:shadow-lg hover:scale-105 z-10 touch-manipulation"
                aria-label="Fechar notificação"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="pr-12">
                <h3 className="font-semibold text-purple-900 mb-2 text-sm sm:text-base flex items-center gap-2">
                  <span className="text-lg">👋</span>
                  Bem-vinda, Leleli!
                </h3>
                <p className="text-xs sm:text-sm text-purple-800 leading-relaxed">
                  Aqui você personaliza tudo do seu site! Mexe nos textos, cores, suas fotos, depoimentos dos pacientes, 
                  seus serviços, FAQ e configura os pixels pro Facebook e Google. Toda mudança já fica no ar na hora!
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              {/* Navigation com Select */}
              <div className="mb-6">
                <Select value={activeTab} onValueChange={setActiveTab}>
                  <SelectTrigger className="w-full bg-white/90 backdrop-blur-sm border-gray-200 rounded-2xl p-4 h-auto">
                    <SelectValue placeholder="Selecione uma seção para configurar">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                          {activeTab === "general" && <Settings className="w-4 h-4 text-white" />}
                          {activeTab === "about" && <Users className="w-4 h-4 text-white" />}
                          {activeTab === "gallery" && <Camera className="w-4 h-4 text-white" />}
                          {activeTab === "specialties" && <Target className="w-4 h-4 text-white" />}
                          {activeTab === "inspirational" && <Heart className="w-4 h-4 text-white" />}
                          {activeTab === "testimonials" && <MessageSquare className="w-4 h-4 text-white" />}
                          {activeTab === "services" && <Briefcase className="w-4 h-4 text-white" />}
                          {activeTab === "faq" && <HelpCircle className="w-4 h-4 text-white" />}
                          {activeTab === "contact-schedule" && <MessageCircle className="w-4 h-4 text-white" />}
                          {activeTab === "footer" && <MapPin className="w-4 h-4 text-white" />}
                          {activeTab === "visibility" && <Eye className="w-4 h-4 text-white" />}
                          {activeTab === "marketing" && <TrendingUp className="w-4 h-4 text-white" />}
                          {activeTab === "appearance" && <Palette className="w-4 h-4 text-white" />}
                          {activeTab === "developer-contact" && <MessageSquare className="w-4 h-4 text-white" />}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {activeTab === "general" && "Configurações Gerais"}
                            {activeTab === "about" && "Gerenciar Sobre"}
                            {activeTab === "gallery" && "Galeria de Fotos"}
                            {activeTab === "specialties" && "Minhas Especialidades"}
                            {activeTab === "inspirational" && "Citação Inspiracional"}
                            {activeTab === "testimonials" && "Gerenciar Depoimentos"}
                            {activeTab === "services" && "Gerenciar Serviços"}
                            {activeTab === "faq" && "Gerenciar FAQ"}
                            {activeTab === "contact-schedule" && "Contato e Horários"}
                            {activeTab === "footer" && "Gerenciar Rodapé"}
                            {activeTab === "visibility" && "Controlar Visibilidade"}
                            {activeTab === "marketing" && "Pixels de Marketing"}
                            {activeTab === "appearance" && "Personalizar Cores"}
                            {activeTab === "developer-contact" && "Contato Desenvolvedor"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {activeTab === "general" && "Informações básicas, hero e navegação"}
                            {activeTab === "about" && "Textos e credenciais profissionais"}
                            {activeTab === "gallery" && "Fotos do consultório"}
                            {activeTab === "specialties" && "Suas áreas de especialização"}
                            {activeTab === "inspirational" && "Frase motivacional"}
                            {activeTab === "testimonials" && "Depoimentos dos pacientes"}
                            {activeTab === "services" && "Tipos de atendimento"}
                            {activeTab === "faq" && "Perguntas e respostas"}
                            {activeTab === "contact-schedule" && "Contatos e horários"}
                            {activeTab === "footer" && "Rodapé do site"}
                            {activeTab === "visibility" && "Mostrar/ocultar seções"}
                            {activeTab === "marketing" && "Google Analytics e Facebook Pixel"}
                            {activeTab === "appearance" && "Cores e gradientes"}
                            {activeTab === "developer-contact" && "Reporte um problema ou sugira melhorias"}
                          </div>
                        </div>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-md border-gray-200 rounded-2xl">
                    <div className="p-2">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">
                        Configurações do Site
                      </div>
                      <SelectItem value="general" className="rounded-xl mb-1">
                        <div className="flex items-center gap-3">
                          <Settings className="w-4 h-4 text-purple-600" />
                          <div>
                            <div className="font-medium">Configurações Gerais</div>
                            <div className="text-xs text-gray-500">Informações básicas, hero e navegação</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="about" className="rounded-xl mb-1">
                        <div className="flex items-center gap-3">
                          <Users className="w-4 h-4 text-purple-600" />
                          <div>
                            <div className="font-medium">Gerenciar Sobre</div>
                            <div className="text-xs text-gray-500">Textos e credenciais profissionais</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="gallery" className="rounded-xl mb-1">
                        <div className="flex items-center gap-3">
                          <Camera className="w-4 h-4 text-purple-600" />
                          <div>
                            <div className="font-medium">Galeria de Fotos</div>
                            <div className="text-xs text-gray-500">Fotos do consultório</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="specialties" className="rounded-xl mb-1">
                        <div className="flex items-center gap-3">
                          <Target className="w-4 h-4 text-purple-600" />
                          <div>
                            <div className="font-medium">Minhas Especialidades</div>
                            <div className="text-xs text-gray-500">Suas áreas de especialização</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="inspirational" className="rounded-xl mb-3">
                        <div className="flex items-center gap-3">
                          <Heart className="w-4 h-4 text-purple-600" />
                          <div>
                            <div className="font-medium">Citação Inspiracional</div>
                            <div className="text-xs text-gray-500">Frase motivacional</div>
                          </div>
                        </div>
                      </SelectItem>

                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">
                        Conteúdo
                      </div>
                      <SelectItem value="testimonials" className="rounded-xl mb-1">
                        <div className="flex items-center gap-3">
                          <MessageSquare className="w-4 h-4 text-blue-600" />
                          <div>
                            <div className="font-medium">Gerenciar Depoimentos</div>
                            <div className="text-xs text-gray-500">Depoimentos dos pacientes</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="services" className="rounded-xl mb-1">
                        <div className="flex items-center gap-3">
                          <Briefcase className="w-4 h-4 text-blue-600" />
                          <div>
                            <div className="font-medium">Gerenciar Serviços</div>
                            <div className="text-xs text-gray-500">Tipos de atendimento</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="faq" className="rounded-xl mb-3">
                        <div className="flex items-center gap-3">
                          <HelpCircle className="w-4 h-4 text-blue-600" />
                          <div>
                            <div className="font-medium">Gerenciar FAQ</div>
                            <div className="text-xs text-gray-500">Perguntas e respostas</div>
                          </div>
                        </div>
                      </SelectItem>

                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">
                        Contato e Layout
                      </div>
                      <SelectItem value="contact-schedule" className="rounded-xl mb-1">
                        <div className="flex items-center gap-3">
                          <MessageCircle className="w-4 h-4 text-emerald-600" />
                          <div>
                            <div className="font-medium">Contato e Horários</div>
                            <div className="text-xs text-gray-500">Contatos e horários</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="footer" className="rounded-xl mb-3">
                        <div className="flex items-center gap-3">
                          <MapPin className="w-4 h-4 text-emerald-600" />
                          <div>
                            <div className="font-medium">Gerenciar Rodapé</div>
                            <div className="text-xs text-gray-500">Rodapé do site</div>
                          </div>
                        </div>
                      </SelectItem>

                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">
                        Configurações Avançadas
                      </div>
                      <SelectItem value="visibility" className="rounded-xl mb-1">
                        <div className="flex items-center gap-3">
                          <Eye className="w-4 h-4 text-amber-600" />
                          <div>
                            <div className="font-medium">Controlar Visibilidade</div>
                            <div className="text-xs text-gray-500">Mostrar/ocultar seções</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="marketing" className="rounded-xl mb-1">
                        <div className="flex items-center gap-3">
                          <TrendingUp className="w-4 h-4 text-amber-600" />
                          <div>
                            <div className="font-medium">Pixels de Marketing</div>
                            <div className="text-xs text-gray-500">Google Analytics e Facebook Pixel</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="appearance" className="rounded-xl">
                        <div className="flex items-center gap-3">
                          <Palette className="w-4 h-4 text-amber-600" />
                          <div>
                            <div className="font-medium">Personalizar Cores</div>
                            <div className="text-xs text-gray-500">Cores e gradientes</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="developer-contact" className="rounded-xl">
                        <div className="flex items-center gap-3">
                          <MessageSquare className="w-4 h-4 text-gray-600" />
                          <div>
                            <div className="font-medium">Contato Desenvolvedor</div>
                            <div className="text-xs text-gray-500">Reporte um problema ou sugira melhorias</div>
                          </div>
                        </div>
                      </SelectItem>
                    </div>
                  </SelectContent>
                </Select>
              </div>

              {/* General Tab */}
              <TabsContent value="general" className="space-y-6">
                {showTips && (
                  <div className="mb-4 p-4 bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-2xl relative">
                    <button
                      onClick={() => setShowTips(false)}
                      className="absolute top-3 right-3 text-blue-600 hover:text-blue-800 transition-all duration-200 bg-white/90 hover:bg-white rounded-full w-7 h-7 flex items-center justify-center shadow-sm border border-blue-300 hover:shadow-md hover:scale-105 text-sm font-bold touch-manipulation"
                      aria-label="Fechar dicas"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <p className="text-sm text-blue-700 pr-10">
                      💡 <strong>Dica:</strong> Os campos de texto podem ser redimensionados arrastando o canto inferior direito para aumentar o tamanho.
                    </p>
                  </div>
                )}
                <div className="grid gap-6">
                  {/* Informações Básicas */}
                  <ResponsiveCard>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                          <Users className="w-4 h-4 text-white" />
                        </div>
                        Informações Básicas
                      </CardTitle>
                      <CardDescription className="text-sm">
                        Configure os dados principais: nome, CRP, descrição e foto de perfil
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <BasicInfoForm configs={siteConfigs} />
                    </CardContent>
                  </ResponsiveCard>

                  {/* Seção Hero */}
                  <ResponsiveCard>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                          <Home className="w-4 h-4 text-white" />
                        </div>
                        Seção Principal (Hero)
                      </CardTitle>
                      <CardDescription className="text-sm">
                        Configure a primeira seção que os visitantes veem
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <HeroSectionForm configs={siteConfigs} />
                    </CardContent>
                  </ResponsiveCard>

                  {/* Navegação */}
                  <ResponsiveCard>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                          <Compass className="w-4 h-4 text-white" />
                        </div>
                        Menu de Navegação
                      </CardTitle>
                      <CardDescription className="text-sm">
                        Personalize os nomes dos botões do menu (apenas os nomes, as funcionalidades permanecem)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <NavigationForm configs={siteConfigs} />
                    </CardContent>
                  </ResponsiveCard>

                  {/* Upload do Favicon */}
                  <FaviconUpload />

                  {/* Modo Manutenção */}
                  <ResponsiveCard>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
                          <Settings className="w-4 h-4 text-white" />
                        </div>
                        Modo de Manutenção
                      </CardTitle>
                      <CardDescription className="text-sm">
                        Ative o modo de manutenção para exibir uma página especial enquanto você trabalha no site
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <MaintenanceForm configs={siteConfigs} />
                    </CardContent>
                  </ResponsiveCard>
                </div>
              </TabsContent>

              {/* About Tab */}
              <TabsContent value="about" className="space-y-6">
                {showTips && (
                  <div className="mb-4 p-4 bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-2xl relative">
                    <button
                      onClick={() => setShowTips(false)}
                      className="absolute top-3 right-3 text-blue-600 hover:text-blue-800 transition-all duration-200 bg-white/90 hover:bg-white rounded-full w-7 h-7 flex items-center justify-center shadow-sm border border-blue-300 hover:shadow-md hover:scale-105 text-sm font-bold touch-manipulation"
                      aria-label="Fechar dicas"
                    >                      <X className="w-3 h-3" />
                    </button>
                    <p className="text-sm text-blue-700 pr-10">
                      💡 <strong>Dica:</strong> Os campos de texto podem ser redimensionados arrastando o canto inferior direito para aumentar o tamanho.
                    </p>
                  </div>
                )}

                {/* Configurações de Texto da Seção Sobre */}
                <ResponsiveCard>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                        <Edit className="w-4 h-4 text-white" />
                      </div>
                      Textos da Seção Sobre
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Configure os textos que aparecem no cabeçalho da seção sobre
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AboutSectionTextsForm configs={siteConfigs} />
                  </CardContent>
                </ResponsiveCard>

                {/* Credenciais */}
                <ResponsiveCard>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500```python
 rounded-lg">
                        <Award className="w-4 h-4 text-white" />
                      </div>
                      Gerenciar Credenciais
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Configure as credenciais, qualificações e especializações exibidas na seção "Sobre". 
                      Cada item aparece como um card com gradiente personalizado na seção sobre a psicóloga.
                      Arraste e solte para reordenar a sequência de exibição.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AboutCredentialsManager configs={siteConfigs} />
                  </CardContent>
                </ResponsiveCard>
              </TabsContent>

              {/* Gallery Tab */}
              <TabsContent value="gallery" className="space-y-6">
                {/* Configurações de Texto da Galeria */}
                <ResponsiveCard>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                        <Edit className="w-4 h-4 text-white" />
                      </div>
                      Textos da Seção Galeria
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Configure os textos que aparecem no cabeçalho da galeria de fotos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PhotoCarouselTextsForm configs={siteConfigs} />
                  </CardContent>
                </ResponsiveCard>

                {/* Gerenciamento de Fotos */}
                <ResponsiveCard>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                        <Camera className="w-4 h-4 text-white" />
                      </div>
                      Gerenciar Fotos do Carrossel
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Adicione, edite e organize as fotos do consultório. O carrossel avança automaticamente a cada 6 segundos.
                      Arraste e solte para reordenar as fotos.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PhotoCarouselManager photoCarousel={photoCarousel} />
                  </CardContent>
                </ResponsiveCard>
              </TabsContent>

              {/* Specialties Tab */}
              <TabsContent value="specialties" className="space-y-6">
                {showTips && (
                  <div className="mb-4 p-4 bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-2xl relative">
                    <button
                      onClick={() => setShowTips(false)}
                      className="absolute top-3 right-3 text-blue-600 hover:text-blue-800 transition-all duration-200 bg-white/90 hover:bg-white rounded-full w-7 h-7 flex items-center justify-center shadow-sm border border-blue-300 hover:shadow-md hover:scale-105 text-sm font-bold touch-manipulation"
                      aria-label="Fechar dicas"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <p className="text-sm text-blue-700 pr-10">
                      💡 <strong>Dica:</strong> Os campos de texto podem ser redimensionados arrastando o canto inferior direito para aumentar o tamanho.
                    </p>
                  </div>
                )}
          <SpecialtiesSectionTextsForm configs={siteConfigs || []} />
          <SpecialtiesManager specialties={specialties} />
        </TabsContent>

              {/* Inspirational Tab */}
              <TabsContent value="inspirational" className="space-y-6">
                {showTips && (
                  <div className="mb-4 p-4 bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-2xl relative">
                    <button
                      onClick={() => setShowTips(false)}
                      className="absolute top-3 right-3 text-blue-600 hover:text-blue-800 transition-all duration-200 bg-white/90 hover:bg-white rounded-full w-7 h-7 flex items-center justify-center shadow-sm border border-blue-300 hover:shadow-md hover:scale-105 text-sm font-bold touch-manipulation"
                      aria-label="Fechar dicas"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <p className="text-sm text-blue-700 pr-10">
                      💡 <strong>Dica:</strong> Os campos de texto podem ser redimensionados arrastando o canto inferior direito para aumentar o tamanho.
                    </p>
                  </div>
                )}

                <ResponsiveCard>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="p-2 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-lg">
                        <Heart className="w-4 h-4 text-white" />
                      </div>
                      Citação Inspiracional
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Configure a frase motivacional que aparece na seção inspiracional do seu site
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <InspirationalSectionForm configs={siteConfigs} />
                  </CardContent>
                </ResponsiveCard>
              </TabsContent>

              {/* Testimonials Tab */}
              <TabsContent value="testimonials" className="space-y-6">
                {showTips && (
                  <div className="mb-4 p-4 bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-2xl relative">
                    <button
                      onClick={() => setShowTips(false)}
                      className="absolute top-3 right-3 text-blue-600 hover:text-blue-800 transition-all duration-200 bg-white/90 hover:bg-white rounded-full w-7 h-7 flex items-center justify-center shadow-sm border border-blue-300 hover:shadow-md hover:scale-105 text-sm font-bold touch-manipulation"
                      aria-label="Fechar dicas"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <p className="text-sm text-blue-700 pr-10">
                      💡 <strong>Dica:</strong> Os campos de texto podem ser redimensionados arrastando o canto inferior direito para aumentar o tamanho.
                    </p>
                  </div>
                )}

                {/* Configurações de Texto da Seção Depoimentos */}
                <ResponsiveCard>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
                        <Edit className="w-4 h-4 text-white" />
                      </div>
                      Textos da Seção Depoimentos
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Configure os textos que aparecem no cabeçalho da seção de depoimentos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TestimonialsSectionTextsForm configs={siteConfigs} />
                  </CardContent>
                </ResponsiveCard>

                

                {/* Gerenciamento de Depoimentos */}
                <ResponsiveCard>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="p-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg">
                        <MessageSquare className="w-4 h-4 text-white" />
                      </div>
                      Gerenciar Depoimentos
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Aqui você adiciona, edita ou remove depoimentos dos seus pacientes. 
                      Use avatares variados para representar diferentes perfis de clientes. 
                      Arraste e solte para reordenar a sequência de exibição no site.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TestimonialsManager testimonials={testimonials} />
                  </CardContent>
                </ResponsiveCard>
              </TabsContent>

              {/* Services Tab */}
              <TabsContent value="services" className="space-y-6">
                {showTips && (
                  <div className="mb-4 p-4 bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-2xl relative">
                    <button
                      onClick={() => setShowTips(false)}
                      className="absolute top-3 right-3 text-blue-600 hover:text-blue-800 transition-all duration-200 bg-white/90 hover:bg-white rounded-full w-7 h-7 flex items-center justify-center shadow-sm border border-blue-300 hover:shadow-md hover:scale-105 text-sm font-bold touch-manipulation"
                      aria-label="Fechar dicas"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <p className="text-sm text-blue-700 pr-10">
                      💡 <strong>Dica:</strong> Os campos de texto podem ser redimensionados arrastando o canto inferior direito para aumentar o tamanho.
                    </p>
                  </div>
                )}

                {/* Configurações de Texto da Seção Serviços */}
                <ResponsiveCard>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="p-2 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg">
                        <Edit className="w-4 h-4 text-white" />
                      </div>
                      Textos da Seção Serviços
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Configure os textos que aparecem no cabeçalho da seção de serviços
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ServicesSectionTextsForm configs={siteConfigs} />
                  </CardContent>
                </ResponsiveCard>

                {/* Gerenciamento de Serviços */}
                <ResponsiveCard>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="p-2 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg">
                        <Briefcase className="w-4 h-4 text-white" />
                      </div>
                      Gerenciar Serviços
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Configure os serviços que você oferece: título, descrição, ícone e preços. 
                      Escolha entre 40+ ícones profissionais organizados por categorias.
                      Ative/desative serviços e reordene usando arrastar e soltar.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ServicesManager services={services} />
                  </CardContent>
                </ResponsiveCard>
              </TabsContent>

              {/* FAQ Tab */}
              <TabsContent value="faq" className="space-y-6">
                {showTips && (
                  <div className="mb-4 p-4 bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-2xl relative">
                    <button
                      onClick={() => setShowTips(false)}
                      className="absolute top-3 right-3 text-blue-600 hover:text-blue-800 transition-all duration-200 bg-white/90 hover:bg-white rounded-full w-7 h-7 flex items-center justify-center shadow-sm border border-blue-300 hover:shadow-md hover:scale-105 text-sm font-bold touch-manipulation"
                      aria-label="Fechar dicas"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <p className="text-sm text-blue-700 pr-10">
                      💡 <strong>Dica:</strong> Os campos de texto podem ser redimensionados arrastando o canto inferior direito para aumentar o tamanho.
                    </p>
                  </div>
                )}

                {/* Configurações de Texto da Seção FAQ */}
                <ResponsiveCard>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg">
                        <Edit className="w-4 h-4 text-white" />
                      </div>
                      Textos da Seção FAQ
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Configure os textos que aparecem no cabeçalho da seção de FAQ
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FaqSectionTextsForm configs={siteConfigs} />
                  </CardContent>
                </ResponsiveCard>

                {/* Gerenciamento de FAQ */}
                <ResponsiveCard>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg">
                        <HelpCircle className="w-4 h-4 text-white" />
                      </div>
                      Gerenciar FAQ
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Crie perguntas e respostas frequentes sobre seus serviços. 
                      Ajude seus futuros pacientes esclarecendo dúvidas comuns. 
                      Organize as perguntas arrastando para reordenar por importância.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FaqManager faqItems={faqItems} />
                  </CardContent>
                </ResponsiveCard>
              </TabsContent>

              {/* Visibility Tab */}
              <TabsContent value="visibility" className="space-y-6">
                <ResponsiveCard>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="p-2 bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg">
                        <Eye className="w-4 h-4 text-white" />
                      </div>
                      Visibilidade das Seções
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Controle quais seções do site estão visíveis para os visitantes. 
                      Você pode temporariamente desativar seções durante atualizações ou manutenção.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SectionVisibilitySettings configs={siteConfigs} />
                  </CardContent>
                </ResponsiveCard>
              </TabsContent>

              {/* Marketing Tab */}
              <TabsContent value="marketing" className="space-y-6">
                <ResponsiveCard>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="p-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg">
                        <TrendingUp className="w-4 h-4 text-white" />
                      </div>
                      Configurações de Marketing
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Configure códigos de acompanhamento para medir visitas e resultados. 
                      Google Analytics mostra estatísticas detalhadas. Facebook Pixel permite criar anúncios direcionados. 
                      Cole os códigos fornecidos por essas plataformas aqui.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MarketingSettings configs={siteConfigs} />
                  </CardContent>
                </ResponsiveCard>
              </TabsContent>

              {/* Contact Schedule Tab */}
              <TabsContent value="contact-schedule" className="space-y-6">
                {showTips && (
                  <div className="mb-4 p-4 bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-2xl relative">
                    <button
                      onClick={() => setShowTips(false)}
                      className="absolute top-3 right-3 text-blue-600 hover:text-blue-800 transition-all duration-200 bg-white/90 hover:bg-white rounded-full w-7 h-7 flex items-center justify-center shadow-sm border border-blue-300 hover:shadow-md hover:scale-105 text-sm font-bold touch-manipulation"
                      aria-label="Fechar dicas"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="pr-10">
                      <p className="text-sm text-blue-700 mb-2">
                        💡 <strong>Dica:</strong> Os campos de texto podem ser redimensionados arrastando o canto inferior direito para aumentar o tamanho.
                      </p>
                      <p className="text-sm text-blue-600">
                        <strong>Exemplos de uso:</strong> Atendimento online? Desative a localização. Horários flexíveis? Desative os horários. Apenas contato por mensagem? Mantenha apenas o card de contato ativo.
                      </p>
                    </div>
                  </div>
                )}

                {/* Configurações do Card de Agendamento */}
                <ResponsiveCard>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="p-2 bg-gradient-to-r from-rose-500 to-pink-500 rounded-lg">
                        <Edit className="w-4 h-4 text-white" />
                      </div>
                      Card de Agendamento
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Configure os textos do card "Vamos conversar?" que aparece na seção de contato
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ContactSectionForm configs={siteConfigs} />
                  </CardContent>
                </ResponsiveCard>

                {/* Gerenciamento de Contato */}
                <ResponsiveCard>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
                        <MessageCircle className="w-4 h-4 text-white" />
                      </div>
                      Gerenciar Botões e Horários
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Configure botões de contato, horários de funcionamento e localização. 
                      Personalize botões de contato, reordene por prioridade e defina links personalizados.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ContactScheduleManager contactSettings={contactSettings} />
                  </CardContent>
                </ResponsiveCard>
              </TabsContent>

              {/* Footer Tab */}
              <TabsContent value="footer" className="space-y-6">
                <ResponsiveCard>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="p-2 bg-gradient-to-r from-slate-600 to-gray-600 rounded-lg">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                      Gerenciar Rodapé
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Configure todos os elementos do rodapé: textos, botões de contato, certificações, 
                      selos de confiança, informações de copyright e CNPJ. Personalize cores, ícones e ordenação.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FooterManager footerSettings={footerSettings} />
                  </CardContent>
                </ResponsiveCard>
              </TabsContent>

              {/* Appearance Tab */}
              <TabsContent value="appearance" className="space-y-6">
                <div className="grid gap-6">
                  {/* Personalizar Cores por Seção - PRIORITÁRIO */}
                  <ResponsiveCard>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="p-2 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg">
                          <Palette className="w-4 h-4 text-white" />
                        </div>
                        Personalizar Cores por Seção
                      </CardTitle>
                    <CardDescription className="text-sm">
                        Configure cores individuais para cada seção do site: fundo, gradientes e sobreposições.
                      </CardDescription>
                  </CardHeader>
                  <CardContent>
                      <SectionColorManager configs={siteConfigs} />
                    </CardContent>
                  </ResponsiveCard>

                  {/* Cores Globais do Sistema - Simplificado */}
                  <ResponsiveCard>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
                          <Palette className="w-4 h-4 text-white" />
                        </div>
                        Cores Globais do Sistema
                      </CardTitle>
                      <CardDescription className="text-sm">
                        Configure as cores principais que afetam botões, links e elementos interativos em todo o site.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <AppearanceSettings configs={siteConfigs} />
                    </CardContent>
                  </ResponsiveCard>

                  {/* Gradientes dos Badges */}
                  <ResponsiveCard>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <div className="p-2 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        Gradientes dos Badges
                      </CardTitle>
                      <CardDescription className="text-sm">
                        Configure o gradiente aplicado em todas as palavras entre parênteses nos títulos das seções.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <BadgeGradientManager configs={siteConfigs} />
                    </CardContent>
                  </ResponsiveCard>
                </div>
              </TabsContent>

              {/* Developer Contact Tab */}
              <TabsContent value="developer-contact" className="space-y-6">
                <ResponsiveCard>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="p-2 bg-gradient-to-r from-gray-600 to-gray-600 rounded-lg">
                        <MessageSquare className="w-4 h-4 text-white" />
                      </div>
                      Contato Desenvolvedor
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Reporte um problema, sugira melhorias ou entre em contato com o desenvolvedor.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DeveloperContactForm />
                  </CardContent>
                </ResponsiveCard>
              </TabsContent>
            </Tabs>
          </motion.div>

          <DragOverlay>
            {activeDragId ? (
              <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-2xl border border-gray-200 transform rotate-2">
                <div className="flex items-center gap-3">
                  <GripVertical className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Movendo item...</span>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-200">
          <div className="text-center text-xs text-gray-400">
            Made with <span className="text-yellow-500">♥</span> by <span className="font-mono">∞</span>
          </div>
        </div>
      </div>
    </div>
  );
}