
import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function HeroImageUpload() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  // Busca a imagem atual do hero
  const { data: configs } = useQuery({
    queryKey: ["/api/admin/config"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/config");
      return response.json();
    },
  });

  useEffect(() => {
    const heroImage = configs?.find((c: any) => c.key === 'hero_image');
    const imagePath = heroImage?.value?.path;
    // Reseta a imagem quando não há configuração ou está vazia
    setCurrentImage(imagePath && imagePath.trim() !== '' ? imagePath : null);
  }, [configs]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Verifica se é uma imagem
    if (!file.type.startsWith('image/')) {
      toast({ title: "Erro", description: "Por favor, selecione apenas arquivos de imagem.", variant: "destructive" });
      return;
    }

    // Verifica o tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Erro", description: "A imagem deve ter no máximo 5MB.", variant: "destructive" });
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/admin/upload/hero', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro no upload');
      }

      const result = await response.json();
      setCurrentImage(result.imagePath);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/config"] });
      toast({ title: "Sucesso!", description: "Foto de perfil atualizada com sucesso!" });
    } catch (error) {
      toast({ title: "Erro", description: "Erro ao fazer upload da imagem.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {currentImage && (
          <div className="relative">
            <img 
              src={currentImage} 
              alt="Foto de perfil atual" 
              className="w-20 h-20 rounded-full object-cover border-2"
            />
            <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full flex items-center justify-center">
              <Camera className="w-3 h-3 text-white" />
            </div>
          </div>
        )}
        <div className="flex-1">
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="file:mr-4 file:py-3 file:px-5 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80 py-3"
          />
          <p className="text-xs text-muted-foreground mt-1">
            JPG, PNG ou GIF. Máximo 5MB.
          </p>
        </div>
      </div>
      {uploading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
          Fazendo upload...
        </div>
      )}
      {currentImage && (
        <div className="flex justify-center">
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={async () => {
              try {
                // Remove completamente a configuração hero_image usando fetch direto
                const response = await fetch('/api/admin/config/hero_image', {
                  method: 'DELETE',
                  headers: {
                    'Content-Type': 'application/json',
                  }
                });
                
                if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                // Atualiza o estado local
                setCurrentImage(null);
                
                // Invalida as queries para recarregar dados
                await queryClient.invalidateQueries({ queryKey: ["/api/admin/config"] });
                
                toast({ 
                  title: "Sucesso!", 
                  description: "Avatar original restaurado com sucesso!" 
                });
              } catch (error) {
                console.error('Erro ao redefinir foto:', error);
                toast({ 
                  title: "Erro", 
                  description: "Erro ao redefinir foto.", 
                  variant: "destructive" 
                });
              }
            }}
            className="text-xs"
          >
            🔄 Voltar ao avatar original
          </Button>
        </div>
      )}
    </div>
  );
}
