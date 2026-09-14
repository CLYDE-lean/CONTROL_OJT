import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import { TrendingUp, TrendingDown, Users, UserCheck, UserX, Maximize2, X, RefreshCw, BarChart2 } from 'lucide-react';

/**
 * TendenciaHistoricaView
 * Vista de tendencia histórica REAL de retención OJT (SEM14 → SEM31)
 * Datos consultados directamente de Supabase — sin pasar por el backend.
 */
export default function TendenciaHistoricaView({ filtros = {} }) {
  const [semanas, setSemanas]       = useState([]);
  const [campanas, setCampanas]     = useState([]);
  const [filtroCampana, setFiltroCampana] = useState('TODAS');
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [tooltip, setTooltip]       = useState(null);
  const wrapperRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 560, height: 240 });

  // ResizeObserver para SVG responsivo
  useEffect(() => {
    if (!wrapperRef.current) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) setCanvasSize({ width, height });
      }
    });
    ro.observe(wrapperRef.current);
    return () => ro.disconnect();
  }, []);

  // Carga de datos desde Supabase via RPC (agregación server-side con todos los filtros)
  async function cargarDatos() {
    setLoading(true);
    setError(null);
    try {
      // Construir parámetros del RPC
      const rpcParams = {};
      
      // Formador
      if (filtros.formador && filtros.formador.trim() !== '') {
        rpcParams.p_formador = filtros.formador.trim();
      }
      // Semana
      if (filtros.semana && filtros.semana.trim() !== '') {
        rpcParams.p_semana = filtros.semana.trim();
      }
      // Campaña (prioridad botón local si es distinta a 'TODAS', sino filtro global)
      const campanaEfectiva = filtroCampana !== 'TODAS' ? filtroCampana : (filtros.campana || null);
      if (campanaEfectiva && campanaEfectiva.trim() !== '') {
        rpcParams.p_campana = campanaEfectiva.trim();
      }
      // Modalidad
      if (filtros.modalidad && filtros.modalidad.trim() !== '') {
        rpcParams.p_modalidad = filtros.modalidad.trim();
      }
      // Segmento
      if (filtros.segmento && filtros.segmento.trim() !== '') {
        rpcParams.p_segmento = filtros.segmento.trim();
      }
      // Periodo
      if (filtros.periodo && filtros.periodo.trim() !== '') {
        rpcParams.p_periodo = filtros.periodo.trim();
      }
      // Grupo
      if (filtros.grupo && filtros.grupo.trim() !== '') {
        rpcParams.p_grupo = filtros.grupo.trim();
      }

      console.log('📊 Tendencia Histórica RPC params:', rpcParams);

      const { data: rpcData, error: rpcErr } = await supabase
        .rpc('get_retencion_historica', rpcParams);

      if (rpcErr) {
        console.error('❌ RPC error:', rpcErr);
        throw new Error(`RPC get_retencion_historica: ${rpcErr.message}`);
      }

      if (!rpcData || rpcData.length === 0) {
        console.warn('⚠️ RPC devolvió 0 semanas para:', rpcParams);
        setSemanas([]);
        return;
      }

      console.log(`✅ RPC: ${rpcData.length} semanas cargadas para filtros:`, rpcParams);

      const resultado = rpcData.map(r => ({
        semana:        r.semana,
        ingresaron:    Number(r.ingresaron),
        activos:       Number(r.activos),
        cesados:       Number(r.cesados),
        retencion_pct: parseFloat(r.retencion_pct) || 0,
      }));

      setSemanas(resultado);

      // Cargar lista de campañas para los botones si aún no se cargaron
      if (campanas.length === 0) {
        const { data: campData } = await supabase
          .from('dim_campanas')
          .select('campana')
          .limit(50);
        if (campData && campData.length > 0) {
          const campSet = [...new Set(campData.map(r => r['campana']).filter(Boolean))].sort();
          setCampanas(campSet);
        }
      }

    } catch (err) {
      console.error('Error cargarDatos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Re-cargar cuando cambien los filtros globales o el selector local de campaña
  useEffect(() => {
    cargarDatos();
  }, [
    filtros.formador,
    filtros.semana,
    filtros.campana,
    filtros.modalidad,
    filtros.segmento,
    filtros.periodo,
    filtros.grupo,
    filtroCampana,
  ]);



  const maxIngresaron = Math.max(...semanas.map(s => s.ingresaron), 1);

  const PAD = { top: 28, right: 18, bottom: 42, left: 42 };
  const COLOR_ACTIVO = '#10b981';
  const COLOR_CESADO = '#f43f5e';
  const COLOR_LINEA  = '#6366f1';

  const totalIngresaron = semanas.reduce((s, r) => s + r.ingresaron, 0);
  const totalActivos    = semanas.reduce((s, r) => s + r.activos,    0);
  const totalCesados    = semanas.reduce((s, r) => s + r.cesados,    0);
  const avgRetencion    = totalIngresaron > 0
    ? Math.round((totalActivos / totalIngresaron) * 1000) / 10 : 0;
  const ultimaRetencion  = semanas[semanas.length - 1]?.retencion_pct ?? 0;
  const primeraRetencion = semanas[0]?.retencion_pct ?? 0;
  const tendenciaPositiva = ultimaRetencion >= primeraRetencion;

  const yTicks = [0, 25, 50, 75, 100];

  function GraficoSVG({ width, height }) {
    const cW = width  - PAD.left - PAD.right;
    const cH = height - PAD.top  - PAD.bottom;
    const stepX = semanas.length > 0 ? cW / semanas.length : cW;
    // Ancho de barra adaptable: si hay pocas semanas (ej. 1 filtrada), no se desborda
    const barW  = Math.min(52, Math.max(10, Math.floor(stepX * 0.72)));
    const xC = (i) => PAD.left + i * stepX + stepX / 2;
    const yV = (v) => PAD.top + cH - (v / maxIngresaron) * cH;
    const yP = (v) => PAD.top + cH - (v / 100) * cH;
    const lLine = semanas.map((s, i) => `${xC(i)},${yP(s.retencion_pct)}`).join(' ');

    return (
      <svg width={width} height={height} style={{ display: 'block', userSelect: 'none' }}>
        <defs>
          <linearGradient id="thGradA" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={COLOR_ACTIVO} stopOpacity="0.9" />
            <stop offset="100%" stopColor={COLOR_ACTIVO} stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id="thGradC" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={COLOR_CESADO} stopOpacity="0.75" />
            <stop offset="100%" stopColor={COLOR_CESADO} stopOpacity="0.40" />
          </linearGradient>
          <linearGradient id="thGradL" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={COLOR_LINEA} stopOpacity="0.18" />
            <stop offset="100%" stopColor={COLOR_LINEA} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid */}
        {yTicks.map(t => (
          <g key={t}>
            <line
              x1={PAD.left} y1={yP(t)} x2={PAD.left + cW} y2={yP(t)}
              stroke={t === 0 ? '#94a3b8' : '#e2e8f0'}
              strokeWidth={t === 0 ? 1.5 : 0.8}
              strokeDasharray={t === 0 ? '' : '3 3'}
            />
            <text x={PAD.left - 5} y={yP(t) + 4} textAnchor="end" fontSize="9" fill="#94a3b8">{t}%</text>
          </g>
        ))}

        {/* Barras apiladas */}
        {semanas.map((s, i) => {
          const cx = xC(i);
          const x0 = cx - barW / 2;
          const hCes = (s.cesados / maxIngresaron) * cH;
          const hAct = (s.activos / maxIngresaron) * cH;
          const yCes = PAD.top + cH - hCes;
          const yAct = yCes - hAct;

          return (
            <g
              key={s.semana}
              style={{ cursor: 'pointer' }}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setTooltip({ x: rect.left, y: rect.top, s });
              }}
              onMouseLeave={() => setTooltip(null)}
            >
              {/* Cesados (rojo) */}
              {hCes > 0 && (
                <rect
                  x={x0} y={yCes} width={barW} height={hCes}
                  fill="url(#thGradC)" rx="2"
                />
              )}
              {/* Activos (verde) */}
              {hAct > 0 && (
                <rect
                  x={x0} y={yAct} width={barW} height={hAct}
                  fill="url(#thGradA)" rx="3"
                />
              )}
              {/* Total arriba */}
              <text x={cx} y={yAct - 4} textAnchor="middle" fontSize="8.5" fill="#64748b" fontWeight="600">
                {s.ingresaron}
              </text>
              {/* Etiqueta X */}
              <text
                x={cx} y={PAD.top + cH + 14}
                textAnchor="middle" fontSize={semanas.length > 12 ? '7.5' : '8.5'} fill="#64748b" fontWeight="600"
                transform={semanas.length > 12 ? `rotate(-45, ${cx}, ${PAD.top + cH + 14})` : ''}
              >
                {s.semana}
              </text>
            </g>
          );
        })}

        {/* Área bajo la línea de retención */}
        {semanas.length > 1 && (
          <polygon
            points={`${xC(0)},${PAD.top + cH} ${lLine} ${xC(semanas.length - 1)},${PAD.top + cH}`}
            fill="url(#thGradL)"
          />
        )}

        {/* Línea de retención */}
        {semanas.length > 1 && (
          <polyline points={lLine} fill="none" stroke={COLOR_LINEA} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        )}

        {/* Puntos */}
        {semanas.map((s, i) => (
          <circle key={`d-${s.semana}`} cx={xC(i)} cy={yP(s.retencion_pct)} r="3.5" fill="#fff" stroke={COLOR_LINEA} strokeWidth="2" />
        ))}

        <text x={12} y={PAD.top + cH / 2} textAnchor="middle" fontSize="9" fill="#94a3b8"
          transform={`rotate(-90, 12, ${PAD.top + cH / 2})`}>
          Retención %
        </text>
      </svg>
    );
  }

  // Detectar si hay filtros globales activos para mostrar badge informativo
  const filtrosActivos = Object.entries(filtros).filter(([_, v]) => Boolean(v && String(v).trim() !== ''));

  return (
    <>
      <div style={{
        background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column',
        height: '100%', minHeight: 0, overflow: 'hidden', padding: '1rem 1.1rem 0.75rem',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <BarChart2 size={16} color="#6366f1" />
            <span style={{ fontSize: '0.83rem', fontWeight: 700, color: '#1e293b' }}>
              Tendencia Histórica de Retención OJT
            </span>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>· datos reales Supabase</span>
            {filtrosActivos.length > 0 && (
              <span style={{
                background: 'rgba(99,102,241,0.1)', color: '#4f46e5',
                border: '1px solid rgba(99,102,241,0.25)', borderRadius: '12px',
                padding: '1px 7px', fontSize: '0.68rem', fontWeight: 700
              }}>
                🎯 {filtrosActivos.length} filtro(s) activo(s)
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button onClick={cargarDatos} disabled={loading} title="Actualizar" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', lineHeight: 0, padding: '2px' }}>
              <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            </button>
            <button onClick={() => setIsExpanded(true)} title="Pantalla completa" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', lineHeight: 0, padding: '2px' }}>
              <Maximize2 size={13} />
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '0.6rem', flexShrink: 0 }}>
          {[
            { label: 'Semanas',      value: semanas.length,              icon: <BarChart2 size={13} />, color: '#6366f1' },
            { label: 'Ingresaron',   value: totalIngresaron.toLocaleString(), icon: <Users size={13} />,     color: '#3b82f6' },
            { label: 'Activos',      value: totalActivos.toLocaleString(),    icon: <UserCheck size={13} />, color: '#10b981' },
            { label: 'Retención Prom.', value: `${avgRetencion}%`,
              icon: tendenciaPositiva ? <TrendingUp size={13} /> : <TrendingDown size={13} />,
              color: tendenciaPositiva ? '#10b981' : '#f43f5e'
            },
          ].map(k => (
            <div key={k.label} style={{ background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '0.45rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ color: k.color }}>{k.icon}</span>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{k.label}</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b' }}>{loading ? '…' : k.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filtro campaña */}
        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '0.4rem', flexShrink: 0 }}>
          {['TODAS', ...campanas].map(c => (
            <button key={c} onClick={() => setFiltroCampana(c)} style={{
              padding: '2px 10px', fontSize: '0.72rem',
              fontWeight: filtroCampana === c ? 700 : 500,
              background: filtroCampana === c ? '#6366f1' : '#f1f5f9',
              color: filtroCampana === c ? '#fff' : '#64748b',
              border: `1px solid ${filtroCampana === c ? '#6366f1' : '#e2e8f0'}`,
              borderRadius: '20px', cursor: 'pointer', transition: 'all 0.15s'
            }}>
              {c === 'TODAS' ? '📊 Todas' : c}
            </button>
          ))}
        </div>

        {/* Leyenda */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.4rem', flexShrink: 0 }}>
          {[
            { color: COLOR_ACTIVO, label: 'Activos finales', isLine: false },
            { color: COLOR_CESADO, label: 'Cesados',         isLine: false },
            { color: COLOR_LINEA,  label: 'Retención %',     isLine: true  },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <div style={{ width: l.isLine ? 18 : 12, height: l.isLine ? 3 : 10, background: l.color, borderRadius: '3px', opacity: 0.9 }} />
              <span style={{ fontSize: '0.71rem', color: '#64748b' }}>{l.label}</span>
            </div>
          ))}
        </div>

        {/* Gráfico */}
        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>⏳ Cargando datos de Supabase...</span>
          </div>
        ) : error ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: '#f43f5e' }}>❌ {error}</span>
          </div>
        ) : semanas.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#64748b' }}>Sin datos históricos para los filtros seleccionados</span>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Prueba limpiando los filtros del botón flotante o cambiando de campaña</span>
          </div>
        ) : (
          <div ref={wrapperRef} style={{ flex: 1, minHeight: 0, width: '100%' }}>
            <GraficoSVG width={canvasSize.width} height={canvasSize.height} />
          </div>
        )}

        {/* Tabla resumen */}
        {!loading && semanas.length > 0 && (
          <div style={{ flexShrink: 0, marginTop: '0.5rem', overflowX: 'auto', maxHeight: '110px', overflowY: 'auto' }}>
            <table style={{ width: '100%', fontSize: '0.74rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#94a3b8', fontSize: '0.68rem' }}>
                  <th style={{ textAlign: 'left',   padding: '3px 6px', fontWeight: 700 }}>Semana</th>
                  <th style={{ textAlign: 'right',  padding: '3px 6px' }}>Ingresaron</th>
                  <th style={{ textAlign: 'right',  padding: '3px 6px', color: COLOR_ACTIVO }}>Activos</th>
                  <th style={{ textAlign: 'right',  padding: '3px 6px', color: COLOR_CESADO }}>Cesados</th>
                  <th style={{ textAlign: 'right',  padding: '3px 6px', color: COLOR_LINEA  }}>Retención</th>
                </tr>
              </thead>
              <tbody>
                {[...semanas].reverse().map(s => (
                  <tr key={s.semana} style={{ borderBottom: '1px solid #f1f5f9' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  >
                    <td style={{ padding: '3px 6px', fontWeight: 700, color: '#374151' }}>{s.semana}</td>
                    <td style={{ padding: '3px 6px', textAlign: 'right', color: '#374151' }}>{s.ingresaron}</td>
                    <td style={{ padding: '3px 6px', textAlign: 'right', color: COLOR_ACTIVO, fontWeight: 600 }}>{s.activos}</td>
                    <td style={{ padding: '3px 6px', textAlign: 'right', color: COLOR_CESADO, fontWeight: 600 }}>{s.cesados}</td>
                    <td style={{ padding: '3px 6px', textAlign: 'right' }}>
                      <span style={{
                        background: s.retencion_pct >= 40 ? '#f0fdf4' : s.retencion_pct >= 25 ? '#fffbeb' : '#fff1f2',
                        color:      s.retencion_pct >= 40 ? '#16a34a' : s.retencion_pct >= 25 ? '#d97706' : '#dc2626',
                        padding: '1px 6px', borderRadius: '20px', fontWeight: 700, fontSize: '0.72rem'
                      }}>
                        {s.retencion_pct}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tooltip flotante */}
      {tooltip && (
        <div style={{
          position: 'fixed', left: tooltip.x + 14, top: tooltip.y - 65,
          background: '#1e293b', color: '#fff', borderRadius: '8px',
          padding: '0.5rem 0.8rem', fontSize: '0.78rem',
          pointerEvents: 'none', zIndex: 9999, boxShadow: '0 4px 16px rgba(0,0,0,0.25)', minWidth: '140px'
        }}>
          <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>{tooltip.s.semana}</div>
          <div style={{ color: '#10b981' }}>✓ Activos: {tooltip.s.activos}</div>
          <div style={{ color: '#f43f5e' }}>✗ Cesados: {tooltip.s.cesados}</div>
          <div style={{ color: '#a5b4fc', fontWeight: 700 }}>Retención: {tooltip.s.retencion_pct}%</div>
          <div style={{ color: '#94a3b8' }}>Total: {tooltip.s.ingresaron}</div>
        </div>
      )}

      {/* Modal pantalla completa */}
      {isExpanded && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,28,46,0.72)',
          zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'
        }} onClick={() => setIsExpanded(false)}>
          <div style={{
            background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '1020px',
            height: '82vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
            boxShadow: '0 24px 80px rgba(0,0,0,0.35)', padding: '1.5rem'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>
                📈 Tendencia Histórica — {filtroCampana}
              </span>
              <button onClick={() => setIsExpanded(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>
              <GraficoSVG width={960} height={500} />
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
