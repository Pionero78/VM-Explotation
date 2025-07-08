import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { tempo } from "tempo-devtools/dist/vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // @ts-ignore
    allowedHosts: process.env.TEMPO === "true" ? true : undefined,
  },
  plugins: [
    react(),
    // Only include tempo plugin in development or when TEMPO env is set
    process.env.TEMPO === "true" && tempo(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimize for production deployment
    target: "es2015",
    minify: "terser",
    sourcemap: mode === "development",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          supabase: ["@supabase/supabase-js"],
          ui: [
            "@radix-ui/react-dialog",
            "@radix-ui/react-select",
            "@radix-ui/react-tabs",
          ],
        },
      },
    },
  },
  define: {
    // Ensure environment variables are properly defined
    "import.meta.env.VITE_TEMPO": JSON.stringify(process.env.TEMPO || "false"),
  },
}));
