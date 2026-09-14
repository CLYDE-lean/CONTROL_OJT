import React, { useState, useEffect } from 'react';
import { Table, ArrowRight, CheckCircle2, Clock, AlertOctagon, RefreshCw } from 'lucide-react';

/**
 * Componente FlashOjtResumenCard
 * Muestra un resumen ejecutivo compacto en 1 sola fila con las métricas del Cuadro Flash OJT.
 * Incluye un botón para navegar directamente a la pestaña de Operación.
 */
export default function FlashOjtResumenCard({ filters = {}, onNavegarAOperacion }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const cargarResumen = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.semana) params.append('semana', filters.semana);
        if (filters.campana) params.append('campana', filters.campana);
        if (filters.formador) params.append('formador', filters.formador);
        if (filters.grupo) params.append('grupo', filters.grupo);
        if (filters.modalidad) params.append('modalidad', filters.modalidad);

        const res = await fetch(`/api/ojt/flash-ojt?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.success) setData(json);
        }
      } catch (err) {
        console.warn('Error cargando resumen Flash OJT:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    cargarResumen();
    return () => { isMounted = false; };
  }, [filters.semana, filters.campana, filters.formador, filters.grupo, filters.modalidad]);

  const rc = data?.resumen_condicion || {};
  const total = rc.total_evaluados || data?.resumen?.total_asesores || 0;
  const aprobadosPct = total > 0 ? Math.round(((rc.aprobados || 0) / total) * 100) : (data?.resumen?.aprobados_pct || 0);
  const ampliadosPct = total > 0 ? Math.round(((rc.ampliacion || 0) / total) * 100) : (data?.resumen?.ampliados_pct || 0);
  const desaprobadosPct = total > 0 ? Math.round(((rc.desaprobados || 0) / total) * 100) : (data?.resumen?.desaprobados_pct || 0);

  return (
    <div className="executive-card" style={{
      height: '100%',
      flex: '1 1 0',
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0,
      overflow: 'hidden',
      padding: '1rem 1.25rem',
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-card)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Título & Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #1e6fc0, #0284c7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
            boxShadow: '0 2px 8px rgba(30, 111, 192, 0.3)'
          }}>
            <Table size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f1c2e', fontFamily: 'var(--font-heading)', margin: 0 }}>
                Cuadro de Control Flash OJT (Resumen)
              </h3>
              <span className="badge-exec badge-blue" style={{ fontSize: '0.65rem' }}>Ponderado</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: 0 }}>
              Ponderación oficial: KPI1 (30%), KPI2 (30%), KPI3 (40%)
            </p>
          </div>
        </div>

        {/* Cifras de Resumen en Fila */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#7a90ad' }}>
              <RefreshCw size={14} className="spin" /> Cargando Flash OJT...
            </div>
          ) : (
            <>
              <div style={{ textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, color: '#7a90ad', textTransform: 'uppercase' }}>Evaluados</span>
                <strong style={{ fontSize: '1.1rem', color: '#0f1c2e', fontFamily: 'var(--font-heading)' }}>{total.toLocaleString()}</strong>
              </div>

              <div style={{ width: '1px', height: '24px', background: 'var(--border-color)' }} />

              <div style={{ textAlign: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.68rem', fontWeight: 700, color: '#0d9488', textTransform: 'uppercase' }}>
                  <CheckCircle2 size={12} /> Aprobados
                </span>
                <strong style={{ fontSize: '1.1rem', color: '#0d9488', fontFamily: 'var(--font-heading)' }}>{aprobadosPct}%</strong>
              </div>

              <div style={{ width: '1px', height: '24px', background: 'var(--border-color)' }} />

              <div style={{ textAlign: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.68rem', fontWeight: 700, color: '#d97706', textTransform: 'uppercase' }}>
                  <Clock size={12} /> Ampliación
                </span>
                <strong style={{ fontSize: '1.1rem', color: '#d97706', fontFamily: 'var(--font-heading)' }}>{ampliadosPct}%</strong>
              </div>

              <div style={{ width: '1px', height: '24px', background: 'var(--border-color)' }} />

              <div style={{ textAlign: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.68rem', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase' }}>
                  <AlertOctagon size={12} /> Desaprobados
                </span>
                <strong style={{ fontSize: '1.1rem', color: '#dc2626', fontFamily: 'var(--font-heading)' }}>{desaprobadosPct}%</strong>
              </div>
            </>
          )}

          {/* Botón de Navegación con clase .touch-target */}
          {onNavegarAOperacion && (
            <button
              onClick={onNavegarAOperacion}
              className="touch-target"
              style={{
                marginLeft: '0.5rem',
                padding: '0.45rem 0.95rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#1e6fc0',
                background: 'rgba(30, 111, 192, 0.08)',
                border: '1px solid rgba(30, 111, 192, 0.25)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#1e6fc0';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(30, 111, 192, 0.08)';
                e.currentTarget.style.color = '#1e6fc0';
              }}
            >
              Ver detalle en Operación
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
