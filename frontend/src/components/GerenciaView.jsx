import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertTriangle, Clock, Landmark } from 'lucide-react';
import AutoFitStage from './AutoFitStage';
import RoiExtensionesView from './RoiExtensionesView';
import ComparativaModalidadView from './ComparativaModalidadView';

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
          stroke="var(--border-color)"
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
        color,
        lineHeight: 1,
        fontFamily: 'Outfit, var(--font-heading)'
      }}>
        {pct}%
      </div>
    </div>
  );
}

function soles(n) {
  return `S/ ${Math.round(Number(n) || 0).toLocaleString('es-PE')}`;
}

export default function GerenciaView({ data, roiData, filtros = {} }) {
  const [costoIncumplimiento, setCostoIncumplimiento] = useState(null);

  useEffect(() => {
    const cargarCosto = async () => {
      try {
        const params = new URLSearchParams();
        if (filtros.campana) params.set('campana', filtros.campana);
        if (filtros.semana) params.set('semana', filtros.semana);
        if (filtros.formador) params.set('formador', filtros.formador);
        if (filtros.grupo) params.set('grupo', filtros.grupo);
        if (filtros.modalidad) params.set('modalidad', filtros.modalidad);

        const res = await fetch(`/api/ojt/costo-incumplimiento?${params.toString()}`);
        if (res.ok) setCostoIncumplimiento(await res.json());
      } catch (err) {
        console.warn('Error cargando costo incumplimiento:', err);
      }
    };
    cargarCosto();
  }, [filtros.campana, filtros.semana, filtros.formador, filtros.grupo, filtros.modalidad]);

  const roi = roiData || data?.roi;
  const m = roi?.metricas || {};
  const tasaExt = m.tasa_exito_extension_pct || 0;
  const impactoExt = m.impacto_extension_fallida_pen ?? costoIncumplimiento?.impacto_financiero_pen ?? 0;
  const cicloPerdido = m.impacto_ciclo_perdido_pen ?? impactoExt;
  const enCurso = m.en_curso_extension || 0;
  const caidos = m.caidos_post_extension || 0;
  const enviados = m.total_enviados_extension || 0;

  return (
    <AutoFitStage>
      <div className="gerencia-layout">
        <div className="kpi-header-grid">
          <div className="kpi-card" style={{ borderLeft: '4px solid #0d9488', padding: '6px 10px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <span className="kpi-subtexto" style={{ fontWeight: 800, color: 'var(--text-primary)' }}>CONVERSIÓN POST-EXT.</span>
              <TrendingUp size={14} style={{ color: '#0d9488' }} />
            </div>
            <RadialGaugeArc pct={tasaExt} color="#0d9488" size={105} />
            <span className="kpi-subtexto">
              {m.egresados_post_extension || 0} I-OP de {enviados} con extensión
            </span>
          </div>

          <div className="kpi-card" style={{ borderLeft: `4px solid ${impactoExt === 0 ? '#0d9488' : '#dc2626'}`, padding: '6px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="kpi-subtexto" style={{ fontWeight: 800, color: 'var(--text-primary)' }}>COSTO HUNDIDO</span>
              <AlertTriangle size={14} style={{ color: impactoExt === 0 ? '#0d9488' : '#dc2626' }} />
            </div>
            <div className="kpi-valor" style={{ color: impactoExt === 0 ? '#0d9488' : '#dc2626', fontSize: '1.55rem' }}>
              {soles(impactoExt)}
            </div>
            <div className="kpi-subtexto">{caidos} bajas × solo días extra OJT</div>
          </div>

          <div className="kpi-card" style={{ borderLeft: '4px solid #d97706', padding: '6px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="kpi-subtexto" style={{ fontWeight: 800, color: 'var(--text-primary)' }}>CICLO PERDIDO</span>
              <Landmark size={14} style={{ color: '#d97706' }} />
            </div>
            <div className="kpi-valor" style={{ color: '#d97706', fontSize: '1.55rem' }}>
              {soles(cicloPerdido)}
            </div>
            <div className="kpi-subtexto">extensión fallida + capa real</div>
          </div>

          <div className="kpi-card" style={{ borderLeft: '4px solid #1e6fc0', padding: '6px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="kpi-subtexto" style={{ fontWeight: 800, color: 'var(--text-primary)' }}>AÚN EN EXTENSIÓN</span>
              <Clock size={14} style={{ color: '#1e6fc0' }} />
            </div>
            <div className="kpi-valor" style={{ color: '#1e6fc0', fontSize: '1.55rem' }}>{enCurso}</div>
            <div className="kpi-subtexto">sin I-OP ni baja · no es pérdida aún</div>
          </div>
        </div>

        <div className="gerencia-grid-2col">
          <div className="chart-wrapper-flex">
            <RoiExtensionesView roiData={roi} compactHero />
          </div>
          <div className="chart-wrapper-flex">
            <ComparativaModalidadView filtros={filtros} />
          </div>
        </div>
      </div>
    </AutoFitStage>
  );
}
