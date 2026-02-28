import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    server: {
        port: 3000,
        host: '0.0.0.0',
    },
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.svg', 'pwa-192x192.png', 'pwa-512x512.png'],
            manifest: {
                name: 'TdyTime - Phân tích Lịch giảng',
                short_name: 'TdyTime',
                description: 'Công cụ Phân tích và Quản lý Lịch giảng thông minh.',
                theme_color: '#ffffff',
                background_color: '#ffffff',
                display: 'standalone',
                start_url: '/',
                icons: [
                    {
                        src: 'pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'any',
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any',
                    },
                ],
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff2}'],
                cleanupOutdatedCaches: true,
                clientsClaim: true,
                skipWaiting: true,
            },
            devOptions: {
                enabled: true,
                type: 'module',
            },
        }),
    ],
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor-react': ['react', 'react-dom', 'react-i18next', 'i18next'],
                    'vendor-router': ['react-router-dom'],
                    'vendor-utils': ['lucide-react', 'zustand'],
                    'vendor-recharts': ['recharts'],
                },
            },
        },
        chunkSizeWarningLimit: 1000,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
