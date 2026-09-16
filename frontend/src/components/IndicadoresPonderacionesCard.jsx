import React from 'react';

/**
 * Componente: IndicadoresPonderacionesCard
 * Tabla ejecutiva Cyberpunk HUD con metas, ponderaciones y valores actuales de:
 * - Calidad emitida
 * - tNPS
 * - Transferencia
 */
export default function IndicadoresPonderacionesCard({ indicadores = [] }) {
  // Datos predeterminados que coinciden exactamente con el mock aprobado
  const defaultItems = [
    { indicador: 'Calidad emitida', meta: '73%', peso: '40%', actual: '—', semaforo: 'ROJO' },
    { indicador: 'tNPS', meta: '73%', peso: '40%', actual: '—', semaforo: 'ROJO' },
    { indicador: 'Transferencia', meta: '75%', peso: '20%', actual: '—', semaforo: 'ROJO' }
  ];

  const items = (indicadores && indicadores.length >= 3)
    ? indicadores.map(item => {
        const rawActual = item.promedio_actual ?? item.actual;
        const actualNum = rawActual === null || rawActual === undefined || rawActual === '' ? null : parseFloat(rawActual);
        const metaNum = parseFloat(item.meta_ojt ?? item.meta) || 73;
        const objNum = parseFloat(item.obj_cump) || 65;
        let semaforo = item.semaforo;
        if (!semaforo) {
          if (actualNum === null || Number.isNaN(actualNum)) semaforo = 'ROJO';
          else if (actualNum >= metaNum) semaforo = 'VERDE';
          else if (actualNum >= objNum) semaforo = 'AMARILLO';
          else semaforo = 'ROJO';
        }

        return {
          indicador: item.indicador,
          meta: `${metaNum}%`,
          peso: `${item.peso_pct ?? item.peso ?? 40}%`,
          actual: actualNum === null || Number.isNaN(actualNum) ? '—' : `${actualNum}%`,
          semaforo
        };
      })
    : defaultItems;

  return (
    <div style={{
      background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
      borderRadius: '12px',
      border: '1px solid rgba(251, 191, 36, 0.16)',
      boxShadow: '0 8px 24px rgba(2, 6, 23, 0.28)',
      padding: '10px 14px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%',
      boxSizing: 'border-box',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '6px'
      }}>
        <h3 style={{
          fontSize: '0.8rem',
          fontWeight: 700,
          color: '#f8fafc',
          fontFamily: "Inter, -apple-system, sans-serif",
          letterSpacing: '-0.01em',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          Indicadores oficiales OJT
        </h3>
        <span style={{
          fontSize: '0.62rem',
          color: '#94a3b8',
          fontWeight: 600,
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '2px 6px',
          borderRadius: '4px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          Metas y ponderaciones
        </span>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-around', minHeight: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'clamp(0.68rem, 0.75vw, 0.78rem)', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '44%' }} />
            <col style={{ width: '18%' }} />
            <col style={{ width: '18%' }} />
            <col style={{ width: '20%' }} />
          </colgroup>
          <thead>
            <tr style={{ color: '#94a3b8', textAlign: 'left', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', fontFamily: 'Inter, -apple-system, sans-serif', fontSize: 'clamp(0.6rem, 0.65vw, 0.7rem)' }}>
              <th style={{ padding: 'clamp(3px, 0.6vh, 6px) 0', fontWeight: 600 }}>INDICADOR</th>
              <th style={{ padding: 'clamp(3px, 0.6vh, 6px) 0', textAlign: 'center', fontWeight: 600 }}>META</th>
              <th style={{ padding: 'clamp(3px, 0.6vh, 6px) 0', textAlign: 'center', fontWeight: 600 }}>PESO</th>
              <th style={{ padding: 'clamp(3px, 0.6vh, 6px) 0', textAlign: 'right', fontWeight: 600 }}>ACTUAL</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row, idx) => (
              <tr key={idx} style={{ borderBottom: idx < items.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none' }}>
                <td style={{ padding: 'clamp(5px, 1.1vh, 10px) 0', color: '#e2e8f0', fontWeight: 500, fontFamily: 'Inter, -apple-system, sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={row.indicador}>
                  {row.indicador}
                </td>
                <td style={{ padding: 'clamp(5px, 1.1vh, 10px) 0', textAlign: 'center', color: '#38bdf8', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
                  {row.meta}
                </td>
                <td style={{ padding: 'clamp(5px, 1.1vh, 10px) 0', textAlign: 'center', color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
                  {row.peso}
                </td>
                <td style={{
                  padding: 'clamp(5px, 1.1vh, 10px) 0',
                  textAlign: 'right',
                  fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 'clamp(0.72rem, 0.8vw, 0.84rem)',
                  color: row.semaforo === 'VERDE' ? '#3C9D5C' : row.semaforo === 'AMARILLO' ? '#D9822B' : '#D9534F'
                }}>
                  {row.actual}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
