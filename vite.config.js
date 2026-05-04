import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ command }) => ({
  root: __dirname,
  plugins: [react()],
  // GitHub Pages 프로젝트 사이트: 저장소 이름과 무관하게 서브경로에서 동작하도록 상대 경로
  base: command === 'build' ? './' : '/',
}))
