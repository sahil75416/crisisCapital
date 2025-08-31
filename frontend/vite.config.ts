import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load env file from root directory
  const env = loadEnv(mode, path.join(__dirname, '..'), '');
  
  return {
    plugins: [react()],
    server: {
      port: 5173,
      host: true
    },
    define: {
      'process.env': env
    }
  };
});