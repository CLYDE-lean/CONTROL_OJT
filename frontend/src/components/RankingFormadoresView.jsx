import React, { useEffect, useState } from 'react';
import { Users, Award, Briefcase, X, ChevronDown } from 'lucide-react';

/* ─────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────── */
function formatNombreCorto(nombreCompleto) {
  if (!nombreCompleto) return 'Sin formador';
  const parts = nombreCompleto.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
}

/* configuración medallas */
const MEDAL_CFG = [
  { emoji: '🥇', glow: '#FFD700', ring: 'rgba(255,215,0,0.35)',  bg: 'linear-gradient(135deg,#7c5c00,#2a1f00)', sz: 52 },
  { emoji: '🥈', glow: '#C0C0C0', ring: 'rgba(192,192,192,0.3)', bg: 'linear-gradient(135deg,#4a4a4a,#1a1a1a)', sz: 44 },
  { emoji: '🥉', glow: '#CD7F32', ring: 'rgba(205,127,50,0.3)',  bg: 'linear-gradient(135deg,#5c3d1e,#1e1208)', sz: 44 },
  { emoji: null,  glow: '#38bdf8', ring: 'rgba(56,189,248,0.15)', bg: 'rgba(14,30,50,0.6)',                     sz: 38 },
  { emoji: null,  glow: '#38bdf8', ring: 'rgba(56,189,248,0.15)', bg: 'rgba(14,30,50,0.6)',                     sz: 38 },
];

const FALLBACK_FORMADORES = [
  { formador: 'DANILO ALDAIR VELASQUEZ TESEN',   total_ingresaron: 127, total_ftes: 127.0, full_time: 127, part_time: 0, llegaron_dia5: 39, total_bajas: 87, total_operativos: 40 },
  { formador: 'KAROL XIOMARA RUMINO PELAEZ',     total_ingresaron: 93,  total_ftes: 93.0,  full_time: 93,  part_time: 0, llegaron_dia5: 34, total_bajas: 60, total_operativos: 33 },
  { formador: 'DANIELA ESPERANZA BALLUMBROSIO', total_ingresaron: 57,  total_ftes: 57.0,  full_time: 57,  part_time: 0, llegaron_dia5: 12, total_bajas: 40, total_operativos: 17 },
  { formador: 'RENZO AARON FRANCIA WIDDUP',      total_ingresaron: 53,  total_ftes: 53.0,  full_time: 53,  part_time: 0, llegaron_dia5: 15, total_bajas: 38, total_operativos: 15 },
  { formador: 'FLAVIO HERNÁN GUTIÉRREZ CANO',   total_ingresaron: 42,  total_ftes: 42.0,  full_time: 42,  part_time: 0, llegaron_dia5: 15, total_bajas: 27, total_operativos: 15 },
  { formador: 'JOSÉ MARTÍN SALAZAR MUÑOZ',      total_ingresaron: 41,  total_ftes: 41.0,  full_time: 41,  part_time: 0, llegaron_dia5: 18, total_bajas: 24, total_operativos: 17 },
  { formador: 'PIERO ALEXANDRO QUISPE APOLINO', total_ingresaron: 34,  total_ftes: 34.0,  full_time: 34,  part_time: 0, llegaron_dia5: 1,  total_bajas: 34, total_operativos: 0 }
];

/* ─────────────────────────────────────────────────────────
   Componente principal
───────────────────────────────────────────────────────── */
export default function RankingFormadoresView({ filtros = {} }) {
  const [data,      setData]     = useState(null);
  const [cargando,  setCargando] = useState(true);
  const [modalOpen, setModal]    = useState(false);
  const [ordenPor,  setOrdenPor] = useState('personas');

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      try {
        const params = new URLSearchParams();
        if (filtros.campana)   params.set('campana',   filtros.campana);
        if (filtros.semana)    params.set('semana',    filtros.semana);
        if (filtros.modalidad) params.set('modalidad', filtros.modalidad);
        if (filtros.formador)  params.set('formador',  filtros.formador);
        if (filtros.grupo)     params.set('grupo',     filtros.grupo);
        const res  = await fetch(`/api/ojt/ranking-formadores?${params.toString()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.warn('Usando formadores de contingencia:', err);
        setData({ success: true, formadores: FALLBACK_FORMADORES, totales: { personas: 447, ftes: 447.0, full_time: 447, part_time: 0 } });
      } finally { setCargando(false); }
    };
    cargar();
  }, [filtros.campana, filtros.semana, filtros.modalidad, filtros.formador, filtros.grupo]);

  useEffect(() => {
    document.body.style.overflow = modalOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [modalOpen]);

  const rawFormadores = data?.formadores || [];
  const formadores = rawFormadores.map(f => ({
    ...f,
    total_ftes: Number(f.total_ftes !== undefined ? f.total_ftes : f.total_ingresaron),
    full_time:  Number(f.full_time  !== undefined ? f.full_time  : f.total_ingresaron),
    part_time:  Number(f.part_time  !== undefined ? f.part_time  : 0),
  }));

  const totales = data?.totales || {
    personas:  formadores.reduce((a, f) => a + (f.total_ingresaron || 0), 0),
    ftes:      formadores.reduce((a, f) => a + (f.total_ftes      || 0), 0),
    full_time: formadores.reduce((a, f) => a + (f.full_time       || 0), 0),
    part_time: formadores.reduce((a, f) => a + (f.part_time       || 0), 0),
  };

  const ordenados = [...formadores].sort((a, b) =>
    ordenPor === 'personas' ? b.total_ingresaron - a.total_ingresaron : b.total_ftes - a.total_ftes
  );
  const maxFte = Math.max(...formadores.map(f => f.total_ftes), 1);
  const top5   = ordenados.slice(0, 5);

  return (
    <>
    {/* ═══════ TARJETA PRINCIPAL — Vista Podio ═══════ */}
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '10px 12px',
      boxSizing: 'border-box',
      background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
      border: '1px solid rgba(251, 191, 36, 0.18)',
      borderRadius: '12px',
      boxShadow: '0 8px 24px rgba(2, 6, 23, 0.28)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Brillo decorativo de fondo */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 40% at 50% -10%, rgba(56,189,248,0.06) 0%, transparent 70%)',
      }} />

      {/* ── Encabezado ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '10px', flexShrink: 0, position: 'relative', zIndex: 1,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <h2 style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary,#f8fafc)', fontFamily: "'Inter',sans-serif", margin: 0 }}>
            Dotación por Formador
          </h2>
          <span style={{ fontSize: '0.62rem', color: '#64748b', fontFamily: "'Inter',sans-serif" }}>
            {totales.personas} personas · {formadores.length} formadores
          </span>
        </div>

        {/* Botón Ver */}
        <button
          onClick={() => setModal(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            background: 'rgba(56,189,248,0.1)',
            border: '1px solid rgba(56,189,248,0.3)',
            color: '#38bdf8', borderRadius: '6px', padding: '3px 10px',
            fontSize: '0.68rem', fontWeight: 600, fontFamily: "'Inter',sans-serif",
            cursor: 'pointer', transition: 'all 0.15s ease', flexShrink: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(56,189,248,0.2)'; e.currentTarget.style.borderColor = 'rgba(56,189,248,0.6)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(56,189,248,0.1)'; e.currentTarget.style.borderColor = 'rgba(56,189,248,0.3)'; }}
        >
          Ver <ChevronDown size={11} />
        </button>
      </div>

      {/* ── Contenido ── */}
      {cargando ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.75rem', fontFamily: "'Inter',sans-serif", position: 'relative', zIndex: 1 }}>
          Cargando...
        </div>
      ) : formadores.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.75rem', fontFamily: "'Inter',sans-serif", position: 'relative', zIndex: 1 }}>
          Sin datos para estos filtros.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, position: 'relative', zIndex: 1, justifyContent: 'center' }}>

          {(() => {
            const n = Math.max(top5.length, 1);
            const colInset = `calc(100% / ${n} / 2)`;
            const gridCols = {
              display: 'grid',
              gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`,
              width: '100%',
              alignItems: 'start'
            };
            const medalCfg = [
              { glow: '#fbbf24', ring: 'rgba(251,191,36,0.5)', bg: 'linear-gradient(135deg,#d97706,#78350f)', ribbon: 'linear-gradient(180deg,#f59e0b,#b45309)', text: '#fef08a' },
              { glow: '#e2e8f0', ring: 'rgba(226,232,240,0.5)', bg: 'linear-gradient(135deg,#94a3b8,#334155)', ribbon: 'linear-gradient(180deg,#cbd5e1,#64748b)', text: '#ffffff' },
              { glow: '#94a3b8', ring: 'rgba(148,163,184,0.4)', bg: 'linear-gradient(135deg,#64748b,#1e293b)', ribbon: 'linear-gradient(180deg,#94a3b8,#475569)', text: '#f1f5f9' },
              { glow: '#fb923c', ring: 'rgba(251,146,60,0.45)', bg: 'linear-gradient(135deg,#ea580c,#7c2d12)', ribbon: 'linear-gradient(180deg,#f97316,#c2410c)', text: '#ffedd5' },
              { glow: '#f43f5e', ring: 'rgba(244,63,94,0.45)',  bg: 'linear-gradient(135deg,#be123c,#4c0519)', ribbon: 'linear-gradient(180deg,#f43f5e,#9f1239)', text: '#ffe4e6' }
            ];

            return (
              <>
                <div style={gridCols}>
                  {top5.map((f, idx) => {
                    const cfg = medalCfg[idx] || { glow: '#38bdf8', ring: 'rgba(56,189,248,0.3)', bg: 'linear-gradient(135deg,#0284c7,#082f49)', ribbon: 'linear-gradient(180deg,#38bdf8,#0369a1)', text: '#e0f2fe' };
                    return (
                      <div key={f.formador} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        minWidth: 0
                      }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: cfg.bg,
                          border: `2px solid ${cfg.ring}`,
                          boxShadow: `0 0 12px ${cfg.glow}55, inset 0 0 6px rgba(0,0,0,0.4)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          position: 'relative',
                          zIndex: 2,
                          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                          cursor: 'pointer',
                          boxSizing: 'border-box'
                        }}
                          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = `0 0 18px ${cfg.glow}99`; }}
                          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)';   e.currentTarget.style.boxShadow = `0 0 12px ${cfg.glow}55, inset 0 0 6px rgba(0,0,0,0.4)`; }}
                          title={`${f.formador}: ${f.total_ingresaron} personas · D5 ${f.retencion_dia5_pct ?? 0}% · IOP ${f.total_egresados ?? f.total_operativos ?? 0}`}
                        >
                          <span style={{
                            fontSize: '0.88rem',
                            fontWeight: 800,
                            color: cfg.text,
                            fontFamily: "'JetBrains Mono', monospace",
                            lineHeight: 1,
                            textAlign: 'center',
                            textShadow: '0 1px 2px rgba(0,0,0,0.6)'
                          }}>
                            {f.total_ingresaron}
                          </span>
                        </div>
                        <div style={{
                          width: '18px',
                          height: '13px',
                          background: cfg.ribbon,
                          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 72%, 0 100%)',
                          marginTop: '-2px',
                          zIndex: 1,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                          flexShrink: 0
                        }} />
                      </div>
                    );
                  })}
                </div>

                <div style={{
                  ...gridCols,
                  position: 'relative',
                  alignItems: 'center',
                  height: '16px',
                  marginTop: '4px'
                }}>
                  <div style={{
                    position: 'absolute',
                    left: colInset,
                    right: colInset,
                    top: '50%',
                    height: '2.5px',
                    transform: 'translateY(-50%)',
                    background: 'linear-gradient(90deg, #38bdf8 0%, #818cf8 50%, #ec4899 100%)',
                    borderRadius: '2px',
                    boxShadow: '0 0 8px rgba(56,189,248,0.5)',
                    zIndex: 1,
                    pointerEvents: 'none'
                  }} />
                  {top5.map((f) => (
                    <div key={`dot-${f.formador}`} style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      position: 'relative',
                      zIndex: 2
                    }}>
                      <div style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: '#ffffff',
                        border: '2px solid #38bdf8',
                        boxSizing: 'border-box',
                        boxShadow: '0 0 6px #ffffff, 0 0 10px rgba(56,189,248,0.8)',
                        flexShrink: 0,
                        transition: 'transform 0.15s ease',
                        cursor: 'pointer'
                      }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.3)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                        title={f.formador}
                      />
                    </div>
                  ))}
                </div>

                <div style={{ ...gridCols, marginTop: '4px' }}>
                  {top5.map((f, idx) => (
                    <div key={`name-${f.formador}`} style={{
                      textAlign: 'center',
                      padding: '0 4px',
                      minWidth: 0
                    }}>
                      <span style={{
                        fontSize: '0.61rem',
                        fontWeight: 600,
                        color: idx === 0 ? '#fef08a' : '#cbd5e1',
                        fontFamily: "'Inter',sans-serif",
                        lineHeight: 1.15,
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }} title={f.formador}>
                        {formatNombreCorto(f.formador)}
                      </span>
                      <span style={{
                        fontSize: '0.58rem',
                        color: '#38bdf8',
                        fontFamily: "'JetBrains Mono',monospace",
                        fontWeight: 700,
                        display: 'block',
                        marginTop: '2px'
                      }}>
                        D5 {f.retencion_dia5_pct ?? 0}%
                      </span>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>

    {/* ═══════ MODAL — Lista Completa ═══════ */}
    {modalOpen && (
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px', boxSizing: 'border-box',
        }}
        onClick={e => { if (e.target === e.currentTarget) setModal(false); }}
      >
        <div style={{
          width: '100%', maxWidth: '620px', maxHeight: '88vh',
          background: 'linear-gradient(160deg,#0f172a 0%,#1e293b 100%)',
          border: '1px solid rgba(56,189,248,0.2)', borderRadius: '14px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 40px rgba(56,189,248,0.06)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>

          {/* Header modal */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)',
            flexShrink: 0, background: 'rgba(255,255,255,0.02)',
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc', fontFamily: "'Inter',sans-serif" }}>
                Dotación por Formador
              </h3>
              <span style={{ fontSize: '0.65rem', color: '#64748b', fontFamily: "'Inter',sans-serif" }}>
                {totales.personas} personas · {ordenados.length} formadores · {totales.ftes} FTEs
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Selector orden */}
              <div style={{ display: 'flex', gap: '2px', background: 'rgba(255,255,255,0.04)', padding: '2px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
                {[{ id: 'personas', label: '# Personas' }, { id: 'ftes', label: '# FTEs' }].map(op => {
                  const isA = ordenPor === op.id;
                  return (
                    <button key={op.id} onClick={() => setOrdenPor(op.id)} style={{
                      background: isA ? 'rgba(56,189,248,0.15)' : 'transparent',
                      border: isA ? '1px solid #38bdf8' : '1px solid transparent',
                      color: isA ? '#38bdf8' : '#94a3b8', borderRadius: '4px', padding: '2px 8px',
                      fontWeight: isA ? 700 : 500, fontSize: '0.62rem',
                      fontFamily: "'Inter',sans-serif", cursor: 'pointer', transition: 'all 0.15s ease',
                    }}>{op.label}</button>
                  );
                })}
              </div>
              <button onClick={() => setModal(false)} style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#94a3b8', borderRadius: '6px', width: '26px', height: '26px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.color = '#ef4444'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#94a3b8'; }}
              >
                <X size={13} />
              </button>
            </div>
          </div>

          {/* KPIs resumen */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
            <KpiMini label="Total Dotación"  valor={`${totales.personas}`}             extra={`${totales.ftes} FTE`}   sub="DNI únicos asignados"       color="#38bdf8" icon={Users}    />
            <KpiMini label="Mayor dotación"  valor={`${ordenados[0]?.total_ingresaron || 0}`} extra={`${ordenados[0]?.total_ftes || 0} FTE`} sub={formatNombreCorto(ordenados[0]?.formador)} color="#3C9D5C" icon={Award}    />
            <KpiMini label="Régimen FT / PT" valor={`${totales.full_time} FT · ${totales.part_time} PT`} sub="FT = 1.0 FTE | PT = 0.5 FTE" color="#a78bfa" icon={Briefcase} />
          </div>

          {/* Cabecera tabla */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'minmax(110px,1.5fr) minmax(40px,1fr) 56px 56px 80px',
            gap: '0.4rem', padding: '6px 18px',
            fontSize: '0.57rem', fontWeight: 600, color: '#475569',
            fontFamily: "'Inter',sans-serif", textTransform: 'uppercase', letterSpacing: '0.05em',
            borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0,
          }}>
            <span>Formador</span><span>Carga Relativa</span>
            <span style={{ textAlign: 'center' }}>Personas</span>
            <span style={{ textAlign: 'center' }}>FTEs</span>
            <span style={{ textAlign: 'right' }}>Régimen</span>
          </div>

          {/* Lista scrollable */}
          <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '6px 18px 14px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {ordenados.map((f, idx) => {
              const barPct = Math.min(100, Math.max(4, Math.round((f.total_ftes / maxFte) * 100)));
              const nombreCorto = formatNombreCorto(f.formador);
              const rankLabel   = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}º`;
              const isTop  = idx < 3;
              const accentC = ['#FFD700','#C0C0C0','#CD7F32'];
              const barColor = isTop
                ? `linear-gradient(90deg,${accentC[idx]}88,${accentC[idx]})`
                : 'linear-gradient(90deg,#0284c7,#38bdf8)';
              return (
                <div key={f.formador} style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(110px,1.5fr) minmax(40px,1fr) 56px 56px 80px',
                  alignItems: 'center', gap: '0.4rem', padding: '7px 8px',
                  background: isTop ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.015)',
                  border: isTop ? `1px solid ${accentC[idx]}22` : '1px solid transparent',
                  borderRadius: '7px', transition: 'background 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(56,189,248,0.05)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = isTop ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.015)'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                    <span style={{ fontSize: '0.72rem', minWidth: '20px', textAlign: 'center', lineHeight: 1 }}>{rankLabel}</span>
                    <span style={{
                      fontSize: '0.72rem', fontWeight: isTop ? 700 : 600,
                      color: isTop ? '#f1f5f9' : '#94a3b8',
                      fontFamily: "'Inter',sans-serif",
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }} title={f.formador}>{nombreCorto}</span>
                  </div>
                  <div style={{ position: 'relative', height: '6px', background: 'rgba(255,255,255,0.07)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${barPct}%`, height: '100%', background: barColor, borderRadius: '3px', transition: 'width 0.35s ease' }} />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#f8fafc', fontFamily: "'JetBrains Mono',monospace" }}>{f.total_ingresaron}</span>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#38bdf8', fontFamily: "'JetBrains Mono',monospace" }}>{f.total_ftes.toFixed(1)}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      display: 'inline-block', fontSize: '0.6rem', fontWeight: 600,
                      fontFamily: "'JetBrains Mono',monospace",
                      color: f.part_time > 0 ? '#fbbf24' : '#64748b',
                      background: f.part_time > 0 ? 'rgba(251,191,36,0.1)' : 'rgba(255,255,255,0.04)',
                      border: f.part_time > 0 ? '1px solid rgba(251,191,36,0.25)' : '1px solid rgba(255,255,255,0.07)',
                      padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap',
                    }}>
                      {f.part_time > 0 ? `${f.full_time}FT·${f.part_time}PT` : `${f.full_time} FT`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    )}
    </>
  );
}

function KpiMini({ label, valor, sub, extra, color, icon: Icon }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)', borderRadius: '7px',
      border: '1px solid rgba(255,255,255,0.07)', padding: '7px 10px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px',
    }}>
      <div style={{ overflow: 'hidden', flex: 1 }}>
        <span style={{ fontSize: '0.57rem', color: '#64748b', fontFamily: "'Inter',sans-serif", fontWeight: 500, display: 'block' }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: color || '#f8fafc', fontFamily: "'JetBrains Mono',monospace" }}>{valor}</span>
          {extra && <span style={{ fontSize: '0.6rem', color: '#38bdf8', fontWeight: 600, fontFamily: "'JetBrains Mono',monospace" }}>({extra})</span>}
        </div>
        {sub && <span style={{ fontSize: '0.6rem', color: '#94a3b8', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: "'Inter',sans-serif" }} title={sub}>{sub}</span>}
      </div>
      {Icon && (
        <div style={{
          width: '26px', height: '26px', borderRadius: '6px',
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon size={13} style={{ color }} />
        </div>
      )}
    </div>
  );
}
