import {createHash} from 'node:crypto';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {resolve, join} from 'node:path';
import {parseArgs} from 'node:util';

import {parse} from 'yaml';

import {createContributionTables, layoutContributionTable, renderContributionSvg} from '../authorship-static.mjs';

const {values} = parseArgs({options: {
  authors: {type: 'string', default: './authors.yml'},
  out: {type: 'string', default: './_build/authorship-static'},
  format: {type: 'string', default: 'both'},
  tables: {type: 'string', default: 'credit,sections'},
  'authors-per-block': {type: 'string', default: '17'},
  font: {type: 'string'},
  'bold-font': {type: 'string'},
}});
if (!['svg', 'pdf', 'both'].includes(values.format)) throw new Error('format must be svg, pdf, or both.');
const sourcePath = resolve(values.authors);
const source = await readFile(sourcePath);
const data = parse(source.toString('utf8'));
const options = {
  tables: values.tables.split(',').map((kind) => kind.trim()),
  authorsPerBlock: Number(values['authors-per-block']),
};
const tables = createContributionTables(data, options);
if (!tables.length) throw new Error('The selected source contains no contribution tables.');
let layouts = values.format === 'svg' ? tables.map((table) => layoutContributionTable(table)) : [];
const output = resolve(values.out);
await mkdir(output, {recursive: true});
if (values.format !== 'svg') {
  const {renderContributionPdf} = await import('../authorship-static-pdf.mjs');
  try {
    const result = await renderContributionPdf(tables, {
      fontBytes: values.font ? await readFile(resolve(values.font)) : undefined,
      boldFontBytes: values['bold-font'] ? await readFile(resolve(values['bold-font'])) : undefined,
      source: data.source?.endpoint,
    });
    layouts = result.layouts;
    await writeFile(join(output, 'authorship-contributions.pdf'), result.bytes);
  } catch (error) {
    if (/WinAnsi|encode/i.test(error.message)) {
      throw new Error('A name requires a Unicode font. Supply --font /path/to/font.ttf.', {cause: error});
    }
    throw error;
  }
}
const assets = [];
for (const layout of layouts) {
  const filename = `${layout.table.kind}-${layout.table.block}.svg`;
  if (values.format !== 'pdf') await writeFile(join(output, filename), renderContributionSvg(layout));
  assets.push({
    file: values.format === 'pdf' ? undefined : filename,
    pdfPage: values.format === 'svg' ? undefined : assets.length + 1,
    kind: layout.table.kind, block: layout.table.block,
    authors: layout.table.contributors.map((person) => ({id: person.id, name: person.name})),
    rows: layout.table.labels, cells: layout.table.cells,
  });
}
await writeFile(join(output, 'provenance.json'), JSON.stringify({
  source: sourcePath, sha256: createHash('sha256').update(source).digest('hex'),
  sourceUrl: data.source?.endpoint, options, assets,
}, null, 2) + '\n');
console.log(`Exported ${tables.length} table blocks from ${tables[0].allAuthorNames.length} contributors to ${output}`);