(function () {
  'use strict';

  var KEY = 'vistoria-fpj:v1';
  var MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  var openCards = new Set(['geral', 'tecnico', 'identificacao', 'dendro', 'manejo', 'avaliacao', 'parecer', 'final']);
  var state = blankReport();
  var pending = null;
  var lock = false;
  var busy = false;
  var toastTimer = 0;
  var touchStartY = 0;

  function uid() {
    return 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function blankSpecimen() {
    return {
      id: uid(),
      cientifico: '',
      vulgar: '',
      altura: '',
      dap: '',
      dcopa: '',
      mc: '',
      taxa: '',
      manejo: '',
      scores: {
        equilibrio: null,
        estrutura: null,
        conflitos: null,
        eft: null,
        alvo: null,
        especie: null,
        sitio: null,
      },
      parecer: '',
    };
  }

  function blankReport() {
    return {
      area: '',
      processo: '',
      responsavel: '',
      representante: '',
      logradouro: '',
      numero: '',
      bairro: '',
      referencia: '',
      ap: '',
      data: '',
      tecnicoNome: 'Rodrigo Antônio Esteves Filardi',
      tecnicoCargo: 'Engenheiro Florestal',
      tecnicoRegistro: 'CREARJ-2022111169',
      specimens: [blankSpecimen()],
      active: 0,
    };
  }

  function coerceScore(value) {
    if (value === 0 || value === 1 || value === 3 || value === 5) return value;
    if (value === '0' || value === '1' || value === '3' || value === '5') return Number(value);
    return null;
  }

  function sanitize(data) {
    var next = blankReport();
    if (!data || typeof data !== 'object') return next;
    ['area', 'processo', 'responsavel', 'representante', 'logradouro', 'numero', 'bairro', 'referencia', 'ap', 'data', 'tecnicoNome', 'tecnicoCargo', 'tecnicoRegistro'].forEach(function (key) {
      if (typeof data[key] === 'string') next[key] = data[key];
    });
    if (next.area !== 'publica' && next.area !== 'privada') next.area = '';
    if (Array.isArray(data.specimens) && data.specimens.length) {
      next.specimens = data.specimens.map(function (item) {
        var spec = blankSpecimen();
        if (!item || typeof item !== 'object') return spec;
        ['cientifico', 'vulgar', 'altura', 'dap', 'dcopa', 'manejo', 'parecer'].forEach(function (key) {
          if (typeof item[key] === 'string') spec[key] = item[key];
        });
        spec.mc = item.mc === 'sim' || item.mc === 'nao' ? item.mc : '';
        spec.taxa = item.taxa === 'sim' || item.taxa === 'nao' ? item.taxa : '';
        if (typeof item.id === 'string' && item.id) spec.id = item.id;
        FPJ.criteria.forEach(function (criterion) {
          spec.scores[criterion.key] = coerceScore(item.scores && item.scores[criterion.key]);
        });
        return spec;
      });
    }
    var active = Number(data.active);
    next.active = active >= 0 && active < next.specimens.length ? active : 0;
    return next;
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return blankReport();
      return sanitize(JSON.parse(raw));
    } catch (error) {
      return blankReport();
    }
  }

  function current() {
    return state.specimens[state.active];
  }

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }

  function richHtml(text) {
    return FPJ.plainSegments(text).map(function (part) {
      var html = esc(part.text).replace(/\n/g, '<br>');
      return part.bold ? '<strong>' + html + '</strong>' : html;
    }).join('');
  }

  function bandName(band) {
    return band ? ['satisfatorio', 'regular', 'insatisfatorio', 'critico'][band.index] : '';
  }

  function card(id, title, body) {
    return '<details class="card" id="card-' + id + '" data-card="' + id + '"' + (openCards.has(id) ? ' open' : '') + '>' +
      '<summary>' + esc(title) + '</summary><div class="card-body">' + body + '</div></details>';
  }

  function field(scope, name, label, value, extra) {
    extra = extra || '';
    return '<label>' + esc(label) + '<input data-scope="' + scope + '" data-field="' + name + '" value="' + esc(value) + '" ' + extra + '></label>';
  }

  function areaButton(value, label) {
    var on = state.area === value;
    var mark = on ? '[X] ' : '[ ] ';
    return '<button type="button" data-action="area" data-value="' + value + '" class="' + (on ? 'is-on' : '') + '" aria-pressed="' + (on ? 'true' : 'false') + '">' + mark + esc(label) + '</button>';
  }

  function choice(action, key, value, currentValue, label) {
    var on = currentValue === value;
    return '<button type="button" data-action="' + action + '" data-key="' + esc(key) + '" data-value="' + esc(value) + '" class="' + (on ? 'is-on' : '') + '" aria-pressed="' + (on ? 'true' : 'false') + '">' + esc(label) + '</button>';
  }

  function renderSwitcher() {
    var host = document.getElementById('switcher');
    var chips = state.specimens.map(function (spec, index) {
      var band = FPJ.scoreBand(FPJ.scoreSum(spec.scores));
      var cls = 'chip' + (index === state.active ? ' is-active' : '') + (band ? ' is-' + bandName(band) : '');
      return '<button type="button" class="' + cls + '" data-action="select" data-index="' + index + '" aria-label="Espécime ' + (index + 1) + '">' + (index + 1) + '</button>';
    }).join('');
    host.innerHTML =
      '<button type="button" class="nav-step" data-action="prev" aria-label="Espécime anterior">‹</button>' +
      '<div class="chips">' + chips + '</div>' +
      '<button type="button" class="nav-step" data-action="next" aria-label="Próximo espécime">›</button>';
  }

  function renderApp() {
    var spec = current();
    var sum = FPJ.scoreSum(spec.scores);
    var band = FPJ.scoreBand(sum);
    renderSwitcher();
    updateCount();

    var geral =
      '<div class="choices" role="group" aria-label="Tipo de área">' +
        areaButton('publica', 'Área Pública') +
        areaButton('privada', 'Área Privada') +
      '</div>' +
      field('header', 'processo', 'Processo', state.processo, 'placeholder="FPJ-PRO-2024/01964" autocomplete="off"') +
      field('header', 'responsavel', 'Responsável/Prop.', state.responsavel, 'placeholder="CONIC LUBRIFICANTES S.A." autocomplete="off"') +
      field('header', 'representante', 'Representante legal', state.representante, 'autocomplete="off"') +
      field('header', 'logradouro', 'Logradouro', state.logradouro, 'placeholder="Avenida Rio de Janeiro" autocomplete="off"') +
      '<div class="duo">' +
        field('header', 'numero', 'Número', state.numero, 'placeholder="901" inputmode="numeric" autocomplete="off"') +
        field('header', 'bairro', 'Bairro', state.bairro, 'placeholder="Caju" autocomplete="off"') +
      '</div>' +
      field('header', 'referencia', 'Referência', state.referencia, 'placeholder="Proximo ao viaduto que liga o centro a Avenida Brasil" autocomplete="off"') +
      '<div class="duo">' +
        field('header', 'ap', 'AP', state.ap, 'placeholder="1" inputmode="numeric" autocomplete="off"') +
        field('header', 'data', 'Data da vistoria', state.data, 'placeholder="DD/MM/AAAA" inputmode="numeric" autocomplete="off"') +
      '</div>' +
      '<p id="date-hint" class="hint"' + (state.data && !validDate(state.data) ? '' : ' hidden') + '>Use o formato DD/MM/AAAA.</p>';

    var tecnico =
      field('header', 'tecnicoNome', 'Nome', state.tecnicoNome, 'autocomplete="name"') +
      field('header', 'tecnicoCargo', 'Cargo', state.tecnicoCargo, 'autocomplete="organization-title"') +
      field('header', 'tecnicoRegistro', 'Registro', state.tecnicoRegistro, 'autocomplete="off"');

    var identificacao =
      '<p class="hint">Espécime ' + (state.active + 1) + ' de ' + state.specimens.length + '. O número no laudo segue a ordem desta lista.</p>' +
      '<label>Nome científico<input list="especies" data-scope="specimen" data-field="cientifico" value="' + esc(spec.cientifico) + '" placeholder="Mangifera indica" autocomplete="off"></label>' +
      '<datalist id="especies">' + FPJ.especies.map(function (item) {
        return '<option value="' + esc(item[0]) + '">' + esc(item[1]) + '</option>';
      }).join('') + '</datalist>' +
      field('specimen', 'vulgar', 'Nome vulgar', spec.vulgar, 'placeholder="Mangueira" autocomplete="off"');

    var dendro =
      '<div class="duo">' +
        field('specimen', 'altura', 'Altura H (m)', spec.altura, 'inputmode="decimal" placeholder="8" autocomplete="off"') +
        field('specimen', 'dap', 'DAP (m)', spec.dap, 'inputmode="decimal" placeholder="0,32" autocomplete="off"') +
      '</div>' +
      field('specimen', 'dcopa', 'DCOPA (m)', spec.dcopa, 'inputmode="decimal" placeholder="6" autocomplete="off"') +
      '<p class="hint">Medida compensatória (MC) e taxa de replantio.</p>' +
      '<div class="field"><span>MC</span><div class="choices">' +
        choice('flag', 'mc', 'sim', spec.mc, 'Sim') +
        choice('flag', 'mc', 'nao', spec.mc, 'Não') +
      '</div></div>' +
      '<div class="field"><span>Taxa</span><div class="choices">' +
        choice('flag', 'taxa', 'sim', spec.taxa, 'Sim') +
        choice('flag', 'taxa', 'nao', spec.taxa, 'Não') +
      '</div></div>';

    var selectedManejo = FPJ.manejo.filter(function (item) { return item[0] === spec.manejo; })[0];
    var manejo =
      '<label>Sigla de manejo<select data-scope="specimen" data-field="manejo">' +
        '<option value="">Selecione</option>' +
        FPJ.manejo.map(function (item) {
          return '<option value="' + esc(item[0]) + '"' + (spec.manejo === item[0] ? ' selected' : '') + '>' + esc(item[1]) + '</option>';
        }).join('') +
      '</select></label>' +
      '<p id="manejo-hint" class="hint">' + esc(selectedManejo ? selectedManejo[1] : 'SI, LP, RL, PRA, EL, RC, RC/LP, CO, EM, LT, RE, RE/RC, VI, RZ, TF, TP, RM ou RI.') + '</p>';

    var avaliacao =
      '<div id="score-result" class="result' + (band ? ' is-' + bandName(band) : '') + '" aria-live="polite">' +
        (band
          ? '<span>Soma ' + sum + '</span><strong>' + esc(band.label) + '</strong><small>Faixa ' + esc(band.faixa) + '</small>'
          : '<span>Soma</span><strong>Pendente</strong><small>Preencha as 7 notas: 0, 1, 3 ou 5</small>') +
      '</div>' +
      FPJ.criteria.map(function (criterion) {
        var chosen = criterion.opcoes.filter(function (op) { return op.nota === spec.scores[criterion.key]; })[0];
        return '<section class="criterion"><div class="criterion-head"><strong>' + esc(criterion.item) + '</strong><em>' + esc(criterion.coluna) + '</em></div>' +
          '<span data-current="' + criterion.key + '" class="hint">' + esc(chosen ? chosen.nota + ' · ' + chosen.texto : 'Sem nota') + '</span>' +
          '<div class="scores">' + criterion.opcoes.map(function (op) {
            var on = spec.scores[criterion.key] === op.nota;
            return '<button type="button" data-action="score" data-key="' + criterion.key + '" data-value="' + op.nota + '" class="' + (on ? 'is-on' : '') + '" aria-pressed="' + (on ? 'true' : 'false') + '" aria-label="' + esc(criterion.coluna + ' ' + op.nota + ' ' + op.texto) + '">' + op.nota + '</button>';
          }).join('') + '</div>' +
          '<p class="hint">' + esc(criterion.opcoes.map(function (op) { return op.nota + ' ' + op.texto; }).join(' · ')) + '</p></section>';
      }).join('');

    var parecer = '<label>Parecer técnico<textarea data-scope="specimen" data-field="parecer" rows="6" placeholder="Descreva os sintomas fitossanitários e a justificativa da intervenção.">' + esc(spec.parecer) + '</textarea></label>';

    var convencoes = '<div class="table-wrap"><table><thead><tr><th>Avaliação</th><th>Item</th><th class="nota">Classe</th><th>Descrição</th></tr></thead><tbody>' +
      FPJ.grupos.map(function (group) {
        var items = FPJ.criteria.filter(function (item) { return item.grupo === group.id; });
        var rows = items.reduce(function (count, item) { return count + item.opcoes.length; }, 0);
        var html = '';
        items.forEach(function (item, itemIndex) {
          item.opcoes.forEach(function (op, opIndex) {
            html += '<tr>';
            if (itemIndex === 0 && opIndex === 0) html += '<th rowspan="' + rows + '">' + esc(group.titulo) + '</th>';
            if (opIndex === 0) html += '<th rowspan="' + item.opcoes.length + '">' + esc(item.item) + '</th>';
            html += '<td class="nota">' + op.nota + '</td><td>' + esc(op.texto) + '</td></tr>';
          });
        });
        return html;
      }).join('') +
      '<tr><th rowspan="4" colspan="2">ESTADO GERAL</th><td class="nota">0 a 5</td><td>Satisfatório</td></tr>' +
      '<tr><td class="nota">6 a 11</td><td>Regular</td></tr>' +
      '<tr><td class="nota">12 a 24</td><td>Insatisfatório</td></tr>' +
      '<tr><td class="nota">25 a 40</td><td>Crítico</td></tr>' +
      '</tbody></table></div>';

    var legal = '<div class="legal"><p>' + richHtml(FPJ.legal.legenda) + '</p><p>' + richHtml(FPJ.legal.servicos) + '</p><p>' + richHtml(FPJ.legal.rm) + '</p><p>' + richHtml(FPJ.legal.lgpd) + '</p></div>';

    var acoes =
      '<div class="stack">' +
        '<button type="button" class="btn-save" data-action="save">Salvar Espécime</button>' +
        '<button type="button" class="btn-new" data-action="newer">Novo Registro</button>' +
        '<button type="button" class="btn-danger" data-action="delete">Apagar Registro Atual</button>' +
        '<button type="button" class="btn-danger" data-action="reset">Limpar Toda a Vistoria</button>' +
      '</div>';

    var finalizacao =
      '<p class="hint">A planilha sai em folhas A4, com a mesma grade do RTV e a aba Convenções.</p>' +
      '<div class="stack">' +
        '<button type="button" class="btn-save" data-action="download">Baixar Planilha Excel</button>' +
        '<button type="button" class="btn-share" data-action="share">Enviar Planilha (WhatsApp / E-mail)</button>' +
      '</div>';

    document.getElementById('app').innerHTML =
      card('geral', 'Cabeçalho da vistoria', geral) +
      card('tecnico', 'Dados do técnico', tecnico) +
      card('identificacao', 'Identificação do espécime', identificacao) +
      card('dendro', 'Dendrometria e replantio', dendro) +
      card('manejo', 'Manejo', manejo) +
      card('avaliacao', 'Avaliação técnica da FPJ', avaliacao) +
      card('parecer', 'Parecer técnico', parecer) +
      card('convencoes', 'Convenções de avaliação', convencoes) +
      card('legal', 'Textos legais do laudo', legal) +
      card('acoes', 'Ações do registro', acoes) +
      card('final', 'Finalização do laudo', finalizacao);

    var publica = document.querySelector('[data-action="area"][data-value="publica"]');
    var privada = document.querySelector('[data-action="area"][data-value="privada"]');
    if (publica) publica.textContent = (state.area === 'publica' ? '[X]' : '[ ]') + ' Área Pública';
    if (privada) privada.textContent = (state.area === 'privada' ? '[X]' : '[ ]') + ' Área Privada';
  }

  function updateCount() {
    var el = document.getElementById('spec-count');
    if (!el) return;
    var count = state.specimens.length;
    el.textContent = count + (count === 1 ? ' espécime' : ' espécimes');
  }

  function persist() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      var pill = document.getElementById('net-pill');
      if (pill) {
        var clock = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        pill.textContent = 'Salvo no aparelho · ' + clock;
      }
    } catch (error) {
      toast('Não foi possível gravar o rascunho neste aparelho.');
    }
  }

  function toast(message) {
    var el = document.getElementById('toast');
    el.hidden = false;
    el.textContent = message;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, 4200);
  }

  function maskDate(value) {
    var digits = String(value || '').replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits.slice(0, 2) + '/' + digits.slice(2, 4) + '/' + digits.slice(4);
  }

  function validDate(value) {
    var match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
    if (!match) return false;
    var day = Number(match[1]);
    var month = Number(match[2]);
    var year = Number(match[3]);
    var date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  }

  function refreshDateHint() {
    var hint = document.getElementById('date-hint');
    if (!hint) return;
    hint.hidden = !state.data || validDate(state.data);
  }

  function suggestVulgar(value) {
    var found = FPJ.especies.filter(function (item) {
      return item[0].toLowerCase() === value.trim().toLowerCase();
    })[0];
    var spec = current();
    if (!found || spec.vulgar) return;
    spec.vulgar = found[1];
    var input = document.querySelector('[data-field="vulgar"]');
    if (input) input.value = found[1];
  }

  function setArea(value) {
    state.area = value;
    persist();
    document.querySelectorAll('[data-action="area"]').forEach(function (button) {
      var on = button.getAttribute('data-value') === value;
      button.classList.toggle('is-on', on);
      button.setAttribute('aria-pressed', on ? 'true' : 'false');
      var prefix = on ? '[X] ' : '[ ] ';
      button.textContent = prefix + (button.getAttribute('data-value') === 'publica' ? 'Área Pública' : 'Área Privada');
    });
  }

  function setFlag(key, value) {
    var spec = current();
    spec[key] = spec[key] === value ? '' : value;
    persist();
    document.querySelectorAll('[data-action="flag"][data-key="' + key + '"]').forEach(function (button) {
      var on = button.getAttribute('data-value') === spec[key];
      button.classList.toggle('is-on', on);
      button.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  function setScore(key, note) {
    var spec = current();
    spec.scores[key] = spec.scores[key] === note ? null : note;
    persist();
    document.querySelectorAll('[data-action="score"][data-key="' + key + '"]').forEach(function (button) {
      var on = Number(button.getAttribute('data-value')) === spec.scores[key];
      button.classList.toggle('is-on', on);
      button.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    var criterion = FPJ.criteria.filter(function (item) { return item.key === key; })[0];
    var chosen = criterion.opcoes.filter(function (op) { return op.nota === spec.scores[key]; })[0];
    var label = document.querySelector('[data-current="' + key + '"]');
    if (label) label.textContent = chosen ? chosen.nota + ' · ' + chosen.texto : 'Sem nota';
    refreshDerived();
  }

  function refreshDerived() {
    var spec = current();
    var sum = FPJ.scoreSum(spec.scores);
    var band = FPJ.scoreBand(sum);
    var box = document.getElementById('score-result');
    if (box) {
      box.className = 'result' + (band ? ' is-' + bandName(band) : '');
      box.innerHTML = band
        ? '<span>Soma ' + sum + '</span><strong>' + esc(band.label) + '</strong><small>Faixa ' + esc(band.faixa) + '</small>'
        : '<span>Soma</span><strong>Pendente</strong><small>Preencha as 7 notas: 0, 1, 3 ou 5</small>';
    }
    document.querySelectorAll('.chip').forEach(function (chip, index) {
      var itemBand = FPJ.scoreBand(FPJ.scoreSum(state.specimens[index].scores));
      chip.className = 'chip' + (index === state.active ? ' is-active' : '') + (itemBand ? ' is-' + bandName(itemBand) : '');
    });
  }

  function selectSpecimen(index) {
    if (index < 0 || index >= state.specimens.length || index === state.active) return;
    state.active = index;
    persist();
    renderApp();
  }

  function newer() {
    state.specimens.push(blankSpecimen());
    state.active = state.specimens.length - 1;
    persist();
    renderApp();
    var cardNode = document.getElementById('card-identificacao');
    if (cardNode) cardNode.scrollIntoView({ block: 'start' });
  }

  function removeCurrent() {
    state.specimens.splice(state.active, 1);
    if (!state.specimens.length) state.specimens.push(blankSpecimen());
    if (state.active >= state.specimens.length) state.active = state.specimens.length - 1;
    persist();
    renderApp();
  }

  function resetAll() {
    state = blankReport();
    openCards = new Set(['geral', 'tecnico', 'identificacao', 'dendro', 'manejo', 'avaliacao', 'parecer', 'final']);
    persist();
    renderApp();
    window.scrollTo(0, 0);
  }

  function ask(action) {
    pending = action;
    document.getElementById('confirm-modal').hidden = false;
    document.body.classList.add('modal-open');
    document.getElementById('confirm-no').focus();
  }

  function closeConfirm() {
    pending = null;
    document.getElementById('confirm-modal').hidden = true;
    document.body.classList.remove('modal-open');
  }

  function fileName() {
    var processo = (state.processo || 'sem-processo').replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, '_');
    var data = (state.data || 'sem-data').replace(/\//g, '-');
    return 'RTV_' + processo + '_' + data + '.xlsx';
  }

  function incompleteCount() {
    return state.specimens.filter(function (spec) {
      return FPJ.scoreSum(spec.scores) === null;
    }).length;
  }

  async function makeFile() {
    if (busy) return null;
    busy = true;
    toast('Gerando planilha...');
    try {
      var buffer = await buildVistoriaWorkbook(state);
      var blob = new Blob([buffer], { type: MIME });
      return { blob: blob, name: fileName() };
    } catch (error) {
      toast('Não foi possível gerar a planilha neste aparelho.');
      return null;
    } finally {
      busy = false;
    }
  }

  function downloadBlob(blob, name) {
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2500);
  }

  async function downloadSheet() {
    var file = await makeFile();
    if (!file) return;
    downloadBlob(file.blob, file.name);
    var missing = incompleteCount();
    toast(missing
      ? 'Planilha baixada. ' + missing + ' espécime(s) ainda sem as 7 notas.'
      : 'Planilha baixada neste aparelho.');
  }

  async function shareSheet() {
    var file = await makeFile();
    if (!file) return;
    var shared = new File([file.blob], file.name, { type: MIME });
    var payload = {
      files: [shared],
      title: 'Vistoria FPJ',
      text: 'Relatório Técnico de Vistoria - Manejo da Arborização',
    };
    var canShare = false;
    try {
      canShare = !!(navigator.share && navigator.canShare && navigator.canShare(payload));
    } catch (error) {
      canShare = false;
    }
    if (canShare) {
      try {
        await navigator.share(payload);
        return;
      } catch (error) {
        if (error && error.name === 'AbortError') return;
      }
    }
    downloadBlob(file.blob, file.name);
    toast('Compartilhamento nativo indisponível neste navegador. A planilha foi baixada.');
  }

  function onClick(event) {
    var button = event.target.closest('[data-action]');
    if (!button) return;
    var action = button.getAttribute('data-action');
    if (action === 'save') {
      persist();
      toast('Espécime salvo neste aparelho.');
      return;
    }
    if (action === 'newer' || action === 'delete' || action === 'reset') {
      ask(action);
      return;
    }
    if (action === 'download') { downloadSheet(); return; }
    if (action === 'share') { shareSheet(); return; }
    if (action === 'area') { setArea(button.getAttribute('data-value')); return; }
    if (action === 'flag') { setFlag(button.getAttribute('data-key'), button.getAttribute('data-value')); return; }
    if (action === 'score') { setScore(button.getAttribute('data-key'), Number(button.getAttribute('data-value'))); return; }
    if (action === 'select') { selectSpecimen(Number(button.getAttribute('data-index'))); return; }
    if (action === 'prev') { selectSpecimen(state.active - 1); return; }
    if (action === 'next') { selectSpecimen(state.active + 1); return; }
  }

  function onInput(event) {
    var el = event.target;
    var name = el.getAttribute('data-field');
    if (!name) return;
    var value = el.value;
    if (name === 'data') {
      value = maskDate(value);
      if (el.value !== value) el.value = value;
    }
    if (el.getAttribute('data-scope') === 'header') state[name] = value;
    else current()[name] = value;
    if (name === 'cientifico') suggestVulgar(value);
    if (name === 'manejo') {
      var found = FPJ.manejo.filter(function (item) { return item[0] === value; })[0];
      var hint = document.getElementById('manejo-hint');
      if (hint) hint.textContent = found ? found[1] : 'Selecione a sigla oficial do manejo.';
    }
    persist();
    if (name === 'data') refreshDateHint();
  }

  document.addEventListener('click', onClick);
  document.addEventListener('input', onInput);
  document.addEventListener('toggle', function (event) {
    var node = event.target;
    if (!node || node.tagName !== 'DETAILS' || !node.getAttribute('data-card')) return;
    if (node.open) openCards.add(node.getAttribute('data-card'));
    else openCards.delete(node.getAttribute('data-card'));
  }, true);

  document.addEventListener('touchstart', function (event) {
    if (event.touches.length) touchStartY = event.touches[0].clientY;
  }, { passive: true });

  document.addEventListener('touchmove', function (event) {
    var scrollTop = document.scrollingElement ? document.scrollingElement.scrollTop : 0;
    var currentY = event.touches.length ? event.touches[0].clientY : touchStartY;
    if (scrollTop <= 0 && currentY > touchStartY) event.preventDefault();
  }, { passive: false });

  document.getElementById('confirm-yes').addEventListener('click', function () {
    if (lock || !pending) return;
    lock = true;
    var action = pending;
    closeConfirm();
    if (action === 'newer') newer();
    if (action === 'delete') removeCurrent();
    if (action === 'reset') resetAll();
    setTimeout(function () { lock = false; }, 450);
  });
  document.getElementById('confirm-no').addEventListener('click', closeConfirm);
  document.getElementById('confirm-modal').addEventListener('click', function (event) {
    if (event.target.id === 'confirm-modal') closeConfirm();
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && pending) closeConfirm();
  });

  if (!globalThis.FPJ || !globalThis.buildVistoriaWorkbook || !globalThis.ExcelJS) {
    document.getElementById('app').textContent = 'Não foi possível carregar a planilha offline. Confira o arquivo vendor/exceljs.min.js.';
    return;
  }

  state = load();
  renderApp();
  persist();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(function () {
      toast('O modo offline completo fica ativo quando o aplicativo é aberto por HTTP.');
    });
  }
})();
