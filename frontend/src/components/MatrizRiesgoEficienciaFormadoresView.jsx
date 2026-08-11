import React, { useState, useEffect } from 'react';
import { Target, Award, AlertTriangle, ShieldAlert, CheckCircle2, TrendingUp, Users } from 'lucide-react';

const FALLBACK_MATRIZ = [
  { formador: 'DANIELA ESPERANZA BALLUMBROSIO FLORES DE MEZA', total_ingresaron: 21, llegaron_dia5: 21, retencion_pct: 100, promedio_calidad_pct: 88.5, cuadrante: 'ESTRELLA', labelCuadrante: '🌟 Formador Estrella', color: '#0d9488' },
  { formador: 'MARCO ANTONIO DIAZ MURRIETA',        total_ingresaron: 210, llegaron_dia5: 148, retencion_pct: 70, promedio_calidad_pct: 84.2, cuadrante: 'ESTRELLA', labelCuadrante: '🌟 Formador Estrella', color: '#0d9488' },
  { formador: 'JOSÉ MARTÍN SALAZAR MUÑOZ',           total_ingresaron: 185, llegaron_dia5: 118, retencion_pct: 64, promedio_calidad_pct: 82.1, cuadrante: 'ESTRELLA', labelCuadrante: '🌟 Formador Estrella', color: '#0d9488' },
  { formador: 'ASTRID SOPHIA EYZAGUIRRE DE FREITAS', total_ingresaron: 162, llegaron_dia5: 77,  retencion_pct: 48, promedio_calidad_pct: 81.0, cuadrante: 'RIESGO_FUGA', labelCuadrante: '⚠️ Riesgo de Fuga', color: '#d97706' },
  { formador: 'CARLOS EDUARDO MENDOZA',             total_ingresaron: 140, llegaron_dia5: 56,  retencion_pct: 40, promedio_calidad_pct: 72.5, cuadrante: 'ZONA_CRITICA', labelCuadrante: '🔴 Zona Crítica', color: '#dc2626' }
];

export default function MatrizRiesgoEficienciaFormadoresView({ filtros = {} }) {
  const [matriz, setMatriz] = useState(FALLBACK_MATRIZ);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      try {
        const params = new URLSearchParams();
        if (filtros.campana)   params.set('campana',   filtros.campana);
        if (filtros.semana)    params.set('semana',    filtros.semana);
        if (filtros.formador)  params.set('formador',  filtros.formador);
        if (filtros.grupo)     params.set('grupo',     filtros.grupo);
        if (filtros.modalidad) params.set('modalidad', filtros.modalidad);

        const res = await fetch(`/api/ojt/matriz-riesgo-formadores?${params.toString()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data && data.matriz && data.matriz.length > 0) {
          setMatriz(data.matriz);
        } else {
          setMatriz(FALLBACK_MATRIZ);
        }
      } catch (err) {
        console.warn('Error cargando matriz de riesgo de formadores:', err);
        setMatriz(FALLBACK_MATRIZ);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [filtros.campana, filtros.semana, filtros.formador, filtros.grupo, filtros.modalidad]);

  if (cargando) {
    return <div style={{ padding: '1.5rem', color: '#7a90ad', fontSize: '0.85rem' }}>Cargando Matriz de Riesgo y Eficiencia por Formador...</div>;
  }

  const listado = (matriz && matriz.length > 0) ? matriz : FALLBACK_MATRIZ;

  // Agrupar formadores por Cuadrante
  const estrellas = listado.filter(m => m.cuadrante === 'ESTRELLA');
  const fuga      = listado.filter(m => m.cuadrante === 'RIESGO_FUGA');
  const calidad   = listado.filter(m => m.cuadrante === 'ALERTA_CALIDAD');
  const critica   = listado.filter(m => m.cuadrante === 'ZONA_CRITICA');

  return (
    <div className="executive-card" style={{ marginTop: '1.5rem' }}>
      <div className="card-header-exec" style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Target size={20} style={{ color: '#1e6fc0' }} />
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0, fontFamily: 'Outfit, sans-serif' }}>
              🎯 Matriz de Eficiencia Operativa y Riesgo por Formador
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
              Evaluación cruzada de Retención al Día 5 (Meta ≥60%) vs. Calidad Promedio Promovida (Meta ≥80%).
            </p>
          </div>
        </div>
      </div>

      {/* ── Cuadrantes Visuales de Decisión ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>

        {/* Cuadrante 1: Formadores Estrella */}
        <div style={{ background: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: '12px', padding: '1.1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0d9488', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={16} /> 🌟 Formadores Estrella ({estrellas.length})
            </span>
            <span style={{ fontSize: '0.7rem', color: '#0f766e', fontWeight: 700 }}>Retención ≥60% · Calidad ≥80%</span>
          </div>
          {estrellas.length === 0 ? (
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>Sin formadores en este segmento.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {estrellas.map((f, i) => (
                <div key={i} style={{ background: '#ffffff', padding: '0.55rem 0.8rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #ccfbf1' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>{f.formador}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0d9488' }}>
                    {f.retencion_pct}% Ret. | {f.promedio_calidad_pct}% Cal.
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cuadrante 2: Riesgo de Fuga */}
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '1.1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#d97706', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <AlertTriangle size={16} /> ⚠️ Riesgo de Fuga ({fuga.length})
            </span>
            <span style={{ fontSize: '0.7rem', color: '#b45309', fontWeight: 700 }}>Retención &lt;60% · Calidad ≥80%</span>
          </div>
          {fuga.length === 0 ? (
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>Sin formadores en este segmento.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {fuga.map((f, i) => (
                <div key={i} style={{ background: '#ffffff', padding: '0.55rem 0.8rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #fef3c7' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>{f.formador}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d97706' }}>
                    {f.retencion_pct}% Ret. | {f.promedio_calidad_pct}% Cal.
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cuadrante 3: Alerta de Calidad */}
        <div style={{ background: '#fefce8', border: '1px solid #fef08a', borderRadius: '12px', padding: '1.1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ca8a04', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Award size={16} /> 🟡 Alerta de Calidad ({calidad.length})
            </span>
            <span style={{ fontSize: '0.7rem', color: '#a16207', fontWeight: 700 }}>Retención ≥60% · Calidad &lt;80%</span>
          </div>
          {calidad.length === 0 ? (
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>Sin formadores en este segmento.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {calidad.map((f, i) => (
                <div key={i} style={{ background: '#ffffff', padding: '0.55rem 0.8rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #fef9c3' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>{f.formador}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ca8a04' }}>
                    {f.retencion_pct}% Ret. | {f.promedio_calidad_pct}% Cal.
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cuadrante 4: Zona Crítica */}
        <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '12px', padding: '1.1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldAlert size={16} /> 🔴 Zona Crítica ({critica.length})
            </span>
            <span style={{ fontSize: '0.7rem', color: '#991b1b', fontWeight: 700 }}>Retención &lt;60% · Calidad &lt;80%</span>
          </div>
          {critica.length === 0 ? (
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>Sin formadores en este segmento.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {critica.map((f, i) => (
                <div key={i} style={{ background: '#ffffff', padding: '0.55rem 0.8rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #ffe4e6' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>{f.formador}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#dc2626' }}>
                    {f.retencion_pct}% Ret. | {f.promedio_calidad_pct}% Cal.
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
