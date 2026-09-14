import React, { useEffect, useState, useRef } from 'react';
import { TrendingUp, Award, Layers, Sparkles, Maximize2, X, Eye, EyeOff } from 'lucide-react';

/**
 * Componente CurvaAprendizajeSemana
 * Muestra la evolución semanal de los KPIs con:
 * 1. Eje Y visible (0-100%).
 * 2. Línea prominente de Score Ponderado en color Índigo Real (#6366f1) (Reemplazando el negro).
 * 3. Indicadores interactivos en columna lateral: al hacer clic en cualquiera de ellos se oculta/muestra su línea en el gráfico.
 * 4. Botón "Ampliar" para desplegar la gráfica a pantalla completa en un modal interactivo con los mismos controles.
 * 5. Soporte reactivo a filtros y ResizeObserver 1:1 sin letterboxing.
 */
export default function CurvaAprendizajeSemana({ filters = {} }) {
  const [semanasData, setSemanasData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  // Estado de visibilidad interactiva para cada serie de KPIs (al hacer clic en los indicadores)
  const [visibles, setVisibles] = useState({
    score: true,
    kpi1: true,
    kpi2: true,
    kpi3: true,
  });

  const toggleVisibilidad = (key) => {
    setVisibles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Referencia para el contenedor SVG y estado para sus dimensiones reales en px
  const wrapperRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 460, height: 215 });

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.semana) params.append('semana', filters.semana);
        if (filters.periodo) params.append('periodo', filters.periodo);
        if (filters.campana) params.append('campana', filters.campana);
        if (filters.formador) params.append('formador', filters.formador);
        if (filters.grupo) params.append('grupo', filters.grupo);
        if (filters.modalidad) params.append('modalidad', filters.modalidad);
        if (filters.segmento) params.append('segmento', filters.segmento);
        if (filters.estado) params.append('estado', filters.estado);

        const res = await fetch(`/api/ojt/curva-aprendizaje-semana?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.semanas && json.semanas.length > 0) {
            setSemanasData(json.semanas);
          } else if (isMounted) {
            setSemanasData([
              { semana: 'Semana 1', kpi1: 58.2, kpi2: 61.5, kpi3: 59.8, score_ponderado: 60.2 },
              { semana: 'Semana 2', kpi1: 64.4, kpi2: 68.2, kpi3: 65.5, score_ponderado: 66.4 },
              { semana: 'Semana 3', kpi1: 71.0, kpi2: 73.6, kpi3: 66.5, score_ponderado: 70.2 },
              { semana: 'Semana 4', kpi1: 75.4, kpi2: 78.1, kpi3: 74.2, score_ponderado: 76.0 }
            ]);
          }
        }
      } catch (err) {
        console.error('Error cargando curva de aprendizaje:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, [filters.semana, filters.periodo, filters.campana, filters.formador, filters.grupo, filters.modalidad, filters.segmento, filters.estado]);

  // ResizeObserver para medir en tiempo real las dimensiones píxel a píxel del contenedor SVG
  useEffect(() => {
    if (!wrapperRef.current) return;

    const measureSize = () => {
      if (wrapperRef.current) {
        const { clientWidth, clientHeight } = wrapperRef.current;
        if (clientWidth > 0 && clientHeight > 0) {
          setCanvasSize({ width: Math.round(clientWidth), height: Math.round(clientHeight) });
        }
      }
    };

    measureSize();

    const observer = new ResizeObserver((entries) => {
      if (entries && entries[0] && entries[0].contentRect) {
        const { width, height } = entries[0].contentRect;
        if (width > 0 && height > 0) {
          setCanvasSize({ width: Math.round(width), height: Math.round(height) });
        }
      }
    });

    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  const list = semanasData.length > 0 ? semanasData : [
    { semana: 'Semana 1', kpi1: 58.2, kpi2: 61.5, kpi3: 59.8, score_ponderado: 60.2 },
    { semana: 'Semana 2', kpi1: 64.4, kpi2: 68.2, kpi3: 65.5, score_ponderado: 66.4 },
    { semana: 'Semana 3', kpi1: 71.0, kpi2: 73.6, kpi3: 66.5, score_ponderado: 70.2 },
    { semana: 'Semana 4', kpi1: 75.4, kpi2: 78.1, kpi3: 74.2, score_ponderado: 76.0 }
  ];

  const n = list.length;
  const ultimoPunto = list[n - 1] || list[0];

  // Geometría y Coordenadas SVG Proporcionales (Relación 1:1 en px reales)
  const marginLeft = Math.max(34, canvasSize.width * 0.08);
  const marginRight = Math.max(48, canvasSize.width * 0.11);
  const marginTop = Math.max(14, canvasSize.height * 0.07);
  const marginBottom = Math.max(20, canvasSize.height * 0.10);

  const plotWidth = Math.max(10, canvasSize.width - marginLeft - marginRight);
  const plotHeight = Math.max(10, canvasSize.height - marginTop - marginBottom);

  const getX = (i) => {
    if (n <= 1) return marginLeft + plotWidth / 2;
    return marginLeft + (i / (n - 1)) * plotWidth;
  };
  const getY = (val) => (canvasSize.height - marginBottom) - ((Math.min(Math.max(val, 0), 100)) / 100) * plotHeight;

  // Generar puntos para polyline y path
  const pointsKPI1 = list.map((s, i) => `${getX(i)},${getY(s.kpi1)}`).join(' ');
  const pointsKPI2 = list.map((s, i) => `${getX(i)},${getY(s.kpi2)}`).join(' ');
  const pointsKPI3 = list.map((s, i) => `${getX(i)},${getY(s.kpi3)}`).join(' ');
  const pointsScore = list.map((s, i) => `${getX(i)},${getY(s.score_ponderado)}`).join(' ');

  // Sombreado de área bajo la curva del Score Ponderado (Índigo)
  const yBase = canvasSize.height - marginBottom;
  const areaScore = `M ${marginLeft} ${yBase} L ${list.map((s, i) => `${getX(i)} ${getY(s.score_ponderado)}`).join(' L ')} L ${getX(n - 1)} ${yBase} Z`;

  const meta80Y = getY(80);
  const estaCercaMeta = (ultimoPunto?.score_ponderado || 0) >= 78;

  const formatSemanaLabel = (raw) => {
    let str = String(raw || '').trim();
    str = str.replace(/^semana\s*/i, '');
    str = str.replace(/^sem\s*/i, '');
    return `Sem ${str}`;
  };

  const stepLabel = n <= 7 ? 1 : n <= 14 ? 2 : n <= 21 ? 3 : Math.ceil(n / 6);
  const shouldShowLabel = (index) => {
    if (index === 0 || index === n - 1) return true;
    return index % stepLabel === 0;
  };

  return (
    <div className="executive-card" style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0,
      overflow: 'hidden',
      padding: '0.65rem 0.95rem',
      marginBottom: 0,
      boxSizing: 'border-box'
    }}>
      
      {/* ── Cabecera con Botón de Ampliar ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.35rem',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '0.35rem',
        flexWrap: 'wrap',
        gap: '0.35rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '24px', height: '24px', borderRadius: '6px',
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
              boxShadow: '0 3px 8px rgba(99, 102, 241, 0.3)'
            }}>
              <TrendingUp size={13} />
            </div>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1c1c1e', fontFamily: 'Outfit, sans-serif', margin: 0, letterSpacing: '-0.02em' }}>
              Curva de Aprendizaje por Semana
            </h3>
          </div>
          <p style={{ fontSize: '0.68rem', color: '#8e8e93', marginTop: '0.1rem', margin: 0 }}>
            Haz clic en cualquier indicador para encender/apagar su gráfica interactiva · {n} semanas
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {/* Badge de Score Actual (Índigo Reemplazando el Negro) */}
          <div style={{
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            color: '#4f46e5',
            padding: '0.18rem 0.45rem',
            borderRadius: '9999px',
            fontSize: '0.66rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}>
            <Sparkles size={11} />
            Score: {ultimoPunto.score_ponderado}%
          </div>

          {/* Botón Minimalista para Ampliar la Gráfica */}
          <button
            onClick={() => setIsExpanded(true)}
            style={{
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              color: '#334155',
              padding: '0.18rem 0.5rem',
              borderRadius: '6px',
              fontSize: '0.66rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title="Ampliar Gráfica a Pantalla Completa"
          >
            <Maximize2 size={11} />
            <span>Ampliar</span>
          </button>
        </div>
      </div>

      {/* ── Contenedor Principal: SVG a la izquierda (flex: 1), Indicadores interactivos en columna a la derecha ── */}
      <div style={{ display: 'flex', gap: '0.6rem', flex: '1 1 0', minHeight: 0, width: '100%', height: '100%', overflow: 'hidden' }}>
        
        {/* SVG Canvas a la Izquierda (Aprovecha 100% de la altura útil) */}
        <div ref={wrapperRef} style={{ position: 'relative', flex: '1 1 0', height: '100%', minHeight: 0, background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '0.2rem', overflow: 'hidden' }}>
          <svg viewBox={`0 0 ${canvasSize.width} ${canvasSize.height}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            <defs>
              <linearGradient id="scoreGradientIndigo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Sombreado de área bajo la curva del Score Ponderado (Si está activo) */}
            {visibles.score && <path d={areaScore} fill="url(#scoreGradientIndigo)" />}

            {/* Eje Y Grilla y Ticks (0%, 20%, 40%, 60%, 80%, 100%) */}
            {[0, 20, 40, 60, 80, 100].map((val) => {
              const y = getY(val);
              const isTarget = val === 80;
              return (
                <g key={val}>
                  <line
                    x1={marginLeft} y1={y} x2={canvasSize.width - marginRight} y2={y}
                    stroke={isTarget ? '#ff3b30' : '#f1f5f9'}
                    strokeWidth={isTarget ? '1.5' : '1'}
                    strokeDasharray={isTarget ? '4 4' : 'none'}
                  />
                  <text x={marginLeft - 6} y={y + 3} fontSize="9" fill={isTarget ? '#ff3b30' : '#8e8e93'} fontWeight={isTarget ? '800' : '600'} textAnchor="end" fontFamily="Inter, sans-serif">
                    {val}%
                  </text>
                </g>
              );
            })}

            {/* Etiqueta de Umbral 80% */}
            <text x={canvasSize.width - marginRight + 5} y={meta80Y + 3} fontSize="8.5" fill="#ff3b30" fontWeight="bold" fontFamily="Inter, sans-serif">
              Meta 80%
            </text>

            {/* 1. Línea KPI 1 - Transferencia % (Azul #007aff) */}
            {visibles.kpi1 && (
              <polyline fill="none" stroke="#007aff" strokeWidth="2.2" strokeDasharray="3 3" points={pointsKPI1} opacity="0.85" />
            )}

            {/* 2. Línea KPI 2 - tNPS % (Verde #34c759) */}
            {visibles.kpi2 && (
              <polyline fill="none" stroke="#34c759" strokeWidth="2.2" strokeDasharray="3 3" points={pointsKPI2} opacity="0.85" />
            )}

            {/* 3. Línea KPI 3 - Calidad % (Naranja #ff9500) */}
            {visibles.kpi3 && (
              <polyline fill="none" stroke="#ff9500" strokeWidth="2.2" strokeDasharray="3 3" points={pointsKPI3} opacity="0.85" />
            )}

            {/* 4. LÍNEA PRINCIPAL: SCORE PONDERADO ÍNDIGO (#6366f1) */}
            {visibles.score && (
              <polyline fill="none" stroke="#6366f1" strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round" points={pointsScore} />
            )}

            {/* Puntos y etiquetas de Semanas */}
            {list.map((s, i) => {
              const x = getX(i);
              const y = getY(s.score_ponderado);
              const showLabel = shouldShowLabel(i);
              const isLast = i === n - 1;
              const rDot = n > 15 ? 3.5 : 4.5;

              return (
                <g key={i}>
                  {visibles.score && (
                    <circle cx={x} cy={y} r={isLast ? rDot + 1.5 : rDot} fill="#6366f1" stroke="#ffffff" strokeWidth="1.8">
                      <title>{`${s.semana}\n• Score Ponderado: ${s.score_ponderado}%\n• KPI 1 (Transferencia): ${s.kpi1}%\n• KPI 2 (tNPS): ${s.kpi2}%\n• KPI 3 (Calidad): ${s.kpi3}%`}</title>
                    </circle>
                  )}
                  
                  {showLabel && (
                    <text x={x} y={canvasSize.height - 4} fontSize="8.5" fill="#48484a" textAnchor="middle" fontWeight="700" fontFamily="Inter, sans-serif">
                      {formatSemanaLabel(s.semana)}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Badge Score Ponderado Final en color ÍNDIGO (#6366f1) */}
            {visibles.score && (() => {
              const xEnd = getX(n - 1);
              const yScore = getY(ultimoPunto.score_ponderado);

              return (
                <g transform={`translate(${Math.min(xEnd + 6, canvasSize.width - 50)}, ${yScore - 9})`}>
                  <rect x="0" y="0" width="44" height="17" rx="8.5" fill="#6366f1" />
                  <text x="22" y="11.5" fontSize="8.5" fill="#ffffff" fontWeight="800" textAnchor="middle" fontFamily="Outfit, sans-serif">
                    {ultimoPunto.score_ponderado}%
                  </text>
                </g>
              );
            })()}
          </svg>
        </div>

        {/* ── Columna Derecha Compacta de Indicadores Interactivos (Ajustada sin cortes) ── */}
        <div style={{
          width: '150px',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '0.2rem',
          height: '100%',
          minHeight: 0,
          overflowY: 'auto'
        }}>
          {/* Score Ponderado - Color ÍNDIGO (#6366f1) */}
          <div
            onClick={() => toggleVisibilidad('score')}
            style={{
              background: visibles.score ? 'rgba(99, 102, 241, 0.08)' : '#f8fafc',
              border: `1.5px solid ${visibles.score ? '#6366f1' : '#e2e8f0'}`,
              borderRadius: '6px',
              padding: '0.2rem 0.45rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              cursor: 'pointer',
              opacity: visibles.score ? 1 : 0.45,
              filter: visibles.score ? 'none' : 'grayscale(0.6)',
              transition: 'all 0.15s ease',
              boxShadow: visibles.score ? '0 1px 4px rgba(99, 102, 241, 0.12)' : 'none'
            }}
            title="Haz clic para mostrar u ocultar la línea del Score Ponderado"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#4f46e5', fontWeight: 800, fontSize: '0.64rem', textDecoration: visibles.score ? 'none' : 'line-through' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6366f1', display: 'inline-block' }} />
                Score Ponderado
              </div>
              {visibles.score ? <Eye size={10} color="#4f46e5" /> : <EyeOff size={10} color="#94a3b8" />}
            </div>
            <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#4f46e5', marginTop: '0.02rem', lineHeight: 1.05 }}>
              {ultimoPunto.score_ponderado}%
            </div>
            <div style={{ fontSize: '0.56rem', color: '#6366f1', marginTop: '0.02rem', fontWeight: 600 }}>20% K1 + 40% K2 + 40% K3</div>
          </div>

          {/* KPI 1 - Transferencia (Azul #007aff) */}
          <div
            onClick={() => toggleVisibilidad('kpi1')}
            style={{
              background: visibles.kpi1 ? 'rgba(0, 122, 255, 0.08)' : '#f8fafc',
              border: `1.5px solid ${visibles.kpi1 ? '#007aff' : '#e2e8f0'}`,
              borderRadius: '6px',
              padding: '0.2rem 0.45rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              cursor: 'pointer',
              opacity: visibles.kpi1 ? 1 : 0.45,
              filter: visibles.kpi1 ? 'none' : 'grayscale(0.6)',
              transition: 'all 0.15s ease',
              boxShadow: visibles.kpi1 ? '0 1px 4px rgba(0, 122, 255, 0.12)' : 'none'
            }}
            title="Haz clic para mostrar u ocultar la línea de KPI 1 (Transferencia)"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#007aff', fontWeight: 800, fontSize: '0.64rem', textDecoration: visibles.kpi1 ? 'none' : 'line-through' }}>
                <span style={{ width: '6px', height: '3px', background: '#007aff', display: 'inline-block' }} />
                KPI 1 - Transf.
              </div>
              {visibles.kpi1 ? <Eye size={10} color="#007aff" /> : <EyeOff size={10} color="#94a3b8" />}
            </div>
            <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#007aff', marginTop: '0.02rem', lineHeight: 1.05 }}>
              {ultimoPunto.kpi1}%
            </div>
            <div style={{ fontSize: '0.56rem', color: '#8e8e93', marginTop: '0.02rem' }}>Peso: 20%</div>
          </div>

          {/* KPI 2 - tNPS (Verde #34c759) */}
          <div
            onClick={() => toggleVisibilidad('kpi2')}
            style={{
              background: visibles.kpi2 ? 'rgba(52, 199, 89, 0.08)' : '#f8fafc',
              border: `1.5px solid ${visibles.kpi2 ? '#34c759' : '#e2e8f0'}`,
              borderRadius: '6px',
              padding: '0.2rem 0.45rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              cursor: 'pointer',
              opacity: visibles.kpi2 ? 1 : 0.45,
              filter: visibles.kpi2 ? 'none' : 'grayscale(0.6)',
              transition: 'all 0.15s ease',
              boxShadow: visibles.kpi2 ? '0 1px 4px rgba(52, 199, 89, 0.12)' : 'none'
            }}
            title="Haz clic para mostrar u ocultar la línea de KPI 2 (tNPS)"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#248a3d', fontWeight: 800, fontSize: '0.64rem', textDecoration: visibles.kpi2 ? 'none' : 'line-through' }}>
                <span style={{ width: '6px', height: '3px', background: '#34c759', display: 'inline-block' }} />
                KPI 2 - tNPS
              </div>
              {visibles.kpi2 ? <Eye size={10} color="#248a3d" /> : <EyeOff size={10} color="#94a3b8" />}
            </div>
            <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#248a3d', marginTop: '0.02rem', lineHeight: 1.05 }}>
              {ultimoPunto.kpi2}%
            </div>
            <div style={{ fontSize: '0.56rem', color: '#8e8e93', marginTop: '0.02rem' }}>Peso: 40%</div>
          </div>

          {/* KPI 3 - Calidad (Naranja #ff9500) */}
          <div
            onClick={() => toggleVisibilidad('kpi3')}
            style={{
              background: visibles.kpi3 ? 'rgba(255, 149, 0, 0.08)' : '#f8fafc',
              border: `1.5px solid ${visibles.kpi3 ? '#ff9500' : '#e2e8f0'}`,
              borderRadius: '6px',
              padding: '0.2rem 0.45rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              cursor: 'pointer',
              opacity: visibles.kpi3 ? 1 : 0.45,
              filter: visibles.kpi3 ? 'none' : 'grayscale(0.6)',
              transition: 'all 0.15s ease',
              boxShadow: visibles.kpi3 ? '0 1px 4px rgba(255, 149, 0, 0.12)' : 'none'
            }}
            title="Haz clic para mostrar u ocultar la línea de KPI 3 (Calidad Emitida)"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#c67300', fontWeight: 800, fontSize: '0.64rem', textDecoration: visibles.kpi3 ? 'none' : 'line-through' }}>
                <span style={{ width: '6px', height: '3px', background: '#ff9500', display: 'inline-block' }} />
                KPI 3 - Calidad
              </div>
              {visibles.kpi3 ? <Eye size={10} color="#c67300" /> : <EyeOff size={10} color="#94a3b8" />}
            </div>
            <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#c67300', marginTop: '0.02rem', lineHeight: 1.05 }}>
              {ultimoPunto.kpi3}%
            </div>
            <div style={{ fontSize: '0.56rem', color: '#8e8e93', marginTop: '0.02rem' }}>Peso: 40%</div>
          </div>
        </div>
      </div>

      {/* ── MODAL PANTALLA COMPLETA PARA AMPLIAR LA GRÁFICA CON CONTROLES INTERACTIVOS ── */}
      {isExpanded && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem'
        }}>
          <div style={{
            width: '92vw',
            height: '86vh',
            background: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            padding: '1.25rem 1.5rem',
            overflow: 'hidden'
          }}>
            {/* Header del Modal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={18} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f1c2e', margin: 0, fontFamily: 'Outfit, sans-serif' }}>
                    Curva de Aprendizaje por Semana (Vista Ampliada)
                  </h2>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
                    Evolución detallada de Transferencia (20%), tNPS (40%) y Calidad (40%) a lo largo de {n} semanas
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#4f46e5', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '0.35rem 0.75rem', borderRadius: '9999px' }}>
                  Score Actual: {ultimoPunto.score_ponderado}%
                </span>
                <button
                  onClick={() => setIsExpanded(false)}
                  style={{
                    background: '#f1f5f9',
                    border: 'none',
                    borderRadius: '50%',
                    width: '34px',
                    height: '34px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#64748b',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Contenido Ampliado */}
            <div style={{ flex: '1 1 0', minHeight: 0, display: 'flex', gap: '1.5rem', overflow: 'hidden' }}>
              {/* Gráfico SVG de Alta Resolución */}
              <div style={{ flex: '1 1 0', height: '100%', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1rem', overflow: 'hidden' }}>
                <svg viewBox="0 0 850 420" style={{ width: '100%', height: '100%' }}>
                  <defs>
                    <linearGradient id="scoreGradientModalIndigo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Sombreado bajo la curva */}
                  {visibles.score && (
                    <path
                      d={`M 60 360 L ${list.map((s, i) => `${60 + (i / (n - 1 || 1)) * 730} ${360 - (s.score_ponderado / 100) * 310}`).join(' L ')} L ${790} 360 Z`}
                      fill="url(#scoreGradientModalIndigo)"
                    />
                  )}

                  {/* Grilla Eje Y */}
                  {[0, 20, 40, 60, 80, 100].map((val) => {
                    const y = 360 - (val / 100) * 310;
                    const isTarget = val === 80;
                    return (
                      <g key={val}>
                        <line x1="60" y1={y} x2="790" y2={y} stroke={isTarget ? '#ff3b30' : '#e2e8f0'} strokeWidth={isTarget ? '1.5' : '1'} strokeDasharray={isTarget ? '4 4' : 'none'} />
                        <text x="52" y={y + 4} fontSize="11" fill={isTarget ? '#ff3b30' : '#64748b'} fontWeight={isTarget ? '800' : '600'} textAnchor="end">{val}%</text>
                      </g>
                    );
                  })}

                  <text x="795" y={360 - (80 / 100) * 310 + 4} fontSize="11" fill="#ff3b30" fontWeight="bold">Meta 80%</text>

                  {/* Polylines KPIs */}
                  {visibles.kpi1 && <polyline fill="none" stroke="#007aff" strokeWidth="2.5" strokeDasharray="4 4" points={list.map((s, i) => `${60 + (i / (n - 1 || 1)) * 730},${360 - (s.kpi1 / 100) * 310}`).join(' ')} opacity="0.85" />}
                  {visibles.kpi2 && <polyline fill="none" stroke="#34c759" strokeWidth="2.5" strokeDasharray="4 4" points={list.map((s, i) => `${60 + (i / (n - 1 || 1)) * 730},${360 - (s.kpi2 / 100) * 310}`).join(' ')} opacity="0.85" />}
                  {visibles.kpi3 && <polyline fill="none" stroke="#ff9500" strokeWidth="2.5" strokeDasharray="4 4" points={list.map((s, i) => `${60 + (i / (n - 1 || 1)) * 730},${360 - (s.kpi3 / 100) * 310}`).join(' ')} opacity="0.85" />}

                  {/* LÍNEA PRINCIPAL SCORE PONDERADO ÍNDIGO */}
                  {visibles.score && <polyline fill="none" stroke="#6366f1" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" points={list.map((s, i) => `${60 + (i / (n - 1 || 1)) * 730},${360 - (s.score_ponderado / 100) * 310}`).join(' ')} />}

                  {/* Puntos y Etiquetas */}
                  {list.map((s, i) => {
                    const x = 60 + (i / (n - 1 || 1)) * 730;
                    const y = 360 - (s.score_ponderado / 100) * 310;
                    return (
                      <g key={i}>
                        {visibles.score && (
                          <circle cx={x} cy={y} r="6" fill="#6366f1" stroke="#ffffff" strokeWidth="2">
                            <title>{`${s.semana}\n• Score Ponderado: ${s.score_ponderado}%\n• KPI 1 (Transf.): ${s.kpi1}%\n• KPI 2 (tNPS): ${s.kpi2}%\n• KPI 3 (Calidad): ${s.kpi3}%`}</title>
                          </circle>
                        )}
                        <text x={x} y="380" fontSize="10" fill="#475569" textAnchor="middle" fontWeight="700">
                          {formatSemanaLabel(s.semana)}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Panel Lateral del Modal con Desglose Interactivo */}
              <div style={{ width: '230px', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f1c2e', margin: '0 0 0.5rem 0' }}>Controles de Visibilidad</h4>
                  <p style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '0.75rem' }}>Haz clic en cualquier serie para aislarla en el gráfico:</p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button
                      onClick={() => toggleVisibilidad('score')}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0.4rem 0.6rem', borderRadius: '8px', border: '1px solid #c7d2fe',
                        background: visibles.score ? '#e0e7ff' : '#ffffff', color: '#4338ca',
                        fontWeight: 700, fontSize: '0.76rem', cursor: 'pointer'
                      }}
                    >
                      <span>⚫ Score Ponderado</span>
                      {visibles.score ? <Eye size={14} /> : <EyeOff size={14} color="#94a3b8" />}
                    </button>

                    <button
                      onClick={() => toggleVisibilidad('kpi1')}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0.4rem 0.6rem', borderRadius: '8px', border: '1px solid #bfdbfe',
                        background: visibles.kpi1 ? '#dbeafe' : '#ffffff', color: '#1e40af',
                        fontWeight: 700, fontSize: '0.76rem', cursor: 'pointer'
                      }}
                    >
                      <span>🔵 KPI 1 Transf. (20%)</span>
                      {visibles.kpi1 ? <Eye size={14} /> : <EyeOff size={14} color="#94a3b8" />}
                    </button>

                    <button
                      onClick={() => toggleVisibilidad('kpi2')}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0.4rem 0.6rem', borderRadius: '8px', border: '1px solid #bbf7d0',
                        background: visibles.kpi2 ? '#dcfce7' : '#ffffff', color: '#15803d',
                        fontWeight: 700, fontSize: '0.76rem', cursor: 'pointer'
                      }}
                    >
                      <span>🟢 KPI 2 tNPS (40%)</span>
                      {visibles.kpi2 ? <Eye size={14} /> : <EyeOff size={14} color="#94a3b8" />}
                    </button>

                    <button
                      onClick={() => toggleVisibilidad('kpi3')}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0.4rem 0.6rem', borderRadius: '8px', border: '1px solid #fde68a',
                        background: visibles.kpi3 ? '#fef3c7' : '#ffffff', color: '#b45309',
                        fontWeight: 700, fontSize: '0.76rem', cursor: 'pointer'
                      }}
                    >
                      <span>🟠 KPI 3 Calidad (40%)</span>
                      {visibles.kpi3 ? <Eye size={14} /> : <EyeOff size={14} color="#94a3b8" />}
                    </button>
                  </div>
                </div>

                <div style={{ background: '#e0e7ff', padding: '1rem', borderRadius: '12px', border: '1px solid #c7d2fe', marginTop: 'auto' }}>
                  <span style={{ fontSize: '0.72rem', color: '#4338ca', fontWeight: 700, display: 'block' }}>Resultado Última Semana</span>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#4338ca', fontFamily: 'Outfit, sans-serif' }}>
                    {ultimoPunto.score_ponderado}%
                  </div>
                  <p style={{ fontSize: '0.72rem', color: '#3730a3', margin: '0.2rem 0 0 0' }}>
                    {estaCercaMeta ? '🟢 En rango de cumplimiento de meta' : '🟠 Requiere monitoreo continuo'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
