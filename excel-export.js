(function (root) {
  'use strict';

  var BLACK = { argb: 'FF000000' };
  var GRAY = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFEDEDED' },
  };
  var SEAL = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1B4332' },
  };
  var COL_PT = [53.2, 46.2, 44.6, 40.2, 41.7, 46.8, 43.5, 44.6, 51.3, 63.5, 23.4];
  var TARGET_PX = 748;

  function font(size, bold, color) {
    var face = { name: 'Calibri', size: size, bold: !!bold };
    if (color) face.color = { argb: color };
    return face;
  }

  var center = { horizontal: 'center', vertical: 'middle', wrapText: true };
  var leftMid = { horizontal: 'left', vertical: 'middle', wrapText: true, indent: 1 };
  var topLeft = { horizontal: 'left', vertical: 'top', wrapText: true };

  function str(value) {
    return value == null ? '' : String(value);
  }

  var FPJ = {
    legal: {
      titulo: 'RELATÓRIO TÉCNICO DE VISTORIA - MANEJO DA ARBORIZAÇÃO',
      citacaoFolha1: 'ART. 477 LEI ORGÂNICA DO MUNICÍPIO - LEI 9.605/98 - Lei de Crimes Ambientais',
      citacaoContinua: 'ART. 477 LEI ORGÂNICA DO MUNICÍPIO; LEI 9.605/98 (Lei de Crimes Ambientais); LEI 691/84 (Código Tributário)',
      instituicao: 'FUNDAÇÃO PARQUES E JARDINS - DIRETORIA DE ARBORIZAÇÃO (http://prefeitura.rio/web/fpj)',
      legenda: 'MANEJO: SI (sem intervenção); LP (poda de limpeza); RL (poda de desrama ou raleamento); PRA (poda de rebaixamento de altura); EL (poda de elevação de copa); RC (poda de redução de copa); CO (poda de condução); EM (poda emergencial); LT (poda de latada); RE (poda de restauração); VI (poda para vistas); RZ (poda de raízes); TF (tratamento fitossanitário); TP (transplantio); RM (remoção); RI* (remoção imediata) – *neste caso o solicitante está AUTORIZADO a remover a árvore imediatamente, devendo a respectiva licença ser posteriormente retirada na tesouraria da Fundação Parques e Jardins, situada à Praça da República s/nº, Campo de Santana.OBS.: Para árvore de domínio público não existe a cobrança de taxa (LEI 691/84-Código Tributário).',
      servicos: 'Os serviços a serem executados em área particular são de competência do proprietário ou responsável, não sendo efetuados pela FPJ. Em área pública é obrigatória a contratação de credenciado/FPJ.',
      rm: 'RM – REMOÇÃO sem ser imediata: o responsável deve requerer a AUTORIZAÇÃO ATRAVÉS DE PROCESSO ADMINISTRATIVO no protocolo da Fundação no Campo de Santana, a qual dispõe também de uma listagem de PROFISSIONAIS CREDENCIADOS para execução de remoção, poda ou plantio de árvores.No caso de PODA ou CORTE DE RAÍZES: o responsável deve consultar um profissional habilitado (Eng. Florestal ou Agrônomo) para execução do serviço dentro dos critérios técnicos adequados. O corte das raízes, mesmo as superficiais, é muito perigoso, pois pode desestabilizar o vegetal, provocando sua queda.\nEXIGÊNCIA DE PLANTIO: O não cumprimento do replantio/medida compensatória exigido, acarretará na aplicação das sanções cabíveis, ou seja, aplicação de multa conforme Art. 136, do Decreto “E” 3.800/70.',
      lgpd: 'Os dados pessoais tratados em decorrência do presente documentol deverão ser utilizados única e exclusivamente para cumprir a finalidade a que se destinam e em respeito à legislação aplicável sobre segurança da informação, privacidade e proteção de dados, inclusive, mas não se limitando à Lei Geral de Proteção de Dados – LGPD (Lei Federal nº 13.709/18). Uma vez atingida a finalidade, os dados pessoais deverão ser eliminados ou anonimizados, conforme disposto no artigo 16 da LGPD',
    },
    boldPhrases: [
      'RI* (remoção imediata)',
      'AUTORIZADO',
      'AUTORIZAÇÃO ATRAVÉS DE PROCESSO ADMINISTRATIVO',
      'PROFISSIONAIS CREDENCIADOS',
      'PODA ou CORTE DE RAÍZES',
      'EXIGÊNCIA DE PLANTIO:',
    ],
    manejo: [
      ['SI', 'SI — sem intervenção'],
      ['LP', 'LP — poda de limpeza'],
      ['RL', 'RL — poda de desrama ou raleamento'],
      ['PRA', 'PRA — poda de rebaixamento de altura'],
      ['EL', 'EL — poda de elevação de copa'],
      ['RC', 'RC — poda de redução de copa'],
      ['RC/LP', 'RC/LP — redução de copa e limpeza'],
      ['CO', 'CO — poda de condução'],
      ['EM', 'EM — poda emergencial'],
      ['LT', 'LT — poda de latada'],
      ['RE', 'RE — poda de restauração'],
      ['RE/RC', 'RE/RC — restauração e redução de copa'],
      ['VI', 'VI — poda para vistas'],
      ['RZ', 'RZ — poda de raízes'],
      ['TF', 'TF — tratamento fitossanitário'],
      ['TP', 'TP — transplantio'],
      ['RM', 'RM — remoção'],
      ['RI', 'RI — remoção imediata'],
    ],
    especies: [
      ['Mangifera indica', 'Mangueira'],
      ['Terminalia catappa', 'Amendoeira'],
      ['Ficus benjamina', 'Figueira benjamina'],
      ['Spondias mombin', 'Cajá'],
      ['Cocos nucifera', 'Coqueiro'],
      ['Licania tomentosa', 'Oiti'],
      ['Cenostigma pluviosum', 'Sibipiruna'],
      ['Delonix regia', 'Flamboyant'],
      ['Pachira aquatica', 'Monguba'],
      ['Paubrasilia echinata', 'Pau-brasil'],
      ['Handroanthus albus', 'Ipê-amarelo'],
      ['Handroanthus heptaphyllus', 'Ipê-rosa'],
      ['Tabebuia roseoalba', 'Ipê-branco'],
      ['Libidibia ferrea', 'Pau-ferro'],
      ['Cassia fistula', 'Chuva-de-ouro'],
      ['Lagerstroemia speciosa', 'Resedá'],
      ['Tibouchina granulosa', 'Quaresmeira'],
      ['Schinus terebinthifolia', 'Aroeira'],
      ['Eugenia uniflora', 'Pitangueira'],
      ['Psidium guajava', 'Goiabeira'],
      ['Artocarpus heterophyllus', 'Jaqueira'],
      ['Syzygium malaccense', 'Jambo'],
      ['Syzygium cumini', 'Jambolão'],
      ['Clitoria fairchildiana', 'Sombreiro'],
      ['Leucaena leucocephala', 'Leucena'],
      ['Filicium decipiens', 'Árvore-samambaia'],
      ['Bauhinia variegata', 'Pata-de-vaca'],
      ['Couroupita guianensis', 'Abricó-de-macaco'],
      ['Roystonea oleracea', 'Palmeira-imperial'],
      ['Dypsis lutescens', 'Areca-bambu'],
    ],
    criteria: [
      { key: 'equilibrio', coluna: 'EQUILÍBRIO', item: 'EQUILÍBRIO', grupo: 'condicoes', opcoes: [
        { nota: 0, texto: 'Equilibrado' },
        { nota: 1, texto: 'Levemente alterado' },
        { nota: 3, texto: 'Alterado' },
        { nota: 5, texto: 'Muito alterado' },
      ]},
      { key: 'estrutura', coluna: 'ESTRUTURA', item: 'ESTADO ESTRUTURAL', grupo: 'condicoes', opcoes: [
        { nota: 0, texto: 'Íntegro' },
        { nota: 1, texto: 'Pouco comprometido' },
        { nota: 3, texto: 'Comprometido' },
        { nota: 5, texto: 'Muito comprometido' },
      ]},
      { key: 'conflitos', coluna: 'CONFLITOS', item: 'CONFLITOS', grupo: 'condicoes', opcoes: [
        { nota: 0, texto: 'Inexistente' },
        { nota: 1, texto: 'Leve' },
        { nota: 3, texto: 'Moderado' },
        { nota: 5, texto: 'Acentuado' },
      ]},
      { key: 'eft', coluna: 'EFT', item: 'ESTADO FITOSSANITÁRIO (EFT)', grupo: 'condicoes', opcoes: [
        { nota: 0, texto: 'Bom' },
        { nota: 1, texto: 'Satisfatório' },
        { nota: 3, texto: 'Insatisfatório' },
        { nota: 5, texto: 'Crítico' },
      ]},
      { key: 'alvo', coluna: 'ALVO', item: 'ALVO', grupo: 'conformidade', opcoes: [
        { nota: 0, texto: 'Inexistente/irrelevante' },
        { nota: 1, texto: 'Pouco relevante' },
        { nota: 3, texto: 'Relevante' },
        { nota: 5, texto: 'Crítico' },
      ]},
      { key: 'especie', coluna: 'ESPÉCIE', item: 'ADEQUAÇÃO DA ESPÉCIE', grupo: 'conformidade', opcoes: [
        { nota: 0, texto: 'Adequada' },
        { nota: 1, texto: 'Adequada com restrições' },
        { nota: 3, texto: 'Inadequada' },
        { nota: 5, texto: 'Muito inadequada' },
      ]},
      { key: 'sitio', coluna: 'SÍTIO', item: 'FATORES ASSOCIADOS AO SÍTIO', grupo: 'conformidade', opcoes: [
        { nota: 0, texto: 'Adequado' },
        { nota: 1, texto: 'Adequado com interferências' },
        { nota: 3, texto: 'Inadequado' },
        { nota: 5, texto: 'Muito inadequado' },
      ]},
    ],
    faixas: [
      { grade: '0-5', classe: '0 a 5', label: 'Satisfatório' },
      { grade: '6-11', classe: '6 a 11', label: 'Regular' },
      { grade: '12-24', classe: '12 a 24', label: 'Insatisfatório' },
      { grade: '25-40', classe: '25 a 40', label: 'Crítico' },
    ],
    grupos: [
      { id: 'condicoes', titulo: 'CONDIÇÕES DO ESPÉCIME' },
      { id: 'conformidade', titulo: 'CONFORMIDADE' },
    ],
  };

  function scoreSum(scores) {
    if (!scores) return null;
    var total = 0;
    for (var i = 0; i < FPJ.criteria.length; i++) {
      var note = scores[FPJ.criteria[i].key];
      if (note !== 0 && note !== 1 && note !== 3 && note !== 5) return null;
      total += note;
    }
    return total;
  }

  function scoreBand(sum) {
    if (sum === null || sum === undefined || sum === '') return null;
    var value = Number(sum);
    if (!isFinite(value)) return null;
    for (var i = 0; i < FPJ.faixas.length; i++) {
      var parts = FPJ.faixas[i].grade.split('-');
      if (value >= Number(parts[0]) && value <= Number(parts[1])) {
        return {
          index: i,
          label: FPJ.faixas[i].label,
          faixa: FPJ.faixas[i].grade,
        };
      }
    }
    return {
      index: FPJ.faixas.length - 1,
      label: 'Crítico',
      faixa: '25-40',
    };
  }

  function emphasize(text, size) {
    var phrases = FPJ.boldPhrases.slice().sort(function (a, b) { return b.length - a.length; });
    var rich = [];
    var i = 0;
    while (i < text.length) {
      var found = '';
      for (var p = 0; p < phrases.length; p++) {
        if (text.indexOf(phrases[p], i) === i) {
          found = phrases[p];
          break;
        }
      }
      if (found) {
        rich.push({ text: found, font: font(size, true) });
        i += found.length;
      } else {
        var j = i + 1;
        while (j < text.length) {
          var hit = false;
          for (var q = 0; q < phrases.length; q++) {
            if (text.indexOf(phrases[q], j) === j) {
              hit = true;
              break;
            }
          }
          if (hit) break;
          j += 1;
        }
        rich.push({ text: text.slice(i, j), font: font(size, false) });
        i = j;
      }
    }
    return { richText: rich };
  }

  function plainSegments(text) {
    var value = emphasize(text, 10);
    return value.richText.map(function (part) {
      return { text: part.text, bold: !!part.font.bold };
    });
  }

  FPJ.scoreSum = scoreSum;
  FPJ.scoreBand = scoreBand;
  FPJ.plainSegments = plainSegments;

  function pxOf(width) {
    return Math.floor(((256 * width + Math.floor(128 / 7)) / 256) * 7);
  }

  function widthFromShare(pt, totalPt) {
    var px = (pt / totalPt) * TARGET_PX;
    var width = Math.max(1.2, (px - 5) / 7);
    for (var i = 0; i < 16; i++) {
      var got = pxOf(width);
      if (Math.abs(got - px) <= 1) break;
      width += (px - got) / 7;
    }
    return Math.round(width * 100) / 100;
  }

  function put(ws, r1, c1, r2, c2, value, opt) {
    opt = opt || {};
    if (r1 !== r2 || c1 !== c2) ws.mergeCells(r1, c1, r2, c2);
    if (value !== undefined && value !== null) ws.getCell(r1, c1).value = value;
    for (var r = r1; r <= r2; r++) {
      for (var c = c1; c <= c2; c++) {
        var cell = ws.getCell(r, c);
        if (opt.font) cell.font = opt.font;
        if (opt.align) cell.alignment = opt.align;
        if (opt.fill) cell.fill = opt.fill;
      }
    }
  }

  function paintGrid(ws, r1, c1, r2, c2, outer) {
    for (var r = r1; r <= r2; r++) {
      for (var c = c1; c <= c2; c++) {
        ws.getCell(r, c).border = {
          top: { style: r === r1 ? outer : 'thin', color: BLACK },
          bottom: { style: r === r2 ? outer : 'thin', color: BLACK },
          left: { style: c === c1 ? outer : 'thin', color: BLACK },
          right: { style: c === c2 ? outer : 'thin', color: BLACK },
        };
      }
    }
  }

  function applyPage(ws) {
    ws.pageSetup.paperSize = 9;
    ws.pageSetup.orientation = 'portrait';
    ws.pageSetup.horizontalCentered = true;
    ws.pageSetup.verticalCentered = false;
    ws.pageSetup.fitToPage = true;
    ws.pageSetup.fitToWidth = 1;
    ws.pageSetup.fitToHeight = 1;
    ws.pageSetup.margins = {
      left: 0.197,
      right: 0.197,
      top: 0.197,
      bottom: 0.197,
      header: 0,
      footer: 0,
    };
    delete ws.pageSetup.scale;
    ws.views = [{ showGridLines: false }];
    ws.properties.tabColor = { argb: 'FF1B4332' };
    ws.properties.defaultRowHeight = 15;
  }

  function applyColumns(ws) {
    var total = COL_PT.reduce(function (sum, pt) { return sum + pt; }, 0);
    COL_PT.forEach(function (pt, index) {
      ws.getColumn(index + 1).width = widthFromShare(pt, total);
    });
  }

  function areaLabel(area) {
    var pub = area === 'publica' ? '[X]' : '[ ]';
    var pri = area === 'privada' ? '[X]' : '[ ]';
    return pub + ' Área Pública    ' + pri + ' Área Privada';
  }

  function boxMark(value) {
    var sim = value === 'sim' ? '[X] sim' : '[ ] sim';
    var nao = value === 'nao' ? '[X] não' : '[ ] não';
    return sim + '\n' + nao;
  }

  function taxaMark(value, option, label) {
    return value === option ? 'X ' + label : label;
  }

  function writeMasthead(ws, row, report, pageNumber, pageCount, full) {
    var r = row;
    if (full) {
      ws.getRow(r).height = 46;
      put(ws, r, 1, r, 11, [str(report.tecnicoNome), str(report.tecnicoCargo), str(report.tecnicoRegistro)].join('\n'), {
        font: font(10, true),
        align: center,
      });
      paintGrid(ws, r, 1, r, 11, 'medium');
      r += 1;
      ws.getRow(r).height = 6;
      r += 1;
    }

    var top = r;
    var titleRow = r;
    var legalRow = r + 1;
    var instRow = r + 2;
    var areaRow = r + 3;
    ws.getRow(titleRow).height = 20;
    ws.getRow(legalRow).height = 14;
    ws.getRow(instRow).height = 16;
    ws.getRow(areaRow).height = 18;

    put(ws, titleRow, 1, instRow, 1, 'FPJ', {
      font: font(12, true, 'FFFFFFFF'),
      fill: SEAL,
      align: center,
    });
    put(ws, titleRow, 2, titleRow, 8, FPJ.legal.titulo, {
      font: font(8, true),
      align: center,
    });
    put(ws, titleRow, 9, titleRow, 11, {
      richText: [
        { text: 'Folha ', font: font(10, false) },
        { text: String(pageNumber), font: font(10, true) },
        { text: ' de ', font: font(10, false) },
        { text: String(pageCount), font: font(10, true) },
      ],
    }, { align: center });
    put(ws, legalRow, 2, legalRow, 11, full ? FPJ.legal.citacaoFolha1 : FPJ.legal.citacaoContinua, {
      font: font(6, false),
      align: center,
    });
    put(ws, instRow, 2, instRow, 11, FPJ.legal.instituicao, {
      font: font(8, true),
      align: center,
    });
    put(ws, areaRow, 1, areaRow, 6, areaLabel(report.area), {
      font: font(9, false),
      align: leftMid,
    });
    put(ws, areaRow, 7, areaRow, 8, 'Processo:', {
      font: font(9, true),
      align: { horizontal: 'right', vertical: 'middle', wrapText: true },
    });
    put(ws, areaRow, 9, areaRow, 11, str(report.processo), {
      font: font(9, false),
      align: leftMid,
    });

    var bottom = areaRow;
    if (full) {
      var fields = [
        ['Responsável/Prop.:', report.responsavel, true],
        ['Representante legal:', report.representante, false],
        ['Logradouro:', report.logradouro, true],
      ];
      fields.forEach(function (field, index) {
        var line = areaRow + 1 + index;
        ws.getRow(line).height = index === 2 ? 18 : 16;
        var labelEnd = index === 2 ? 2 : 3;
        var valueStart = labelEnd + 1;
        put(ws, line, 1, line, labelEnd, field[0], {
          font: font(9, field[2]),
          align: leftMid,
        });
        put(ws, line, valueStart, line, 11, str(field[1]), {
          font: font(10, false),
          align: leftMid,
        });
        bottom = line;
      });
      var numRow = bottom + 1;
      ws.getRow(numRow).height = 16;
      put(ws, numRow, 1, numRow, 2, 'Número:', { font: font(9, false), align: leftMid });
      put(ws, numRow, 3, numRow, 5, str(report.numero), { font: font(10, false), align: leftMid });
      put(ws, numRow, 6, numRow, 7, 'Bairro:', { font: font(9, false), align: leftMid });
      put(ws, numRow, 8, numRow, 11, str(report.bairro), { font: font(10, false), align: leftMid });
      var refRow = numRow + 1;
      ws.getRow(refRow).height = 26;
      put(ws, refRow, 1, refRow, 2, 'Referência:', { font: font(9, false), align: leftMid });
      put(ws, refRow, 3, refRow, 8, str(report.referencia), { font: font(9, false), align: leftMid });
      put(ws, refRow, 9, refRow, 10, 'AP', { font: font(9, true), align: center });
      put(ws, refRow, 11, refRow, 11, str(report.ap), { font: font(10, true), align: center });
      bottom = refRow;
    }

    paintGrid(ws, top, 1, bottom, 11, 'medium');
    ws.getRow(bottom + 1).height = 6;
    return bottom + 2;
  }

  function parecerHeights(text) {
    var content = str(text).trim();
    if (!content) return [13, 13, 16];
    var lines = str(text).split('\n').reduce(function (count, line) {
      return count + Math.max(1, Math.ceil(line.length / 78) || 1);
    }, 0);
    var extra = Math.max(0, lines * 11 - 42);
    return [13, 13, 16 + extra];
  }

  function writeSpecimen(ws, row, spec) {
    var rH = row;
    var rS = row + 1;
    var rV = row + 2;
    var rG = row + 3;
    var rC = row + 4;
    var rN = row + 5;
    var r6 = row + 6;
    var r12 = row + 7;
    var r25 = row + 8;
    var heights = parecerHeights(spec.parecer);
    ws.getRow(rH).height = 16;
    ws.getRow(rS).height = 15;
    ws.getRow(rV).height = 15;
    ws.getRow(rG).height = 16;
    ws.getRow(rC).height = 18;
    ws.getRow(rN).height = 16;
    ws.getRow(r6).height = heights[0];
    ws.getRow(r12).height = heights[1];
    ws.getRow(r25).height = heights[2];

    put(ws, rH, 1, rH, 1, 'Nº', { font: font(8, true), fill: GRAY, align: center });
    put(ws, rH, 2, rH, 5, 'IDENTIFICAÇÃO', { font: font(8, true), fill: GRAY, align: center });
    put(ws, rH, 6, rH, 8, 'DADOS DENDROMÉTRICOS', { font: font(8, true), fill: GRAY, align: center });
    put(ws, rH, 9, rH, 9, 'REPLANTIO', { font: font(8, true), fill: GRAY, align: center });
    put(ws, rH, 10, rH, 10, 'MC', { font: font(8, true), fill: GRAY, align: center });
    put(ws, rH, 11, rH, 11, 'taxa', { font: font(8, true), fill: GRAY, align: center });

    put(ws, rS, 1, rV, 1, spec.numero, { font: font(14, true), align: center });
    put(ws, rS, 2, rS, 5, str(spec.cientifico), { font: font(10, false), align: leftMid });
    ws.getCell(rS, 2).font = { name: 'Calibri', size: 10, italic: true };
    put(ws, rV, 2, rV, 5, str(spec.vulgar), { font: font(10, false), align: leftMid });
    ['H (m)', 'DAP (m)', 'DCOPA (m)'].forEach(function (label, index) {
      put(ws, rS, 6 + index, rS, 6 + index, label, { font: font(7, false), align: center });
    });
    [spec.altura, spec.dap, spec.dcopa].forEach(function (value, index) {
      put(ws, rV, 6 + index, rV, 6 + index, str(value), { font: font(10, false), align: center });
    });
    put(ws, rS, 9, rV, 9, '', { align: center });
    put(ws, rS, 10, rV, 10, boxMark(spec.mc), { font: font(8, false), align: center });
    put(ws, rS, 11, rS, 11, taxaMark(spec.taxa, 'sim', 'sim'), { font: font(6, false), align: center });
    put(ws, rV, 11, rV, 11, taxaMark(spec.taxa, 'nao', 'não'), { font: font(6, false), align: center });

    put(ws, rG, 1, rG, 1, 'MANEJO', { font: font(8, true), fill: GRAY, align: center });
    put(ws, rG, 2, rG, 6, 'CONDIÇÕES DO ESPÉCIME', { font: font(8, true), fill: GRAY, align: center });
    put(ws, rG, 7, rG, 8, 'CONFORMIDADE', { font: font(8, true), fill: GRAY, align: center });
    put(ws, rG, 9, rG, 11, 'ESTADO GERAL', { font: font(8, true), fill: GRAY, align: center });

    put(ws, rC, 1, rC, 1, str(spec.manejo), { font: font(12, true), align: center });
    FPJ.criteria.forEach(function (criterion, index) {
      put(ws, rC, 2 + index, rC, 2 + index, criterion.coluna, { font: font(7, false), align: center });
    });
    put(ws, rC, 9, rC, 9, 'PONTUAÇÃO', { font: font(7, false), align: center });
    put(ws, rC, 10, rC, 10, 'RESULTADO', { font: font(7, false), align: center });

    var band = scoreBand(scoreSum(spec.scores));
    FPJ.criteria.forEach(function (criterion, index) {
      var note = spec.scores ? spec.scores[criterion.key] : null;
      var shown = note === 0 || note === 1 || note === 3 || note === 5 ? note : '';
      put(ws, rN, 2 + index, rN, 2 + index, shown, { font: font(11, false), align: center });
    });

    var bands = [
      { row: rN, index: 0 },
      { row: r6, index: 1 },
      { row: r12, index: 2 },
      { row: r25, index: 3 },
    ];
    bands.forEach(function (item) {
      put(ws, item.row, 9, item.row, 9, FPJ.faixas[item.index].grade, { font: font(8, false), align: center });
      put(ws, item.row, 10, item.row, 10, FPJ.faixas[item.index].label, { font: font(8, false), align: center });
      put(ws, item.row, 11, item.row, 11, band && band.index === item.index ? 'X' : '', {
        font: font(12, true),
        align: center,
      });
    });

    put(ws, r6, 1, r25, 8, str(spec.parecer), { font: font(9, false), align: topLeft });
    paintGrid(ws, rH, 1, r25, 11, 'medium');
    return r25 + 1;
  }

  function writeFooter(ws, row, report, full) {
    var r = row;
    ws.getRow(r).height = 6;
    r += 1;
    var top = r;
    if (full) {
      ws.getRow(r).height = 62;
      put(ws, r, 1, r, 11, emphasize(FPJ.legal.legenda, 7), { font: font(7, false), align: topLeft });
      r += 1;
      ws.getRow(r).height = 34;
      put(ws, r, 1, r, 11, FPJ.legal.servicos, { font: font(9, true), align: leftMid });
      r += 1;
      ws.getRow(r).height = 68;
      put(ws, r, 1, r, 11, emphasize(FPJ.legal.rm, 7), { font: font(7, false), align: topLeft });
      r += 1;
    }
    ws.getRow(r).height = 16;
    put(ws, r, 1, r, 11, 'Observações:', { font: font(10, true), align: leftMid });
    r += 1;
    ws.getRow(r).height = 16;
    put(ws, r, 1, r, 3, 'Data:', { font: font(10, true), align: center });
    put(ws, r, 4, r, 6, 'Técnico', { font: font(10, true), align: center });
    put(ws, r, 7, r, 11, 'Responsável/Proponente', { font: font(10, true), align: center });
    r += 1;
    for (var i = 0; i < 3; i++) {
      ws.getRow(r).height = 16;
      put(ws, r, 1, r, 3, i === 0 ? str(report.data) : '', { font: font(10, false), align: center });
      put(ws, r, 4, r, 6, '', { align: center });
      put(ws, r, 7, r, 11, '', { align: center });
      r += 1;
    }
    paintGrid(ws, top, 1, r - 1, 11, 'medium');
    if (full) {
      ws.getRow(r).height = 8;
      r += 1;
      ws.getRow(r).height = 58;
      put(ws, r, 1, r, 11, FPJ.legal.lgpd, {
        font: font(9, true),
        align: { horizontal: 'center', vertical: 'middle', wrapText: true },
      });
      r += 1;
    }
    return r;
  }

  function writeConventions(wb) {
    var ws = wb.addWorksheet('Convenções');
    applyPage(ws);
    [24, 32, 14, 42].forEach(function (width, index) {
      ws.getColumn(index + 1).width = width;
    });
    ws.getRow(1).height = 24;
    put(ws, 1, 1, 1, 4, FPJ.legal.titulo + ' - CONVENÇÕES', {
      font: font(11, true),
      align: center,
    });
    ws.getRow(2).height = 20;
    ['AVALIAÇÃO', 'ITEM', 'Classe', 'DESCRIÇÃO'].forEach(function (label, index) {
      put(ws, 2, index + 1, 2, index + 1, label, { font: font(10, true), fill: GRAY, align: center });
    });

    var row = 3;
    FPJ.grupos.forEach(function (group) {
      var groupStart = row;
      FPJ.criteria.filter(function (item) { return item.grupo === group.id; }).forEach(function (item) {
        var itemStart = row;
        item.opcoes.forEach(function (opcao) {
          ws.getRow(row).height = 18;
          put(ws, row, 3, row, 3, String(opcao.nota), { font: font(10, false), align: center });
          put(ws, row, 4, row, 4, opcao.texto, { font: font(10, false), align: leftMid });
          row += 1;
        });
        put(ws, itemStart, 2, row - 1, 2, item.item, { font: font(8, true), align: center });
      });
      put(ws, groupStart, 1, row - 1, 1, group.titulo, { font: font(8, true), align: center });
    });

    var stateStart = row;
    FPJ.faixas.forEach(function (faixa) {
      ws.getRow(row).height = 18;
      put(ws, row, 3, row, 3, faixa.classe, { font: font(10, false), align: center });
      put(ws, row, 4, row, 4, faixa.label, { font: font(10, false), align: leftMid });
      row += 1;
    });
    put(ws, stateStart, 1, row - 1, 2, 'ESTADO GERAL', { font: font(8, true), align: center });
    paintGrid(ws, 1, 1, row - 1, 4, 'medium');
    ws.pageSetup.printArea = 'A1:D' + (row - 1);
  }

  function paginate(list) {
    if (!list.length) return [[]];
    if (list.length <= 2) return [list.slice()];
    var pages = [list.slice(0, 2)];
    for (var i = 2; i < list.length; i += 4) pages.push(list.slice(i, i + 4));
    return pages;
  }

  function normalize(report) {
    var src = report || {};
    var specimens = Array.isArray(src.specimens) ? src.specimens : [];
    return {
      area: src.area === 'publica' || src.area === 'privada' ? src.area : '',
      processo: str(src.processo),
      responsavel: str(src.responsavel),
      representante: str(src.representante),
      logradouro: str(src.logradouro),
      numero: str(src.numero),
      bairro: str(src.bairro),
      referencia: str(src.referencia),
      ap: str(src.ap),
      data: str(src.data),
      tecnicoNome: str(src.tecnicoNome),
      tecnicoCargo: str(src.tecnicoCargo),
      tecnicoRegistro: str(src.tecnicoRegistro),
      specimens: specimens.map(function (item, index) {
        return {
          numero: index + 1,
          cientifico: str(item && item.cientifico),
          vulgar: str(item && item.vulgar),
          altura: str(item && item.altura),
          dap: str(item && item.dap),
          dcopa: str(item && item.dcopa),
          mc: item && (item.mc === 'sim' || item.mc === 'nao') ? item.mc : '',
          taxa: item && (item.taxa === 'sim' || item.taxa === 'nao') ? item.taxa : '',
          manejo: str(item && item.manejo),
          scores: (item && item.scores) || {},
          parecer: str(item && item.parecer),
        };
      }),
    };
  }

  async function buildVistoriaWorkbook(report) {
    var ExcelJS = root.ExcelJS;
    if (!ExcelJS) throw new Error('ExcelJS não está disponível neste aparelho.');
    var data = normalize(report);
    var wb = new ExcelJS.Workbook();
    wb.creator = 'Vistoria FPJ';
    wb.lastModifiedBy = data.tecnicoNome || 'Vistoria FPJ';
    wb.created = new Date();
    wb.modified = new Date();
    var pages = paginate(data.specimens);
    pages.forEach(function (trees, index) {
      var ws = wb.addWorksheet('Folha ' + (index + 1));
      applyPage(ws);
      applyColumns(ws);
      var cursor = writeMasthead(ws, 1, data, index + 1, pages.length, index === 0);
      trees.forEach(function (tree) {
        cursor = writeSpecimen(ws, cursor, tree);
      });
      cursor = writeFooter(ws, cursor, data, index === 0);
      ws.pageSetup.printArea = 'A1:K' + Math.max(1, cursor - 1);
    });
    writeConventions(wb);
    return wb.xlsx.writeBuffer();
  }

  FPJ.paginate = paginate;
  root.FPJ = FPJ;
  root.buildVistoriaWorkbook = buildVistoriaWorkbook;
})(typeof globalThis !== 'undefined' ? globalThis : this);
