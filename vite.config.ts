import { fileURLToPath, URL } from 'node:url'
import { dirname, resolve } from 'path'

import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  plugins: [
    dts({
      insertTypesEntry: true
    })
  ],
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler'
      }
    }
  },
  build: {
    outDir: 'dist',
    lib: {
      name: 'Utils',
      formats: ['es', 'umd'],
      entry: resolve(__dirname, 'src/index.ts'),
      fileName: (format) => `utils.${format}.js`
    },
    rollupOptions: {
      output: {
        exports: 'named',
        globals: {}
      }
    }
  }
})
