import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { SiteConfig } from "@shared/schema";

interface SpecialtiesSectionTextsFormProps {
  configs: SiteConfig[];
}

export function SpecialtiesSectionTextsForm({ configs }: SpecialtiesSectionTextsFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const specialtiesTextsSchema = z.object({
    title: z.string().min(1, "Título é obrigatório"),
    subtitle: z.string().min(1, "Subtítulo é obrigatório"),
    badge: z.string().min(1, "Badge é obrigatório"),
  });

  type SpecialtiesTextsForm = z.infer<typeof specialtiesTextsSchema>;

  const getSpecialtiesTextsData = () => {
    const specialtiesSection = configs?.find(c => c.key === 'specialties_section')?.value as any || {};

    return {
      title: specialtiesSection.title || "Minhas (Especialidades)",
      subtitle: specialtiesSection.subtitle || "Áreas de atuação onde posso te ajudar",
      badge: specialtiesSection.badge || "ESPECIALIDADES",
    };
  };

  const form = useForm<SpecialtiesTextsForm>({
    resolver: zodResolver(specialtiesTextsSchema),
    defaultValues: getSpecialtiesTextsData(),
  });

  React.useEffect(() => {
    if (configs && configs.length > 0) {
      const newData = getSpecialtiesTextsData();
      form.reset(newData);
    }
  }, [configs, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: SpecialtiesTextsForm) => {
      await apiRequest("POST", "/api/admin/config", {
        key: "specialties_section",
        value: {
          title: data.title,
          subtitle: data.subtitle,
          badge: data.badge,
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/config"] });
      toast({ title: "Textos da seção Especialidades atualizados com sucesso!" });
    },
  });

  const onSubmit = (data: SpecialtiesTextsForm) => {
    updateMutation.mutate(data);
  };

  return (
    <div className="space-y-4">
      <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
        <p className="text-sm text-purple-800">
          🎨 Use (palavra) para aplicar cores degradê automáticas nos títulos. Exemplo: "Minhas (Especialidades)"
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título da Seção</FormLabel>
                <FormControl>
                  <Input placeholder="Minhas (Especialidades)" {...field} />
                </FormControl>
                <FormDescription>
                  Título principal da seção de especialidades. Use (palavra) para efeito degradê.
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
                <FormLabel>Subtítulo da Seção</FormLabel>
                <FormControl>
                  <Input placeholder="Áreas de atuação onde posso te ajudar" {...field} />
                </FormControl>
                <FormDescription>
                  Subtítulo explicativo que aparece abaixo do título
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="badge"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Badge da Seção</FormLabel>
                <FormControl>
                  <Input placeholder="ESPECIALIDADES" {...field} />
                </FormControl>
                <FormDescription>
                  Texto do badge que aparece acima do título
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Salvando..." : "Salvar Textos da Seção Especialidades"}
          </Button>
        </form>
      </Form>
    </div>
  );
}