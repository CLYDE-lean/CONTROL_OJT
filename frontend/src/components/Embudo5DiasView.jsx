import React, { useState } from 'react';
import { BarChart3, ChevronDown, ChevronUp, ShieldAlert } from 'lucide-react';

export default function Embudo5DiasView({ embudoData }) {
  const [mostrarExcesosHistoricos, setMostrarExcesosHistoricos] = useState(false);

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

  return (
    <div className="executive-card" style={{ gridColumn: 'span 2' }}>
      <div className="card-header-exec">
        <h2 className="card-title-exec">
          <BarChart3 size={18} style={{ color: 'var(--accent-primary)' }} />
          1. Gráfico de Conversión (Ventana Oficial Días 1 al 8: 5 Base + 3 Extensión Máxima)
        </h2>
        <span className="badge-exec badge-blue">Nueva Política • Máx 8 Días</span>
      </div>

      <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', marginBottom: '1.25rem' }}>
        Visualización de la ventana oficial de <strong>8 Días (5 días base + máximo 3 días de extensión autorizada)</strong>. Despliega la sección inferior para examinar el gráfico de excesos históricos (Días 9 al 26+).
      </p>

      {/* GRÁFICO PRINCIPAL HORIZONTAL (DÍAS 1 AL 8) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(8, 1fr)',
        gap: '0.75rem',
        alignItems: 'end',
        background: '#f7f9fc',
        padding: '1.25rem 1rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-color)',
        minHeight: '220px'
      }}>
        {diasOficiales.map((item) => {
          const heightPct = Math.max(10, (item.activos / maxActivos) * 100);
          const isDia5 = item.dia === 5;
          const isDia2 = item.dia === 2;
          const isDia8 = item.dia === 8;

          return (
            <div key={item.dia} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
              {/* Cifra de Asesores & Retención % */}
              <div style={{ fontSize: '0.72rem', textAlign: 'center', marginBottom: '0.4rem', color: isDia2 ? '#1e6fc0' : 'var(--text-secondary)' }}>
                <strong style={{ display: 'block', color: 'var(--text-primary)', fontSize: '0.88rem' }}>{item.activos}</strong>
                <span>{item.retencion_pct}%</span>
              </div>

              {/* Barra Vertical del Gráfico Principal */}
              <div style={{
                width: '100%',
                maxWidth: '46px',
                height: `${heightPct * 1.35}px`,
                maxHeight: '140px',
                minHeight: '16px',
                borderRadius: '6px 6px 2px 2px',
                background: isDia8 ? '#ef4444' : isDia5 ? '#0d9488' : isDia2 ? '#1e6fc0' : '#b0c4de',
                transition: 'height 0.3s ease',
                boxShadow: isDia2 ? '0 0 12px rgba(30,111,192,0.25)' : isDia8 ? '0 0 12px rgba(239,68,68,0.2)' : undefined
              }} />

              {/* Etiqueta Inferior */}
              <div style={{ marginTop: '0.6rem', textAlign: 'center' }}>
                <span className={`badge-exec ${isDia8 ? 'badge-red' : isDia5 ? 'badge-green' : isDia2 ? 'badge-amber' : 'badge-neutral'}`} style={{ fontSize: '0.68rem', padding: '0.18rem 0.4rem' }}>
                  {item.label}
                </span>
                {isDia2 && <span style={{ display: 'block', fontSize: '0.62rem', color: '#fbbf24', fontWeight: 600, marginTop: '2px' }}>Día Clave</span>}
                {isDia8 && <span style={{ display: 'block', fontSize: '0.62rem', color: '#f87171', fontWeight: 600, marginTop: '2px' }}>Límite Máx</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* BOTÓN Y SECCIÓN DESPLEGABLE PARA EXCESOS HISTÓRICOS (DÍAS 9 AL 26+) EN FORMA DE GRÁFICO */}
      {diasHistoricosExceso.length > 0 && (
        <div style={{ marginTop: '1.25rem' }}>
          <button 
            onClick={() => setMostrarExcesosHistoricos(!mostrarExcesosHistoricos)}
            className="btn-exec"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.7rem',
              background: 'rgba(239, 68, 68, 0.05)',
              border: '1px dashed rgba(239, 68, 68, 0.4)',
              color: '#f87171',
              fontWeight: 600,
              fontSize: '0.82rem'
            }}
          >
            <ShieldAlert size={16} />
            <span>
              {mostrarExcesosHistoricos ? 'Ocultar Gráfico de Excesos Históricos' : `Ver Gráfico de Registros Anteriores (>8 Días hasta el Día ${max_dia_detectado}+)`}
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
              <div style={{ fontSize: '0.8rem', color: '#f87171', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldAlert size={14} />
                <span>Gráfico Histórico de Excesos de Permanencia (Violación de la Política de 8 Días)</span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.max(diasHistoricosExceso.length, 3)}, 1fr)`,
                gap: '0.75rem',
                alignItems: 'end',
                minHeight: '180px'
              }}>
                {diasHistoricosExceso.map((item) => {
                  const heightPct = Math.max(12, (item.activos / maxActivos) * 100);

                  return (
                    <div key={item.dia} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                      <div style={{ fontSize: '0.72rem', textAlign: 'center', marginBottom: '0.3rem', color: '#f87171' }}>
                        <strong style={{ display: 'block', color: 'white', fontSize: '0.85rem' }}>{item.activos}</strong>
                        <span>{item.retencion_pct}%</span>
                      </div>

                      <div style={{
                        width: '100%',
                        maxWidth: '42px',
                        height: `${heightPct * 1.35}px`,
                        maxHeight: '120px',
                        minHeight: '16px',
                        borderRadius: '6px 6px 2px 2px',
                        background: 'rgba(239, 68, 68, 0.8)',
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
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-color)',
          fontSize: '0.78rem',
          color: 'var(--text-tertiary)'
        }}>
          <strong style={{ color: 'var(--text-primary)' }}>Política de Operación: </strong>
          {analisis.diagnostico}. {analisis.recomendacion}
        </div>
      )}
    </div>
  );
}
