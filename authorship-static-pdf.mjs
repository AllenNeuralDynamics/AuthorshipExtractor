import {PDFDocument, StandardFonts, degrees, rgb} from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

import {layoutContributionTable} from './authorship-static.mjs';

export async function renderContributionPdf(tables, options = {}) {
  if (!tables.length) throw new Error('No contribution tables were selected.');
  const document = await PDFDocument.create();
  document.registerFontkit(fontkit);
  const font = await document.embedFont(options.fontBytes ?? StandardFonts.Helvetica, {subset: true});
  const bold = options.boldFontBytes
    ? await document.embedFont(options.boldFontBytes, {subset: true})
    : await document.embedFont(StandardFonts.HelveticaBold);
  const layouts = tables.map((table) => layoutContributionTable(table, {
    ...options, measureText: (value, size) => font.widthOfTextAtSize(value, size),
  }));
  function color(value) {
    const components = [1, 3, 5].map((offset) => parseInt(value.slice(offset, offset + 2), 16) / 255);
    return rgb(...components);
  }
  for (const layout of layouts) {
    const margin = 12;
    const page = document.addPage([layout.width + 2 * margin, layout.height + 2 * margin]);
    for (const shape of layout.shapes) {
      if (shape.type === 'rect') {
        if (shape.fill === 'none') continue;
        page.drawRectangle({
          x: shape.x + margin, y: layout.height - shape.y - shape.height + margin,
          width: shape.width, height: shape.height, color: color(shape.fill),
        });
      } else {
        const face = shape.bold ? bold : font;
        const textWidth = face.widthOfTextAtSize(shape.value, shape.size);
        const offset = shape.anchor === 'end' ? textWidth : 0;
        page.drawText(shape.value, {
          x: shape.x - offset + margin, y: layout.height - shape.y + margin,
          size: shape.size, font: face, color: color(shape.fill),
          rotate: degrees(-(shape.rotation ?? 0)),
        });
      }
    }
  }
  document.setTitle('Authorship contribution tables');
  document.setAuthor(tables[0].allAuthorNames.join(', '));
  document.setSubject(options.source ?? 'Reported contribution levels; blank means not recorded.');
  document.setCreator('AuthorshipExtractor');
  document.setCreationDate(new Date(0));
  document.setModificationDate(new Date(0));
  return {bytes: await document.save({useObjectStreams: false}), layouts};
}