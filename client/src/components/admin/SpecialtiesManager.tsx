
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, Plus, GripVertical, ChevronUp, ChevronDown, Target, Brain, Heart, BookOpen, Users, Award, Shield, Sun, Moon, Sparkles, MessageCircle, HelpCircle, Leaf, Flower, Compass, TrendingUp, Handshake, Activity, Zap, Star, Clock, MapPin, TreePine, Wind, Umbrella, LifeBuoy, Puzzle, Palette, Waves, Mountain, Timer, Home } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Specialty } from "@shared/schema";
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

export function SpecialtiesManager({ specialties }: { specialties: Specialty[] }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingItem, setEditingItem] = useState<Specialty | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const specialtySchema = z.object({
    title: z.string().min(1, "Título é obrigatório"),
    description: z.string().min(1, "Descrição é obrigatória"),
    icon: z.string().min(1, "Ícone é obrigatório"),
    iconColor: z.string().min(1, "Cor é obrigatória"),
    isActive: z.boolean(),
    order: z.number().min(0),
  });

  type SpecialtyForm = z.infer<typeof specialtySchema>;

  const form = useForm<SpecialtyForm>({
    resolver: zodResolver(specialtySchema),
    defaultValues: {
      title: "",
      description: "",
      icon: "Brain",
      iconColor: "#ec4899",
      isActive: true,
      order: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: SpecialtyForm) => {
      const response = await apiRequest("POST", "/api/admin/specialties", data);
      return response.json();
    },
    onSuccess: () => {
      // Delay query invalidation to prevent dialog closing
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/specialties"] });
        queryClient.invalidateQueries({ queryKey: ["/api/specialties"] });
      }, 100);
      toast({ title: "Especialidade criada com sucesso!" });
      setIsDialogOpen(false);
      form.reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<SpecialtyForm> }) => {
      const response = await apiRequest("PUT", `/api/admin/specialties/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      // Delay query invalidation to prevent dialog closing
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/specialties"] });
        queryClient.invalidateQueries({ queryKey: ["/api/specialties"] });
      }, 100);
      toast({ title: "Especialidade atualizada com sucesso!" });
      setEditingItem(null);
      setIsDialogOpen(false);
      form.reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/specialties/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/specialties"] });
      queryClient.invalidateQueries({ queryKey: ["/api/specialties"] });
      toast({ title: "Especialidade excluída com sucesso!" });
    },
  });

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id && over) {
      const oldIndex = specialties.findIndex((item) => item.id === active.id);
      const newIndex = specialties.findIndex((item) => item.id === over.id);

      const newOrder = arrayMove(specialties, oldIndex, newIndex);

      const updatePromises = newOrder.map((item, index) => 
        apiRequest("PUT", `/api/admin/specialties/${item.id}`, { 
          order: index
        })
      );

      Promise.all(updatePromises).then(() => {
        // Delay query invalidation to prevent UI flickering
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ["/api/admin/specialties"] });
          queryClient.invalidateQueries({ queryKey: ["/api/specialties"] });
        }, 100);
        toast({ title: "Ordem das especialidades atualizada!" });
      }).catch(() => {
        toast({ title: "Erro ao atualizar ordem", variant: "destructive" });
      });
    }
  };

  const onSubmit = (data: SpecialtyForm) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const openEditDialog = (specialty: Specialty) => {
    setEditingItem(specialty);

    setTimeout(() => {
      form.setValue("title", specialty.title || "");
      form.setValue("description", specialty.description || "");
      form.setValue("icon", specialty.icon || "Brain");
      form.setValue("iconColor", specialty.iconColor || "#ec4899");
      form.setValue("isActive", specialty.isActive ?? true);
      form.setValue("order", specialty.order || 0);
    }, 100);

    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingItem(null);
    form.reset();
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Minhas Especialidades</h3>
          <p className="text-sm text-muted-foreground">
            Configure suas áreas de expertise exibidas na seção "Sobre"
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Especialidade
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Editar Especialidade" : "Nova Especialidade"}
              </DialogTitle>
              <DialogDescription>
                Configure as informações da sua especialidade
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input placeholder="Ansiedade" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Técnicas para controlar preocupações excessivas..." rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="icon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ícone</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um ícone" />
                            </SelectTrigger>
                            <SelectContent className="max-h-80">
                              {/* Ícones de Saúde Mental */}
                              <SelectItem value="Brain"><Brain className="w-4 h-4 mr-2 inline" />Cérebro</SelectItem>
                              <SelectItem value="Heart"><Heart className="w-4 h-4 mr-2 inline" />Coração</SelectItem>
                              <SelectItem value="Shield"><Shield className="w-4 h-4 mr-2 inline" />Escudo/Proteção</SelectItem>
                              <SelectItem value="Target"><Target className="w-4 h-4 mr-2 inline" />Foco/Objetivo</SelectItem>
                              <SelectItem value="Activity"><Activity className="w-4 h-4 mr-2 inline" />Atividade</SelectItem>
                              <SelectItem value="Zap"><Zap className="w-4 h-4 mr-2 inline" />Energia</SelectItem>

                              {/* Ícones de Bem-estar */}
                              <SelectItem value="Sun"><Sun className="w-4 h-4 mr-2 inline" />Sol</SelectItem>
                              <SelectItem value="Moon"><Moon className="w-4 h-4 mr-2 inline" />Lua</SelectItem>
                              <SelectItem value="Star"><Star className="w-4 h-4 mr-2 inline" />Estrela</SelectItem>
                              <SelectItem value="Sparkles"><Sparkles className="w-4 h-4 mr-2 inline" />Brilhos</SelectItem>

                              {/* Ícones de Relacionamento */}
                              <SelectItem value="Users"><Users className="w-4 h-4 mr-2 inline" />Pessoas</SelectItem>
                              <SelectItem value="Handshake"><Handshake className="w-4 h-4 mr-2 inline" />Aperto de Mão</SelectItem>
                              <SelectItem value="MessageCircle"><MessageCircle className="w-4 h-4 mr-2 inline" />Conversa</SelectItem>
                              <SelectItem value="HelpCircle"><HelpCircle className="w-4 h-4 mr-2 inline" />Ajuda</SelectItem>

                              {/* Ícones de Crescimento */}
                              <SelectItem value="TrendingUp"><TrendingUp className="w-4 h-4 mr-2 inline" />Crescimento</SelectItem>
                              <SelectItem value="Award"><Award className="w-4 h-4 mr-2 inline" />Prêmio</SelectItem>
                              <SelectItem value="BookOpen"><BookOpen className="w-4 h-4 mr-2 inline" />Livro</SelectItem>

                              {/* Ícones de Natureza */}
                              <SelectItem value="Leaf"><Leaf className="w-4 h-4 mr-2 inline" />Folha</SelectItem>
                              <SelectItem value="Flower"><Flower className="w-4 h-4 mr-2 inline" />Flor</SelectItem>
                              <SelectItem value="TreePine"><TreePine className="w-4 h-4 mr-2 inline" />Árvore</SelectItem>

                              {/* Ícones de Orientação */}
                              <SelectItem value="Compass"><Compass className="w-4 h-4 mr-2 inline" />Bússola</SelectItem>
                              <SelectItem value="MapPin"><MapPin className="w-4 h-4 mr-2 inline" />Localização</SelectItem>

                              {/* Ícones de Tempo */}
                              <SelectItem value="Clock"><Clock className="w-4 h-4 mr-2 inline" />Relógio</SelectItem>
                              <SelectItem value="Timer"><Timer className="w-4 h-4 mr-2 inline" />Cronômetro</SelectItem>

                              {/* Ícones Adicionais */}
                              <SelectItem value="Puzzle"><Puzzle className="w-4 h-4 mr-2 inline" />Quebra-cabeça</SelectItem>
                              <SelectItem value="Palette"><Palette className="w-4 h-4 mr-2 inline" />Paleta</SelectItem>
                              <SelectItem value="Waves"><Waves className="w-4 h-4 mr-2 inline" />Ondas</SelectItem>
                              <SelectItem value="Mountain"><Mountain className="w-4 h-4 mr-2 inline" />Montanha</SelectItem>
                              <SelectItem value="Wind"><Wind className="w-4 h-4 mr-2 inline" />Vento</SelectItem>
                              <SelectItem value="Umbrella"><Umbrella className="w-4 h-4 mr-2 inline" />Guarda-chuva</SelectItem>
                              <SelectItem value="LifeBuoy"><LifeBuoy className="w-4 h-4 mr-2 inline" />Boia</SelectItem>
                              <SelectItem value="Home"><Home className="w-4 h-4 mr-2 inline" />Casa</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="iconColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cor do Ícone</FormLabel>
                        <div className="flex items-center space-x-2">
                          <FormControl>
                            <Input type="color" className="w-12 h-10" {...field} />
                          </FormControl>
                          <FormControl>
                            <Input placeholder="#ec4899" {...field} />
                          </FormControl>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          O fundo será automaticamente 20% mais suave
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Ativo</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Exibir esta especialidade
                            </div>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <FormLabel className="text-sm">Prioridade</FormLabel>
                    <div className="flex flex-col sm:flex-row gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={() => {
                          const currentOrder = form.getValues("order");
                          form.setValue("order", Math.max(0, currentOrder - 1));
                        }}
                      >
                        <ChevronUp className="w-3 h-3" />
                        <span className="hidden sm:inline ml-1">Subir</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={() => {
                          const currentOrder = form.getValues("order");
                          form.setValue("order", currentOrder + 1);
                        }}
                      >
                        <ChevronDown className="w-3 h-3" />
                        <span className="hidden sm:inline ml-1">Descer</span>
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground text-center">
                      Ordem: {form.watch("order")}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingItem ? "Atualizar" : "Criar"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          💡 <strong>Dica:</strong> Arraste e solte as especialidades para reordenar. A cor do fundo será automaticamente mais suave (20% da cor do ícone).
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={specialties.map(item => item.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {specialties
              .sort((a, b) => a.order - b.order)
              .map((specialty) => (
              <SortableSpecialtyItem 
                key={specialty.id} 
                specialty={specialty}
                onEdit={() => openEditDialog(specialty)}
                onDelete={() => deleteMutation.mutate(specialty.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {specialties.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Nenhuma especialidade cadastrada ainda.</p>
          <p className="text-sm">Clique em "Nova Especialidade" para começar.</p>
        </div>
      )}
    </div>
  );
}

function SortableSpecialtyItem({ specialty, onEdit, onDelete }: { 
  specialty: Specialty; 
  onEdit: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: specialty.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Função para converter cor hex em RGB e depois em tom mais suave
  const getSoftColor = (hexColor: string) => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const softR = Math.round(r * 0.2 + 255 * 0.8);
    const softG = Math.round(g * 0.2 + 255 * 0.8);
    const softB = Math.round(b * 0.2 + 255 * 0.8);
    return `rgb(${softR}, ${softG}, ${softB})`;
  };

  // Mapeamento de ícones
  const iconMap: Record<string, any> = {
    Brain, Heart, Users, Star, BookOpen, Award, Shield, Sun, Moon, Sparkles, Target,
    Handshake, HelpCircle, MessageCircle, Leaf, Flower, Compass, TrendingUp, Activity,
    Zap, Clock, MapPin, TreePine, Wind, Umbrella, LifeBuoy, Puzzle, Palette, Waves,
    Mountain, Timer, Home
  };

  const IconComponent = iconMap[specialty.icon] || Brain;
  const softBgColor = getSoftColor(specialty.iconColor);

  return (
    <Card ref={setNodeRef} style={style} className="p-4 cursor-move">
      <div className="flex justify-between items-start gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing mt-1 flex-shrink-0">
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>
          <div 
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: softBgColor }}
          >
            <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: specialty.iconColor }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h4 className="font-semibold text-sm sm:text-base truncate">{specialty.title}</h4>
              <Badge variant={specialty.isActive ? "default" : "secondary"} className="text-xs flex-shrink-0">
                {specialty.isActive ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{specialty.description}</p>
            <p className="text-xs text-gray-400 mt-1">Ordem: {specialty.order}</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
          <Button variant="outline" size="sm" onClick={onEdit} className="h-8 w-8 sm:w-auto p-0 sm:px-3">
            <Edit className="w-4 h-4" />
            <span className="hidden sm:inline ml-2">Editar</span>
          </Button>
          <Button variant="destructive" size="sm" onClick={onDelete} className="h-8 w-8 sm:w-auto p-0 sm:px-3">
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline ml-2">Excluir</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}
