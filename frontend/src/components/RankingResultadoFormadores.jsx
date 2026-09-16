import React from 'react';
import { personaCohorteKey } from '../utils/personaKey';

const MIN_N = 15;

function formatFormador(nombre) {
  if (!nombre) return 'Sin formador';
  const parts = String(nombre).trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1]}`;
}

function buildRanking(asesores, campusPct) {
  const unique = new Map();
  (asesores || []).forEach((a) => {
    const doc = personaCohorteKey(a);
    if (!doc || unique.has(doc)) return;
    unique.set(doc, a);
  });

  const byFormador = new Map();
  unique.forEach((a) => {
    const rawName = a.formador || 'SIN FORMADOR';
    const key = String(rawName).trim().toUpperCase();
    if (!byFormador.has(key)) {
      byFormador.set(key, { formador: rawName, formadorKey: key, n: 0, iop: 0, bajas: 0 });
    }
    const g = byFormador.get(key);
    g.n += 1;
    if (Number(a.es_iop) === 1) g.iop += 1;
    else if (Number(a.es_baja) === 1) g.bajas += 1;
  });

  return Array.from(byFormador.values())
    .map((g) => {
      const pctIop = g.n > 0 ? Math.round((g.iop / g.n) * 1000) / 10 : 0;
      const pctBajas = g.n > 0 ? Math.round((g.bajas / g.n) * 1000) / 10 : 0;
      return {
        ...g,
        pctIop,
        pctBajas,
        delta: Math.round((pctIop - campusPct) * 10) / 10,
        muestraOk: g.n >= MIN_N
      };
    })
    .sort((a, b) => {
      if (a.muestraOk !== b.muestraOk) return a.muestraOk ? -1 : 1;
      if (b.pctIop !== a.pctIop) return b.pctIop - a.pctIop;
      return b.n - a.n;
    });
}

export default function RankingResultadoFormadores({
  asesores = [],
  campusPct = 0,
  formadorActivo = null,
  onSelect
}) {
  const ranking = buildRanking(asesores, campusPct);
  const campusPos = Math.max(0, Math.min(100, campusPct));

  return (
    <div className="ranking-resultado-card" style={{
      background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
      borderRadius: '12px',
      border: '1px solid rgba(52, 211, 153, 0.16)',
      boxShadow: '0 8px 24px rgba(2, 6, 23, 0.28)',
      padding: '10px 12px',
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
        gap: '8px',
        marginBottom: '6px',
        flexShrink: 0
      }}>
        <h3 style={{
          fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc',
          fontFamily: 'Inter, sans-serif', margin: 0
        }}>
          Ranking resultado
          <span className="ranking-subtitle" style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: 500, marginLeft: '6px' }}>
            % IOP vs campus {campusPct}% · n≥{MIN_N}
          </span>
        </h3>
        {formadorActivo && (
          <button
            type="button"
            onClick={() => onSelect?.(null)}
            style={{
              background: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              color: '#38bdf8',
              borderRadius: '4px',
              fontSize: '0.62rem',
              fontWeight: 700,
              padding: '2px 8px',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif'
            }}
          >
            Quitar filtro
          </button>
        )}
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        paddingBottom: '4px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        fontSize: '0.58rem',
        fontWeight: 600,
        color: '#94a3b8',
        fontFamily: 'Inter, sans-serif',
        flexShrink: 0
      }}>
        <span>FORMADOR</span>
        <span className="ranking-col-pct">% IOP</span>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', marginTop: '4px' }}>
        {ranking.length === 0 && (
          <div style={{ color: '#94a3b8', fontSize: '0.76rem', padding: '10px 0', fontFamily: 'Inter, sans-serif' }}>
            Sin formadores en el filtro actual.
          </div>
        )}
        {ranking.map((row) => {
          const active = String(formadorActivo || '').toUpperCase() === row.formadorKey;
          const deltaColor = row.delta >= 0 ? '#34d399' : '#fb7185';
          const deltaTxt = `${row.delta >= 0 ? '+' : ''}${row.delta}`;
          return (
            <button
              key={row.formadorKey}
              type="button"
              onClick={() => onSelect?.(active ? null : row.formador)}
              title={`${row.formador} · ${row.n} personas · IOP ${row.pctIop}% (${deltaTxt} vs campus) · bajas ${row.pctBajas}%`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '3px',
                width: '100%',
                background: active ? 'rgba(52, 211, 153, 0.12)' : 'transparent',
                border: active ? '1px solid rgba(52, 211, 153, 0.35)' : '1px solid transparent',
                borderRadius: '6px',
                padding: '5px 6px',
                cursor: 'pointer',
                textAlign: 'left',
                opacity: row.muestraOk ? 1 : 0.55,
                boxSizing: 'border-box'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', minWidth: 0 }}>
                <span style={{
                  flex: 1,
                  minWidth: 0,
                  fontSize: '0.7rem',
                  color: '#e2e8f0',
                  fontWeight: 600,
                  fontFamily: 'Inter, sans-serif',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {formatFormador(row.formador)}
                  <span style={{ color: '#64748b', fontWeight: 500, marginLeft: '6px', fontFamily: "'JetBrains Mono', monospace" }}>
                    n={row.n}
                  </span>
                  {!row.muestraOk && (
                    <span style={{ color: '#fbbf24', fontSize: '0.56rem', marginLeft: '4px' }}>n&lt;{MIN_N}</span>
                  )}
                </span>
                <span className="ranking-row-pct" style={{
                  flexShrink: 0,
                  minWidth: '4.8rem',
                  textAlign: 'right',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: deltaColor,
                  fontFamily: "'JetBrains Mono', monospace"
                }}>
                  {row.pctIop}% <span style={{ fontWeight: 600, fontSize: '0.62rem' }}>{deltaTxt}</span>
                </span>
              </div>
              <div style={{
                position: 'relative',
                height: '7px',
                borderRadius: '3px',
                background: 'rgba(255,255,255,0.06)'
              }}>
                <div style={{
                  width: `${Math.min(100, row.pctIop)}%`,
                  height: '100%',
                  borderRadius: '3px',
                  background: row.delta >= 0
                    ? 'linear-gradient(90deg, #10b981 0%, #34d399 100%)'
                    : 'linear-gradient(90deg, #fb7185 0%, #f43f5e 100%)'
                }} />
                <div style={{
                  position: 'absolute',
                  left: `${campusPos}%`,
                  top: '-2px',
                  bottom: '-2px',
                  width: '2px',
                  background: '#38bdf8',
                  borderRadius: '1px'
                }} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
