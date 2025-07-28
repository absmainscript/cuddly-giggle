/**
 * useMobileTabNav.ts
 * 
 * Hook para controlar navegação entre abas no mobile usando dropdown
 * Sincroniza o valor do select com o estado das abas do Radix UI
 */

import { useState, useEffect } from 'react';

export function useMobileTabNav(defaultTab: string = 'general') {
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Função para alterar aba via dropdown mobile
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Dispara evento personalizado para sincronizar com Radix Tabs
    const tabsElement = document.querySelector('[data-state]');
    if (tabsElement) {
      // Encontra e clica no trigger correto
      const trigger = document.querySelector(`[data-value="${value}"]`);
      if (trigger) {
        (trigger as HTMLElement).click();
      }
    }
  };

  return {
    activeTab,
    setActiveTab,
    handleTabChange
  };
}