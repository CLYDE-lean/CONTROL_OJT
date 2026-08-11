import React from 'react';
import { BarChart2 } from 'lucide-react';

export default function EstadoFinalGrupoFormador({ data }) {
  const asesores = data?.matriz?.asesores || [];

  // Agrupar por COD_GRUPO y FORMADOR
  const gruposMap = new Map();
  asesores.forEach(a => {
    const key = a.grupo || 'GPE-2026001';
    if (!gruposMap.has(key)) {
      gruposMap.set(key, { grupo: key, formador: a.formador || 'FORMADOR', activos: 0, en_capa: 0, bajas: 0, total: 0 });
    }
    const g = gruposMap.get(key);
    g.total++;
    if (a.es_baja === 1) g.bajas++;
    else if (a.es_iop === 1) g.activos++;
    else g.en_capa++;
  });

  const gruposList = Array.from(gruposMap.values()).slice(0, 5);

  return (
    <div className="executive-card" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e8edf5', paddingBottom: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f1c2e', fontFamily: 'Outfit, sans-serif' }}>
            Estado Final por Grupo y Formador
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#7a90ad' }}>
            Permite al formador ver rápidamente qué grupos tuvieron mayor éxito de retención
          </p>
        </div>
        <span style={{ fontSize: '0.7rem', background: '#f0fdf4', color: '#166534', padding: '0.25rem 0.6rem', borderRadius: '6px', fontWeight: 700 }}>
          STACKED BAR
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {gruposList.map((g, idx) => {
          const pctActivos = g.total > 0 ? Math.round((g.activos / g.total) * 100) : 0;
          const pctCapa = g.total > 0 ? Math.round((g.en_capa / g.total) * 100) : 0;
          const pctBajas = g.total > 0 ? Math.round((g.bajas / g.total) * 100) : 0;

          return (
            <div key={idx}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                <span style={{ color: '#0f1c2e' }}>{g.grupo} <span style={{ color: '#64748b', fontWeight: 500 }}>({g.formador})</span></span>
                <span style={{ color: '#64748b' }}>{g.total} asesores</span>
              </div>
              <div style={{ height: '14px', borderRadius: '6px', background: '#f1f5f9', display: 'flex', overflow: 'hidden' }}>
                <div style={{ width: `${pctActivos}%`, background: '#10b981' }} title={`Activos: ${g.activos}`} />
                <div style={{ width: `${pctCapa}%`, background: '#f59e0b' }} title={`En capa/OJT: ${g.en_capa}`} />
                <div style={{ width: `${pctBajas}%`, background: '#ef4444' }} title={`Bajas: ${g.bajas}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Leyenda */}
      <div style={{ display: 'flex', gap: '1.25rem', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9', fontSize: '0.73rem', fontWeight: 600 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#166534' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#10b981' }} />
          Egresados a OP (Activos)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#92400e' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#f59e0b' }} />
          En Capa / OJT
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#991b1b' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#ef4444' }} />
          Bajas
        </div>
      </div>
    </div>
  );
}
