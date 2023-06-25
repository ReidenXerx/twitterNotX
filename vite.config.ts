import reactRefresh from '@vitejs/plugin-react-refresh'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [reactRefresh(), tsconfigPaths()],
  root: './',
  base: './',
  server: {
    // Enable open on the local network.
    open: true,
    host: true,
  },
  build: {
    sourcemap: true, // Enable sourcemaps
  },
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
  },
})
