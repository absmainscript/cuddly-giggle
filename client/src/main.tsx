/**
 * main.tsx
 * 
 * Ponto de entrada da aplicação React
 * Renderiza o componente App no DOM
 * Importa estilos globais da aplicação
 */

import { createRoot } from "react-dom/client"; // API de renderização React 18
import App from "./App"; // Componente raiz da aplicação
import "./index.css"; // Estilos globais Tailwind CSS

createRoot(document.getElementById("root")!).render(<App />);
