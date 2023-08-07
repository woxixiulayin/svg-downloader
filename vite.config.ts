import { defineConfig } from 'vite'
import { crx } from '@crxjs/vite-plugin'
import react from '@vitejs/plugin-react'
import zipPack from 'vite-plugin-zip-pack';
import iife from 'rollup-plugin-iife'

import manifest from './src/manifest'
//@ts-ignore
import { config } from './src/read_pages_folder'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    server: {
      port: 4044
    },
    build: {
      emptyOutDir: true,
      target: 'es2015',
      outDir: 'build',
      rollupOptions: {
        input: {
          ...config,
          content_script: './src/content/content_script.ts',
        },
        output: {
          format: `es`,
          entryFileNames: '[name].js',
          chunkFileNames: 'assets/[name].js',
        },
      },
    },
    plugins: [crx({ manifest }), iife({
      include: 'content_script'
    }), react(), zipPack({
      outDir: `package`,
      inDir: 'build',
      // @ts-ignore
      outFileName: `${manifest.short_name ?? manifest.name.replaceAll(" ", "-")}-extension-v${manifest.version}.zip`,
    })],
  }
})
