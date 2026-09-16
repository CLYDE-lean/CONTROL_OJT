import React from 'react';

export default function CondicionResultadoOjtCard({ condData, totalAsesores = 0 }) {
  const total = Number(totalAsesores) || Number(condData?.total_evaluados) || 0;
  const aprobadosCount = Number(condData?.aprobados || 0);
  const ampliacionCount = Number(condData?.ampliacion || 0);
  const desaprobadosCount = Number(condData?.desaprobados || 0);
  const clasificados = aprobadosCount + ampliacionCount + desaprobadosCount;
  const sinNotaCount = Math.max(0, total - clasificados);

  const pctOf = (n) => (total > 0 ? Math.round((n / total) * 1000) / 10 : 0);
  const pctAprobados = pctOf(aprobadosCount);
  const pctAmpliacion = pctOf(ampliacionCount);
  const pctDesaprobados = pctOf(desaprobadosCount);
  const pctSinNota = pctOf(sinNotaCount);

  const r = 36;
  const circumference = 2 * Math.PI * r;
  const strokeWidth = 13;
  const toLen = (pct) => (pct / 100) * circumference;

  const lenAprob = toLen(pctAprobados);
  const lenAmpl = toLen(pctAmpliacion);
  const lenDesap = toLen(pctDesaprobados);
  const lenSin = toLen(pctSinNota);

  const offsetAprob = 0;
  const offsetAmpl = -lenAprob;
  const offsetDesap = -(lenAprob + lenAmpl);
  const offsetSin = -(lenAprob + lenAmpl + lenDesap);

  const slices = [
    { label: 'Aprobado', color: '#34d399', pct: pctAprobados, count: aprobadosCount },
    { label: 'Ampliación', color: '#fbbf24', pct: pctAmpliacion, count: ampliacionCount },
    { label: 'Desaprobado', color: '#fb7185', pct: pctDesaprobados, count: desaprobadosCount },
    { label: 'Sin nota / en curso', color: '#64748b', pct: pctSinNota, count: sinNotaCount }
  ];

  return (
    <div style={{
      background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
      borderRadius: '12px',
      border: '1px solid rgba(52, 211, 153, 0.16)',
      boxShadow: '0 8px 24px rgba(2, 6, 23, 0.28)',
      padding: '10px 14px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%',
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <h3 style={{
          fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc',
          fontFamily: 'Inter, sans-serif', margin: 0
        }}>
          Condición de resultado OJT
        </h3>
        <span style={{
          fontSize: '0.62rem', color: '#94a3b8', fontWeight: 600,
          background: 'rgba(255,255,255,0.05)', padding: '2px 6px',
          borderRadius: '4px', border: '1px solid rgba(255,255,255,0.08)'
        }}>
          Incluye sin nota
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: '10px', flex: 1, minHeight: 0 }}>
        <div style={{ width: 'clamp(92px, 8.5vw, 118px)', height: 'clamp(92px, 8.5vw, 118px)', flexShrink: 0, position: 'relative' }}>
          <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
            <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={strokeWidth} />
            <circle cx="50" cy="50" r={r} fill="none" stroke="#34d399" strokeWidth={strokeWidth} strokeDasharray={`${lenAprob} ${circumference}`} strokeDashoffset={offsetAprob} />
            <circle cx="50" cy="50" r={r} fill="none" stroke="#fbbf24" strokeWidth={strokeWidth} strokeDasharray={`${lenAmpl} ${circumference}`} strokeDashoffset={offsetAmpl} />
            <circle cx="50" cy="50" r={r} fill="none" stroke="#fb7185" strokeWidth={strokeWidth} strokeDasharray={`${lenDesap} ${circumference}`} strokeDashoffset={offsetDesap} />
            <circle cx="50" cy="50" r={r} fill="none" stroke="#64748b" strokeWidth={strokeWidth} strokeDasharray={`${lenSin} ${circumference}`} strokeDashoffset={offsetSin} />
          </svg>
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', pointerEvents: 'none'
          }}>
            <span style={{ fontSize: '0.56rem', color: '#94a3b8', fontWeight: 600 }}>DOTACIÓN</span>
            <strong style={{ fontSize: '1.05rem', color: '#f8fafc', fontFamily: "'JetBrains Mono', monospace" }}>
              {total.toLocaleString()}
            </strong>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1, minWidth: 0 }}>
          {slices.map((s) => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.64rem', lineHeight: 1.15 }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: s.color, flexShrink: 0 }} />
              <span style={{ color: '#cbd5e1', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {s.label}: <strong style={{ color: s.color, fontFamily: "'JetBrains Mono', monospace" }}>{s.pct}%</strong>
                <span style={{ color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace" }}> ({s.count})</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
