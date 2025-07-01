
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log("Main: Starting app initialization");

const initApp = () => {
  console.log("Main: initApp called");
  
  const rootElement = document.getElementById("root");
  
  if (!rootElement) {
    console.error("Main: Root element not found");
    return;
  }
  
  console.log("Main: Root element found");
  
  try {
    const root = createRoot(rootElement);
    console.log("Main: React root created");
    
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    
    console.log("Main: App rendered successfully");
  } catch (error) {
    console.error("Main: Error rendering app:", error);
    
    // Fallback: show error message
    rootElement.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100vh; flex-direction: column;">
        <h1>Erro ao carregar o aplicativo</h1>
        <p>Tente recarregar a página</p>
        <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px;">Recarregar</button>
      </div>
    `;
  }
};

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  console.log("Main: DOM loading, waiting...");
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  console.log("Main: DOM ready, starting app");
  initApp();
}
