
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { X, Upload, Image as ImageIcon } from "lucide-react";

interface TestimonialImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
}

export function TestimonialImageUpload({ value, onChange }: TestimonialImageUploadProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ 
        title: "Erro", 
        description: "Por favor, selecione apenas arquivos de imagem.", 
        variant: "destructive" 
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ 
        title: "Erro", 
        description: "A imagem deve ter no máximo 5MB.", 
        variant: "destructive" 
      });
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/admin/upload/testimonials', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro no upload');
      }

      const result = await response.json();
      onChange(result.imagePath);
      toast({ 
        title: "Sucesso!", 
        description: "Foto do depoimento enviada com sucesso!" 
      });
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({ 
        title: "Erro", 
        description: `Erro ao fazer upload da imagem: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 
        variant: "destructive" 
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    onChange("");
    toast({ 
      title: "Imagem removida", 
      description: "A foto foi removida do depoimento." 
    });
  };

  return (
    <div className="space-y-4">
      {value && (
        <div className="relative inline-block">
          <img 
            src={value} 
            alt="Foto do depoimento" 
            className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
            onError={(e) => {
              console.error('Erro ao carregar imagem:', value);
              e.currentTarget.style.display = 'none';
            }}
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
            onClick={removeImage}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}
      
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {value ? "Clique para trocar a foto" : "Opcional: Adicione uma foto personalizada do cliente"}
          </p>
        </div>
        
        {!value && (
          <div className="flex items-center justify-center w-20 h-20 border-2 border-dashed border-gray-300 rounded-full">
            <ImageIcon className="w-8 h-8 text-gray-400" />
          </div>
        )}
      </div>
      
      {uploading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
          <Upload className="w-4 h-4" />
          Fazendo upload da imagem...
        </div>
      )}
    </div>
  );
}
