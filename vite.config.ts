import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    // The published site is built without a Gemini key: a key inside a public bundle is readable by anyone.
    // For local use, put GEMINI_API_KEY in .env.local.
    const geminiKey = JSON.stringify(env.GEMINI_API_KEY || '');
    return {
      base: mode === 'production' ? '/RiGoPA/' : '/',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': geminiKey,
        'process.env.GEMINI_API_KEY': geminiKey
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
