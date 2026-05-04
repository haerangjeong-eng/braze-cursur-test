import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ command }) => ({
  root: __dirname,
  plugins: [react()],
  // GitHub Pages: https://<user>.github.io/braze-cursur-test/
  base: command === 'build' ? '/braze-cursur-test/' : '/',
}))
