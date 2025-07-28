
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Image as ImageIcon, RotateCcw } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export function FaviconUpload() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await apiRequest("POST", "/api/admin/upload/favicon", formData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/config"] });
      toast({ 
        title: "Ícone do site atualizado com sucesso!",
        description: "O novo ícone aparecerá na aba do navegador e nos favoritos."
      });
      setSelectedFile(null);
      setPreviewUrl(null);
      
      // Força a atualização do favicon no navegador
      updateFavicon();
    },
    onError: () => {
      toast({ 
        title: "Erro ao fazer upload do ícone",
        description: "Tente novamente com uma imagem PNG, JPG ou ICO válida.",
        variant: "destructive"
      });
    },
  });

  const resetMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/admin/upload/favicon");
      return response.json();
    },
    onSuccess: () => {
      toast({ 
        title: "Ícone resetado para o padrão",
        description: "O ícone padrão foi restaurado."
      });
      updateFavicon();
    },
  });

  const updateFavicon = () => {
    // Força a atualização do favicon no navegador
    const timestamp = Date.now();
    const faviconLink = document.querySelector("link[rel='icon']") as HTMLLinkElement;
    if (faviconLink) {
      faviconLink.href = `/icons/favicon.ico?v=${timestamp}`;
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/x-icon', 'image/vnd.microsoft.icon'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Formato inválido",
          description: "Use apenas arquivos PNG, JPG ou ICO.",
          variant: "destructive"
        });
        return;
      }

      // Validar tamanho (máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O ícone deve ter no máximo 2MB.",
          variant: "destructive"
        });
        return;
      }

      setSelectedFile(file);
      
      // Criar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  const handleReset = () => {
    resetMutation.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Ícone do Site (Favicon)
        </CardTitle>
        <CardDescription>
          O favicon é o pequeno ícone que aparece na aba do navegador, nos favoritos e quando o site é salvo na tela inicial do celular. 
          Aceita arquivos PNG, JPG ou ICO. A imagem será automaticamente convertida e otimizada para diferentes tamanhos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="favicon-upload">Escolher novo ícone</Label>
          <Input
            id="favicon-upload"
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/x-icon"
            onChange={handleFileChange}
            className="cursor-pointer"
          />
          <p className="text-xs text-muted-foreground">
            Recomendado: imagem quadrada de pelo menos 32x32 pixels, máximo 2MB
          </p>
        </div>

        {previewUrl && (
          <div className="space-y-2">
            <Label>Prévia do novo ícone</Label>
            <div className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50">
              <img 
                src={previewUrl} 
                alt="Preview do favicon" 
                className="w-8 h-8 object-contain border rounded"
              />
              <div className="flex-1">
                <p className="text-sm font-medium">{selectedFile?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedFile && (selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={handleUpload}
            disabled={!selectedFile || uploadMutation.isPending}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {uploadMutation.isPending ? "Enviando..." : "Fazer Upload"}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                disabled={resetMutation.isPending}
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Restaurar Padrão
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Restaurar ícone padrão?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação irá remover o ícone personalizado e restaurar o ícone padrão do site. 
                  Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleReset}>
                  {resetMutation.isPending ? "Restaurando..." : "Restaurar"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>ℹ️ Como funciona:</strong>
          </p>
          <ul className="text-sm text-blue-600 mt-1 space-y-1">
            <li>• A imagem enviada será automaticamente convertida para formato ICO</li>
            <li>• Serão criados múltiplos tamanhos: 16x16, 32x32, e 180x180 pixels</li>
            <li>• O ícone aparecerá imediatamente na aba do navegador</li>
            <li>• Para dispositivos Apple, será criado um ícone específico</li>
          </ul>
        </div>

        <div className="mt-4 p-4 bg-gray-50 border rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>📍 Localização dos arquivos:</strong> Os ícones ficam salvos em <code>/client/public/icons/</code>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
