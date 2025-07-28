
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus, GripVertical } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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

interface FooterManagerProps {
  footerSettings: any;
}

const generalSchema = z.object({
  description: z.string().min(1, "Descrição é obrigatória"),
  cnpj: z.string().min(1, "CNPJ é obrigatório"),
  showCnpj: z.boolean(),
  copyright: z.string().min(1, "Copyright é obrigatório"),
  certificationText: z.string().min(1, "Texto de certificações é obrigatório"),
});

const contactButtonSchema = z.object({
  label: z.string().min(1, "Label é obrigatório"),
  link: z.string().min(1, "Link é obrigatório"),
  icon: z.string().min(1, "Ícone é obrigatório"),
  gradient: z.string().min(1, "Gradiente é obrigatório"),
  isActive: z.boolean(),
});

type ContactButtonForm = z.infer<typeof contactButtonSchema>;

export function FooterManager({ footerSettings }: FooterManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingContact, setEditingContact] = useState<any | null>(null);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);

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

  const footerData = footerSettings || {};
  const generalInfo = footerData.general_info || {};
  const contactButtons = footerData.contact_buttons || [];
  const bottomInfo = footerData.bottom_info || {};

  const updateFooterSettings = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", "/api/admin/footer-settings", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/footer-settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/footer-settings"] });
      toast({ title: "Configurações do rodapé atualizadas com sucesso!" });
    },
  });

  const generalForm = useForm({
    resolver: zodResolver(generalSchema),
    defaultValues: {
      description: generalInfo.description || "Cuidando da sua saúde mental com carinho e dedicação",
      cnpj: generalInfo.cnpj || "12.345.678/0001-90",
      showCnpj: generalInfo.showCnpj ?? true,
      copyright: bottomInfo.copyright || "© 2024 Dra. Adrielle Benhossi • Todos os direitos reservados",
      certificationText: bottomInfo.certificationText || "Registrada no Conselho Federal de Psicologia<br/>Sigilo e ética profissional",
    },
  });

  const contactForm = useForm<ContactButtonForm>({
    resolver: zodResolver(contactButtonSchema),
    defaultValues: {
      label: "",
      link: "",
      icon: "",
      gradient: "",
      isActive: true,
    },
  });

  const onSubmitGeneral = (data: any) => {
    const updates = {
      general_info: {
        description: data.description,
        cnpj: data.cnpj,
        showCnpj: data.showCnpj,
      },
      bottom_info: {
        copyright: data.copyright,
        certificationText: data.certificationText,
      }
    };
    updateFooterSettings.mutate(updates);
  };

  const onSubmitContact = (data: ContactButtonForm) => {
    let updatedButtons;
    
    if (editingContact) {
      // Editando botão existente
      updatedButtons = contactButtons.map((button: any) => 
        button.id === editingContact.id 
          ? { ...button, ...data }
          : button
      );
    } else {
      // Criando novo botão
      const newButton = {
        id: Date.now(), // ID temporário
        type: data.label.toLowerCase().replace(/\s+/g, '_'),
        ...data,
        order: contactButtons.length,
      };
      updatedButtons = [...contactButtons, newButton];
    }

    updateFooterSettings.mutate({ contact_buttons: updatedButtons });
    setIsContactDialogOpen(false);
    setEditingContact(null);
    contactForm.reset();
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id && over) {
      const oldIndex = contactButtons.findIndex((item: any) => item.id === active.id);
      const newIndex = contactButtons.findIndex((item: any) => item.id === over.id);
      
      const reorderedButtons = arrayMove(contactButtons, oldIndex, newIndex);
      
      // Atualizar ordem
      const updatedButtons = reorderedButtons.map((button: any, index: number) => ({
        ...button,
        order: index
      }));
      
      updateFooterSettings.mutate({ contact_buttons: updatedButtons });
    }
  };

  const openEditDialog = (button: any) => {
    setEditingContact(button);
    
    // Resetar e preencher o formulário
    setTimeout(() => {
      contactForm.setValue("label", button.label || "");
      contactForm.setValue("link", button.link || "");
      contactForm.setValue("icon", button.icon || "");
      contactForm.setValue("gradient", button.gradient || "");
      contactForm.setValue("isActive", button.isActive ?? true);
    }, 100);
    
    setIsContactDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingContact(null);
    contactForm.reset();
    setIsContactDialogOpen(true);
  };

  const deleteButton = (buttonId: number) => {
    const updatedButtons = contactButtons.filter((button: any) => button.id !== buttonId);
    updateFooterSettings.mutate({ contact_buttons: updatedButtons });
  };

  const iconOptions = [
    { value: "FaWhatsapp", label: "WhatsApp", icon: "💬" },
    { value: "FaInstagram", label: "Instagram", icon: "📷" },
    { value: "FaLinkedin", label: "LinkedIn", icon: "💼" },
    { value: "FaFacebook", label: "Facebook", icon: "👥" },
    { value: "FaTwitter", label: "Twitter", icon: "🐦" },
  ];

  const gradientOptions = [
    { name: "Verde WhatsApp", value: "from-green-400 to-green-500" },
    { name: "Rosa Instagram", value: "from-purple-400 to-pink-500" },
    { name: "Azul LinkedIn", value: "from-blue-500 to-blue-600" },
    { name: "Azul Facebook", value: "from-blue-600 to-blue-700" },
    { name: "Azul Twitter", value: "from-blue-400 to-blue-500" },
    { name: "Roxo Personalizado", value: "from-purple-500 to-purple-600" },
    { name: "Rosa Personalizado", value: "from-pink-500 to-pink-600" },
  ];

  return (
    <div className="space-y-8">
      {/* Informações Gerais */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Gerais do Rodapé</CardTitle>
          <CardDescription>
            Configure os textos principais, CNPJ e informações de copyright
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...generalForm}>
            <form onSubmit={generalForm.handleSubmit(onSubmitGeneral)} className="space-y-4">
              <FormField
                control={generalForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição Principal</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Descrição que aparece abaixo do nome da psicóloga" rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={generalForm.control}
                  name="cnpj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNPJ</FormLabel>
                      <FormControl>
                        <Input placeholder="12.345.678/0001-90" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={generalForm.control}
                  name="showCnpj"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Exibir CNPJ</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Mostrar CNPJ no rodapé
                        </div>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={generalForm.control}
                name="copyright"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Texto de Copyright</FormLabel>
                    <FormControl>
                      <Input placeholder="© 2024 Dra. Adrielle Benhossi..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={generalForm.control}
                name="certificationText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Texto de Certificações</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Registrada no Conselho Federal de Psicologia..." 
                        rows={3} 
                        {...field} 
                      />
                    </FormControl>
                    <div className="text-xs text-muted-foreground">
                      Use &lt;br/&gt; para quebrar linhas. Aparece abaixo dos ícones de certificação.
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Salvar Informações Gerais</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Botões de Contato */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Botões de Contato</CardTitle>
              <CardDescription>
                Configure os botões de redes sociais e contato do rodapé
              </CardDescription>
            </div>
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Botão
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              💡 <strong>Dica:</strong> Arraste e solte os botões para reordenar por importância.
            </p>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={contactButtons.map((button: any) => button.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-4">
                {contactButtons
                  .sort((a: any, b: any) => a.order - b.order)
                  .map((button: any) => (
                    <SortableContactButton 
                      key={button.id} 
                      button={button}
                      iconOptions={iconOptions}
                      onEdit={() => openEditDialog(button)}
                      onDelete={() => deleteButton(button.id)}
                    />
                  ))}
              </div>
            </SortableContext>
          </DndContext>

          {contactButtons.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhum botão de contato cadastrado ainda.</p>
              <p className="text-sm">Clique em "Novo Botão" para começar.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para editar botões de contato */}
      <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingContact ? "Editar Botão de Contato" : "Novo Botão de Contato"}
            </DialogTitle>
          </DialogHeader>
          <Form {...contactForm}>
            <form onSubmit={contactForm.handleSubmit(onSubmitContact)} className="space-y-4">
              <FormField
                control={contactForm.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Label</FormLabel>
                    <FormControl>
                      <Input placeholder="WhatsApp" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={contactForm.control}
                name="link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link</FormLabel>
                    <FormControl>
                      <Input placeholder="https://wa.me/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={contactForm.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ícone</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um ícone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {iconOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.icon} {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={contactForm.control}
                name="gradient"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gradiente</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um gradiente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {gradientOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={contactForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Ativo</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Exibir este botão no rodapé
                      </div>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => {
                  setIsContactDialogOpen(false);
                  setEditingContact(null);
                  contactForm.reset();
                }}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingContact ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SortableContactButton({ 
  button, 
  iconOptions, 
  onEdit, 
  onDelete 
}: { 
  button: any; 
  iconOptions: any[];
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
  } = useSortable({ id: button.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className="p-4 cursor-move">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3 flex-1">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>
          <div className={`w-8 h-8 bg-gradient-to-r ${button.gradient} rounded-lg flex items-center justify-center`}>
            <span className="text-white text-sm">
              {iconOptions.find(icon => icon.value === button.icon)?.icon || "📧"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold">{button.label}</h4>
            <p className="text-sm text-muted-foreground truncate">{button.link}</p>
            <p className="text-xs text-gray-400">Ordem: {button.order}</p>
          </div>
          <Badge variant={button.isActive ? "default" : "secondary"}>
            {button.isActive ? "Ativo" : "Inativo"}
          </Badge>
        </div>
        <div className="flex gap-2 flex-shrink-0">
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
