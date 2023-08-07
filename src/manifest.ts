import { defineManifest } from '@crxjs/vite-plugin'

export default defineManifest({
  name: 'SVG downloader',
  description: 'download svg from any website',
  version: '1.0.1',
  manifest_version: 3,
  icons: {
    '16': 'img/logo-16.png',
    '32': 'img/logo-34.png',
    '48': 'img/logo-48.png',
    '128': 'img/logo-128.png',
  },
  action: {
    default_icon: 'img/logo-48.png',
  },
  options_page: 'options.html',
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
  content_scripts: [
    {
      matches: ['https://www.svgdownloader.com/download-svg-list', "http://localhost:3033/download-svg-list"],
      js: ['src/content/content_script.ts'],
    },
  ],
  web_accessible_resources: [
    {
      resources: ['img/logo-16.png', 'img/logo-34.png', 'img/logo-48.png', 'img/logo-128.png', 'pages/index.html'],
      matches: ["\u003Call_urls>"],
    },
  ],
  permissions: ['scripting', 'activeTab', 'tabs'],
})
