import React from 'react';
import { Info } from 'lucide-react';

const TONOS = {
  positivo: '#0d9488',
  negativo: '#dc2626',
  alerta: '#f59e0b',
  neutro: '#1e6fc0'
};

export default function KpiImpactoCard({ indicador, etiquetaBase = 'iniciaron OJT' }) {
  if (!indicador) return null;

  const color = TONOS[indicador.tono] || TONOS.neutro;
  const pct = Number(indicador.pct) || 0;

  return (
    <div className="kpi-card" style={{ borderLeft: `4px solid ${color}`, padding: '8px 12px', gap: '4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
        <span className="kpi-subtexto" style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
          {indicador.titulo.toUpperCase()}
        </span>
        <span title={indicador.formula} style={{ display: 'flex', cursor: 'help' }}>
          <Info size={13} style={{ color: 'var(--text-tertiary)' }} />
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span className="kpi-valor" style={{ color, fontSize: '1.7rem', lineHeight: 1 }}>
          {Number(indicador.valor).toLocaleString('es-PE')}
        </span>
        <span className="kpi-subtexto" style={{ fontWeight: 600 }}>
          de {Number(indicador.base).toLocaleString('es-PE')} que {etiquetaBase}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1, height: 5, borderRadius: 3, background: 'var(--border-color)', overflow: 'hidden' }}>
          <div style={{ width: `${Math.min(100, pct)}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.5s ease-out' }} />
        </div>
        <span style={{ fontWeight: 800, fontSize: '0.8rem', color }}>{pct}%</span>
      </div>

      <div className="kpi-subtexto">{indicador.detalle}</div>
    </div>
  );
}
