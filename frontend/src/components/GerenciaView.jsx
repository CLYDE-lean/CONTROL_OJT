import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Users, Award, AlertTriangle, Target, BarChart2, DollarSign, ShieldAlert, Layers } from 'lucide-react';
import RoiExtensionesView from './RoiExtensionesView';
import ComparativaModalidadView from './ComparativaModalidadView';
import FlashOjtResumenCard from './FlashOjtResumenCard';
import EmbudoEjecutivoOjtView from './EmbudoEjecutivoOjtView';
import HeatmapBajasView from './HeatmapBajasView';
import IngresosVsEficaciaView from './IngresosVsEficaciaView';
import RadarPerfilExitoSegmento from './RadarPerfilExitoSegmento';

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

  const total        = embudo?.total_asesores_unicos || 0;
  const dia5Count    = embudo?.dias_principales_1_8?.find(d => d.dia === 5)?.activos || 0;
  const tasaGlobal   = total > 0 ? Math.round((dia5Count / total) * 100) : 0;
  const tasaExt      = roi?.metricas?.tasa_exito_extension_pct || 0;
  const excesos      = roi?.metricas?.total_exceso_politica_8d || 0;

  const zonaSemaforo = tasaGlobal >= 60 ? 'VERDE' : tasaGlobal >= 40 ? 'AMARILLO' : 'ROJO';
  const semaforoColor = { VERDE: '#0d9488', AMARILLO: '#d97706', ROJO: '#dc2626' };
  const semaforoBg    = { VERDE: '#f0fdfa', AMARILLO: '#fffbeb', ROJO: '#fff1f2' };
  const semaforoBorder = { VERDE: '#99f6e4', AMARILLO: '#fde68a', ROJO: '#fecdd3' };

  return (
    <div>
      {/* ── Sub-Tabs Internos Gerenciales (Estilo Power BI) ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.25rem',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '0.65rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
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
                  padding: '0.45rem 0.95rem',
                  fontSize: '0.82rem',
                  fontWeight: activo ? 700 : 500,
                  color: activo ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  background: activo ? 'var(--accent-primary-subtle)' : 'transparent',
                  border: `1px solid ${activo ? 'rgba(30, 111, 192, 0.25)' : 'transparent'}`,
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={15} style={{ color: activo ? 'var(--accent-primary)' : 'currentColor' }} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── TAB 1: RESUMEN EJECUTIVO (Vista por defecto) ── */}
      {subTab === 'resumen' && (
        <>
          {/* Semáforo principal */}
          <div style={{
            background: semaforoBg[zonaSemaforo],
            border: `1px solid ${semaforoBorder[zonaSemaforo]}`,
            borderLeft: `5px solid ${semaforoColor[zonaSemaforo]}`,
            borderRadius: '14px',
            padding: '1.1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '46px', height: '46px', borderRadius: '12px',
                background: semaforoColor[zonaSemaforo],
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
              }}>
                <Target size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.73rem', fontWeight: 700, color: semaforoColor[zonaSemaforo], textTransform: 'uppercase' }}>
                  Salud Operativa Global — Día 5
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f1c2e', fontFamily: 'Outfit, sans-serif' }}>
                  {tasaGlobal}% de Retención Efectiva
                </div>
              </div>
            </div>
          </div>

          {/* KPIs Rápidos de Gerencia */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            <KpiGerencia label="Total Evaluados"     valor={total.toLocaleString()}     icon={Users}          color="#1e6fc0" trend="up"   sub="en base de datos" />
            <KpiGerencia label="Retención al Día 5"  valor={`${tasaGlobal}%`}          icon={Award}          color={semaforoColor[zonaSemaforo]} trend={tasaGlobal>=55?'up':'down'} sub="meta gerencial 55%" />
            <KpiGerencia label="Éxito de Extensión" valor={`${tasaExt}%`}            icon={TrendingUp}     color="#0d9488" trend="up"   sub="después del Día 5" />
            <KpiGerencia label="Desvíos >8 Días"    valor={excesos.toLocaleString()}   icon={AlertTriangle}  color="#dc2626" trend="down" sub="asesores fuera de regla" />
          </div>

          {/* Embudo Ejecutivo de Conversión */}
          <div style={{ marginBottom: '1.5rem' }}>
            <EmbudoEjecutivoOjtView filters={filtros} />
          </div>

          {/* Tarjeta Resumen Flash OJT (1 sola fila compacta con salto a Operación) */}
          <div style={{ marginBottom: '1.5rem' }}>
            <FlashOjtResumenCard filters={filtros} onNavegarAOperacion={onNavegarAOperacion} />
          </div>
        </>
      )}

      {/* ── TAB 2: ANÁLISIS DE ATRICIÓN ── */}
      {subTab === 'atricion' && (
        <div style={{ marginBottom: '1.5rem' }}>
          <HeatmapBajasView filters={filtros} data={data} />
        </div>
      )}

      {/* ── TAB 3: ROI & EXTENSIONES ── */}
      {subTab === 'roi' && (
        <>
          {/* Fila 1: ROI Extensiones & Comparativa Modalidad en 2 Columnas */}
          <div className="grid-2" style={{ gap: '1.25rem', marginBottom: '1.5rem' }}>
            <RoiExtensionesView roiData={roi} />
            <ComparativaModalidadView filtros={filtros} />
          </div>

          {/* Fila 2: Ingresos vs Eficacia & Perfil de Éxito en 2 Columnas */}
          <div className="grid-2" style={{ gap: '1.25rem', marginBottom: '1.5rem' }}>
            <IngresosVsEficaciaView data={data} />
            <RadarPerfilExitoSegmento data={data} />
          </div>
        </>
      )}
    </div>
  );
}

function KpiGerencia({ label, valor, sub, icon: Icon, color, trend }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e8edf5',
      borderTop: `3px solid ${color}`,
      borderRadius: '12px',
      padding: '1.1rem',
      boxShadow: '0 1px 6px rgba(0,0,0,0.04)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#7a90ad', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </span>
        <Icon size={16} style={{ color }} />
      </div>
      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f1c2e', fontFamily: 'Outfit, sans-serif', lineHeight: 1 }}>
        {valor}
      </div>
      <div style={{ fontSize: '0.73rem', color: '#7a90ad', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
        {trend === 'up' && <TrendingUp size={12} style={{ color: '#0d9488' }} />}
        {trend === 'down' && <TrendingDown size={12} style={{ color: '#dc2626' }} />}
        {sub}
      </div>
    </div>
  );
}
