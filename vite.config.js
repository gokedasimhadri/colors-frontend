import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.VITE_API_URL || 'http://localhost:9022'
  const eventType = env.EVENT_TYPE || env.VITE_EVENT_TYPE || 'COLORS'

  return {
    plugins: [react()],
    define: {
      'import.meta.env.EVENT_TYPE': JSON.stringify(eventType),
      'import.meta.env.VITE_EVENT_TYPE': JSON.stringify(eventType),
      'process.env.EVENT_TYPE': JSON.stringify(eventType)
    },
    server: {
      proxy: {
        '/api': {
          target,
          changeOrigin: true
        },
        '/uploads': {
          target,
          changeOrigin: true
        }
      }
    }
  }
})


