import React from 'react';
import { personaCohorteKey } from '../utils/personaKey';

function formatFormadorCorto(nombre) {
  if (!nombre) return '';
  const parts = nombre.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1]}`;
}

export default function EstadoFinalGrupoFormador({ data, filtros = {}, formadorActivo = null }) {
  const rawAsesores = data?.matriz?.asesores || [];

  const isDummy = (v) => !v || String(v).trim() === '' || String(v).toUpperCase().startsWith('TODO') || String(v).toUpperCase().startsWith('ALL') || String(v).toUpperCase().startsWith('SIN ');

  const pFiltro = !isDummy(filtros.periodo) ? String(filtros.periodo).toUpperCase() : null;
  const sFiltro = !isDummy(filtros.semana) ? String(filtros.semana).toUpperCase() : null;
  const segFiltro = !isDummy(filtros.segmento) ? String(filtros.segmento).toUpperCase() : null;
  const cFiltro = !isDummy(filtros.campana) ? String(filtros.campana).toUpperCase() : null;
  const gFiltro = !isDummy(filtros.grupo) ? String(filtros.grupo).toUpperCase() : null;
  const fFiltro = !isDummy(formadorActivo)
    ? String(formadorActivo).toUpperCase()
    : (!isDummy(filtros.formador) ? String(filtros.formador).toUpperCase() : null);

  // 1. Filtrar asesores por los 5 filtros clave: Periodo, Semana, Segmento, Campaña y Grupo
  const filteredAsesores = rawAsesores.filter(a => {
    if (pFiltro && !String(a.periodo || '').toUpperCase().includes(pFiltro)) return false;
    if (sFiltro && !String(a.semana || '').toUpperCase().includes(sFiltro)) return false;
    if (segFiltro && !String(a.segmento || '').toUpperCase().includes(segFiltro)) return false;
    if (cFiltro && !String(a.campana || '').toUpperCase().includes(cFiltro)) return false;
    if (gFiltro && !String(a.grupo || '').toUpperCase().includes(gFiltro)) return false;
    if (fFiltro && !String(a.formador || '').toUpperCase().includes(fFiltro)) return false;
    return true;
  });

  // 2. Garantizar PERSONAS ÚNICAS por DNI / Documento
  const uniquePersonas = new Map();
  filteredAsesores.forEach(a => {
    const doc = personaCohorteKey(a);
    if (!doc) return;
    if (!uniquePersonas.has(doc)) {
      uniquePersonas.set(doc, a);
    }
  });

  // 3. Agrupar por COD_GRUPO y FORMADOR calculando Ingresos a Operación (I-OP) vs Bajas
  const gruposMap = new Map();
  uniquePersonas.forEach(a => {
    const key = a.grupo || 'SIN GRUPO';
    if (!gruposMap.has(key)) {
      gruposMap.set(key, {
        grupo: key,
        formador: a.formador || 'Formador',
        ingresos_op: 0,
        bajas: 0,
        en_curso: 0,
        total: 0
      });
    }
    const g = gruposMap.get(key);
    g.total += 1;

    const esIop = Number(a.es_iop) === 1;
    const esBaja = Number(a.es_baja) === 1 && !esIop;

    if (esIop) {
      g.ingresos_op += 1;
    } else if (esBaja) {
      g.bajas += 1;
    } else {
      g.en_curso += 1;
    }
  });

  const computedList = Array.from(gruposMap.values()).sort((a, b) => {
    const pa = a.total > 0 ? a.ingresos_op / a.total : 0;
    const pb = b.total > 0 ? b.ingresos_op / b.total : 0;
    if (pb !== pa) return pb - pa;
    return b.total - a.total;
  });
  const gruposList = computedList;

  return (
    <div style={{
      background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
      borderRadius: '12px',
      border: '1px solid rgba(56, 189, 248, 0.16)',
      boxShadow: '0 8px 24px rgba(2, 6, 23, 0.28)',
      padding: '10px 14px',
      height: '100%',
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* ── Encabezado ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '6px'
      }}>
        <h3 style={{
          fontSize: '0.8rem',
          fontWeight: 700,
          color: '#f8fafc',
          fontFamily: "Inter, -apple-system, sans-serif",
          letterSpacing: '-0.01em',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          Estado final por grupo y formador
        </h3>

        {/* Badge: Ingresos a Operación vs Bajas */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '2px 8px',
          borderRadius: '4px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
          <span style={{ fontSize: '0.62rem', color: '#10b981', fontWeight: 700 }}>Ingresos OP</span>
          <span style={{ fontSize: '0.6rem', color: '#64748b' }}>vs</span>
          <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }} />
          <span style={{ fontSize: '0.62rem', color: '#ef4444', fontWeight: 700 }}>Bajas</span>
        </div>
      </div>

      {/* Encabezados de Columna */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(115px, 1.3fr) 1.8fr 50px',
        gap: '8px',
        paddingBottom: '4px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        fontSize: '0.62rem',
        fontWeight: 600,
        color: '#94a3b8',
        fontFamily: 'Inter, -apple-system, sans-serif'
      }}>
        <span>GRUPO / FORMADOR</span>
        <span style={{ textAlign: 'center' }}>IOP · EN CURSO · BAJAS</span>
        <span style={{ textAlign: 'right' }}>% IOP</span>
      </div>

      {/* Filas de Grupos */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        marginTop: '4px',
        gap: '3px'
      }}>
        {gruposList.length === 0 && (
          <div style={{ color: '#94a3b8', fontSize: '0.78rem', padding: '12px 0', fontFamily: 'Inter, sans-serif' }}>
            Sin grupos en el filtro actual.
          </div>
        )}
        {gruposList.map((g, idx) => {
          const total = g.total || 1;
          const pctOp = Math.round((g.ingresos_op / total) * 100);
          const pctBajas = Math.round((g.bajas / total) * 100);
          const pctEnCurso = Math.max(0, 100 - pctOp - pctBajas);

          return (
            <div
              key={g.grupo || idx}
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(115px, 1.3fr) 1.8fr 50px',
                gap: '8px',
                alignItems: 'center',
                padding: '2px 0'
              }}
            >
              {/* Grupo y Formador */}
              <span
                style={{
                  fontSize: '0.72rem',
                  color: '#e2e8f0',
                  fontWeight: 500,
                  fontFamily: 'Inter, -apple-system, sans-serif',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
                title={`${g.grupo} · ${g.formador}`}
              >
                {g.grupo} · {formatFormadorCorto(g.formador)}
              </span>

              {/* Barra Stacked: Ingresos OP (Verde #10b981) + En Curso (Slate #475569) + Bajas (Rojo #ef4444) */}
              <div style={{
                height: '11px',
                borderRadius: '3px',
                background: 'rgba(255, 255, 255, 0.06)',
                display: 'flex',
                overflow: 'hidden'
              }}>
                {/* Segmento 1: Ingreso a Operación (Verde) */}
                {pctOp > 0 && (
                  <div
                    style={{
                      width: `${pctOp}%`,
                      background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                      transition: 'width 0.4s ease'
                    }}
                    title={`Ingresos a Operación: ${g.ingresos_op} (${pctOp}%)`}
                  />
                )}

                {/* Segmento 2: En Curso OJT (si hay) */}
                {pctEnCurso > 0 && (
                  <div
                    style={{
                      width: `${pctEnCurso}%`,
                      background: 'rgba(100, 116, 139, 0.6)',
                      transition: 'width 0.4s ease'
                    }}
                    title={`En curso OJT: ${g.en_curso} (${pctEnCurso}%)`}
                  />
                )}

                {/* Segmento 3: Bajas (Rojo) */}
                {pctBajas > 0 && (
                  <div
                    style={{
                      width: `${pctBajas}%`,
                      background: 'linear-gradient(90deg, #f43f5e 0%, #e11d48 100%)',
                      transition: 'width 0.4s ease'
                    }}
                    title={`Bajas: ${g.bajas} (${pctBajas}%)`}
                  />
                )}
              </div>

              {/* Total Personas Únicas */}
              <span style={{
                fontSize: '0.72rem',
                color: '#34d399',
                fontWeight: 800,
                fontFamily: "'JetBrains Mono', monospace",
                textAlign: 'right'
              }}>
                {pctOp}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
