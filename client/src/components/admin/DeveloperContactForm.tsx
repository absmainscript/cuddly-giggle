import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MessageCircle, Send, Calendar, CheckCircle, AlertTriangle, Trash2, Clock, Eye, HeartHandshake, Bug, Lightbulb, Mail, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

const supportMessageSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  subject: z.string().min(5, "Assunto deve ter pelo menos 5 caracteres"),
  message: z.string().min(10, "Mensagem deve ter pelo menos 10 caracteres"),
  type: z.enum(["support", "contact", "feedback", "bug", "feature"]),
});

type SupportMessageForm = z.infer<typeof supportMessageSchema>;

interface SupportMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  type: string;
  isRead: boolean;
  adminResponse?: string;
  createdAt: string;
  respondedAt?: string;
}

export function DeveloperContactForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("send");

  // Buscar mensagens enviadas
  const { data: messages = [] } = useQuery<SupportMessage[]>({
    queryKey: ["/api/admin/support-messages"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/support-messages");
      return response.json();
    },
  });

  const form = useForm<SupportMessageForm>({
    resolver: zodResolver(supportMessageSchema),
    defaultValues: {
      subject: "",
      message: "",
      type: "support",
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: SupportMessageForm) => {
      const response = await apiRequest("POST", "/api/admin/support-messages", data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.emailSent) {
        toast({
          title: "✅ Mensagem Enviada!",
          description: "Sua mensagem foi enviada para o desenvolvedor e você receberá uma resposta em breve.",
        });
      } else {
        toast({
          title: "⚠️ Mensagem Salva",
          description: "Mensagem salva, mas houve problema no envio do email. O desenvolvedor será notificado.",
          variant: "destructive",
        });
      }
      form.reset({
        subject: "",
        message: "",
        type: "support",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/support-messages"] });
    },
    onError: () => {
      toast({
        title: "❌ Erro",
        description: "Erro ao enviar mensagem. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("PUT", `/api/admin/support-messages/${id}`, {
        isRead: true,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/support-messages"] });
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/support-messages/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "✅ Mensagem Removida",
        description: "Mensagem removida com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/support-messages"] });
    },
  });

  const clearHistoryMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", "/api/admin/support-messages");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/support-messages"] });
      toast({
        title: "Histórico limpo!",
        description: "Todas as mensagens foram removidas com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao limpar histórico",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SupportMessageForm) => {
    // Preenche nome e email padrão se não fornecidos
    const messageData = {
      ...data,
      name: data.name || "Dra. Adrielle Benhossi",
      email: data.email || "contato@draadriellepsicologia.com"
    };
    sendMessageMutation.mutate(messageData);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "support": return <MessageSquare className="w-4 h-4" />;
      case "contact": return <MessageCircle className="w-4 h-4" />;
      case "feedback": return <HeartHandshake className="w-4 h-4" />;
      case "bug": return <Bug className="w-4 h-4" />;
      case "feature": return <Lightbulb className="w-4 h-4" />;
      default: return <Mail className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "support": return "Suporte Técnico";
      case "contact": return "Contato Geral";
      case "feedback": return "Feedback";
      case "bug": return "Relatório de Bug";
      case "feature": return "Nova Funcionalidade";
      default: return type;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "support": return "bg-blue-100 text-blue-800";
      case "contact": return "bg-green-100 text-green-800";
      case "feedback": return "bg-purple-100 text-purple-800";
      case "bug": return "bg-red-100 text-red-800";
      case "feature": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const unreadCount = messages.filter(m => !m.isRead).length;

  return (
    <div className="space-y-6">
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            Contato com o Desenvolvedor
          </CardTitle>
          <CardDescription className="text-sm">
            Precisa de ajuda técnica? Quer sugerir algo? Envie uma mensagem diretamente para Rafael Horvan. 
            Você receberá uma resposta no seu email rapidamente! 💌
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="send" className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Enviar Mensagem
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Histórico
                {unreadCount > 0 && (
                  <Badge className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="send" className="mt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Contato</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="support">
                                <div className="flex items-center gap-2">
                                  <MessageSquare className="w-4 h-4" />
                                  Suporte Técnico
                                </div>
                              </SelectItem>
                              <SelectItem value="bug">
                                <div className="flex items-center gap-2">
                                  <Bug className="w-4 h-4" />
                                  Relatório de Bug
                                </div>
                              </SelectItem>
                              <SelectItem value="feature">
                                <div className="flex items-center gap-2">
                                  <Lightbulb className="w-4 h-4" />
                                  Nova Funcionalidade
                                </div>
                              </SelectItem>
                              <SelectItem value="feedback">
                                <div className="flex items-center gap-2">
                                  <HeartHandshake className="w-4 h-4" />
                                  Feedback
                                </div>
                              </SelectItem>
                              <SelectItem value="contact">
                                <div className="flex items-center gap-2">
                                  <MessageCircle className="w-4 h-4" />
                                  Contato Geral
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assunto</FormLabel>
                        <FormControl>
                          <Input placeholder="Descreva brevemente o assunto" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mensagem</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descreva detalhadamente sua dúvida, problema ou sugestão..."
                            rows={6}
                            className="resize-y"
                            {...field} 
                          />
                        </FormControl>
                        <div className="text-xs text-muted-foreground">
                          💡 Seja específico(a)! Quanto mais detalhes, melhor poderei ajudar.
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button 
                      type="submit" 
                      disabled={sendMessageMutation.isPending}
                      className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                    >
                      {sendMessageMutation.isPending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Enviar Mensagem
                        </>
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => form.reset()}
                    >
                      Limpar Formulário
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">Nenhuma mensagem enviada ainda</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab("send")}
                    className="mt-4"
                  >
                    Enviar Primeira Mensagem
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Histórico de Mensagens
                    </h4>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Limpar Histórico
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Limpar Histórico de Mensagens</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação irá remover permanentemente todas as mensagens do histórico. 
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => clearHistoryMutation.mutate()}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={clearHistoryMutation.isPending}
                          >
                            {clearHistoryMutation.isPending ? "Limpando..." : "Limpar Histórico"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`
                        border rounded-lg p-4 transition-all
                        ${!message.isRead 
                          ? 'border-blue-200 bg-blue-50/50' 
                          : 'border-gray-200 bg-gray-50/50'
                        }
                      `}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${getTypeBadgeColor(message.type)}`}>
                            {getTypeIcon(message.type)}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {message.subject}
                            </h4>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                              <Badge className={getTypeBadgeColor(message.type)}>
                                {getTypeLabel(message.type)}
                              </Badge>
                              <span>•</span>
                              <span>{new Date(message.createdAt).toLocaleString('pt-BR')}</span>
                              {!message.isRead && (
                                <>
                                  <span>•</span>
                                  <Badge className="bg-red-100 text-red-800 text-xs">
                                    Não lida
                                  </Badge>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!message.isRead && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markAsReadMutation.mutate(message.id)}
                              className="flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              Marcar como lida
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteMessageMutation.mutate(message.id)}
                            className="text-red-600 hover:text-red-700 flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="text-sm text-gray-700 bg-white p-3 rounded border">
                        <div className="whitespace-pre-wrap">{message.message}</div>
                      </div>

                      {message.adminResponse && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                          <div className="flex items-center gap-2 text-green-800 font-medium mb-2">
                            <CheckCircle className="w-4 h-4" />
                            Resposta do Desenvolvedor
                          </div>
                          <div className="text-sm text-green-700 whitespace-pre-wrap">
                            {message.adminResponse}
                          </div>
                          {message.respondedAt && (
                            <div className="text-xs text-green-600 mt-2">
                              Respondido em {new Date(message.respondedAt).toLocaleString('pt-BR')}
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      
    </div>
  );
}