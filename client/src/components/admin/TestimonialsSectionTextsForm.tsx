
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

interface TestimonialsSectionTextsFormProps {
  configs: SiteConfig[];
}

const testimonialsTextsSchema = z.object({
  badge: z.string().min(1, "Badge é obrigatório"),
  title: z.string().min(1, "Título é obrigatório"),
  subtitle: z.string().min(1, "Subtítulo é obrigatório"),
  description: z.string().optional(),
});

type TestimonialsTextsForm = z.infer<typeof testimonialsTextsSchema>;

export function TestimonialsSectionTextsForm({ configs }: TestimonialsSectionTextsFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getConfigValue = (key: string) => {
    const config = configs.find(c => c.key === key);
    return config ? config.value : {};
  };

  const testimonialsTexts = getConfigValue('testimonials_section') as any;

  const form = useForm<TestimonialsTextsForm>({
    resolver: zodResolver(testimonialsTextsSchema),
    defaultValues: {
      badge: testimonialsTexts.badge || "DEPOIMENTOS",
      title: testimonialsTexts.title || "O que dizem sobre (mim)",
      subtitle: testimonialsTexts.subtitle || "Depoimentos reais",
      description: testimonialsTexts.description || "Veja o que meus pacientes falam sobre o atendimento",
    },
  });

  React.useEffect(() => {
    if (testimonialsTexts && Object.keys(testimonialsTexts).length > 0) {
      form.reset({
        badge: testimonialsTexts.badge || "DEPOIMENTOS",
        title: testimonialsTexts.title || "O que dizem sobre (mim)",
        subtitle: testimonialsTexts.subtitle || "Depoimentos reais", 
        description: testimonialsTexts.description || "Veja o que meus pacientes falam sobre o atendimento",
      });
    }
  }, [testimonialsTexts, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: TestimonialsTextsForm) => {
      const response = await apiRequest("POST", "/api/admin/config", {
        key: "testimonials_section",
        value: data
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/config"] });
      toast({ title: "Textos da seção de depoimentos atualizados com sucesso!" });
    },
  });

  const onSubmit = (data: TestimonialsTextsForm) => {
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
              <FormLabel>Badge/Subtítulo</FormLabel>
              <FormControl>
                <Input placeholder="DEPOIMENTOS" {...field} />
              </FormControl>
              <div className="text-xs text-muted-foreground">
                Texto que aparece acima do título principal
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
                <Input placeholder="O que dizem sobre (mim)" {...field} />
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
                <Input placeholder="Depoimentos reais" {...field} />
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
                  placeholder="Veja o que meus pacientes falam sobre o atendimento" 
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
