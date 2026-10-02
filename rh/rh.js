// Aba RH — AKT Gestor ERP
// Indicadores calculados a partir da lista de colaboradores (importada ou de exemplo).

const STORAGE_KEY = 'akt_rh_colaboradores';
const $ = (id) => document.getElementById(id);

let colaboradores = [];

// ---------- Datas ----------
function normDate(v) {
  if (!v) return '';
  const s = String(v).trim();
  const br = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (br) return `${br[3]}-${br[2]}-${br[1]}`;
  const iso = s.match(/^(\d{4}-\d{2}-\d{2})/);
  return iso ? iso[1] : '';
}
const isoOf = (d) => d.toISOString().slice(0, 10);
const fmtBR = (iso) => iso ? iso.split('-').reverse().join('/') : '';

// ---------- Regras ----------
const ativoEm = (c, dia) => c.data_admissao && c.data_admissao <= dia && (!c.data_demissao || c.data_demissao > dia);
const noPeriodo = (dia, ini, fim) => dia && dia >= ini && dia <= fim;
const feriasNoPeriodo = (c, ini, fim) => c.ferias_inicio && c.ferias_inicio <= fim && (c.ferias_fim || c.ferias_inicio) >= ini;

function contarPor(lista, campo) {
  const m = new Map();
  for (const c of lista) {
    const k = c[campo] || 'Não informado';
    m.set(k, (m.get(k) || 0) + 1);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function calcular(ini, fim, regional) {
  const base = regional ? colaboradores.filter((c) => c.regional === regional) : colaboradores;
  const admitidos = base.filter((c) => noPeriodo(c.data_admissao, ini, fim));
  const demitidos = base.filter((c) => noPeriodo(c.data_demissao, ini, fim));
  const emFerias = base.filter((c) => feriasNoPeriodo(c, ini, fim));
  const efetivoIni = base.filter((c) => ativoEm(c, ini)).length;
  const efetivoFim = base.filter((c) => ativoEm(c, fim)).length;
  const efetivoMedio = (efetivoIni + efetivoFim) / 2;
  const turnover = efetivoMedio > 0 ? ((admitidos.length + demitidos.length) / 2) / efetivoMedio * 100 : 0;
  const ativosFim = base.filter((c) => ativoEm(c, fim));
  return { base, admitidos, demitidos, emFerias, efetivoIni, efetivoFim, efetivoMedio, turnover, ativosFim };
}

// ---------- Render ----------
function renderBars(el, pares) {
  if (!pares.length) { el.innerHTML = '<p class="empty">Sem registros no período.</p>'; return; }
  const max = pares[0][1];
  el.innerHTML = pares.map(([k, v]) => `
    <div class="bar" title="${esc(k)}: ${v}">
      <span class="lbl">${esc(k)}</span>
      <span class="track"><span class="fill" style="width:${(v / max) * 100}%"></span></span>
      <span class="val">${v}</span>
    </div>`).join('');
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

const nf = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

function render() {
  const ini = $('fInicio').value;
  const fim = $('fFim').value;
  if (!ini || !fim || ini > fim) return;
  const r = calcular(ini, fim, $('fRegional').value);

  $('kTurnover').textContent = `${nf.format(r.turnover)}%`;
  $('kTurnoverSub').textContent =
    `${r.admitidos.length} admissões · ${r.demitidos.length} demissões · efetivo médio ${nf.format(r.efetivoMedio)} ` +
    `(${fmtBR(ini)} a ${fmtBR(fim)})`;
  $('turnoverBar').style.width = `${Math.min(r.turnover / 20, 1) * 100}%`; // escala visual até 20%

  $('kTotal').textContent = r.ativosFim.length;
  $('kAdm').textContent = r.admitidos.length;
  $('kDem').textContent = r.demitidos.length;
  $('kFer').textContent = r.emFerias.length;

  renderBars($('gAdm'), contarPor(r.admitidos, 'alocacao'));
  renderBars($('gDem'), contarPor(r.demitidos, 'alocacao'));
  renderBars($('gFer'), contarPor(r.emFerias, 'alocacao'));
  renderBars($('gReg'), contarPor(r.ativosFim, 'regional'));

  renderTabela(r.base, fim);
}

function renderTabela(base, fim) {
  const q = $('fBusca').value.trim().toLowerCase();
  const linhas = base
    .filter((c) => !q || [c.nome, c.matricula, c.alocacao, c.regional].some((v) => String(v || '').toLowerCase().includes(q)))
    .sort((a, b) => String(a.nome).localeCompare(String(b.nome)));
  $('tColab').innerHTML = linhas.map((c) => {
    let sit = ['ativo', 'Ativo'];
    if (c.data_demissao && c.data_demissao <= fim) sit = ['desligado', 'Desligado'];
    else if (c.ferias_inicio && c.ferias_inicio <= fim && (c.ferias_fim || c.ferias_inicio) >= fim) sit = ['ferias', 'Férias'];
    return `<tr><td>${esc(c.matricula || '')}</td><td>${esc(c.nome || '')}</td><td>${esc(c.alocacao || '')}</td>` +
      `<td>${esc(c.regional || '')}</td><td><span class="tag ${sit[0]}">${sit[1]}</span></td></tr>`;
  }).join('') || '<tr><td colspan="5" class="empty">Nenhum colaborador encontrado.</td></tr>';
}

function preencherRegionais() {
  const sel = $('fRegional');
  const atual = sel.value;
  const regs = [...new Set(colaboradores.map((c) => c.regional).filter(Boolean))].sort();
  sel.innerHTML = '<option value="">Todas</option>' + regs.map((r) => `<option>${esc(r)}</option>`).join('');
  if (regs.includes(atual)) sel.value = atual;
}

// ---------- Dados ----------
function normalizar(lista) {
  return lista.map((c) => ({
    matricula: c.matricula ?? '',
    nome: c.nome ?? '',
    alocacao: c.alocacao ?? '',
    regional: c.regional ?? '',
    data_admissao: normDate(c.data_admissao),
    data_demissao: normDate(c.data_demissao),
    ferias_inicio: normDate(c.ferias_inicio),
    ferias_fim: normDate(c.ferias_fim),
  }));
}

function parseCSV(texto) {
  const linhas = texto.replace(/^﻿/, '').split(/\r?\n/).filter((l) => l.trim());
  if (!linhas.length) return [];
  const sep = linhas[0].includes(';') ? ';' : ',';
  const split = (l) => {
    const out = []; let cur = ''; let aspas = false;
    for (const ch of l) {
      if (ch === '"') aspas = !aspas;
      else if (ch === sep && !aspas) { out.push(cur); cur = ''; }
      else cur += ch;
    }
    out.push(cur);
    return out.map((v) => v.trim());
  };
  const cab = split(linhas[0]).map((h) => h.toLowerCase());
  return linhas.slice(1).map((l) => Object.fromEntries(split(l).map((v, i) => [cab[i], v])));
}

function setDados(lista) {
  colaboradores = normalizar(lista);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(colaboradores)); } catch { /* storage indisponível */ }
  preencherRegionais();
  render();
}

function gerarExemplo() {
  // Gerador determinístico para que o exemplo seja sempre igual.
  let seed = 42;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const nomes = ['Ana', 'Bruno', 'Carla', 'Diego', 'Elaine', 'Felipe', 'Gabriela', 'Heitor', 'Isabela', 'João', 'Karina', 'Lucas', 'Mariana', 'Nicolas', 'Olívia', 'Paulo', 'Renata', 'Sérgio', 'Tatiane', 'Vinícius'];
  const sobren = ['Silva', 'Souza', 'Oliveira', 'Santos', 'Lima', 'Pereira', 'Costa', 'Almeida', 'Ribeiro', 'Carvalho'];
  const alocacoes = ['Administrativo', 'Operacional', 'Comercial', 'Logística', 'Manutenção', 'TI'];
  const regionais = ['Regional Sul', 'Regional Sudeste', 'Regional Centro-Oeste', 'Regional Nordeste'];
  const hoje = new Date();
  const lista = [];
  for (let i = 1; i <= 120; i++) {
    const adm = new Date(hoje); adm.setDate(adm.getDate() - Math.floor(rnd() * 1500));
    const c = {
      matricula: String(1000 + i),
      nome: `${pick(nomes)} ${pick(sobren)}`,
      alocacao: pick(alocacoes),
      regional: pick(regionais),
      data_admissao: isoOf(adm),
    };
    if (rnd() < 0.18) {
      const dem = new Date(adm); dem.setDate(dem.getDate() + 30 + Math.floor(rnd() * 1400));
      if (dem < hoje) c.data_demissao = isoOf(dem);
    }
    if (!c.data_demissao && rnd() < 0.3) {
      const fi = new Date(hoje); fi.setDate(fi.getDate() - 300 + Math.floor(rnd() * 330));
      if (fi > adm) {
        const ff = new Date(fi); ff.setDate(ff.getDate() + 29);
        c.ferias_inicio = isoOf(fi); c.ferias_fim = isoOf(ff);
      }
    }
    lista.push(c);
  }
  return lista;
}

// ---------- Init ----------
function init() {
  const hoje = new Date();
  const ini = new Date(hoje.getFullYear(), 0, 1);
  $('fInicio').value = isoOf(new Date(ini.getTime() - ini.getTimezoneOffset() * 60000));
  $('fFim').value = isoOf(new Date(hoje.getTime() - hoje.getTimezoneOffset() * 60000));

  ['fInicio', 'fFim', 'fRegional'].forEach((id) => $(id).addEventListener('change', render));
  $('fBusca').addEventListener('input', render);
  $('btnExemplo').addEventListener('click', () => setDados(gerarExemplo()));
  $('fImport').addEventListener('change', async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const txt = await f.text();
    try {
      setDados(f.name.toLowerCase().endsWith('.json') ? JSON.parse(txt) : parseCSV(txt));
    } catch (err) {
      alert(`Não foi possível ler o arquivo: ${err.message}`);
    }
    e.target.value = '';
  });

  let salvos = null;
  try { salvos = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch { /* ignora */ }
  setDados(Array.isArray(salvos) && salvos.length ? salvos : gerarExemplo());
}

init();
