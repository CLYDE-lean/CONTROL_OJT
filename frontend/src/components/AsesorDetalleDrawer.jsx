import React from 'react';
import { X } from 'lucide-react';
import { KPI_OFICIALES, semaforoMayorMejor, colorSemaforoKpi } from '../utils/kpiOficiales';

function fmtFecha(v) {
  if (!v) return '—';
  const s = String(v).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  if (s.toUpperCase().startsWith('DÍA') || s.toUpperCase().startsWith('DIA')) return s;
  return s;
}

function fmtPct(v) {
  if (v === null || v === undefined || v === '' || Number.isNaN(parseFloat(v))) return '—';
  return `${parseFloat(v)}%`;
}

export default function AsesorDetalleDrawer({ asesor, onClose, onEjecutarDecision }) {
  if (!asesor) return null;

  const esOperativo = asesor.es_iop === 1 || 
                      asesor.estado_actual?.toUpperCase().includes('EGRESADO') || 
                      asesor.estado_actual?.toUpperCase().includes('OPERAC') || 
                      asesor.resultado_evaluacion?.toUpperCase().includes('EGRESADO');
  const esBaja      = asesor.es_baja === 1 || 
                      asesor.estado_actual?.toUpperCase().includes('BAJA') || 
                      asesor.estado_actual?.toUpperCase().includes('CESADO');

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
      <div 
        className="drawer-panel"
        style={{
          zIndex: 1200,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          padding: '1.5rem',
          borderLeft: '1px solid #e8edf5',
          fontFamily: 'Inter, sans-serif'
        }}
      >
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
            {(asesor.semana || asesor.grupo) && (
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
                {[asesor.periodo, asesor.semana, asesor.grupo, asesor.campana].filter(Boolean).join(' · ')}
              </div>
            )}
          </div>
          <button 
            onClick={onClose}
            className="touch-target"
            style={{ border: 'none', background: '#f0f4f9', borderRadius: '50%', cursor: 'pointer', color: '#0f1c2e' }}
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
            <div style={{ background: '#f7f9fc', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #e8edf5' }}>
              <span style={{ fontSize: '0.68rem', color: '#7a90ad', display: 'block' }}>Grupo</span>
              <strong style={{ fontSize: '0.8rem', color: '#0f1c2e' }}>{asesor.grupo || '—'}</strong>
            </div>
            <div style={{ background: '#f7f9fc', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #e8edf5' }}>
              <span style={{ fontSize: '0.68rem', color: '#7a90ad', display: 'block' }}>Semana</span>
              <strong style={{ fontSize: '0.8rem', color: '#0f1c2e' }}>{asesor.semana || '—'}</strong>
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
                Último día OJT
              </span>
              <strong style={{ fontSize: '1.15rem', color: '#0284c7', fontFamily: 'Outfit, sans-serif' }}>
                Día {asesor.dias_ojt_reales || asesor.dia_actual || 1}
              </strong>
              <span style={{ fontSize: '0.58rem', color: '#0369a1', display: 'block', fontWeight: 600 }}>
                {asesor.dias_conexion_ojt || (asesor.trayectoria || []).length} día(s) con registro
              </span>
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
              <span style={{ fontSize: '0.62rem', color: '#64748b', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>Filas en base</span>
              <strong style={{ fontSize: '1.05rem', color: '#334155', fontFamily: 'Outfit, sans-serif' }}>
                {asesor.dias_totales_registrados || 0}
              </strong>
              <span style={{ fontSize: '0.58rem', color: '#94a3b8', display: 'block' }}>Capa + OJT (no son días de aula)</span>
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
                <strong>{fmtFecha(asesor.fecha_inicio_capa)}</strong>
              </div>
              <div>
                <span style={{ color: '#7a90ad', display: 'block', fontSize: '0.63rem' }}>Inicio OJT</span>
                <strong style={{ color: '#1e6fc0' }}>{fmtFecha(asesor.fecha_inicio_ojt)}</strong>
              </div>
              <div>
                <span style={{ color: '#7a90ad', display: 'block', fontSize: '0.63rem' }}>Ingreso OP</span>
                <strong style={{ color: esOperativo ? '#0d9488' : '#0f1c2e' }}>
                  {esOperativo ? fmtFecha(asesor.fecha_ingreso_op) : 'En proceso OJT'}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Tira de Evolución de 8 Días */}
        <div style={{ marginBottom: '1.25rem', background: '#f7f9fc', padding: '1rem', borderRadius: '10px', border: '1px solid #e8edf5' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f1c2e', marginBottom: '0.35rem' }}>
            Trazabilidad diaria (solo días con registro)
          </div>
          <div style={{ fontSize: '0.62rem', color: '#7a90ad', marginBottom: '0.6rem' }}>
            Un recuadro apagado = no hay fila ese día. No se rellena por “llegó hasta D5”.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((d) => {
              const hit = (asesor.trayectoria || []).find((t) => Number(t.dia) === d);
              const esInduccion = d <= 2;
              const esExt = d >= 6;
              const tag = hit
                ? (hit.es_iop ? 'I-OP' : hit.es_baja ? 'Baja' : esInduccion ? 'Inducción' : esExt ? 'Extensión' : 'Medible')
                : 'Sin registro';

              let bg = '#ffffff';
              let border = '#e8edf5';
              let color = '#94a3b8';
              if (hit) {
                if (hit.es_baja) { bg = '#fff1f2'; border = '#fecdd3'; color = '#dc2626'; }
                else if (hit.es_iop) { bg = '#ccfbf1'; border = '#99f6e4'; color = '#0d9488'; }
                else if (esInduccion) { bg = '#e0f2fe'; border = '#bae6fd'; color = '#0284c7'; }
                else if (esExt) { bg = '#fef3c7'; border = '#fde68a'; color = '#d97706'; }
                else { bg = '#ccfbf1'; border = '#99f6e4'; color = '#0d9488'; }
              }

              return (
                <div key={d} style={{
                  background: bg, border: `1px solid ${border}`, borderRadius: '6px',
                  padding: '0.4rem', textAlign: 'center', opacity: hit ? 1 : 0.45
                }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color }}>Día {d}</div>
                  <div style={{ fontSize: '0.58rem', color: '#64748b' }}>{tag}</div>
                  {hit && (
                    <div style={{ fontSize: '0.58rem', color: '#0f1c2e', marginTop: '2px', fontWeight: 600 }}>
                      {hit.llamadas || 0} ll
                      {hit.calidad_pct != null ? ` · C ${hit.calidad_pct}%` : ''}
                    </div>
                  )}
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
                Promedio en días OJT: {asesor.promedio_llamadas || 0}/día · Último día: {asesor.llamadas_ultimo_dia || 0}
              </div>
            </div>
            <div style={{ background: '#f7f9fc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e8edf5' }}>
              <div style={{ fontSize: '0.68rem', color: '#7a90ad' }}>KPI 3: Calidad %</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: colorSemaforoKpi(semaforoMayorMejor(asesor.calidad_pct, KPI_OFICIALES.calidad.meta, KPI_OFICIALES.calidad.objCump), 'card') }}>
                {fmtPct(asesor.calidad_pct)}
              </div>
              <div style={{ fontSize: '0.65rem', color: '#7a90ad' }}>SUM/SUM hasta I-OP · Meta ≥{KPI_OFICIALES.calidad.meta}%</div>
            </div>
            <div style={{ background: '#f7f9fc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e8edf5' }}>
              <div style={{ fontSize: '0.68rem', color: '#7a90ad' }}>KPI 1: Transferencia</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: colorSemaforoKpi(semaforoMayorMejor(asesor.transferencia_pct, KPI_OFICIALES.transferencia.meta, KPI_OFICIALES.transferencia.objCump), 'card') }}>
                {fmtPct(asesor.transferencia_pct)}
              </div>
              <div style={{ fontSize: '0.65rem', color: '#7a90ad' }}>SUM/SUM hasta I-OP · Meta ≥{KPI_OFICIALES.transferencia.meta}%</div>
            </div>
            <div style={{ background: '#f7f9fc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e8edf5' }}>
              <div style={{ fontSize: '0.68rem', color: '#7a90ad' }}>KPI 2: tNPS</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: colorSemaforoKpi(semaforoMayorMejor(asesor.tnps_pct, KPI_OFICIALES.tnps.meta, KPI_OFICIALES.tnps.objCump), 'card') }}>
                {fmtPct(asesor.tnps_pct)}
              </div>
              <div style={{ fontSize: '0.65rem', color: '#7a90ad' }}>SUM/SUM hasta I-OP · Meta ≥{KPI_OFICIALES.tnps.meta}%</div>
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
