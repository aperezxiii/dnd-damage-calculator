// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  //base: '/damagecalc/',  // Important for subdirectory hosting, used on NOTR site
  plugins: [react()],
});