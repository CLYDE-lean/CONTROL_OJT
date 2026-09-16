/**
 * Indicadores & Ponderaciones Oficiales OJT.
 * Meta = umbral de cumplimiento; Obj. OJT Cump. = piso de alerta (semáforo amarillo).
 * Todos los KPIs 1-3 son mayor_mejor.
 */
export const KPI_OFICIALES = {
  transferencia: { meta: 75, objCump: 65, pesoPct: 20 },
  tnps: { meta: 73, objCump: 65, pesoPct: 40 },
  calidad: { meta: 73, objCump: 65, pesoPct: 40 },
  score: { meta: 70, wTransf: 0.20, wTnps: 0.40, wCalidad: 0.40 },
  desercion: { meta: 40 }
};

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
