import React, { useEffect, useState } from 'react';
import { ShieldAlert, AlertTriangle, PieChart } from 'lucide-react';

export default function HeatmapBajasView({ filters = {} }) {
  const [bajasData, setBajasData] = useState(null);
  const [loading, setLoading] = useState(true);

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

        const res = await fetch(`/api/ojt/heatmap-bajas?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success) {
            setBajasData(data);
          }
        }
      } catch (err) {
        console.error('Error cargando heatmap de bajas:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, [filters.semana, filters.periodo, filters.campana, filters.formador, filters.grupo, filters.modalidad, filters.segmento, filters.estado]);

  if (loading) {
    return (
      <div className="executive-card" style={{ gridColumn: 'span 1', padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-tertiary)' }}>⏳ Analizando motivos de baja...</p>
      </div>
    );
  }

  const motivos = bajasData?.motivos || [];
  const totalBajas = bajasData?.total_bajas_evaluadas || 0;

  return (
    <div className="executive-card" style={{ gridColumn: 'span 1' }}>
      <div className="card-header-exec">
        <h2 className="card-title-exec">
          <ShieldAlert size={18} style={{ color: '#ef4444' }} />
          Análisis de Atrición & Motivos de Baja
        </h2>
        <span className="badge-exec badge-red">Deserción Pre-Operativa</span>
      </div>

      <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', marginBottom: '1rem' }}>
        Distribución de causas de salida detectadas en la base de datos (Total Bajas Evaluadas: <strong>{totalBajas}</strong>).
      </p>

      {motivos.length === 0 ? (
        <div style={{ padding: '1.5rem', textAlign: 'center', background: '#f8fafc', borderRadius: 'var(--radius-md)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            🎉 No se registraron bajas en los filtros seleccionados. Tasa de retención óptima.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {motivos.slice(0, 7).map((item, idx) => {
            const isTop = idx === 0;
            const barWidth = Math.max(8, item.porcentaje);

            return (
              <div key={item.motivo} style={{
                background: isTop ? 'rgba(239, 68, 68, 0.04)' : '#f8fafc',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: isTop ? '1px solid rgba(239, 68, 68, 0.25)' : '1px solid var(--border-color)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', fontSize: '0.78rem' }}>
                  <strong style={{ color: isTop ? '#dc2626' : 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    {isTop && <AlertTriangle size={14} color="#dc2626" />}
                    {item.motivo}
                  </strong>
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {item.total_bajas} ({item.porcentaje}%)
                  </span>
                </div>

                <div style={{
                  height: '6px',
                  width: '100%',
                  background: 'rgba(0,0,0,0.06)',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${barWidth}%`,
                    background: isTop ? 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)' : '#f97316',
                    borderRadius: '3px',
                    transition: 'width 0.4s ease'
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{
        marginTop: '1rem',
        padding: '0.65rem 0.85rem',
        borderRadius: 'var(--radius-md)',
        background: 'rgba(239, 68, 68, 0.03)',
        border: '1px solid rgba(239, 68, 68, 0.15)',
        fontSize: '0.75rem',
        color: 'var(--text-tertiary)'
      }}>
        🛡️ <strong>Alerta Operativa:</strong> La causa principal de baja ({motivos[0]?.motivo || 'N/A'}) representa el {motivos[0]?.porcentaje || 0}% de la fuga en este filtro.
      </div>
    </div>
  );
}
