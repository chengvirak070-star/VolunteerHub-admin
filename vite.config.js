import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Admin panel runs on 5173 (the user web app uses 5174). The API allows both in CORS.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true },
  preview: { port: 5173 },
})
