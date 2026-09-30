import React, { useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { lastCalloutPlugin, tooltipOjt, ejeXOjt, ejeYOjt, ejeYPctOjt, OJT_CHART_THEME } from '../utils/chartOjt';

ChartJS.register(...registerables);

const COL_EN_OJT = OJT_CHART_THEME.pipeline.enOjt;
const COL_IOP = OJT_CHART_THEME.pipeline.iop;
const COL_BAJA = OJT_CHART_THEME.pipeline.baja;
const COL_LINEA = '#e2e8f0';
const META_D5 = 55;


const totalesPlugin = {
  id: 'ojtTotalesBarra',
  afterDatasetsDraw(chart) {
    const barras = chart.data.datasets
      .map((d, i) => ({ d, i }))
      .filter(({ d }) => d.type !== 'line');
    if (!barras.length) return;

    const { ctx } = chart;
    ctx.save();
    ctx.font = "700 10px 'JetBrains Mono', monospace";
    ctx.fillStyle = '#cbd5e1';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';

    chart.data.labels.forEach((_, idx) => {
      let total = 0;
      let top = Infinity;
      barras.forEach(({ d, i }) => {
        total += Number(d.data[idx] || 0);
        const el = chart.getDatasetMeta(i).data[idx];
        if (el) top = Math.min(top, el.y);
      });
      if (!total || !isFinite(top)) return;
      const el = chart.getDatasetMeta(barras[0].i).data[idx];
      if (!el) return;
      ctx.fillText(total.toLocaleString(), el.x, top - 3);
    });
    ctx.restore();
  }
};

function detalleDia(item, baseOjt) {
  const llegaron = item.activos || 0;
  const iopDia = item.egresados || 0;
  const bajaDia = item.bajas || 0;
  const enOjt = Math.max(0, llegaron - iopDia - bajaDia);
  const pctLabel = item.retencion_pct ?? Math.round((llegaron / baseOjt) * 1000) / 10;
  return { llegaron, iopDia, bajaDia, enOjt, pctLabel };
}

export default function Embudo5DiasView({ embudoData, onAuditarEnTabla }) {
  const [modoVista, setModoVista] = useState('embudo');

  const {
    dias_principales_1_8,
    total_asesores_unicos,
    base_ojt,
    bajas_pre_ojt,
    distribucion_ultimo_dia
  } = embudoData || {};

  const diasOficiales = useMemo(() => (
    (dias_principales_1_8 && dias_principales_1_8.length > 0)
      ? dias_principales_1_8
      : (embudoData?.funnel?.slice(0, 8) || [])
  ), [dias_principales_1_8, embudoData]);

  const baseOjt = Number(base_ojt || diasOficiales[0]?.activos || 0) || 1;
  const nomina = Number(total_asesores_unicos || 0);
  const preOjt = Number(bajas_pre_ojt || 0);
  const dia5Data = diasOficiales.find((d) => d.dia === 5);
  const llegaronD5 = dia5Data?.activos || 0;
  const retencionD5 = Math.round((llegaronD5 / baseOjt) * 1000) / 10;

  const corporateBajasColors = {
    'Sin gestión': '#64748b',
    D1: '#D9534F',
    D2: '#ea580c',
    D3: '#D9822B',
    D4: '#0284c7',
    D5: '#6366f1',
    '> D5': '#8b5cf6'
  };
  const distItems = useMemo(() => (
    (distribucion_ultimo_dia || []).map((d) => ({
      ...d,
      color: corporateBajasColors[d.dia] || '#64748b'
    }))
  ), [distribucion_ultimo_dia]);
  const totalBajasReportadas = distItems.reduce((acc, d) => acc + d.count, 0);

  const chartEmbudo = useMemo(() => {
    if (modoVista !== 'embudo' || !diasOficiales.length) return null;

    const last = diasOficiales.length - 1;
    const detalles = diasOficiales.map((item) => detalleDia(item, baseOjt));
    const pcts = detalles.map((d) => d.pctLabel);
    const tono = (color, i) => (i === last ? color : `${color}bf`);

    return {
      data: {
        labels: diasOficiales.map((d) => `D${d.dia}`),
        datasets: [
          {
            type: 'bar',
            label: 'En OJT',
            data: detalles.map((d) => d.enOjt),
            stack: 'dia',
            backgroundColor: detalles.map((_, i) => tono(COL_EN_OJT, i)),
            borderRadius: { topLeft: 3, topRight: 3, bottomLeft: 0, bottomRight: 0 },
            borderSkipped: false,
            barPercentage: 0.62,
            categoryPercentage: 0.78
          },
          {
            type: 'bar',
            label: 'I-OP del día',
            data: detalles.map((d) => d.iopDia),
            stack: 'dia',
            backgroundColor: detalles.map((_, i) => tono(COL_IOP, i)),
            borderRadius: { topLeft: 3, topRight: 3, bottomLeft: 0, bottomRight: 0 },
            borderSkipped: false,
            barPercentage: 0.62,
            categoryPercentage: 0.78
          },
          {
            type: 'bar',
            label: 'Baja del día',
            data: detalles.map((d) => d.bajaDia),
            stack: 'dia',
            backgroundColor: detalles.map((_, i) => tono(COL_BAJA, i)),
            borderRadius: { topLeft: 3, topRight: 3, bottomLeft: 0, bottomRight: 0 },
            borderSkipped: false,
            barPercentage: 0.62,
            categoryPercentage: 0.78
          },
          {
            type: 'line',
            label: `Meta D5 ${META_D5}%`,
            data: diasOficiales.map(() => META_D5),
            yAxisID: 'y1',
            borderColor: 'rgba(251,191,36,0.45)',
            borderDash: [6, 5],
            borderWidth: 1.5,
            pointRadius: 0,
            pointHoverRadius: 0
          },
          {
            type: 'line',
            label: '% de la base',
            data: pcts,
            yAxisID: 'y1',
            borderColor: COL_LINEA,
            borderWidth: 2,
            tension: 0.3,
            pointBackgroundColor: pcts.map((_, i) => (i === last ? '#ffffff' : '#0b1224')),
            pointBorderColor: COL_LINEA,
            pointBorderWidth: 2,
            pointRadius: pcts.map((_, i) => (i === last ? 5.5 : 3.5)),
            pointHoverRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 350 },
        interaction: { mode: 'index', intersect: false },
        layout: { padding: { top: 14, right: 2, left: 0, bottom: 0 } },
        plugins: {
          legend: { display: false },
          tooltip: {
            ...tooltipOjt,
            filter: (item) => !String(item.dataset.label).startsWith('Meta D5'),
            callbacks: {
              label(item) {
                const v = item.parsed.y ?? 0;
                if (item.dataset.yAxisID === 'y1') return ` ${item.dataset.label}: ${v.toFixed(1)}%`;
                return ` ${item.dataset.label}: ${v.toLocaleString()}`;
              },
              afterBody(items) {
                const i = items[0]?.dataIndex ?? 0;
                const llegaron = detalles[i].llegaron;
                const prev = i > 0 ? detalles[i - 1].llegaron : null;
                const delta = prev != null ? llegaron - prev : 0;
                return [
                  `Llegaron: ${llegaron.toLocaleString()} de ${baseOjt.toLocaleString()}`,
                  prev != null ? `Variación vs día previo: ${delta}` : 'Base de inicio OJT'
                ];
              }
            }
          }
        },
        scales: {
          x: { ...ejeXOjt, stacked: true },
          y: ejeYOjt({ stacked: true, suggestedMax: baseOjt * 1.12 }),
          y1: ejeYPctOjt({ max: 100 })
        }
      }
    };
  }, [modoVista, diasOficiales, baseOjt]);

  const chartDistribucion = useMemo(() => {
    if (modoVista !== 'distribucion' || !distItems.length) return null;

    const last = distItems.length - 1;
    const counts = distItems.map((d) => d.count);
    const total = counts.reduce((a, c) => a + c, 0) || 1;
    let acumulado = 0;
    const acumulados = counts.map((c) => {
      acumulado += c;
      return Math.round((acumulado / total) * 1000) / 10;
    });

    return {
      data: {
        labels: distItems.map((d) => d.dia),
        datasets: [
          {
            type: 'bar',
            label: 'Ceses',
            data: counts,
            backgroundColor: distItems.map((d, i) => (i === last ? d.color : `${d.color}bf`)),
            borderRadius: { topLeft: 3, topRight: 3, bottomLeft: 0, bottomRight: 0 },
            borderSkipped: false,
            barPercentage: 0.62,
            categoryPercentage: 0.78
          },
          {
            type: 'line',
            label: 'Referencia 80%',
            data: distItems.map(() => 80),
            yAxisID: 'y1',
            borderColor: 'rgba(251,191,36,0.45)',
            borderDash: [6, 5],
            borderWidth: 1.5,
            pointRadius: 0,
            pointHoverRadius: 0
          },
          {
            type: 'line',
            label: '% acumulado',
            data: acumulados,
            yAxisID: 'y1',
            borderColor: COL_LINEA,
            borderWidth: 2,
            tension: 0.3,
            pointBackgroundColor: acumulados.map((_, i) => (i === last ? '#ffffff' : '#0b1224')),
            pointBorderColor: COL_LINEA,
            pointBorderWidth: 2,
            pointRadius: acumulados.map((_, i) => (i === last ? 5.5 : 3.5)),
            pointHoverRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 350 },
        interaction: { mode: 'index', intersect: false },
        layout: { padding: { top: 14, right: 2, left: 0, bottom: 0 } },
        plugins: {
          legend: { display: false },
          tooltip: {
            ...tooltipOjt,
            filter: (item) => item.dataset.label !== 'Referencia 80%',
            callbacks: {
              label(item) {
                const v = item.parsed.y ?? 0;
                if (item.dataset.yAxisID === 'y1') return ` ${item.dataset.label}: ${v.toFixed(1)}%`;
                return ` ${item.dataset.label}: ${v.toLocaleString()}`;
              },
              afterBody(items) {
                const i = items[0]?.dataIndex ?? 0;
                return [`${distItems[i].pct}% del total de ceses`];
              }
            }
          }
        },
        scales: {
          x: ejeXOjt,
          y: ejeYOjt(),
          y1: ejeYPctOjt({ max: 100 })
        }
      }
    };
  }, [modoVista, distItems]);

  if (!embudoData) return null;

  const chartActivo = modoVista === 'embudo' ? chartEmbudo : chartDistribucion;

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

      <div className="ojt-legend">
        {modoVista === 'embudo' ? (
          <>
            <span><i style={{ background: COL_EN_OJT }} /> En OJT</span>
            <span><i style={{ background: COL_IOP }} /> I-OP del día</span>
            <span><i style={{ background: COL_BAJA }} /> Baja del día</span>
            <span><i style={{ background: COL_LINEA, borderRadius: '50%' }} /> % de la base</span>
            <span className="ojt-legend__hint">% sobre {baseOjt} que iniciaron OJT</span>
          </>
        ) : (
          <>
            <span><i style={{ background: '#D9534F' }} /> Ceses por último día</span>
            <span><i style={{ background: COL_LINEA, borderRadius: '50%' }} /> % acumulado</span>
            <span className="ojt-legend__hint">{totalBajasReportadas} ceses reales</span>
          </>
        )}
      </div>

      <div className="ojt-chart-card__body">
        {chartActivo ? (
          <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
            <Chart
              type="bar"
              data={chartActivo.data}
              options={chartActivo.options}
              plugins={[lastCalloutPlugin, totalesPlugin]}
            />
          </div>
        ) : (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#64748b', fontSize: '0.72rem'
          }}>
            Sin datos para este filtro.
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
