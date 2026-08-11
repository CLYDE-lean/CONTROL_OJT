import React, { useEffect, useState } from 'react';
import { Layers, Users, CheckCircle2, Award } from 'lucide-react';

export default function MatrizCohortesBurbujasView({ filters = {} }) {
  const [cohortesData, setCohortesData] = useState([]);
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
        if (filters.modalidad) params.append('modalidad', filters.modalidad);

        const res = await fetch(`/api/ojt/matriz-cohortes?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success) {
            setCohortesData(data.cohortes || []);
          }
        }
      } catch (err) {
        console.error('Error cargando cohortes:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, [filters.semana, filters.periodo, filters.campana, filters.formador, filters.modalidad]);

  if (loading) {
    return (
      <div className="executive-card" style={{ gridColumn: 'span 1', padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-tertiary)' }}>⏳ Evaluando desempeño por Cohorte / Grupo...</p>
      </div>
    );
  }

  return (
    <div className="executive-card" style={{ gridColumn: 'span 1' }}>
      <div className="card-header-exec">
        <h2 className="card-title-exec">
          <Layers size={18} style={{ color: '#0d9488' }} />
          Desempeño y Retención por Cohorte (COD_GRUPO)
        </h2>
        <span className="badge-exec badge-green">Comparativa Grupal</span>
      </div>

      <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', marginBottom: '1rem' }}>
        Análisis comparativo por grupo de OJT: Asesores totales, % Retención al Día 5 y egresados a Operación.
      </p>

      {cohortesData.length === 0 ? (
        <div style={{ padding: '1.5rem', textAlign: 'center', background: '#f8fafc', borderRadius: 'var(--radius-md)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Sin cohortes registradas en los filtros seleccionados.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '380px', overflowY: 'auto' }}>
          {cohortesData.slice(0, 10).map((c) => {
            const isTopRetention = c.retencion_dia5_pct >= 60;

            return (
              <div key={c.grupo} style={{
                background: isTopRetention ? 'rgba(13, 148, 136, 0.04)' : '#f8fafc',
                padding: '0.7rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: isTopRetention ? '1px solid rgba(13, 148, 136, 0.25)' : '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <strong style={{ fontSize: '0.82rem', color: 'var(--text-primary)', display: 'block' }}>
                    {c.grupo}
                  </strong>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.15rem' }}>
                    <Users size={12} /> {c.total_asesores} asesores | <CheckCircle2 size={12} color="#0d9488" /> {c.egresados_op} Egresados
                  </span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span className={`badge-exec ${isTopRetention ? 'badge-green' : 'badge-amber'}`} style={{ fontSize: '0.72rem', padding: '0.18rem 0.45rem' }}>
                    {c.retencion_dia5_pct}% Retención
                  </span>
                  <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                    {c.promedio_llamadas} llam/día • {c.promedio_calidad_pct}% Cal
                  </span>
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
        background: 'rgba(13, 148, 136, 0.04)',
        border: '1px solid rgba(13, 148, 136, 0.2)',
        fontSize: '0.75rem',
        color: 'var(--text-secondary)'
      }}>
        🌟 <strong>Cohorte de Alto Desempeño:</strong> {cohortesData[0]?.grupo || 'N/A'} destaca con una retención del {cohortesData[0]?.retencion_dia5_pct || 0}% al Día 5.
      </div>
    </div>
  );
}
