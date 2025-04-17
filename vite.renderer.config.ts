import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, './src')
        }
    },
    css: {
        devSourcemap: true,
        postcss: resolve(__dirname, './postcss.config.cjs')
    },
    publicDir: resolve(__dirname, './public')
});
