import React from 'react';
import { TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';

export default function RoiExtensionesView({ roiData }) {
  if (!roiData || !roiData.metricas) return null;

  const { metricas, evaluacion } = roiData;
  const isPositivo = metricas.tasa_exito_extension_pct >= 60;

  return (
    <div className="executive-card">
      <div className="card-header-exec">
        <h2 className="card-title-exec">
          <TrendingUp size={18} style={{ color: 'var(--accent-primary)' }} />
          ROI de Extensiones OJT
        </h2>
        <span className={`badge-exec ${isPositivo ? 'badge-green' : 'badge-red'}`}>
          {isPositivo ? 'Extensiones Rentables' : metricas.tasa_exito_extension_pct >= 40 ? 'Rendimiento Moderado' : 'Extensiones Deficitarias'}
        </span>
      </div>

      <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', marginBottom: '1.25rem' }}>
        Evaluación financiera y operativa. Mide si otorgar días adicionales genera la conversión esperada.
      </p>

      <div className="roi-grid">
        <div className="roi-tile">
          <div className="roi-tile-label">Enviados a Extensión</div>
          <div className="roi-tile-num">{metricas.total_enviados_extension}</div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Con al menos 1 extensión concedida</span>
        </div>

        <div className="roi-tile">
          <div className="roi-tile-label">Egresados Reales</div>
          <div className="roi-tile-num" style={{ color: '#34d399' }}>{metricas.egresados_post_extension}</div>
          <span style={{ fontSize: '0.7rem', color: 'var(--accent-success)' }}>Conversión efectiva</span>
        </div>

        <div className="roi-tile">
          <div className="roi-tile-label">Caídos en Extensión</div>
          <div className="roi-tile-num" style={{ color: '#f87171' }}>{metricas.caidos_post_extension}</div>
          <span style={{ fontSize: '0.7rem', color: 'var(--accent-danger)' }}>Inversión sin retorno</span>
        </div>
      </div>

      {/* Conversion Bar */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
          <span>Tasa de Conversión de Extensiones</span>
          <strong style={{ color: isPositivo ? '#34d399' : '#f87171' }}>
            {metricas.tasa_exito_extension_pct}%
          </strong>
        </div>
        <div className="funnel-bar-container" style={{ height: '10px' }}>
          <div 
            className="funnel-bar-fill" 
            style={{ 
              width: `${metricas.tasa_exito_extension_pct}%`,
              background: isPositivo ? 'var(--accent-success)' : 'var(--accent-danger)'
            }}
          />
        </div>
      </div>

      {evaluacion && (
        <div style={{
          padding: '0.85rem 1.1rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-color)',
          fontSize: '0.8rem'
        }}>
          <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.2rem' }}>
            Evaluación de la Política de Extensiones:
          </strong>
          <span style={{ color: 'var(--text-tertiary)', lineHeight: '1.4' }}>
            {evaluacion.regla_negocio}
          </span>
        </div>
      )}
    </div>
  );
}
