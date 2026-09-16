import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, ArrowRight } from 'lucide-react';
import { fetchProyeccionCohorte } from '../services/apiService';

/**
 * Componente: Proyección de Resultado (Forecast) por Cohorte
 * Estilo corporativo ejecutivo:
 * - 3 Escenarios de Proyección: D1 (Filtro temprano), D1-D2 (Filtro intermedio), D3-D5 (Fase avanzada)
 * - Tasa histórica de conversión empírica calculada en Supabase/In-Memory Cache
 * - Superficies planas, tipografía sans-serif y números tabulares
 */
export default function ProyeccionCohorteCard({ filtros = {}, onAbrirDetalle }) {
  const [proyeccion, setProyeccion] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [escenarioActivo, setEscenarioActivo] = useState('D1_D2');

  useEffect(() => {
    let cancelado = false;
    async function load() {
      setCargando(true);
      try {
        const res = await fetchProyeccionCohorte(filtros);
        if (!cancelado && res.success) {
          setProyeccion(res);
        }
      } catch (e) {
        console.error('Error cargando proyección:', e);
      } finally {
        if (!cancelado) setCargando(false);
      }
    }
    load();
    return () => { cancelado = true; };
  }, [filtros.grupo, filtros.campana, filtros.formador, filtros.semana]);

  if (!proyeccion) {
    return (
      <div style={{
        padding: '12px',
        background: 'var(--card-bg, #0f172a)',
        border: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
        borderRadius: '10px',
        color: '#94a3b8',
        fontSize: '0.75rem',
        fontFamily: "'Inter', sans-serif",
        textAlign: 'center'
      }}>
        Cargando proyección de cohorte...
      </div>
    );
  }

  const { cohorte, total_asesores, confirmados, escenarios, tasas_historicas } = proyeccion;

  // Paleta corporativa para escenarios
  const scenarioColors = {
    D1: { stroke: '#0284c7', bg: 'rgba(2, 132, 199, 0.08)', border: 'rgba(2, 132, 199, 0.25)', pill: '#0284c7' },
    D1_D2: { stroke: '#6366f1', bg: 'rgba(99, 102, 241, 0.08)', border: 'rgba(99, 102, 241, 0.25)', pill: '#6366f1' },
    D3_D5: { stroke: '#3C9D5C', bg: 'rgba(60, 157, 92, 0.08)', border: 'rgba(60, 157, 92, 0.25)', pill: '#3C9D5C' }
  };

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: 0,
      overflow: 'hidden',
      padding: '7px 10px 6px 10px',
      boxSizing: 'border-box',
      background: 'var(--card-bg, #1e293b)',
      border: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
      borderRadius: '10px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
      position: 'relative'
    }}>
      {/* ── Encabezado Corporativo ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '4px',
        flexShrink: 0,
        gap: '6px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <h3 style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--text-primary, #f8fafc)',
              fontFamily: "'Inter', sans-serif",
              margin: 0,
              whiteSpace: 'nowrap'
            }}>
              Proyección de resultado
            </h3>
            <span style={{ fontSize: '0.64rem', color: '#94a3b8', fontFamily: "'Inter', sans-serif" }}>
              (Forecast)
            </span>
          </div>

          <span style={{
            fontSize: '0.62rem',
            fontWeight: 600,
            color: '#38bdf8',
            background: 'rgba(56, 189, 248, 0.12)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '4px',
            padding: '1px 5px',
            fontFamily: "'Inter', sans-serif",
            whiteSpace: 'nowrap'
          }}>
            {cohorte}
          </span>
        </div>

        {/* Resumen de Confirmados */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.64rem', fontFamily: "'Inter', sans-serif", whiteSpace: 'nowrap' }}>
          <span style={{ color: '#94a3b8' }}>Total: <strong style={{ color: '#f8fafc', fontFamily: "'JetBrains Mono', monospace" }}>{total_asesores}</strong></span>
          <span style={{ color: '#3C9D5C' }}>Aprob: <strong style={{ fontFamily: "'JetBrains Mono', monospace" }}>{confirmados?.aprobados || 0}</strong></span>
          <span style={{ color: '#D9534F' }}>Bajas: <strong style={{ fontFamily: "'JetBrains Mono', monospace" }}>{confirmados?.desaprobados || 0}</strong></span>
          <span style={{ color: '#D9822B' }}>En curso: <strong style={{ fontFamily: "'JetBrains Mono', monospace" }}>{confirmados?.pendientes_en_curso || 0}</strong></span>
        </div>
      </div>

      {/* ── 3 Escenarios de Proyección Cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: '6px',
        flex: 1,
        minHeight: 0
      }}>
        {(escenarios || []).map((esc) => {
          const esActivo = escenarioActivo === esc.id;
          const config = scenarioColors[esc.id] || scenarioColors.D1;

          // Nombres y labels corporativos
          let displayNombre = 'Escenario D1';
          let displaySub = 'Filtro temprano (arranque OJT)';
          if (esc.id === 'D1_D2') {
            displayNombre = 'Escenario D1-D2';
            displaySub = 'Filtro intermedio (tras 48h)';
          } else if (esc.id === 'D3_D5') {
            displayNombre = 'Escenario D3-D5';
            displaySub = 'Fase avanzada (cierre cohorte)';
          }

          return (
            <div
              key={esc.id}
              onClick={() => setEscenarioActivo(esc.id)}
              style={{
                background: esActivo ? config.bg : 'rgba(255, 255, 255, 0.02)',
                border: `1px solid ${esActivo ? config.stroke : 'rgba(255, 255, 255, 0.08)'}`,
                borderRadius: '7px',
                padding: '5px 8px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {/* Header Escenario */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1px' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    color: esActivo ? config.stroke : 'var(--text-primary, #f8fafc)',
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    {displayNombre}
                  </span>
                  <span style={{
                    fontSize: '0.58rem',
                    padding: '1px 4px',
                    borderRadius: '4px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: '#94a3b8',
                    fontWeight: 500,
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    {esc.confianza}
                  </span>
                </div>
                <p style={{
                  fontSize: '0.58rem',
                  color: '#94a3b8',
                  margin: '0 0 3px 0',
                  lineHeight: 1.1,
                  fontFamily: "'Inter', sans-serif",
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {displaySub}
                </p>
              </div>

              {/* Métricas del Escenario */}
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  marginBottom: '2px'
                }}>
                  <div>
                    <span style={{
                      fontSize: '1.15rem',
                      fontWeight: 700,
                      color: 'var(--text-primary, #ffffff)',
                      fontFamily: "'JetBrains Mono', monospace"
                    }}>
                      {esc.proyeccion_aprobados}
                    </span>
                    <span style={{ fontSize: '0.62rem', color: '#94a3b8', marginLeft: '3px', fontFamily: "'Inter', sans-serif" }}>
                      / {total_asesores} egresos
                    </span>
                  </div>
                  <span style={{
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    color: esc.tasa_proyectada >= 55 ? '#3C9D5C' : '#D9822B',
                    fontFamily: "'JetBrains Mono', monospace"
                  }}>
                    {esc.tasa_proyectada}%
                  </span>
                </div>

                {/* Progress Bar Plano */}
                <div style={{
                  height: '4px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '2px',
                  overflow: 'hidden',
                  position: 'relative',
                  marginBottom: '3px'
                }}>
                  <div style={{
                    width: `${Math.min(100, esc.tasa_proyectada)}%`,
                    height: '100%',
                    background: esc.tasa_proyectada >= 55 ? '#3C9D5C' : '#D9822B',
                    borderRadius: '2px'
                  }} />
                </div>

                {/* Footer del Escenario */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.58rem',
                  color: '#64748b',
                  fontFamily: "'Inter', sans-serif"
                }}>
                  <span>Bajas est: <strong style={{ color: '#D9534F', fontFamily: "'JetBrains Mono', monospace" }}>{esc.proyeccion_desaprobados}</strong></span>
                  <span>Meta: <strong>≥55%</strong></span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Sub-footer Corporativo ── */}
      <div style={{
        marginTop: '4px',
        padding: '2px 6px',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '4px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.6rem',
        fontFamily: "'Inter', sans-serif",
        color: '#64748b',
        flexShrink: 0
      }}>
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          Conversión: D1→Fin: <strong style={{ color: '#38bdf8', fontFamily: "'JetBrains Mono', monospace" }}>{tasas_historicas?.d1_a_graduacion}%</strong> · D2→Fin: <strong style={{ color: '#818cf8', fontFamily: "'JetBrains Mono', monospace" }}>{tasas_historicas?.d2_a_graduacion}%</strong> · D3→Fin: <strong style={{ color: '#3C9D5C', fontFamily: "'JetBrains Mono', monospace" }}>{tasas_historicas?.d3_a_graduacion}%</strong>
        </span>
        {onAbrirDetalle && (
          <button
            onClick={onAbrirDetalle}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#38bdf8',
              cursor: 'pointer',
              fontSize: '0.6rem',
              fontWeight: 600,
              fontFamily: "'Inter', sans-serif",
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              padding: 0,
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            <span>Ver detalle asesores</span>
            <ArrowRight size={10} />
          </button>
        )}
      </div>
    </div>
  );
}
