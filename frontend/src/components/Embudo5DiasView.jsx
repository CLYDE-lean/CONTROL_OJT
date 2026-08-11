import React, { useState } from 'react';
import { BarChart3, ChevronDown, ChevronUp, ShieldAlert, Award, ArrowDownRight } from 'lucide-react';

export default function Embudo5DiasView({ embudoData }) {
  const [mostrarExcesosHistoricos, setMostrarExcesosHistoricos] = useState(false);
  const [diaHover, setDiaHover] = useState(null);

  if (!embudoData) return null;

  const { 
    dias_principales_1_8, 
    dias_restantes_9_plus, 
    max_dia_detectado, 
    analisis,
    total_asesores_unicos
  } = embudoData;

  const diasOficiales = dias_principales_1_8 || embudoData.funnel?.slice(0, 8) || [];
  const diasHistoricosExceso = dias_restantes_9_plus || embudoData.funnel?.slice(8) || [];
  const maxActivos = (diasOficiales[0]?.activos) || total_asesores_unicos || 1;

  // Calcular total de casos fuera de regla (>8 días)
  const totalCasosExcesos = diasHistoricosExceso.reduce((acc, curr) => acc + (curr.activos || 0), 0);

  return (
    <div className="executive-card" style={{ gridColumn: 'span 2' }}>
      {/* ── Encabezado Principal Directo ── */}
      <div className="card-header-exec" style={{ marginBottom: '0.4rem' }}>
        <h2 className="card-title-exec" style={{ fontSize: '1.1rem', fontWeight: 800 }}>
          <BarChart3 size={18} style={{ color: 'var(--accent-primary)' }} />
          Embudo de Progresión OJT
        </h2>
        <span className="badge-exec badge-blue">Nueva Política • Máx 8 Días</span>
      </div>

      <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginBottom: '0.9rem' }}>
        Ventana oficial de <strong>8 Días (5 días base + máximo 3 días de extensión autorizada)</strong>.
      </p>

      {/* ── Leyenda Fija de 3 Estados Superior con Banner Interactivo de Hover ── */}
      {(() => {
        const diaHoverItem = diaHover ? diasOficiales.find(d => d.dia === diaHover) : null;
        const hActivos = diaHoverItem ? (diaHoverItem.activos_ojt ?? (diaHoverItem.activos - (diaHoverItem.bajas || 0) - (diaHoverItem.egresados || 0))) : 0;
        const hEgresados = diaHoverItem?.egresados || 0;
        const hBajas = diaHoverItem?.bajas || 0;
        const hTotal = diaHoverItem?.activos || 0;

        return (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.25rem',
            background: diaHoverItem ? 'linear-gradient(135deg, #eff6ff 0%, #e0f2fe 100%)' : '#f8fafc',
            padding: '0.6rem 0.9rem',
            borderRadius: 'var(--radius-md)',
            border: `1px solid ${diaHoverItem ? '#93c5fd' : 'var(--border-color)'}`,
            marginBottom: '1rem',
            flexWrap: 'wrap',
            fontSize: '0.78rem',
            transition: 'all 0.2s ease'
          }}>
            {diaHoverItem ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap', width: '100%' }}>
                <strong style={{ color: '#1e6fc0', fontSize: '0.82rem' }}>📊 {diaHoverItem.label}:</strong>
                <span style={{ color: '#0d9488', fontWeight: 700 }}>🟢 Activos OJT: <strong>{hActivos}</strong></span>
                <span style={{ color: '#1e6fc0', fontWeight: 700 }}>🔵 Egresados OP: <strong>{hEgresados}</strong></span>
                <span style={{ color: '#dc2626', fontWeight: 700 }}>🔴 Cesados/Bajas: <strong>{hBajas}</strong></span>
                <span style={{ color: '#475569', marginLeft: 'auto', fontWeight: 700 }}>Total Evaluados: <strong>{hTotal}</strong> ({diaHoverItem.retencion_pct}%)</span>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#0d9488' }} />
                    <strong style={{ color: 'var(--text-primary)' }}>Activos en OJT</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#1e6fc0' }} />
                    <strong style={{ color: 'var(--text-primary)' }}>Egresados a Operación (I-OP)</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
                    <strong style={{ color: 'var(--text-primary)' }}>Cesados / Bajas</strong>
                  </div>
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>💡 Pasa el cursor o toca cada barra para ver desglose</span>
              </>
            )}
          </div>
        );
      })()}

      {/* ── GRÁFICO PRINCIPAL DE BARRAS APILADAS (STACKED BARS DÍAS 1 AL 8) ── */}
      <div className="embudo-scroll-wrapper">
        <div className="embudo-grid-cols">
          {diasOficiales.map((item, idx) => {
            const isDia5 = item.dia === 5;
            const isDia2 = item.dia === 2;
            const isDia8 = item.dia === 8;

            // Datos reales del backend
            const activosOjt = item.activos_ojt ?? (item.activos - (item.bajas || 0) - (item.egresados || 0));
            const egresadosCount = item.egresados || 0;
            const bajasCount = item.bajas || 0;
            const totalDia = item.activos || 1;

            // Proporciones apiladas de la barra
            const heightPctTotal = Math.max(12, (totalDia / maxActivos) * 100);
            const ojtPct = totalDia > 0 ? (activosOjt / totalDia) * 100 : 0;
            const egresadosBarPct = totalDia > 0 ? (egresadosCount / totalDia) * 100 : 0;
            const bajasBarPct = totalDia > 0 ? (bajasCount / totalDia) * 100 : 0;

            // Caída de retención con respecto al día anterior
            const diaAnterior = idx > 0 ? diasOficiales[idx - 1] : null;
            const caidaPts = diaAnterior ? (diaAnterior.retencion_pct - item.retencion_pct).toFixed(1) : null;

            return (
              <div 
                key={item.dia} 
                onMouseEnter={() => setDiaHover(item.dia)}
                onMouseLeave={() => setDiaHover(null)}
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  height: '100%', 
                  justifyContent: 'flex-end',
                  position: 'relative',
                  cursor: 'pointer'
                }}
              >
                {/* Badge de Caída Día a Día (Step Drop) */}
                {caidaPts && parseFloat(caidaPts) > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '4px',
                    fontSize: '0.62rem',
                    color: '#ef4444',
                    background: '#fff1f2',
                    border: '1px solid #fecdd3',
                    borderRadius: '8px',
                    padding: '1px 4px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1px',
                    zIndex: 5
                  }}>
                    <ArrowDownRight size={10} />
                    −{caidaPts} pts
                  </div>
                )}

                {/* Tooltip Hover visible con z-index 100 dentro del margen */}
                {diaHover === item.dia && (
                  <div style={{
                    position: 'absolute',
                    top: '-32px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(15, 28, 46, 0.96)',
                    color: '#ffffff',
                    padding: '0.45rem 0.65rem',
                    borderRadius: '8px',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
                    zIndex: 100,
                    fontSize: '0.68rem',
                    whiteSpace: 'nowrap',
                    lineHeight: 1.35,
                    pointerEvents: 'none',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}>
                    <div style={{ fontWeight: 800, color: '#38bdf8' }}>{item.label}</div>
                    <div style={{ color: '#34d399' }}>🟢 Activos: <strong>{activosOjt}</strong></div>
                    <div style={{ color: '#60a5fa' }}>🔵 Egresados: <strong>{egresadosCount}</strong></div>
                    <div style={{ color: '#f87171' }}>🔴 Bajas: <strong>{bajasCount}</strong></div>
                  </div>
                )}

                {/* Cifra de Asesores & Retención % */}
                <div style={{ fontSize: '0.72rem', textAlign: 'center', marginBottom: '0.35rem', color: isDia2 ? '#1e6fc0' : 'var(--text-secondary)' }}>
                  <strong style={{ display: 'block', color: 'var(--text-primary)', fontSize: '0.88rem' }}>{item.activos}</strong>
                  <span>{item.retencion_pct}%</span>
                </div>

                {/* Barra Apilada (Stacked Bar Vertical) */}
                <div style={{
                  width: '100%',
                  maxWidth: '42px',
                  height: `${heightPctTotal * 0.7}px`,
                  maxHeight: '75px',
                  minHeight: '14px',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: isDia2 ? '0 0 8px rgba(30,111,192,0.25)' : isDia5 ? '0 0 10px rgba(13,148,136,0.3)' : undefined,
                  border: isDia5 ? '1.5px solid #0d9488' : '1px solid rgba(0,0,0,0.08)'
                }}>
                  {/* Segmento Verde (Activos en OJT) */}
                  {ojtPct > 0 && (
                    <div style={{
                      height: `${ojtPct}%`,
                      background: '#0d9488',
                      transition: 'height 0.3s ease'
                    }} title={`Activos OJT: ${activosOjt}`} />
                  )}

                  {/* Segmento Azul (Egresados a Operación) */}
                  {egresadosBarPct > 0 && (
                    <div style={{
                      height: `${egresadosBarPct}%`,
                      background: '#1e6fc0',
                      transition: 'height 0.3s ease'
                    }} title={`Egresados I-OP: ${egresadosCount}`} />
                  )}

                  {/* Segmento Rojo (Cesados / Bajas) */}
                  {bajasBarPct > 0 && (
                    <div style={{
                      height: `${bajasBarPct}%`,
                      background: '#ef4444',
                      transition: 'height 0.3s ease'
                    }} title={`Bajas: ${bajasCount}`} />
                  )}
                </div>

                {/* Etiqueta Inferior con Hito Destacado Día 5 */}
                <div style={{ marginTop: '0.55rem', textAlign: 'center' }}>
                  <span className={`badge-exec ${isDia8 ? 'badge-red' : isDia5 ? 'badge-green' : isDia2 ? 'badge-amber' : 'badge-neutral'}`} style={{ fontSize: '0.67rem', padding: '0.18rem 0.4rem', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    {isDia5 && <Award size={12} style={{ color: '#0d9488' }} />}
                    {item.label}
                  </span>
                  {isDia2 && <span style={{ display: 'block', fontSize: '0.62rem', color: '#d97706', fontWeight: 700, marginTop: '2px' }}>Día Clave</span>}
                  {isDia5 && <span style={{ display: 'block', fontSize: '0.62rem', color: '#0d9488', fontWeight: 800, marginTop: '2px' }}>⭐ Base Aprobación</span>}
                  {isDia8 && <span style={{ display: 'block', fontSize: '0.62rem', color: '#dc2626', fontWeight: 700, marginTop: '2px' }}>Límite Máx</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BOTÓN Y SECCIÓN DESPLEGABLE PARA EXCESOS HISTÓRICOS CON CONTADOR EN VIVO */}
      {diasHistoricosExceso.length > 0 && (
        <div style={{ marginTop: '1.1rem' }}>
          <button 
            onClick={() => setMostrarExcesosHistoricos(!mostrarExcesosHistoricos)}
            className="btn-exec touch-target"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.65rem',
              background: 'rgba(239, 68, 68, 0.05)',
              border: '1px dashed rgba(239, 68, 68, 0.4)',
              color: '#dc2626',
              fontWeight: 700,
              fontSize: '0.8rem'
            }}
          >
            <ShieldAlert size={16} />
            <span>
              {mostrarExcesosHistoricos 
                ? 'Ocultar Gráfico de Excesos Históricos' 
                : `Ver Gráfico de Registros Anteriores (>8 Días hasta el Día ${max_dia_detectado}+) [ +${totalCasosExcesos} casos fuera de regla ]`}
            </span>
            {mostrarExcesosHistoricos ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {/* SEGUNDO GRÁFICO DE BARRAS HORIZONTAL PARA REGISTROS ANTERIORES (>8 DÍAS) */}
          {mostrarExcesosHistoricos && (
            <div style={{
              marginTop: '0.85rem',
              padding: '1.25rem 1rem',
              background: 'rgba(239, 68, 68, 0.03)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)'
            }}>
              <div style={{ fontSize: '0.8rem', color: '#dc2626', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldAlert size={14} />
                <span>Gráfico Histórico de Excesos de Permanencia (Violación de la Política de 8 Días)</span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.max(diasHistoricosExceso.length, 3)}, 1fr)`,
                gap: '0.75rem',
                alignItems: 'end',
                minHeight: '140px'
              }}>
                {diasHistoricosExceso.map((item) => {
                  const heightPct = Math.max(12, (item.activos / maxActivos) * 100);

                  return (
                    <div key={item.dia} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                      <div style={{ fontSize: '0.72rem', textAlign: 'center', marginBottom: '0.3rem', color: '#dc2626' }}>
                        <strong style={{ display: 'block', color: 'var(--text-primary)', fontSize: '0.85rem' }}>{item.activos}</strong>
                        <span>{item.retencion_pct}%</span>
                      </div>

                      <div style={{
                        width: '100%',
                        maxWidth: '42px',
                        height: `${heightPct * 0.7}px`,
                        maxHeight: '70px',
                        minHeight: '14px',
                        borderRadius: '4px',
                        background: 'rgba(239, 68, 68, 0.85)',
                        border: '1px solid #ef4444'
                      }} />

                      <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
                        <span className="badge-exec badge-red" style={{ fontSize: '0.65rem', padding: '0.15rem 0.35rem' }}>
                          Día {item.dia} (Exceso)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {analisis && (
        <div style={{
          marginTop: '1rem',
          padding: '0.65rem 0.85rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-color)',
          fontSize: '0.75rem',
          color: 'var(--text-tertiary)'
        }}>
          <strong style={{ color: 'var(--text-primary)' }}>Política de Operación: </strong>
          {analisis.diagnostico}. {analisis.recomendacion}
        </div>
      )}
    </div>
  );
}
