
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, GripVertical, Image } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PhotoCarouselImageUpload } from "@/components/admin/PhotoCarouselImageUpload";
import type { PhotoCarousel } from "@shared/schema";
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

interface PhotoCarouselManagerProps {
  photoCarousel: PhotoCarousel[];
}

export function PhotoCarouselManager({ photoCarousel }: PhotoCarouselManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingPhoto, setEditingPhoto] = useState<PhotoCarousel | null>(null);
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

  const photoSchema = z.object({
    title: z.string().min(1, "Título é obrigatório"),
    description: z.string().optional(),
    imageUrl: z.string().min(1, "Imagem é obrigatória"),
    showText: z.boolean(),
    isActive: z.boolean(),
    order: z.number().min(0),
  });

  type PhotoForm = z.infer<typeof photoSchema>;

  const form = useForm<PhotoForm>({
    resolver: zodResolver(photoSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      showText: true,
      isActive: true,
      order: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: PhotoForm) => {
      const response = await apiRequest("POST", "/api/admin/photo-carousel", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/photo-carousel"] });
      queryClient.invalidateQueries({ queryKey: ["/api/photo-carousel"] });
      toast({ title: "Foto criada com sucesso!" });
      setIsDialogOpen(false);
      form.reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<PhotoForm> }) => {
      const response = await apiRequest("PUT", `/api/admin/photo-carousel/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/photo-carousel"] });
      queryClient.invalidateQueries({ queryKey: ["/api/photo-carousel"] });
      toast({ title: "Foto atualizada com sucesso!" });
      setEditingPhoto(null);
      setIsDialogOpen(false);
      form.reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/photo-carousel/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/photo-carousel"] });
      queryClient.invalidateQueries({ queryKey: ["/api/photo-carousel"] });
      toast({ title: "Foto excluída com sucesso!" });
    },
  });

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id && over) {
      const oldIndex = photoCarousel.findIndex((item) => item.id === active.id);
      const newIndex = photoCarousel.findIndex((item) => item.id === over.id);
      
      const newOrder = arrayMove(photoCarousel, oldIndex, newIndex);
      
      const updatePromises = newOrder.map((item, index) => 
        apiRequest("PUT", `/api/admin/photo-carousel/${item.id}`, { 
          order: index
        })
      );
      
      Promise.all(updatePromises).then(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/photo-carousel"] });
        queryClient.invalidateQueries({ queryKey: ["/api/photo-carousel"] });
        toast({ title: "Ordem das fotos atualizada!" });
      }).catch(() => {
        toast({ title: "Erro ao atualizar ordem", variant: "destructive" });
      });
    }
  };

  const onSubmit = (data: PhotoForm) => {
    if (editingPhoto) {
      updateMutation.mutate({ id: editingPhoto.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const openEditDialog = (photo: PhotoCarousel) => {
    setEditingPhoto(photo);
    
    setTimeout(() => {
      form.setValue("title", photo.title || "");
      form.setValue("description", photo.description || "");
      form.setValue("imageUrl", photo.imageUrl || "");
      form.setValue("showText", photo.showText ?? true);
      form.setValue("isActive", photo.isActive ?? true);
      form.setValue("order", photo.order || 0);
    }, 100);
    
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingPhoto(null);
    form.reset();
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Fotos do Carrossel</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie as fotos exibidas na galeria do consultório
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Foto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingPhoto ? "Editar Foto" : "Nova Foto"}
              </DialogTitle>
              <DialogDescription>
                Configure as informações da foto
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
                        <Input placeholder="Sala de Atendimento" {...field} />
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
                      <FormLabel>Descrição (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Ambiente acolhedor e confortável..." rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Image className="w-4 h-4" />
                        Imagem
                      </FormLabel>
                      <FormControl>
                        <PhotoCarouselImageUpload 
                          value={field.value} 
                          onChange={field.onChange} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="order"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ordem</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="showText"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Exibir Texto</FormLabel>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
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
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingPhoto ? "Atualizar" : "Criar"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={photoCarousel.map(item => item.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {photoCarousel
              .sort((a, b) => a.order - b.order)
              .map((photo) => (
              <SortablePhotoItem 
                key={photo.id} 
                photo={photo}
                onEdit={() => openEditDialog(photo)}
                onDelete={() => deleteMutation.mutate(photo.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {photoCarousel.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Image className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Nenhuma foto cadastrada ainda.</p>
          <p className="text-sm">Clique em "Nova Foto" para começar.</p>
        </div>
      )}
    </div>
  );
}

function SortablePhotoItem({ photo, onEdit, onDelete }: { 
  photo: PhotoCarousel; 
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
  } = useSortable({ id: photo.id });

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
          {photo.imageUrl && (
            <img 
              src={photo.imageUrl} 
              alt={photo.title}
              className="w-16 h-12 sm:w-20 sm:h-16 rounded object-cover border flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h4 className="font-semibold text-sm sm:text-base truncate">{photo.title}</h4>
              <Badge variant={photo.isActive ? "default" : "secondary"} className="text-xs flex-shrink-0">
                {photo.isActive ? "Ativo" : "Inativo"}
              </Badge>
              {photo.showText && (
                <Badge variant="outline" className="text-xs flex-shrink-0">
                  Com Texto
                </Badge>
              )}
            </div>
            {photo.description && (
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{photo.description}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">Ordem: {photo.order}</p>
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
