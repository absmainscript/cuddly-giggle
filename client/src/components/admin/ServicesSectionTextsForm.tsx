
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { SiteConfig } from "@shared/schema";

interface ServicesSectionTextsFormProps {
  configs: SiteConfig[];
}

const servicesTextsSchema = z.object({
  badge: z.string().min(1, "Badge é obrigatório"),
  title: z.string().min(1, "Título é obrigatório"),
  subtitle: z.string().optional(),
  description: z.string().optional(),
});

type ServicesTextsForm = z.infer<typeof servicesTextsSchema>;

export function ServicesSectionTextsForm({ configs }: ServicesSectionTextsFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getConfigValue = (key: string) => {
    const config = configs.find(c => c.key === key);
    return config ? config.value : {};
  };

  const servicesTexts = getConfigValue('services_section') as any;

  const form = useForm<ServicesTextsForm>({
    resolver: zodResolver(servicesTextsSchema),
    defaultValues: {
      badge: servicesTexts.badge || "SERVIÇOS",
      title: servicesTexts.title || "Como posso ajudar você?",
      subtitle: servicesTexts.subtitle || "",
      description: servicesTexts.description || "Oferecendo cuidado personalizado e especializado para cada momento da sua jornada de crescimento pessoal",
    },
  });

  React.useEffect(() => {
    if (servicesTexts && Object.keys(servicesTexts).length > 0) {
      form.reset({
        badge: servicesTexts.badge || "SERVIÇOS",
        title: servicesTexts.title || "Como posso ajudar você?",
        subtitle: servicesTexts.subtitle || "",
        description: servicesTexts.description || "Oferecendo cuidado personalizado e especializado para cada momento da sua jornada de crescimento pessoal",
      });
    }
  }, [servicesTexts, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: ServicesTextsForm) => {
      const response = await apiRequest("POST", "/api/admin/config", {
        key: "services_section",
        value: data
      });
      return response.json();
    },
    onSuccess: () => {
      // Invalidar queries de configuração
      queryClient.invalidateQueries({ queryKey: ["/api/admin/config"] });
      queryClient.invalidateQueries({ queryKey: ["/api/config"] });

      // Resetar o formulário com os novos dados
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ["/api/admin/config"] });
        queryClient.refetchQueries({ queryKey: ["/api/config"] });
      }, 100);
      
      toast({ title: "Textos da seção de serviços atualizados com sucesso!" });
    },
  });

  const onSubmit = (data: ServicesTextsForm) => {
    updateMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="badge"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Badge (Pequeno texto acima do título)</FormLabel>
              <FormControl>
                <Input placeholder="SERVIÇOS" {...field} />
              </FormControl>
              <div className="text-xs text-muted-foreground">
                Use () para destacar palavras com gradiente
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título Principal ()</FormLabel>
              <FormControl>
                <Input placeholder="Como posso ajudar você?" {...field} />
              </FormControl>
              <div className="text-xs text-muted-foreground">
                Use () para destacar palavras com gradiente. Ex: (palavra) ficará colorida
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="subtitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subtítulo (Opcional - aparece entre o título e descrição)</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Cuidado personalizado para cada momento" {...field} />
              </FormControl>
              <div className="text-xs text-muted-foreground">
                Este texto aparecerá entre o título principal e a descrição da seção
              </div>
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
                <Textarea 
                  placeholder="Oferecendo cuidado personalizado e especializado para cada momento da sua jornada de crescimento pessoal" 
                  rows={3} 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? "Salvando..." : "Salvar Textos"}
        </Button>
      </form>
    </Form>
  );
}
