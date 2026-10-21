import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// Multi-page site: /, /menu/, /leadership/
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        menu: resolve(__dirname, 'menu/index.html'),
        leadership: resolve(__dirname, 'leadership/index.html'),
        story: resolve(__dirname, 'our-story/index.html'),
      },
    },
  },
});
