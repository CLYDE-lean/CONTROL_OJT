import React, { useMemo, useState } from 'react';
import { BarChart2, Info, AlertTriangle, TrendingUp, Users, CheckCircle, ChevronDown, ChevronUp, Search } from 'lucide-react';

/**
 * Componente DistribucionAtencionesView
 * Ofrece por defecto una Vista Operativa (Ranking Horizontal por Banda de Desempeño)
 * pensada para supervisores y operaciones, y una pestaña de Vista Estadística (Box Plot)
 * para análisis más técnico de BI.
 */
export default function DistribucionAtencionesView({ data }) {
  const [vistaTab, setVistaTab] = useState('operativa'); // 'operativa' | 'estadistica'
  const [filtroBanda, setFiltroBanda] = useState('todas'); // 'todas' | 'baja' | 'alta'
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [asesorHover, setAsesorHover] = useState(null);

  const rawAsesores = data?.matriz?.asesores || [];

  // 1. Extraer y calcular estadísticas reales y bandas de desempeño
  const stats = useMemo(() => {
    const list = (rawAsesores.length > 0 ? rawAsesores : [
      { asesor: 'JUAN PEREZ', documento: '10252616', promedio_llamadas: 12 },
      { asesor: 'JEISSON SANCHEZ', documento: '76487711', promedio_llamadas: 42 },
      { asesor: 'MARIA LOPEZ', documento: '61200222', promedio_llamadas: 18 },
      { asesor: 'YARLY DIAZ', documento: '74408974', promedio_llamadas: 35 },
      { asesor: 'CARLOS RUIZ', documento: '45892011', promedio_llamadas: 5 },
      { asesor: 'ANA TORRES', documento: '12345678', promedio_llamadas: 28 },
      { asesor: 'PEDRO GOMEZ', documento: '87654321', promedio_llamadas: 22 },
      { asesor: 'SOFIA RAMOS', documento: '11223344', promedio_llamadas: 58 },
      { asesor: 'LUIS MENDOZA', documento: '55667788', promedio_llamadas: 15 },
      { asesor: 'ELENA SILVA', documento: '99887766', promedio_llamadas: 31 },
      { asesor: 'DIEGO ROJAS', documento: '33445566', promedio_llamadas: 26 },
      { asesor: 'PATRICIA VERA', documento: '77889900', promedio_llamadas: 24 }
    ]).map(a => ({
      nombre: a.asesor || a.nombre || 'ASESOR',
      dni: a.documento || a.dni || 'S/D',
      llamadas: parseFloat(a.promedio_llamadas ?? a.q_atendidas ?? a.llamadas_q ?? a.prom_llamadas ?? a.llamadas) || 10
    })).sort((a, b) => a.llamadas - b.llamadas);

    const values = list.map(a => a.llamadas);
    const n = values.length || 1;

    const min = values[0];
    const max = values[n - 1];

    const getPercentile = (p) => {
      if (n === 1) return values[0];
      const idx = (n - 1) * p;
      const lower = Math.floor(idx);
      const upper = Math.ceil(idx);
      const weight = idx - lower;
      return values[lower] * (1 - weight) + values[upper] * weight;
    };

    const q1 = getPercentile(0.25);
    const mediana = getPercentile(0.50);
    const q3 = getPercentile(0.75);
    const iqr = Math.max(0.1, q3 - q1);

    const asesores = list.map(a => {
      let banda = 'normal';
      if (a.llamadas < q1) banda = 'baja';
      else if (a.llamadas > q3) banda = 'alta';
      return { ...a, banda };
    });

    const asesoresDesc = [...asesores].sort((a, b) => b.llamadas - a.llamadas);

    const bajos = asesores.filter(a => a.banda === 'baja');
    const normales = asesores.filter(a => a.banda === 'normal');
    const altos = asesores.filter(a => a.banda === 'alta');

    return {
      asesores,
      asesoresDesc,
      min,
      q1: Math.round(q1),
      mediana: Math.round(mediana),
      q3: Math.round(q3),
      max,
      iqr,
      bajos,
      normales,
      altos
    };
  }, [rawAsesores]);

  // Lista filtrada para la vista ranking
  const rankingFiltrado = useMemo(() => {
    let list = stats.asesoresDesc;
    if (filtroBanda === 'baja') list = list.filter(a => a.banda === 'baja');
    if (filtroBanda === 'alta') list = list.filter(a => a.banda === 'alta');
    if (busqueda.trim()) {
      const q = busqueda.trim().toLowerCase();
      list = list.filter(a => a.nombre.toLowerCase().includes(q) || a.dni.toLowerCase().includes(q));
    }
    return list;
  }, [stats.asesoresDesc, filtroBanda, busqueda]);

  const rankingVisibles = mostrarTodos ? rankingFiltrado.slice(0, 40) : rankingFiltrado.slice(0, 10);

  // Límites visuales para escala SVG (con margen) en el Box Plot
  const rangeMin = Math.max(0, Math.floor(stats.min * 0.8));
  const rangeMax = Math.ceil(stats.max * 1.15) || 60;
  const rangeSpan = Math.max(1, rangeMax - rangeMin);
  const getX = (val) => 50 + ((val - rangeMin) / rangeSpan) * 400;

  const xMin = getX(stats.min);
  const xQ1 = getX(stats.q1);
  const xMed = getX(stats.mediana);
  const xQ3 = getX(stats.q3);
  const xMax = getX(stats.max);

  // Estilos de colores por banda
  const colorBanda = {
    baja: { main: '#ef4444', bg: '#fef2f2', border: '#fca5a5', text: '#b91c1c', label: 'Bajo' },
    normal: { main: '#3b82f6', bg: '#eff6ff', border: '#93c5fd', text: '#1d4ed8', label: 'Normal' },
    alta: { main: '#10b981', bg: '#ecfdf5', border: '#6ee7b7', text: '#047857', label: 'Alto' }
  };

  return (
    <div className="executive-card" style={{ padding: '1.35rem', borderRadius: '16px', background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
      
      {/* ── Cabecera Principal + Conmutador de Pestañas ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '0.85rem',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart2 size={20} style={{ color: '#0d9488' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f1c2e', fontFamily: 'Outfit, sans-serif', margin: 0 }}>
              Distribución de Atenciones por Asesor
            </h3>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.25rem', margin: 0 }}>
            {vistaTab === 'operativa' 
              ? 'Ranking de desempeño diario clasificado por bandas de desempeño para gestión del supervisor'
              : 'Análisis estadístico de dispersión, cuartiles y valores atípicos (Box Plot)'}
          </p>
        </div>

        {/* Conmutador de Vista (Operativa vs Estadística) */}
        <div style={{
          display: 'flex',
          background: '#f1f5f9',
          padding: '3px',
          borderRadius: '10px',
          border: '1px solid #cbd5e1'
        }}>
          <button
            onClick={() => setVistaTab('operativa')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '7px',
              fontSize: '0.75rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: vistaTab === 'operativa' ? '#ffffff' : 'transparent',
              color: vistaTab === 'operativa' ? '#0f1c2e' : '#64748b',
              boxShadow: vistaTab === 'operativa' ? '0 2px 4px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            🎯 Ranking Operativo
          </button>
          <button
            onClick={() => setVistaTab('estadistica')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '7px',
              fontSize: '0.75rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: vistaTab === 'estadistica' ? '#ffffff' : 'transparent',
              color: vistaTab === 'estadistica' ? '#0f1c2e' : '#64748b',
              boxShadow: vistaTab === 'estadistica' ? '0 2px 4px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            📊 Box Plot (BI)
          </button>
        </div>
      </div>

      {/* ── VISTA 1: RANKING OPERATIVO (VISTA POR DEFECTO PARA SUPERVISORES) ── */}
      {vistaTab === 'operativa' && (
        <div>
          {/* Leyenda explicativa de bandas */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#f8fafc',
            padding: '0.65rem 0.85rem',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            marginBottom: '1rem',
            flexWrap: 'wrap',
            gap: '0.6rem'
          }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.74rem', color: '#475569', fontWeight: 700 }}>Bandas de Desempeño:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#ef4444', display: 'inline-block' }}></span>
                <span style={{ fontWeight: 700, color: '#b91c1c' }}>Bajo</span>
                <span style={{ color: '#64748b', fontSize: '0.7rem' }}>(menos de {stats.q1}/día)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#3b82f6', display: 'inline-block' }}></span>
                <span style={{ fontWeight: 700, color: '#1d4ed8' }}>Normal</span>
                <span style={{ color: '#64748b', fontSize: '0.7rem' }}>({stats.q1} a {stats.q3}/día)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#10b981', display: 'inline-block' }}></span>
                <span style={{ fontWeight: 700, color: '#047857' }}>Alto</span>
                <span style={{ color: '#64748b', fontSize: '0.7rem' }}>(más de {stats.q3}/día)</span>
              </div>
            </div>

            {/* Filtro Rápido por Banda */}
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <button
                onClick={() => setFiltroBanda('todas')}
                style={{
                  padding: '0.2rem 0.55rem',
                  borderRadius: '6px',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: filtroBanda === 'todas' ? '#0f1c2e' : '#cbd5e1',
                  background: filtroBanda === 'todas' ? '#0f1c2e' : '#ffffff',
                  color: filtroBanda === 'todas' ? '#ffffff' : '#475569'
                }}
              >
                Todos ({stats.asesores.length})
              </button>
              <button
                onClick={() => setFiltroBanda('baja')}
                style={{
                  padding: '0.2rem 0.55rem',
                  borderRadius: '6px',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: filtroBanda === 'baja' ? '#ef4444' : '#fca5a5',
                  background: filtroBanda === 'baja' ? '#ef4444' : '#fef2f2',
                  color: filtroBanda === 'baja' ? '#ffffff' : '#b91c1c'
                }}
              >
                ⚠️ Banda Baja ({stats.bajos.length})
              </button>
              <button
                onClick={() => setFiltroBanda('alta')}
                style={{
                  padding: '0.2rem 0.55rem',
                  borderRadius: '6px',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: filtroBanda === 'alta' ? '#10b981' : '#6ee7b7',
                  background: filtroBanda === 'alta' ? '#10b981' : '#ecfdf5',
                  color: filtroBanda === 'alta' ? '#ffffff' : '#047857'
                }}
              >
                🌟 Banda Alta ({stats.altos.length})
              </button>
            </div>
          </div>

          {/* Buscador minimalista opcional cuando se expande */}
          {mostrarTodos && (
            <div style={{ position: 'relative', marginBottom: '0.65rem' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Buscar por nombre de asesor..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.35rem 0.5rem 0.35rem 1.8rem',
                  fontSize: '0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  outline: 'none',
                  color: '#1e293b'
                }}
              />
            </div>
          )}

          {/* Gráfico de Ranking Horizontal con Scroll Minimalista */}
          <div
            className="custom-scrollbar"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.45rem',
              marginBottom: '0.85rem',
              maxHeight: mostrarTodos ? '320px' : 'auto',
              overflowY: mostrarTodos ? 'auto' : 'visible',
              paddingRight: mostrarTodos ? '0.35rem' : '0'
            }}
          >
            {rankingVisibles.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8', fontSize: '0.78rem' }}>
                No se encontraron asesores coincidentes con la búsqueda.
              </div>
            ) : (
              rankingVisibles.map((a) => {
                const cfg = colorBanda[a.banda];
                const pct = Math.max(8, Math.min(100, (a.llamadas / stats.max) * 100));

                return (
                  <div
                    key={a.dni || a.nombre}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '170px 1fr 50px',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.25rem 0.4rem',
                      borderRadius: '8px',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    {/* Nombre del Asesor (Sin DNI expuesto) */}
                    <div
                      title={a.nombre}
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: '#1e293b',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        textAlign: 'left'
                      }}
                    >
                      {a.nombre}
                    </div>

                    {/* Barra de progreso coloreada por Banda */}
                    <div style={{ background: '#f1f5f9', borderRadius: '6px', height: '22px', overflow: 'hidden', position: 'relative' }}>
                      <div
                        style={{
                          width: `${pct}%`,
                          height: '100%',
                          background: `linear-gradient(90deg, ${cfg.main} 0%, ${cfg.main}dd 100%)`,
                          borderRadius: '6px',
                          transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: `0 2px 4px ${cfg.main}33`
                        }}
                      />
                    </div>

                    {/* Cifra exacta de atenciones/día */}
                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        fontSize: '0.88rem',
                        fontWeight: 800,
                        color: cfg.main,
                        fontFamily: 'Outfit, sans-serif'
                      }}>
                        {Math.round(a.llamadas)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Botón Ver Más / Ver Menos */}
          {rankingFiltrado.length > 10 && (
            <div style={{ textAlign: 'center', marginTop: '0.5rem', marginBottom: '0.75rem' }}>
              <button
                onClick={() => {
                  setMostrarTodos(!mostrarTodos);
                  if (mostrarTodos) setBusqueda('');
                }}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '20px',
                  fontSize: '0.73rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}
              >
                {mostrarTodos ? (
                  <>Mostrar menos (Top 10) <ChevronUp size={14} /></>
                ) : (
                  <>Ver todos ({rankingFiltrado.length} asesores con scroll) <ChevronDown size={14} /></>
                )}
              </button>
            </div>
          )}

          {/* Resumen de Negocio Operativo (Pie del gráfico) */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px dashed #cbd5e1',
            paddingTop: '0.75rem',
            marginTop: '0.5rem',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            <div style={{ fontSize: '0.78rem', color: '#334155' }}>
              <strong>Mediana del equipo:</strong> <span style={{ fontWeight: 800, color: '#0f1c2e' }}>{stats.mediana} atenciones/día</span>
            </div>
            <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.76rem' }}>
              <span style={{ color: '#b91c1c', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                🔴 {stats.bajos.length} asesores en banda baja
              </span>
              <span style={{ color: '#047857', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                🟢 {stats.altos.length} asesores en banda alta
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── VISTA 2: VISTA ESTADÍSTICA (BOX PLOT PARA BI / ANALISTAS) ── */}
      {vistaTab === 'estadistica' && (
        <div>
          {/* Leyenda explicativa Box Plot */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#f0fdfa',
            padding: '0.5rem 0.75rem',
            borderRadius: '8px',
            border: '1px solid #99f6e4',
            marginBottom: '0.85rem',
            fontSize: '0.73rem',
            color: '#0f766e'
          }}>
            <span style={{ fontWeight: 700 }}>Diagrama de Caja y Bigotes (Box Plot):</span>
            <span>Caja = Rango Intercuartil (Q1-Q3) | Línea central = Mediana | Puntos = Asesores</span>
          </div>

          {/* SVG Canvas del Diagrama de Caja y Bigotes */}
          <div style={{ position: 'relative', width: '100%', height: '170px', background: '#fafafa', borderRadius: '12px', padding: '0.5rem', border: '1px solid #e2e8f0' }}>
            <svg viewBox="0 0 480 150" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              
              {/* Eje horizontal base */}
              <line x1="40" y1="120" x2="460" y2="120" stroke="#cbd5e1" strokeWidth="1.5" />

              {/* Marcas de graduación en el eje X */}
              {[stats.min, stats.q1, stats.mediana, stats.q3, stats.max].map((val, i) => {
                const cx = getX(val);
                return (
                  <g key={i}>
                    <line x1={cx} y1="117" x2={cx} y2="123" stroke="#94a3b8" strokeWidth="1.5" />
                    <text x={cx} y="136" fontSize="9" fill="#64748b" fontWeight="600" textAnchor="middle">
                      {Math.round(val)}
                    </text>
                  </g>
                );
              })}

              {/* Línea horizontal de los Bigotes (Whiskers: desde Min hasta Max) */}
              <line x1={xMin} y1="65" x2={xMax} y2="65" stroke="#64748b" strokeWidth="2" strokeDasharray="3 3" />

              {/* Topes verticales de los Bigotes (Whisker Caps) */}
              <line x1={xMin} y1="50" x2={xMin} y2="80" stroke="#dc2626" strokeWidth="2.5" />
              <line x1={xMax} y1="50" x2={xMax} y2="80" stroke="#10b981" strokeWidth="2.5" />

              {/* Caja Intercuartil (Q1 a Q3) */}
              <rect
                x={xQ1}
                y="42"
                width={Math.max(4, xQ3 - xQ1)}
                height="46"
                rx="8"
                fill="url(#boxGradient)"
                stroke="#2563eb"
                strokeWidth="1.5"
                style={{ filter: 'drop-shadow(0 4px 6px rgba(37, 99, 235, 0.15))' }}
              />

              {/* Gradiente para la Caja IQR */}
              <defs>
                <linearGradient id="boxGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="rgba(59, 130, 246, 0.25)" />
                  <stop offset="50%" stopColor="rgba(37, 99, 235, 0.35)" />
                  <stop offset="100%" stopColor="rgba(2, 132, 199, 0.25)" />
                </linearGradient>
              </defs>

              {/* Línea de la Mediana (Q2) */}
              <line x1={xMed} y1="42" x2={xMed} y2="88" stroke="#0f1c2e" strokeWidth="3" />
              
              {/* Badge de la Mediana arriba de la caja */}
              <g transform={`translate(${xMed}, 25)`}>
                <rect x="-34" y="-12" width="68" height="20" rx="10" fill="#0f1c2e" />
                <text x="0" y="2" fontSize="9.5" fill="#ffffff" fontWeight="800" textAnchor="middle">
                  Mediana: {stats.mediana}
                </text>
              </g>

              {/* Renderizado de Puntos de Asesores (Scatter Plot) */}
              {stats.asesores.map((a, idx) => {
                const cx = getX(a.llamadas);
                const cy = 65 + ((idx % 5) - 2) * 5;
                const isHover = asesorHover?.dni === a.dni;

                return (
                  <g
                    key={a.dni || idx}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setAsesorHover(a)}
                  >
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isHover ? "5.5" : "3.5"}
                      fill={isHover ? "#0f1c2e" : a.banda === 'baja' ? "#ef4444" : a.banda === 'alta' ? "#10b981" : "#3b82f6"}
                      stroke="#ffffff"
                      strokeWidth="1.2"
                      opacity={isHover ? "1" : "0.75"}
                    >
                      <title>{`${a.nombre}\nLlamadas: ${a.llamadas} atenciones/día`}</title>
                    </circle>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Tarjetas KPI Estadísticas */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '0.65rem',
            marginTop: '0.85rem'
          }}>
            {/* Mínimo */}
            <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', padding: '0.55rem 0.75rem', borderRadius: '10px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: '#991b1b', fontWeight: 600, display: 'block' }}>Mínimo Registrado</span>
              <strong style={{ fontSize: '1.15rem', color: '#dc2626', fontWeight: 800 }}>{stats.min} <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>llam.</span></strong>
            </div>

            {/* Rango Intercuartil (IQR) */}
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '0.55rem 0.75rem', borderRadius: '10px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: '#1e40af', fontWeight: 600, display: 'block' }}>Rango Intercuartil (IQR)</span>
              <strong style={{ fontSize: '1.15rem', color: '#2563eb', fontWeight: 800 }}>{stats.q1} - {stats.q3} <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>llam.</span></strong>
            </div>

            {/* Mediana Equipo */}
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.55rem 0.75rem', borderRadius: '10px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: '#166534', fontWeight: 600, display: 'block' }}>Mediana Equipo</span>
              <strong style={{ fontSize: '1.15rem', color: '#166534', fontWeight: 800 }}>{stats.mediana} <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>atenciones/día</span></strong>
            </div>

            {/* Máximo */}
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '0.55rem 0.75rem', borderRadius: '10px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: '#065f46', fontWeight: 600, display: 'block' }}>Máximo Registrado</span>
              <strong style={{ fontSize: '1.15rem', color: '#10b981', fontWeight: 800 }}>{stats.max} <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>llam.</span></strong>
            </div>
          </div>

          {/* Tooltip de detalle en Hover del Asesor */}
          {asesorHover && (
            <div style={{
              marginTop: '0.75rem',
              padding: '0.5rem 0.85rem',
              background: '#0f1c2e',
              color: '#ffffff',
              borderRadius: '8px',
              fontSize: '0.76rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <strong>{asesorHover.nombre}</strong>
              </div>
              <div style={{ color: '#38bdf8', fontWeight: 800 }}>
                {asesorHover.llamadas} atenciones por día
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

