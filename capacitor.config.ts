import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.8a90f32919994f929e0a6730f7f00d7a',
  appName: 'HINJD Global',
  webDir: 'dist',
  android: {
    buildOptions: {
      signingType: 'apksigner',
    },
  },
};

export default config;
