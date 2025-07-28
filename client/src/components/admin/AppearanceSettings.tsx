
import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Palette } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { SiteConfig } from "@shared/schema";

export function AppearanceSettings({ configs }: { configs: SiteConfig[] }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getConfigValue = (key: string) => {
    const config = configs.find(c => c.key === key);
    return config ? config.value : {};
  };

  const colorsConfig = getConfigValue('colors') as any;

  const appearanceSchema = z.object({
    primary: z.string().min(1, "Cor primária é obrigatória"),
    secondary: z.string().min(1, "Cor secundária é obrigatória"),
    accent: z.string().min(1, "Cor de destaque é obrigatória"),
    background: z.string().min(1, "Background é obrigatório"),
  });

  // Presets de cores pastéis femininas
  const colorPresets = {
    primary: [
      { name: "Rosa Vibrante", value: "#ec4899" },
      { name: "Coral Suave", value: "#fb7185" },
      { name: "Pêssego", value: "#fb923c" },
      { name: "Lavanda", value: "#a855f7" },
      { name: "Rosa Bebê", value: "#f472b6" },
      { name: "Salmão", value: "#f87171" }
    ],
    secondary: [
      { name: "Roxo Suave", value: "#8b5cf6" },
      { name: "Lilás", value: "#a78bfa" },
      { name: "Rosa Claro", value: "#f9a8d4" },
      { name: "Azul Pastel", value: "#7dd3fc" },
      { name: "Verde Mint", value: "#6ee7b7" },
      { name: "Amarelo Suave", value: "#fde047" }
    ],
    accent: [
      { name: "Índigo", value: "#6366f1" },
      { name: "Violeta", value: "#8b5cf6" },
      { name: "Rosa Escuro", value: "#e11d48" },
      { name: "Azul Royal", value: "#3b82f6" },
      { name: "Verde Esmeralda", value: "#10b981" },
      { name: "Laranja Vibrante", value: "#f97316" }
    ]
  };

  type AppearanceForm = z.infer<typeof appearanceSchema>;

  const form = useForm<AppearanceForm>({
    resolver: zodResolver(appearanceSchema),
    defaultValues: {
      primary: "#ec4899",
      secondary: "#8b5cf6", 
      accent: "#6366f1",
      background: "linear-gradient(135deg, hsl(276, 100%, 95%) 0%, hsl(339, 100%, 95%) 50%, hsl(276, 100%, 95%) 100%)",
    },
  });

  // Popula o formulário com as cores atuais quando os dados chegam
  React.useEffect(() => {
    if (colorsConfig && Object.keys(colorsConfig).length > 0) {
      console.log("Carregando configurações de cores:", colorsConfig);
      form.setValue("primary", colorsConfig.primary || "#ec4899");
      form.setValue("secondary", colorsConfig.secondary || "#8b5cf6");
      form.setValue("accent", colorsConfig.accent || "#6366f1");
      form.setValue("background", colorsConfig.background || "linear-gradient(135deg, hsl(276, 100%, 95%) 0%, hsl(339, 100%, 95%) 50%, hsl(276, 100%, 95%) 100%)");
    }
  }, [colorsConfig, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: AppearanceForm) => {
      const response = await apiRequest("POST", "/api/admin/config", {
        key: "colors",
        value: data
      });
      return response.json();
    },
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/config"] });
      
      // Aplica as cores dinamicamente ao site
      applyColorsToSite(variables);
      
      toast({ title: "Configurações de aparência atualizadas com sucesso!" });
    },
  });

  // Função para aplicar cores dinamicamente ao site
  const applyColorsToSite = (colors: AppearanceForm) => {
    const root = document.documentElement;
    
    // Converte hex para HSL para compatibilidade
    const hexToHsl = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s = 0, l = (max + min) / 2;
      
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }
      
      return `${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%`;
    };
    
    // Aplica as cores personalizadas
    root.style.setProperty('--coral', colors.primary);
    root.style.setProperty('--purple-soft', colors.secondary);
    root.style.setProperty('--primary', `hsl(${hexToHsl(colors.primary)})`);
    
    // Atualiza background gradient se especificado
    if (colors.background.includes('gradient')) {
      const style = document.createElement('style');
      style.innerHTML = `.gradient-bg { background: ${colors.background} !important; }`;
      document.head.appendChild(style);
    }
  };

  const onSubmit = (data: AppearanceForm) => {
    updateMutation.mutate(data);
  };

  const presetBackgrounds = [
    {
      name: "Rosa para Roxo (Atual)",
      value: "linear-gradient(135deg, hsl(276, 100%, 95%) 0%, hsl(339, 100%, 95%) 50%, hsl(276, 100%, 95%) 100%)"
    },
    {
      name: "Roxo para Rosa",
      value: "linear-gradient(135deg, hsl(339, 100%, 95%) 0%, hsl(276, 100%, 95%) 50%, hsl(339, 100%, 95%) 100%)"
    },
    {
      name: "Pêssego Suave",
      value: "linear-gradient(135deg, hsl(20, 100%, 94%) 0%, hsl(35, 100%, 92%) 50%, hsl(20, 100%, 94%) 100%)"
    },
    {
      name: "Lavanda Dreamy",
      value: "linear-gradient(135deg, hsl(260, 60%, 92%) 0%, hsl(280, 70%, 95%) 50%, hsl(260, 60%, 92%) 100%)"
    },
    {
      name: "Rosa Coral",
      value: "linear-gradient(135deg, hsl(350, 80%, 92%) 0%, hsl(15, 85%, 90%) 50%, hsl(350, 80%, 92%) 100%)"
    },
    {
      name: "Mint Fresh",
      value: "linear-gradient(135deg, hsl(160, 70%, 90%) 0%, hsl(180, 65%, 92%) 50%, hsl(160, 70%, 90%) 100%)"
    },
    {
      name: "Céu Pastel",
      value: "linear-gradient(135deg, hsl(200, 80%, 92%) 0%, hsl(220, 75%, 94%) 50%, hsl(200, 80%, 92%) 100%)"
    },
    {
      name: "Sunset Warm",
      value: "linear-gradient(135deg, hsl(45, 90%, 88%) 0%, hsl(25, 85%, 85%) 50%, hsl(45, 90%, 88%) 100%)"
    },
    {
      name: "Lilás Soft",
      value: "linear-gradient(135deg, hsl(290, 50%, 90%) 0%, hsl(310, 55%, 92%) 50%, hsl(290, 50%, 90%) 100%)"
    },
    {
      name: "Gradiente Animado - Aurora",
      value: "linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)",
      animated: true,
      css: `
        background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
        background-size: 400% 400%;
        animation: aurora-gradient 15s ease infinite;
      `
    },
    {
      name: "Gradiente Animado - Sunset",
      value: "linear-gradient(-45deg, #ff9a9e, #fecfef, #fecfef, #ff9a9e)",
      animated: true,
      css: `
        background: linear-gradient(-45deg, #ff9a9e, #fecfef, #fecfef, #ff9a9e);
        background-size: 400% 400%;
        animation: sunset-gradient 12s ease infinite;
      `
    },
    {
      name: "Gradiente Animado - Ocean",
      value: "linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #f5576c)",
      animated: true,
      css: `
        background: linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #f5576c);
        background-size: 400% 400%;
        animation: ocean-gradient 18s ease infinite;
      `
    },
    {
      name: "Gradiente Animado - Primavera",
      value: "linear-gradient(-45deg, #a8edea, #fed6e3, #d299c2, #fef9d7)",
      animated: true,
      css: `
        background: linear-gradient(-45deg, #a8edea, #fed6e3, #d299c2, #fef9d7);
        background-size: 400% 400%;
        animation: spring-gradient 20s ease infinite;
      `
    },
    {
      name: "Neutro Elegante",
      value: "linear-gradient(135deg, hsl(0, 0%, 98%) 0%, hsl(0, 0%, 96%) 50%, hsl(0, 0%, 98%) 100%)"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Configurações de Aparência
        </CardTitle>
        <CardDescription>
          Personalize as cores e o visual do site
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Cores Principais - Layout Simplificado */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="primary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Cor Primária</FormLabel>
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <Input type="color" className="w-12 h-10 flex-shrink-0" {...field} />
                          <Input placeholder="#ec4899" className="flex-1" {...field} />
                        </div>
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        Botões principais e títulos em destaque
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="secondary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Cor Secundária</FormLabel>
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <Input type="color" className="w-12 h-10 flex-shrink-0" {...field} />
                          <Input placeholder="#8b5cf6" className="flex-1" {...field} />
                        </div>
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        Gradientes e fundos de cartões
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Cor de Destaque</FormLabel>
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <Input type="color" className="w-12 h-10 flex-shrink-0" {...field} />
                          <Input placeholder="#6366f1" className="flex-1" {...field} />
                        </div>
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        Hover e efeitos visuais especiais
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Presets de Cores Rápidos */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Paletas Rápidas</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { name: "Rosa Vibrante", primary: "#ec4899", secondary: "#8b5cf6", accent: "#6366f1" },
                    { name: "Coral Suave", primary: "#fb7185", secondary: "#a78bfa", accent: "#3b82f6" },
                    { name: "Lavanda Dreamy", primary: "#a855f7", secondary: "#f9a8d4", accent: "#e11d48" },
                    { name: "Mint Fresh", primary: "#10b981", secondary: "#6ee7b7", accent: "#059669" },
                    { name: "Ocean Blue", primary: "#3b82f6", secondary: "#7dd3fc", accent: "#1d4ed8" },
                    { name: "Sunset Warm", primary: "#f97316", secondary: "#fde047", accent: "#ea580c" }
                  ].map((palette) => (
                    <button
                      key={palette.name}
                      type="button"
                      onClick={() => {
                        form.setValue("primary", palette.primary);
                        form.setValue("secondary", palette.secondary);
                        form.setValue("accent", palette.accent);
                      }}
                      className="p-3 rounded-lg border hover:border-gray-300 transition-all text-left group"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-4 h-4 rounded border" style={{ backgroundColor: palette.primary }} />
                        <div className="w-4 h-4 rounded border" style={{ backgroundColor: palette.secondary }} />
                        <div className="w-4 h-4 rounded border" style={{ backgroundColor: palette.accent }} />
                      </div>
                      <div className="text-xs font-medium">{palette.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="background"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Background Gradiente</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="linear-gradient(...)" 
                      rows={3} 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <label className="text-sm font-medium">Presets de Background ✨</label>
              <div className="text-sm text-muted-foreground">
                Inclui gradientes animados que trocam de cor automaticamente!
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
                {presetBackgrounds.map((preset) => (
                  <Button
                    key={preset.name}
                    type="button"
                    variant="outline"
                    className="h-auto p-3 flex flex-col items-start space-y-2"
                    onClick={() => form.setValue("background", preset.value)}
                  >
                    <div 
                      className="w-full h-8 rounded border"
                      style={{ 
                        background: preset.value,
                        backgroundSize: preset.animated ? "400% 400%" : "100% 100%"
                      }}
                    />
                    <div className="flex flex-col items-start w-full">
                      <span className="text-xs font-medium">{preset.name}</span>
                      {preset.animated && (
                        <span className="text-xs text-purple-600">🌈 Gradiente Animado</span>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            

            <div className="flex justify-end">
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Salvando..." : "Salvar Aparência"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
