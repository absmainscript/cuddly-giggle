
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, GripVertical, Users } from "lucide-react";
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

interface AboutCredentialsManagerProps {
  configs: SiteConfig[];
}

export function AboutCredentialsManager({ configs }: AboutCredentialsManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [localCredentials, setLocalCredentials] = useState<any[]>([]);

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

  // Buscar credenciais das configurações
  const aboutCredentials = configs?.find(c => c.key === 'about_credentials')?.value as any[] || [];

  // Atualiza credenciais locais quando dados mudam
  useEffect(() => {
    const sortedCredentials = [...aboutCredentials].sort((a, b) => a.order - b.order);
    setLocalCredentials(sortedCredentials);
  }, [aboutCredentials]);

  const credentialSchema = z.object({
    title: z.string().min(1, "Título é obrigatório"),
    subtitle: z.string().min(1, "Subtítulo é obrigatório"),
    gradient: z.string().min(1, "Gradiente é obrigatório"),
    isActive: z.boolean(),
    order: z.number().min(0),
  });

  type CredentialForm = z.infer<typeof credentialSchema>;

  const form = useForm<CredentialForm>({
    resolver: zodResolver(credentialSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      gradient: "from-pink-50 to-purple-50",
      isActive: true,
      order: 0,
    },
  });

  const updateCredentialsMutation = useMutation({
    mutationFn: async (newCredentials: any[]) => {
      const response = await apiRequest("POST", "/api/admin/config", {
        key: "about_credentials",
        value: newCredentials
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/config"] });
      toast({ title: "Credenciais atualizadas com sucesso!" });
      setIsDialogOpen(false);
      form.reset();
    },
  });

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id && over) {
      const oldIndex = localCredentials.findIndex((item) => item.id === active.id);
      const newIndex = localCredentials.findIndex((item) => item.id === over.id);
      
      const newCredentials = arrayMove(localCredentials, oldIndex, newIndex).map((item, index) => ({
        ...item,
        order: index
      }));
      
      setLocalCredentials(newCredentials);
      updateCredentialsMutation.mutate(newCredentials);
    }
  };

  const onSubmit = (data: CredentialForm) => {
    let newCredentials;
    
    if (editingItem) {
      // Editando item existente
      newCredentials = localCredentials.map(item => 
        item.id === editingItem.id ? { ...item, ...data } : item
      );
    } else {
      // Criando novo item
      const newId = Math.max(...localCredentials.map(c => c.id), 0) + 1;
      const newItem = {
        id: newId,
        ...data,
        order: localCredentials.length
      };
      newCredentials = [...localCredentials, newItem];
    }
    
    updateCredentialsMutation.mutate(newCredentials);
  };

  const openEditDialog = (credential: any) => {
    setEditingItem(credential);
    
    setTimeout(() => {
      form.setValue("title", credential.title || "");
      form.setValue("subtitle", credential.subtitle || "");
      form.setValue("gradient", credential.gradient || "from-pink-50 to-purple-50");
      form.setValue("isActive", credential.isActive ?? true);
      form.setValue("order", credential.order || 0);
    }, 100);
    
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingItem(null);
    form.reset({
      title: "",
      subtitle: "",
      gradient: "from-pink-50 to-purple-50",
      isActive: true,
      order: localCredentials.length,
    });
    setIsDialogOpen(true);
  };

  const deleteCredential = (id: number) => {
    const newCredentials = localCredentials
      .filter(item => item.id !== id)
      .map((item, index) => ({ ...item, order: index }));
    updateCredentialsMutation.mutate(newCredentials);
  };

  const gradientOptions = [
    { name: "Rosa para Roxo", value: "from-pink-50 to-purple-50" },
    { name: "Roxo para Índigo", value: "from-purple-50 to-indigo-50" },
    { name: "Verde para Teal", value: "from-green-50 to-teal-50" },
    { name: "Azul para Cyan", value: "from-blue-50 to-cyan-50" },
    { name: "Laranja para Vermelho", value: "from-orange-50 to-red-50" },
    { name: "Amarelo para Laranja", value: "from-yellow-50 to-orange-50" },
    { name: "Teal para Verde", value: "from-teal-50 to-green-50" },
    { name: "Índigo para Roxo", value: "from-indigo-50 to-purple-50" },
    { name: "Cinza para Slate", value: "from-gray-50 to-slate-50" },
    { name: "Rosa para Rosa Escuro", value: "from-pink-50 to-pink-100" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Credenciais da Seção Sobre</h3>
          <p className="text-sm text-muted-foreground">
            Cards que aparecem na seção sobre a psicóloga com formação, especializações, etc.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Credencial
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Editar Credencial" : "Nova Credencial"}
              </DialogTitle>
              <DialogDescription>
                Configure as informações da credencial
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título Principal</FormLabel>
                      <FormControl>
                        <Input placeholder="Centro Universitário Integrado" {...field} />
                      </FormControl>
                      <FormDescription>
                        Texto principal que aparece em destaque no card
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subtitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subtítulo/Categoria</FormLabel>
                      <FormControl>
                        <Input placeholder="Formação Acadêmica" {...field} />
                      </FormControl>
                      <FormDescription>
                        Categoria ou tipo da credencial (aparece menor abaixo do título)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gradient"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gradiente de Fundo</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Escolha um gradiente" />
                          </SelectTrigger>
                          <SelectContent>
                            {gradientOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center gap-2">
                                  <div 
                                    className={`w-4 h-4 rounded border bg-gradient-to-br ${option.value}`}
                                  />
                                  {option.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription>
                        Cor de fundo do card da credencial
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
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
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Ativo</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Exibir esta credencial
                          </div>
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
                  <Button type="submit" disabled={updateCredentialsMutation.isPending}>
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
          💡 <strong>Dica:</strong> Você pode arrastar e soltar as credenciais para reordenar sua exibição no site
        </p>
      </div>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={localCredentials.map(item => item.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {localCredentials.map((credential) => (
              <SortableCredentialItem 
                key={credential.id} 
                credential={credential}
                onEdit={() => openEditDialog(credential)}
                onDelete={() => deleteCredential(credential.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {localCredentials.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Nenhuma credencial cadastrada ainda.</p>
          <p className="text-sm">Clique em "Nova Credencial" para começar.</p>
        </div>
      )}
    </div>
  );
}

// Componente para item arrastável de credencial
function SortableCredentialItem({ credential, onEdit, onDelete }: { 
  credential: any; 
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
  } = useSortable({ id: credential.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className="p-4 cursor-move">
      <div className="flex justify-between items-start">
        <div className="flex-1 flex items-start gap-4">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing mt-1">
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div 
                className={`w-6 h-6 rounded bg-gradient-to-br ${credential.gradient} border`}
              />
              <h4 className="font-semibold">{credential.title}</h4>
              <Badge variant={credential.isActive ? "default" : "secondary"} className="text-xs">
                {credential.isActive ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{credential.subtitle}</p>
            <p className="text-xs text-gray-400 mt-1">Ordem: {credential.order}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
