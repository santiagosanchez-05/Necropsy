// Convierte docs/GDD.md en docs/GDD_Necropsy.docx.
// Las imágenes conceptuales se leen de docs/concept/ (png o jpg). Las que no
// existan quedan como un espacio reservado, así se puede volver a ejecutar
// el script cada vez que se agregue una imagen.
//
// Uso: NODE_PATH="$(npm root -g)" node docs/build/build-gdd-docx.js

const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, ShadingType, BorderStyle, AlignmentType, LevelFormat, ImageRun,
  Footer, PageNumber,
} = require('docx');

const DOCS = path.resolve(__dirname, '..');
const SRC = path.join(DOCS, 'GDD.md');
const OUT = path.join(DOCS, 'GDD_Necropsy.docx');
const CONCEPT_DIR = path.join(DOCS, 'concept');

const CONTENT_WIDTH = 9360; // carta, márgenes de 1"
const MAX_IMG_PX = 624;
const ACCENT = '5A0E1A';

// Un nombre de archivo por imagen. El script busca nombre.png y nombre.jpg.
const CONCEPTS = [
  { name: 'jefe1-caballero-demonio', caption: 'Jefe 1: caballero gótico demonio (ira)' },
  { name: 'jefe2-angel-demonio', caption: 'Jefe 2: demonio con apariencia de ángel (orgullo o vanidad)' },
  { name: 'jefe3-templario', caption: 'Jefe 3 (joven del vacío, depresión) y Templario' },
  { name: 'cazador', caption: 'Cazador' },
  { name: 'nivel1-castillo', caption: 'Nivel 1: castillo gótico' },
  { name: 'nivel2-iglesia', caption: 'Nivel 2: iglesia' },
  { name: 'nivel3-catacumbas', caption: 'Nivel 3: catacumbas' },
];

// ---------- inline ----------

function statusColor(text) {
  if (/^\[Definido/.test(text)) return '2E7D32';
  if (/^\[Propuesto/.test(text)) return 'B26A00';
  if (/^\[Pendiente/.test(text)) return 'B3261E';
  return undefined;
}

function inlineRuns(text, base = {}) {
  const runs = [];
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter((p) => p !== '');
  for (const part of parts) {
    if (part.startsWith('**') && part.endsWith('**')) {
      const inner = part.slice(2, -2);
      runs.push(new TextRun({ ...base, text: inner, bold: true, color: statusColor(inner) || base.color }));
    } else if (part.startsWith('`') && part.endsWith('`')) {
      runs.push(new TextRun({ ...base, text: part.slice(1, -1), font: 'Consolas', size: 20, shading: { type: ShadingType.CLEAR, fill: 'EEEEEE' } }));
    } else {
      runs.push(new TextRun({ ...base, text: part }));
    }
  }
  return runs;
}

// ---------- tablas ----------

function splitRow(line) {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
}

function buildTable(rows) {
  const header = splitRow(rows[0]);
  const body = rows.slice(2).map(splitRow);
  const cols = header.length;
  const widths = Array(cols).fill(Math.floor(CONTENT_WIDTH / cols));
  widths[cols - 1] += CONTENT_WIDTH - widths.reduce((a, b) => a + b, 0);

  const border = { style: BorderStyle.SINGLE, size: 4, color: 'BBBBBB' };
  const borders = { top: border, bottom: border, left: border, right: border };

  const cell = (text, i, isHeader) => new TableCell({
    width: { size: widths[i], type: WidthType.DXA },
    borders,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    shading: isHeader ? { type: ShadingType.CLEAR, fill: 'EADDDF' } : undefined,
    children: [new Paragraph({ children: inlineRuns(text, { size: 20, bold: isHeader }) })],
  });

  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: widths,
    rows: [
      new TableRow({ tableHeader: true, children: header.map((t, i) => cell(t, i, true)) }),
      ...body.map((r) => new TableRow({ children: header.map((_, i) => cell(r[i] || '', i, false)) })),
    ],
  });
}

// ---------- imágenes ----------

function imageSize(buf, ext) {
  if (ext === '.png') return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xff) { i++; continue; }
    const marker = buf[i + 1];
    const len = buf.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
    }
    i += 2 + len;
  }
  return { w: 512, h: 512 };
}

function conceptBlocks() {
  const blocks = [];
  for (const c of CONCEPTS) {
    const found = ['.png', '.jpg', '.jpeg']
      .map((e) => ({ e, p: path.join(CONCEPT_DIR, c.name + e) }))
      .find((x) => fs.existsSync(x.p));

    blocks.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(c.caption)] }));

    if (found) {
      const data = fs.readFileSync(found.p);
      const { w, h } = imageSize(data, found.e);
      const scale = Math.min(1, MAX_IMG_PX / w);
      blocks.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 120, after: 120 },
        children: [new ImageRun({
          type: found.e === '.png' ? 'png' : 'jpg',
          data,
          transformation: { width: Math.round(w * scale), height: Math.round(h * scale) },
          altText: { title: c.caption, description: c.caption, name: c.name },
        })],
      }));
    } else {
      blocks.push(new Paragraph({
        spacing: { before: 120, after: 200 },
        children: [new TextRun({ text: `[Imagen pendiente: docs/concept/${c.name}.png]`, italics: true, color: '888888' })],
      }));
    }
  }
  return blocks;
}

// ---------- documento ----------

function build() {
  const lines = fs.readFileSync(SRC, 'utf8').replace(/\r/g, '').split('\n');
  const children = [];
  const numberingInstances = [];
  let listInstance = 0;
  let i = 0;
  let inConcept = false;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === '' || line.trim() === '---') { i++; continue; }

    let m;
    if ((m = line.match(/^# (.+)/))) {
      children.push(new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { after: 120 },
        children: [new TextRun({ text: m[1], bold: true, size: 44, color: ACCENT })],
      }));
      i++; continue;
    }
    if ((m = line.match(/^## (.+)/))) {
      inConcept = /Arte conceptual/.test(m[1]);
      children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(m[1])] }));
      i++; continue;
    }
    if ((m = line.match(/^### (.+)/))) {
      children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(m[1])] }));
      i++; continue;
    }

    if (line.trim().startsWith('|')) {
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) { rows.push(lines[i]); i++; }
      children.push(buildTable(rows));
      children.push(new Paragraph({ spacing: { after: 120 }, children: [] }));
      continue;
    }

    if (/^\d+\. /.test(line)) {
      listInstance++;
      numberingInstances.push(listInstance);
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        children.push(new Paragraph({
          numbering: { reference: 'numbers', level: 0, instance: listInstance },
          spacing: { after: 60 },
          children: inlineRuns(lines[i].replace(/^\d+\. /, '')),
        }));
        i++;
      }
      continue;
    }

    if (/^- /.test(line)) {
      // En la sección de arte conceptual la lista solo anuncia las imágenes
      // que vienen después, así que no se repite.
      const skip = inConcept;
      while (i < lines.length && /^- /.test(lines[i])) {
        if (!skip) {
          children.push(new Paragraph({
            numbering: { reference: 'bullets', level: 0 },
            spacing: { after: 60 },
            children: inlineRuns(lines[i].replace(/^- /, '')),
          }));
        }
        i++;
      }
      continue;
    }

    children.push(new Paragraph({ spacing: { after: 120 }, children: inlineRuns(line) }));
    i++;
  }

  children.push(...conceptBlocks());

  const numbers = {
    reference: 'numbers',
    levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 720, hanging: 360 } } } }],
  };

  return new Document({
    creator: 'Necropsy',
    title: 'Necropsy: Documento de diseño de juego',
    styles: {
      default: { document: { run: { font: 'Calibri', size: 22 } } },
      paragraphStyles: [
        { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 32, bold: true, color: ACCENT, font: 'Calibri' },
          paragraph: { spacing: { before: 360, after: 160 }, outlineLevel: 0 } },
        { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 26, bold: true, color: '333333', font: 'Calibri' },
          paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 } },
      ],
    },
    numbering: {
      config: [
        { reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
        numbers,
      ],
    },
    sections: [{
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      footers: {
        default: new Footer({ children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: 'Necropsy · GDD · página ', size: 18, color: '888888' }),
            new TextRun({ children: [PageNumber.CURRENT], size: 18, color: '888888' })],
        })] }),
      },
      children,
    }],
  });
}

Packer.toBuffer(build()).then((buf) => {
  fs.writeFileSync(OUT, buf);
  console.log('escrito', OUT, buf.length, 'bytes');
});
