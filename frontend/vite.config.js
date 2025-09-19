import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory
  const env = loadEnv(mode, process.cwd(), '');

  return {
    envDir: './',  // Look for .env files in the project root
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      headers: {
        "Content-Security-Policy": `
          default-src 'self';
          script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://*.clerk.accounts.workers.dev https://*.clerk.dev https://*.clerk.vercel.com;
          style-src 'self' 'unsafe-inline' https://*.clerk.accounts.dev;
          img-src 'self' data: https:;
          font-src 'self';
          connect-src 'self' http://localhost:8000 http://localhost:5173 https://job-portal-v3b1.onrender.com https://*.clerk.accounts.dev https://*.clerk.accounts.workers.dev https://*.clerk.dev https://*.clerk.vercel.com;
          frame-src 'self' https://*.clerk.accounts.dev;
          worker-src 'self' blob: https://*.clerk.accounts.dev https://*.clerk.accounts.workers.dev;
        `.replace(/\s+/g, ' ').trim(),
      },
      proxy: {
        '/api': {
          target: 'http://localhost:8000', // Your backend server URL
          changeOrigin: true,
          secure: false,
        },
      },
    },
    // Explicitly define environment variables to ensure they're available in the client
    define: {
      'process.env.VITE_CLERK_PUBLISHABLE_KEY': JSON.stringify(env.VITE_CLERK_PUBLISHABLE_KEY)
    }
  }
})
