import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const DEFAULT_API_URL = 'http://localhost:3000/api';

export default defineConfig({
  plugins: [react()],
  define: {
    __API_URL__: JSON.stringify(process.env.API_URL || DEFAULT_API_URL),
  },
  server: { port: 8080 },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
  },
});
