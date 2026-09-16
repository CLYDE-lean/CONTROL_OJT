const SHEET_ID = '1GNbzbpIDbueydVqOQr-D032Pma1L9FkHf-JPsU9Qi1s';
const SHEET_GID = '249081259';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`;
const TTL_MS = 5 * 60 * 1000;
const https = require('https');

let cache = { at: 0, rows: [], error: null };

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;
  const src = String(text || '').replace(/^\uFEFF/, '');
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    const next = src[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(cell);
      cell = '';
    } else if (ch === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else if (ch !== '\r') {
      cell += ch;
    }
  }
  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => String(c || '').trim() !== ''));
}

function normKey(h) {
  return String(h || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

function toNumber(v) {
  if (v == null || v === '') return 0;
  const s = String(v).trim().replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
  const n = parseFloat(s.replace(/[^\d.-]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function pick(map, row, ...keys) {
  for (const k of keys) {
    if (map[k] != null && row[map[k]] != null && String(row[map[k]]).trim() !== '') {
      return String(row[map[k]]).trim();
    }
  }
  return '';
}

function mapRows(matrix) {
  if (!matrix.length) return [];
  const header = matrix[0].map(normKey);
  const idx = {};
  header.forEach((h, i) => {
    if (h && idx[h] == null) idx[h] = i;
  });

  return matrix.slice(1).map((row, i) => {
    const grupo = pick(idx, row, 'grupo_de_capacitacion', 'grupo', 'cod_grupo');
    const metaD0 = toNumber(pick(idx, row, 'meta_dia_0', 'meta_d0'));
    const metaD1 = toNumber(pick(idx, row, 'meta_dia_1', 'meta_d1'));
    const real = toNumber(pick(idx, row, 'real', 'real_d1', 'cobertura_real', 'cups_real'));
    return {
      id: `${grupo || 'grp'}-${i}`,
      segmento: pick(idx, row, 'segmento'),
      area: pick(idx, row, 'area_traslado', 'area'),
      campana: pick(idx, row, 'campana'),
      grupo,
      semana: pick(idx, row, 'semana'),
      sede: pick(idx, row, 'sede') || '—',
      modalidad: pick(idx, row, 'modalidad'),
      condicion_laboral: pick(idx, row, 'condicion_laboral'),
      estado: pick(idx, row, 'estado'),
      fecha_inicio: pick(idx, row, 'fecha_de_inicio', 'fecha_inicio'),
      periodo: pick(idx, row, 'periodo'),
      rango_horario: pick(idx, row, 'rango_horario'),
      extension_teoria: pick(idx, row, 'extension_teoria'),
      fecha_inicio_ojt: pick(idx, row, 'fecha_inicio_ojt'),
      extension_ojt: pick(idx, row, 'extension_ojt'),
      fecha_ingreso_op: pick(idx, row, 'fecha_ingreso_op'),
      rq_solicitado: toNumber(pick(idx, row, 'rq_solicitado')),
      rq_ftes: toNumber(pick(idx, row, 'rq_ftes_solicitado', 'rq_ftes')),
      meta_d0: metaD0,
      meta_d1: metaD1,
      periodo_ingreso_op: pick(idx, row, 'periodo_ingreso_op'),
      rys_tag: pick(idx, row, '') || '',
      real
    };
  }).filter((r) => r.grupo || r.segmento || r.campana);
}

function uniqueSorted(rows, key) {
  return [...new Set(rows.map((r) => r[key]).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'es'));
}

function applyFilters(rows, q = {}) {
  const needle = String(q.q || '').trim().toLowerCase();
  return rows.filter((r) => {
    if (q.periodo && r.periodo !== q.periodo) return false;
    if (q.semana && r.semana !== q.semana) return false;
    if (q.segmento && r.segmento !== q.segmento) return false;
    if (q.campana && r.campana !== q.campana) return false;
    if (q.estado && r.estado !== q.estado) return false;
    if (q.modalidad && r.modalidad !== q.modalidad) return false;
    if (!needle) return true;
    const blob = `${r.grupo} ${r.campana} ${r.segmento} ${r.semana} ${r.estado}`.toLowerCase();
    return blob.includes(needle);
  });
}

function resumen(rows) {
  const total = rows.length;
  const enCurso = rows.filter((r) => /curso/i.test(r.estado)).length;
  const proy = rows.filter((r) => /proyecc/i.test(r.estado)).length;
  const rqFtes = rows.reduce((a, r) => a + (r.rq_ftes || r.rq_solicitado || 0), 0);
  const metaD0 = rows.reduce((a, r) => a + (r.meta_d0 || 0), 0);
  const metaD1 = rows.reduce((a, r) => a + (r.meta_d1 || 0), 0);
  const real = rows.reduce((a, r) => a + (r.real || 0), 0);
  const riesgo = rows.filter((r) => {
    if (/riesgo|alerta|atraso/i.test(r.estado)) return true;
    if (/cancel/i.test(r.estado)) return false;
    const meta = r.meta_d1 || r.meta_d0 || 0;
    if (meta <= 0) return false;
    const cub = (r.real || 0) / meta;
    return cub < 0.27;
  }).length;
  const cubiertoPct = metaD1 > 0 ? Math.round((real / metaD1) * 1000) / 10 : 0;
  return {
    total_grupos: total,
    en_curso: enCurso,
    proyeccion: proy,
    rq_ftes: Math.round(rqFtes * 10) / 10,
    meta_d0: Math.round(metaD0),
    meta_d1: Math.round(metaD1),
    cobertura_real: Math.round(real),
    cubierto_pct: cubiertoPct,
    falta: Math.max(0, Math.round(metaD1 - real)),
    grupos_riesgo: riesgo
  };
}

function fetchText(url) {
  if (typeof fetch === 'function') {
    return fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 BI-OJT Capacidad RYS' } })
      .then((res) => {
        if (!res.ok) throw new Error(`Google Sheets HTTP ${res.status}`);
        return res.text();
      });
  }
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 BI-OJT Capacidad RYS' } }, (res) => {
      if (res.statusCode && res.statusCode >= 400) {
        reject(new Error(`Google Sheets HTTP ${res.statusCode}`));
        return;
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    }).on('error', reject);
  });
}

async function loadSheet(force = false) {
  if (!force && cache.rows.length && Date.now() - cache.at < TTL_MS) return cache;
  try {
    const text = await fetchText(CSV_URL);
    if (/<html/i.test(text.slice(0, 80))) {
      throw new Error('La hoja no es pública o el enlace expiró');
    }
    cache = { at: Date.now(), rows: mapRows(parseCsv(text)), error: null };
  } catch (err) {
    cache = { ...cache, error: err.message };
    if (!cache.rows.length) throw err;
  }
  return cache;
}

async function getCapacidadRys(query = {}, force = false) {
  const pack = await loadSheet(force);
  const filtradas = applyFilters(pack.rows, query);
  return {
    success: true,
    source: CSV_URL,
    sheet_id: SHEET_ID,
    updated_at: new Date(pack.at).toISOString(),
    warning: pack.error || null,
    kpis: resumen(filtradas),
    filtros: {
      periodos: uniqueSorted(pack.rows, 'periodo'),
      semanas: uniqueSorted(pack.rows, 'semana'),
      segmentos: uniqueSorted(pack.rows, 'segmento'),
      campanas: uniqueSorted(pack.rows, 'campana'),
      estados: uniqueSorted(pack.rows, 'estado'),
      modalidades: uniqueSorted(pack.rows, 'modalidad')
    },
    grupos: filtradas
  };
}

module.exports = { getCapacidadRys, loadSheet };
