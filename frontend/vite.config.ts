import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    build: {
        outDir: 'dist', // Ensure the build directory matches Render's default publish directory
    },
    server: {
        port: 3000,
    },
});
