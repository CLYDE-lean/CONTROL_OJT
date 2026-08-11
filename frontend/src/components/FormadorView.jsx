import React from 'react';
import { Users, Award, TrendingUp, AlertTriangle, Layers } from 'lucide-react';
import MatrizRiesgoEficienciaFormadoresView from './MatrizRiesgoEficienciaFormadoresView';
import EmbudoSupervivenciaGrupo from './EmbudoSupervivenciaGrupo';
import EstadoFinalGrupoFormador from './EstadoFinalGrupoFormador';
import CurvaAprendizajeSemana from './CurvaAprendizajeSemana';
import ReglasDeOroCard from './ReglasDeOroCard';

export default function FormadorView({ data, filtros, onAbrirModal, onNavegarDetalle }) {
  const embudo = data?.embudo;
  const total  = embudo?.total_asesores_unicos || 0;
  const dia5   = embudo?.dias_principales_1_8?.find(d => d.dia === 5)?.activos || 0;
  const dia1   = embudo?.dias_principales_1_8?.find(d => d.dia === 1)?.activos || total;
  const bajas  = dia1 - dia5;
  const tasa   = dia1 > 0 ? Math.round((dia5 / dia1) * 100) : 0;

  return (
    <div>
      {/* ── KPIs rápidos del formador ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <KpiCard label="Total Ingresaron"    valor={total.toLocaleString()}   icon={Users}          color="#1e6fc0" sub="Día 1" />
        <KpiCard label="Llegaron al Día 5"   valor={dia5.toLocaleString()}    icon={Award}          color="#0d9488" sub={`${tasa}% del total`} />
        <KpiCard label="Bajas en el proceso" valor={bajas.toLocaleString()}   icon={AlertTriangle}  color="#dc2626" sub="No llegaron a Día 5" />
        <KpiCard label="Tasa de Retención"   valor={`${tasa}%`}              icon={TrendingUp}     color={tasa >= 55 ? '#0d9488' : tasa >= 35 ? '#d97706' : '#dc2626'} sub="al Día 5 (meta 55%)" />
      </div>

      {/* ── Embudo de Supervivencia del Grupo ── */}
      <div style={{ marginBottom: '1.5rem' }}>
        <EmbudoSupervivenciaGrupo data={data} onNavegarDetalle={onNavegarDetalle} />
      </div>

      {/* ── Estado Final por Grupo y Formador & Curva de Aprendizaje ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <EstadoFinalGrupoFormador data={data} />
        <CurvaAprendizajeSemana data={data} filters={filtros} />
      </div>

      {/* ── Matriz de Riesgo y Eficiencia por Formador ── */}
      <div style={{ marginBottom: '1.5rem' }}>
        <MatrizRiesgoEficienciaFormadoresView filtros={filtros} />
      </div>
    </div>
  );
}

function KpiCard({ label, valor, sub, icon: Icon, color }) {
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
      <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f1c2e', fontFamily: 'Outfit, sans-serif', lineHeight: 1 }}>
        {valor}
      </div>
      <div style={{ fontSize: '0.73rem', color: '#7a90ad', marginTop: '0.3rem' }}>{sub}</div>
    </div>
  );
}
