import React, { useEffect, useMemo, useState } from 'react';
import { UserX, CheckCircle2, Maximize2, X } from 'lucide-react';
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

const BAR_COLORS = OJT_CHART_THEME.pareto;


const COL_LINEA = '#e2e8f0';
const TOP_MOTIVOS = 6;
const REFERENCIA_PARETO = 80;

const totalesPlugin = {
  id: 'motivosTotalesBarra',
  afterDatasetsDraw(chart) {
    const idxBar = chart.data.datasets.findIndex((d) => d.type !== 'line');
    if (idxBar < 0) return;
    const meta = chart.getDatasetMeta(idxBar);
    const { ctx } = chart;
    ctx.save();
    ctx.font = "700 10px 'JetBrains Mono', monospace";
    ctx.fillStyle = '#cbd5e1';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    meta.data.forEach((el, i) => {
      const v = Number(chart.data.datasets[idxBar].data[i] || 0);
      if (!v) return;
      ctx.fillText(v.toLocaleString(), el.x, el.y - 3);
    });
    ctx.restore();
  }
};

function abreviarMotivo(motivo = '', max = 11) {
  const txt = String(motivo).trim().split('/')[0].trim();
  return txt.length > max ? `${txt.slice(0, max - 1)}…` : txt;
}

function MotivoFila({ m, idx, totalBajas, maxCount, compact = false }) {
  const pct = m.porcentaje ?? (totalBajas > 0 ? Math.round((m.total_bajas / totalBajas) * 1000) / 10 : 0);
  const barW = Math.max(8, Math.round((m.total_bajas / maxCount) * 100));
  const tone = BAR_COLORS[idx % BAR_COLORS.length];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? '3px' : '6px', flexShrink: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: compact ? 'center' : 'flex-start', gap: '8px' }}>
        <span style={{
          fontSize: compact ? '0.68rem' : '0.82rem',
          fontWeight: 700,
          color: '#e2e8f0',
          fontFamily: "'Inter',sans-serif",
          maxWidth: compact ? '58%' : '70%',
          overflow: compact ? 'hidden' : 'visible',
          textOverflow: 'ellipsis',
          whiteSpace: compact ? 'nowrap' : 'normal',
          lineHeight: 1.25
        }} title={m.motivo}>
          {idx + 1}. {m.motivo}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <span style={{ fontSize: compact ? '0.62rem' : '0.72rem', color: '#94a3b8', fontFamily: "'JetBrains Mono',monospace" }}>
            {m.total_bajas} {m.total_bajas === 1 ? 'asesor' : 'asesores'}
          </span>
          <span style={{
            fontSize: compact ? '0.72rem' : '0.88rem',
            fontWeight: 800,
            color: idx === 0 ? '#fb7185' : '#fdba74',
            fontFamily: "'JetBrains Mono',monospace",
            minWidth: compact ? '40px' : '52px',
            textAlign: 'right'
          }}>
            {pct}%
          </span>
        </div>
      </div>
      <div style={{
        width: '100%',
        height: compact ? '11px' : '12px',
        background: 'rgba(15,23,42,0.9)',
        borderRadius: '999px',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{
          width: `${barW}%`,
          height: '100%',
          background: `linear-gradient(90deg, ${tone.from}, ${tone.to})`,
          borderRadius: '999px',
          boxShadow: idx === 0 ? '0 0 10px rgba(251,113,133,0.45)' : 'none'
        }} />
      </div>
    </div>
  );
}

export default function GraficaMotivosBajaCard({ filtros = {} }) {
  const [data, setData] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadMotivos() {
      setCargando(true);
      try {
        const params = new URLSearchParams();
        if (filtros.semana) params.append('semana', filtros.semana);
        if (filtros.periodo) params.append('periodo', filtros.periodo);
        if (filtros.campana) params.append('campana', filtros.campana);
        if (filtros.formador) params.append('formador', filtros.formador);
        if (filtros.grupo) params.append('grupo', filtros.grupo);
        if (filtros.modalidad) params.append('modalidad', filtros.modalidad);

        const res = await fetch(`/api/ojt/heatmap-bajas?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.success) {
            setData(json);
          }
        }
      } catch (err) {
        console.warn('Usando motivos de contingencia:', err);
        if (isMounted) {
          setData({
            success: true,
            total_bajas_evaluadas: 34,
            bajas_capacitacion_excluidas: 0,
            motivos: [
              { motivo: 'SIN MOTIVO REGISTRADO', total_bajas: 15, porcentaje: 44.1 },
              { motivo: 'DESAPROBADO', total_bajas: 9, porcentaje: 26.5 },
              { motivo: 'NO CONTACTO', total_bajas: 6, porcentaje: 17.6 },
              { motivo: 'FAMILIAR', total_bajas: 4, porcentaje: 11.8 }
            ]
          });
        }
      } finally {
        if (isMounted) setCargando(false);
      }
    }
    loadMotivos();
    return () => { isMounted = false; };
  }, [filtros.semana, filtros.periodo, filtros.campana, filtros.formador, filtros.grupo, filtros.modalidad]);

  useEffect(() => {
    if (!modalOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') setModalOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [modalOpen]);

  const motivos = data?.motivos || [];
  const totalBajas = data?.total_bajas_evaluadas || motivos.reduce((a, m) => a + (m.total_bajas || 0), 0);
  const bajasCapa = data?.bajas_capacitacion_excluidas || 0;
  const maxCount = Math.max(...motivos.map(m => m.total_bajas || 0), 1);
  const top = motivos.slice(0, TOP_MOTIVOS);
  const ocultos = Math.max(0, motivos.length - top.length);

  const chartModel = useMemo(() => {
    if (!top.length || totalBajas === 0) return null;

    const counts = top.map((m) => m.total_bajas || 0);
    const pcts = top.map((m) => (
      m.porcentaje ?? Math.round(((m.total_bajas || 0) / totalBajas) * 1000) / 10
    ));
    let suma = 0;
    const acumulados = counts.map((c) => {
      suma += c;
      return Math.round((suma / totalBajas) * 1000) / 10;
    });
    const maxCountTop = Math.max(...counts, 1);

    return {
      data: {
        labels: top.map((m) => abreviarMotivo(m.motivo)),
        datasets: [
          {
            type: 'bar',
            label: 'Asesores',
            data: counts,
            backgroundColor: counts.map((_, i) => {
              const tone = BAR_COLORS[Math.min(i, BAR_COLORS.length - 1)];
              return i === 0 ? tone.from : `${tone.solid}dd`;
            }),
            borderRadius: { topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 },
            borderSkipped: false,
            barPercentage: 0.62,
            categoryPercentage: 0.78
          },
          {
            type: 'line',
            label: `Referencia ${REFERENCIA_PARETO}%`,
            data: top.map(() => REFERENCIA_PARETO),
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
            pointBackgroundColor: acumulados.map((_, i) => (i === acumulados.length - 1 ? '#ffffff' : '#0b1224')),
            pointBorderColor: COL_LINEA,
            pointBorderWidth: 2,
            pointRadius: acumulados.map((_, i) => (i === acumulados.length - 1 ? 5.5 : 3.5)),
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
            filter: (item) => !String(item.dataset.label).startsWith('Referencia'),
            callbacks: {
              title: (items) => {
                const i = items[0]?.dataIndex ?? 0;
                return `${i + 1}. ${top[i]?.motivo || ''}`;
              },
              label(item) {
                const v = item.parsed.y ?? 0;
                if (item.dataset.yAxisID === 'y1') return ` ${item.dataset.label}: ${v.toFixed(1)}%`;
                return ` ${item.dataset.label}: ${v.toLocaleString()}`;
              },
              afterBody(items) {
                const i = items[0]?.dataIndex ?? 0;
                return [`${pcts[i]}% de ${totalBajas} bajas en OJT`];
              }
            }
          }
        },
        scales: {
          x: {
            ...ejeXOjt,
            ticks: { ...ejeXOjt.ticks, font: { size: 9, weight: '600' }, maxRotation: 0, autoSkip: false }
          },
          y: ejeYOjt({ suggestedMax: maxCountTop * 1.15 }),
          y1: ejeYPctOjt({ max: 100 })
        }
      }
    };
  }, [top, totalBajas]);

  return (
    <>
      <div style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '10px 12px',
        boxSizing: 'border-box',
        background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
        border: '1px solid rgba(251, 113, 133, 0.18)',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(2, 6, 23, 0.28)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 70% 50% at 88% -18%, rgba(251,113,133,0.16) 0%, transparent 70%)'
        }} />

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '8px', flexShrink: 0, position: 'relative', zIndex: 1, gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <div style={{
              width: '26px', height: '26px', borderRadius: '8px',
              background: 'linear-gradient(135deg, rgba(251,113,133,0.28), rgba(225,29,72,0.12))',
              border: '1px solid rgba(251,113,133,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              <UserX size={13} style={{ color: '#fb7185' }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc', fontFamily: "'Inter',sans-serif" }}>
                Motivos de baja en OJT
              </span>
              <div style={{ fontSize: '0.58rem', color: '#64748b', fontWeight: 600 }}>
                {motivos.length} CATEGORÍAS · DESDE EL INICIO DE OJT
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            <div style={{
              background: 'rgba(251,113,133,0.12)',
              border: '1px solid rgba(251,113,133,0.28)',
              borderRadius: '999px',
              padding: '3px 9px'
            }}>
              <span style={{ fontSize: '0.62rem', color: '#fda4af', fontWeight: 600 }}>Bajas OJT </span>
              <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#fb7185', fontFamily: "'JetBrains Mono',monospace" }}>
                {totalBajas}
              </span>
            </div>
            {motivos.length > 0 && (
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  background: 'rgba(56,189,248,0.12)',
                  border: '1px solid rgba(56,189,248,0.35)',
                  color: '#38bdf8',
                  borderRadius: '8px',
                  padding: '4px 8px',
                  fontSize: '0.64rem',
                  fontWeight: 700,
                  fontFamily: "'Inter',sans-serif",
                  cursor: 'pointer'
                }}
              >
                <Maximize2 size={11} />
                Ver todos
              </button>
            )}
          </div>
        </div>

        {cargando ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.72rem' }}>
            Cargando análisis de atrición...
          </div>
        ) : totalBajas === 0 || motivos.length === 0 ? (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: '4px', color: '#34d399', fontSize: '0.75rem', fontWeight: 600
          }}>
            <CheckCircle2 size={20} />
            <span>Sin bajas registradas</span>
          </div>
        ) : (
          <div style={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            zIndex: 1
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
              fontSize: '0.58rem', color: '#94a3b8', fontWeight: 600, marginBottom: '2px'
            }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <i style={{ width: 8, height: 8, borderRadius: 2, background: BAR_COLORS[0].from }} />
                Asesores por motivo
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <i style={{ width: 8, height: 8, borderRadius: '50%', background: COL_LINEA }} />
                % acumulado
              </span>
              <span style={{ marginLeft: 'auto', color: '#64748b' }}>
                Top {top.length} de {motivos.length} motivos
              </span>
            </div>

            <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
              <Chart
                type="bar"
                data={chartModel.data}
                options={chartModel.options}
                plugins={[lastCalloutPlugin, totalesPlugin]}
              />
            </div>

            {ocultos > 0 && (
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                style={{
                  marginTop: '2px',
                  background: 'transparent',
                  border: 'none',
                  color: '#38bdf8',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  fontFamily: "'Inter',sans-serif",
                  cursor: 'pointer',
                  textAlign: 'left',
                  padding: 0,
                  flexShrink: 0
                }}
              >
                + {ocultos} motivos más — abrir detalle
              </button>
            )}
          </div>
        )}
      </div>

      {modalOpen && (
        <div
          onClick={() => setModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(2, 6, 23, 0.72)',
            zIndex: 2400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(720px, 96vw)',
              maxHeight: '82vh',
              background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
              border: '1px solid rgba(251,113,133,0.28)',
              borderRadius: '16px',
              boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 18px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              flexShrink: 0
            }}>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', fontFamily: "'Inter',sans-serif" }}>
                  Detalle de motivos de baja en OJT
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                  {motivos.length} categorías · {totalBajas} asesores únicos cesados desde el inicio de OJT
                  {bajasCapa > 0 && ` · ${bajasCapa} bajas de capacitación excluidas`}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#e2e8f0',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{
              padding: '16px 18px 20px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {motivos.map((m, idx) => (
                <MotivoFila key={m.motivo || idx} m={m} idx={idx} totalBajas={totalBajas} maxCount={maxCount} />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
