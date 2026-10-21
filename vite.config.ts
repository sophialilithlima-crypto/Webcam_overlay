import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// O caminho base muda automaticamente no GitHub Actions para publicar em
// https://<usuario>.github.io/Webcam_overlay/; localmente continua em /.
const base = process.env.GITHUB_ACTIONS === 'true' ? '/Webcam_overlay/' : '/'

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    host: '127.0.0.1',
  },
})
