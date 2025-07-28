import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Eye, EyeOff, GripVertical } from "lucide-react";
import { motion } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { SiteConfig } from "@shared/schema";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Componente arrastável para item de seção
function SortableSectionItem({ section, isVisible, onToggleVisibility }: {
  section: any;
  isVisible: boolean;
  onToggleVisibility: (key: string, visible: boolean) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.key });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`sortable-item flex items-center justify-between p-4 border rounded-lg bg-white ${isDragging ? 'dragging' : ''}`}
    >
      <div className="flex items-start gap-3 flex-1">
        <div 
          {...attributes} 
          {...listeners}
          className="drag-handle p-2 -ml-2"
        >
          <GripVertical className="w-5 h-5 text-gray-400" />
        </div>
        <div className="text-2xl">{section.icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900">{section.name}</h3>
            <Badge variant={isVisible ? "default" : "secondary"} className="text-xs">
              {isVisible ? "Visível" : "Oculta"}
            </Badge>
          </div>
          <p className="text-sm text-gray-600">{section.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Switch
          checked={isVisible}
          onCheckedChange={(checked) => onToggleVisibility(section.key, checked)}
        />
        {isVisible ? (
          <Eye className="w-5 h-5 text-green-600" />
        ) : (
          <EyeOff className="w-5 h-5 text-gray-400" />
        )}
      </div>
    </div>
  );
}

export function SectionVisibilitySettings({ configs }: { configs: SiteConfig[] }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Sensores otimizados para mobile e desktop
  const sensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const sectionVisibilityConfig = configs.find(c => c.key === 'section_visibility')?.value as Record<string, boolean> || {};
  const sectionOrderConfig = configs.find(c => c.key === 'section_order')?.value as Record<string, number> || {};

  // Definir todas as seções disponíveis
  const allSections = [
    {
      key: 'hero',
      name: 'Seção Principal (Hero)',
      description: 'Primeiro contato com os visitantes - foto, nome e call-to-action',
      icon: '🏠'
    },
    {
      key: 'about', 
      name: 'Sobre Mim',
      description: 'Apresentação profissional, credenciais e especialidades',
      icon: '👩‍⚕️'
    },
    {
      key: 'specialties',
      name: 'Especialidades',
      description: 'Áreas de atuação e especialidades',
      icon: '⭐️' // Choosing a star icon for specialties
    },
    {
      key: 'gallery',
      name: 'Galeria de Fotos',
      description: 'Carrossel com fotos do consultório e ambiente',
      icon: '📸'
    },
    {
      key: 'services',
      name: 'Meus Serviços', 
      description: 'Lista dos tipos de atendimento oferecidos',
      icon: '🔧'
    },
    {
      key: 'testimonials',
      name: 'Depoimentos',
      description: 'Avaliações e feedback dos pacientes',
      icon: '💬'
    },
    {
      key: 'faq',
      name: 'Perguntas Frequentes',
      description: 'Respostas para dúvidas comuns sobre os serviços',
      icon: '❓'
    },
    {
      key: 'contact',
      name: 'Contato e Agendamento',
      description: 'Botões de contato, horários e informações para agendamento',
      icon: '📞'
    }
  ];

  // Ordenar seções pela ordem configurada
  const sortedSections = [...allSections].sort((a, b) => {
    const orderA = sectionOrderConfig[a.key] ?? 999;
    const orderB = sectionOrderConfig[b.key] ?? 999;
    return orderA - orderB;
  });

  const updateSectionVisibility = useMutation({
    mutationFn: async ({ key, visible }: { key: string; visible: boolean }) => {
      const newVisibility = { ...sectionVisibilityConfig, [key]: visible };
      const response = await apiRequest("POST", "/api/admin/config", {
        key: "section_visibility",
        value: newVisibility
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/config"] });
      toast({ title: "Visibilidade da seção atualizada!" });
    },
  });

  const updateSectionOrder = useMutation({
    mutationFn: async (newOrder: Record<string, number>) => {
      const response = await apiRequest("POST", "/api/admin/config", {
        key: "section_order",
        value: newOrder
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/config"] });
      toast({ title: "Ordem das seções atualizada!" });
    },
  });

  const handleToggleVisibility = (key: string, visible: boolean) => {
    updateSectionVisibility.mutate({ key, visible });
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id && over) {
      const oldIndex = sortedSections.findIndex((section) => section.key === active.id);
      const newIndex = sortedSections.findIndex((section) => section.key === over.id);

      const reorderedSections = arrayMove(sortedSections, oldIndex, newIndex);

      // Criar novo objeto de ordem
      const newOrder: Record<string, number> = {};
      reorderedSections.forEach((section, index) => {
        newOrder[section.key] = index;
      });

      updateSectionOrder.mutate(newOrder);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visibilidade das Seções</CardTitle>
        <CardDescription>
          Controle quais seções do site estão visíveis para os visitantes. 
          Você pode temporariamente desativar seções durante atualizações ou manutenção.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            💡 <strong>Dica:</strong> Arraste e solte as seções para alterar a ordem de exibição no site. 
            Use os switches para mostrar/ocultar seções temporariamente.
          </p>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={sortedSections.map(s => s.key)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {sortedSections.map((section) => (
                <SortableSectionItem
                  key={section.key}
                  section={section}
                  isVisible={sectionVisibilityConfig[section.key] ?? true}
                  onToggleVisibility={handleToggleVisibility}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <div className="mt-6 p-4 border rounded-lg bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-2">Informações das Seções:</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>🏠 Hero:</strong> Sempre primeira - apresentação inicial com foto e call-to-action</p>
            <p><strong>👩‍⚕️ Sobre:</strong> Credenciais profissionais e especialidades</p>
            <p><strong>⭐️ Especialidades:</strong> Áreas de atuação e especialidades</p>
            <p><strong>📸 Galeria:</strong> Fotos do ambiente de trabalho</p>
            <p><strong>🔧 Serviços:</strong> Tipos de atendimento e modalidades</p>
            <p><strong>💬 Depoimentos:</strong> Feedback e avaliações de pacientes</p>
            <p><strong>❓ FAQ:</strong> Perguntas e respostas frequentes</p>
            <p><strong>📞 Contato:</strong> Sempre última - informações para agendamento</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}