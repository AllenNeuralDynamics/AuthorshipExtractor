import assert from 'node:assert/strict';
import { copyFile, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const tempDir = await mkdtemp(join(tmpdir(), 'authorship-extractor-test-'));
const isolatedBundlePath = join(tempDir, 'authorship-plugin.mjs');

try {
  await copyFile(resolve(rootDir, 'dist', 'authorship-plugin.mjs'), isolatedBundlePath);
  const bundle = await readFile(isolatedBundlePath, 'utf8');
  const { default: plugin } = await import(pathToFileURL(isolatedBundlePath));

  const node = plugin.directives[0].run({
    options: { authors: './authors.yml' },
  })[0];
  const tree = { type: 'root', children: [node] };

  plugin.transforms[0].plugin({}, {})(tree, {
    path: resolve(rootDir, 'article.md'),
    cwd: rootDir,
  });

  assert.equal(node.type, 'anywidget');
  const [widgetEsm, widgetCss] = await Promise.all([
    readFile(resolve(rootDir, node.esm), 'utf8'),
    readFile(resolve(rootDir, node.css), 'utf8'),
  ]);
  const { resolveSourceUrl } = await import(pathToFileURL(resolve(rootDir, node.esm)));

  const editUrl = 'https://github.com/AllenNeuralDynamics/Example/edit/main/content/article.md';
  assert.equal(
    resolveSourceUrl(editUrl, './authors.yml'),
    'https://github.com/AllenNeuralDynamics/Example/blob/main/content/authors.yml',
  );
  assert.equal(
    resolveSourceUrl(editUrl, '../authors.yml'),
    'https://github.com/AllenNeuralDynamics/Example/blob/main/authors.yml',
  );
  assert.equal(resolveSourceUrl(null, './authors.yml'), null);

  const creditIndex = widgetEsm.indexOf("{ id: 'matrix', label: 'CRediT' }");
  const sectionsIndex = widgetEsm.indexOf("{ id: 'sections', label: 'Sections' }");
  const collaborationIndex = widgetEsm.indexOf("{ id: 'network', label: 'Collaboration' }");
  assert.ok(widgetEsm.includes("let activeTab = 'matrix';"));
  assert.ok(creditIndex >= 0 && creditIndex < sectionsIndex && sectionsIndex < collaborationIndex);
  assert.ok(widgetCss.includes('.ae-widget'));
  for (const content of [bundle, widgetEsm, widgetCss]) {
    assert.match(content, /MIT License/);
    assert.match(content, /Copyright \(c\) 2026 Jerome Lecoq/);
    assert.match(content, /Permission is hereby granted/);
  }

  const nestedNode = plugin.directives[0].run({
    options: { authors: '../authors.yml' },
  })[0];
  const nestedTree = { type: 'root', children: [nestedNode] };
  const nestedDir = resolve(rootDir, 'content');

  plugin.transforms[0].plugin({}, {})(nestedTree, {
    path: resolve(nestedDir, 'article.md'),
    cwd: rootDir,
  });

  assert.equal(nestedNode.type, 'anywidget');
  assert.match(nestedNode.esm, /^\.\.\/_build\/\.authorship-extractor\//);
  assert.match(nestedNode.css, /^\.\.\/_build\/\.authorship-extractor\//);
  await Promise.all([
    readFile(resolve(nestedDir, nestedNode.esm), 'utf8'),
    readFile(resolve(nestedDir, nestedNode.css), 'utf8'),
  ]);
} finally {
  await rm(tempDir, { recursive: true, force: true });
}

console.log('Standalone plugin bundle verified');