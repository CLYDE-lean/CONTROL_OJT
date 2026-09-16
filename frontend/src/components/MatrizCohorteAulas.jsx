import React, { useMemo } from 'react';
import { fteDeAsesor } from '../utils/fte';
import { personaCohorteKey } from '../utils/personaKey';

function formatFormador(nombre) {
  if (!nombre) return '—';
  const parts = String(nombre).trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1]}`;
}

function diaDe(a) {
  const n = parseInt(a.dia_actual ?? a.dia_logico_ojt ?? a.dias_ojt_reales ?? 0, 10);
  return Number.isFinite(n) ? n : 0;
}

function buildCohortes(asesores) {
  const unique = new Map();
  (asesores || []).forEach((a) => {
    const doc = personaCohorteKey(a);
    if (!doc || unique.has(doc)) return;
    unique.set(doc, a);
  });

  const map = new Map();
  unique.forEach((a) => {
    const grupo = a.grupo || 'SIN GRUPO';
    if (!map.has(grupo)) {
      map.set(grupo, {
        grupo,
        formador: a.formador || '—',
        campana: a.campana || '—',
        semana: a.semana || '—',
        segmento: a.segmento || '—',
        nomina: 0,
        d1: 0,
        enOjt: 0,
        bajas: 0,
        iop: 0,
        iopFte: 0
      });
    }
    const g = map.get(grupo);
    g.nomina += 1;
    if (diaDe(a) >= 1 || Number(a.es_iop) === 1 || Number(a.es_baja) === 1) g.d1 += 1;

    const esIop = Number(a.es_iop) === 1;
    const esBaja = Number(a.es_baja) === 1 && !esIop;
    if (esIop) {
      g.iop += 1;
      g.iopFte += fteDeAsesor(a);
    } else if (esBaja) {
      g.bajas += 1;
    } else {
      g.enOjt += 1;
    }
  });

  return Array.from(map.values())
    .map((g) => ({
      ...g,
      iopFte: Math.round(g.iopFte * 10) / 10,
      pctIop: g.nomina > 0 ? Math.round((g.iop / g.nomina) * 1000) / 10 : 0
    }))
    .sort((a, b) => {
      if (b.pctIop !== a.pctIop) return b.pctIop - a.pctIop;
      return b.nomina - a.nomina;
    });
}

const TH = {
  fontSize: '0.58rem',
  fontWeight: 700,
  color: '#94a3b8',
  textAlign: 'left',
  padding: '6px 8px',
  whiteSpace: 'nowrap',
  borderBottom: '1px solid rgba(148,163,184,0.14)',
  position: 'sticky',
  top: 0,
  background: '#0f172a',
  zIndex: 1
};

const TD = {
  fontSize: '0.7rem',
  padding: '6px 8px',
  whiteSpace: 'nowrap',
  borderBottom: '1px solid rgba(148,163,184,0.08)',
  fontFamily: 'Inter, sans-serif'
};

export default function MatrizCohorteAulas({
  asesores = [],
  grupoActivo = null,
  onSelectGrupo
}) {
  const filas = useMemo(() => buildCohortes(asesores), [asesores]);

  return (
    <div className="aulas-card" style={{
      background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
      borderRadius: '12px',
      border: '1px solid rgba(56, 189, 248, 0.16)',
      boxShadow: '0 8px 24px rgba(2, 6, 23, 0.28)',
      padding: '10px 12px 8px',
      height: '100%',
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '6px',
        flexShrink: 0,
        gap: '8px'
      }}>
        <h3 style={{
          fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc',
          fontFamily: 'Inter, sans-serif', margin: 0
        }}>
          Matriz por aula
          <span style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: 500, marginLeft: '6px' }}>
            D1 → En OJT → I-OP · {filas.length} grupos
          </span>
        </h3>
        {grupoActivo && (
          <button
            type="button"
            onClick={() => onSelectGrupo?.(null)}
            style={{
              background: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              color: '#38bdf8',
              borderRadius: '4px',
              fontSize: '0.62rem',
              fontWeight: 700,
              padding: '2px 8px',
              cursor: 'pointer'
            }}
          >
            Quitar aula
          </button>
        )}
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '780px' }}>
          <thead>
            <tr>
              <th style={TH}>GRUPO</th>
              <th style={TH}>FORMADOR</th>
              <th style={TH}>CAMPAÑA</th>
              <th style={TH}>SEMANA</th>
              <th style={{ ...TH, textAlign: 'right' }}>D1</th>
              <th style={{ ...TH, textAlign: 'right' }}>EN OJT</th>
              <th style={{ ...TH, textAlign: 'right' }}>BAJAS</th>
              <th style={{ ...TH, textAlign: 'right' }}>I-OP</th>
              <th style={{ ...TH, textAlign: 'right' }}>I-OP FTE</th>
              <th style={{ ...TH, textAlign: 'right' }}>% IOP</th>
              <th style={{ ...TH, minWidth: '90px' }}>FLUJO</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((g) => {
              const active = grupoActivo === g.grupo;
              const n = g.nomina || 1;
              const pIop = (g.iop / n) * 100;
              const pOjt = (g.enOjt / n) * 100;
              const pBaja = (g.bajas / n) * 100;
              return (
                <tr
                  key={g.grupo}
                  onClick={() => onSelectGrupo?.(active ? null : g.grupo)}
                  style={{
                    cursor: 'pointer',
                    background: active ? 'rgba(52, 211, 153, 0.12)' : 'transparent'
                  }}
                  title="Clic para filtrar la matriz de desempeño"
                >
                  <td style={{ ...TD, color: '#38bdf8', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.66rem' }}>
                    {g.grupo}
                  </td>
                  <td style={{ ...TD, color: '#e2e8f0', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {formatFormador(g.formador)}
                  </td>
                  <td style={{ ...TD, color: '#cbd5e1', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {g.campana}
                  </td>
                  <td style={{ ...TD, color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace" }}>{g.semana}</td>
                  <td style={{ ...TD, textAlign: 'right', color: '#22d3ee', fontFamily: "'JetBrains Mono', monospace" }}>{g.d1}</td>
                  <td style={{ ...TD, textAlign: 'right', color: '#fbbf24', fontFamily: "'JetBrains Mono', monospace" }}>{g.enOjt}</td>
                  <td style={{ ...TD, textAlign: 'right', color: '#fb7185', fontFamily: "'JetBrains Mono', monospace" }}>{g.bajas}</td>
                  <td style={{ ...TD, textAlign: 'right', color: '#34d399', fontFamily: "'JetBrains Mono', monospace", fontWeight: 800 }}>{g.iop}</td>
                  <td style={{ ...TD, textAlign: 'right', color: '#34d399', fontFamily: "'JetBrains Mono', monospace" }}>{g.iopFte.toFixed(1)}</td>
                  <td style={{ ...TD, textAlign: 'right', color: g.pctIop >= 29 ? '#34d399' : '#fb7185', fontFamily: "'JetBrains Mono', monospace", fontWeight: 800 }}>
                    {g.pctIop}%
                  </td>
                  <td style={{ ...TD, minWidth: '90px' }}>
                    <div style={{ height: '8px', borderRadius: '3px', display: 'flex', overflow: 'hidden', background: 'rgba(255,255,255,0.06)' }}>
                      <div style={{ width: `${pIop}%`, background: '#34d399' }} title={`I-OP ${g.iop}`} />
                      <div style={{ width: `${pOjt}%`, background: '#fbbf24' }} title={`En OJT ${g.enOjt}`} />
                      <div style={{ width: `${pBaja}%`, background: '#fb7185' }} title={`Bajas ${g.bajas}`} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
