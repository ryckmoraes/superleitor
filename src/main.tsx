
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { logger } from "@/utils/logger";

logger.info("=== INICIANDO APLICATIVO ===", { 
  timestamp: new Date().toISOString(),
  userAgent: navigator.userAgent,
  location: window.location.href
});

try {
  logger.info("Procurando elemento root...");
  const rootElement = document.getElementById("root");
  
  if (!rootElement) {
    logger.error("ERRO CRÍTICO: Elemento root não encontrado!");
    throw new Error("Root element not found");
  }
  
  logger.info("Elemento root encontrado, criando React root...");
  const root = createRoot(rootElement);
  
  logger.info("Renderizando componente App...");
  root.render(<App />);
  
  logger.info("=== APLICATIVO INICIADO COM SUCESSO ===");
} catch (error) {
  logger.error("=== ERRO FATAL NA INICIALIZAÇÃO ===", error);
  
  // Fallback: mostrar erro na tela
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; color: red; font-family: monospace;">
        <h2>Erro de Inicialização</h2>
        <p>Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}</p>
        <p>Verifique o console para mais detalhes.</p>
      </div>
    `;
  }
}
