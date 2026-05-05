import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';
import pkg from './package.json';

export default defineConfig({
  plugins: [
    monkey({
      entry: 'src/main.ts',
      userscript: {
        name: 'SubBili',
        namespace: 'https://scriptcat.org/',
        version: pkg.version,
        description: 'A premium Bilibili subtitle downloader with SRT/BCC support, sleek UI, and smart diagnosis.',
        author: 'Antigravity',
        match: [
          'https://www.bilibili.com/video/*',
          'https://www.bilibili.com/bangumi/play/*'
        ],
        connect: ['api.bilibili.com', 'i0.hdslb.com', 'aisubtitle.hdslb.com'],
        grant: ['GM_xmlhttpRequest', 'GM_download', 'GM_setClipboard']
      },
    }),
  ],
});
