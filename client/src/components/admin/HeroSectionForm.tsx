
import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { SiteConfig } from "@shared/schema";

interface HeroSectionFormProps {
  configs: SiteConfig[];
}

export function HeroSectionForm({ configs }: HeroSectionFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const heroSchema = z.object({
    title: z.string().min(1, "Título é obrigatório"),
    subtitle: z.string().min(1, "Subtítulo é obrigatório"),
    buttonText1: z.string().min(1, "Texto do botão 1 é obrigatório"),
    buttonText2: z.string().min(1, "Texto do botão 2 é obrigatório"),
  });

  type HeroForm = z.infer<typeof heroSchema>;

  const getHeroData = () => {
    const heroSection = configs?.find(c => c.key === 'hero_section')?.value as any || {};
    
    return {
      title: heroSection.title || "Cuidando da sua saúde mental com carinho",
      subtitle: heroSection.subtitle || "Psicóloga especializada em terapia cognitivo-comportamental",
      buttonText1: heroSection.buttonText1 || "Agendar consulta",
      buttonText2: heroSection.buttonText2 || "Saiba mais",
    };
  };

  const form = useForm<HeroForm>({
    resolver: zodResolver(heroSchema),
    defaultValues: getHeroData(),
  });

  React.useEffect(() => {
    if (configs && configs.length > 0) {
      const newData = getHeroData();
      form.reset(newData);
    }
  }, [configs, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: HeroForm) => {
      await apiRequest("POST", "/api/admin/config", {
        key: "hero_section",
        value: data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/config"] });
      toast({ title: "Seção Hero atualizada com sucesso!" });
    },
  });

  const onSubmit = (data: HeroForm) => {
    updateMutation.mutate(data);
  };

  return (
    <div className="space-y-4">
      <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
        <p className="text-sm text-purple-800">
          🎨 Use (palavra) para aplicar cores degradê automáticas nos títulos. Exemplo: "Cuidando da sua (saúde mental)"
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título Principal ()</FormLabel>
                <FormControl>
                  <Input placeholder="Cuidando da sua saúde mental com carinho" {...field} />
                </FormControl>
                <FormDescription>
                  Frase de impacto que define sua abordagem profissional. Use (palavra) para efeito degradê.
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
                <FormLabel>Subtítulo</FormLabel>
                <FormControl>
                  <Textarea placeholder="Psicóloga especializada em terapia cognitivo-comportamental..." rows={3} {...field} />
                </FormControl>
                <FormDescription>
                  Descrição mais detalhada sobre sua especialização e abordagem terapêutica
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="buttonText1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Texto Botão 1 (Principal)</FormLabel>
                  <FormControl>
                    <Input placeholder="Agendar consulta" {...field} />
                  </FormControl>
                  <FormDescription>
                    Botão principal que leva para a seção de contato
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="buttonText2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Texto Botão 2 (Secundário)</FormLabel>
                  <FormControl>
                    <Input placeholder="Saiba mais" {...field} />
                  </FormControl>
                  <FormDescription>
                    Botão que rola a página para a seção "Sobre"
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Salvando..." : "Salvar Seção Hero"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
