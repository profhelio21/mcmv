// Gerador mínimo de .xlsx (sem dependências): um ZIP "stored" com os XMLs da planilha.
// Suporta uma aba, cabeçalho estilizado, linha congelada, filtro e formato de moeda.

const enc = new TextEncoder();

const TABELA_CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = TABELA_CRC[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function zip(arquivos) {
  const partes = [];
  const central = [];
  let deslocamento = 0;
  const agora = new Date();
  const hora = (agora.getHours() << 11) | (agora.getMinutes() << 5) | (agora.getSeconds() >> 1);
  const data = ((agora.getFullYear() - 1980) << 9) | ((agora.getMonth() + 1) << 5) | agora.getDate();

  for (const a of arquivos) {
    const nome = enc.encode(a.nome);
    const dados = enc.encode(a.conteudo);
    const crc = crc32(dados);
    const tam = dados.length;

    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0);
    lh.writeUInt16LE(20, 4);
    lh.writeUInt16LE(0x0800, 6); // nomes em UTF-8
    lh.writeUInt16LE(0, 8); // sem compressão
    lh.writeUInt16LE(hora, 10);
    lh.writeUInt16LE(data, 12);
    lh.writeUInt32LE(crc, 14);
    lh.writeUInt32LE(tam, 18);
    lh.writeUInt32LE(tam, 22);
    lh.writeUInt16LE(nome.length, 26);
    lh.writeUInt16LE(0, 28);
    partes.push(lh, nome, dados);

    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50, 0);
    ch.writeUInt16LE(20, 4);
    ch.writeUInt16LE(20, 6);
    ch.writeUInt16LE(0x0800, 8);
    ch.writeUInt16LE(0, 10);
    ch.writeUInt16LE(hora, 12);
    ch.writeUInt16LE(data, 14);
    ch.writeUInt32LE(crc, 16);
    ch.writeUInt32LE(tam, 20);
    ch.writeUInt32LE(tam, 24);
    ch.writeUInt16LE(nome.length, 28);
    ch.writeUInt32LE(deslocamento, 42);
    central.push(ch, nome);

    deslocamento += 30 + nome.length + tam;
  }

  const tamCentral = central.reduce((s, b) => s + b.length, 0);
  const fim = Buffer.alloc(22);
  fim.writeUInt32LE(0x06054b50, 0);
  fim.writeUInt16LE(arquivos.length, 8);
  fim.writeUInt16LE(arquivos.length, 10);
  fim.writeUInt32LE(tamCentral, 12);
  fim.writeUInt32LE(deslocamento, 16);
  return Buffer.concat([...partes, ...central, fim]);
}

const esc = (s) =>
  String(s)
    // remove caracteres de controle inválidos em XML
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function letraColuna(i) {
  let s = "";
  for (let n = i + 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
  return s;
}

/**
 * @param {{aba:string, colunas:{titulo:string, largura:number, tipo?:'texto'|'moeda'|'numero'}[], linhas:any[][]}} cfg
 * @returns {Buffer}
 */
export function gerarXlsx({ aba, colunas, linhas }) {
  const ultima = letraColuna(colunas.length - 1);
  const totalLinhas = linhas.length + 1;

  const celula = (valor, col, linha, estilo) => {
    const ref = `${letraColuna(col)}${linha}`;
    if (valor === null || valor === undefined || valor === "") return "";
    if (typeof valor === "number" && Number.isFinite(valor))
      return `<c r="${ref}"${estilo ? ` s="${estilo}"` : ""}><v>${valor}</v></c>`;
    return `<c r="${ref}" t="inlineStr"${estilo ? ` s="${estilo}"` : ""}><is><t xml:space="preserve">${esc(valor)}</t></is></c>`;
  };

  let xmlLinhas = `<row r="1" ht="32" customHeight="1">${colunas
    .map((c, i) => celula(c.titulo, i, 1, 1))
    .join("")}</row>`;
  linhas.forEach((l, r) => {
    xmlLinhas += `<row r="${r + 2}">${l
      .map((v, i) => celula(v, i, r + 2, colunas[i].tipo === "moeda" ? 2 : 0))
      .join("")}</row>`;
  });

  const cols = colunas
    .map((c, i) => `<col min="${i + 1}" max="${i + 1}" width="${c.largura}" customWidth="1"/>`)
    .join("");

  const NS = 'xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"';
  const REL = 'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"';
  const CAB = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';

  const sheet =
    `${CAB}<worksheet ${NS}>` +
    `<dimension ref="A1:${ultima}${totalLinhas}"/>` +
    `<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>` +
    `<sheetFormatPr defaultRowHeight="15"/>` +
    `<cols>${cols}</cols><sheetData>${xmlLinhas}</sheetData>` +
    `<autoFilter ref="A1:${ultima}${totalLinhas}"/></worksheet>`;

  const estilos =
    `${CAB}<styleSheet ${NS}>` +
    `<numFmts count="1"><numFmt numFmtId="164" formatCode="&quot;R$&quot;\\ #,##0.00"/></numFmts>` +
    `<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font>` +
    `<font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts>` +
    `<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>` +
    `<fill><patternFill patternType="solid"><fgColor rgb="FF0F766E"/><bgColor indexed="64"/></patternFill></fill></fills>` +
    `<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>` +
    `<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>` +
    `<cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>` +
    `<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>` +
    `<xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs>` +
    `<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;

  return zip([
    {
      nome: "[Content_Types].xml",
      conteudo:
        `${CAB}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
        `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
        `<Default Extension="xml" ContentType="application/xml"/>` +
        `<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>` +
        `<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>` +
        `<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`,
    },
    {
      nome: "_rels/.rels",
      conteudo:
        `${CAB}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
        `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
    },
    {
      nome: "xl/workbook.xml",
      conteudo: `${CAB}<workbook ${NS} ${REL}><sheets><sheet name="${esc(aba)}" sheetId="1" r:id="rId1"/></sheets></workbook>`,
    },
    {
      nome: "xl/_rels/workbook.xml.rels",
      conteudo:
        `${CAB}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
        `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>` +
        `<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`,
    },
    { nome: "xl/styles.xml", conteudo: estilos },
    { nome: "xl/worksheets/sheet1.xml", conteudo: sheet },
  ]);
}
