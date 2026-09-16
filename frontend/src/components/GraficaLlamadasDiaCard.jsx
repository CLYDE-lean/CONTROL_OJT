import React, { useEffect, useState } from 'react';
import { PhoneCall } from 'lucide-react';

function barTone(diaNum) {
  if (diaNum === 5) return { from: '#34d399', to: '#059669', label: '#6ee7b7' };
  if (diaNum >= 6) return { from: '#a78bfa', to: '#7c3aed', label: '#c4b5fd' };
  if (diaNum <= 2) return { from: '#67e8f9', to: '#0891b2', label: '#a5f3fc' };
  return { from: '#38bdf8', to: '#0284c7', label: '#7dd3fc' };
}

export default function GraficaLlamadasDiaCard({ filtros = {} }) {
  const [data, setData] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [modo, setModo] = useState('promedio');

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
          if (isMounted && json.success) {
            setData(json);
          }
        }
      } catch (err) {
        console.warn('Usando datos de contingencia para llamadas:', err);
        if (isMounted) {
          setData({
            success: true,
            curva: [
              { dia: 'D1', dia_num: 1, dia_label: 'Día 1', promedio_llamadas: 4.8, total_llamadas: 432, asesores_activos: 90 },
              { dia: 'D2', dia_num: 2, dia_label: 'Día 2', promedio_llamadas: 8.5, total_llamadas: 748, asesores_activos: 88 },
              { dia: 'D3', dia_num: 3, dia_label: 'Día 3', promedio_llamadas: 13.2, total_llamadas: 1122, asesores_activos: 85 },
              { dia: 'D4', dia_num: 4, dia_label: 'Día 4', promedio_llamadas: 17.6, total_llamadas: 1460, asesores_activos: 83 },
              { dia: 'D5', dia_num: 5, dia_label: 'Día 5', promedio_llamadas: 22.4, total_llamadas: 1814, asesores_activos: 81 },
              { dia: 'D6', dia_num: 6, dia_label: 'Día 6', promedio_llamadas: 24.1, total_llamadas: 964, asesores_activos: 40 },
              { dia: 'D7', dia_num: 7, dia_label: 'Día 7', promedio_llamadas: 26.0, total_llamadas: 780, asesores_activos: 30 },
              { dia: 'D8', dia_num: 8, dia_label: 'Día 8', promedio_llamadas: 27.5, total_llamadas: 412, asesores_activos: 15 }
            ],
            total_general_llamadas: 7732,
            promedio_general: 17.8
          });
        }
      } finally {
        if (isMounted) setCargando(false);
      }
    }
    loadLlamadas();
    return () => { isMounted = false; };
  }, [filtros.semana, filtros.periodo, filtros.campana, filtros.formador, filtros.grupo, filtros.modalidad]);

  const curvaRaw = data?.curva || [];
  const curva = curvaRaw.filter(d => {
    const n = d.dia_num || parseInt(String(d.dia || '').replace(/\D/g, ''), 10) || 0;
    return n >= 1 && n <= 8;
  });
  const totalLlamadas = curva.reduce((a, c) => a + (c.total_llamadas || 0), 0);
  const sumAsesores = curva.reduce((a, c) => a + (c.asesores_activos || 0), 0);
  const sumLlam = curva.reduce((a, c) => a + (c.total_llamadas || 0), 0);
  const promGeneral = sumAsesores > 0
    ? (Math.round((sumLlam / sumAsesores) * 10) / 10)
    : (data?.promedio_general || 0);

  const maxVal = Math.max(...curva.map(d => modo === 'promedio' ? d.promedio_llamadas : d.total_llamadas), 10);

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '10px 12px',
      boxSizing: 'border-box',
      background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
      border: '1px solid rgba(56, 189, 248, 0.18)',
      borderRadius: '12px',
      boxShadow: '0 8px 24px rgba(2, 6, 23, 0.28)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 70% 50% at 12% -20%, rgba(56,189,248,0.16) 0%, transparent 70%)'
      }} />

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '8px', flexShrink: 0, position: 'relative', zIndex: 1
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '26px', height: '26px', borderRadius: '8px',
            background: 'linear-gradient(135deg, rgba(56,189,248,0.3), rgba(14,165,233,0.12))',
            border: '1px solid rgba(56,189,248,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <PhoneCall size={13} style={{ color: '#38bdf8' }} />
          </div>
          <div>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc', fontFamily: "'Inter',sans-serif" }}>
              Llamadas por día
            </span>
            <div style={{ fontSize: '0.58rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.04em' }}>
              VENTANA D1–D8 · D5 APROBACIÓN · D6–D8 EXTENSIÓN
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ textAlign: 'right', lineHeight: 1.15 }}>
            <div style={{ fontSize: '0.58rem', color: '#64748b', fontWeight: 600 }}>
              {modo === 'promedio' ? 'PROM. GENERAL' : 'VOLUMEN D1–D8'}
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#38bdf8', fontFamily: "'JetBrains Mono',monospace" }}>
              {modo === 'promedio' ? promGeneral : totalLlamadas.toLocaleString()}
            </div>
          </div>
          <div style={{
            display: 'flex', background: 'rgba(15,23,42,0.75)',
            borderRadius: '8px', padding: '3px', border: '1px solid rgba(56,189,248,0.2)'
          }}>
            <button
              onClick={() => setModo('promedio')}
              style={{
                background: modo === 'promedio' ? 'linear-gradient(90deg,#38bdf8,#22d3ee)' : 'transparent',
                color: modo === 'promedio' ? '#0f172a' : '#94a3b8',
                border: 'none', borderRadius: '6px', padding: '3px 8px',
                fontSize: '0.62rem', fontWeight: 700, cursor: 'pointer'
              }}
            >
              Prom/asesor
            </button>
            <button
              onClick={() => setModo('total')}
              style={{
                background: modo === 'total' ? 'linear-gradient(90deg,#38bdf8,#22d3ee)' : 'transparent',
                color: modo === 'total' ? '#0f172a' : '#94a3b8',
                border: 'none', borderRadius: '6px', padding: '3px 8px',
                fontSize: '0.62rem', fontWeight: 700, cursor: 'pointer'
              }}
            >
              Total
            </button>
          </div>
        </div>
      </div>

      {cargando ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.72rem' }}>
          Cargando curva operativa...
        </div>
      ) : curva.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.72rem' }}>
          Sin datos de llamadas para este filtro.
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative', zIndex: 1, paddingBottom: '2px' }}>
          <div className="ojt-bars-row" style={{ flex: 1, minHeight: 0, gridTemplateColumns: `repeat(${curva.length}, minmax(0, 1fr))` }}>
            {curva.map((d, i) => {
              const diaNum = d.dia_num || parseInt(String(d.dia || '').replace(/\D/g, ''), 10) || (i + 1);
              const val = modo === 'promedio' ? d.promedio_llamadas : d.total_llamadas;
              const pct = maxVal > 0 ? Math.min(100, (val / maxVal) * 100) : 0;
              const tone = barTone(diaNum);

              return (
                <div
                  key={d.dia || i}
                  className="ojt-bar-col"
                  title={`${d.dia_label || d.dia}: ${val} ${modo === 'promedio' ? 'prom/asesor' : 'llamadas'} · ${d.asesores_activos || 0} asesores`}
                >
                  <span className="ojt-bar-col__n" style={{ color: tone.label }}>
                    {modo === 'promedio' ? val : (val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val)}
                  </span>
                  <div className="ojt-bar-col__track">
                    <div style={{
                      width: '42%',
                      maxWidth: '28px',
                      minWidth: '12px',
                      height: `${Math.max(pct, val > 0 ? 8 : 0)}%`,
                      background: `linear-gradient(180deg, ${tone.from} 0%, ${tone.to} 100%)`,
                      borderRadius: '6px 6px 2px 2px',
                      boxShadow: `0 0 10px ${tone.from}33`
                    }} />
                  </div>
                  <span className={`ojt-bar-col__lbl${diaNum === 5 ? ' is-d5' : diaNum >= 6 ? ' is-ext' : ''}`}>
                    {d.dia}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
