import React from 'react';
import { PhoneCall, Info } from 'lucide-react';

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'set', 'oct', 'nov', 'dic'];

function labelPeriodo(p) {
  const s = String(p || '');
  if (s.length < 6) return s;
  const mes = MESES[parseInt(s.slice(4, 6), 10) - 1] || s.slice(4, 6);
  return `${mes} ${s.slice(0, 4)}`;
}

function soles(n) {
  return `S/ ${(Math.round((Number(n) || 0) * 100) / 100).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function CostoLlamadasExtensionCard({ data }) {
  if (!data?.metricas) return null;

  const m = data.metricas;
  const porDia = data.por_dia || [];
  const sinTarifa = data.sin_tarifa || {};
  const maxCosto = Math.max(1, ...porDia.map((d) => d.costo || 0));
  const primerPeriodoTarifado = (data.tarifas || [])[0]?.periodo;

  return (
    <div className="executive-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden', marginBottom: 0, padding: '1rem 1.25rem' }}>
      <div className="card-header-exec">
        <h2 className="card-title-exec">
          <PhoneCall size={18} style={{ color: '#f59e0b' }} />
          Costo de extensión por llamada · POSTPAGO
        </h2>
        {data.tarifa_vigente != null && (
          <span className="badge-exec badge-blue">
            S/ {data.tarifa_vigente} / llamada · {labelPeriodo(data.periodo_vigente)}
          </span>
        )}
      </div>

      <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: '0.85rem' }}>
        Solo días de extensión (D6 en adelante): los 5 primeros son OJT normal. Cada llamada del día se valoriza con la tarifa del mes en que ocurrió.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr 1fr', gap: '0.6rem', marginBottom: '0.8rem' }}>
        <div className="roi-tile" style={{ textAlign: 'left', padding: '0.7rem' }}>
          <div className="roi-tile-label">Costo total extensión</div>
          <div className="roi-tile-num" style={{ color: '#f59e0b', fontSize: '1.4rem' }}>{soles(m.costo_total_pen)}</div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
            {m.llamadas_extension.toLocaleString('es-PE')} llamadas en {m.dias_extension} días
          </span>
        </div>
        <div className="roi-tile" style={{ textAlign: 'left', padding: '0.7rem' }}>
          <div className="roi-tile-label">Promedio por día</div>
          <div className="roi-tile-num" style={{ fontSize: '1.4rem' }}>{m.promedio_llamadas_dia}</div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
            llamadas/asesor · {soles(m.costo_promedio_por_dia_pen)} por día
          </span>
        </div>
        <div className="roi-tile" style={{ textAlign: 'left', padding: '0.7rem' }}>
          <div className="roi-tile-label">Costo por asesor</div>
          <div className="roi-tile-num" style={{ fontSize: '1.4rem' }}>{soles(m.costo_promedio_por_asesor_pen)}</div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
            {m.asesores_con_extension} con extensión
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.1rem', flexWrap: 'wrap', fontSize: '0.74rem', marginBottom: '0.85rem' }}>
        <span style={{ color: 'var(--text-secondary)' }}>
          Convirtieron a I-OP: <strong style={{ color: '#34d399' }}>{soles(m.costo_convertidos_pen)}</strong>
        </span>
        <span style={{ color: 'var(--text-secondary)' }}>
          Terminaron en baja: <strong style={{ color: '#f87171' }}>{soles(m.costo_bajas_pen)}</strong>
        </span>
        <span style={{ color: 'var(--text-secondary)' }}>
          Aún en curso: <strong style={{ color: '#38bdf8' }}>{soles(m.costo_en_curso_pen)}</strong>
        </span>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
          Costo por día de extensión
        </div>
        {porDia.map((d) => (
          <div key={d.dia} style={{ marginBottom: '0.4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>
              <span>
                {d.etiqueta} · {d.asesores} asesores · {d.promedio_llamadas} llam/día
              </span>
              <strong style={{ color: d.costo > 0 ? '#f59e0b' : 'var(--text-tertiary)' }}>{soles(d.costo)}</strong>
            </div>
            <div className="funnel-bar-container" style={{ height: '6px' }}>
              <div
                className="funnel-bar-fill"
                style={{ width: `${Math.max(2, (d.costo / maxCosto) * 100)}%`, background: d.dia > 8 ? '#dc2626' : '#f59e0b' }}
              />
            </div>
          </div>
        ))}
      </div>

      {sinTarifa.asesores > 0 && (
        <div style={{
          marginTop: '0.6rem',
          padding: '0.6rem 0.8rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-card-subtle)',
          border: '1px solid var(--border-color)',
          fontSize: '0.72rem',
          color: 'var(--text-tertiary)',
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'flex-start',
          flexShrink: 0
        }}>
          <Info size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0, marginTop: '2px' }} />
          <span>
            El costo se reporta desde {labelPeriodo(primerPeriodoTarifado)}, cuando arranca la tarifa por llamada.
            Quedan fuera {sinTarifa.llamadas.toLocaleString('es-PE')} llamadas de meses anteriores
            ({(sinTarifa.periodos || []).map(labelPeriodo).join(', ')}).
          </span>
        </div>
      )}
    </div>
  );
}
