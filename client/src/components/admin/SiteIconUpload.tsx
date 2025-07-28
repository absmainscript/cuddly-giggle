
import React, { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, X, Image } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { SiteConfig } from "@shared/schema";

interface SiteIconUploadProps {
  configs: SiteConfig[];
}

export function SiteIconUpload({ configs }: SiteIconUploadProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const siteIconConfig = configs?.find(c => c.key === 'site_icon')?.value as any || {};
  const currentIcon = siteIconConfig.iconPath || "";

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/admin/upload/site-icon', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Falha no upload');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Atualiza a configuração do ícone
      updateConfigMutation.mutate({
        iconPath: data.path,
        iconType: 'upload'
      });
    },
    onError: () => {
      toast({
        title: "Erro no upload",
        description: "Falha ao fazer upload do ícone",
        variant: "destructive",
      });
    },
  });

  const updateConfigMutation = useMutation({
    mutationFn: async (iconData: any) => {
      return apiRequest("POST", "/api/admin/config", {
        key: "site_icon",
        value: iconData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/config"] });
      toast({
        title: "Ícone atualizado!",
        description: "O ícone do site foi atualizado com sucesso",
      });
    },
  });

  const resetIconMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", "/api/admin/upload/site-icon");
    },
    onSuccess: () => {
      updateConfigMutation.mutate({
        iconPath: "",
        iconType: "upload"
      });
    },
  });

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione uma imagem (PNG, JPG, etc.)",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        <p><strong>Ícone do Site (Favicon):</strong></p>
        <p>Este ícone aparecerá na aba do navegador e nos favoritos. Recomendamos uma imagem quadrada (ex: 512x512px) em formato PNG, JPG ou ICO.</p>
        <p>A imagem será automaticamente convertida para favicon (.ico) e outros tamanhos necessários.</p>
      </div>

      {currentIcon ? (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 border rounded-lg flex items-center justify-center bg-muted">
                <img 
                  src={currentIcon} 
                  alt="Ícone atual" 
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).nextElementSibling?.setAttribute('style', 'display: flex');
                  }}
                />
                <Image className="w-6 h-6 text-muted-foreground hidden" />
              </div>
              <div>
                <p className="text-sm font-medium">Ícone atual</p>
                <p className="text-xs text-muted-foreground">Clique para alterar</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadMutation.isPending}
              >
                {uploadMutation.isPending ? "Enviando..." : "Alterar"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => resetIconMutation.mutate()}
                disabled={resetIconMutation.isPending}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card 
          className={`p-8 border-2 border-dashed transition-colors ${
            isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
              <Upload className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">Adicionar ícone do site</p>
              <p className="text-xs text-muted-foreground">
                Arraste uma imagem ou clique para selecionar
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMutation.isPending}
            >
              {uploadMutation.isPending ? "Enviando..." : "Selecionar arquivo"}
            </Button>
          </div>
        </Card>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
}
