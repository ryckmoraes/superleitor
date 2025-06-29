
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log("=== INICIALIZANDO APLICAÇÃO ===");

const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("❌ Elemento root não encontrado");
} else {
  console.log("✅ Elemento root encontrado, criando aplicação");
  
  const root = createRoot(rootElement);
  
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  
  console.log("✅ Aplicação renderizada com sucesso");
}
