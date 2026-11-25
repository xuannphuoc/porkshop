import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import flowbiteReact from "flowbite-react/plugin/vite";

export default defineConfig({
  plugins: [react(), tailwindcss(), flowbiteReact()],
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8787",
        changeOrigin: false,
        configure(proxy) {
          proxy.on("proxyReq", function (proxyRequest, request) {
            // Keep the original browser host for the backend Origin/CSRF check.
            if (request.headers.host !== undefined) {
              proxyRequest.setHeader("x-forwarded-host", request.headers.host);
            }
          });
        },
      },
    },
  },
});
