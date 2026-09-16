/**
 * Sistema Semántico Unificado de Color y Estado OJT (Traffic Light)
 * Asegura coherencia 100% estricta entre el valor, la meta, la barra de progreso,
 * el badge de estado y las filas de tabla asociadas.
 */

export function getStatusColor(valor, meta, tipo = 'mayor_mejor', objCump = null) {
  const v = parseFloat(valor) || 0;
  const m = parseFloat(meta) || 0;
  const isMenorMejor = tipo === 'menor_mejor' || tipo === 'inverso';
  const obj = objCump !== null && objCump !== undefined && objCump !== ''
    ? parseFloat(objCump)
    : null;

  let status = 'CRITICO';
  let diff = 0;

  if (isMenorMejor) {
    diff = Number((v - m).toFixed(1));
    if (v <= m) {
      status = 'META';
    } else if (obj !== null && !Number.isNaN(obj) ? v <= obj : v <= m + 7) {
      status = 'ALERTA';
    } else {
      status = 'CRITICO';
    }
  } else {
    diff = Number((v - m).toFixed(1));
    if (v >= m) {
      status = 'META';
    } else if (obj !== null && !Number.isNaN(obj) ? v >= obj : v >= m - 10) {
      status = 'ALERTA';
    } else {
      status = 'CRITICO';
    }
  }

  const map = {
    META: {
      status: 'META',
      label: 'En meta',
      color: '#16a34a',
      textDark: '#15803d',
      bg: 'rgba(22, 163, 74, 0.12)',
      border: 'rgba(22, 163, 74, 0.22)',
      cssVar: 'var(--status-meta)'
    },
    ALERTA: {
      status: 'ALERTA',
      label: 'Alerta',
      color: '#d97706',
      textDark: '#b45309',
      bg: 'rgba(217, 119, 6, 0.12)',
      border: 'rgba(217, 119, 6, 0.22)',
      cssVar: 'var(--status-alerta)'
    },
    CRITICO: {
      status: 'CRITICO',
      label: 'Alerta',
      color: '#dc2626',
      textDark: '#b91c1c',
      bg: 'rgba(220, 38, 38, 0.12)',
      border: 'rgba(220, 38, 38, 0.22)',
      cssVar: 'var(--status-critico)'
    }
  };

  const deltaText = isMenorMejor
    ? (diff <= 0 ? `(${Math.abs(diff)} p.p. bajo meta)` : `(+${diff} p.p. exceso)`)
    : (diff >= 0 ? `(+${diff} p.p. sobre meta)` : `(${diff} p.p. bajo meta)`);

  const deltaShort = (diff > 0 ? `+${diff}` : `${diff}`) + ' p.p.';

  return {
    ...map[status],
    diff,
    deltaText,
    deltaShort,
    isMenorMejor
  };
}
