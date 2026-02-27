import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: 'https://github.com/patge44/portail-fablab.git', // (N'oubliez pas de mettre le nom de votre dépôt GitHub ici pour l'étape 4)
})