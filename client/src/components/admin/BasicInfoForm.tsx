import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { HeroImageUpload } from "./HeroImageUpload";
import { SiteIconUpload } from "./SiteIconUpload";
import type { SiteConfig } from "@shared/schema";

interface BasicInfoFormProps {
  configs: SiteConfig[];
}

export function BasicInfoForm({ configs }: BasicInfoFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const basicSchema = z.object({
    headerName: z.string().min(1, "Nome do header é obrigatório"),
    crp: z.string().min(1, "CRP é obrigatório"),
    siteName: z.string().min(1, "Nome do site é obrigatório"),
    description: z.string().min(1, "Descrição é obrigatória"),
  });

  type BasicForm = z.infer<typeof basicSchema>;

  const getBasicData = () => {
    const generalInfo = configs?.find(c => c.key === 'general_info')?.value as any || {};

    return {
      headerName: generalInfo.headerName || "Dra. Adrielle Benhossi",
      crp: generalInfo.crp || "08/123456",
      siteName: generalInfo.siteName || "Dra. Adrielle Benhossi - Psicóloga",
      description: generalInfo.description || "Psicóloga CRP 08/123456",
    };
  };

  const form = useForm<BasicForm>({
    resolver: zodResolver(basicSchema),
    defaultValues: getBasicData(),
  });

  React.useEffect(() => {
    if (configs && configs.length > 0) {
      const newData = getBasicData();
      form.reset(newData);
    }
  }, [configs, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: BasicForm) => {
      const promises = [
        apiRequest("POST", "/api/admin/config", {
          key: "general_info",
          value: {
            headerName: data.headerName,
            crp: data.crp,
            siteName: data.siteName,
            description: data.description,
          }
        }),
      ];
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/config"] });
      toast({ title: "Informações básicas atualizadas com sucesso!" });
    },
  });

  const onSubmit = (data: BasicForm) => {
    updateMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      {/* Upload de Ícone do Site */}
      <div className="space-y-4">
        <h4 className="font-medium flex items-center gap-2">
          <Upload className="w-4 h-4" />
          Ícone do Site (Favicon)
        </h4>
        <SiteIconUpload configs={configs} />
      </div>

      {/* Upload de Foto de Perfil Hero */}
      <div className="space-y-4">
        <h4 className="font-medium flex items-center gap-2">
          <Upload className="w-4 h-4" />
          Foto de Perfil Principal
        </h4>
        <p className="text-sm text-muted-foreground">
          Esta foto aparecerá automaticamente em todas as seções do site: Header, Hero, Footer e Seção Sobre.
        </p>
        <HeroImageUpload />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="headerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome para Header/Navegação</FormLabel>
                  <FormControl>
                    <Input placeholder="Dra. Adrielle Benhossi" {...field} />
                  </FormControl>
                  <FormDescription>
                    Nome que aparece na barra de navegação (header) do site
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="crp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CRP</FormLabel>
                  <FormControl>
                    <Input placeholder="08/123456" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="siteName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Site</FormLabel>
                  <FormControl>
                    <Input placeholder="Dra. Adrielle Benhossi - Psicóloga" {...field} />
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
                    <Input placeholder="Psicóloga CRP 08/123456" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Salvando..." : "Salvar Informações Básicas"}
          </Button>
        </form>
      </Form>
    </div>
  );
}