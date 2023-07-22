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
    proxy: {
      '/bearer': {
        target: 'https://api.twitter.com/oauth2/token',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/bearer/, ''),
      },
      '/users': {
        target: 'https://api.twitter.com/2/users',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/users/, ''),
      },
      '/authorize': {
        target: 'https://api.twitter.com/oauth/authorize',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/authorize/, ''),
      },
      '/token': {
        target: 'https://api.twitter.com/oauth/request_token',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/token/, ''),
      },
    },
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
