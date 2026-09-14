import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Users, Award, AlertTriangle, BarChart2, DollarSign, ShieldAlert } from 'lucide-react';
import AutoFitStage from './AutoFitStage';
import RoiExtensionesView from './RoiExtensionesView';
import ComparativaModalidadView from './ComparativaModalidadView';
import FlashOjtResumenCard from './FlashOjtResumenCard';
import EmbudoEjecutivoOjtView from './EmbudoEjecutivoOjtView';
import HeatmapBajasView from './HeatmapBajasView';
import IngresosVsEficaciaView from './IngresosVsEficaciaView';
import RadarPerfilExitoSegmento from './RadarPerfilExitoSegmento';

// ── Gráficos SVG para Tarjetas KPI Horizontales (Vista Impacto / Gerencia) ──

function RadialGaugeArc({ pct = 50, color = '#0d9488', size = 105 }) {
  const radius = 25;
  const strokeWidth = 6;
  const circumference = Math.PI * radius;
  const fillVal = Math.min(100, Math.max(0, parseFloat(pct) || 0)) / 100;
  const dashOffset = circumference * (1 - fillVal);

  return (
    <div style={{ position: 'relative', width: size, height: size * 0.58, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <svg width={size} height={size * 0.56} viewBox="0 0 64 34">
        <path
          d="M 7,30 A 25,25 0 0,1 57,30"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <path
          d="M 7,30 A 25,25 0 0,1 57,30"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
        />
      </svg>
      <div style={{
        position: 'absolute',
        bottom: '-2px',
        fontSize: '1.25rem',
        fontWeight: 800,
        color: color,
        lineHeight: 1,
        fontFamily: 'Outfit, var(--font-heading)'
      }}>
        {pct}%
      </div>
    </div>
  );
}

function TrendAreaSparkline({ color = '#1e6fc0', width = 68, height = 34 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 68 34" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="gradGerenciaTotal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d="M 0,26 Q 16,30 24,14 T 48,22 T 68,6 L 68,34 L 0,34 Z" fill="url(#gradGerenciaTotal)" />
      <path d="M 0,26 Q 16,30 24,14 T 48,22 T 68,6" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <circle cx="68" cy="6" r="2.5" fill={color} />
    </svg>
  );
}

function AlertStatusRing({ count = 0, size = 68 }) {
  const isOk = count === 0;
  const color = isOk ? '#0d9488' : '#dc2626';

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} viewBox="0 0 40 40">
        <circle
          cx="20" cy="20" r="15"
          fill="transparent"
          stroke="#e2e8f0"
          strokeWidth="3.6"
        />
        <circle
          cx="20" cy="20" r="15"
          fill="transparent"
          stroke={color}
          strokeWidth="3.6"
          strokeDasharray={isOk ? "94.2 0" : "30 64"}
          strokeLinecap="round"
        />
      </svg>
      <div style={{ position: 'absolute', textAlign: 'center', lineHeight: 1 }}>
        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: color, display: 'block', fontFamily: 'Outfit, var(--font-heading)' }}>{count}</span>
        <span style={{ fontSize: '0.48rem', color: '#7a90ad', textTransform: 'uppercase', fontWeight: 700 }}>
          {isOk ? 'OK' : 'FUERA'}
        </span>
      </div>
    </div>
  );
}

export default function GerenciaView({ data, roiData, filtros = {}, onNavegarAOperacion }) {
  const [subTab, setSubTab] = useState('resumen'); // 'resumen' | 'atricion' | 'roi'
  const [costoIncumplimiento, setCostoIncumplimiento] = useState(null);

  useEffect(() => {
    const cargarCosto = async () => {
      try {
        const params = new URLSearchParams();
        if (filtros.campana)   params.set('campana', filtros.campana);
        if (filtros.semana)    params.set('semana', filtros.semana);
        if (filtros.formador)  params.set('formador', filtros.formador);
        if (filtros.grupo)     params.set('grupo', filtros.grupo);
        if (filtros.modalidad) params.set('modalidad', filtros.modalidad);

        const res = await fetch(`/api/ojt/costo-incumplimiento?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          setCostoIncumplimiento(json);
        }
      } catch (err) {
        console.warn('Error cargando costo incumplimiento:', err);
      }
    };
    cargarCosto();
  }, [filtros.campana, filtros.semana, filtros.formador, filtros.grupo, filtros.modalidad]);

  const embudo = data?.embudo;
  const roi    = roiData || data?.roi;

  const total        = embudo?.total_asesores_unicos || data?.matriz?.asesores?.length || 0;
  const dia5Count    = embudo?.dias_principales_1_8?.find(d => d.dia === 5)?.activos || 0;
  const tasaGlobal   = total > 0 ? Math.round((dia5Count / total) * 100) : 0;
  const tasaExt      = roi?.metricas?.tasa_exito_extension_pct || 0;
  const excesos      = roi?.metricas?.total_exceso_politica_8d || 0;

  return (
    <AutoFitStage>
      <div className="gerencia-layout">
        {/* ── Fila 1 (88px): KPIs Summary Header + Selector de Sub-tabs ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'center', height: '100%', minHeight: 0 }}>
          <div className="kpi-header-grid">
            {/* Card 1: TOTAL EVALUADOS */}
            <div className="kpi-card" style={{ borderLeft: '4px solid #1e6fc0', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span className="kpi-subtexto" style={{ fontWeight: 800, color: '#0f1c2e' }}>TOTAL EVALUADOS</span>
                  <Users size={14} style={{ color: '#1e6fc0' }} />
                </div>
                <div className="kpi-valor" style={{ color: '#1e6fc0', fontSize: '1.75rem', fontWeight: 800 }}>{total.toLocaleString()}</div>
                <div className="kpi-subtexto">en base activa</div>
              </div>
              <div style={{ width: '70px', display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
                <TrendAreaSparkline color="#1e6fc0" />
              </div>
            </div>

            {/* Card 2: RETENCIÓN DÍA 5 */}
            <div className="kpi-card" style={{ 
              borderLeft: `4px solid ${tasaGlobal >= 55 ? '#0d9488' : '#d97706'}`, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              padding: '6px 10px' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <span className="kpi-subtexto" style={{ fontWeight: 800, color: '#0f1c2e' }}>RETENCIÓN DÍA 5</span>
                <Award size={14} style={{ color: tasaGlobal >= 55 ? '#0d9488' : '#d97706' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', margin: '2px 0' }}>
                <RadialGaugeArc pct={tasaGlobal} color={tasaGlobal >= 55 ? '#0d9488' : '#d97706'} size={105} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  color: '#1e6fc0',
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  whiteSpace: 'nowrap'
                }}>
                  🎯 Meta Gerencial: 55%
                </span>
              </div>
            </div>

            {/* Card 3: ÉXITO EXTENSIÓN */}
            <div className="kpi-card" style={{ 
              borderLeft: '4px solid #0d9488', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              padding: '6px 10px' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <span className="kpi-subtexto" style={{ fontWeight: 800, color: '#0f1c2e' }}>ÉXITO EXTENSIÓN</span>
                <TrendingUp size={14} style={{ color: '#0d9488' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', margin: '2px 0' }}>
                <RadialGaugeArc pct={tasaExt} color="#0d9488" size={105} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  color: '#0d9488',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  whiteSpace: 'nowrap'
                }}>
                  📈 Post-Día 5 (Extensión)
                </span>
              </div>
            </div>

            {/* Card 4: DESVÍOS >8 DÍAS */}
            <div className="kpi-card" style={{ 
              borderLeft: `4px solid ${excesos === 0 ? '#0d9488' : '#dc2626'}`, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              padding: '6px 10px' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <span className="kpi-subtexto" style={{ fontWeight: 800, color: '#0f1c2e' }}>DESVÍOS &gt;8 DÍAS</span>
                <AlertTriangle size={14} style={{ color: excesos === 0 ? '#0d9488' : '#dc2626' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', margin: '2px 0' }}>
                <AlertStatusRing count={excesos} size={64} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <span className="kpi-subtexto" style={{ color: excesos === 0 ? '#0d9488' : '#dc2626', fontWeight: 700, fontSize: '0.65rem' }}>
                  {excesos === 0 ? 'Sin desvíos' : `${excesos} fuera de regla`}
                </span>
              </div>
            </div>
          </div>

          {/* Sub-tabs Gerenciales */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
            background: 'var(--bg-surface)',
            padding: '3px 4px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            height: '100%',
            justifyContent: 'center',
            boxSizing: 'border-box'
          }}>
            {[
              { id: 'resumen', label: 'Resumen Ejecutivo', icon: BarChart2 },
              { id: 'atricion', label: 'Análisis de Atrición', icon: ShieldAlert },
              { id: 'roi', label: 'ROI & Extensiones', icon: DollarSign }
            ].map((tab) => {
              const Icon = tab.icon;
              const activo = subTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSubTab(tab.id)}
                  className="touch-target"
                  style={{
                    padding: '0.25rem 0.65rem',
                    fontSize: '0.73rem',
                    fontWeight: activo ? 700 : 500,
                    color: activo ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    background: activo ? 'var(--accent-primary-subtle)' : 'transparent',
                    border: `1px solid ${activo ? 'rgba(30, 111, 192, 0.25)' : 'transparent'}`,
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    lineHeight: '1.2'
                  }}
                >
                  <Icon size={13} style={{ color: activo ? 'var(--accent-primary)' : 'currentColor' }} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Fila 2 (1fr): Canvas Dinámico 2x2 según Sub-Tab ── */}
        <div className="gerencia-grid-2x2">
          {subTab === 'resumen' && (
            <>
              <div className="chart-wrapper-flex chart-card-resumen">
                <FlashOjtResumenCard filters={filtros} onNavegarAOperacion={onNavegarAOperacion} />
              </div>
              <div className="chart-wrapper-flex chart-card-embudo">
                <EmbudoEjecutivoOjtView filters={filtros} />
              </div>
              <div className="chart-wrapper-flex chart-card-combo">
                <IngresosVsEficaciaView data={data} />
              </div>
              <div className="chart-wrapper-flex chart-card-radar">
                <RadarPerfilExitoSegmento data={data} />
              </div>
            </>
          )}

          {subTab === 'atricion' && (
            <>
              <div className="chart-wrapper-flex span-2-cols chart-card-heatmap">
                <HeatmapBajasView filters={filtros} data={data} />
              </div>
              <div className="chart-wrapper-flex chart-card-combo">
                <IngresosVsEficaciaView data={data} />
              </div>
              <div className="chart-wrapper-flex chart-card-radar">
                <RadarPerfilExitoSegmento data={data} />
              </div>
            </>
          )}

          {subTab === 'roi' && (
            <>
              <div className="chart-wrapper-flex chart-card-roi">
                <RoiExtensionesView roiData={roi} />
              </div>
              <div className="chart-wrapper-flex chart-card-modalidad">
                <ComparativaModalidadView filtros={filtros} />
              </div>
              <div className="chart-wrapper-flex chart-card-combo">
                <IngresosVsEficaciaView data={data} />
              </div>
              <div className="chart-wrapper-flex chart-card-radar">
                <RadarPerfilExitoSegmento data={data} />
              </div>
            </>
          )}
        </div>
      </div>
    </AutoFitStage>
  );
}

