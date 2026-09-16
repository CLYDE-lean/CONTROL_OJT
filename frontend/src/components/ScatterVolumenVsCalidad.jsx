import React, { useState, useMemo, useRef, useEffect } from 'react';

const CONFIG_INDICADORES = {
  calidad: {
    id: 'calidad',
    label: 'CALIDAD (KPI 3)',
    shortName: 'Calidad Emitida',
    kpiCode: 'KPI 3',
    umbral: 73,
    minVal: 40,
    maxVal: 100,
    unit: '%',
    getValor: (a) => parseFloat(a.calidad_pct ?? a.kpi3_pct ?? a.calidadPct ?? a.calidad)
  },
  tnps: {
    id: 'tnps',
    label: 'tNPS (KPI 2)',
    shortName: 'tNPS',
    kpiCode: 'KPI 2',
    umbral: 73,
    minVal: 30,
    maxVal: 100,
    unit: '%',
    getValor: (a) => parseFloat(a.tnps_pct ?? a.kpi2_pct ?? a.tnpsPct ?? a.tnps)
  },
  transferencia: {
    id: 'transferencia',
    label: 'TRANSFERENCIA (KPI 1)',
    shortName: 'Transferencia',
    kpiCode: 'KPI 1',
    umbral: 75,
    minVal: 30,
    maxVal: 100,
    unit: '%',
    getValor: (a) => parseFloat(a.transferencia_pct ?? a.kpi1_pct ?? a.transfPct ?? a.transferencia)
  }
};

const Q_META = {
  Q1_TOP: { label: 'Alto rendimiento', color: '#34d399' },
  Q3_SATURACION: { label: 'Riesgo saturación', color: '#fbbf24' },
  Q4_PRIORITARIA: { label: 'Atención prioritaria', color: '#fb7185' },
  Q2_CRECIMIENTO: { label: 'Potencial crecimiento', color: '#38bdf8' }
};

function hashStr(s) {
  let h = 2166136261;
  const str = String(s || '');
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function jitterOf(key, amp) {
  const h = hashStr(key);
  return (((h % 1000) / 1000) - 0.5) * 2 * amp;
}

export default function ScatterVolumenVsCalidad({ data, formadorActivo = null, grupoActivo = null }) {
  const [indicadorActivo, setIndicadorActivo] = useState('calidad');
  const [asesorHover, setAsesorHover] = useState(null);
  const [cuadranteFiltro, setCuadranteFiltro] = useState(null);

  const svgContainerRef = useRef(null);
  const [dims, setDims] = useState({ width: 760, height: 380 });

  useEffect(() => {
    if (!svgContainerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 120 && height > 100) {
          setDims({ width: Math.round(width), height: Math.round(height) });
        }
      }
    });
    ro.observe(svgContainerRef.current);
    return () => ro.disconnect();
  }, []);

  const config = CONFIG_INDICADORES[indicadorActivo] || CONFIG_INDICADORES.calidad;
  const rawAsesoresAll = data?.matriz?.asesores || [];
  const needleFormador = formadorActivo ? String(formadorActivo).toUpperCase() : null;
  const needleGrupo = grupoActivo ? String(grupoActivo).toUpperCase() : null;
  const rawAsesores = rawAsesoresAll.filter((a) => {
    if (needleFormador && !String(a.formador || '').toUpperCase().includes(needleFormador)) return false;
    if (needleGrupo && String(a.grupo || '').toUpperCase() !== needleGrupo) return false;
    return true;
  });

  const puntos = useMemo(() => {
    const umbralVolumen = 16;
    const umbralY = config.umbral;
    if (!rawAsesores.length) return [];

    return rawAsesores.reduce((acc, a, idx) => {
      const llamadas = parseFloat(a.promedio_llamadas ?? a.q_atendidas ?? a.llamadas_q ?? a.prom_llamadas ?? a.llamadas);
      const rawValY = config.getValor(a);
      if (!Number.isFinite(llamadas) || !Number.isFinite(rawValY)) return acc;

      const altoVolumen = llamadas >= umbralVolumen;
      const altoY = rawValY >= umbralY;
      let cuadrante = 'Q4_PRIORITARIA';
      if (altoVolumen && altoY) cuadrante = 'Q1_TOP';
      else if (!altoVolumen && altoY) cuadrante = 'Q2_CRECIMIENTO';
      else if (altoVolumen && !altoY) cuadrante = 'Q3_SATURACION';

      const key = a.cohort_key || String(a.documento || a.dni || idx);
      acc.push({
        dni: key,
        nombre: a.asesor || a.nombre || 'Asesor OJT',
        formador: a.formador || '—',
        grupo: a.grupo || '—',
        llamadas: Number(llamadas.toFixed(1)),
        valorY: Number(rawValY.toFixed(1)),
        jx: jitterOf(`${key}-x`, 4.5),
        jy: jitterOf(`${key}-y`, 4.5),
        cuadrante,
        cuadranteLabel: Q_META[cuadrante].label,
        color: Q_META[cuadrante].color
      });
      return acc;
    }, []);
  }, [rawAsesores, config]);

  const conteos = useMemo(() => {
    const c = { Q1_TOP: 0, Q2_CRECIMIENTO: 0, Q3_SATURACION: 0, Q4_PRIORITARIA: 0 };
    puntos.forEach((p) => { c[p.cuadrante] += 1; });
    return c;
  }, [puntos]);

  const puntosVisibles = cuadranteFiltro
    ? puntos.filter((p) => p.cuadrante === cuadranteFiltro)
    : puntos;

  const svgWidth = dims.width;
  const svgHeight = dims.height;
  const leftMargin = 16;
  const rightMargin = Math.max(leftMargin + 100, svgWidth - 16);
  const topMargin = 8;
  const bottomMargin = Math.max(topMargin + 100, svgHeight - 8);
  const lineX = Math.round(leftMargin + (rightMargin - leftMargin) * 0.32);
  const lineY = Math.round(topMargin + (bottomMargin - topMargin) * 0.35);
  const maxVol = 45;

  const getX = (vol) => {
    if (vol <= 16) return leftMargin + (vol / 16) * (lineX - leftMargin);
    return lineX + ((vol - 16) / (maxVol - 16)) * (rightMargin - lineX);
  };

  const getY = (val) => {
    if (val >= config.umbral) {
      const span = config.maxVal - config.umbral;
      const ratio = span > 0 ? (val - config.umbral) / span : 0;
      return lineY - ratio * (lineY - topMargin);
    }
    const span = config.umbral - config.minVal;
    const ratio = span > 0 ? (config.umbral - val) / span : 0;
    return lineY + ratio * (bottomMargin - lineY);
  };

  const plotX = (p) => Math.max(leftMargin + 6, Math.min(rightMargin - 6, getX(p.llamadas) + p.jx));
  const plotY = (p) => Math.max(topMargin + 6, Math.min(bottomMargin - 6, getY(p.valorY) + p.jy));

  return (
    <div className="scatter-card" style={{
      background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
      borderRadius: '12px',
      border: '1px solid rgba(56, 189, 248, 0.16)',
      boxShadow: '0 8px 24px rgba(2, 6, 23, 0.28)',
      padding: '8px 12px 8px 12px',
      height: '100%',
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div className="scatter-chrome">
        <h3 style={{
          fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc',
          fontFamily: 'Inter, sans-serif', margin: 0, flex: '0 1 auto', minWidth: 0
        }}>
          Matriz de desempeño
          <span style={{ fontSize: '0.66rem', color: '#94a3b8', fontWeight: 500, marginLeft: '6px' }}>
            Volumen vs {config.shortName} · {puntos.length} con KPI
          </span>
        </h3>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '3px',
          background: 'rgba(255, 255, 255, 0.04)', padding: '2px 3px',
          borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.08)',
          flexShrink: 0
        }}>
          {Object.values(CONFIG_INDICADORES).map((item) => {
            const isActivo = indicadorActivo === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setIndicadorActivo(item.id); setCuadranteFiltro(null); }}
                style={{
                  background: isActivo ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                  border: isActivo ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
                  borderRadius: '4px',
                  color: isActivo ? '#38bdf8' : '#94a3b8',
                  padding: '2px 7px',
                  fontSize: '0.62rem',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="scatter-legend">
          {Object.entries(Q_META).map(([id, meta]) => {
            const active = cuadranteFiltro === id;
            return (
              <button
                key={id}
                onClick={() => setCuadranteFiltro(active ? null : id)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  background: active ? `${meta.color}22` : 'transparent',
                  border: active ? `1px solid ${meta.color}` : '1px solid transparent',
                  borderRadius: '4px',
                  color: '#e2e8f0',
                  padding: '1px 5px',
                  fontSize: '0.62rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  whiteSpace: 'nowrap'
                }}
                title="Filtrar este cuadrante"
              >
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: meta.color, flexShrink: 0 }} />
                {meta.label}
                <span style={{ color: meta.color, fontFamily: "'JetBrains Mono', monospace" }}>{conteos[id]}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div ref={svgContainerRef} style={{ position: 'relative', flex: 1, minHeight: 0, width: '100%' }}>
        {puntos.length === 0 ? (
          <div style={{
            height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#94a3b8', fontSize: '0.82rem', fontFamily: 'Inter, sans-serif', textAlign: 'center', padding: '16px'
          }}>
            Sin puntos para graficar: faltan llamadas o el KPI seleccionado en el filtro actual.
          </div>
        ) : (
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: '100%', overflow: 'visible', display: 'block' }}>
            <rect x={leftMargin} y={topMargin} width={lineX - leftMargin} height={lineY - topMargin} fill="rgba(56, 189, 248, 0.07)" />
            <rect x={lineX} y={topMargin} width={rightMargin - lineX} height={lineY - topMargin} fill="rgba(52, 211, 153, 0.07)" />
            <rect x={leftMargin} y={lineY} width={lineX - leftMargin} height={bottomMargin - lineY} fill="rgba(251, 113, 133, 0.07)" />
            <rect x={lineX} y={lineY} width={rightMargin - lineX} height={bottomMargin - lineY} fill="rgba(251, 191, 36, 0.07)" />
            <rect x={leftMargin} y={topMargin} width={rightMargin - leftMargin} height={bottomMargin - topMargin} fill="none" stroke="rgba(148, 163, 184, 0.28)" strokeWidth="1" />
            <line x1={lineX} y1={topMargin} x2={lineX} y2={bottomMargin} stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="5 4" opacity="0.7" />
            <line x1={leftMargin} y1={lineY} x2={rightMargin} y2={lineY} stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="5 4" opacity="0.7" />

            <text x={rightMargin - 8} y={topMargin + 14} fontSize="9" fill="#34d399" fontWeight="600" textAnchor="end" fontFamily="Inter, sans-serif">Alto rendimiento</text>
            <text x={lineX - 8} y={lineY - 8} fontSize="9" fill="#38bdf8" fontWeight="600" textAnchor="end" fontFamily="Inter, sans-serif">Potencial de crecimiento</text>
            <text x={lineX + 8} y={lineY + 14} fontSize="9" fill="#fbbf24" fontWeight="600" fontFamily="Inter, sans-serif">Riesgo de saturación</text>
            <text x={leftMargin + 8} y={bottomMargin - 8} fontSize="9" fill="#fb7185" fontWeight="600" fontFamily="Inter, sans-serif">Atención prioritaria</text>

            {asesorHover && (
              <g>
                <line x1={leftMargin} y1={plotY(asesorHover)} x2={rightMargin} y2={plotY(asesorHover)} stroke={asesorHover.color} strokeWidth="1" strokeDasharray="4 3" opacity="0.7" />
                <line x1={plotX(asesorHover)} y1={topMargin} x2={plotX(asesorHover)} y2={bottomMargin} stroke={asesorHover.color} strokeWidth="1" strokeDasharray="4 3" opacity="0.7" />
              </g>
            )}

            {puntosVisibles.map((p) => {
              const cx = plotX(p);
              const cy = plotY(p);
              const isHovered = asesorHover?.dni === p.dni;
              return (
                <circle
                  key={p.dni}
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 6.2 : Math.max(3.4, Math.min(4.4, svgHeight / 90))}
                  fill={p.color}
                  opacity={isHovered ? 1 : 0.55}
                  stroke="#0f172a"
                  strokeWidth={isHovered ? 1.4 : 0.7}
                  onMouseEnter={() => setAsesorHover(p)}
                  onMouseLeave={() => setAsesorHover(null)}
                  style={{ cursor: 'pointer' }}
                />
              );
            })}
          </svg>
        )}

        {asesorHover && (
          <div style={{
            position: 'absolute',
            top: `${Math.min(72, Math.max(8, (plotY(asesorHover) / svgHeight) * 100 - 12))}%`,
            left: `${Math.min(68, Math.max(8, (plotX(asesorHover) / svgWidth) * 100 + 3))}%`,
            background: 'rgba(15, 23, 42, 0.96)',
            border: `1px solid ${asesorHover.color}`,
            borderRadius: '8px',
            padding: '8px 11px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.45)',
            color: '#f8fafc',
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.72rem',
            zIndex: 10,
            pointerEvents: 'none',
            minWidth: '200px'
          }}>
            <div style={{ fontWeight: 700, marginBottom: '4px' }}>{asesorHover.nombre}</div>
            <div style={{ color: '#94a3b8', fontSize: '0.64rem', marginBottom: '6px' }}>
              {asesorHover.grupo} · {asesorHover.formador}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.66rem' }}>
              <div>
                <span style={{ color: '#64748b', display: 'block' }}>Llamadas/día</span>
                <strong style={{ color: '#38bdf8' }}>{asesorHover.llamadas}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block' }}>{config.shortName}</span>
                <strong style={{ color: asesorHover.valorY >= config.umbral ? '#34d399' : '#fb7185' }}>
                  {asesorHover.valorY}{config.unit}
                </strong>
              </div>
            </div>
            <div style={{ marginTop: '6px', color: asesorHover.color, fontWeight: 700, fontSize: '0.62rem' }}>
              {asesorHover.cuadranteLabel}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
