
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Eye, EyeOff, Edit, Trash2, Plus, GripVertical, ChevronUp, ChevronDown, Brain, Heart, Users, Activity, Zap, Shield, Target, Sun, Moon, Star, Sparkles, MessageCircle, Handshake, HelpCircle, TrendingUp, Award, BookOpen, Leaf, Flower, TreePine, Wind, Umbrella, LifeBuoy, Puzzle, Waves, Mountain, Timer, Clock, MapPin, Palette, Compass, Home } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Service } from "@shared/schema";
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

interface ServicesManagerProps {
  services: Service[];
}

const serviceSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  duration: z.string().optional(),
  price: z.string().optional(),
  icon: z.string().min(1, "Ícone é obrigatório"),
  gradient: z.string().min(1, "Gradiente é obrigatório"),
  showPrice: z.boolean(),
  showDuration: z.boolean(),
  isActive: z.boolean(),
  order: z.number().min(0),
});

type ServiceForm = z.infer<typeof serviceSchema>;

export function ServicesManager({ services }: ServicesManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
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

  const form = useForm<ServiceForm>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      title: "",
      description: "",
      duration: "",
      price: "",
      icon: "Brain",
      gradient: "from-pink-500 to-purple-600",
      showPrice: true,
      showDuration: true,
      isActive: true,
      order: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ServiceForm) => {
      const response = await apiRequest("POST", "/api/admin/services", data);
      return response.json();
    },
    onSuccess: () => {
      // Delay query invalidation to prevent dialog closing
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
      }, 100);
      toast({ title: "Serviço criado com sucesso!" });
      setIsDialogOpen(false);
      form.reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ServiceForm> }) => {
      const response = await apiRequest("PUT", `/api/admin/services/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      // Delay query invalidation to prevent dialog closing
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
      }, 100);
      toast({ title: "Serviço atualizado com sucesso!" });
      setEditingService(null);
      setIsDialogOpen(false);
      form.reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/services/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
      toast({ title: "Serviço excluído com sucesso!" });
    },
  });
  
  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id && over) {
      const oldIndex = services.findIndex((item) => item.id === active.id);
      const newIndex = services.findIndex((item) => item.id === over.id);
      
      const reorderedServices = arrayMove(services, oldIndex, newIndex);
      
      const updatePromises = reorderedServices.map((item, index) => 
        apiRequest("PUT", `/api/admin/services/${item.id}`, { 
          order: index
        })
      );
      
      Promise.all(updatePromises).then(() => {
        // Delay query invalidation to prevent UI flickering
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
        }, 100);
        toast({ title: "Ordem dos serviços atualizada!" });
      }).catch(() => {
        toast({ title: "Erro ao atualizar ordem", variant: "destructive" });
      });
    }
  };

  const onSubmit = (data: ServiceForm) => {
    if (editingService) {
      updateMutation.mutate({ id: editingService.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const openEditDialog = (service: Service) => {
    setEditingService(service);
    
    setTimeout(() => {
      form.setValue("title", service.title || "");
      form.setValue("description", service.description || "");
      form.setValue("duration", service.duration || "");
      form.setValue("price", service.price || "");
      form.setValue("icon", service.icon || "Brain");
      form.setValue("gradient", service.gradient || "from-pink-500 to-purple-600");
      form.setValue("showPrice", service.showPrice ?? true);
      form.setValue("showDuration", service.showDuration ?? true);
      form.setValue("isActive", service.isActive ?? true);
      form.setValue("order", service.order || 0);
    }, 100);
    
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingService(null);
    form.reset({
      title: "",
      description: "",
      duration: "",
      price: "",
      icon: "Brain",
      gradient: "from-pink-500 to-purple-600",
      showPrice: true,
      showDuration: true,
      isActive: true,
      order: 0,
    });
    setIsDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Gerenciar Serviços
            </CardTitle>
            <CardDescription>
              Gerencie os serviços oferecidos exibidos no site
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Serviço
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingService ? "Editar Serviço" : "Novo Serviço"}
                </DialogTitle>
                <DialogDescription>
                  Preencha as informações do serviço
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
                          <Input placeholder="Terapia Individual" {...field} />
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
                          <Textarea placeholder="Atendimento psicológico individual..." rows={3} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duração</FormLabel>
                          <FormControl>
                            <Input placeholder="50 minutos" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preço</FormLabel>
                          <FormControl>
                            <Input placeholder="R$ 150,00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

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
                                <SelectItem value="Brain"><Brain className="w-4 h-4 mr-2 inline" />Cérebro (Terapia Individual)</SelectItem>
                                <SelectItem value="Heart"><Heart className="w-4 h-4 mr-2 inline" />Coração (Terapia de Casal)</SelectItem>
                                <SelectItem value="Users"><Users className="w-4 h-4 mr-2 inline" />Usuários (Terapia de Grupo)</SelectItem>
                                <SelectItem value="Activity"><Activity className="w-4 h-4 mr-2 inline" />Atividade (Terapia Comportamental)</SelectItem>
                                <SelectItem value="Zap"><Zap className="w-4 h-4 mr-2 inline" />Energia (Terapia Energética)</SelectItem>
                                <SelectItem value="Shield"><Shield className="w-4 h-4 mr-2 inline" />Escudo (Terapia de Proteção)</SelectItem>
                                <SelectItem value="Target"><Target className="w-4 h-4 mr-2 inline" />Alvo (Terapia Focada)</SelectItem>
                                <SelectItem value="Sun"><Sun className="w-4 h-4 mr-2 inline" />Sol (Terapia de Humor)</SelectItem>
                                <SelectItem value="Moon"><Moon className="w-4 h-4 mr-2 inline" />Lua (Terapia do Sono)</SelectItem>
                                <SelectItem value="Star"><Star className="w-4 h-4 mr-2 inline" />Estrela (Terapia de Objetivos)</SelectItem>
                                <SelectItem value="Sparkles"><Sparkles className="w-4 h-4 mr-2 inline" />Brilhos (Terapia de Autoconfiança)</SelectItem>
                                <SelectItem value="MessageCircle"><MessageCircle className="w-4 h-4 mr-2 inline" />Conversa (Terapia Dialógica)</SelectItem>
                                <SelectItem value="Handshake"><Handshake className="w-4 h-4 mr-2 inline" />Aperto de Mão (Terapia de Apoio)</SelectItem>
                                <SelectItem value="HelpCircle"><HelpCircle className="w-4 h-4 mr-2 inline" />Ajuda (Orientação Psicológica)</SelectItem>
                                <SelectItem value="TrendingUp"><TrendingUp className="w-4 h-4 mr-2 inline" />Crescimento (Desenvolvimento Pessoal)</SelectItem>
                                <SelectItem value="Award"><Award className="w-4 h-4 mr-2 inline" />Prêmio (Conquistas)</SelectItem>
                                <SelectItem value="BookOpen"><BookOpen className="w-4 h-4 mr-2 inline" />Livro (Aprendizagem)</SelectItem>
                                <SelectItem value="Leaf"><Leaf className="w-4 h-4 mr-2 inline" />Folha (Terapia Natural)</SelectItem>
                                <SelectItem value="Flower"><Flower className="w-4 h-4 mr-2 inline" />Flor (Terapia Floral)</SelectItem>
                                <SelectItem value="TreePine"><TreePine className="w-4 h-4 mr-2 inline" />Pinheiro (Terapia na Natureza)</SelectItem>
                                <SelectItem value="Wind"><Wind className="w-4 h-4 mr-2 inline" />Vento (Terapia Respiratória)</SelectItem>
                                <SelectItem value="Umbrella"><Umbrella className="w-4 h-4 mr-2 inline" />Guarda-chuva (Terapia Preventiva)</SelectItem>
                                <SelectItem value="LifeBuoy"><LifeBuoy className="w-4 h-4 mr-2 inline" />Boia (Terapia de Emergência)</SelectItem>
                                <SelectItem value="Home"><Home className="w-4 h-4 mr-2 inline" />Casa (Terapia Familiar)</SelectItem>
                                <SelectItem value="Puzzle"><Puzzle className="w-4 h-4 mr-2 inline" />Quebra-cabeça (Terapia Cognitiva)</SelectItem>
                                <SelectItem value="Palette"><Palette className="w-4 h-4 mr-2 inline" />Paleta (Arteterapia)</SelectItem>
                                <SelectItem value="Waves"><Waves className="w-4 h-4 mr-2 inline" />Ondas (Terapia Aquática)</SelectItem>
                                <SelectItem value="Mountain"><Mountain className="w-4 h-4 mr-2 inline" />Montanha (Terapia de Superação)</SelectItem>
                                <SelectItem value="Compass"><Compass className="w-4 h-4 mr-2 inline" />Bússola (Orientação de Vida)</SelectItem>
                                <SelectItem value="Clock"><Clock className="w-4 h-4 mr-2 inline" />Relógio (Terapia Breve)</SelectItem>
                                <SelectItem value="Timer"><Timer className="w-4 h-4 mr-2 inline" />Cronômetro (Sessões Programadas)</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gradient"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gradiente de Cor</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um gradiente" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="from-pink-500 to-purple-600">Rosa para Roxo</SelectItem>
                                <SelectItem value="from-purple-600 to-pink-500">Roxo para Rosa</SelectItem>
                                <SelectItem value="from-blue-500 to-indigo-600">Azul para Índigo</SelectItem>
                                <SelectItem value="from-green-500 to-teal-600">Verde para Teal</SelectItem>
                                <SelectItem value="from-orange-500 to-red-600">Laranja para Vermelho</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="showPrice"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Exibir Preço</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Mostrar o preço no site
                            </div>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="showDuration"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Exibir Duração</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Mostrar a duração no site
                            </div>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
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
                                Exibir este serviço no site
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
                      {editingService ? "Atualizar" : "Criar"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>Dica:</strong> Arraste e solte os serviços para reordenar a exibição no site.
          </p>
        </div>
        
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ordem</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <SortableContext 
                items={services.map(s => s.id)} 
                strategy={verticalListSortingStrategy}
              >
                {services
                  .sort((a, b) => a.order - b.order)
                  .map((service) => (
                    <SortableServiceItem
                      key={service.id}
                      service={service}
                      onEdit={openEditDialog}
                      onDelete={(id) => deleteMutation.mutate(id)}
                    />
                  ))}
              </SortableContext>
            </TableBody>
          </Table>
        </DndContext>
      </CardContent>
    </Card>
  );
}

function SortableServiceItem({ service, onEdit, onDelete }: { 
  service: Service; 
  onEdit: (service: Service) => void; 
  onDelete: (id: number) => void; 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: service.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell className="flex items-center gap-2">
        <div {...attributes} {...listeners} className="cursor-grab hover:cursor-grabbing">
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>
        <span className="font-medium">{service.title}</span>
      </TableCell>
      <TableCell>{service.duration}</TableCell>
      <TableCell>{service.price}</TableCell>
      <TableCell>
        <Badge variant={service.isActive ? "default" : "secondary"}>
          {service.isActive ? (
            <>
              <Eye className="w-3 h-3 mr-1" />
              Ativo
            </>
          ) : (
            <>
              <EyeOff className="w-3 h-3 mr-1" />
              Inativo
            </>
          )}
        </Badge>
      </TableCell>
      <TableCell>{service.order}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end space-x-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(service)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => onDelete(service.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
