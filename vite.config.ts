import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { imagetools } from "vite-imagetools";
import { VitePWA } from "vite-plugin-pwa";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/supabase/vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Ensure Vite loads env files relative to this config file (repo root),
  // not relative to an unstable process working directory.
  envDir: __dirname,
  // Ensure VITE_* env vars are always available during dev/preview.
  // This prevents hard-crashes like: "supabaseUrl is required" when env injection is flaky.
  define: (() => {
    // In some hosted/dev environments, process.cwd() may not be the repo root.
    // Using __dirname (vite.config.ts location) is the most reliable way to load .env files.
    const env = loadEnv(mode, __dirname, "");
    // Lovable Cloud may expose these values under different names depending on runtime.
    // Never fall back to service-role keys here (client-side code must use anon/publishable only).
    const projectId =
      env.VITE_SUPABASE_PROJECT_ID ||
      process.env.VITE_SUPABASE_PROJECT_ID ||
      env.SUPABASE_PROJECT_ID ||
      process.env.SUPABASE_PROJECT_ID;

    // Last-resort derived URL to prevent blank-screen crashes when env injection fails.
    // (Public endpoint + anon key is safe for client usage.)
    const derivedSupabaseUrl = projectId ? `https://${projectId}.supabase.co` : undefined;

    const supabaseUrl =
      env.VITE_SUPABASE_URL ||
      process.env.VITE_SUPABASE_URL ||
      env.SUPABASE_URL ||
      process.env.SUPABASE_URL ||
      derivedSupabaseUrl;

    const supabaseKey =
      env.VITE_SUPABASE_PUBLISHABLE_KEY ||
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
      env.SUPABASE_PUBLISHABLE_KEY ||
      process.env.SUPABASE_PUBLISHABLE_KEY ||
      env.SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY;

    const defineEnv: Record<string, string> = {};
    if (supabaseUrl) {
      defineEnv["import.meta.env.VITE_SUPABASE_URL"] = JSON.stringify(supabaseUrl);
    }
    if (supabaseKey) {
      defineEnv["import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY"] = JSON.stringify(supabaseKey);
    }
    return defineEnv;
  })(),
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    imagetools(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "og-image.jpg", "robots.txt", "pwa-icon-192.png", "pwa-icon-512.png", "splash-screen.png"],
      manifest: {
        name: "HINJD Global - Industrial Equipment Diagnostics",
        short_name: "HINJD Global",
        description: "Heavy equipment diagnostics, conveyor belt solutions, and industrial tools for mining and aggregate operations",
        theme_color: "#121212",
        background_color: "#121212",
        display: "standalone",
        orientation: "portrait",
        start_url: "/app",
        scope: "/",
        icons: [
          {
            src: "/pwa-icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/pwa-icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,jpg,jpeg,webp,svg,woff,woff2}"],
        navigateFallback: "/index.html",
        navigateFallbackAllowlist: [/^(?!\/__).*/],
        navigateFallbackDenylist: [/^\/~oauth/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /\/api\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24,
              },
              networkTimeoutSeconds: 10,
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
    mcpPlugin(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));