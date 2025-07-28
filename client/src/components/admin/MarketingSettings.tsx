
import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { TrendingUp, Globe, Search, Ban } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { SiteConfig } from "@shared/schema";

export function MarketingSettings({ configs }: { configs: SiteConfig[] }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const marketingSchema = z.object({
    facebookPixel1: z.string().optional(),
    facebookPixel2: z.string().optional(),
    googlePixel: z.string().optional(),
    enableGoogleIndexing: z.boolean().default(true),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    metaKeywords: z.string().optional(),
  });

  type MarketingForm = z.infer<typeof marketingSchema>;

  // Extrair valores das configurações de forma segura
  const getMarketingData = () => {
    const marketingInfo = configs?.find(c => c.key === 'marketing_pixels')?.value as any || {};
    const seoInfo = configs?.find(c => c.key === 'seo_meta')?.value as any || {};
    
    return {
      facebookPixel1: marketingInfo.facebookPixel1 || "",
      facebookPixel2: marketingInfo.facebookPixel2 || "",
      googlePixel: marketingInfo.googlePixel || "",
      enableGoogleIndexing: marketingInfo.enableGoogleIndexing ?? true,
      metaTitle: seoInfo.metaTitle || "Dra. Adrielle Benhossi - Psicóloga em Campo Mourão | Terapia Online e Presencial",
      metaDescription: seoInfo.metaDescription || "Psicóloga CRP 08/123456 em Campo Mourão. Atendimento presencial e online. Especialista em terapia cognitivo-comportamental para seu bem-estar emocional.",
      metaKeywords: seoInfo.metaKeywords || "psicóloga, Campo Mourão, terapia online, consulta psicológica, saúde mental, CRP, terapia cognitivo-comportamental",
    };
  };

  const form = useForm<MarketingForm>({
    resolver: zodResolver(marketingSchema),
    defaultValues: getMarketingData(),
  });

  // Atualiza o formulário quando as configurações mudam
  React.useEffect(() => {
    if (configs && configs.length > 0) {
      const newData = getMarketingData();
      form.reset(newData);
    }
  }, [configs, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: MarketingForm) => {
      const promises = [
        // Atualiza as configurações de marketing
        apiRequest("POST", "/api/admin/config", {
          key: 'marketing_pixels',
          value: {
            facebookPixel1: data.facebookPixel1,
            facebookPixel2: data.facebookPixel2,
            googlePixel: data.googlePixel,
            enableGoogleIndexing: data.enableGoogleIndexing,
          }
        }),
        // Atualiza as configurações de SEO
        apiRequest("POST", "/api/admin/config", {
          key: 'seo_meta',
          value: {
            metaTitle: data.metaTitle,
            metaDescription: data.metaDescription,
            metaKeywords: data.metaKeywords,
          }
        })
      ];
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/config"] });
      toast({ title: "Configurações de marketing salvas com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao salvar configurações", variant: "destructive" });
    },
  });

  const onSubmit = (data: MarketingForm) => {
    updateMutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Configurações de Marketing
        </CardTitle>
        <CardDescription>
          Configure os pixels de rastreamento para Facebook e Google Ads
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Informações sobre pixels */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">📊 O que são Pixels de Rastreamento?</h4>
          <div className="text-sm text-blue-800 space-y-2">
            <p>
              Os pixels são códigos que permitem rastrear visitantes do seu site para criar campanhas publicitárias mais eficazes.
            </p>
            <div className="grid md:grid-cols-2 gap-4 mt-3">
              <div className="bg-white p-3 rounded border border-blue-100">
                <h5 className="font-medium text-blue-900">🔵 Facebook Pixel</h5>
                <p className="text-xs mt-1">
                  Rastreia visitantes para criar públicos personalizados e anúncios direcionados no Facebook e Instagram.
                </p>
              </div>
              <div className="bg-white p-3 rounded border border-blue-100">
                <h5 className="font-medium text-blue-900">🟢 Google Pixel</h5>
                <p className="text-xs mt-1">
                  Coleta dados para otimizar campanhas no Google Ads usando inteligência artificial para encontrar clientes ideais.
                </p>
              </div>
            </div>
            <p className="text-xs mt-3 font-medium">
              💡 <strong>Dica:</strong> Com estes pixels configurados, seu gestor de tráfego pode usar IA para otimizar anúncios automaticamente e encontrar pessoas similares aos seus melhores clientes.
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Facebook Pixels */}
            <div className="space-y-4">
              <h4 className="font-medium text-blue-900 flex items-center gap-2">
                <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">f</span>
                </div>
                Facebook Pixels (até 2)
              </h4>
              
              <FormField
                control={form.control}
                name="facebookPixel1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facebook Pixel #1 (Principal)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: 1234567890123456" 
                        {...field} 
                        className="font-mono"
                      />
                    </FormControl>
                    <div className="text-xs text-muted-foreground">
                      Encontre seu Pixel ID no Facebook Business Manager → Eventos → Pixels
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="facebookPixel2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facebook Pixel #2 (Opcional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: 9876543210987654" 
                        {...field} 
                        className="font-mono"
                      />
                    </FormControl>
                    <div className="text-xs text-muted-foreground">
                      Segundo pixel para campanhas específicas ou backup
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="googlePixel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-red-500 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">G</span>
                    </div>
                    Google Analytics / Google Ads ID
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: G-XXXXXXXXXX ou AW-XXXXXXXXX" 
                      {...field} 
                      className="font-mono"
                    />
                  </FormControl>
                  <div className="text-xs text-muted-foreground">
                    Use G-XXXXXXXXXX para Google Analytics ou AW-XXXXXXXXX para Google Ads
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Controle de Indexação Google */}
            <FormField
              control={form.control}
              name="enableGoogleIndexing"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-2">
                      <FormLabel className="text-base flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Permitir Indexação no Google
                      </FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Controla se o site aparece nos resultados de busca do Google
                      </div>
                    </div>
                    <FormControl>
                      <Switch 
                        checked={field.value} 
                        onCheckedChange={field.onChange} 
                      />
                    </FormControl>
                  </div>
                  
                  {!field.value && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Ban className="w-5 h-5 text-red-600 mt-0.5" />
                        <div>
                          <h5 className="font-medium text-red-900">⚠️ Indexação Desabilitada</h5>
                          <p className="text-sm text-red-800 mt-1">
                            Com esta opção desativada, o arquivo robots.txt impedirá que o Google e outros mecanismos de busca indexem seu site. 
                            Isso significa que seu site <strong>NÃO aparecerá</strong> nos resultados de pesquisa orgânica.
                          </p>
                          <p className="text-xs text-red-700 mt-2">
                            💡 Use apenas durante desenvolvimento ou se desejar manter o site privado para buscadores.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {field.value && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Search className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <h5 className="font-medium text-green-900">✅ Indexação Habilitada</h5>
                          <p className="text-sm text-green-800 mt-1">
                            Seu site será indexado pelo Google e aparecerá nos resultados de busca. 
                            Isso é essencial para SEO e visibilidade online.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Seção de SEO */}
            <div className="border-t pt-6 mt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                🔍 SEO e Meta Informações
              </h4>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="metaTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título da Página (SEO)</FormLabel>
                      <FormControl>
                        <Input placeholder="Dra. Adrielle Benhossi - Psicóloga em Campo Mourão | Terapia Online e Presencial" {...field} />
                      </FormControl>
                      <div className="text-xs text-muted-foreground">
                        Aparece na aba do navegador e nos resultados do Google (recomendado: até 60 caracteres)
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="metaDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição da Página (SEO)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Psicóloga CRP 08/123456 em Campo Mourão. Atendimento presencial e online. Especialista em terapia cognitivo-comportamental para seu bem-estar emocional." rows={3} {...field} />
                      </FormControl>
                      <div className="text-xs text-muted-foreground">
                        Aparece nos resultados do Google abaixo do título (recomendado: até 160 caracteres)
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="metaKeywords"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Palavras-chave (SEO)</FormLabel>
                      <FormControl>
                        <Input placeholder="psicóloga, Campo Mourão, terapia online, consulta psicológica, saúde mental, CRP" {...field} />
                      </FormControl>
                      <div className="text-xs text-muted-foreground">
                        Palavras separadas por vírgula que descrevem seu conteúdo
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Salvando..." : "Salvar Configurações"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
