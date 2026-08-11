import React from 'react';
import { X, User, ShieldCheck, PhoneCall, Award, Percent, Calendar, BookOpen, Clock, AlertTriangle, Building2, Tag, CheckCircle2, TrendingUp } from 'lucide-react';

export default function AsesorDetalleDrawer({ asesor, onClose, onEjecutarDecision }) {
  if (!asesor) return null;

  const esOperativo = asesor.es_iop === 1 || 
                      asesor.estado_actual?.toUpperCase().includes('EGRESADO') || 
                      asesor.estado_actual?.toUpperCase().includes('OPERAC') || 
                      asesor.resultado_evaluacion?.toUpperCase().includes('EGRESADO');
  const esBaja      = asesor.es_baja === 1 || 
                      asesor.estado_actual?.toUpperCase().includes('BAJA') || 
                      asesor.estado_actual?.toUpperCase().includes('CESADO');
  const esBucle     = asesor.dia_logico_ojt > 8;
  const diaActual   = asesor.dia_logico_ojt;

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 28, 46, 0.4)', backdropFilter: 'blur(3px)',
          zIndex: 1100, transition: 'opacity 0.25s ease'
        }} 
      />

      {/* Sliding Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '440px', maxWidth: '90vw',
        background: '#ffffff', boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.15)', zIndex: 1200,
        display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '1.5rem',
        borderLeft: '1px solid #e8edf5', fontFamily: 'Inter, sans-serif'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid #e8edf5' }}>
          <div>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#7a90ad', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Ficha del Asesor OJT
            </span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f1c2e', fontFamily: 'Outfit, sans-serif', marginTop: '0.15rem' }}>
              {asesor.nombre}
            </h3>
            <code style={{ fontSize: '0.78rem', color: '#1e6fc0', fontWeight: 700 }}>DNI: {asesor.documento}</code>
          </div>
          <button 
            onClick={onClose}
            style={{ border: 'none', background: '#f0f4f9', padding: '0.4rem', borderRadius: '50%', cursor: 'pointer', color: '#0f1c2e' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Estado y Dictamen */}
        <div style={{
          padding: '1rem', borderRadius: '10px', marginBottom: '1.25rem',
          background: esOperativo ? '#f0fdfa' : esBaja ? '#fff1f2' : '#f0f7ff',
          border: `1px solid ${esOperativo ? '#99f6e4' : esBaja ? '#fecdd3' : '#bae6fd'}`
        }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: esOperativo ? '#0d9488' : esBaja ? '#dc2626' : '#0284c7', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
            Estado y Dictamen OJT
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f1c2e', fontFamily: 'Outfit, sans-serif' }}>
            {asesor.resultado_evaluacion || asesor.estado_actual}
          </div>
          {asesor.motivo_baja && (
            <div style={{ fontSize: '0.78rem', color: '#dc2626', marginTop: '0.35rem', fontWeight: 600 }}>
              ⚠️ Motivo de Baja: {asesor.motivo_baja}
            </div>
          )}
        </div>

        {/* Estructura y Asignación */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7a90ad', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
            Estructura y Asignación
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div style={{ background: '#f7f9fc', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #e8edf5' }}>
              <span style={{ fontSize: '0.68rem', color: '#7a90ad', display: 'block' }}>Campaña</span>
              <strong style={{ fontSize: '0.8rem', color: '#0f1c2e' }}>{asesor.campana}</strong>
            </div>
            <div style={{ background: '#f7f9fc', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #e8edf5' }}>
              <span style={{ fontSize: '0.68rem', color: '#7a90ad', display: 'block' }}>Formador</span>
              <strong style={{ fontSize: '0.8rem', color: '#0f1c2e' }}>{asesor.formador}</strong>
            </div>
          </div>
        </div>

        {/* Trayectoria & Días de Conexión hasta Ingreso a Operaciones */}
        <div style={{ marginBottom: '1.25rem', background: 'linear-gradient(135deg, #f0f7ff 0%, #e0f2fe 100%)', padding: '0.9rem', borderRadius: '10px', border: '1px solid #bae6fd' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.04em' }}>
            ⏱️ TRAYECTORIA Y CONEXIÓN A OPERACIONES (I-OP)
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.45rem' }}>
            <div style={{ background: '#ffffff', padding: '0.6rem 0.6rem', borderRadius: '8px', border: '2px solid #0284c7' }}>
              <span style={{ fontSize: '0.62rem', color: '#0369a1', display: 'block', fontWeight: 800, textTransform: 'uppercase' }}>
                🎯 Días OJT Reales
              </span>
              <strong style={{ fontSize: '1.15rem', color: '#0284c7', fontFamily: 'Outfit, sans-serif' }}>
                {asesor.dias_ojt_reales || asesor.dias_conexion_ojt || asesor.dia_actual || 1} Días
              </strong>
              <span style={{ fontSize: '0.58rem', color: '#0369a1', display: 'block', fontWeight: 600 }}>Curva Oficial OJT</span>
            </div>

            <div style={{ background: '#ffffff', padding: '0.6rem 0.6rem', borderRadius: '8px', border: '1px solid #e0eefe' }}>
              <span style={{ fontSize: '0.62rem', color: '#7a90ad', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>Ingreso OP</span>
              <strong style={{ fontSize: '0.82rem', color: esOperativo ? '#0d9488' : esBaja ? '#dc2626' : '#0284c7', display: 'block', marginTop: '0.15rem' }}>
                {esOperativo ? `🟢 Día ${asesor.dia_actual} OJT` : esBaja ? `🔴 Día ${asesor.dia_actual}` : `🔵 Día ${asesor.dia_actual} OJT`}
              </strong>
              <span style={{ fontSize: '0.58rem', color: '#7a90ad', display: 'block' }}>
                {esOperativo ? 'Egresó a Operaciones' : 'En evaluación'}
              </span>
            </div>

            <div style={{ background: '#f8fafc', padding: '0.6rem 0.6rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.62rem', color: '#64748b', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>Permanencia Total</span>
              <strong style={{ fontSize: '1.05rem', color: '#334155', fontFamily: 'Outfit, sans-serif' }}>
                {asesor.dias_totales_registrados || asesor.dias_conexion_ojt || asesor.dia_actual || 1} Días
              </strong>
              <span style={{ fontSize: '0.58rem', color: '#94a3b8', display: 'block' }}>Capa + Conexión</span>
            </div>
          </div>

          {/* Fechas Ancla Operativas */}
          <div style={{ marginTop: '0.65rem', padding: '0.65rem 0.75rem', background: '#ffffff', borderRadius: '8px', border: '1px solid #e0eefe' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#7a90ad', textTransform: 'uppercase' }}>Hitos de Fecha Operativos</span>
              <span style={{
                fontSize: '0.62rem', fontWeight: 800, padding: '0.12rem 0.4rem', borderRadius: '12px',
                background: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd'
              }}>
                REGISTRO OFICIAL
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem', fontSize: '0.72rem' }}>
              <div>
                <span style={{ color: '#7a90ad', display: 'block', fontSize: '0.63rem' }}>Inicio Capa</span>
                <strong>{asesor.fecha_inicio_capa || 'Día 1 (Inicio Teórico)'}</strong>
              </div>
              <div>
                <span style={{ color: '#7a90ad', display: 'block', fontSize: '0.63rem' }}>Inicio OJT</span>
                <strong style={{ color: '#1e6fc0' }}>{asesor.fecha_inicio_ojt || 'Día 1 (Conexión OJT)'}</strong>
              </div>
              <div>
                <span style={{ color: '#7a90ad', display: 'block', fontSize: '0.63rem' }}>Ingreso OP</span>
                <strong style={{ color: esOperativo ? '#0d9488' : '#0f1c2e' }}>
                  {asesor.fecha_ingreso_op || (esOperativo ? `Día ${asesor.dia_actual} de Conexión` : 'En proceso OJT')}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Tira de Evolución de 8 Días */}
        <div style={{ marginBottom: '1.25rem', background: '#f7f9fc', padding: '1rem', borderRadius: '10px', border: '1px solid #e8edf5' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f1c2e', marginBottom: '0.6rem' }}>
            Evolución Diaria (D1 a D8)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(d => {
              const esPasado = d <= diaActual;
              const esInduccion = d <= 2;
              const esExt = d >= 6;

              let bg = '#ffffff';
              let border = '#e8edf5';
              let color = '#7a90ad';
              let tag = esInduccion ? 'Inducción' : esExt ? 'Extensión' : 'Medible';

              if (esPasado) {
                if (esBaja) { bg = '#fff1f2'; border = '#fecdd3'; color = '#dc2626'; }
                else if (esInduccion) { bg = '#e0f2fe'; border = '#bae6fd'; color = '#0284c7'; }
                else if (esExt) { bg = '#fef3c7'; border = '#fde68a'; color = '#d97706'; }
                else { bg = '#ccfbf1'; border = '#99f6e4'; color = '#0d9488'; }
              }

              return (
                <div key={d} style={{
                  background: bg, border: `1px solid ${border}`, borderRadius: '6px',
                  padding: '0.4rem', textAlign: 'center', opacity: esPasado ? 1 : 0.4
                }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color }}>Día {d}</div>
                  <div style={{ fontSize: '0.6rem', color: '#7a90ad' }}>{tag}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Indicadores y Métricas Clave */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7a90ad', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
            Indicadores y Métricas Clave
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div style={{ background: '#f7f9fc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e8edf5' }}>
              <div style={{ fontSize: '0.68rem', color: '#7a90ad', fontWeight: 700 }}>Llamadas Totales</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f1c2e' }}>
                {asesor.llamadas_acumuladas || asesor.llamadas_q || 0}
              </div>
              <div style={{ fontSize: '0.65rem', color: '#1e6fc0', fontWeight: 600 }}>
                Prom: {asesor.promedio_llamadas || 0}/día · Últ: {asesor.llamadas_ultimo_dia || 0}
              </div>
            </div>
            <div style={{ background: '#f7f9fc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e8edf5' }}>
              <div style={{ fontSize: '0.68rem', color: '#7a90ad' }}>KPI 3: Calidad %</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: asesor.calidad_pct >= 80 ? '#0d9488' : '#d97706' }}>
                {asesor.calidad_pct}%
              </div>
              <div style={{ fontSize: '0.65rem', color: '#7a90ad' }}>Meta: ≥75%</div>
            </div>
            <div style={{ background: '#f7f9fc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e8edf5' }}>
              <div style={{ fontSize: '0.68rem', color: '#7a90ad' }}>KPI 1: Transferencia</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: asesor.transferencia_pct <= 15 ? '#0d9488' : '#dc2626' }}>
                {asesor.transferencia_pct}%
              </div>
              <div style={{ fontSize: '0.65rem', color: '#7a90ad' }}>Meta: ≤15%</div>
            </div>
            <div style={{ background: '#f7f9fc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e8edf5' }}>
              <div style={{ fontSize: '0.68rem', color: '#7a90ad' }}>KPI 2: tNPS</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: asesor.tnps_pct >= 65 ? '#0d9488' : '#d97706' }}>
                {asesor.tnps_pct}%
              </div>
              <div style={{ fontSize: '0.65rem', color: '#7a90ad' }}>Meta: ≥65%</div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #e8edf5' }}>
          <button
            className="btn-exec btn-exec-primary"
            style={{ width: '100%', padding: '0.75rem', fontSize: '0.85rem', fontWeight: 700, justifyContent: 'center' }}
            onClick={() => {
              onClose();
              onEjecutarDecision(asesor.documento, 'Registro de Acción Operativa', asesor.nombre);
            }}
          >
            Registrar Acción de Control Operativo
          </button>
        </div>

      </div>
    </>
  );
}
