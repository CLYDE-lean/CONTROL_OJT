/**
 * Indicadores & Ponderaciones Oficiales OJT.
 * Meta = umbral de cumplimiento; Obj. OJT Cump. = piso de alerta (semáforo amarillo).
 * Todos los KPIs 1-3 son mayor_mejor.
 */
export const KPI_OFICIALES = {
  transferencia: { meta: 75, objCump: 65, pesoPct: 20 },
  tnps: { meta: 73, objCump: 65, pesoPct: 40 },
  calidad: { meta: 73, objCump: 65, pesoPct: 40 },
  score: { meta: 75, objCump: 65, wTransf: 0.20, wTnps: 0.40, wCalidad: 0.40 },
  desercion: { meta: 40 }
};

/**
 * Escala Oficial de Condición OJT / Resultado Final:
 * - 0% a 64.99%  -> Desaprobado (Rojo)
 * - 65% a 74.99% -> Ampliación (Azul / Alerta)
 * - 75% a más    -> Aprobado (Verde)
 */
export const ESCALA_CONDICION_OJT = {
  APROBADO: {
    id: 'APROBADO',
    label: 'Aprobado',
    rango: '75% a más',
    min: 75.0,
    color: '#10b981',
    badgeBg: 'rgba(16, 185, 129, 0.15)',
    border: 'rgba(16, 185, 129, 0.35)',
    descripcion: 'Cumple meta ponderada oficial (≥ 75%) e ingresa a Operación'
  },
  AMPLIACION: {
    id: 'AMPLIACION',
    label: 'Ampliación',
    rango: '65% a 74.99%',
    min: 65.0,
    max: 74.99,
    color: '#38bdf8',
    badgeBg: 'rgba(56, 189, 248, 0.15)',
    border: 'rgba(56, 189, 248, 0.35)',
    descripcion: 'En rango de extensión/refuerzo (65% a 74.99%)'
  },
  DESAPROBADO: {
    id: 'DESAPROBADO',
    label: 'Desaprobado',
    rango: '0% a 64.99%',
    min: 0,
    max: 64.99,
    color: '#f43f5e',
    badgeBg: 'rgba(244, 63, 94, 0.15)',
    border: 'rgba(244, 63, 94, 0.35)',
    descripcion: 'Por debajo del piso de cumplimiento (< 65%)'
  }
};

/**
 * Calcula la Nota Ponderada Oficial OJT según las reglas vigentes:
 * Calidad Emitida (40%) + tNPS (40%) + Transferencia (20%)
 */
export function calcularNotaPonderadaOjt(calidad, tnps, transferencia) {
  const c = parseFloat(calidad) || 0;
  const t = parseFloat(tnps) || 0;
  const tr = parseFloat(transferencia) || 0;
  const wCal = (KPI_OFICIALES.calidad.pesoPct || 40) / 100;
  const wTnps = (KPI_OFICIALES.tnps.pesoPct || 40) / 100;
  const wTr = (KPI_OFICIALES.transferencia.pesoPct || 20) / 100;
  const score = (c * wCal) + (t * wTnps) + (tr * wTr);
  return Math.round(score * 10) / 10;
}

/**
 * Determina la Condición Oficial OJT (Aprobado, Ampliación, Desaprobado)
 */
export function getCondicionOjt(score, options = {}) {
  const { esBaja = false, esCesado = false, esIop = false } = options;
  if (esBaja || esCesado) {
    return {
      ...ESCALA_CONDICION_OJT.DESAPROBADO,
      label: 'Desaprobado (Baja)'
    };
  }
  if (esIop) {
    return {
      ...ESCALA_CONDICION_OJT.APROBADO,
      label: 'Aprobado (I-OP)'
    };
  }
  const s = parseFloat(score);
  if (!Number.isFinite(s)) {
    return {
      id: 'PENDIENTE',
      label: 'Sin evaluar',
      rango: '—',
      color: '#94a3b8',
      badgeBg: 'rgba(148, 163, 184, 0.15)',
      border: 'rgba(148, 163, 184, 0.25)',
      descripcion: 'Pendiente de datos de gestión'
    };
  }
  if (s >= ESCALA_CONDICION_OJT.APROBADO.min) {
    return ESCALA_CONDICION_OJT.APROBADO;
  }
  if (s >= ESCALA_CONDICION_OJT.AMPLIACION.min) {
    return ESCALA_CONDICION_OJT.AMPLIACION;
  }
  return ESCALA_CONDICION_OJT.DESAPROBADO;
}

export function kpiPctValido(valor) {
  const n = parseFloat(valor);
  if (!Number.isFinite(n) || n < 0 || n > 150) return null;
  return Math.round(Math.min(100, n) * 10) / 10;
}

export function semaforoMayorMejor(valor, meta, objCump) {
  const v = parseFloat(valor);
  if (valor === null || valor === undefined || Number.isNaN(v)) return 'ROJO';
  if (v >= meta) return 'VERDE';
  if (v >= objCump) return 'AMARILLO';
  return 'ROJO';
}

export function colorSemaforoKpi(semaforo, palette = 'tabla') {
  if (palette === 'tabla') {
    if (semaforo === 'VERDE') return '#00ff9d';
    if (semaforo === 'AMARILLO') return '#ffb703';
    return '#ff0055';
  }
  if (semaforo === 'VERDE') return '#3C9D5C';
  if (semaforo === 'AMARILLO') return '#D9822B';
  return '#D9534F';
}

