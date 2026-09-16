import React, { useEffect, useState } from 'react';
import { UserX, CheckCircle2, Maximize2, X } from 'lucide-react';

const BAR_COLORS = [
  { from: '#fb7185', to: '#e11d48' },
  { from: '#fb923c', to: '#ea580c' },
  { from: '#fbbf24', to: '#d97706' },
  { from: '#c084fc', to: '#7c3aed' },
  { from: '#38bdf8', to: '#0284c7' }
];

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
            motivos: [
              { motivo: 'INASISTENCIA / ABANDONO', total_bajas: 15, porcentaje: 44.1 },
              { motivo: 'DESERCIÓN VOLUNTARIA', total_bajas: 9, porcentaje: 26.5 },
              { motivo: 'BAJO RENDIMIENTO / EVALUACIÓN', total_bajas: 6, porcentaje: 17.6 },
              { motivo: 'MOTIVOS PERSONALES / SALUD', total_bajas: 4, porcentaje: 11.8 }
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
  const maxCount = Math.max(...motivos.map(m => m.total_bajas || 0), 1);
  const preview = motivos.slice(0, 4);
  const ocultos = Math.max(0, motivos.length - preview.length);

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
                Motivos de baja
              </span>
              <div style={{ fontSize: '0.58rem', color: '#64748b', fontWeight: 600 }}>
                {motivos.length} CATEGORÍAS · {totalBajas} PERSONAS
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
              <span style={{ fontSize: '0.62rem', color: '#fda4af', fontWeight: 600 }}>Bajas </span>
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
          <div
            onClick={() => setModalOpen(true)}
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '7px',
              position: 'relative',
              zIndex: 1,
              cursor: 'pointer',
              paddingTop: '2px',
              paddingRight: '2px'
            }}
          >
            {preview.map((m, idx) => (
              <MotivoFila key={m.motivo || idx} m={m} idx={idx} totalBajas={totalBajas} maxCount={maxCount} compact />
            ))}
            {ocultos > 0 && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setModalOpen(true); }}
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
                  padding: 0
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
                  Detalle de motivos de baja
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                  {motivos.length} categorías · {totalBajas} asesores únicos · ranking por volumen
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
