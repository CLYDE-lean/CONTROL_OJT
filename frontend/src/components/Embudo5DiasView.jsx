import React, { useState } from 'react';
import { ArrowDownRight, ArrowRight } from 'lucide-react';

const COL_EN_OJT = '#38bdf8';
const COL_IOP = '#34d399';
const COL_BAJA = '#f87171';

function detalleDia(item, baseOjt) {
  const llegaron = item.activos || 0;
  const iopDia = item.egresados || 0;
  const bajaDia = item.bajas || 0;
  const enOjt = Math.max(0, llegaron - iopDia - bajaDia);
  const pctLabel = item.retencion_pct ?? Math.round((llegaron / baseOjt) * 1000) / 10;
  return { llegaron, iopDia, bajaDia, enOjt, pctLabel };
}

export default function Embudo5DiasView({ embudoData, onAuditarEnTabla }) {
  const [diaHover, setDiaHover] = useState(null);
  const [modoVista, setModoVista] = useState('embudo');

  if (!embudoData) return null;

  const {
    dias_principales_1_8,
    total_asesores_unicos,
    base_ojt,
    bajas_pre_ojt,
    distribucion_ultimo_dia
  } = embudoData;

  const diasOficiales = (dias_principales_1_8 && dias_principales_1_8.length > 0)
    ? dias_principales_1_8
    : (embudoData.funnel?.slice(0, 8) || []);

  const baseOjt = Number(base_ojt || diasOficiales[0]?.activos || 0) || 1;
  const nomina = Number(total_asesores_unicos || 0);
  const preOjt = Number(bajas_pre_ojt || 0);
  const dia5Data = diasOficiales.find((d) => d.dia === 5);
  const llegaronD5 = dia5Data?.activos || 0;
  const retencionD5 = Math.round((llegaronD5 / baseOjt) * 1000) / 10;

  const distItemsRaw = (distribucion_ultimo_dia && distribucion_ultimo_dia.length > 0)
    ? distribucion_ultimo_dia
    : [];
  const corporateBajasColors = {
    'Sin gestión': '#64748b',
    D1: '#D9534F',
    D2: '#ea580c',
    D3: '#D9822B',
    D4: '#0284c7',
    D5: '#6366f1',
    '> D5': '#8b5cf6'
  };
  const distItems = distItemsRaw.map((d) => ({
    ...d,
    color: corporateBajasColors[d.dia] || '#64748b'
  }));
  const maxBajas = Math.max(...distItems.map((d) => d.count), 1);
  const totalBajasReportadas = distItems.reduce((acc, d) => acc + d.count, 0);

  const hoverEmbudo = modoVista === 'embudo'
    ? diasOficiales.find((d) => d.dia === diaHover)
    : null;
  const hoverEmbudoIdx = diasOficiales.findIndex((d) => d.dia === diaHover);
  const hoverDistIdx = distItems.findIndex((d) => d.dia === diaHover);
  const hoverDist = modoVista === 'distribucion' ? distItems[hoverDistIdx] : null;

  return (
    <div className="ojt-chart-card">
      <div className="ojt-chart-card__head">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flexWrap: 'wrap' }}>
          <h2 className="ojt-chart-card__title">Seguimiento OJT</h2>
          <div className="ojt-seg">
            <button
              type="button"
              className={modoVista === 'embudo' ? 'ojt-seg__btn is-on' : 'ojt-seg__btn'}
              onClick={() => setModoVista('embudo')}
            >
              Embudo D1–D8
            </button>
            <button
              type="button"
              className={modoVista === 'distribucion' ? 'ojt-seg__btn is-on is-warn' : 'ojt-seg__btn'}
              onClick={() => setModoVista('distribucion')}
            >
              Bajas por último día
            </button>
          </div>
        </div>

        {modoVista === 'distribucion' && (
          <div className="ojt-meta-chip is-warn">Ceses: {totalBajasReportadas}</div>
        )}
      </div>

      {modoVista === 'embudo' && (
        <div className="ojt-legend">
          <span><i style={{ background: COL_EN_OJT }} /> En OJT</span>
          <span><i style={{ background: COL_IOP }} /> I-OP del día</span>
          <span><i style={{ background: COL_BAJA }} /> Baja del día</span>
          <span className="ojt-legend__hint">% sobre {baseOjt} que iniciaron OJT</span>
        </div>
      )}

      <div className="ojt-chart-card__body">
        {(hoverEmbudo || hoverDist) && (
          <div className="ojt-hover-strip">
            {hoverEmbudo ? (
              <>
                {(() => {
                  const d = detalleDia(hoverEmbudo, baseOjt);
                  return (
                    <div className="ojt-hover-strip__card">
                      <strong>{hoverEmbudo.label}</strong>
                      <span>Llegaron {d.llegaron} ({d.pctLabel}% de {baseOjt})</span>
                      <span>En OJT {d.enOjt}</span>
                      {d.iopDia > 0 && <span>I-OP {d.iopDia}</span>}
                      {d.bajaDia > 0 && <span>Bajas {d.bajaDia}</span>}
                    </div>
                  );
                })()}
                <span
                  className="ojt-hover-strip__arrow"
                  style={{ left: `${((hoverEmbudoIdx + 0.5) / Math.max(diasOficiales.length, 1)) * 100}%` }}
                />
              </>
            ) : (
              <>
                <div className="ojt-hover-strip__card">
                  <strong>{hoverDist.dia}</strong>
                  <span>Bajas {hoverDist.count} ({hoverDist.pct}%)</span>
                </div>
                <span
                  className="ojt-hover-strip__arrow"
                  style={{ left: `${((hoverDistIdx + 0.5) / Math.max(distItems.length, 1)) * 100}%` }}
                />
              </>
            )}
          </div>
        )}
        {modoVista === 'distribucion' ? (
          <div className="ojt-bars-row" style={{ gridTemplateColumns: `repeat(${Math.max(distItems.length, 1)}, minmax(0, 1fr))` }}>
            {distItems.map((item) => {
              const heightPct = Math.round((item.count / maxBajas) * 100);
              return (
                <div
                  key={`baja-${item.dia}`}
                  className="ojt-bar-col"
                  onMouseEnter={() => setDiaHover(item.dia)}
                  onMouseLeave={() => setDiaHover(null)}
                >
                  <span className="ojt-bar-col__n" style={{ color: item.color }}>{item.count}</span>
                  <span className="ojt-bar-col__p">{item.pct}%</span>
                    <div className="ojt-bar-col__track">
                      <div className="ojt-stack" style={{ height: `${heightPct}%`, background: item.color }} />
                    </div>
                  <span className="ojt-bar-col__lbl">{item.dia}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="ojt-bars-row" style={{ gridTemplateColumns: 'repeat(8, minmax(0, 1fr))' }}>
            {diasOficiales.map((item, idx) => {
              const d = detalleDia(item, baseOjt);
              const heightPct = baseOjt > 0 ? (d.llegaron / baseOjt) * 100 : 0;
              const prev = idx > 0 ? diasOficiales[idx - 1] : null;
              const deltaPers = prev ? d.llegaron - (prev.activos || 0) : 0;

              return (
                <div
                  key={item.dia}
                  className={`ojt-bar-col${item.dia === 5 ? ' is-d5' : ''}`}
                  onMouseEnter={() => setDiaHover(item.dia)}
                  onMouseLeave={() => setDiaHover(null)}
                >
                  <div className="ojt-bar-col__delta">
                    {deltaPers < 0 ? (
                      <span>
                        <ArrowDownRight size={10} />
                        {deltaPers}
                      </span>
                    ) : (
                      <span style={{ opacity: 0.35 }}>{idx === 0 ? 'base' : ''}</span>
                    )}
                  </div>
                  <span className="ojt-bar-col__n">{d.llegaron}</span>
                  <span className="ojt-bar-col__p">{d.pctLabel}%</span>
                  <div className="ojt-bar-col__track">
                    <div className="ojt-stack" style={{ height: `${Math.max(heightPct, 4)}%`, minHeight: heightPct > 0 ? '6px' : 0 }}>
                      {d.enOjt > 0 && (
                        <div style={{ flex: d.enOjt, background: COL_EN_OJT, minHeight: 2 }} />
                      )}
                      {d.iopDia > 0 && (
                        <div style={{ flex: d.iopDia, background: COL_IOP, minHeight: 2 }} />
                      )}
                      {d.bajaDia > 0 && (
                        <div style={{ flex: d.bajaDia, background: COL_BAJA, minHeight: 2 }} />
                      )}
                    </div>
                  </div>
                  <span className={`ojt-bar-col__lbl${item.dia === 5 ? ' is-d5' : item.dia >= 6 ? ' is-ext' : ''}`}>
                    D{item.dia}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="ojt-chart-card__foot">
        {modoVista === 'embudo' ? (
          <span>
            De <strong>{baseOjt}</strong> que iniciaron OJT, <strong>{llegaronD5}</strong> llegaron a D5 ({retencionD5}%).
            {nomina > baseOjt ? ` Nómina del filtro: ${nomina}.` : ''}
            {preOjt > 0 ? ` ${preOjt} bajas antes de OJT (fuera del embudo).` : ''}
            {' '}Meta D5 ≥55% de esa misma base.
          </span>
        ) : (
          <span>Solo ceses reales. I-OP y gente aún activa no entran aquí.</span>
        )}
        {onAuditarEnTabla && (
          <button type="button" className="ojt-link" onClick={onAuditarEnTabla}>
            Auditar en tabla <ArrowRight size={11} />
          </button>
        )}
      </div>
    </div>
  );
}
