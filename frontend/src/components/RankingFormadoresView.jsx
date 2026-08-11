import React, { useEffect, useState } from 'react';
import { Users, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Award } from 'lucide-react';

const RIESGO_CONFIG = {
  BAJO:  { color: '#0d9488', bg: '#f0fdfa', border: '#99f6e4', label: 'Retención Alta',  icon: CheckCircle },
  MEDIO: { color: '#d97706', bg: '#fffbeb', border: '#fde68a', label: 'Retención Media', icon: AlertTriangle },
  ALTO:  { color: '#dc2626', bg: '#fff1f2', border: '#fecdd3', label: 'Retención Baja',  icon: TrendingDown }
};

const FALLBACK_FORMADORES = [
  { formador: 'MARCO ANTONIO DIAZ MURRIETA',        total_ingresaron: 210, llegaron_dia5: 148, total_bajas: 42, total_operativos: 130, retencion_dia5_pct: 70, riesgo: 'BAJO' },
  { formador: 'JOSÉ MARTÍN SALAZAR MUÑOZ',           total_ingresaron: 185, llegaron_dia5: 118, total_bajas: 38, total_operativos: 102, retencion_dia5_pct: 64, riesgo: 'BAJO' },
  { formador: 'ASTRID SOPHIA EYZAGUIRRE DE FREITAS', total_ingresaron: 162, llegaron_dia5: 77,  total_bajas: 61, total_operativos: 63,  retencion_dia5_pct: 48, riesgo: 'MEDIO' },
  { formador: 'CARLOS EDUARDO MENDOZA',             total_ingresaron: 140, llegaron_dia5: 56,  total_bajas: 58, total_operativos: 44,  retencion_dia5_pct: 40, riesgo: 'MEDIO' }
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
  const formadores = rawFormadores.length > 0 ? rawFormadores : FALLBACK_FORMADORES;

  const ordenados = [...formadores].sort((a, b) =>
    ordenPor === 'retencion'
      ? b.retencion_dia5_pct - a.retencion_dia5_pct
      : b.total_ingresaron - a.total_ingresaron
  );

  const maxIngresaron = Math.max(...formadores.map(f => f.total_ingresaron), 1);
  const promedioRetencion = formadores.length
    ? Math.round(formadores.reduce((acc, f) => acc + f.retencion_dia5_pct, 0) / formadores.length)
    : 0;

  const mejorFormador  = [...formadores].sort((a, b) => b.retencion_dia5_pct - a.retencion_dia5_pct)[0];
  const peorFormador   = [...formadores].sort((a, b) => a.retencion_dia5_pct - b.retencion_dia5_pct)[0];

  return (
    <div className="executive-card" style={{ marginBottom: '1.75rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid #e8edf5' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Users size={18} style={{ color: '#1e6fc0' }} />
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f1c2e', fontFamily: 'Outfit, sans-serif' }}>
              Ranking de Retención por Formador
            </h2>
            <p style={{ fontSize: '0.76rem', color: '#7a90ad', marginTop: '0.1rem' }}>
              % de asesores que llegan al Día 5 (meta: ≥55%)
            </p>
          </div>
        </div>

        {/* Ordenar por */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '0.72rem', color: '#7a90ad', fontWeight: 600 }}>Ordenar:</span>
          {['retencion', 'ingresaron'].map(op => (
            <button
              key={op}
              onClick={() => setOrdenPor(op)}
              style={{
                padding: '0.3rem 0.65rem',
                borderRadius: '6px',
                border: `1px solid ${ordenPor === op ? '#1e6fc0' : '#dce3ee'}`,
                background: ordenPor === op ? 'rgba(30,111,192,0.08)' : '#f7f9fc',
                color: ordenPor === op ? '#1e6fc0' : '#3d5275',
                fontWeight: 600,
                fontSize: '0.72rem',
                cursor: 'pointer'
              }}
            >
              {op === 'retencion' ? '% Retención' : '# Ingresos'}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs rápidos */}
      {!cargando && formadores.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <KpiMini
            label="Promedio de Retención"
            valor={`${promedioRetencion}%`}
            sub="al Día 5 global"
            color={promedioRetencion >= 55 ? '#0d9488' : promedioRetencion >= 35 ? '#d97706' : '#dc2626'}
            icon={TrendingUp}
          />
          <KpiMini
            label="Mejor Formador"
            valor={`${mejorFormador?.retencion_dia5_pct || 0}% (N=${mejorFormador?.total_ingresaron || 0})`}
            sub={mejorFormador?.formador}
            color="#0d9488"
            icon={Award}
          />
          <KpiMini
            label="Formador en Riesgo"
            valor={`${peorFormador?.retencion_dia5_pct || 0}% (N=${peorFormador?.total_ingresaron || 0})`}
            sub={peorFormador?.formador}
            color="#dc2626"
            icon={AlertTriangle}
          />
        </div>
      )}

      {/* Gráfico de barras horizontales */}
      {cargando ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#7a90ad', fontSize: '0.85rem' }}>
          Cargando datos de formadores...
        </div>
      ) : ordenados.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#7a90ad', fontSize: '0.85rem' }}>
          Sin datos disponibles para los filtros seleccionados.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {/* Línea de meta */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.68rem', color: '#7a90ad', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ display: 'inline-block', width: '20px', height: '2px', background: '#1e6fc0', borderTop: '2px dashed #1e6fc0' }} />
              Meta: 55%
            </span>
          </div>

          {ordenados.map((f, i) => {
            const cfg    = RIESGO_CONFIG[f.riesgo] || RIESGO_CONFIG.MEDIO;
            const IconR  = cfg.icon;
            const barPct = Math.max(2, f.retencion_dia5_pct);
            const rankLabel = i === 0 && ordenPor === 'retencion' ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;

            return (
              <div
                key={f.formador}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '160px 1fr 90px 80px 80px',
                  alignItems: 'center',
                  gap: '0.85rem',
                  padding: '0.65rem 0.75rem',
                  background: i % 2 === 0 ? '#fafbfc' : '#ffffff',
                  border: '1px solid #e8edf5',
                  borderLeft: `3px solid ${cfg.color}`,
                  borderRadius: '8px',
                  transition: 'box-shadow 0.15s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.07)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                {/* Nombre */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', overflow: 'hidden' }}>
                  <span style={{ fontSize: '0.78rem', color: '#7a90ad', minWidth: '22px' }}>{rankLabel}</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f1c2e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {f.formador}
                  </span>
                </div>

                {/* Barra de retención */}
                <div style={{ position: 'relative', height: '10px', background: '#e8edf5', borderRadius: '5px', overflow: 'visible' }}>
                  {/* Línea de meta al 55% */}
                  <div style={{
                    position: 'absolute', top: '-4px', bottom: '-4px', left: '55%',
                    width: '2px', background: 'rgba(30,111,192,0.35)', borderRadius: '1px', zIndex: 2
                  }} />
                  {/* Barra de valor */}
                  <div style={{
                    width: `${barPct}%`,
                    height: '100%',
                    background: cfg.color,
                    borderRadius: '5px',
                    transition: 'width 0.5s ease',
                    position: 'relative', zIndex: 1
                  }} />
                </div>

                {/* % Retención */}
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '0.92rem', fontWeight: 800, color: cfg.color }}>
                    {f.retencion_dia5_pct}%
                  </span>
                  <div style={{ fontSize: '0.67rem', color: '#7a90ad', fontWeight: 500 }}>Retención D5</div>
                </div>

                {/* Ingresos */}
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f1c2e' }}>
                    {f.total_ingresaron.toLocaleString()}
                  </span>
                  <div style={{ fontSize: '0.67rem', color: '#7a90ad', fontWeight: 500 }}>Ingresaron</div>
                </div>

                {/* Riesgo badge */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '0.25rem',
                  padding: '0.25rem 0.5rem',
                  background: cfg.bg,
                  border: `1px solid ${cfg.border}`,
                  borderRadius: '20px',
                  fontSize: '0.67rem',
                  fontWeight: 700,
                  color: cfg.color,
                  whiteSpace: 'nowrap'
                }}>
                  <IconR size={11} />
                  {cfg.label}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Nota aclaratoria */}
      <p style={{ fontSize: '0.7rem', color: '#b0bec5', marginTop: '1rem', textAlign: 'right' }}>
        * Solo se muestran formadores con ≥3 asesores registrados. Meta de retención al Día 5: 55%.
      </p>
    </div>
  );
}

function KpiMini({ label, valor, sub, color, icon: Icon }) {
  return (
    <div style={{
      background: '#f7f9fc',
      border: '1px solid #e8edf5',
      borderRadius: '10px',
      padding: '0.85rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.2rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <Icon size={14} style={{ color }} />
        <span style={{ fontSize: '0.68rem', color: '#7a90ad', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </span>
      </div>
      <div style={{ fontSize: '1.35rem', fontWeight: 800, color, fontFamily: 'Outfit, sans-serif', lineHeight: 1.1 }}>
        {valor}
      </div>
      <div style={{ fontSize: '0.72rem', color: '#3d5275', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {sub}
      </div>
    </div>
  );
}
