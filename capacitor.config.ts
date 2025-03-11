
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.61c9c85a521b4753a60e0cdb64c7b0cc',
  appName: 'Sound Sphere',
  webDir: 'dist',
  server: {
    url: "https://61c9c85a-521b-4753-a60e-0cdb64c7b0cc.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
