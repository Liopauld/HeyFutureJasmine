import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(dirname, "./src"),
      "@shared": path.resolve(dirname, "../shared")
    },
    dedupe: ["react", "react-dom", "react-router-dom", "react-router"]
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@tanstack/react-query",
      "date-fns",
      "framer-motion",
      "lucide-react",
      "sonner",
      "axios"
    ]
  }
});
