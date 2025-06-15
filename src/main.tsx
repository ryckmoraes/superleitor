import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { isAndroid, keepScreenOn, requestAndroidPermissions, hideSystemUI } from './utils/androidHelper';
import { logger } from "@/utils/logger";

logger.info("Iniciando main.tsx - boot do aplicativo", { ua: navigator.userAgent });

try {
  // Initialize Android-specific features
  if (isAndroid()) {
    logger.info("Detectado Android: requisitando permissões e mantendo tela ativa...");
    // Request necessary permissions
    requestAndroidPermissions().then(granted => {
      logger.info('Android permissions granted:', granted);
    }).catch(e => logger.error("Erro ao requisitar permissões Android:", e));
    
    // Keep screen on
    keepScreenOn().then(success => {
      logger.info('Keep screen on:', success);
    }).catch(e => logger.error("Erro ao manter tela ativa:", e));
    
    // Hide system UI for immersive experience
    hideSystemUI().catch(err => {
      logger.error('Failed to hide system UI:', err);
    });
  } else {
    logger.info("Platforma não Android detectada.");
  }
} catch (err) {
  logger.error("Erro na inicialização específica do Android:", err);
}

// Render the app
try {
  logger.info("Renderizando React root (App)");
  createRoot(document.getElementById("root")!).render(<App />);
  logger.info("React root renderizado com sucesso.");
} catch (err) {
  logger.error("Erro ao renderizar o React root:", err);
}
