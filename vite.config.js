import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/* In development the website runs on :5173 and proxies API + uploads to the Node server on :4000. */
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      "/api": "http://localhost:4000",
      "/uploads": "http://localhost:4000",
    },
  },
});
