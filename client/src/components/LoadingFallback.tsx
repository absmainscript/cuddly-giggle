/**
 * LoadingFallback.tsx
 * 
 * Componente de loading para substituir conteúdo durante carregamento
 * Evita flash de conteúdo não desejado (FOUC)
 */

import React from 'react';

interface LoadingFallbackProps {
  type?: 'skeleton' | 'spinner';
  className?: string;
  lines?: number;
}

export function LoadingFallback({ 
  type = 'skeleton', 
  className = '', 
  lines = 3 
}: LoadingFallbackProps) {
  if (type === 'spinner') {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`bg-gray-200 rounded h-4 mb-3 ${
          i === lines - 1 ? 'w-3/4' : 'w-full'
        }`}></div>
      ))}
    </div>
  );
}

// Skeleton específico para seções
export function SectionSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`py-16 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="animate-pulse">
          {/* Título */}
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
          {/* Subtítulo */}
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
          {/* Conteúdo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-lg p-6">
                <div className="h-6 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export const InitialPageLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-pink-100 rounded-full"></div>
          <div className="w-20 h-20 border-4 border-pink-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-800">Carregando...</h3>
          <p className="text-sm text-gray-500">Preparando a experiência perfeita para você</p>
        </div>
      </div>
    </div>
  );
};