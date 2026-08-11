import React from 'react';
import { Target, UserX, Clock, Sparkles, ShieldCheck, AlertOctagon } from 'lucide-react';

export default function MatrizIntervencionView({ matrizData, onEjecutarDecision }) {
  if (!matrizData || !matrizData.asesores) return null;

  const { asesores } = matrizData;

  const q0Anomalo = asesores.filter(a => a.cuadrante === 'Q0_BUCLE_ANOMALO' || a.dia_logico_ojt > 7);
  const q1Corte = asesores.filter(a => a.cuadrante === 'Q1_CORTE_PREVENTIVO' && a.dia_logico_ojt <= 7);
  const q2Extension = asesores.filter(a => a.cuadrante === 'Q2_CANDIDATO_EXTENSION' && a.dia_logico_ojt <= 7);
  const q3Fuga = asesores.filter(a => a.cuadrante === 'Q3_RIESGO_FUGA' && a.dia_logico_ojt <= 7);
  const q4Alto = asesores.filter(a => a.cuadrante === 'Q4_ALTO_RENDIMIENTO' && a.dia_logico_ojt <= 7);

  return (
    <div className="executive-card">
      <div className="card-header-exec">
        <h2 className="card-title-exec">
          <Target size={18} style={{ color: 'var(--accent-primary)' }} />
          3. Matriz de Intervención Inmediata & Control de Anomalías
        </h2>
        <span className="badge-exec badge-amber">Acción en Día 2</span>
      </div>

      <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', marginBottom: '1.25rem' }}>
        Toma de decisiones ejecutivas en el <strong>Día 2</strong> y resolución inmediata de bucles anómalos (&gt;7 días).
      </p>

      {/* Sección especial de Alerta para Bucles Anómalos (>7 días, Ej. 26 Días) */}
      {q0Anomalo.length > 0 && (
        <div style={{
          marginBottom: '1.25rem',
          padding: '1rem 1.25rem',
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: 'var(--radius-md)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertOctagon size={18} /> 🚨 ALERTA BUCLE OJT (&gt;7 Días Registrados)
            </span>
            <span className="badge-exec badge-red">{q0Anomalo.length} Asesor(es) Detectado(s)</span>
          </div>

          {q0Anomalo.map(a => (
            <div key={a.documento} className="quad-row-item" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <div>
                <strong style={{ color: 'white' }}>{a.nombre}</strong> ({a.campana})
                <span style={{ display: 'block', fontSize: '0.72rem', color: '#f87171', fontWeight: 600 }}>
                  ⚠️ Permanencia anómala: {a.dia_logico_ojt} Días en OJT (Formador: {a.formador})
                </span>
              </div>
              <button 
                className="btn-exec btn-exec-danger" 
                onClick={() => onEjecutarDecision(a.documento, 'Corte Forzoso Bucle 26 Días', a.nombre)}
              >
                Corte Forzoso
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="quad-grid">
        {/* Q3: Riesgo Fuga */}
        <div className="quad-box q-blue">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={16} style={{ color: '#60a5fa' }} /> Q3: Riesgo de Fuga
            </span>
            <span className="badge-exec badge-blue">{q3Fuga.length} Asesores</span>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', margin: '0.3rem 0 0.5rem 0' }}>
            Baja Asistencia (&lt;80%) + Alta Calidad (&ge;75%). Tienen talento pero requieren gestión de RRHH/Transporte.
          </p>
          <div>
            {q3Fuga.map(a => (
              <div key={a.documento} className="quad-row-item">
                <div>
                  <strong>{a.nombre}</strong>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                    Asist: {a.asistencia_pct}% | Calidad: {a.calidad_pct}%
                  </span>
                </div>
                <button className="btn-exec" onClick={() => onEjecutarDecision(a.documento, 'Alertar RRHH Fuga', a.nombre)}>
                  RRHH
                </button>
              </div>
            ))}
            {q3Fuga.length === 0 && <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Sin asesores en este cuadrante</span>}
          </div>
        </div>

        {/* Q4: Alto Rendimiento */}
        <div className="quad-box q-green">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={16} style={{ color: '#34d399' }} /> Q4: Camino a Egresado Base
            </span>
            <span className="badge-exec badge-green">{q4Alto.length} Asesores</span>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', margin: '0.3rem 0 0.5rem 0' }}>
            Alta Asistencia (&ge;80%) + Alta Calidad (&ge;75%). Desempeño óptimo en carril normal.
          </p>
          <div>
            {q4Alto.slice(0, 3).map(a => (
              <div key={a.documento} className="quad-row-item">
                <div>
                  <strong>{a.nombre}</strong>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--accent-success)' }}>
                    Asist: {a.asistencia_pct}% | Calidad: {a.calidad_pct}%
                  </span>
                </div>
                <span className="badge-exec badge-green">OK</span>
              </div>
            ))}
            {q4Alto.length > 3 && <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>+{q4Alto.length - 3} asesores adicionales sin riesgo</span>}
          </div>
        </div>

        {/* Q1: Corte Preventivo */}
        <div className="quad-box q-red">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <UserX size={16} style={{ color: '#f87171' }} /> Q1: Corte Preventivo (Día 2)
            </span>
            <span className="badge-exec badge-red">{q1Corte.length} Asesores</span>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', margin: '0.3rem 0 0.5rem 0' }}>
            Baja Asistencia (&lt;80%) + Baja Calidad (&lt;75%). Corte preventivo para evitar sobrecosto de licencias.
          </p>
          <div>
            {q1Corte.map(a => (
              <div key={a.documento} className="quad-row-item">
                <div>
                  <strong>{a.nombre}</strong>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: '#f87171' }}>
                    Asist: {a.asistencia_pct}% | Calidad: {a.calidad_pct}%
                  </span>
                </div>
                <button className="btn-exec btn-exec-danger" onClick={() => onEjecutarDecision(a.documento, 'Corte Preventivo Día 2', a.nombre)}>
                  Cortar
                </button>
              </div>
            ))}
            {q1Corte.length === 0 && <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Sin asesores en corte preventivo</span>}
          </div>
        </div>

        {/* Q2: Candidato a Extensión */}
        <div className="quad-box q-amber">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={16} style={{ color: '#fbbf24' }} /> Q2: Candidatos a Extensión
            </span>
            <span className="badge-exec badge-amber">{q2Extension.length} Asesores</span>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', margin: '0.3rem 0 0.5rem 0' }}>
            Alta Asistencia (&ge;80%) + Baja Calidad (&lt;75%). Tienen actitud pero requieren refuerzo técnico.
          </p>
          <div>
            {q2Extension.map(a => (
              <div key={a.documento} className="quad-row-item">
                <div>
                  <strong>{a.nombre}</strong>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: '#fbbf24' }}>
                    Asist: {a.asistencia_pct}% | Calidad: {a.calidad_pct}%
                  </span>
                </div>
                <button className="btn-exec btn-exec-warning" onClick={() => onEjecutarDecision(a.documento, 'Pre-aprobar Extensión Día 6', a.nombre)}>
                  Extensión
                </button>
              </div>
            ))}
            {q2Extension.length === 0 && <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Sin candidatos a extensión</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
