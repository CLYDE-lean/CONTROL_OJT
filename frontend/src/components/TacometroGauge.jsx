import React, { useMemo } from 'react';

/**
 * Componente TacometroGauge
 * Tacómetro/Velocímetro semicircular SVG de alta precisión para el Portal BI OJT.
 * Arco en forma de domo superior (∩) con aguja rotativa fluida, marcas de semáforo y estatus.
 */
export default function TacometroGauge({
  valor = 0,
  meta = 0,
  titulo = 'KPI',
  subtitulo = '',
  inverso = false,
  zonas = [],
  icono: Icon,
  colorTema = '#1e6fc0',
  unidad = '%',
  min = 0,
  max = 100,
  onClick
}) {
  const numValor = Math.max(min, Math.min(max, parseFloat(valor) || 0));
  const numMeta = parseFloat(meta) || 0;

  // Evaluación de cumplimiento
  const cumpleMeta = inverso ? numValor <= numMeta : numValor >= numMeta;
  const brecha = Math.abs(numValor - numMeta).toFixed(1);
  const brechaTexto = inverso
    ? numValor <= numMeta
      ? `-${brecha} p.p. (Bajo tope)`
      : `+${brecha} p.p. (Exceso)`
    : numValor >= numMeta
      ? `+${brecha} p.p. (Supera meta)`
      : `-${brecha} p.p. (Bajo meta)`;

  // ── Geometría del Tacómetro Compacto ──
  // Centro del arco en (80, 58). Radio = 44. Trazo = 7.5.
  const cx = 80;
  const cy = 58;
  const r = 44;
  const strokeW = 7.5;

  // Convierte un progreso [0..1] a coordenadas cartesianas sobre el arco superior
  // 0 = Extremo izquierdo (180°), 0.5 = Cenit superior (90°), 1 = Extremo derecho (0°)
  const getPoint = (progress, customR = r) => {
    const p = Math.max(0, Math.min(1, progress));
    const angleRad = p * Math.PI; // de 0 a PI
    return {
      x: Number((cx - customR * Math.cos(angleRad)).toFixed(2)),
      y: Number((cy - customR * Math.sin(angleRad)).toFixed(2))
    };
  };

  // Genera el path SVG del arco entre dos puntos de progreso (p1 < p2)
  const createArc = (p1, p2, customR = r) => {
    const start = getPoint(p1, customR);
    const end = getPoint(p2, customR);
    // sweep-flag = 1 dibuja el arco superior en sentido horario (de izquierda a derecha)
    return `M ${start.x} ${start.y} A ${customR} ${customR} 0 0 1 ${end.x} ${end.y}`;
  };

  // Rango normalizado del valor actual (0 a 1)
  const progressValor = (numValor - min) / (max - min || 1);

  // Ángulo de la aguja: parte de -90° (izq) a +90° (der), con 0° apuntando verticalmente al cenit
  const anguloAguja = useMemo(() => {
    return Number(((progressValor - 0.5) * 180).toFixed(2));
  }, [progressValor]);

  // Marcador de la Meta Oficial
  const progressMeta = (numMeta - min) / (max - min || 1);
  const ptMetaInner = getPoint(progressMeta, r - strokeW / 2 - 2);
  const ptMetaOuter = getPoint(progressMeta, r + strokeW / 2 + 3);

  // Normalizar zonas del arco
  const zonasNormalizadas = useMemo(() => {
    if (!zonas || zonas.length === 0) return [];
    return zonas.map(z => ({
      p1: Math.max(0, Math.min(1, (z.from - min) / (max - min || 1))),
      p2: Math.max(0, Math.min(1, (z.to - min) / (max - min || 1))),
      color: z.color
    })).filter(z => z.p2 > z.p1);
  }, [zonas, min, max]);

  // Colores de estatus
  const statusColor = cumpleMeta ? '#0d9488' : '#dc2626';
  const statusBg = cumpleMeta ? 'rgba(13, 148, 136, 0.1)' : 'rgba(220, 38, 38, 0.1)';

  return (
    <div
      onClick={onClick}
      className="tacometro-card"
      style={{
        background: '#ffffff',
        border: '1px solid #dce3ee',
        borderRadius: '10px',
        padding: '5px 10px 4px 10px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        position: 'relative',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        boxSizing: 'border-box',
        height: '118px'
      }}
    >
      {/* ── Header: Título, Icono y Peso/Detalle ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          {Icon && <Icon size={13} style={{ color: colorTema }} />}
          <span style={{
            fontSize: '0.64rem',
            fontWeight: 800,
            color: '#0f1c2e',
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
            fontFamily: 'Inter, sans-serif'
          }}>
            {titulo}
          </span>
        </div>
        <span style={{
          fontSize: '0.58rem',
          fontWeight: 700,
          color: '#64748b',
          background: '#f1f5f9',
          padding: '1px 5px',
          borderRadius: '4px'
        }}>
          {subtitulo.includes('Peso') ? subtitulo.split('·')[1]?.trim() : subtitulo}
        </span>
      </div>

      {/* ── Cuerpo: Tacómetro SVG y Lectura Digital ── */}
      <div style={{
        position: 'relative',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '0px'
      }}>
        <svg
          viewBox="0 0 160 76"
          style={{ width: '100%', maxWidth: '145px', height: 'auto', maxHeight: '56px', overflow: 'visible' }}
        >
          <defs>
            <filter id={`pivot-sh-${titulo.replace(/[^a-zA-Z0-9]/g, '')}`} x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dx="0" dy="1.5" stdDeviation="1" floodColor="#0f1c2e" floodOpacity="0.28" />
            </filter>
          </defs>

          {/* 1. Pista guía base gris (Arco superior completo) */}
          <path
            d={createArc(0, 1)}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={strokeW + 2}
            strokeLinecap="round"
          />

          {/* 2. Zonas coloreadas del semáforo */}
          {zonasNormalizadas.map((z, idx) => (
            <path
              key={idx}
              d={createArc(z.p1, z.p2)}
              fill="none"
              stroke={z.color}
              strokeWidth={strokeW}
              strokeLinecap={idx === 0 || idx === zonasNormalizadas.length - 1 ? 'round' : 'butt'}
              opacity={0.92}
            />
          ))}

          {/* 3. Marcador de Meta Oficial (Línea transversal) */}
          <line
            x1={ptMetaInner.x}
            y1={ptMetaInner.y}
            x2={ptMetaOuter.x}
            y2={ptMetaOuter.y}
            stroke="#0f1c2e"
            strokeWidth="2.8"
            strokeLinecap="round"
          />

          {/* 4. Marcas de graduación en los extremos (0% y 100%) */}
          <text x={cx - r - 4} y={cy + 9} fontSize="7" fill="#94a3b8" fontWeight="700" textAnchor="end">
            {min}
          </text>
          <text x={cx + r + 4} y={cy + 9} fontSize="7" fill="#94a3b8" fontWeight="700" textAnchor="start">
            {max}
          </text>

          {/* 5. Aguja Vectorial con Rotación Animada */}
          <g
            style={{
              transform: `rotate(${anguloAguja}deg)`,
              transformOrigin: `${cx}px ${cy}px`,
              transition: 'transform 0.85s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            {/* Cuerpo de la aguja apuntando al cenit */}
            <path
              d={`M ${cx - 2.5} ${cy} L ${cx} ${cy - r + 5} L ${cx + 2.5} ${cy} Z`}
              fill="#0f1c2e"
            />
            {/* Contrapeso inferior */}
            <path
              d={`M ${cx - 1.8} ${cy} L ${cx} ${cy + 5} L ${cx + 1.8} ${cy} Z`}
              fill="#475569"
            />
          </g>

          {/* 6. Pivote Central */}
          <circle
            cx={cx}
            cy={cy}
            r="4.5"
            fill="#ffffff"
            stroke="#0f1c2e"
            strokeWidth="2.2"
            filter={`url(#pivot-sh-${titulo.replace(/[^a-zA-Z0-9]/g, '')})`}
          />
          <circle cx={cx} cy={cy} r="1.8" fill={colorTema} />
        </svg>

        {/* ── Cifra Digital Grande y Unidad ── */}
        <div style={{ marginTop: '-8px', textAlign: 'center', lineHeight: 1 }}>
          <span style={{
            fontSize: '1.35rem',
            fontWeight: 800,
            color: '#0f1c2e',
            fontFamily: 'Outfit, var(--font-heading), sans-serif',
            letterSpacing: '-0.03em'
          }}>
            {numValor.toFixed(1)}
          </span>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: colorTema, marginLeft: '1px' }}>
            {unidad}
          </span>
        </div>
      </div>

      {/* ── Footer: Píldora de Cumplimiento y Brecha vs Meta ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '3px',
        paddingTop: '3px',
        borderTop: '1px solid #f1f5f9',
        fontSize: '0.62rem'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '3px',
          background: statusBg,
          color: statusColor,
          padding: '1px 6px',
          borderRadius: '10px',
          fontWeight: 800,
          lineHeight: '1.3'
        }}>
          <span style={{ fontSize: '7px' }}>{cumpleMeta ? '●' : '▲'}</span>
          <span>{cumpleMeta ? 'EN META' : 'EN RIESGO'}</span>
        </div>

        <div style={{ color: '#64748b', fontWeight: 600, fontSize: '0.61rem', whiteSpace: 'nowrap' }}>
          Meta: <strong style={{ color: '#0f1c2e' }}>{inverso ? `≤${numMeta}%` : `≥${numMeta}%`}</strong>
          <span style={{ marginLeft: '4px', color: statusColor }}>({brechaTexto})</span>
        </div>
      </div>
    </div>
  );
}
