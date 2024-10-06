import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import nodePolyfills from 'rollup-plugin-polyfill-node';
import { vitePlugin as remix } from "@remix-run/dev";
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';

// Replace the HOST env var with SHOPIFY_APP_URL
if (
  process.env.HOST &&
  (!process.env.SHOPIFY_APP_URL ||
    process.env.SHOPIFY_APP_URL === process.env.HOST)
) {
  process.env.SHOPIFY_APP_URL = process.env.HOST;
  delete process.env.HOST;
}

const host = new URL(process.env.SHOPIFY_APP_URL || "http://localhost").hostname;
let hmrConfig;

if (host === "localhost") {
  hmrConfig = {
    protocol: "ws",
    host: "0.0.0.0", // Bind to all interfaces
    port: 64999,
    clientPort: 64999,
  };
} else {
  hmrConfig = {
    protocol: "wss",
    host: "0.0.0.0", // Bind to all interfaces
    port: parseInt(process.env.FRONTEND_PORT) || 8002,
    clientPort: 443,
  };
}

export default defineConfig({
  server: {
    port: Number(process.env.PORT || 3000),
    host: "0.0.0.0", // Bind to all interfaces
    hmr: hmrConfig,
    fs: {
      allow: ["app", "node_modules"],
    },
  },
  plugins: [
    remix({
      ignoredRouteFiles: ["**/.*"],
    }),
    tsconfigPaths(),
    nodePolyfills({
      include: ['fs', 'path', 'process', 'crypto', 'http', 'https', 'url']
    })
  ],
  build: {
    assetsInlineLimit: 0,
    rollupOptions: {
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true
        }),
        NodeModulesPolyfillPlugin()
      ]
    },
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true
        }),
        NodeModulesPolyfillPlugin()
      ]
    }
  },
  resolve: {
    alias: {
      'node:fs': 'fs',
      'node:path': 'path',
      'node:process': 'process',
      'node:crypto': 'crypto',
      'node:http': 'http',
      'node:https': 'https',
      'node:url': 'url',
      '@': '/app', // Updated alias to point to your app directory
    }
  }
});
