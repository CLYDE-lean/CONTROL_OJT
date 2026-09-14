import React, { useState } from 'react';
import { BarChart3, ChevronDown, ChevronUp, ShieldAlert, Award, ArrowDownRight } from 'lucide-react';

export default function Embudo5DiasView({ embudoData, onAuditarEnTabla }) {
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

  const d1Item = diasOficiales.find(d => d.dia === 1);
  const d2Item = diasOficiales.find(d => d.dia === 2);
  const caidasD1D2 = (d1Item && d2Item) ? Math.max(0, (d1Item.activos_ojt || 0) - (d2Item.activos || 0)) : 0;

  return (
    <div className="executive-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden', marginBottom: 0, padding: '0.65rem 0.95rem' }}>
      {/* ── Encabezado Principal Directo con Botón Minimalista de Excesos ── */}
      <div className="card-header-exec" style={{ marginBottom: '0.2rem' }}>
        <h2 className="card-title-exec" style={{ fontSize: '0.98rem', fontWeight: 800 }}>
          <BarChart3 size={16} style={{ color: 'var(--accent-primary)' }} />
          Embudo de Retención y Fuga OJT
        </h2>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span className="badge-exec badge-blue" style={{ fontSize: '0.65rem' }}>Máx 8 Días</span>
          {diasHistoricosExceso.length > 0 && (
            <button
              onClick={() => setMostrarExcesosHistoricos(!mostrarExcesosHistoricos)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.18rem 0.5rem',
                fontSize: '0.66rem',
                fontWeight: 700,
                background: mostrarExcesosHistoricos ? '#dc2626' : '#fff1f2',
                color: mostrarExcesosHistoricos ? '#ffffff' : '#dc2626',
                border: '1px solid #fecdd3',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title="Ver / Ocultar gráfico de casos en exceso de permanencia (>8 Días)"
            >
              <ShieldAlert size={12} />
              <span>+{totalCasosExcesos} Excesos (&gt;8D)</span>
              {mostrarExcesosHistoricos ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          )}
        </div>
      </div>

      <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: '0.35rem', margin: 0 }}>
        Ventana oficial de <strong>8 Días (5 días base + máximo 3 extensión)</strong>.
      </p>

      {/* Banner de Alerta Operativa de Desconexión D1->D2 */}
      {caidasD1D2 > 0 && (
        <div style={{
          background: '#fff1f2',
          border: '1px solid #fecdd3',
          borderRadius: '6px',
          padding: '0.3rem 0.6rem',
          marginBottom: '0.35rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.7rem',
          color: '#dc2626'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
            <ShieldAlert size={14} color="#dc2626" />
            <span>Alerta: <strong>{caidasD1D2} asesores con desconexión en Día 2</strong> requieren regularización.</span>
          </div>
          <button
            onClick={onAuditarEnTabla}
            style={{
              fontSize: '0.64rem',
              fontWeight: 700,
              background: '#ffffff',
              color: '#dc2626',
              padding: '2px 8px',
              borderRadius: '4px',
              border: '1px solid #fecdd3',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#dc2626';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.color = '#dc2626';
            }}
          >
            Auditar en Tabla ↓
          </button>
        </div>
      )}

      {/* ── Leyenda Fija Limpia de 3 Estados (Sin Redundancia al Pasar el Mouse) ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        background: '#f8fafc',
        padding: '0.35rem 0.65rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-color)',
        marginBottom: '0.45rem',
        flexWrap: 'wrap',
        fontSize: '0.72rem'
      }}>
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
            <strong style={{ color: 'var(--text-primary)' }}>Cesados / Bajas del Día</strong>
          </div>
        </div>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>💡 Pasa el cursor sobre una barra para ver desglose exacto</span>
      </div>

      {/* ── GRÁFICO PRINCIPAL DE BARRAS APILADAS (STACKED BARS DÍAS 1 AL 8) ── */}
      <div className="embudo-scroll-wrapper" style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', overflow: 'hidden', marginTop: '0.2rem' }}>
        
        {/* Contenedor Superior de Barras con Línea Base Única y Altura Garantizada (145px) */}
        <div className="embudo-grid-cols" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(8, 1fr)', 
          gap: '10px', 
          alignItems: 'flex-end', 
          minHeight: '145px',
          height: '145px',
          paddingTop: '4px',
          borderBottom: '2px solid #e2e8f0',
          position: 'relative'
        }}>
          {diasOficiales.map((item, idx) => {
            const isDia5 = item.dia === 5;
            const isDia2 = item.dia === 2;

            // Datos reales del backend
            const egresadosCount = item.egresados || 0;
            const bajasCount = item.bajas || 0;
            const totalDia = item.activos || 1;
            const activosOjt = item.activos_ojt ?? Math.max(0, totalDia - egresadosCount - bajasCount);

            // Proporciones apiladas de la barra
            const heightPctTotal = Math.max(16, (totalDia / maxActivos) * 100);
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
                {/* Indicador Minimalista de Caída (Sin recuadro) */}
                {caidaPts && parseFloat(caidaPts) > 0 ? (
                  <div style={{
                    fontSize: '0.64rem',
                    color: '#dc2626',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1px',
                    marginBottom: '2px',
                    whiteSpace: 'nowrap'
                  }}>
                    <ArrowDownRight size={10} />
                    −{caidaPts} pts
                  </div>
                ) : (
                  <div style={{ height: '14px' }} />
                )}

                {/* Tooltip Hover visible con z-index 100 dentro del margen */}
                {diaHover === item.dia && (
                  <div style={{
                    position: 'absolute',
                    top: '20px',
                    left: idx === 0 ? '0px' : idx === 7 ? 'auto' : '50%',
                    right: idx === 7 ? '0px' : 'auto',
                    transform: (idx === 0 || idx === 7) ? 'none' : 'translateX(-50%)',
                    background: 'rgba(15, 28, 46, 0.98)',
                    color: '#ffffff',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
                    zIndex: 100,
                    fontSize: '0.72rem',
                    whiteSpace: 'nowrap',
                    lineHeight: 1.4,
                    pointerEvents: 'none',
                    border: '1px solid rgba(255,255,255,0.25)',
                    backdropFilter: 'blur(8px)'
                  }}>
                    <div style={{ fontWeight: 800, color: '#38bdf8', marginBottom: '2px', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '2px' }}>
                      {item.label}
                    </div>
                    <div style={{ color: '#34d399', fontWeight: 700 }}>🟢 Activos OJT: {activosOjt}</div>
                    <div style={{ color: '#60a5fa', fontWeight: 700 }}>🔵 Egresados OP (Día {item.dia}): {egresadosCount}</div>
                    <div style={{ color: '#f87171', fontWeight: 700 }}>🔴 Bajas (Día {item.dia}): {bajasCount}</div>
                    <div style={{ fontSize: '0.66rem', color: '#cbd5e1', marginTop: '3px', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '3px' }}>
                      Sumatoria: {activosOjt} + {egresadosCount} + {bajasCount} = <strong style={{ color: '#ffffff' }}>{totalDia}</strong>
                    </div>
                  </div>
                )}

                {/* Cifra de Asesores & Retención % */}
                <div style={{ fontSize: '0.68rem', textAlign: 'center', marginBottom: '0.25rem', color: isDia2 ? '#1e6fc0' : 'var(--text-secondary)', zIndex: 2 }}>
                  <strong style={{ display: 'block', color: '#0f1c2e', fontSize: '0.88rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>{item.activos}</strong>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: isDia5 ? '#0d9488' : isDia2 ? '#1e6fc0' : '#64748b' }}>{item.retencion_pct}%</span>
                </div>

                {/* Barra Apilada (Stacked Bar Vertical con porcentaje real) */}
                <div style={{
                  width: '100%',
                  maxWidth: '54px',
                  height: `${heightPctTotal}%`,
                  borderRadius: '6px 6px 0 0',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: isDia2 ? '0 0 10px rgba(30,111,192,0.25)' : isDia5 ? '0 0 12px rgba(13,148,136,0.3)' : '0 2px 6px rgba(0,0,0,0.06)',
                  border: isDia5 ? '1.5px solid #0d9488' : '1px solid rgba(0,0,0,0.08)',
                  borderBottom: 'none'
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
              </div>
            );
          })}
        </div>

        {/* Eje de Etiquetas Minimalista Inferior (Fuera del contenedor de barras, totalmente plano) */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(8, 1fr)', 
          gap: '10px', 
          paddingTop: '0.35rem',
          paddingBottom: '0.15rem'
        }}>
          {diasOficiales.map((item) => {
            const isDia5 = item.dia === 5;
            const isDia2 = item.dia === 2;
            const isDia8 = item.dia === 8;

            let colorPrincipal = '#475569';
            let colorSub = '#7a90ad';
            let labelText = item.label;
            let subText = null;

            if (item.dia === 1) {
              labelText = 'DÍA 1';
              subText = 'Ingreso Total';
            } else if (isDia2) {
              colorPrincipal = '#1e6fc0';
              colorSub = '#d97706';
              labelText = 'DÍA 2';
              subText = 'Día Clave';
            } else if (item.dia === 3) {
              labelText = 'DÍA 3';
            } else if (item.dia === 4) {
              labelText = 'DÍA 4';
            } else if (isDia5) {
              colorPrincipal = '#0d9488';
              colorSub = '#0d9488';
              labelText = 'DÍA 5';
              subText = 'Base Aprobación';
            } else if (item.dia === 6) {
              labelText = 'DÍA 6';
              subText = '+1 Ext';
            } else if (item.dia === 7) {
              labelText = 'DÍA 7';
              subText = '+2 Ext';
            } else if (isDia8) {
              colorPrincipal = '#dc2626';
              colorSub = '#dc2626';
              labelText = 'DÍA 8';
              subText = 'Límite Máx';
            }

            return (
              <div key={`label-${item.dia}`} style={{ textAlign: 'center', lineHeight: 1.2 }}>
                <span style={{ 
                  fontSize: '0.72rem', 
                  fontWeight: (isDia2 || isDia5 || isDia8) ? 800 : 700, 
                  color: colorPrincipal,
                  display: 'block'
                }}>
                  {labelText}
                </span>
                {subText && (
                  <span style={{ 
                    fontSize: '0.61rem', 
                    fontWeight: 600, 
                    color: colorSub,
                    display: 'block',
                    marginTop: '1px'
                  }}>
                    {subText}
                  </span>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* SECCIÓN DESPLEGABLE PARA EXCESOS HISTÓRICOS (>8 DÍAS) (Activada desde el botón minimalista del header) */}
      {diasHistoricosExceso.length > 0 && mostrarExcesosHistoricos && (
        <div style={{ marginTop: '0.4rem' }}>
          <div style={{
            padding: '0.75rem 0.85rem',
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
        </div>
      )}
    </div>
  );
}
