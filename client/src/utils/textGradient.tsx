import React from 'react';

// Gradientes disponíveis para badges (texto entre parênteses)
export const BADGE_GRADIENTS = {
  'pink-purple': 'from-pink-500 to-purple-600',
  'blue-purple': 'from-blue-500 to-purple-600',
  'green-blue': 'from-green-500 to-blue-600',
  'orange-red': 'from-orange-500 to-red-600',
  'teal-cyan': 'from-teal-500 to-cyan-600',
  'indigo-purple': 'from-indigo-500 to-purple-600',
  'rose-pink': 'from-rose-500 to-pink-600',
  'emerald-teal': 'from-emerald-500 to-teal-600',
  'violet-purple': 'from-violet-500 to-purple-600',
  'amber-orange': 'from-amber-500 to-orange-600',
  'sky-blue': 'from-sky-500 to-blue-600',
  'lime-green': 'from-lime-500 to-green-600',
  'fuchsia-pink': 'from-fuchsia-500 to-pink-600',
  'cyan-blue': 'from-cyan-500 to-blue-600',
  'yellow-orange': 'from-yellow-500 to-orange-600'
};

export function processTextWithGradient(text: string, gradientKey?: string): JSX.Element {
  if (!text) return <span>{text}</span>;

  const gradient = gradientKey ? BADGE_GRADIENTS[gradientKey as keyof typeof BADGE_GRADIENTS] : 'from-pink-500 to-purple-600';

  // Regex para encontrar texto entre parênteses
  const regex = /\(([^)]+)\)/g;
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) => {
        // Se o índice é ímpar, é o conteúdo dentro dos parênteses
        if (index % 2 === 1) {
          return (
            <span
              key={index}
              className={`bg-gradient-to-r ${gradient} bg-clip-text text-transparent font-bold`}
            >
              {part}
            </span>
          );
        }
        return <span key={index} className="font-semibold">{part}</span>;
      })}
    </>
  );
}

// Função específica para badges de seção (pequenos títulos acima)
export function processBadgeWithGradient(text: string, gradientKey?: string): string {
  const gradient = gradientKey ? BADGE_GRADIENTS[gradientKey as keyof typeof BADGE_GRADIENTS] : 'from-pink-500 to-purple-600';
  return `bg-gradient-to-r ${gradient} text-transparent bg-clip-text font-bold`;
}