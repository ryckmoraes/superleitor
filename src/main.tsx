
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Inicialização mais robusta
const initApp = () => {
  let rootElement = document.getElementById("root");

  if (!rootElement) {
    rootElement = document.createElement("div");
    rootElement.id = "root";
    document.body.appendChild(rootElement);
  }

  const root = createRoot(rootElement);

  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
};

// Aguardar carregamento do DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
