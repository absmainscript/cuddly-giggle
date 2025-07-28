
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

interface SchedulingCardFormProps {
  configs: SiteConfig[];
}

const schedulingCardSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  subtitle: z.string().min(1, "Subtítulo é obrigatório"),
  description: z.string().optional(),
  buttonText: z.string().min(1, "Texto do botão é obrigatório"),
});

type SchedulingCardForm = z.infer<typeof schedulingCardSchema>;

export function SchedulingCardForm({ configs }: SchedulingCardFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getConfigValue = (key: string) => {
    const config = configs.find(c => c.key === key);
    return config ? config.value : {};
  };

  const schedulingCard = getConfigValue('scheduling_card') as any;

  const form = useForm<SchedulingCardForm>({
    resolver: zodResolver(schedulingCardSchema),
    defaultValues: {
      title: schedulingCard.title || "Vamos conversar?",
      subtitle: schedulingCard.subtitle || "Agende sua consulta",
      description: schedulingCard.description || "Estou aqui para te ajudar a encontrar o equilíbrio emocional",
      buttonText: schedulingCard.buttonText || "Falar no WhatsApp",
    },
  });

  React.useEffect(() => {
    if (schedulingCard && Object.keys(schedulingCard).length > 0) {
      form.reset({
        title: schedulingCard.title || "Vamos conversar?",
        subtitle: schedulingCard.subtitle || "Agende sua consulta",
        description: schedulingCard.description || "Estou aqui para te ajudar a encontrar o equilíbrio emocional",
        buttonText: schedulingCard.buttonText || "Falar no WhatsApp",
      });
    }
  }, [schedulingCard, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: SchedulingCardForm) => {
      const response = await apiRequest("POST", "/api/admin/config", {
        key: "scheduling_card",
        value: data
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/config"] });
      toast({ title: "Card de agendamento atualizado com sucesso!" });
    },
  });

  const onSubmit = (data: SchedulingCardForm) => {
    updateMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título Principal ()</FormLabel>
              <FormControl>
                <Input placeholder="Vamos conversar?" {...field} />
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
              <FormLabel>Subtítulo ()</FormLabel>
              <FormControl>
                <Input placeholder="Agende sua consulta" {...field} />
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição (Opcional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Estou aqui para te ajudar a encontrar o equilíbrio emocional" 
                  rows={3} 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="buttonText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Texto do Botão</FormLabel>
              <FormControl>
                <Input placeholder="Falar no WhatsApp" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? "Salvando..." : "Salvar Card"}
        </Button>
      </form>
    </Form>
  );
}
