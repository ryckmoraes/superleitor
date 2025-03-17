import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { isAndroid, keepScreenOn, requestAndroidPermissions, hideSystemUI } from './utils/androidHelper';

// Initialize Android-specific features
if (isAndroid()) {
  // Request necessary permissions
  requestAndroidPermissions().then(granted => {
    console.log('Android permissions granted:', granted);
  });
  
  // Keep screen on
  keepScreenOn().then(success => {
    console.log('Keep screen on:', success);
  });
  
  // Hide system UI for immersive experience
  hideSystemUI().catch(err => {
    console.error('Failed to hide system UI:', err);
  });
}

// Render the app
createRoot(document.getElementById("root")!).render(<App />);
