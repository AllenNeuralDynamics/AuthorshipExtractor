import assert from 'node:assert/strict';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const tempDir = await mkdtemp(join(tmpdir(), 'authorship-extractor-test-'));
const isolatedBundlePath = join(tempDir, 'authorship-plugin.mjs');

try {
  await copyFile(resolve(rootDir, 'dist', 'authorship-plugin.mjs'), isolatedBundlePath);
  const bundle = await readFile(isolatedBundlePath, 'utf8');
  const { default: plugin, createContributionTables, orderContributors } = await import(pathToFileURL(isolatedBundlePath));

  const node = plugin.directives[0].run({
    options: { authors: './authors.yml' },
  })[0];
  const tree = { type: 'root', children: [node] };

  plugin.transforms[0].plugin({}, {})(tree, {
    path: resolve(rootDir, 'article.md'),
    cwd: rootDir,
  });

  assert.equal(node.type, 'anywidget');
  assert.equal(node.model.staticFigures, undefined);
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

  const fixture = {
    portal: {sections: ['Methods & validation']},
    project: {contributors: [
      {id: 'first', name: 'First Author', credit_levels: [{role: 'Software', level: 'lead'}],
        section_contributions: [{section: 'Methods & validation', effort: 'equal'}]},
      {id: 'second', name: 'Second Author', roles: ['Data curation']},
    ]},
  };
  const fixturePath = join(tempDir, 'authors.yml');
  await writeFile(fixturePath, JSON.stringify(fixture));
  const printNode = plugin.directives[0].run({options: {
    authors: fixturePath, 'print-tables': 'credit,sections', 'print-authors-per-block': 1,
  }})[0];
  plugin.transforms[0].plugin({}, {})({children: [printNode]}, {
    path: join(tempDir, 'article.md'), cwd: tempDir,
  });
  assert.equal(printNode.type, 'anywidget');
  assert.equal(JSON.parse(printNode.model.authors).primary.length, 2);
  const figures = JSON.parse(printNode.model.staticFigures);
  assert.equal(figures.version, 1);
  assert.equal(figures.items.length, 4);
  const creditSvg = await readFile(resolve(tempDir, figures.items[0].url), 'utf8');
  const sectionSvg = await readFile(resolve(tempDir, figures.items[2].url), 'utf8');
  assert.match(creditSvg, /data-label="Software" data-level="lead"/);
  assert.match(creditSvg, /data-level="not-recorded"/);
  assert.ok(!creditSvg.includes('#EEF1F3'));
  assert.match(sectionSvg, /Methods &amp; validation/);
  const nativeNode = plugin.directives.find((directive) => directive.name === 'authorship-tables')
    .run({options: {authors: fixturePath, tables: 'credit', 'authors-per-block': 1}})[0];
  plugin.transforms[0].plugin({}, {})({children: [nativeNode]}, {
    path: join(tempDir, 'article.md'), cwd: tempDir,
  });
  assert.equal(nativeNode.type, 'div');
  assert.equal(nativeNode.children.length, 2);
  assert.ok(nativeNode.children.every((child) => child.type === 'image'));
  assert.ok(!bundle.includes('PDFDocument'));
  const profile = join(tempDir, 'pdf');
  await mkdir(profile);
  await writeFile(join(profile, 'authorship-extractor.json'), JSON.stringify({
    print: {tables: ['credit', 'sections'], authorsPerBlock: 1},
  }));
  const profileNode = plugin.directives[0].run({options: {authors: fixturePath}})[0];
  plugin.transforms[0].plugin({}, {})({children: [profileNode]}, {
    path: join(tempDir, 'article.md'), cwd: profile,
  });
  assert.equal(profileNode.type, 'anywidget');
  assert.equal(JSON.parse(profileNode.model.staticFigures).items.length, 4);
  assert.ok(JSON.parse(profileNode.model.staticFigures).items.every((figure) => figure.url.startsWith('./pdf/_build/')));
  const tables = createContributionTables(fixture, {authorsPerBlock: 1});
  assert.equal(tables.flatMap((table) => table.cells).length, 30);
  assert.equal(tables[1].cells.find((cell) => cell.label === 'Data curation').level, 'recorded');
  assert.throws(() => createContributionTables(fixture, {authorsPerBlock: 0}), /authorsPerBlock/);
  assert.throws(() => createContributionTables(fixture, {tables: ['credit', 'credit']}), /once each/);
  const invalid = structuredClone(fixture);
  invalid.project.contributors[0].credit_levels[0].level = 'guessed';
  assert.throws(() => createContributionTables(invalid), /Invalid credit/);
  invalid.project.contributors[0].credit_levels[0].level = 'lead';
  invalid.project.contributors[0].credit_levels.push({role: 'Software', level: 'equal'});
  assert.throws(() => createContributionTables(invalid), /Duplicate credit/);
  const repeatedSections = structuredClone(fixture);
  repeatedSections.project.contributors[0].section_contributions.push({
    section: 'Methods & validation', effort: 'supporting',
  });
  const repeated = createContributionTables(repeatedSections, {tables: ['sections']});
  assert.deepEqual(repeated[0].cells[0].levels, ['equal', 'supporting']);
  assert.equal(repeated[0].cells[0].level, 'multiple');
  const {renderContributionPdf} = await import('../authorship-static-pdf.mjs');
  const {PDFDocument} = await import('pdf-lib');
  const exported = await renderContributionPdf(tables);
  const pdf = await PDFDocument.load(exported.bytes);
  assert.equal(pdf.getPageCount(), 4);
  assert.equal(pdf.getAuthor(), 'First Author, Second Author');
  assert.equal(pdf.getCreator(), 'AuthorshipExtractor');
  const serializedPdf = Buffer.from(exported.bytes).toString('latin1');
  assert.ok(serializedPdf.includes('/Font'));
  assert.ok(!serializedPdf.includes('/Subtype /Image'));
  assert.equal(pdf.getPages()[0].getWidth(), exported.layouts[0].width + 24);
  assert.deepEqual((await renderContributionPdf(tables)).bytes, exported.bytes);
  const team = {portal: {sections: ['Exact original section']}, project: {contributors:
    Array.from({length: 34}, (_, index) => ({
      id: `person-${index}`, name: `Person Family${String(33 - index).padStart(2, '0')}`,
      credit_levels: [{role: 'Software', level: 'equal'}],
      section_contributions: [{section: 'Exact original section', effort: 'supporting'}],
    })),
  }};
  const before = structuredClone(team);
  const compact = createContributionTables(team, {layout: 'compact', authorOrder: 'alphabetical'});
  assert.equal(compact.length, 2);
  assert.equal(compact[0].contributors.length, 34);
  assert.equal(compact[0].contributors[0].name, 'Person Family00');
  assert.equal(compact[0].contributors.at(-1).name, 'Person Family33');
  assert.deepEqual(team, before);
  assert.equal(compact.flatMap((table) => table.cells).filter((cell) => cell.level).length, 68);
  const compactPdf = await renderContributionPdf(compact);
  assert.equal((await PDFDocument.load(compactPdf.bytes)).getPageCount(), 2);
  for (const layout of compactPdf.layouts) {
    assert.ok(!layout.shapes.some((shape) => shape.value?.includes('Blank:')));
    assert.ok(layout.shapes.filter((shape) => shape.authorId).every((shape) => !shape.rotation));
  }
  assert.throws(() => createContributionTables(team, {authorOrder: 'guessed'}), /authorOrder/);
  const surnames = [
    {name: 'Zoe Zebra'}, {name: 'Roberto De Filippo'}, {name: 'Ido Aizenbud'},
    {name: 'Zara McExample', last_name: 'Baker'},
  ];
  assert.deepEqual(orderContributors(surnames, 'alphabetical').map((person) => person.name), [
    'Ido Aizenbud', 'Zara McExample', 'Roberto De Filippo', 'Zoe Zebra',
  ]);
  assert.equal(surnames[0].name, 'Zoe Zebra');
  const profileFixture = structuredClone(fixture);
  profileFixture.project.contributors[0].name = 'Zoe Zebra';
  profileFixture.project.contributors[1].name = 'Ada Alpha';
  await writeFile(fixturePath, JSON.stringify(profileFixture));
  await writeFile(join(profile, 'authorship-extractor.json'), JSON.stringify({
    print: {tables: ['credit', 'sections'], layout: 'compact', authorOrder: 'alphabetical'},
  }));
  const alphabeticalNode = plugin.directives[0].run({options: {authors: fixturePath}})[0];
  plugin.transforms[0].plugin({}, {})({children: [alphabeticalNode]}, {
    path: join(tempDir, 'article.md'), cwd: profile,
  });
  assert.deepEqual(JSON.parse(alphabeticalNode.model.authors).primary.map((person) => person.name), [
    'Ada Alpha', 'Zoe Zebra',
  ]);
  assert.equal(JSON.parse(alphabeticalNode.model.staticFigures).items.length, 2);
} finally {
  await rm(tempDir, { recursive: true, force: true });
}

console.log('Standalone plugin bundle verified');