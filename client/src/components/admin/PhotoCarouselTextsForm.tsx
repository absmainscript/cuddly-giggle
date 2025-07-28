
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { SiteConfig } from "@shared/schema";

interface PhotoCarouselTextsFormProps {
  configs: SiteConfig[];
}

export function PhotoCarouselTextsForm({ configs }: PhotoCarouselTextsFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const photoCarouselSchema = z.object({
    badge: z.string().min(1, "Badge é obrigatório"),
    title: z.string().min(1, "Título é obrigatório"),
    subtitle: z.string().min(1, "Subtítulo é obrigatório"),
  });

  type PhotoCarouselTextsForm = z.infer<typeof photoCarouselSchema>;

  const getPhotoCarouselData = () => {
    const photoCarouselSection = configs?.find(c => c.key === 'photo_carousel_section')?.value as any || {};
    
    return {
      badge: photoCarouselSection.badge || "GALERIA",
      title: photoCarouselSection.title || "Galeria",
      subtitle: photoCarouselSection.subtitle || "Um espaço pensado especialmente para seu bem-estar e conforto durante as consultas",
    };
  };

  const form = useForm<PhotoCarouselTextsForm>({
    resolver: zodResolver(photoCarouselSchema),
    defaultValues: getPhotoCarouselData(),
  });

  React.useEffect(() => {
    if (configs && configs.length > 0) {
      const newData = getPhotoCarouselData();
      form.reset(newData);
    }
  }, [configs, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: PhotoCarouselTextsForm) => {
      await apiRequest("POST", "/api/admin/config", {
        key: "photo_carousel_section",
        value: {
          badge: data.badge,
          title: data.title,
          subtitle: data.subtitle,
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/config"] });
      toast({ title: "Textos da galeria atualizados com sucesso!" });
    },
  });

  const onSubmit = (data: PhotoCarouselTextsForm) => {
    updateMutation.mutate(data);
  };

  return (
    <div className="space-y-4">
      <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
        <p className="text-sm text-purple-800">
          🎨 Use (palavra) para aplicar cores degradê automáticas nos títulos. Exemplo: "Nossa (Galeria)"
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="badge"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Badge da Seção</FormLabel>
                <FormControl>
                  <Input placeholder="GALERIA" {...field} />
                </FormControl>
                <FormDescription>
                  Pequeno texto em destaque acima do título principal
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título da Seção Galeria ()</FormLabel>
                <FormControl>
                  <Input placeholder="Galeria" {...field} />
                </FormControl>
                <FormDescription>
                  Título principal da galeria. Use (palavra) para efeito degradê. Ex: "Nossa (Galeria)"
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
                <FormLabel>Descrição da Seção</FormLabel>
                <FormControl>
                  <Textarea placeholder="Um espaço pensado especialmente para seu bem-estar e conforto durante as consultas" rows={3} {...field} />
                </FormControl>
                <FormDescription>
                  Descrição explicativa que aparece abaixo do título
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Salvando..." : "Salvar Textos da Galeria"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
