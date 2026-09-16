/** Full time = 1 FTE, part time = 0.5 FTE. Misma regla que el ranking de Operación. */
export function getFteValue(jornada, modalidad) {
  const j = String(jornada || '').toUpperCase();
  const m = String(modalidad || '').toUpperCase();
  if (j.includes('PART') || j.includes('PARCIAL') || j.includes('MEDIO') || j.includes('PT') || j === 'P') return 0.5;
  if (j.includes('FULL') || j.includes('COMPLETO') || j.includes('FT') || j === 'F') return 1.0;
  if (j.length > 0) return 1.0;
  if (m.includes('PART') || m.includes('PARCIAL')) return 0.5;
  // Sin jornada: se asume full time (1 FTE) hasta que llegue esa data.
  return 1.0;
}

export function fteDeAsesor(a) {
  const direct = parseFloat(a?.fte);
  if (Number.isFinite(direct) && direct > 0) return direct;
  return getFteValue(a?.jornada, a?.modalidad);
}

export function sumFte(asesores) {
  const total = (asesores || []).reduce((acc, a) => acc + fteDeAsesor(a), 0);
  return Math.round(total * 10) / 10;
}
