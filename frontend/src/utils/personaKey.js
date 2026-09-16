export function personaCohorteKey(a) {
  if (a?.cohort_key) return String(a.cohort_key);
  const dni = String(a?.documento || a?.dni || '').trim();
  const semana = String(a?.semana || '').trim().toUpperCase();
  const grupo = String(a?.grupo || '').trim().toUpperCase();
  return `${dni}|${semana}|${grupo}`;
}
