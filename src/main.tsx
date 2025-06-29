
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log("=== SUPERLEITOR INICIANDO ===");
console.log("User Agent:", navigator.userAgent);
console.log("Plataforma:", navigator.platform);

const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("❌ Elemento root não encontrado");
  
  // Criar elemento root se não existir (fallback para Android)
  const newRoot = document.createElement("div");
  newRoot.id = "root";
  document.body.appendChild(newRoot);
  console.log("✅ Elemento root criado dinamicamente");
} else {
  console.log("✅ Elemento root encontrado");
}

const finalRoot = document.getElementById("root")!;
const root = createRoot(finalRoot);

try {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  
  console.log("✅ App renderizado com sucesso");
} catch (error) {
  console.error("❌ Erro ao renderizar app:", error);
}

// Debug adicional para Android
window.addEventListener('error', (event) => {
  console.error("Erro global capturado:", event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error("Promise rejeitada:", event.reason);
});

console.log("=== SUPERLEITOR INICIALIZAÇÃO COMPLETA ===");
