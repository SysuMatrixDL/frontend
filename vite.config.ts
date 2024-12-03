import { reactRouter } from "@react-router/dev/vite";
import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  plugins: [reactRouter(), tsconfigPaths()],
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:8000'
    },
    hmr: {
      overlay: false
    }
  },
  define: {
    'import.meta.env.BACKEND_AFFIX': JSON.stringify('/api'),
    'import.meta.env.GRAFANA_URL': JSON.stringify('http://172.18.198.206:3000/public-dashboards/5192664c23254fd3ba56f3ae1701a1a0?orgId=1&refresh=5s')
  },
});
