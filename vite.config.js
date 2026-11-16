import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.VITE_API_URL;
  const eventType = (env.EVENT_TYPE || env.VITE_EVENT_TYPE || 'COLORS').trim();
  const eventYear = (env.EVENT_YEAR || env.VITE_EVENT_YEAR || '2k27').trim();
  const eventAcademicYear = (env.VITE_EVENT_ACADEMIC_YEAR || env.EVENT_ACADEMIC_YEAR || '2026-2027').trim();

  return {
    plugins: [react()],
    resolve: {
      alias: {
        'lucide-react': path.resolve(__dirname, 'src/components/Icons/LucideIcons.jsx')
      }
    },
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(target),
      'import.meta.env.EVENT_TYPE': JSON.stringify(eventType),
      'import.meta.env.VITE_EVENT_TYPE': JSON.stringify(eventType),
      'import.meta.env.EVENT_YEAR': JSON.stringify(eventYear),
      'import.meta.env.VITE_EVENT_YEAR': JSON.stringify(eventYear),
      'import.meta.env.VITE_EVENT_ACADEMIC_YEAR': JSON.stringify(eventAcademicYear),
      'import.meta.env.VITE_EVENT_ACADEMIC_YEAR': JSON.stringify(eventAcademicYear),
      'process.env.EVENT_TYPE': JSON.stringify(eventType),
      'process.env.VITE_EVENT_TYPE': JSON.stringify(eventType),
      'process.env.EVENT_YEAR': JSON.stringify(eventYear),
      'process.env.VITE_EVENT_YEAR': JSON.stringify(eventYear),
      'process.env.VITE_EVENT_ACADEMIC_YEAR': JSON.stringify(eventAcademicYear),
      'process.env.VITE_EVENT_ACADEMIC_YEAR': JSON.stringify(eventAcademicYear),
      'process.env.VITE_API_URL': JSON.stringify(target)
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
        },
        '/adityaapi': {
          target: 'https://info.aec.edu.in',
          changeOrigin: true,
          secure: false
        }
      }
    },

    preview: {
      allowedHosts: [
        'colours.adityauniversity.in', 'https://colours.adityauniversity.in', 'www.colours.adityauniversity.in'
      ]
    },
  }
})
