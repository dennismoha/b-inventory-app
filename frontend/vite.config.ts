import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // base: '/react/template/',
  base: '/',
  resolve: {
    alias: [{ find: '@core_types', replacement: 'src/core/interface' },
    { find: '@api', replacement: '/src/core/redux/api' },
    { find: '@core', replacement: '/src/core' },
    { find: '@components', replacement: '/src/components' },
    { find: '@features', replacement: '/src/features' },
    { find: '@routes', replacement: '/src/routes' },
    { find: '@utils', replacement: '/src/utils' }
    ]
  }
})



