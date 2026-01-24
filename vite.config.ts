import { fileURLToPath, URL } from 'node:url'
import { dirname, resolve } from 'path'

import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
// import { glob } from 'glob'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  mode: 'production',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  plugins: [
    dts({
      rollupTypes: true,
      include: ['src/**/*.ts']
    })
  ],
  build: {
    target: 'es2022',
    outDir: 'dist',
    emptyOutDir: true,
    reportCompressedSize: false,
    lib: {
      name: 'Utility',
      formats: ['es'],
      entry: resolve(__dirname, 'src/index.ts'),
      // fileName: (format) => `index.${format}.js`
    },
    rollupOptions: {
      external: (id) => /^[@\./]/.test(id) === false,
      input: resolve(__dirname, 'src/index.ts'),
      // input: {
      //   index: resolve(__dirname, 'src/index.ts'),
      //   ...Object.fromEntries(
      //     glob.sync('src/**/index.ts').map(file => [
      //       file.replace('src/', '').replace('/index.ts', ''),
      //       resolve(__dirname, file)
      //     ])
      //   )
      // },
      output: {
        dir: 'dist',
        format: 'es',
        preserveModules: true,
        // entryFileNames: ({ name }) => name === 'index' ? 'index.js' : '[name].js'
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        // assetFileNames: '[name].[ext]'
      },
    }
  }
})
