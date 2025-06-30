
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log("Main: Iniciando aplicação");

// Inicialização ultra-robusta para Android
const initApp = () => {
  console.log("Main: Função initApp chamada");
  
  let rootElement = document.getElementById("root");
  
  if (!rootElement) {
    console.log("Main: Elemento root não encontrado, criando...");
    rootElement = document.createElement("div");
    rootElement.id = "root";
    document.body.appendChild(rootElement);
  }
  
  console.log("Main: Elemento root encontrado/criado");
  
  try {
    const root = createRoot(rootElement);
    console.log("Main: Root React criado");
    
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    
    console.log("Main: App renderizado com sucesso");
  } catch (error) {
    console.error("Main: Erro ao renderizar app:", error);
  }
};

// Aguardar carregamento completo do DOM
if (document.readyState === 'loading') {
  console.log("Main: DOM ainda carregando, aguardando...");
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  console.log("Main: DOM já carregado, iniciando app");
  initApp();
}
