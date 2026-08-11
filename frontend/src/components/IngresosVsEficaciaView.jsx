import React from 'react';

export default function IngresosVsEficaciaView({ data }) {
  const cohortes = [
    { fecha: 'Cohorte 05-08', ingresos: 120, kpiAvg: 74.2 },
    { fecha: 'Cohorte 05-15', ingresos: 185, kpiAvg: 68.5 },
    { fecha: 'Cohorte 05-21', ingresos: 240, kpiAvg: 65.0 },
    { fecha: 'Cohorte 05-28', ingresos: 95, kpiAvg: 78.4 }
  ];

  return (
    <div className="executive-card" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e8edf5', paddingBottom: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f1c2e', fontFamily: 'Outfit, sans-serif' }}>
            Ingresos vs. Eficacia Operativa Histórica
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#7a90ad' }}>
            Muestra si al ingresar más personal (pico de barras), la calidad operativa (línea) cae por saturación
          </p>
        </div>
        <span style={{ fontSize: '0.7rem', background: '#fef3c7', color: '#92400e', padding: '0.25rem 0.6rem', borderRadius: '6px', fontWeight: 700 }}>
          COMBO COLUMN + LINE
        </span>
      </div>

      <div style={{ height: '160px', position: 'relative', width: '100%' }}>
        <svg viewBox="0 0 400 130" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          {/* Barras = Ingresos */}
          {cohortes.map((c, i) => {
            const x = 50 + i * 90;
            const barH = (c.ingresos / 250) * 90;
            return (
              <g key={i}>
                <rect x={x} y={110 - barH} width="35" height={barH} fill="#3b82f6" rx="4" opacity="0.85" />
                <text x={x + 17} y={105 - barH} fontSize="9" fill="#1e40af" fontWeight="bold" textAnchor="middle">{c.ingresos}</text>
                <text x={x + 17} y="125" fontSize="9" fill="#64748b" textAnchor="middle">{c.fecha}</text>
              </g>
            );
          })}

          {/* Línea = KPI Avg */}
          <polyline
            fill="none" stroke="#ef4444" strokeWidth="3"
            points="67,45 157,65 247,78 337,30"
          />

          {cohortes.map((c, i) => {
            const x = 67 + i * 90;
            const yMap = { 0: 45, 1: 65, 2: 78, 3: 30 };
            return (
              <circle key={i} cx={x} cy={yMap[i]} r="4" fill="#ef4444">
                <title>{`KPI Promedio: ${c.kpiAvg}%`}</title>
              </circle>
            );
          })}
        </svg>
      </div>

      <div style={{ display: 'flex', gap: '1.25rem', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9', fontSize: '0.73rem', fontWeight: 600 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#2563eb' }}>
          <div style={{ width: '10px', height: '10px', background: '#3b82f6', borderRadius: '2px' }} />
          Ingresantes a OP (Barras)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#ef4444' }}>
          <div style={{ width: '12px', height: '3px', background: '#ef4444' }} />
          Calidad Operativa Promedio % (Línea)
        </div>
      </div>
    </div>
  );
}
