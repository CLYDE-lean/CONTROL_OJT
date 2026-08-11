import React from 'react';

export default function RadarPerfilExitoSegmento({ data }) {
  const segmentos = [
    { nombre: 'CLARO POSTPAGO', kpi1: 75, kpi2: 78, kpi3: 74, retencion: 85 },
    { nombre: 'CLARO PERÚ GENERAL', kpi1: 65, kpi2: 68, kpi3: 62, retencion: 70 }
  ];

  return (
    <div className="executive-card" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e8edf5', paddingBottom: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f1c2e', fontFamily: 'Outfit, sans-serif' }}>
            Perfil de Éxito por Segmento
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#7a90ad' }}>
            Compara visualmente el perfil de éxito entre segmentos en KPIs vs. Retención
          </p>
        </div>
        <span style={{ fontSize: '0.7rem', background: '#f0fdf4', color: '#166534', padding: '0.25rem 0.6rem', borderRadius: '6px', fontWeight: 700 }}>
          RADAR CHART
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {segmentos.map((s, idx) => (
          <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.85rem' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f1c2e', marginBottom: '0.6rem' }}>{s.nombre}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.75rem' }}>
              <div>KPI 1 (Transf.): <strong style={{ color: '#2563eb' }}>{s.kpi1}%</strong></div>
              <div>KPI 2 (tNPS): <strong style={{ color: '#10b981' }}>{s.kpi2}%</strong></div>
              <div>KPI 3 (Calidad): <strong style={{ color: '#f59e0b' }}>{s.kpi3}%</strong></div>
              <div>Retención OP: <strong style={{ color: '#7c3aed' }}>{s.retencion}%</strong></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
