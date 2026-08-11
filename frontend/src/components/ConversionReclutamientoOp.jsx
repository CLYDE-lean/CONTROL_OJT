import React from 'react';

export default function ConversionReclutamientoOp({ data }) {
  const fuentes = [
    { fuente: 'APTO / Referidos', total: 420, egresados: 165, retencion: 39.2, color: '#2563eb' },
    { fuente: 'Portal Web', total: 310, egresados: 78, retencion: 25.1, color: '#0d9488' },
    { fuente: 'Bolsa Trabajo', total: 145, egresados: 22, retencion: 15.1, color: '#d97706' },
    { fuente: 'Redes Sociales', total: 70, egresados: 5, retencion: 7.1, color: '#dc2626' }
  ];

  return (
    <div className="executive-card" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e8edf5', paddingBottom: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f1c2e', fontFamily: 'Outfit, sans-serif' }}>
            Conversión de Reclutamiento a Operación
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#7a90ad' }}>
            Muestra la efectividad de cada canal de reclutamiento (ej. de 100 referidos ingresados, ~39 logran graduarse e ingresar a Operaciones)
          </p>
        </div>
        <span style={{ fontSize: '0.7rem', background: '#eff6ff', color: '#1d4ed8', padding: '0.25rem 0.6rem', borderRadius: '6px', fontWeight: 700 }}>
          WATERFALL CHART
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {fuentes.map((f, idx) => (
          <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.85rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>{f.fuente}</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: f.color }}>{f.retencion}%</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>
              {f.egresados} de {f.total} en OP
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
