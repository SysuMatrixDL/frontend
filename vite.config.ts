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
      '/api':
        process.env['BACKEND_SUFFIX'] == '' || process.env['BACKEND_SUFFIX'] == undefined
        ? 'http://172.18.198.206:8000'
        : process.env['BACKEND_SUFFIX'],
      '/containers':
        process.env['BACKEND_SUFFIX'] == '' || process.env['BACKEND_SUFFIX'] == undefined
        ? 'http://172.18.198.206:8000'
        : process.env['BACKEND_SUFFIX'],
      '/images':
        process.env['BACKEND_SUFFIX'] == '' || process.env['BACKEND_SUFFIX'] == undefined
        ? 'http://172.18.198.206:8000'
        : process.env['BACKEND_SUFFIX'],
        '/devices':
          process.env['BACKEND_SUFFIX'] == '' || process.env['BACKEND_SUFFIX'] == undefined
          ? 'http://172.18.198.206:8000'
          : process.env['BACKEND_SUFFIX']
    },
    hmr: {
      overlay: false
    }
  },
  define: {
    'import.meta.env.GRAFANA_URL': JSON.stringify(
      process.env['GRAFANA_URL'] == '' || process.env['GRAFANA_URL'] == undefined
      ?  'http://172.18.198.206:3000/public-dashboards/5192664c23254fd3ba56f3ae1701a1a0?orgId=1&refresh=5s'
      : process.env['GRAFANA_URL']
    )
  },
});
