
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log("=== INICIANDO APLICATIVO ===");

try {
  const rootElement = document.getElementById("root");
  
  if (!rootElement) {
    console.error("ERRO CRÍTICO: Elemento root não encontrado!");
    throw new Error("Root element not found");
  }
  
  const root = createRoot(rootElement);
  root.render(<App />);
  
  console.log("=== APLICATIVO INICIADO COM SUCESSO ===");
} catch (error) {
  console.error("=== ERRO FATAL NA INICIALIZAÇÃO ===", error);
  
  // Fallback: mostrar erro na tela
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; color: red; font-family: monospace; text-align: center;">
        <h2>Erro de Inicialização</h2>
        <p>${error instanceof Error ? error.message : 'Erro desconhecido'}</p>
        <p>Verifique o console para mais detalhes.</p>
        <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px;">
          Tentar Novamente
        </button>
      </div>
    `;
  }
}
