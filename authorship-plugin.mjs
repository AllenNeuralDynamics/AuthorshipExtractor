// authorship-plugin.mjs — MyST plugin: directive + transform
// Creates an anywidget node with author data baked in.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname, join, relative } from 'node:path';
import { createHash } from 'node:crypto';
import { parse } from 'yaml';
import { createContributionTables, layoutContributionTable, orderContributors, renderContributionSvg } from './authorship-static.mjs';

export { createContributionTables, layoutContributionTable, orderContributors, renderContributionSvg } from './authorship-static.mjs';

const widgetEsm = typeof __AUTHORSHIP_WIDGET_ESM__ === 'string'
  ? __AUTHORSHIP_WIDGET_ESM__
  : readFileSync(new URL('./authorship-widget.mjs', import.meta.url), 'utf8');
const widgetCss = typeof __AUTHORSHIP_WIDGET_CSS__ === 'string'
  ? __AUTHORSHIP_WIDGET_CSS__
  : readFileSync(new URL('./authorship-widget.css', import.meta.url), 'utf8');

const assetHash = createHash('sha256')
  .update(widgetEsm)
  .update(widgetCss)
  .digest('hex')
  .slice(0, 12);

function toRelativeAssetPath(fromDir, targetPath) {
  const path = relative(fromDir, targetPath).replace(/\\/g, '/');
  return path.startsWith('.') ? path : `./${path}`;
}

function materializeWidgetAssets(projectDir, docDir) {
  const assetDir = join(projectDir, '_build', '.authorship-extractor', assetHash);
  const esmPath = join(assetDir, 'authorship-widget.mjs');
  const cssPath = join(assetDir, 'authorship-widget.css');
  mkdirSync(assetDir, { recursive: true });
  writeFileSync(esmPath, widgetEsm);
  writeFileSync(cssPath, widgetCss);
  return {
    esm: toRelativeAssetPath(docDir, esmPath),
    css: toRelativeAssetPath(docDir, cssPath),
  };
}

const authorshipDirective = {
  name: 'authorship-explorer',
  doc: 'Renders an interactive authorship contribution explorer widget.',
  options: {
    authors: {
      type: String,
      doc: 'Path to authors YAML file (default: ./authors.yml)',
    },
    'authors-alt': {
      type: String,
      doc: 'Path to alternate authors YAML file for toggle (e.g. ./authors-real.yml)',
    },
    'alt-label': {
      type: String,
      doc: 'Label for the alternate dataset (default: "Real contributors")',
    },
    'authors-alt2': {
      type: String,
      doc: 'Path to second alternate authors YAML file',
    },
    'alt2-label': {
      type: String,
      doc: 'Label for the second alternate dataset',
    },
    height: {
      type: String,
      doc: 'Widget height, e.g. "800px"',
    },
    'print-tables': {
      type: String,
      doc: 'Optional static print tables: credit, sections, or credit,sections. Disabled by default.',
    },
    'print-authors-per-block': {
      type: Number,
      doc: 'Maximum authors in each static table block (default: 17).',
    },
    'print-layout': {
      type: String,
      doc: 'Static layout: columns (default) or compact author rows.',
    },
    'print-author-order': {
      type: String,
      doc: 'Static author order: source (default) or alphabetical by surname.',
    },
  },
  run(data) {
    return [
      {
        type: 'authorship-explorer',
        authorsPath: data.options?.authors || './authors.yml',
        authorsAltPath: data.options?.['authors-alt'] || null,
        altLabel: data.options?.['alt-label'] || 'Real contributors',
        authorsAlt2Path: data.options?.['authors-alt2'] || null,
        alt2Label: data.options?.['alt2-label'] || 'Large team',
        height: data.options?.height || '800px',
        printTables: data.options?.['print-tables'] || '',
        printAuthorsPerBlock: data.options?.['print-authors-per-block'],
        printLayout: data.options?.['print-layout'] ?? 'columns',
        printAuthorOrder: data.options?.['print-author-order'] ?? 'source',
      },
    ];
  },
};

const staticDirective = {
  name: 'authorship-tables',
  doc: 'Render native static contribution figures for HTML and PDF export.',
  options: {
    authors: authorshipDirective.options.authors,
    tables: {type: String, doc: 'credit, sections, or credit,sections (default).'},
    'authors-per-block': authorshipDirective.options['print-authors-per-block'],
    layout: authorshipDirective.options['print-layout'],
    'author-order': authorshipDirective.options['print-author-order'],
  },
  run(data) {
    const node = authorshipDirective.run({options: {
      authors: data.options?.authors,
      'print-tables': data.options?.tables || 'credit,sections',
      'print-authors-per-block': data.options?.['authors-per-block'],
      'print-layout': data.options?.layout,
      'print-author-order': data.options?.['author-order'],
    }})[0];
    return [{...node, staticOnly: true}];
  },
};

function staticFigures(data, node, projectDir, docDir) {
  const tables = createContributionTables(data, {
    tables: node.printTables.split(',').map((kind) => kind.trim()),
    authorsPerBlock: node.printAuthorsPerBlock,
    layout: node.printLayout,
    authorOrder: node.printAuthorOrder,
  });
  const directory = join(projectDir, '_build', '.authorship-extractor', 'static');
  mkdirSync(directory, {recursive: true});
  return tables.map((table) => {
    const layout = layoutContributionTable(table);
    const svg = renderContributionSvg(layout);
    const hash = createHash('sha256').update(svg).digest('hex').slice(0, 20);
    const path = join(directory, `${table.kind}-${hash}.svg`);
    writeFileSync(path, svg);
    return {
      url: toRelativeAssetPath(docDir, path), kind: table.kind,
      title: table.title, block: table.block, blockCount: table.blockCount,
      width: layout.width, height: layout.height,
      alt: `${table.title}, block ${table.block} of ${table.blockCount}. Blank means not recorded.`,
    };
  });
}

const authorshipTransform = {
  name: 'authorship-data-loader',
  stage: 'document',
  plugin: (opts, utils) => (tree, vfile) => {
    // Build section ID → heading text map from the document AST
    const sectionLabels = {};
    function collectHeadings(n) {
      if (!n) return;
      if (n.type === 'heading' && n.identifier) {
        const text = (n.children || [])
          .filter(c => c.type === 'text')
          .map(c => c.value)
          .join('');
        if (text) sectionLabels[n.identifier] = text;
      }
      if (n.children) for (const child of n.children) collectHeadings(child);
    }
    collectHeadings(tree);

    function transform(node) {
      if (!node) return;

      if (node.type === 'authorship-explorer') {
        const docDir = vfile?.path ? dirname(vfile.path) : process.cwd();
        const projectDir = vfile?.cwd || process.cwd();
        const yamlPath = resolve(docDir, node.authorsPath || './authors.yml');

        try {
          const raw = readFileSync(yamlPath, 'utf-8');
          const fullData = parse(raw);

          // Helper: resolve affiliation ID strings to full objects
          function resolveAffiliations(data) {
            const contribs = data?.project?.contributors || data?.contributors || [];
            const affDefs = data?.project?.affiliations || data?.affiliations || [];
            const affMap = Object.fromEntries(affDefs.map(a => [a.id, a]));
            return contribs.map(c => {
              if (!c.affiliations) return c;
              return {
                ...c,
                affiliations: c.affiliations.map(aff =>
                  typeof aff === 'string' ? (affMap[aff] || { id: aff, name: aff }) : aff
                ),
              };
            });
          }

          let contributors = resolveAffiliations(fullData);
          if (!node.printTables) {
            const configPath = [projectDir, process.cwd()]
              .map((directory) => join(directory, 'authorship-extractor.json'))
              .find((path) => existsSync(path));
            if (configPath) {
              const settings = JSON.parse(readFileSync(configPath, 'utf8')).print;
              if (settings) {
                if (!Array.isArray(settings.tables)) throw new Error('Print configuration requires a tables array.');
                node.printTables = settings.tables.join(',');
                node.printAuthorsPerBlock = settings.authorsPerBlock;
                node.printLayout = settings.layout ?? 'columns';
                node.printAuthorOrder = settings.authorOrder ?? 'source';
              }
            }
          }
          const figures = node.printTables ? staticFigures(fullData, node, projectDir, docDir) : null;
          if (figures) contributors = orderContributors(contributors, node.printAuthorOrder);
          if (node.staticOnly) {
            node.type = 'div';
            node.children = figures.map((figure) => ({
              type: 'image', url: figure.url, alt: figure.alt, width: '100%',
            }));
            for (const key of ['authorsPath', 'authorsAltPath', 'authorsAlt2Path', 'altLabel', 'alt2Label', 'height', 'printTables', 'printAuthorsPerBlock', 'printLayout', 'printAuthorOrder', 'staticOnly']) delete node[key];
            return;
          }

          // Load alternate authors if specified
          let altContributors = null;
          let altLabel = node.altLabel || 'Real contributors';
          if (node.authorsAltPath) {
            try {
              const altPath = resolve(docDir, node.authorsAltPath);
              const altRaw = readFileSync(altPath, 'utf-8');
              const altData = parse(altRaw);
              altContributors = resolveAffiliations(altData);
            } catch (altErr) {
              console.warn(`authorship-plugin: Alt authors error: ${altErr.message}`);
            }
          }

          // Load second alternate authors if specified
          let alt2Contributors = null;
          let alt2Label = node.alt2Label || 'Large team';
          if (node.authorsAlt2Path) {
            try {
              const alt2Path = resolve(docDir, node.authorsAlt2Path);
              const alt2Raw = readFileSync(alt2Path, 'utf-8');
              const alt2Data = parse(alt2Raw);
              alt2Contributors = resolveAffiliations(alt2Data);
            } catch (alt2Err) {
              console.warn(`authorship-plugin: Alt2 authors error: ${alt2Err.message}`);
            }
          }

          // Build the data envelope with primary + optional alt dataset
          const envelope = {
            primary: contributors,
            sourceFiles: [node.authorsPath || './authors.yml'],
          };
          if (altContributors) {
            envelope.alt = altContributors;
            envelope.altLabel = altLabel;
            if (node.authorsAltPath) envelope.sourceFiles.push(node.authorsAltPath);
          }
          if (alt2Contributors) {
            envelope.alt2 = alt2Contributors;
            envelope.alt2Label = alt2Label;
            if (node.authorsAlt2Path) envelope.sourceFiles.push(node.authorsAlt2Path);
          }

          // Convert to anywidget node
          const widgetAssets = materializeWidgetAssets(projectDir, docDir);
          node.type = 'anywidget';
          node.id = `authorship-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
          node.esm = widgetAssets.esm;
          node.css = widgetAssets.css;
          node.model = {
            authors: JSON.stringify(envelope),
            sectionLabels: JSON.stringify(sectionLabels),
            height: node.height || '800px',
          };
          if (figures) node.model.staticFigures = JSON.stringify({version: 1, items: figures});
          delete node.authorsPath;
          delete node.authorsAltPath;
          delete node.altLabel;
          delete node.authorsAlt2Path;
          delete node.alt2Label;
          delete node.height;
          delete node.printTables;
          delete node.printAuthorsPerBlock;
          delete node.printLayout;
          delete node.printAuthorOrder;
        } catch (err) {
          console.warn(`authorship-plugin: Error: ${err.message}`);
          node.type = 'paragraph';
          node.children = [
            { type: 'text', value: `[Authorship Explorer: ${err.message}]` },
          ];
          delete node.authorsPath;
          delete node.height;
        }
      }

      if (node.children) {
        for (const child of node.children) {
          if (child) transform(child);
        }
      }
    }

    transform(tree);
  },
};

const plugin = {
  name: 'Authorship Explorer',
  directives: [authorshipDirective, staticDirective],
  transforms: [authorshipTransform],
};

export default plugin;
