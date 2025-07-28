
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { SiteConfig } from "@shared/schema";

interface ContactSectionFormProps {
  configs: SiteConfig[];
}

const contactSectionSchema = z.object({
  badge: z.string().min(1, "Badge é obrigatório"),
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
});

type ContactSectionForm = z.infer<typeof contactSectionSchema>;

export function ContactSectionForm({ configs }: ContactSectionFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getConfigValue = (key: string) => {
    const config = configs.find(c => c.key === key);
    return config ? config.value : {};
  };

  const contactSection = getConfigValue('contact_section') as any;

  const form = useForm<ContactSectionForm>({
    resolver: zodResolver(contactSectionSchema),
    defaultValues: {
      badge: contactSection.badge || "AGENDAMENTO",
      title: contactSection.title || "Vamos conversar?",
      description: contactSection.description || "Se algo dentro de você pede cuidado, atenção ou simplesmente um espaço para respirar — estou aqui.",
    },
  });

  React.useEffect(() => {
    if (contactSection && Object.keys(contactSection).length > 0) {
      form.reset({
        badge: contactSection.badge || "AGENDAMENTO",
        title: contactSection.title || "Vamos conversar?",
        description: contactSection.description || "Se algo dentro de você pede cuidado, atenção ou simplesmente um espaço para respirar — estou aqui.",
      });
    }
  }, [contactSection, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: ContactSectionForm) => {
      const response = await apiRequest("POST", "/api/admin/config", {
        key: "contact_section",
        value: data
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/config"] });
      toast({ title: "Seção de contato atualizada com sucesso!" });
    },
  });

  const onSubmit = (data: ContactSectionForm) => {
    updateMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="badge"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Badge (texto pequeno acima do título)</FormLabel>
              <FormControl>
                <Input placeholder="Ex: AGENDAMENTO" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título Principal</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Vamos conversar?" {...field} />
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
                <Textarea 
                  placeholder="Ex: Se algo dentro de você pede cuidado, atenção ou simplesmente um espaço para respirar — estou aqui."
                  rows={3}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          disabled={updateMutation.isPending}
          className="w-full"
        >
          {updateMutation.isPending ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </form>
    </Form>
  );
}
