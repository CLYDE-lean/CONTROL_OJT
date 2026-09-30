/** Full Time (8h) = 1 FTE, Part Time (4h) = 0.5 FTE. Fuente: condicion_laboral. */

export function parseCondicionFte(value) {
  const s = String(value || '').trim().toUpperCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (!s || s === 'NULL' || s === 'UNDEFINED' || s === '-' || s === 'N/A' || s === 'NA') return null;
  if (s.includes('PART') || s.includes('PARCIAL') || s.includes('MEDIO TIEMPO') || s === 'PT' || s === 'P' || s === '1/2' || s === '0.5') {
    return 0.5;
  }
  if (s.includes('FULL') || s.includes('COMPLETO') || s === 'FT' || s === 'F') return 1.0;
  return null;
}

export function getFteValue(condicion, modalidad) {
  const fromCond = parseCondicionFte(condicion);
  if (fromCond != null) return fromCond;
  const fromMod = parseCondicionFte(modalidad);
  if (fromMod != null) return fromMod;
  return 1.0;
}

export function fteDeAsesor(a) {
  const direct = parseFloat(a?.fte);
  if (Number.isFinite(direct) && direct > 0) return direct;
  return getFteValue(a?.jornada || a?.condicion_laboral, a?.modalidad);
}

export function sumFte(asesores) {
  const total = (asesores || []).reduce((acc, a) => acc + fteDeAsesor(a), 0);
  return Math.round(total * 10) / 10;
}

export function resumenFte(asesores) {
  const list = asesores || [];
  let ftes = 0;
  let pt = 0;
  for (const a of list) {
    const v = fteDeAsesor(a);
    ftes += v;
    if (v < 1) pt += 1;
  }
  return {
    personas: list.length,
    ftes: Math.round(ftes * 10) / 10,
    ft: list.length - pt,
    pt
  };
}
