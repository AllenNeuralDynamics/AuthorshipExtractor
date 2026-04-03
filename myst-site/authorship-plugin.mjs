// authorship-plugin.mjs — MyST plugin: directive + transform
// Creates an anywidget node with author data baked in.

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

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
    height: {
      type: String,
      doc: 'Widget height, e.g. "800px"',
    },
  },
  run(data) {
    return [
      {
        type: 'authorship-explorer',
        authorsPath: data.options?.authors || './authors.yml',
        authorsAltPath: data.options?.['authors-alt'] || null,
        altLabel: data.options?.['alt-label'] || 'Real contributors',
        height: data.options?.height || '800px',
      },
    ];
  },
};

const authorshipTransform = {
  name: 'authorship-data-loader',
  stage: 'document',
  plugin: (opts, utils) => (tree, vfile) => {
    function transform(node) {
      if (!node) return;

      if (node.type === 'authorship-explorer') {
        const docDir = vfile?.path ? dirname(vfile.path) : process.cwd();
        const yamlPath = resolve(docDir, node.authorsPath || './authors.yml');

        try {
          const raw = readFileSync(yamlPath, 'utf-8');
          const { parse } = require('yaml');
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

          const contributors = resolveAffiliations(fullData);

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

          // Build the data envelope with primary + optional alt dataset
          const envelope = {
            primary: contributors,
          };
          if (altContributors) {
            envelope.alt = altContributors;
            envelope.altLabel = altLabel;
          }

          // Convert to anywidget node
          node.type = 'anywidget';
          node.id = `authorship-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
          node.esm = './authorship-widget.mjs';
          node.css = './authorship-widget.css';
          node.model = {
            authors: JSON.stringify(envelope),
            height: node.height || '800px',
          };
          delete node.authorsPath;
          delete node.authorsAltPath;
          delete node.altLabel;
          delete node.height;
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
  directives: [authorshipDirective],
  transforms: [authorshipTransform],
};

export default plugin;
