import { Chart as ChartJS, registerables } from 'chart.js';

// Registro global de controladores, escalas y elementos de Chart.js
ChartJS.register(...registerables);

// Estilo común de los gráficos mixtos (barras + línea de %) del dashboard OJT.

export const OJT_CHART_THEME = {
  // Comparativa Plan/Esperado vs Real
  comparison: {
    expected: 'rgba(100, 116, 139, 0.32)',
    expectedBorder: 'rgba(148, 163, 184, 0.5)',
    expectedHover: 'rgba(148, 163, 184, 0.45)',
    actual: '#06b6d4',          // Cyan moderno
    actualHighlight: '#22d3ee', // Resaltado último día
    actualHover: '#67e8f9',
    trendLine: '#f59e0b',        // Línea ámbar elegante de contraste
    trendBorder: 'rgba(245, 158, 11, 0.45)'
  },
  // Pareto de Bajas (degradé de severidad armónica sin efecto arcoíris)
  pareto: [
    { from: '#f43f5e', to: '#e11d48', solid: '#f43f5e' }, // 1° Principal causa
    { from: '#fb7185', to: '#f43f5e', solid: '#fb7185' }, // 2°
    { from: '#fda4af', to: '#fb7185', solid: '#fda4af' }, // 3°
    { from: '#94a3b8', to: '#64748b', solid: '#94a3b8' }, // 4°
    { from: '#64748b', to: '#475569', solid: '#64748b' }  // 5° y subsiguientes
  ],
  // Estados de Dotación y Seguimiento
  pipeline: {
    enOjt: '#38bdf8',   // Sky tech
    iop: '#10b981',     // Emerald éxito
    baja: '#f43f5e',    // Rose alerta/baja
    metaD5: '#f59e0b'   // Ámbar meta
  }
};


export const lastCalloutPlugin = {
  id: 'ojtLastCallout',
  afterDatasetsDraw(chart) {
    const ds = chart.data.datasets.find((d) => d.yAxisID === 'y1' && !d.borderDash);
    if (!ds) return;
    const meta = chart.getDatasetMeta(chart.data.datasets.indexOf(ds));
    const point = meta.data[meta.data.length - 1];
    const value = ds.data[ds.data.length - 1];
    if (!point || value == null) return;

    const { ctx } = chart;
    const label = `${Number(value).toFixed(1)}%`;
    ctx.save();
    ctx.font = "700 10px Inter, system-ui, sans-serif";
    const w = ctx.measureText(label).width + 12;
    const x = Math.min(point.x + 10, chart.chartArea.right - w - 2);
    const y = Math.max(chart.chartArea.top + 2, point.y - 16);
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = 'rgba(56,189,248,0.55)';
    ctx.lineWidth = 1;
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(x, y, w, 16, 8);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillRect(x, y, w, 16);
      ctx.strokeRect(x, y, w, 16);
    }
    ctx.fillStyle = '#e2e8f0';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + 6, y + 8);
    ctx.restore();
  }
};

export const tooltipOjt = {
  backgroundColor: '#0b1224',
  borderColor: 'rgba(148,163,184,0.22)',
  borderWidth: 1,
  titleColor: '#f8fafc',
  bodyColor: '#cbd5e1',
  padding: 8
};

export const ejeXOjt = {
  grid: { display: false },
  ticks: { color: '#64748b', font: { size: 10, weight: '600' }, padding: 4 },
  border: { display: false }
};

export function ejeYOjt(extra = {}) {
  return {
    position: 'left',
    grid: { color: 'rgba(148,163,184,0.12)', drawTicks: false },
    ticks: {
      color: '#64748b',
      font: { size: 9 },
      maxTicksLimit: 5,
      callback: (v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v)
    },
    border: { display: false },
    ...extra
  };
}

export function ejeYPctOjt(extra = {}) {
  return {
    position: 'right',
    min: 0,
    grid: { drawOnChartArea: false },
    ticks: {
      color: '#64748b',
      font: { size: 9 },
      maxTicksLimit: 5,
      callback: (v) => `${v}%`
    },
    border: { display: false },
    ...extra
  };
}
