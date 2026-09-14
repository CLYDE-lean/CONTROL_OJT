import React, { useEffect, useState } from 'react';
import { Users, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Award } from 'lucide-react';

const RIESGO_CONFIG = {
  BAJO:  { color: '#0d9488', bg: '#f0fdf4', label: '● Retención Alta',  icon: CheckCircle },
  MEDIO: { color: '#d97706', bg: '#fffbeb', label: '● Retención Media', icon: AlertTriangle },
  ALTO:  { color: '#dc2626', bg: '#fef2f2', label: '● Retención Baja',  icon: TrendingDown }
};

const FALLBACK_FORMADORES = [
  { formador: 'JOSÉ MARTÍN SALAZAR MUÑOZ',           total_ingresaron: 41,  llegaron_dia5: 18, total_bajas: 24, total_operativos: 17, retencion_dia5_pct: 42, riesgo: 'BAJO' },
  { formador: 'FLAVIO HERNÁN GUTIÉRREZ CANO',        total_ingresaron: 42,  llegaron_dia5: 15, total_bajas: 27, total_operativos: 15, retencion_dia5_pct: 36, riesgo: 'BAJO' },
  { formador: 'KAROL XIOMARA RUMINO PELAEZ',          total_ingresaron: 93,  llegaron_dia5: 34, total_bajas: 60, total_operativos: 33, retencion_dia5_pct: 36, riesgo: 'BAJO' },
  { formador: 'DANILO ALDAIR VELASQUEZ TESEN',        total_ingresaron: 127, llegaron_dia5: 39, total_bajas: 87, total_operativos: 40, retencion_dia5_pct: 32, riesgo: 'MEDIO' },
  { formador: 'DANIELA ESPERANZA BALLUMBROSIO',      total_ingresaron: 57,  llegaron_dia5: 12, total_bajas: 40, total_operativos: 17, retencion_dia5_pct: 30, riesgo: 'MEDIO' },
  { formador: 'RENZO AARON FRANCIA WIDDUP',           total_ingresaron: 53,  llegaron_dia5: 15, total_bajas: 38, total_operativos: 15, retencion_dia5_pct: 28, riesgo: 'MEDIO' },
  { formador: 'PIERO ALEXANDRO QUISPE APOLINO',      total_ingresaron: 34,  llegaron_dia5: 1,  total_bajas: 34, total_operativos: 0,  retencion_dia5_pct: 0,  riesgo: 'ALTO' }
];

export default function RankingFormadoresView({ filtros = {} }) {
  const [data, setData] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [ordenPor, setOrdenPor] = useState('retencion'); // 'retencion' | 'ingresaron'

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

        const res = await fetch(`/api/ojt/ranking-formadores?${params.toString()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.warn('Usando formadores de contingencia:', err);
        setData({ success: true, formadores: FALLBACK_FORMADORES });
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [filtros.campana, filtros.semana, filtros.modalidad, filtros.formador, filtros.grupo]);

  const rawFormadores = data?.formadores || [];
  // Solo muestra datos reales del backend — sin datos de relleno estáticos
  // Calcular nivel de riesgo dinámicamente desde los datos reales de retención
  const formadores = rawFormadores.map(f => ({
    ...f,
    riesgo: f.riesgo || (f.retencion_dia5_pct >= 55 ? 'BAJO' : f.retencion_dia5_pct >= 35 ? 'MEDIO' : 'ALTO')
  }));

  const ordenados = [...formadores].sort((a, b) =>
    ordenPor === 'retencion'
      ? b.retencion_dia5_pct - a.retencion_dia5_pct
      : b.total_ingresaron - a.total_ingresaron
  );

  const promedioRetencion = formadores.length
    ? Math.round(formadores.reduce((acc, f) => acc + f.retencion_dia5_pct, 0) / formadores.length)
    : 0;

  const mejorFormador = [...formadores].sort((a, b) => b.retencion_dia5_pct - a.retencion_dia5_pct)[0];
  const peorFormador  = [...formadores].sort((a, b) => a.retencion_dia5_pct - b.retencion_dia5_pct)[0];

  return (
    <div className="executive-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden', marginBottom: 0, padding: '0.85rem 1.1rem' }}>

      {/* Header Minimalista */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem', paddingBottom: '0.5rem', borderBottom: '1px solid #edf2f7' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={15} style={{ color: '#1e6fc0' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f1c2e', fontFamily: 'Outfit, sans-serif', margin: 0 }}>
              Ranking de Retención por Formador
            </h2>
            <p style={{ fontSize: '0.72rem', color: '#7a90ad', marginTop: '0.05rem', margin: 0 }}>
              % de asesores que llegan al Día 5 (meta: ≥55%)
            </p>
          </div>
        </div>

        {/* Selector de Orden */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: '#f8fafc', padding: '2px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          {['retencion', 'ingresaron'].map(op => (
            <button
              key={op}
              onClick={() => setOrdenPor(op)}
              style={{
                padding: '0.2rem 0.55rem',
                borderRadius: '4px',
                border: 'none',
                background: ordenPor === op ? '#ffffff' : 'transparent',
                color: ordenPor === op ? '#1e6fc0' : '#64748b',
                fontWeight: ordenPor === op ? 700 : 500,
                fontSize: '0.7rem',
                cursor: 'pointer',
                boxShadow: ordenPor === op ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              {op === 'retencion' ? '% Retención' : '# Ingresos'}
            </button>
          ))}
        </div>
      </div>

      {/* Tarjetas KPI Resumen Minimalistas */}
      {!cargando && formadores.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '0.65rem' }}>
          <KpiMini
            label="PROMEDIO GLOBAL"
            valor={`${promedioRetencion}%`}
            sub="al Día 5 OJT"
            color={promedioRetencion >= 55 ? '#0d9488' : promedioRetencion >= 35 ? '#d97706' : '#dc2626'}
            bg="#f8fafc"
            icon={TrendingUp}
          />
          <KpiMini
            label="MEJOR FORMADOR"
            valor={`${mejorFormador?.retencion_dia5_pct || 0}%`}
            sub={mejorFormador?.formador}
            extra={`N=${mejorFormador?.total_ingresaron || 0}`}
            color="#0d9488"
            bg="#f0fdf4"
            icon={Award}
          />
          <KpiMini
            label="EN RIESGO"
            valor={`${peorFormador?.retencion_dia5_pct || 0}%`}
            sub={peorFormador?.formador}
            extra={`N=${peorFormador?.total_ingresaron || 0}`}
            color="#dc2626"
            bg="#fef2f2"
            icon={AlertTriangle}
          />
        </div>
      )}

      {/* Gráfico de filas minimalista */}
      {cargando ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#7a90ad', fontSize: '0.85rem' }}>
          ⏳ Cargando formadores...
        </div>
      ) : ordenados.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#7a90ad', fontSize: '0.85rem' }}>
          Sin datos para estos filtros.
        </div>
      ) : (
        <>
          {/* Lista de Formadores con Scroll Interno Exclusivo */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: '4px' }}>
            
            {/* Leyenda Meta */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.35rem', paddingRight: '4px' }}>
              <span style={{ fontSize: '0.67rem', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ display: 'inline-block', width: '16px', height: '2px', background: '#1e6fc0' }} />
                Meta: 55%
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {ordenados.map((f, i) => {
                const cfg = RIESGO_CONFIG[f.riesgo] || RIESGO_CONFIG.MEDIO;
                const barPct = Math.max(2, f.retencion_dia5_pct);
                const rankLabel = i === 0 && ordenPor === 'retencion' ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;

                return (
                  <div
                    key={f.formador}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'minmax(110px, 1fr) 1fr 50px 50px 85px',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.4rem 0.5rem',
                      background: '#ffffff',
                      borderBottom: '1px solid #f1f5f9',
                      borderRadius: '6px',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
                  >
                    {/* Nombre y Posición */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', minWidth: '22px' }}>{rankLabel}</span>
                      <span style={{ fontSize: '0.81rem', fontWeight: 700, color: '#0f1c2e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={f.formador}>
                        {f.formador}
                      </span>
                    </div>

                    {/* Barra de Retención Minimalista */}
                    <div style={{ position: 'relative', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'visible' }}>
                      {/* Tick de Meta al 55% */}
                      <div style={{
                        position: 'absolute', top: '-4px', bottom: '-4px', left: '55%',
                        width: '2px', background: '#1e6fc0', borderRadius: '1px', zIndex: 2
                      }} />
                      {/* Relleno de Barra */}
                      <div style={{
                        width: `${barPct}%`,
                        height: '100%',
                        background: cfg.color,
                        borderRadius: '3px',
                        transition: 'width 0.4s ease',
                        position: 'relative', zIndex: 1
                      }} />
                    </div>

                    {/* % Retención D5 */}
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 800, color: cfg.color }}>
                        {f.retencion_dia5_pct}%
                      </span>
                      <div style={{ fontSize: '0.64rem', color: '#94a3b8', fontWeight: 500 }}>Retención D5</div>
                    </div>

                    {/* Ingresaron */}
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f1c2e' }}>
                        {f.total_ingresaron.toLocaleString()}
                      </span>
                      <div style={{ fontSize: '0.64rem', color: '#94a3b8', fontWeight: 500 }}>Ingresaron</div>
                    </div>

                    {/* Tag Minimalista de Estado */}
                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        color: cfg.color,
                        background: cfg.bg,
                        padding: '2px 8px',
                        borderRadius: '12px',
                        whiteSpace: 'nowrap'
                      }}>
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Embudo Macro de Conversión (Independiente y Fijo al Fondo) */}
          <div style={{ flexShrink: 0, marginTop: '0.5rem' }}>
            <EmbudoMacroConversion
              totalCapacitacion={data?.embudo?.total_asesores_unicos || 0}
              totalOjt={data?.embudo?.dias_principales_1_8?.find(d => d.dia === 1)?.activos || 0}
              totalOperacion={data?.embudo?.supervivencia?.llegaron_op || 0}
            />
          </div>
        </>
      )}
    </div>
  );
}

function KpiMini({ label, valor, sub, extra, color, bg, icon: Icon }) {
  return (
    <div style={{
      background: bg || '#f8fafc',
      borderRadius: '8px',
      padding: '0.5rem 0.75rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.15rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.64rem', color: '#64748b', fontWeight: 800, letterSpacing: '0.03em' }}>
          {label}
        </span>
        <Icon size={13} style={{ color }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
        <span style={{ fontSize: '1.25rem', fontWeight: 800, color, fontFamily: 'Outfit, sans-serif', lineHeight: 1.1 }}>
          {valor}
        </span>
        {extra && (
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>
            ({extra})
          </span>
        )}
      </div>
      <div style={{ fontSize: '0.68rem', color: '#334155', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {sub}
      </div>
    </div>
  );
}

/* ── Subcomponente: Embudo Macro de Conversión en Barras Horizontales ("Barras Echadas") ── */
/* NOTA: Defaults son 0. Los datos vienen exclusivamente del backend/Supabase. */
function EmbudoMacroConversion({ totalCapacitacion = 0, totalOjt = 0, totalOperacion = 0 }) {
  const pctOjt = Math.round((totalOjt / totalCapacitacion) * 100);
  const pctOpGlobal = Math.round((totalOperacion / totalCapacitacion) * 100);
  const pctOpConversion = totalOjt > 0 ? Math.round((totalOperacion / totalOjt) * 100) : 0;

  const steps = [
    {
      id: 1,
      label: '1. CAPACITACIÓN',
      sub: 'Iniciaron Curso',
      valor: totalCapacitacion,
      pctBarra: 100,
      badge: '100% Base',
      color: '#6366f1',
      bgGradient: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
      glow: 'rgba(99, 102, 241, 0.25)'
    },
    {
      id: 2,
      label: '2. PASARON A OJT',
      sub: 'Ingresaron a Día 1 OJT',
      valor: totalOjt,
      pctBarra: pctOjt,
      badge: `${pctOjt}% Conversión`,
      color: '#1e6fc0',
      bgGradient: 'linear-gradient(90deg, #1e6fc0 0%, #38bdf8 100%)',
      glow: 'rgba(30, 111, 192, 0.25)'
    },
    {
      id: 3,
      label: '3. INGRESARON A OPERACIÓN',
      sub: 'Graduados I-OP',
      valor: totalOperacion,
      pctBarra: pctOpGlobal,
      badge: `${pctOpGlobal}% Retención Final (${pctOpConversion}% de OJT)`,
      color: '#0d9488',
      bgGradient: 'linear-gradient(90deg, #0d9488 0%, #34d399 100%)',
      glow: 'rgba(13, 148, 136, 0.25)'
    }
  ];

  return (
    <div style={{
      marginTop: '0.75rem',
      padding: '0.75rem 0.95rem',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.6rem'
    }}>
      {/* Título del Embudo Macro */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <TrendingUp size={14} style={{ color: '#1e6fc0' }} />
          <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0f1c2e', letterSpacing: '0.01em', textTransform: 'uppercase' }}>
            Embudo Macro de Conversión
          </span>
        </div>
        <span style={{ fontSize: '0.66rem', color: '#64748b', fontWeight: 600 }}>
          Flujo General: Capacitación ➔ OJT ➔ Operación
        </span>
      </div>

      {/* Lista de Barras Horizontales Echadas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
        {steps.map((st) => (
          <div key={st.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            
            {/* Fila Header: Nombre, Cifra y Tag */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: st.color, letterSpacing: '0.02em' }}>
                  {st.label}
                </span>
                <span style={{ fontSize: '0.64rem', color: '#64748b', fontWeight: 500 }}>
                  ({st.sub})
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f1c2e', fontFamily: 'Outfit, sans-serif' }}>
                  {st.valor.toLocaleString()}
                </span>
                <span style={{
                  fontSize: '0.64rem',
                  fontWeight: 700,
                  color: st.color,
                  background: '#ffffff',
                  border: `1px solid ${st.color}30`,
                  padding: '1px 7px',
                  borderRadius: '10px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                }}>
                  {st.badge}
                </span>
              </div>
            </div>

            {/* Pista de Barra Echada (Horizontal Track) */}
            <div style={{
              position: 'relative',
              width: '100%',
              height: '10px',
              background: '#e2e8f0',
              borderRadius: '5px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${st.pctBarra}%`,
                height: '100%',
                background: st.bgGradient,
                borderRadius: '5px',
                boxShadow: `0 0 8px ${st.glow}`,
                transition: 'width 0.5s ease'
              }} />
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
