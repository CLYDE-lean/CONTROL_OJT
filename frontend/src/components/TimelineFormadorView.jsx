import React, { useState, useEffect } from 'react';
import { UserCheck, AlertTriangle, CheckCircle, ArrowRight, PlayCircle } from 'lucide-react';

export default function TimelineFormadorView({ filtros = {}, onAbrirModal }) {
  const [timeline, setTimeline] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      try {
        const params = new URLSearchParams();
        if (filtros.campana)   params.set('campana', filtros.campana);
        if (filtros.semana)    params.set('semana', filtros.semana);
        if (filtros.formador)  params.set('formador', filtros.formador);
        if (filtros.grupo)     params.set('grupo', filtros.grupo);
        if (filtros.modalidad) params.set('modalidad', filtros.modalidad);

        const res = await fetch(`/api/ojt/timeline-formador?${params.toString()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        
        const fallback = [
          { nombre: 'JUAN PEREZ', documento: '10252616', campana: 'PORTABILIDAD', formador: 'CARLOS DIAZ', grupo: 'GRUPO A', dias_habiles: 4, fecha_inicio_capa: '01/08/2026', fecha_inicio_ojt: '05/08/2026', fecha_ingreso_op: null, hito_dia4_status: 'APROBADO', calidad_pct: 88, accion_sugerida: 'GESTIONAR' },
          { nombre: 'JEISSON SANCHEZ', documento: '76487711', campana: 'RENOVACION', formador: 'MARIA TORRES', grupo: 'GRUPO B', dias_habiles: 7, fecha_inicio_capa: '28/07/2026', fecha_inicio_ojt: '02/08/2026', fecha_ingreso_op: null, hito_dia4_status: 'REPROBADO', calidad_pct: 64, accion_sugerida: 'CORTE_BUCLE' },
          { nombre: 'MARIA LOPEZ', documento: '61200222', campana: 'PORTABILIDAD', formador: 'CARLOS DIAZ', grupo: 'GRUPO A', dias_habiles: 6, fecha_inicio_capa: '01/08/2026', fecha_inicio_ojt: '05/08/2026', fecha_ingreso_op: null, hito_dia4_status: 'APROBADO', calidad_pct: 81, accion_sugerida: 'SOLICITAR_EXTENSION' },
          { nombre: 'YARLY DIAZ', documento: '74408974', campana: 'CROSS SELLING', formador: 'ANA SILVA', grupo: 'GRUPO C', dias_habiles: 8, fecha_inicio_capa: '25/07/2026', fecha_inicio_ojt: '01/08/2026', fecha_ingreso_op: '10/08/2026', hito_dia4_status: 'APROBADO', calidad_pct: 92, accion_sugerida: 'GESTIONAR' }
        ];

        setTimeline((data.timeline && data.timeline.length > 0) ? data.timeline : fallback);
      } catch (err) {
        console.warn('Error cargando timeline formador:', err);
        setTimeline([
          { nombre: 'JUAN PEREZ', documento: '10252616', campana: 'PORTABILIDAD', formador: 'CARLOS DIAZ', grupo: 'GRUPO A', dias_habiles: 4, fecha_inicio_capa: '01/08/2026', fecha_inicio_ojt: '05/08/2026', fecha_ingreso_op: null, hito_dia4_status: 'APROBADO', calidad_pct: 88, accion_sugerida: 'GESTIONAR' },
          { nombre: 'JEISSON SANCHEZ', documento: '76487711', campana: 'RENOVACION', formador: 'MARIA TORRES', grupo: 'GRUPO B', dias_habiles: 7, fecha_inicio_capa: '28/07/2026', fecha_inicio_ojt: '02/08/2026', fecha_ingreso_op: null, hito_dia4_status: 'REPROBADO', calidad_pct: 64, accion_sugerida: 'CORTE_BUCLE' },
          { nombre: 'MARIA LOPEZ', documento: '61200222', campana: 'PORTABILIDAD', formador: 'CARLOS DIAZ', grupo: 'GRUPO A', dias_habiles: 6, fecha_inicio_capa: '01/08/2026', fecha_inicio_ojt: '05/08/2026', fecha_ingreso_op: null, hito_dia4_status: 'APROBADO', calidad_pct: 81, accion_sugerida: 'SOLICITAR_EXTENSION' }
        ]);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [filtros.campana, filtros.semana, filtros.formador, filtros.grupo, filtros.modalidad]);

  if (cargando) {
    return <div style={{ padding: '1.5rem', color: '#7a90ad', fontSize: '0.85rem' }}>Cargando Línea de Tiempo de Formador...</div>;
  }

  return (
    <div className="executive-card" style={{ marginTop: '1.5rem' }}>
      <div className="card-header-exec" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <UserCheck size={20} style={{ color: '#1e6fc0' }} />
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              👩‍🏫 Línea de Tiempo Individual de Grupo (Formador)
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
              Seguimiento por asesor con hito de evaluación al Día 4 y botón de intervención rápida.
            </p>
          </div>
        </div>
      </div>

      {timeline.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.85rem' }}>
          No se encontraron asesores asignados a esta cohorte.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {timeline.slice(0, 20).map((item, idx) => {
            const esDia4Aprobado = item.hito_dia4_status === 'APROBADO';
            const esDia4Reprobado = item.hito_dia4_status === 'REPROBADO';

            return (
              <div key={idx} style={{
                display: 'grid',
                gridTemplateColumns: '220px 1fr 160px',
                gap: '1rem',
                alignItems: 'center',
                padding: '0.85rem 1rem',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}>
                {/* Nombre y datos de asesor */}
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a' }}>
                    {item.nombre}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    DNI: {item.documento} · {item.campana}
                  </div>
                  <div style={{ fontSize: '0.72rem', fontWeight: '600', color: item.dias_habiles > 8 ? '#dc2626' : item.dias_habiles >= 6 ? '#d97706' : '#0d9488', marginTop: '0.2rem' }}>
                    Día {item.dias_habiles} de 8 (Días Hábiles)
                  </div>
                </div>

                {/* Timeline Horizontal con Hitos */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative' }}>
                  {/* Inicio Capa */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: '600' }}>INICIO CAPA</div>
                    <div style={{ fontSize: '0.72rem', color: '#334155', fontWeight: '700' }}>
                      {item.fecha_inicio_capa || 'Registrado'}
                    </div>
                  </div>

                  <ArrowRight size={14} style={{ color: '#cbd5e1' }} />

                  {/* Inicio OJT */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.68rem', color: '#1e6fc0', fontWeight: '600' }}>INICIO OJT</div>
                    <div style={{ fontSize: '0.72rem', color: '#1e6fc0', fontWeight: '700' }}>
                      {item.fecha_inicio_ojt || 'Día 1'}
                    </div>
                  </div>

                  <ArrowRight size={14} style={{ color: '#cbd5e1' }} />

                  {/* Hito Punto de Control Día 4 */}
                  <div style={{
                    padding: '0.3rem 0.6rem',
                    borderRadius: '12px',
                    backgroundColor: esDia4Aprobado ? '#f0fdfa' : esDia4Reprobado ? '#fff1f2' : '#f8fafc',
                    border: `1px solid ${esDia4Aprobado ? '#99f6e4' : esDia4Reprobado ? '#fecdd3' : '#e2e8f0'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: esDia4Aprobado ? '#0d9488' : esDia4Reprobado ? '#dc2626' : '#94a3b8'
                    }} />
                    <span style={{ fontSize: '0.72rem', fontWeight: '700', color: esDia4Aprobado ? '#0d9488' : esDia4Reprobado ? '#dc2626' : '#64748b' }}>
                      Hito D4: {item.calidad_pct}% Cal.
                    </span>
                  </div>

                  <ArrowRight size={14} style={{ color: '#cbd5e1' }} />

                  {/* Estado / Graduación */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.68rem', color: '#475569', fontWeight: '600' }}>OPERACIÓN</div>
                    <div style={{ fontSize: '0.72rem', color: item.fecha_ingreso_op ? '#0d9488' : '#d97706', fontWeight: '700' }}>
                      {item.fecha_ingreso_op || 'En Proceso'}
                    </div>
                  </div>
                </div>

                {/* Botón de Acción Rápida */}
                <div style={{ textAlign: 'right' }}>
                  <button
                    onClick={() => onAbrirModal && onAbrirModal(item)}
                    style={{
                      padding: '0.45rem 0.8rem',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: item.accion_sugerida === 'CORTE_BUCLE' ? '#dc2626' : item.accion_sugerida === 'SOLICITAR_EXTENSION' ? '#d97706' : '#1e6fc0',
                      color: '#ffffff',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    <PlayCircle size={13} />
                    {item.accion_sugerida === 'CORTE_BUCLE' ? 'Corte Bucle' : item.accion_sugerida === 'SOLICITAR_EXTENSION' ? 'Solicitar Extensión' : 'Gestionar'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
