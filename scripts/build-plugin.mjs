import { mkdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { build } from 'esbuild';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = resolve(rootDir, 'dist');

const [license, widgetEsm, widgetCss] = await Promise.all([
  readFile(resolve(rootDir, 'LICENSE'), 'utf8'),
  readFile(resolve(rootDir, 'authorship-widget.mjs'), 'utf8'),
  readFile(resolve(rootDir, 'authorship-widget.css'), 'utf8'),
]);
const licenseComment = `/*!\n${license.trim()}\n*/`;
const licensedWidgetEsm = `${licenseComment}\n${widgetEsm}`;
const licensedWidgetCss = `${licenseComment}\n${widgetCss}`;

await mkdir(outputDir, { recursive: true });
await build({
  entryPoints: [resolve(rootDir, 'authorship-plugin.mjs')],
  outfile: resolve(outputDir, 'authorship-plugin.mjs'),
  bundle: true,
  define: {
    __AUTHORSHIP_WIDGET_ESM__: JSON.stringify(licensedWidgetEsm),
    __AUTHORSHIP_WIDGET_CSS__: JSON.stringify(licensedWidgetCss),
  },
  banner: {
    js: `${licenseComment}\nimport { createRequire } from 'node:module'; const require = createRequire(import.meta.url);`,
  },
  format: 'esm',
  legalComments: 'none',
  platform: 'node',
  target: 'node18',
});

console.log('Built dist/authorship-plugin.mjs');