/**
 * App.tsx
 * 
 * Componente raiz da aplicação React
 * Configura roteamento e providers globais
 * Define as rotas disponíveis no site
 */

import React, { useEffect } from "react";
import { Switch, Route } from "wouter"; // Sistema de rotas client-side
import { queryClient } from "./lib/queryClient"; // Cliente configurado para requisições
import { QueryClientProvider } from "@tanstack/react-query"; // Provider de estado servidor
import { Toaster } from "@/components/ui/toaster"; // Notificações toast
import { TooltipProvider } from "@/components/ui/tooltip"; // Provider de tooltips
import Home from "@/pages/home"; // Página principal
import NotFound from "@/pages/not-found"; // Página 404
import AdminLogin from "@/pages/admin-login"; // Login administrativo
import AdminDashboard from "@/pages/admin-dashboard"; // Painel administrativo
import { useTheme } from "@/hooks/useTheme"; // Hook para aplicar cores dinâmicas
import MarketingPixels from "@/components/MarketingPixels"; // Pixels de marketing dinâmicos
import { loadSiteFavicon } from "@/utils/favicon";

// Componente de roteamento da aplicação
function Router() {
  // Carrega e aplica configurações de tema/cores
  useTheme();

  return (
    <>
      {/* Pixels de marketing carregados dinamicamente */}
      <MarketingPixels />
      <Switch>
        {/* Rota principal - homepage com todas as seções */}
        <Route path="/" component={Home} />
        {/* Rota de login administrativo */}
        <Route path="/09806446909" component={AdminLogin} />
        {/* Rota do painel administrativo */}
        <Route path="/09806446909/dashboard" component={AdminDashboard} />
        {/* Rota catch-all - página 404 para rotas não encontradas */}
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

// Componente principal da aplicação com todos os providers
function App() {
  useEffect(() => {
    loadSiteFavicon();
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <div className="relative main-container min-h-screen flex flex-col">
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;