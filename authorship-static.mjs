export const CREDIT_ROLES = [
  'Conceptualization', 'Data curation', 'Formal analysis', 'Funding acquisition',
  'Investigation', 'Methodology', 'Project administration', 'Resources', 'Software',
  'Supervision', 'Validation', 'Visualization', 'Writing - original draft',
  'Writing - review & editing',
];

const COLORS = {
  lead: '#00665f', equal: '#2479a5', supporting: '#d5a524', recorded: '#52616b',
};

function normalizeRole(value) {
  return String(value).normalize('NFKC').toLowerCase()
    .replace(/[\u2013\u2014-]/g, ' ').replace(/&/g, 'and').replace(/\s+/g, ' ').trim();
}

function escapeXml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
  }[character]));
}

function estimatedWidth(value, size) {
  return Array.from(value.normalize('NFD').replace(/\p{M}/gu, ''))
    .reduce((width, character) => width + (
      /[MW@]/.test(character) ? 0.96 : /[ilI.,' :;]/.test(character) ? 0.32
        : /[A-Z]/.test(character) ? 0.74 : /[^\u0000-\u024f]/.test(character) ? 1 : 0.6
    ), 0) * size;
}

function assignments(contributor, kind) {
  const entries = kind === 'credit' ? contributor.credit_levels ?? []
    : contributor.section_contributions ?? [];
  const values = new Map();
  for (const entry of entries) {
    const key = kind === 'credit' ? normalizeRole(entry.role) : entry.section;
    const level = kind === 'credit' ? entry.level : entry.effort;
    if (!key || !Object.hasOwn(COLORS, level) || level === 'recorded') {
      throw new Error(`Invalid ${kind} contribution for ${contributor.name}.`);
    }
    if (kind === 'credit' && values.has(key)) {
      throw new Error(`Duplicate ${kind} contribution for ${contributor.name}.`);
    }
    values.set(key, kind === 'sections' ? [...(values.get(key) ?? []), level] : level);
  }
  if (kind === 'credit') {
    for (const role of contributor.roles ?? []) {
      const key = normalizeRole(role);
      if (!values.has(key)) values.set(key, 'recorded');
    }
    for (const key of values.keys()) {
      if (!CREDIT_ROLES.some((role) => normalizeRole(role) === key)) {
        throw new Error(`Unknown CRediT role for ${contributor.name}: ${key}`);
      }
    }
  }
  return values;
}

export function createContributionTables(data, options = {}) {
  const contributors = data?.project?.contributors ?? data?.contributors ?? [];
  if (!contributors.length || contributors.some((person) => !person.name?.trim())) {
    throw new Error('Static authorship tables require named contributors.');
  }
  const authorsPerBlock = Number(options.authorsPerBlock ?? 17);
  if (!Number.isInteger(authorsPerBlock) || authorsPerBlock < 1 || authorsPerBlock > 40) {
    throw new Error('authorsPerBlock must be an integer from 1 to 40.');
  }
  const kinds = options.tables ?? ['credit', 'sections'];
  if (!Array.isArray(kinds) || !kinds.length || kinds.some((kind) => !['credit', 'sections'].includes(kind))
      || new Set(kinds).size !== kinds.length) {
    throw new Error('Static table selection must contain credit and/or sections once each.');
  }
  const identifiers = contributors.map((person, index) => person.id ?? `author-${index + 1}`);
  if (new Set(identifiers).size !== identifiers.length) throw new Error('Contributor IDs must be unique.');
  const sectionOrder = [...(data?.portal?.sections ?? [])];
  for (const person of contributors) {
    for (const entry of person.section_contributions ?? []) {
      if (!sectionOrder.includes(entry.section)) sectionOrder.push(entry.section);
    }
  }
  const result = [];
  for (const kind of kinds) {
    const labels = kind === 'credit' ? CREDIT_ROLES : sectionOrder;
    if (!labels.length) continue;
    const values = contributors.map((person) => assignments(person, kind));
    for (let offset = 0; offset < contributors.length; offset += authorsPerBlock) {
      const people = contributors.slice(offset, offset + authorsPerBlock);
      const cells = labels.flatMap((label, row) => people.map((person, column) => {
        const recorded = values[offset + column].get(kind === 'credit' ? normalizeRole(label) : label);
        const levels = Array.isArray(recorded) ? recorded : recorded ? [recorded] : [];
        return {
          authorId: identifiers[offset + column], authorName: person.name,
          label, row, column, levels,
          level: levels.length > 1 ? 'multiple' : levels[0] ?? null,
        };
      }));
      result.push({
        kind, title: kind === 'credit' ? 'CRediT contributions' : 'Section contributions',
        block: Math.floor(offset / authorsPerBlock) + 1,
        blockCount: Math.ceil(contributors.length / authorsPerBlock),
        contributors: people, labels, cells, allAuthorNames: contributors.map((person) => person.name),
      });
    }
  }
  return result;
}

export function layoutContributionTable(table, options = {}) {
  const width = Number(options.width ?? 482);
  const fontSize = Number(options.fontSize ?? 8);
  if (!Number.isFinite(width) || width < 360 || !Number.isFinite(fontSize) || fontSize < 6) {
    throw new Error('Static table width must be at least 360pt and font size at least 6pt.');
  }
  const measure = options.measureText ?? estimatedWidth;
  const padding = 10;
  const rowHeight = fontSize + 6;
  const labelWidth = Math.max(...table.labels.map((label) => measure(label, fontSize))) + 15;
  const gridLeft = padding + labelWidth;
  const nameOverhang = measure(table.contributors.at(-1).name, fontSize) / Math.sqrt(2) + fontSize;
  const gridWidth = width - gridLeft - padding - nameOverhang;
  const columnWidth = gridWidth / table.contributors.length;
  if (columnWidth / Math.sqrt(2) < fontSize + 1) {
    throw new Error('Author columns are too narrow; reduce authorsPerBlock or increase width.');
  }
  const nameHeight = Math.max(...table.contributors.map((person) => measure(person.name, fontSize)))
    / Math.sqrt(2) + fontSize + 12;
  const gridTop = 34 + nameHeight;
  const gridBottom = gridTop + table.labels.length * rowHeight;
  const shapes = [];
  function text(value, x, y, extra = {}) {
    shapes.push({type: 'text', value, x, y, size: fontSize, fill: '#20343b', ...extra});
  }
  const suffix = table.blockCount > 1 ? ` (${table.block}/${table.blockCount})` : '';
  text(table.title + suffix, padding, 18, {size: 11, bold: true});
  table.contributors.forEach((person, column) => {
    text(person.name, gridLeft + (column + 0.5) * columnWidth, gridTop - 8, {
      rotation: -45, authorId: table.cells.find((cell) => cell.column === column).authorId,
    });
  });
  table.labels.forEach((label, row) => {
    text(label, gridLeft - 7, gridTop + row * rowHeight + fontSize + 1, {anchor: 'end'});
  });
  table.cells.forEach((cell) => {
    const levels = cell.levels.length ? cell.levels : [null];
    const segmentWidth = (columnWidth - 4) / levels.length;
    levels.forEach((level, index) => {
      shapes.push({
        type: 'rect', x: gridLeft + cell.column * columnWidth + 2 + index * segmentWidth,
        y: gridTop + cell.row * rowHeight + 2,
        width: segmentWidth, height: rowHeight - 4,
        fill: level ? COLORS[level] : 'none', cell: {...cell, level},
      });
    });
  });
  const levels = ['lead', 'equal', 'supporting'];
  if (table.cells.some((cell) => cell.level === 'recorded')) levels.push('recorded');
  let legendLeft = padding;
  for (const level of levels) {
    const title = level === 'recorded' ? 'Recorded (level not supplied)'
      : level[0].toUpperCase() + level.slice(1);
    shapes.push({type: 'rect', x: legendLeft, y: gridBottom + 10, width: 7, height: 7, fill: COLORS[level]});
    text(title, legendLeft + 11, gridBottom + 17, {size: 7});
    legendLeft += measure(title, 7) + 23;
  }
  text('Blank: not recorded', legendLeft, gridBottom + 17, {size: 7});
  const multiple = table.cells.some((cell) => cell.levels.length > 1);
  if (multiple) text('Split cells retain multiple reported section levels.', padding, gridBottom + 31, {size: 7});
  return {width, height: gridBottom + (multiple ? 43 : 29), shapes, table};
}

export function renderContributionSvg(layout) {
  const {width, height, shapes, table} = layout;
  const elements = shapes.map((shape) => {
    if (shape.type === 'rect') {
      const attributes = shape.cell ? ` data-author-id="${escapeXml(shape.cell.authorId)}" data-label="${escapeXml(shape.cell.label)}" data-level="${shape.cell.level ?? 'not-recorded'}"` : '';
      return `<rect x="${shape.x}" y="${shape.y}" width="${shape.width}" height="${shape.height}" fill="${shape.fill}"${attributes}/>`;
    }
    const rotation = shape.rotation ? ` transform="rotate(${shape.rotation} ${shape.x} ${shape.y})"` : '';
    const author = shape.authorId ? ` data-author-label="${escapeXml(shape.authorId)}"` : '';
    return `<text x="${shape.x}" y="${shape.y}" font-size="${shape.size}" fill="${shape.fill}" text-anchor="${shape.anchor ?? 'start'}"${shape.bold ? ' font-weight="700"' : ''}${rotation}${author}>${escapeXml(shape.value)}</text>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}pt" height="${height}pt" viewBox="0 0 ${width} ${height}" role="img"><title>${escapeXml(table.title)}</title><desc>Reported contribution levels. Blank means not recorded, not no contribution.</desc><rect width="100%" height="100%" fill="white"/><g font-family="Arial, Helvetica, sans-serif">${elements.join('')}</g></svg>\n`;
}