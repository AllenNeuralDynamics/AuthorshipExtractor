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
  const {
    CRITICAL_AVATAR_CSS,
    getCollaborationLayoutConfig,
    getHtmlAvatarLayout,
    normalizeCollaborationPositions,
    resolveSourceUrl,
    simulateCollaborationPositions,
  } = await import(pathToFileURL(resolve(rootDir, node.esm)));

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

  for (const [className, size] of [
    ['ae-cloud-avatar', '28px'],
    ['ae-avatar', '38px'],
    ['ae-matrix-avatar', '28px'],
    ['ae-popover-avatar', '32px'],
    ['ae-info-avatar', '40px'],
  ]) {
    const layout = getHtmlAvatarLayout(className);
    assert.equal(layout.wrapperStyle.width, size);
    assert.equal(layout.wrapperStyle.height, size);
    assert.equal(layout.wrapperStyle.minWidth, size);
    assert.equal(layout.wrapperStyle.minHeight, size);
    assert.equal(layout.wrapperStyle.maxWidth, size);
    assert.equal(layout.wrapperStyle.maxHeight, size);
    assert.equal(layout.wrapperStyle.contain, 'size layout paint');
    assert.equal(layout.wrapperStyle.borderRadius, '50%');
    assert.equal(layout.wrapperStyle.position, 'relative');
    assert.equal(layout.wrapperStyle.display, 'flex');
    assert.equal(layout.imageStyle.width, size);
    assert.equal(layout.imageStyle.height, size);
    assert.equal(layout.imageStyle.maxWidth, size);
    assert.equal(layout.imageStyle.maxHeight, size);
    assert.equal(layout.imageStyle.position, 'absolute');
    assert.equal(layout.imageStyle.inset, '0');
    assert.equal(layout.imageWidth, size.replace('px', ''));
    assert.equal(layout.imageHeight, size.replace('px', ''));
  }

  const customLayout = getHtmlAvatarLayout('ae-info-avatar', {
    width: '48px',
    height: '36px',
  });
  assert.equal(customLayout.wrapperStyle.width, '48px');
  assert.equal(customLayout.wrapperStyle.height, '36px');
  assert.equal(customLayout.imageWidth, '48');
  assert.equal(customLayout.imageHeight, '36');
  assert.match(CRITICAL_AVATAR_CSS, /\.ae-cloud-avatar \{[^}]*width:28px;/s);
  assert.match(CRITICAL_AVATAR_CSS, /\.ae-cloud-avatar img \{[^}]*max-width:28px;/s);
  assert.match(CRITICAL_AVATAR_CSS, /\.ae-cloud-row \{[^}]*display:flex;/s);

  const smallLayout = getCollaborationLayoutConfig(7, 19);
  const sparseNineteenLayout = getCollaborationLayoutConfig(19, 18);
  const denseNineteenLayout = getCollaborationLayoutConfig(19, 109);
  const twentyLayout = getCollaborationLayoutConfig(20, 120);
  const twentyOneLayout = getCollaborationLayoutConfig(21, 132);
  const largeLayout = getCollaborationLayoutConfig(50, 757);
  assert.equal(smallLayout.width, 700);
  assert.ok(denseNineteenLayout.width > sparseNineteenLayout.width);
  assert.ok(denseNineteenLayout.width >= 1100);
  assert.ok(twentyOneLayout.width > twentyLayout.width);
  assert.ok(twentyOneLayout.width - twentyLayout.width < 60);
  assert.ok(largeLayout.width > twentyOneLayout.width);
  assert.ok(largeLayout.width <= 2400);

  function fixtureLinks(authorCount, connectionCount) {
    const pairs = [];
    for (let i = 0; i < authorCount; i += 1) {
      for (let j = i + 1; j < authorCount; j += 1) {
        pairs.push({
          i,
          j,
          score: ((i + 1) * 37 + (j + 1) * 101) % 997,
          weight: 2 + ((i * 7 + j * 11) % 24),
        });
      }
    }
    pairs.sort((a, b) => a.score - b.score || a.i - b.i || a.j - b.j);
    return pairs.slice(0, connectionCount);
  }

  const denseNodes = Array.from(
    { length: 19 },
    () => ({ radius: denseNineteenLayout.nodeRadius }),
  );
  const denseLinks = fixtureLinks(19, 109);
  simulateCollaborationPositions(denseNodes, denseLinks, denseNineteenLayout);
  normalizeCollaborationPositions(denseNodes, denseNineteenLayout);
  let minimumCenterDistance = Infinity;
  for (let i = 0; i < denseNodes.length; i += 1) {
    for (let j = i + 1; j < denseNodes.length; j += 1) {
      minimumCenterDistance = Math.min(
        minimumCenterDistance,
        Math.hypot(denseNodes[i].x - denseNodes[j].x, denseNodes[i].y - denseNodes[j].y),
      );
    }
  }
  assert.ok(minimumCenterDistance > 100);
  assert.ok(
    minimumCenterDistance - 2 * (denseNineteenLayout.nodeRadius + 5) > 30,
  );

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