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
      '/request_token': {
        target: 'https://api.twitter.com/oauth/request_token',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/request_token/, ''),
      },
      '/access_token': {
        target: 'https://api.twitter.com/oauth/access_token',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/access_token/, ''),
      },
      '/verify_credentials.json': {
        target: 'https://api.twitter.com/1.1/account/verify_credentials.json',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/verify_credentials.json/, ''),
      },
      '/lookup.json': {
        target: 'https://api.twitter.com/1.1/statuses/lookup.json',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/lookup.json/, ''),
      },
      '/update.json': {
        target: 'https://api.twitter.com/1.1/statuses/update.json',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/update.json/, ''),
      },
      '/tweets.json': {
        target: 'https://api.twitter.com/1.1/search/tweets.json',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/tweets.json/, ''),
      },
      '/user_timeline.json': {
        target: 'https://api.twitter.com/1.1/statuses/user_timeline.json',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/user_timeline.json/, ''),
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
