import React, { useEffect, useState } from 'react';
import { Monitor, Home, Building2, TrendingUp, Award, PhoneCall, ArrowRight, ShieldCheck } from 'lucide-react';

export default function ComparativaModalidadView({ filtros = {} }) {
  const [data, setData] = useState(null);
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
        if (filtros.periodo)   params.set('periodo',   filtros.periodo);
        if (filtros.modalidad) params.set('modalidad', filtros.modalidad);
        if (filtros.segmento)  params.set('segmento',  filtros.segmento);
        if (filtros.estado)    params.set('estado',    filtros.estado);

        const res = await fetch(`/api/ojt/comparativa-modalidad?${params.toString()}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Error cargando comparativa modalidad:', err);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [filtros.campana, filtros.semana, filtros.formador, filtros.grupo, filtros.periodo, filtros.modalidad, filtros.segmento, filtros.estado]);

  const modalidades = data?.modalidades || [];
  if (cargando) {
    return <div className="executive-card" style={{ padding: '2rem', textAlign: 'center', color: '#7a90ad' }}>Cargando comparativa Remoto vs Presencial...</div>;
  }
  if (!modalidades.length) return null;

  const presencial = modalidades.find(m => m.modalidad.includes('PRESENCIAL')) || modalidades[0];
  const remoto     = modalidades.find(m => m.modalidad.includes('REMOTO') || m.modalidad.includes('TELETRABAJO')) || modalidades[1];

  const mejorRetencion = presencial && remoto
    ? (presencial.retencion_dia5_pct >= remoto.retencion_dia5_pct ? presencial : remoto)
    : modalidades[0];

  const diffRetencion = presencial && remoto
    ? Math.abs(presencial.retencion_dia5_pct - remoto.retencion_dia5_pct)
    : 0;

  return (
    <div className="executive-card" style={{ marginBottom: '1.75rem' }}>
      
      {/* Header Narrativo */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid #e8edf5' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Monitor size={19} style={{ color: '#1e6fc0' }} />
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f1c2e', fontFamily: 'Outfit, sans-serif' }}>
              Impacto de la Modalidad de Trabajo (Presencial vs Remoto)
            </h3>
            <p style={{ fontSize: '0.76rem', color: '#7a90ad' }}>
              Evaluación ejecutiva de Retención al Día 5, Calidad % y Productividad promedio
            </p>
          </div>
        </div>

        {mejorRetencion && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.35rem 0.85rem', background: '#f0fdfa', border: '1px solid #99f6e4',
            borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, color: '#0d9488'
          }}>
            <ShieldCheck size={14} />
            Mayor Retención: {mejorRetencion.modalidad} ({mejorRetencion.retencion_dia5_pct}%)
          </span>
        )}
      </div>

      {/* Grid Comparativo de Modalidades */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
        {modalidades.map(m => {
          const esPresencial = m.modalidad.includes('PRESENCIAL');
          const IconMod      = esPresencial ? Building2 : Home;
          const mainColor    = esPresencial ? '#0d9488' : '#1e6fc0';
          const bgHeader     = esPresencial ? '#f0fdfa' : '#f0f7ff';

          return (
            <div
              key={m.modalidad}
              style={{
                background: '#ffffff',
                border: '1px solid #e8edf5',
                borderTop: `4px solid ${mainColor}`,
                borderRadius: '12px',
                padding: '1.25rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}
            >
              {/* Encabezado Card */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #f0f4f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: bgHeader, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IconMod size={17} style={{ color: mainColor }} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f1c2e' }}>{m.modalidad}</h4>
                    <span style={{ fontSize: '0.7rem', color: '#7a90ad' }}>{m.total_ingresaron.toLocaleString()} asesores ingresaron</span>
                  </div>
                </div>
              </div>

              {/* Métricas clave */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                
                {/* Retención Día 5 */}
                <div style={{ background: '#f7f9fc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e8edf5' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#7a90ad', textTransform: 'uppercase' }}>Retención D5</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: mainColor, fontFamily: 'Outfit, sans-serif', lineHeight: 1.1 }}>
                    {m.retencion_dia5_pct}%
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#3d5275', marginTop: '0.15rem' }}>
                    {m.llegaron_dia5.toLocaleString()} llegaron a D5
                  </div>
                </div>

                {/* Calidad Promedio */}
                <div style={{ background: '#f7f9fc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e8edf5' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#7a90ad', textTransform: 'uppercase' }}>Nota Calidad</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f1c2e', fontFamily: 'Outfit, sans-serif', lineHeight: 1.1 }}>
                    {m.promedio_calidad}%
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#3d5275', marginTop: '0.15rem' }}>
                    Promedio OJT
                  </div>
                </div>
              </div>

              {/* Barra de Retención Visual */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#7a90ad', marginBottom: '0.25rem' }}>
                  <span>Tasa de Conversión a Operación</span>
                  <strong>{Math.round((m.total_operativos / (m.total_ingresaron || 1)) * 100)}%</strong>
                </div>
                <div style={{ height: '8px', background: '#e8edf5', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.round((m.total_operativos / (m.total_ingresaron || 1)) * 100)}%`,
                    height: '100%',
                    background: mainColor,
                    borderRadius: '4px'
                  }} />
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Diagnóstico de Data Storytelling */}
      {presencial && remoto && (
        <div style={{
          padding: '0.9rem 1.1rem',
          background: '#f7f9fc',
          border: '1px solid #dce3ee',
          borderLeft: '4px solid #1e6fc0',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem'
        }}>
          <TrendingUp size={20} style={{ color: '#1e6fc0', flexShrink: 0 }} />
          <div style={{ fontSize: '0.78rem', color: '#0f1c2e', lineHeight: 1.45 }}>
            <strong>Conclusión para Toma de Decisiones:</strong> La modalidad <strong>{mejorRetencion.modalidad}</strong> muestra una tasa de retención {diffRetencion}% mayor al Día 5. Se sugiere evaluar el perfil de contratación y el acompañamiento virtual en los primeros 2 días para reducir la deserción temprana en remoto.
          </div>
        </div>
      )}

    </div>
  );
}
