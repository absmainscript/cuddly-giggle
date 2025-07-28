
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { SiteConfig } from "@shared/schema";

const inspirationalSchema = z.object({
  quote: z.string().min(1, "Citação é obrigatória"),
  author: z.string().min(1, "Autor é obrigatório"),
});

type InspirationalForm = z.infer<typeof inspirationalSchema>;

interface InspirationalSectionFormProps {
  configs: SiteConfig[];
}

export function InspirationalSectionForm({ configs }: InspirationalSectionFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const inspirationalConfig = configs.find((c) => c.key === "inspirational_section");
  const currentData = inspirationalConfig?.value || {};

  const form = useForm<InspirationalForm>({
    resolver: zodResolver(inspirationalSchema),
    defaultValues: {
      quote: currentData.quote || "A transformação começa quando decidimos cuidar de nós mesmos.",
      author: currentData.author || "Dra. Adrielle Benhossi",
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InspirationalForm) => {
      const response = await apiRequest("POST", "/api/admin/config", {
        key: "inspirational_section",
        value: data,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/config"] });
      queryClient.invalidateQueries({ queryKey: ["/api/config"] });
      toast({ title: "Seção inspiracional atualizada com sucesso!" });
    },
  });

  const onSubmit = (data: InspirationalForm) => {
    updateMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="quote"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Citação Inspiracional</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="A transformação começa quando decidimos cuidar de nós mesmos."
                  rows={3}
                  className="resize-y min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Frase motivacional que inspira seus visitantes
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="author"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Autor da Citação</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Dra. Adrielle Benhossi" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Nome que aparece como autor da citação
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          disabled={updateMutation.isPending}
          className="w-full sm:w-auto"
        >
          {updateMutation.isPending ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </form>
    </Form>
  );
}
