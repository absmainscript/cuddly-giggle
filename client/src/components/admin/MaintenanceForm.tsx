
import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Settings } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { SiteConfig } from "@shared/schema";

export function MaintenanceForm({ configs }: { configs: SiteConfig[] }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const maintenanceSchema = z.object({
    isEnabled: z.boolean(),
    title: z.string().min(1, "Título é obrigatório"),
    message: z.string().min(1, "Mensagem é obrigatória"),
    estimatedTime: z.string().optional(),
    contactInfo: z.string().optional(),
  });

  type MaintenanceForm = z.infer<typeof maintenanceSchema>;

  // Extrair configurações de manutenção
  const getMaintenanceData = () => {
    const maintenanceConfig = configs?.find(c => c.key === 'maintenance_mode')?.value as any || {};
    
    return {
      isEnabled: maintenanceConfig.isEnabled ?? false,
      title: maintenanceConfig.title || "Site em Manutenção",
      message: maintenanceConfig.message || "Estamos fazendo algumas melhorias para oferecer uma experiência ainda melhor. Voltaremos em breve!",
      estimatedTime: maintenanceConfig.estimatedTime || "",
      contactInfo: maintenanceConfig.contactInfo || "",
    };
  };

  const form = useForm<MaintenanceForm>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: getMaintenanceData(),
  });

  // Atualiza o formulário quando as configurações mudam
  React.useEffect(() => {
    if (configs && configs.length > 0) {
      const newData = getMaintenanceData();
      form.reset(newData);
    }
  }, [configs, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: MaintenanceForm) => {
      const response = await apiRequest("POST", "/api/admin/config", {
        key: 'maintenance_mode',
        value: data
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/config"] });
      toast({ 
        title: "Configurações de manutenção atualizadas!",
        description: "As alterações foram salvas com sucesso."
      });
    },
    onError: () => {
      toast({ 
        title: "Erro ao salvar configurações", 
        variant: "destructive" 
      });
    },
  });

  const onSubmit = (data: MaintenanceForm) => {
    updateMutation.mutate(data);
  };

  const currentData = form.watch();

  return (
    <Card className="border-orange-200 bg-orange-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Settings className="w-5 h-5" />
          Modo de Manutenção
        </CardTitle>
        <CardDescription className="text-orange-700">
          Controle se o site fica público ou exibe uma página de manutenção
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Alerta quando manutenção está ativa */}
        {currentData.isEnabled && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">⚠️ Modo Manutenção Ativo</AlertTitle>
            <AlertDescription className="text-red-700">
              O site está atualmente em modo de manutenção. Apenas administradores podem acessar o painel. 
              Os visitantes verão a página de manutenção configurada abaixo.
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="isEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-white">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base font-medium">
                      Ativar Modo de Manutenção
                    </FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Quando ativo, apenas administradores podem acessar o site completo
                    </div>
                  </div>
                  <FormControl>
                    <Switch 
                      checked={field.value} 
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-orange-600"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Configurações da Página de Manutenção</h4>
              
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título da Página</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Site em Manutenção" 
                        {...field} 
                        className="bg-white"
                      />
                    </FormControl>
                    <div className="text-xs text-muted-foreground">
                      Título principal exibido na página de manutenção
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mensagem para os Visitantes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Estamos fazendo algumas melhorias para oferecer uma experiência ainda melhor. Voltaremos em breve!"
                        rows={4}
                        {...field} 
                        className="bg-white"
                      />
                    </FormControl>
                    <div className="text-xs text-muted-foreground">
                      Mensagem explicativa sobre a manutenção
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="estimatedTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tempo Estimado (Opcional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: 2 horas, até 15h, amanhã pela manhã"
                          {...field} 
                          className="bg-white"
                        />
                      </FormControl>
                      <div className="text-xs text-muted-foreground">
                        Previsão de quando o site voltará
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Informações de Contato (Opcional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: (44) 998-362-704 para emergências"
                          {...field} 
                          className="bg-white"
                        />
                      </FormControl>
                      <div className="text-xs text-muted-foreground">
                        Contato alternativo durante a manutenção
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Prévia da página de manutenção */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium text-gray-900 mb-3">Prévia da Página de Manutenção:</h4>
              <div className="bg-white border rounded p-4 text-center">
                <div className="text-4xl mb-3">🚧</div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {currentData.title || "Site em Manutenção"}
                </h2>
                <p className="text-gray-600 mb-4">
                  {currentData.message || "Estamos fazendo algumas melhorias para oferecer uma experiência ainda melhor. Voltaremos em breve!"}
                </p>
                {currentData.estimatedTime && (
                  <p className="text-sm text-gray-500 mb-2">
                    <strong>Previsão:</strong> {currentData.estimatedTime}
                  </p>
                )}
                {currentData.contactInfo && (
                  <p className="text-sm text-gray-500">
                    <strong>Contato:</strong> {currentData.contactInfo}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={updateMutation.isPending}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {updateMutation.isPending ? "Salvando..." : "Salvar Configurações"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
