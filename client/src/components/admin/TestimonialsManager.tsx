import React, { useState, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus, GripVertical, Star } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Testimonial } from "@shared/schema";
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

interface TestimonialsManagerProps {
  testimonials: Testimonial[];
}

const testimonialSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  service: z.string().min(1, "Serviço é obrigatório"),
  testimonial: z.string().min(1, "Depoimento é obrigatório"),
  gender: z.string().min(1, "Gênero é obrigatório"),
  rating: z.number().min(1).max(5),
  isActive: z.boolean(),
  order: z.number().min(0),
  photo: z.string().optional(),
});

type TestimonialForm = z.infer<typeof testimonialSchema>;

export function TestimonialsManager({ testimonials }: TestimonialsManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessingMutation, setIsProcessingMutation] = useState(false);

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

  const form = useForm<TestimonialForm>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      name: "",
      service: "",
      testimonial: "",
      gender: "feminino",
      rating: 5,
      isActive: true,
      order: 0,
      photo: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: TestimonialForm) => {
      setIsProcessingMutation(true);
      const response = await apiRequest("POST", "/api/admin/testimonials", data);
      return response.json();
    },
    onSuccess: (newTestimonial) => {
      toast({ title: "Depoimento criado com sucesso!" });
      
      // Atualizar cache manualmente sem invalidar
      queryClient.setQueryData(["/api/admin/testimonials"], (old: Testimonial[] = []) => {
        return [...old, newTestimonial].sort((a, b) => a.order - b.order);
      });
      
      queryClient.setQueryData(["/api/testimonials"], (old: Testimonial[] = []) => {
        if (newTestimonial.isActive) {
          return [...old, newTestimonial].sort((a, b) => a.order - b.order);
        }
        return old;
      });
      
      // Fechar diálogo
      setIsDialogOpen(false);
      setEditingTestimonial(null);
      form.reset({
        name: "",
        service: "",
        testimonial: "",
        gender: "feminino",
        rating: 5,
        isActive: true,
        order: 0,
        photo: "",
      });
      
      setIsProcessingMutation(false);
    },
    onError: () => {
      setIsProcessingMutation(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<TestimonialForm> }) => {
      setIsProcessingMutation(true);
      const response = await apiRequest("PUT", `/api/admin/testimonials/${id}`, data);
      return response.json();
    },
    onSuccess: (updatedTestimonial) => {
      toast({ title: "Depoimento atualizado com sucesso!" });
      
      // Atualizar cache manualmente sem invalidar
      queryClient.setQueryData(["/api/admin/testimonials"], (old: Testimonial[] = []) => {
        return old.map(t => t.id === updatedTestimonial.id ? updatedTestimonial : t);
      });
      
      queryClient.setQueryData(["/api/testimonials"], (old: Testimonial[] = []) => {
        if (updatedTestimonial.isActive) {
          const filtered = old.filter(t => t.id !== updatedTestimonial.id);
          return [...filtered, updatedTestimonial].sort((a, b) => a.order - b.order);
        } else {
          return old.filter(t => t.id !== updatedTestimonial.id);
        }
      });
      
      // Fechar diálogo
      setIsDialogOpen(false);
      setEditingTestimonial(null);
      form.reset({
        name: "",
        service: "",
        testimonial: "",
        gender: "feminino",
        rating: 5,
        isActive: true,
        order: 0,
        photo: "",
      });
      
      setIsProcessingMutation(false);
    },
    onError: () => {
      setIsProcessingMutation(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/testimonials/${id}`);
      return response.json();
    },
    onSuccess: (_, deletedId) => {
      toast({ title: "Depoimento excluído com sucesso!" });
      
      // Atualizar cache manualmente sem invalidar
      queryClient.setQueryData(["/api/admin/testimonials"], (old: Testimonial[] = []) => {
        return old.filter(t => t.id !== deletedId);
      });
      
      queryClient.setQueryData(["/api/testimonials"], (old: Testimonial[] = []) => {
        return old.filter(t => t.id !== deletedId);
      });
    }
  });

  const handleDragEnd = useCallback((event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id && over) {
      const oldIndex = testimonials.findIndex((item) => item.id === active.id);
      const newIndex = testimonials.findIndex((item) => item.id === over.id);

      const reorderedTestimonials = arrayMove(testimonials, oldIndex, newIndex);

      const updatePromises = reorderedTestimonials.map((item, index) => 
        apiRequest("PUT", `/api/admin/testimonials/${item.id}`, { 
          order: index
        })
      );

      Promise.all(updatePromises).then(() => {
        toast({ title: "Ordem dos depoimentos atualizada!" });
        
        // Atualizar cache manualmente sem invalidar
        queryClient.setQueryData(["/api/admin/testimonials"], (old: Testimonial[] = []) => {
          return reorderedTestimonials;
        });
        
        queryClient.setQueryData(["/api/testimonials"], (old: Testimonial[] = []) => {
          return reorderedTestimonials.filter(t => t.isActive);
        });
      }).catch(() => {
        toast({ title: "Erro ao atualizar ordem", variant: "destructive" });
      });
    }
  }, [testimonials, queryClient, toast]);

  const onSubmit = (data: TestimonialForm) => {
    console.log("Dados do formulário:", data);
    if (editingTestimonial) {
      console.log("Atualizando depoimento ID:", editingTestimonial.id);
      updateMutation.mutate({ id: editingTestimonial.id, data });
    } else {
      console.log("Criando novo depoimento");
      createMutation.mutate(data);
    }
  };

  const openEditDialog = useCallback((testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setIsDialogOpen(true);

    // Reset form com os valores do depoimento após um pequeno delay
    setTimeout(() => {
      form.reset({
        name: testimonial.name || "",
        service: testimonial.service || "",
        testimonial: testimonial.testimonial || "",
        gender: testimonial.gender || "feminino",
        rating: testimonial.rating || 5,
        isActive: testimonial.isActive ?? true,
        order: testimonial.order || 0,
        photo: testimonial.photo || "",
      });
    }, 100);
  }, [form]);

  const openCreateDialog = useCallback(() => {
    setEditingTestimonial(null);
    setIsDialogOpen(true);
    
    setTimeout(() => {
      form.reset({
        name: "",
        service: "",
        testimonial: "",
        gender: "feminino",
        rating: 5,
        isActive: true,
        order: testimonials.length,
        photo: "",
      });
    }, 100);
  }, [form, testimonials.length]);

  

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Gerenciar Depoimentos</h3>
          <p className="text-sm text-muted-foreground">
            Adicione, edite e organize os depoimentos dos seus pacientes
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          // Prevenção absoluta de fechamento automático durante mutações
          if (!open && !isProcessingMutation && !createMutation.isPending && !updateMutation.isPending) {
            // Para edição, sempre confirma antes de fechar
            if (editingTestimonial) {
              const hasChanges = 
                form.getValues("name") !== editingTestimonial.name ||
                form.getValues("service") !== editingTestimonial.service ||
                form.getValues("testimonial") !== editingTestimonial.testimonial;
              
              if (hasChanges && !confirm("Há alterações não salvas. Deseja realmente fechar?")) {
                return; // Não fecha o diálogo
              }
            }
            setIsDialogOpen(false);
            setEditingTestimonial(null);
            form.reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Depoimento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTestimonial ? "Editar Depoimento" : "Novo Depoimento"}
              </DialogTitle>
              <DialogDescription>
                Configure as informações do depoimento
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Cliente</FormLabel>
                        <FormControl>
                          <Input placeholder="Maria Silva" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="service"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Serviço Utilizado</FormLabel>
                        <FormControl>
                          <Input placeholder="Terapia Individual" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="testimonial"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Texto do Depoimento</FormLabel>
                      <FormControl>
                        <Textarea placeholder="O atendimento foi excelente e me ajudou muito..." rows={4} {...field} />
                      </FormControl>
                      <div className="text-xs text-muted-foreground">
                        Este é o texto principal que aparecerá no depoimento
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gênero</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="feminino">👩 Feminino</SelectItem>
                              <SelectItem value="masculino">👨 Masculino</SelectItem>
                              <SelectItem value="casal">👫 Casal</SelectItem>
                              <SelectItem value="man-adult">👨‍💼 Homem Adulto</SelectItem>
                              <SelectItem value="woman-adult">👩‍💼 Mulher Adulta</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Avaliação (Estrelas)</FormLabel>
                        <FormControl>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value.toString()}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5">⭐⭐⭐⭐⭐ (5 estrelas)</SelectItem>
                              <SelectItem value="4">⭐⭐⭐⭐ (4 estrelas)</SelectItem>
                              <SelectItem value="3">⭐⭐⭐ (3 estrelas)</SelectItem>
                              <SelectItem value="2">⭐⭐ (2 estrelas)</SelectItem>
                              <SelectItem value="1">⭐ (1 estrela)</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                 <FormField
                  control={form.control}
                  name="photo"
                  render={({ field: { value, onChange, ...fieldProps } }) => (
                    <FormItem>
                      <FormLabel>Foto (Opcional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              onChange(file.name);
                            } else {
                              onChange("");
                            }
                          }}
                          {...fieldProps}
                        />
                      </FormControl>
                      <div className="text-xs text-muted-foreground">
                        Adicione uma foto personalizada para o depoimento (opcional)
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Ativo</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Exibir este depoimento no site
                        </div>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsDialogOpen(false);
                      setEditingTestimonial(null);
                      form.reset();
                    }}
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {createMutation.isPending || updateMutation.isPending 
                      ? "Salvando..." 
                      : editingTestimonial ? "Atualizar" : "Criar"
                    }
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          💡 <strong>Dica:</strong> Arraste e solte os depoimentos para reordenar a exibição no site.
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={testimonials.map(item => item.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {testimonials
              .sort((a, b) => a.order - b.order)
              .map((testimonial) => (
              <SortableTestimonialItem 
                key={testimonial.id} 
                testimonial={testimonial}
                onEdit={() => openEditDialog(testimonial)}
                onDelete={() => deleteMutation.mutate(testimonial.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {testimonials.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Nenhum depoimento cadastrado ainda.</p>
          <p className="text-sm">Clique em "Novo Depoimento" para começar.</p>
        </div>
      )}
    </div>
  );
}

function SortableTestimonialItem({ testimonial, onEdit, onDelete }: { 
  testimonial: Testimonial; 
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
  } = useSortable({ id: testimonial.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className="p-4 cursor-move">
      <div className="flex justify-between items-start gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing mt-1 flex-shrink-0">
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h4 className="font-semibold text-sm sm:text-base truncate">{testimonial.name}</h4>
              <Badge variant={testimonial.isActive ? "default" : "secondary"} className="text-xs flex-shrink-0">
                {testimonial.isActive ? "Ativo" : "Inativo"}
              </Badge>
              <div className="flex">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-1">{testimonial.service}</p>
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{testimonial.testimonial}</p>
            <p className="text-xs text-gray-400 mt-1">Ordem: {testimonial.order}</p>
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