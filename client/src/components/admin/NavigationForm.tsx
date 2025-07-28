
import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { SiteConfig } from "@shared/schema";

interface NavigationFormProps {
  configs: SiteConfig[];
}

export function NavigationForm({ configs }: NavigationFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const navSchema = z.object({
    navHome: z.string().min(1, "Menu: Início é obrigatório"),
    navAbout: z.string().min(1, "Menu: Sobre é obrigatório"),
    navServices: z.string().min(1, "Menu: Serviços é obrigatório"),
    navTestimonials: z.string().min(1, "Menu: Depoimentos é obrigatório"),
    navFaq: z.string().min(1, "Menu: FAQ é obrigatório"),
    navContact: z.string().min(1, "Menu: Contato é obrigatório"),
  });

  type NavForm = z.infer<typeof navSchema>;

  const getNavData = () => {
    const generalInfo = configs?.find(c => c.key === 'general_info')?.value as any || {};
    
    return {
      navHome: generalInfo.navHome || "Início",
      navAbout: generalInfo.navAbout || "Sobre",
      navServices: generalInfo.navServices || "Serviços",
      navTestimonials: generalInfo.navTestimonials || "Depoimentos",
      navFaq: generalInfo.navFaq || "FAQ",
      navContact: generalInfo.navContact || "Contato",
    };
  };

  const form = useForm<NavForm>({
    resolver: zodResolver(navSchema),
    defaultValues: getNavData(),
  });

  React.useEffect(() => {
    if (configs && configs.length > 0) {
      const newData = getNavData();
      form.reset(newData);
    }
  }, [configs, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: NavForm) => {
      const generalInfo = configs?.find(c => c.key === 'general_info')?.value as any || {};
      
      await apiRequest("POST", "/api/admin/config", {
        key: "general_info",
        value: {
          ...generalInfo,
          navHome: data.navHome,
          navAbout: data.navAbout,
          navServices: data.navServices,
          navTestimonials: data.navTestimonials,
          navFaq: data.navFaq,
          navContact: data.navContact,
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/config"] });
      toast({ title: "Menu de navegação atualizado com sucesso!" });
    },
  });

  const onSubmit = (data: NavForm) => {
    updateMutation.mutate(data);
  };

  return (
    <div className="space-y-4">
      <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm text-amber-800">
          ⚠️ <strong>Importante:</strong> Estes campos alteram apenas os nomes dos botões do menu. As funcionalidades permanecem as mesmas.
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="navHome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Menu: Início</FormLabel>
                  <FormControl>
                    <Input placeholder="Início" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="navAbout"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Menu: Sobre</FormLabel>
                  <FormControl>
                    <Input placeholder="Sobre" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="navServices"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Menu: Serviços</FormLabel>
                  <FormControl>
                    <Input placeholder="Serviços" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="navTestimonials"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Menu: Depoimentos</FormLabel>
                  <FormControl>
                    <Input placeholder="Depoimentos" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="navFaq"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Menu: FAQ</FormLabel>
                  <FormControl>
                    <Input placeholder="FAQ" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="navContact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Menu: Contato</FormLabel>
                  <FormControl>
                    <Input placeholder="Contato" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Salvando..." : "Salvar Menu de Navegação"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
