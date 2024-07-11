import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import libCss from 'vite-plugin-libcss';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    dts({ rollupTypes: true, include: ['lib'] }), libCss(),
  ],
  build: {
    minify: false,
    copyPublicDir: false,
    cssCodeSplit: true,
    lib: {
      entry: resolve(__dirname, 'lib/index.ts'), // Library entry file
      name: 'revogrid-column-date',
    },
    rollupOptions: {
      input: {
        main: 'lib/index.ts',
      },
      external: [
        /@revolist\/revogrid/,
        '@revolist/revogrid/loader',
      ],
      output: {
        exports: 'named',
      },
    },
  },
  // this is for local development
  // server: {
  //   open: '/demo/index.html',
  // },
});
