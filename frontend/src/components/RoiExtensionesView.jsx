import React from 'react';
import { TrendingUp } from 'lucide-react';

function soles(n) {
  return `S/ ${Math.round(Number(n) || 0).toLocaleString('es-PE')}`;
}

export default function RoiExtensionesView({ roiData, compactHero = false }) {
  if (!roiData || !roiData.metricas) return null;

  const { metricas, evaluacion, desagregado } = roiData;
  const isPositivo = metricas.tasa_exito_extension_pct >= 60;
  const formadores = desagregado?.formadores || [];
  const campanas = desagregado?.campanas || [];
  const porDia = desagregado?.por_dia_ext || [];

  return (
    <div className="executive-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden', marginBottom: 0, padding: '1rem 1.25rem' }}>
      <div className="card-header-exec">
        <h2 className="card-title-exec">
          <TrendingUp size={18} style={{ color: 'var(--accent-primary)' }} />
          Dónde se pierde la extensión
        </h2>
        <span className={`badge-exec ${isPositivo ? 'badge-green' : 'badge-red'}`}>
          {isPositivo ? 'Política rentable' : 'Revisar corte'}
        </span>
      </div>

      <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: '0.85rem' }}>
        Pregunta de negocio: ¿el 3.er día extra convierte o solo suma costo? Cada fila es el día en que cortó el ciclo (I-OP, baja o último registro).
      </p>

      {porDia.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.55rem',
          marginBottom: '0.9rem'
        }}>
          {porDia.map((d) => (
            <div key={d.dias_ext} className="roi-tile" style={{ textAlign: 'left', padding: '0.7rem' }}>
              <div className="roi-tile-label">{d.etiqueta}</div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.2rem 0' }}>
                {d.conversion_pct}% conv.
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', lineHeight: 1.35 }}>
                {d.convertidos} I-OP · {d.fallidos} bajas
                {d.en_curso ? ` · ${d.en_curso} en curso` : ''}
              </div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: d.soles_ext > 0 ? '#dc2626' : 'var(--text-tertiary)', marginTop: '0.25rem' }}>
                {soles(d.soles_ext)} hundido
              </div>
            </div>
          ))}
        </div>
      )}

      {!compactHero && (
        <div className="roi-grid">
          <div className="roi-tile">
            <div className="roi-tile-label">Con extensión</div>
            <div className="roi-tile-num">{metricas.total_enviados_extension}</div>
          </div>
          <div className="roi-tile">
            <div className="roi-tile-label">Convirtieron</div>
            <div className="roi-tile-num" style={{ color: '#34d399' }}>{metricas.egresados_post_extension}</div>
          </div>
          <div className="roi-tile">
            <div className="roi-tile-label">Baja post-extensión</div>
            <div className="roi-tile-num" style={{ color: '#f87171' }}>{metricas.caidos_post_extension}</div>
          </div>
        </div>
      )}

      {(formadores.length > 0 || campanas.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', minHeight: 0, overflow: 'auto', flex: 1, marginBottom: '0.75rem' }}>
          <MiniRank title="Pérdida por formador" rows={formadores} />
          <MiniRank title="Pérdida por campaña" rows={campanas} />
        </div>
      )}

      {evaluacion && (
        <div style={{
          padding: '0.7rem 0.9rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-card-subtle)',
          border: '1px solid var(--border-color)',
          fontSize: '0.78rem',
          flexShrink: 0
        }}>
          <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.15rem' }}>
            Lectura
          </strong>
          <span style={{ color: 'var(--text-tertiary)', lineHeight: 1.4 }}>
            {evaluacion.regla_negocio}
          </span>
        </div>
      )}
    </div>
  );
}

function MiniRank({ title, rows }) {
  if (!rows?.length) return null;
  return (
    <div>
      <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
        {title}
      </div>
      {rows.slice(0, 5).map((r) => (
        <div key={r.nombre} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', fontSize: '0.72rem', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.nombre}</span>
          <span style={{ flexShrink: 0, fontWeight: 700, color: r.soles_ext > 0 ? '#dc2626' : 'var(--text-tertiary)' }}>
            {soles(r.soles_ext)} · {r.conversion_pct}%
          </span>
        </div>
      ))}
    </div>
  );
}
