import React, { useState, useMemo } from 'react';
import { Target, TrendingUp, AlertTriangle, Zap, ShieldAlert, SlidersHorizontal, Info, Sparkles, UserCheck } from 'lucide-react';

/**
 * Componente ScatterVolumenVsCalidad con Nombres Profesionales en Español
 * (Matriz de Desempeño 4 Cuadrantes: Alto Rendimiento, Potencial de Crecimiento, Riesgo por Saturación, Atención Prioritaria).
 */
export default function ScatterVolumenVsCalidad({ data }) {
  const [tipoUmbral, setTipoUmbral] = useState('mediana'); // 'mediana' | 'fijo'
  const [asesorSeleccionado, setAsesorSeleccionado] = useState(null);

  const rawAsesores = data?.matriz?.asesores || [];

  // 1. Mapear y normalizar puntos de asesores
  const puntos = useMemo(() => {
    if (!rawAsesores || rawAsesores.length === 0) {
      return [
        { dni: '10252616', nombre: 'JUAN PEREZ', llamadas: 35, calidad: 88, modalidad: 'PRESENCIAL' },
        { dni: '76487711', nombre: 'JEISSON SANCHEZ', llamadas: 42, calidad: 92, modalidad: 'REMOTO' },
        { dni: '61200222', nombre: 'MARIA LOPEZ', llamadas: 14, calidad: 95, modalidad: 'PRESENCIAL' },
        { dni: '74408974', nombre: 'YARLY DIAZ', llamadas: 38, calidad: 62, modalidad: 'HÍBRIDO' },
        { dni: '45892011', nombre: 'CARLOS RUIZ', llamadas: 10, calidad: 58, modalidad: 'REMOTO' },
        { dni: '12345678', nombre: 'ANA TORRES', llamadas: 28, calidad: 80, modalidad: 'PRESENCIAL' },
        { dni: '87654321', nombre: 'PEDRO GOMEZ', llamadas: 18, calidad: 85, modalidad: 'REMOTO' },
        { dni: '11223344', nombre: 'SOFIA RAMOS', llamadas: 45, calidad: 68, modalidad: 'PRESENCIAL' },
        { dni: '55667788', nombre: 'LUIS MENDOZA', llamadas: 12, calidad: 52, modalidad: 'REMOTO' },
        { dni: '99887766', nombre: 'ELENA SILVA', llamadas: 30, calidad: 90, modalidad: 'HÍBRIDO' }
      ];
    }

    return rawAsesores.map((a) => {
      const llamadas = parseFloat(a.promedio_llamadas ?? a.q_atendidas ?? a.llamadas_q ?? a.prom_llamadas ?? a.llamadas) || 10;
      const calidad = parseFloat(a.calidad_pct ?? a.kpi3_pct ?? a.calidadPct ?? a.calidad) || 85;
      return {
        dni: a.documento || a.dni || 'S/D',
        nombre: a.asesor || 'ASESOR OJT',
        llamadas,
        calidad,
        modalidad: a.modalidad || 'PRESENCIAL',
        formador: a.formador || 'SIN FORMADOR',
        campana: a.campana || 'GENERAL'
      };
    });
  }, [rawAsesores]);

  // 2. Calcular cortes de la matriz (Medianas dinámicas o Umbrales Fijos)
  const { umbralVolumen, umbralCalidad } = useMemo(() => {
    if (tipoUmbral === 'fijo') {
      return { umbralVolumen: 20, umbralCalidad: 75 };
    }

    if (puntos.length === 0) return { umbralVolumen: 20, umbralCalidad: 75 };

    const vols = puntos.map(p => p.llamadas).sort((a, b) => a - b);
    const midX = Math.floor(vols.length / 2);
    const medX = vols.length % 2 !== 0 ? vols[midX] : Math.round((vols[midX - 1] + vols[midX]) / 2);

    const cals = puntos.map(p => p.calidad).sort((a, b) => a - b);
    const midY = Math.floor(cals.length / 2);
    const medY = cals.length % 2 !== 0 ? cals[midY] : Math.round((cals[midY - 1] + cals[midY]) / 2);

    return {
      umbralVolumen: Math.max(5, medX),
      umbralCalidad: Math.max(50, medY)
    };
  }, [puntos, tipoUmbral]);

  // 3. Clasificar puntos en los 4 Cuadrantes Profesionales
  const { clasificados, resumenCuadrantes } = useMemo(() => {
    let topPerformers = 0;
    let capacidadOciosa = 0;
    let sobrecargaCoaching = 0;
    let bajoRendimiento = 0;

    const list = puntos.map((p) => {
      const altoVolumen = p.llamadas >= umbralVolumen;
      const altaCalidad = p.calidad >= umbralCalidad;

      let cuadranteKey = '';
      let cuadranteNombre = '';
      let color = '';
      let recomendacion = '';

      if (altoVolumen && altaCalidad) {
        cuadranteKey = 'Q1_TOP';
        cuadranteNombre = 'Alto Rendimiento';
        color = '#34c759'; // Apple Emerald Green
        recomendacion = '🎯 Mentor / Referente de Cohorte';
        topPerformers++;
      } else if (!altoVolumen && altaCalidad) {
        cuadranteKey = 'Q2_OCIOSA';
        cuadranteNombre = 'Potencial de Crecimiento';
        color = '#007aff'; // Apple Blue
        recomendacion = '⚡ Alta eficiencia, incrementar asignación de llamadas';
        capacidadOciosa++;
      } else if (altoVolumen && !altaCalidad) {
        cuadranteKey = 'Q3_SOBRECARGA';
        cuadranteNombre = 'Riesgo por Saturación';
        color = '#ff9500'; // Apple Amber Orange
        recomendacion = '⚠️ Rinde en cantidad pero requiere refuerzo en calidad';
        sobrecargaCoaching++;
      } else {
        cuadranteKey = 'Q4_BAJO_RENDIMIENTO';
        cuadranteNombre = 'Atención Prioritaria';
        color = '#ff3b30'; // Apple Crimson Red
        recomendacion = '🚨 Plan de acción e intervención inmediata';
        bajoRendimiento++;
      }

      return {
        ...p,
        cuadranteKey,
        cuadranteNombre,
        color,
        recomendacion
      };
    });

    const total = list.length || 1;

    return {
      clasificados: list,
      resumenCuadrantes: {
        topPerformers: { count: topPerformers, pct: Math.round((topPerformers / total) * 100) },
        capacidadOciosa: { count: capacidadOciosa, pct: Math.round((capacidadOciosa / total) * 100) },
        sobrecargaCoaching: { count: sobrecargaCoaching, pct: Math.round((sobrecargaCoaching / total) * 100) },
        bajoRendimiento: { count: bajoRendimiento, pct: Math.round((bajoRendimiento / total) * 100) }
      }
    };
  }, [puntos, umbralVolumen, umbralCalidad]);

  // Límites para escalado en el SVG Canvas
  const maxVol = useMemo(() => Math.max(50, ...puntos.map(p => p.llamadas)), [puntos]);
  const minCal = 40;
  const maxCal = 100;

  // Coordenadas SVG
  const getX = (vol) => 45 + (Math.min(vol, maxVol) / maxVol) * 415;
  const getY = (cal) => 225 - ((Math.min(Math.max(cal, minCal), maxCal) - minCal) / (maxCal - minCal)) * 195;

  const lineX = getX(umbralVolumen);
  const lineY = getY(umbralCalidad);

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderRadius: '20px',
      padding: '1.4rem',
      border: '1px solid rgba(226, 232, 240, 0.8)',
      boxShadow: '0 10px 30px rgba(15, 23, 42, 0.04)'
    }}>
      
      {/* ── Header con estilo macOS / iOS segmented control ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.1rem',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '30px', height: '30px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #007aff 0%, #5856d6 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
              boxShadow: '0 3px 8px rgba(0, 122, 255, 0.25)'
            }}>
              <Target size={16} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1c1c1e', fontFamily: 'Outfit, sans-serif', margin: 0, letterSpacing: '-0.02em' }}>
              Matriz de Desempeño: Volumen vs. Calidad
            </h3>
          </div>
          <p style={{ fontSize: '0.76rem', color: '#8e8e93', marginTop: '0.2rem', margin: 0 }}>
            Segmentación estratégica de asesores en 4 cuadrantes analíticos
          </p>
        </div>

        {/* iOS Glass Segmented Switch */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: '#e9e9ea',
          padding: '3px',
          borderRadius: '9999px',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)'
        }}>
          <button
            onClick={() => setTipoUmbral('mediana')}
            style={{
              padding: '0.35rem 0.85rem',
              fontSize: '0.73rem',
              fontWeight: 700,
              borderRadius: '9999px',
              border: 'none',
              cursor: 'pointer',
              background: tipoUmbral === 'mediana' ? '#ffffff' : 'transparent',
              color: tipoUmbral === 'mediana' ? '#1c1c1e' : '#8e8e93',
              boxShadow: tipoUmbral === 'mediana' ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            Mediana Dinámica
          </button>
          <button
            onClick={() => setTipoUmbral('fijo')}
            style={{
              padding: '0.35rem 0.85rem',
              fontSize: '0.73rem',
              fontWeight: 700,
              borderRadius: '9999px',
              border: 'none',
              cursor: 'pointer',
              background: tipoUmbral === 'fijo' ? '#ffffff' : 'transparent',
              color: tipoUmbral === 'fijo' ? '#1c1c1e' : '#8e8e93',
              boxShadow: tipoUmbral === 'fijo' ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            Umbral Fijo (Meta)
          </button>
        </div>
      </div>

      {/* ── Canvas SVG con Tarjetas Flotantes Glassmorphism en las 4 Esquinas ── */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '270px',
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid rgba(226, 232, 240, 0.9)',
        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.02)',
        overflow: 'hidden'
      }}>

        {/* 🏷️ Etiquetas Pill Flotantes en las 4 Esquinas */}
        {/* Q2: Superior Izquierda (Potencial de Crecimiento) */}
        <div style={{
          position: 'absolute', top: '10px', left: '55px',
          background: 'rgba(0, 122, 255, 0.1)', border: '1px solid rgba(0, 122, 255, 0.25)',
          color: '#007aff', padding: '0.2rem 0.55rem', borderRadius: '9999px',
          fontSize: '0.68rem', fontWeight: 800, pointerEvents: 'none', backdropFilter: 'blur(4px)'
        }}>
          ⚡ Potencial Crecimiento ({resumenCuadrantes.capacidadOciosa.count})
        </div>

        {/* Q1: Superior Derecha (Alto Rendimiento) */}
        <div style={{
          position: 'absolute', top: '10px', right: '12px',
          background: 'rgba(52, 199, 89, 0.1)', border: '1px solid rgba(52, 199, 89, 0.25)',
          color: '#248a3d', padding: '0.2rem 0.55rem', borderRadius: '9999px',
          fontSize: '0.68rem', fontWeight: 800, pointerEvents: 'none', backdropFilter: 'blur(4px)'
        }}>
          🎯 Alto Rendimiento ({resumenCuadrantes.topPerformers.count})
        </div>

        {/* Q4: Inferior Izquierda (Atención Prioritaria) */}
        <div style={{
          position: 'absolute', bottom: '38px', left: '55px',
          background: 'rgba(255, 59, 48, 0.1)', border: '1px solid rgba(255, 59, 48, 0.25)',
          color: '#ff3b30', padding: '0.2rem 0.55rem', borderRadius: '9999px',
          fontSize: '0.68rem', fontWeight: 800, pointerEvents: 'none', backdropFilter: 'blur(4px)'
        }}>
          🚨 Atención Prioritaria ({resumenCuadrantes.bajoRendimiento.count})
        </div>

        {/* Q3: Inferior Derecha (Riesgo por Saturación) */}
        <div style={{
          position: 'absolute', bottom: '38px', right: '12px',
          background: 'rgba(255, 149, 0, 0.1)', border: '1px solid rgba(255, 149, 0, 0.25)',
          color: '#c67300', padding: '0.2rem 0.55rem', borderRadius: '9999px',
          fontSize: '0.68rem', fontWeight: 800, pointerEvents: 'none', backdropFilter: 'blur(4px)'
        }}>
          ⚠️ Riesgo por Saturación ({resumenCuadrantes.sobrecargaCoaching.count})
        </div>

        <svg viewBox="0 0 480 250" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          {/* Fondo Sombreado de Cuadrantes */}
          <rect x={lineX} y={15} width={465 - lineX} height={lineY - 15} fill="rgba(52, 199, 89, 0.03)" rx="8" />
          <rect x={45} y={15} width={lineX - 45} height={lineY - 15} fill="rgba(0, 122, 255, 0.03)" rx="8" />
          <rect x={lineX} y={lineY} width={465 - lineX} height={225 - lineY} fill="rgba(255, 149, 0, 0.03)" rx="8" />
          <rect x={45} y={lineY} width={lineX - 45} height={225 - lineY} fill="rgba(255, 59, 48, 0.03)" rx="8" />

          {/* Ejes X y Y principales */}
          <line x1="45" y1="225" x2="465" y2="225" stroke="#e2e8f0" strokeWidth="1.5" />
          <line x1="45" y1="15" x2="45" y2="225" stroke="#e2e8f0" strokeWidth="1.5" />

          {/* Líneas divisorias de Cuadrante */}
          <line x1={lineX} y1="15" x2={lineX} y2="225" stroke="#007aff" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
          <line x1="45" y1={lineY} x2="465" y2={lineY} stroke="#007aff" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />

          {/* Badge Umbral X (Volumen) */}
          <g transform={`translate(${lineX}, 240)`}>
            <rect x="-38" y="-9" width="76" height="17" rx="8.5" fill="#007aff" />
            <text x="0" y="3" fontSize="8.5" fill="#ffffff" fontWeight="700" textAnchor="middle" fontFamily="Inter, sans-serif">
              {tipoUmbral === 'mediana' ? `Mediana: ${umbralVolumen}` : `Meta: ${umbralVolumen}`}
            </text>
          </g>

          {/* Badge Umbral Y (Calidad) */}
          <g transform={`translate(24, ${lineY})`}>
            <rect x="-20" y="-8.5" width="38" height="17" rx="8.5" fill="#007aff" />
            <text x="-1" y="3.5" fontSize="8.5" fill="#ffffff" fontWeight="700" textAnchor="middle" fontFamily="Inter, sans-serif">
              {umbralCalidad}%
            </text>
          </g>

          {/* Puntos de Asesores */}
          {clasificados.map((p, idx) => {
            const cx = getX(p.llamadas);
            const cy = getY(p.calidad);
            const isSelected = asesorSeleccionado?.dni === p.dni;

            return (
              <g 
                key={p.dni || idx}
                style={{ cursor: 'pointer' }}
                onClick={() => setAsesorSeleccionado(p)}
                onMouseEnter={() => setAsesorSeleccionado(p)}
              >
                {isSelected && (
                  <circle cx={cx} cy={cy} r="10" fill={p.color} opacity="0.3" />
                )}

                <circle
                  cx={cx}
                  cy={cy}
                  r={isSelected ? "6" : "4.5"}
                  fill={p.color}
                  stroke="#ffffff"
                  strokeWidth="1.8"
                  opacity={isSelected ? "1" : "0.85"}
                  style={{ transition: 'all 0.15s ease' }}
                >
                  <title>{`${p.nombre} (${p.dni})\n• Cuadrante: ${p.cuadranteNombre}\n• Llamadas: ${p.llamadas}\n• Calidad KPI 3: ${p.calidad}%\n• Modalidad: ${p.modalidad}\n\n💡 Acción: ${p.recomendacion}`}</title>
                </circle>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Leyenda Ejes */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', fontSize: '0.72rem', color: '#8e8e93' }}>
        <span>Eje X: <strong>Q_ATENDIDAS</strong> (Promedio Llamadas/Día)</span>
        <span>Eje Y: <strong>KPI 3 Calidad %</strong></span>
      </div>

      {/* ── 4 Tarjetas Summary Ajustadas con Nombres Profesionales ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '0.65rem',
        marginTop: '0.85rem'
      }}>
        {/* Alto Rendimiento */}
        <div style={{
          background: 'rgba(52, 199, 89, 0.05)',
          border: '1px solid rgba(52, 199, 89, 0.2)',
          borderRadius: '14px',
          padding: '0.7rem 0.75rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.3rem' }}>
            <span style={{ color: '#248a3d', fontWeight: 800, fontSize: '0.72rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              🎯 Alto Rendimiento
            </span>
            <span style={{ fontSize: '0.65rem', background: '#34c759', color: '#fff', padding: '0.1rem 0.4rem', borderRadius: '9999px', fontWeight: 700, flexShrink: 0 }}>
              {resumenCuadrantes.topPerformers.pct}%
            </span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1c1c1e', marginTop: '0.2rem', fontFamily: 'Outfit, sans-serif' }}>
            {resumenCuadrantes.topPerformers.count}
          </div>
          <p style={{ fontSize: '0.66rem', color: '#8e8e93', margin: '0.15rem 0 0', lineHeight: 1.25 }}>
            Productividad y calidad superior
          </p>
        </div>

        {/* Potencial de Crecimiento */}
        <div style={{
          background: 'rgba(0, 122, 255, 0.05)',
          border: '1px solid rgba(0, 122, 255, 0.2)',
          borderRadius: '14px',
          padding: '0.7rem 0.75rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.3rem' }}>
            <span style={{ color: '#007aff', fontWeight: 800, fontSize: '0.72rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              ⚡ Potencial Crecimiento
            </span>
            <span style={{ fontSize: '0.65rem', background: '#007aff', color: '#fff', padding: '0.1rem 0.4rem', borderRadius: '9999px', fontWeight: 700, flexShrink: 0 }}>
              {resumenCuadrantes.capacidadOciosa.pct}%
            </span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1c1c1e', marginTop: '0.2rem', fontFamily: 'Outfit, sans-serif' }}>
            {resumenCuadrantes.capacidadOciosa.count}
          </div>
          <p style={{ fontSize: '0.66rem', color: '#8e8e93', margin: '0.15rem 0 0', lineHeight: 1.25 }}>
            Alta calidad, listos para + llamadas
          </p>
        </div>

        {/* Riesgo por Saturación */}
        <div style={{
          background: 'rgba(255, 149, 0, 0.05)',
          border: '1px solid rgba(255, 149, 0, 0.2)',
          borderRadius: '14px',
          padding: '0.7rem 0.75rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.3rem' }}>
            <span style={{ color: '#c67300', fontWeight: 800, fontSize: '0.72rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              ⚠️ Riesgo Saturación
            </span>
            <span style={{ fontSize: '0.65rem', background: '#ff9500', color: '#fff', padding: '0.1rem 0.4rem', borderRadius: '9999px', fontWeight: 700, flexShrink: 0 }}>
              {resumenCuadrantes.sobrecargaCoaching.pct}%
            </span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1c1c1e', marginTop: '0.2rem', fontFamily: 'Outfit, sans-serif' }}>
            {resumenCuadrantes.sobrecargaCoaching.count}
          </div>
          <p style={{ fontSize: '0.66rem', color: '#8e8e93', margin: '0.15rem 0 0', lineHeight: 1.25 }}>
            Alto volumen, requiere coaching
          </p>
        </div>

        {/* Atención Prioritaria */}
        <div style={{
          background: 'rgba(255, 59, 48, 0.05)',
          border: '1px solid rgba(255, 59, 48, 0.2)',
          borderRadius: '14px',
          padding: '0.7rem 0.75rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.3rem' }}>
            <span style={{ color: '#ff3b30', fontWeight: 800, fontSize: '0.72rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              🚨 Atención Prioritaria
            </span>
            <span style={{ fontSize: '0.65rem', background: '#ff3b30', color: '#fff', padding: '0.1rem 0.4rem', borderRadius: '9999px', fontWeight: 700, flexShrink: 0 }}>
              {resumenCuadrantes.bajoRendimiento.pct}%
            </span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1c1c1e', marginTop: '0.2rem', fontFamily: 'Outfit, sans-serif' }}>
            {resumenCuadrantes.bajoRendimiento.count}
          </div>
          <p style={{ fontSize: '0.66rem', color: '#8e8e93', margin: '0.15rem 0 0', lineHeight: 1.25 }}>
            Intervención y plan de acción
          </p>
        </div>
      </div>

      {/* ── Widget Interactivo macOS Inspector para Asesor Seleccionado ── */}
      {asesorSeleccionado && (
        <div style={{
          marginTop: '0.85rem',
          padding: '0.75rem 1rem',
          borderRadius: '14px',
          background: '#ffffff',
          border: `1.5px solid ${asesorSeleccionado.color}`,
          boxShadow: `0 6px 20px ${asesorSeleccionado.color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.78rem',
          transition: 'all 0.2s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%',
              background: asesorSeleccionado.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#ffffff', fontWeight: 800, fontSize: '0.85rem'
            }}>
              {asesorSeleccionado.nombre.charAt(0)}
            </div>
            <div>
              <strong style={{ color: '#1c1c1e', fontSize: '0.85rem' }}>{asesorSeleccionado.nombre}</strong>
              <span style={{ color: '#8e8e93', fontSize: '0.74rem', marginLeft: '0.4rem' }}>({asesorSeleccionado.dni}) · {asesorSeleccionado.modalidad}</span>
              <div style={{ fontSize: '0.74rem', color: '#3a3a3c', marginTop: '0.15rem' }}>
                Volumen: <strong>{asesorSeleccionado.llamadas} llamadas/día</strong> · Calidad KPI 3: <strong>{asesorSeleccionado.calidad}%</strong>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ 
              fontWeight: 800, 
              color: '#ffffff',
              background: asesorSeleccionado.color,
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.73rem',
              display: 'inline-block',
              boxShadow: `0 3px 8px ${asesorSeleccionado.color}40`
            }}>
              {asesorSeleccionado.cuadranteNombre}
            </span>
            <div style={{ fontSize: '0.72rem', color: '#48484a', marginTop: '0.2rem', fontWeight: 600 }}>
              {asesorSeleccionado.recomendacion}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
