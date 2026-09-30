import React, { useEffect, useMemo, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { lastCalloutPlugin, tooltipOjt, ejeXOjt, ejeYOjt, ejeYPctOjt, OJT_CHART_THEME } from '../utils/chartOjt';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip);

export default function GraficaLlamadasDiaCard({ filtros = {} }) {
  const [data, setData] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [modo, setModo] = useState('total');

  useEffect(() => {
    let isMounted = true;
    async function loadLlamadas() {
      setCargando(true);
      try {
        const params = new URLSearchParams();
        if (filtros.semana) params.append('semana', filtros.semana);
        if (filtros.periodo) params.append('periodo', filtros.periodo);
        if (filtros.campana) params.append('campana', filtros.campana);
        if (filtros.formador) params.append('formador', filtros.formador);
        if (filtros.grupo) params.append('grupo', filtros.grupo);
        if (filtros.modalidad) params.append('modalidad', filtros.modalidad);

        const res = await fetch(`/api/ojt/curva-maduracion?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.success) setData(json);
        }
      } catch (err) {
        console.warn('Usando datos de contingencia para llamadas:', err);
        if (isMounted) {
          setData({
            success: true,
            curva: [
              { dia: 'D1', dia_num: 1, promedio_llamadas: 4.8, total_llamadas: 432, asesores_activos: 90 },
              { dia: 'D2', dia_num: 2, promedio_llamadas: 8.5, total_llamadas: 748, asesores_activos: 88 },
              { dia: 'D3', dia_num: 3, promedio_llamadas: 13.2, total_llamadas: 1122, asesores_activos: 85 },
              { dia: 'D4', dia_num: 4, promedio_llamadas: 17.6, total_llamadas: 1460, asesores_activos: 83 },
              { dia: 'D5', dia_num: 5, promedio_llamadas: 22.4, total_llamadas: 1814, asesores_activos: 81 },
              { dia: 'D6', dia_num: 6, promedio_llamadas: 24.1, total_llamadas: 964, asesores_activos: 40 },
              { dia: 'D7', dia_num: 7, promedio_llamadas: 26.0, total_llamadas: 780, asesores_activos: 30 },
              { dia: 'D8', dia_num: 8, promedio_llamadas: 27.5, total_llamadas: 412, asesores_activos: 15 }
            ]
          });
        }
      } finally {
        if (isMounted) setCargando(false);
      }
    }
    loadLlamadas();
    return () => { isMounted = false; };
  }, [filtros.semana, filtros.periodo, filtros.campana, filtros.formador, filtros.grupo, filtros.modalidad]);

  const chartModel = useMemo(() => {
    const curva = (data?.curva || []).filter((d) => {
      const n = d.dia_num || parseInt(String(d.dia || '').replace(/\D/g, ''), 10) || 0;
      return n >= 1 && n <= 8;
    });
    if (!curva.length) return null;

    const sumAsesores = curva.reduce((a, c) => a + (c.asesores_activos || 0), 0);
    const sumLlam = curva.reduce((a, c) => a + (c.total_llamadas || 0), 0);
    const promGeneral = sumAsesores > 0
      ? Math.round((sumLlam / sumAsesores) * 10) / 10
      : (data?.promedio_general || 0);

    const last = curva.length - 1;
    const labels = curva.map((d) => d.dia);
    const esPromedio = modo === 'promedio';
    const reales = curva.map((d) => (
      esPromedio ? (d.promedio_llamadas || 0) : (d.total_llamadas || 0)
    ));
    const esperados = curva.map((d) => (
      esPromedio ? promGeneral : Math.round((d.asesores_activos || 0) * promGeneral)
    ));
    const pcts = curva.map((d) => (
      promGeneral > 0 ? Math.round(((d.promedio_llamadas || 0) / promGeneral) * 1000) / 10 : 0
    ));
    const maxBar = Math.max(...reales, ...esperados, 1);
    const maxPct = Math.max(150, ...pcts, 100);

    const { comparison } = OJT_CHART_THEME;

    return {
      data: {
        labels,
        datasets: [
          {
            type: 'bar',
            label: 'Esperado',
            data: esperados,
            yAxisID: 'y',
            backgroundColor: esperados.map((_, i) => (i === last ? 'rgba(148, 163, 184, 0.45)' : comparison.expected)),
            hoverBackgroundColor: comparison.expectedHover,
            borderColor: comparison.expectedBorder,
            borderWidth: 1,
            borderRadius: { topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 },
            borderSkipped: false,
            barPercentage: 0.78,
            categoryPercentage: 0.62
          },
          {
            type: 'bar',
            label: 'Llamadas reales',
            data: reales,
            yAxisID: 'y',
            backgroundColor: reales.map((_, i) => (i === last ? comparison.actualHighlight : comparison.actual)),
            hoverBackgroundColor: comparison.actualHover,
            borderRadius: { topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 },
            borderSkipped: false,
            barPercentage: 0.78,
            categoryPercentage: 0.62
          },
          {
            type: 'line',
            label: 'Prom. 100%',
            data: labels.map(() => 100),
            yAxisID: 'y1',
            borderColor: 'rgba(148, 163, 184, 0.35)',
            borderDash: [5, 4],
            borderWidth: 1.5,
            pointRadius: 0,
            pointHoverRadius: 0
          },
          {
            type: 'line',
            label: '% vs promedio',
            data: pcts,
            yAxisID: 'y1',
            borderColor: comparison.trendLine,
            borderWidth: 2.2,
            tension: 0.35,
            fill: false,
            pointBackgroundColor: pcts.map((_, i) => (i === last ? '#ffffff' : '#0b1224')),
            pointBorderColor: comparison.trendLine,
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
        layout: { padding: { top: 8, right: 2, left: 0, bottom: 0 } },
        plugins: {
          legend: { display: false },
          tooltip: {
            ...tooltipOjt,
            filter: (item) => item.dataset.label !== 'Prom. 100%',
            callbacks: {
              label(item) {
                const v = item.parsed.y ?? 0;
                if (item.dataset.yAxisID === 'y1') return ` ${item.dataset.label}: ${v.toFixed(1)}%`;
                return ` ${item.dataset.label}: ${v.toLocaleString()}`;
              },
              afterBody(items) {
                const i = items[0]?.dataIndex ?? 0;
                const row = curva[i];
                return [
                  esPromedio
                    ? `Total llamadas: ${(row?.total_llamadas || 0).toLocaleString()}`
                    : `Prom/asesor: ${row?.promedio_llamadas ?? 0}`,
                  `${row?.asesores_activos || 0} asesores activos`
                ];
              }
            }
          }
        },
        scales: {
          x: ejeXOjt,
          y: ejeYOjt({ suggestedMax: maxBar * 1.12 }),
          y1: ejeYPctOjt({ max: maxPct })
        }
      }
    };
  }, [data, modo]);

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '8px 12px 6px',
      boxSizing: 'border-box',
      background: 'linear-gradient(180deg, #111827 0%, #0b1224 100%)',
      border: '1px solid rgba(148,163,184,0.12)',
      borderRadius: '12px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '10px',
        flexShrink: 0,
        marginBottom: '2px'
      }}>
        <div>
          <div style={{
            fontSize: '0.68rem',
            fontWeight: 800,
            letterSpacing: '0.08em',
            color: '#cbd5e1',
            textTransform: 'uppercase'
          }}>
            Llamadas por día
          </div>
          <div style={{ fontSize: '0.55rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.04em' }}>
            VENTANA D1–D8 · ESPERADO = ASESORES × PROM. GENERAL
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <LegendDot color={OJT_CHART_THEME.comparison.expectedBorder} label="Esperado" />
          <LegendDot color={OJT_CHART_THEME.comparison.actual} label={modo === 'promedio' ? 'Prom/asesor real' : 'Llamadas reales'} />
          <LegendLine color={OJT_CHART_THEME.comparison.trendLine} label="% vs promedio" />
          <div style={{
            display: 'flex',
            background: 'rgba(15,23,42,0.75)',
            borderRadius: '8px',
            padding: '2px',
            border: '1px solid rgba(148,163,184,0.18)'
          }}>
            {[['total', 'Total'], ['promedio', 'Prom/asesor']].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setModo(key)}
                style={{
                  background: modo === key ? 'linear-gradient(90deg,#38bdf8,#22d3ee)' : 'transparent',
                  color: modo === key ? '#0f172a' : '#94a3b8',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '2px 8px',
                  fontSize: '0.58rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {cargando ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.72rem' }}>
          Cargando curva operativa...
        </div>
      ) : !chartModel ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.72rem' }}>
          Sin datos de llamadas para este filtro.
        </div>
      ) : (
        <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
          <Chart type="bar" data={chartModel.data} options={chartModel.options} plugins={[lastCalloutPlugin]} />
        </div>
      )}
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.58rem', color: '#94a3b8', fontWeight: 600, whiteSpace: 'nowrap' }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
      {label}
    </div>
  );
}

function LegendLine({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.58rem', color: '#94a3b8', fontWeight: 600, whiteSpace: 'nowrap' }}>
      <span style={{ width: 16, height: 2, background: color, borderRadius: 2, position: 'relative' }}>
        <span style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 6,
          height: 6,
          margin: '-3px 0 0 -3px',
          borderRadius: '50%',
          border: `1.5px solid ${color}`,
          background: '#0b1224'
        }} />
      </span>
      {label}
    </div>
  );
}
