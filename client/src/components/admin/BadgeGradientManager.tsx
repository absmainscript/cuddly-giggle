
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Sparkles, Info } from "lucide-react";
import type { SiteConfig } from "@shared/schema";
import { BADGE_GRADIENTS } from "@/utils/textGradient";

interface BadgeGradientManagerProps {
  configs: SiteConfig[];
}

const badgeGradientSchema = z.object({
  gradient: z.string().min(1, "Selecione um gradiente"),
});

type BadgeGradientForm = z.infer<typeof badgeGradientSchema>;

export function BadgeGradientManager({ configs }: BadgeGradientManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtém a configuração atual de gradiente dos badges
  const getBadgeGradient = () => {
    const badgeConfig = configs?.find(c => c.key === 'badge_gradient')?.value as any;
    return badgeConfig?.gradient || 'pink-purple';
  };

  const form = useForm<BadgeGradientForm>({
    resolver: zodResolver(badgeGradientSchema),
    defaultValues: {
      gradient: getBadgeGradient(),
    },
  });

  React.useEffect(() => {
    form.setValue('gradient', getBadgeGradient());
  }, [configs, form]);

  const updateBadgeGradientMutation = useMutation({
    mutationFn: async (data: BadgeGradientForm) => {
      await apiRequest("POST", "/api/admin/config", {
        key: "badge_gradient",
        value: { gradient: data.gradient }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/config"] });
      toast({ 
        title: "Gradiente dos badges atualizado!", 
        description: "Todas as palavras entre parênteses agora usarão o novo gradiente." 
      });
    },
  });

  const onSubmit = (data: BadgeGradientForm) => {
    updateBadgeGradientMutation.mutate(data);
  };

  // Opções de gradientes organizadas
  const gradientOptions = [
    { category: "Feminino & Delicado", gradients: [
      { key: 'pink-purple', name: 'Rosa → Roxo', preview: 'from-pink-500 to-purple-600' },
      { key: 'rose-pink', name: 'Rose → Rosa', preview: 'from-rose-500 to-pink-600' },
      { key: 'fuchsia-pink', name: 'Fúcsia → Rosa', preview: 'from-fuchsia-500 to-pink-600' },
      { key: 'violet-purple', name: 'Violeta → Roxo', preview: 'from-violet-500 to-purple-600' },
    ]},
    { category: "Profissional & Confiança", gradients: [
      { key: 'blue-purple', name: 'Azul → Roxo', preview: 'from-blue-500 to-purple-600' },
      { key: 'indigo-purple', name: 'Índigo → Roxo', preview: 'from-indigo-500 to-purple-600' },
      { key: 'sky-blue', name: 'Céu → Azul', preview: 'from-sky-500 to-blue-600' },
      { key: 'cyan-blue', name: 'Ciano → Azul', preview: 'from-cyan-500 to-blue-600' },
    ]},
    { category: "Natureza & Bem-estar", gradients: [
      { key: 'green-blue', name: 'Verde → Azul', preview: 'from-green-500 to-blue-600' },
      { key: 'emerald-teal', name: 'Esmeralda → Turquesa', preview: 'from-emerald-500 to-teal-600' },
      { key: 'teal-cyan', name: 'Turquesa → Ciano', preview: 'from-teal-500 to-cyan-600' },
      { key: 'lime-green', name: 'Lima → Verde', preview: 'from-lime-500 to-green-600' },
    ]},
    { category: "Energia & Vitalidade", gradients: [
      { key: 'orange-red', name: 'Laranja → Vermelho', preview: 'from-orange-500 to-red-600' },
      { key: 'amber-orange', name: 'Âmbar → Laranja', preview: 'from-amber-500 to-orange-600' },
      { key: 'yellow-orange', name: 'Amarelo → Laranja', preview: 'from-yellow-500 to-orange-600' },
    ]},
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Gradientes dos Badges
        </CardTitle>
        <CardDescription>
          Configure o gradiente aplicado nos badges minimalistas das seções e nas palavras entre parênteses nos títulos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Explicação sobre badges com botão de fechar */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 relative">
          <button
            onClick={() => {/* Aqui você pode adicionar lógica para ocultar permanentemente */}}
            className="absolute top-2 right-2 text-blue-600 hover:text-blue-800 transition-colors"
            aria-label="Fechar explicação"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex items-start gap-3 pr-6">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-900 mb-2">O que são os Badges?</h4>
              <p className="text-sm text-blue-700 leading-relaxed mb-2">
                Os <strong>badges</strong> são palavras especiais que aparecem destacadas com gradientes coloridos nos títulos das seções. 
                Qualquer texto colocado entre parênteses <code className="bg-blue-100 px-1 rounded">(assim)</code> será automaticamente 
                transformado em um badge com gradiente.
              </p>
              <p className="text-sm text-blue-700 leading-relaxed">
                <strong>Exemplo:</strong> "Histórias de (transformação)" → "Histórias de <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent font-semibold">transformação</span>"
              </p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="gradient"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Escolha o Gradiente Global</FormLabel>
                  <FormDescription>
                    Este gradiente será aplicado em todos os badges (palavras entre parênteses) do site
                  </FormDescription>
                  
                  <div className="space-y-4">
                    {gradientOptions.map((category) => (
                      <div key={category.category} className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">{category.category}</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {category.gradients.map((gradient) => (
                            <button
                              key={gradient.key}
                              type="button"
                              onClick={() => field.onChange(gradient.key)}
                              className={`p-3 rounded-lg border-2 transition-all text-left ${
                                field.value === gradient.key
                                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <div 
                                  className={`w-4 h-4 rounded-full bg-gradient-to-r ${gradient.preview}`}
                                />
                                <span className="text-xs font-medium">{gradient.name}</span>
                              </div>
                              <div className="text-xs text-gray-500">
                                Exemplo: <span className={`bg-gradient-to-r ${gradient.preview} bg-clip-text text-transparent font-semibold`}>
                                  palavra
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preview do gradiente selecionado */}
            <div className="bg-gray-50 border rounded-lg p-4">
              <h4 className="text-sm font-medium mb-2">Preview do Gradiente Selecionado:</h4>
              <div className="text-lg">
                Histórias de <span className={`bg-gradient-to-r ${BADGE_GRADIENTS[form.watch('gradient') as keyof typeof BADGE_GRADIENTS]} bg-clip-text text-transparent font-semibold`}>
                  transformação
                </span>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={updateBadgeGradientMutation.isPending}>
                {updateBadgeGradientMutation.isPending ? "Salvando..." : "Aplicar Gradiente"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
