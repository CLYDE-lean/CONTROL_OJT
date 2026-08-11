import React from 'react';
import { ArrowDown, ArrowRight, Layers, ExternalLink } from 'lucide-react';

/**
 * Componente EmbudoSupervivenciaGrupo
 * 
 * Características:
 * 1. Colapso automático de etapas consecutivas con conteo idéntico (0% caída).
 * 2. Resaltado del delta real (-N asesores, -X%) calculado sobre la etapa anterior.
 * 3. Enlace accionable "Ver caída día a día" que cambia de pestaña y navega al Funnel D1-D8.
 */
export default function EmbudoSupervivenciaGrupo({ data, onNavegarDetalle }) {
  const embudo = data?.embudo;
  const total = embudo?.total_asesores_unicos || 0;
  const supervivencia = embudo?.supervivencia;

  // 1. Etapas base crudas del embudo
  const asistieron = supervivencia?.asistieron || total;
  const inicianCapa = supervivencia?.iniciaron_capa || asistieron;
  const lleganOjt = supervivencia?.llegaron_ojt || Math.min(inicianCapa, embudo?.dias_principales_1_8?.find(d => d.dia === 1)?.activos || asistieron);
  const lleganOp = supervivencia?.llegaron_op || Math.min(lleganOjt, data?.roi?.metricas?.egresados_post_extension || data?.embudo?.flujo?.total_egresados_op || 40);

  const rawEtapas = [
    { key: 'asistieron', label: 'Asistieron', count: asistieron, color: '#3b82f6', sub: 'FECHA_ASISTENCIA' },
    { key: 'iniciaron_capa', label: 'Iniciaron Capa', count: Math.min(inicianCapa, asistieron), color: '#6366f1', sub: 'FECHA_INICIO_CAPA' },
    { key: 'llegan_ojt', label: 'Llegaron a OJT', count: Math.min(lleganOjt, inicianCapa, asistieron), color: '#0d9488', sub: 'FECHA_INICIO_OJT' },
    { key: 'llegan_op', label: 'Llegaron a OP', count: Math.min(lleganOp, lleganOjt, inicianCapa, asistieron), color: '#10b981', sub: 'FECHA_INGRESO_OP (I-OP)' }
  ];

  // 2. Lógica Dinámica de Colapso de Etapas con Conteos Idénticos
  const etapasVisibles = [];
  let index = 0;

  while (index < rawEtapas.length) {
    const current = rawEtapas[index];
    const grupoColapsado = [current];
    let nextIndex = index + 1;

    // Agrupar etapas consecutivas que tengan el MISMO count
    while (nextIndex < rawEtapas.length && rawEtapas[nextIndex].count === current.count) {
      grupoColapsado.push(rawEtapas[nextIndex]);
      nextIndex++;
    }

    const lastInGroup = grupoColapsado[grupoColapsado.length - 1];
    const tieneColapso = grupoColapsado.length > 1;

    let notaContexto = '';
    if (tieneColapso) {
      const secuenciaNombres = grupoColapsado.map(e => e.label).join(' → ');
      notaContexto = `${secuenciaNombres}: sin caída registrada en estas etapas`;
    }

    etapasVisibles.push({
      ...lastInGroup,
      grupoColapsado,
      tieneColapso,
      notaContexto
    });

    index = nextIndex;
  }

  const maxVal = Math.max(asistieron, 1);

  // Manejador del clic "Ver caída día a día"
  const handleVerDetalleDiario = () => {
    if (onNavegarDetalle) {
      onNavegarDetalle();
    } else {
      // Fallback: buscar elemento en DOM o evento global
      const el = document.getElementById('funnel-d1-d8-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <div className="executive-card" style={{ padding: '1.35rem', borderRadius: '16px' }}>
      {/* Cabecera del Embudo */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e8edf5', paddingBottom: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f1c2e', fontFamily: 'Outfit, sans-serif', margin: 0 }}>
            Embudo de Supervivencia del Grupo
          </h3>
          <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem', margin: 0 }}>
            Flujo continuo de conversión desde reclutamiento hasta operación activa
          </p>
        </div>
        <span style={{ fontSize: '0.7rem', background: '#eff6ff', color: '#1d4ed8', padding: '0.25rem 0.65rem', borderRadius: '6px', fontWeight: 700 }}>
          FUNNEL ACCIONABLE
        </span>
      </div>

      {/* Contenedor principal de etapas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', padding: '0.25rem 0' }}>
        {etapasVisibles.map((etapa, idx) => {
          const widthPct = Math.max(Math.round((etapa.count / maxVal) * 100), 12);
          const pctSobreTotal = Math.round((etapa.count / maxVal) * 100);

          // Determinar si hay un salto/caída con la etapa siguiente visible
          const etapaSiguiente = etapasVisibles[idx + 1];
          const hayCaida = etapaSiguiente && etapa.count > etapaSiguiente.count;

          let deltaAsesores = 0;
          let deltaPctRelativo = 0;
          if (hayCaida) {
            deltaAsesores = etapa.count - etapaSiguiente.count;
            deltaPctRelativo = Math.round((deltaAsesores / etapa.count) * 100);
          }

          return (
            <React.Fragment key={etapa.key || idx}>
              {/* FILA DE ETAPA VISIBLE */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {/* Etiqueta de la Etapa */}
                  <div style={{ width: '135px', fontSize: '0.8rem', fontWeight: 700, color: '#334155', textAlign: 'right' }}>
                    {etapa.label}
                  </div>

                  {/* Barra visual de Embudo */}
                  <div style={{ flex: 1, background: '#f1f5f9', borderRadius: '10px', height: '38px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
                    <div style={{
                      width: `${widthPct}%`,
                      height: '100%',
                      background: etapa.color,
                      borderRadius: '10px',
                      transition: 'width 0.5s ease',
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: '0.85rem',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
                    }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffffff' }}>
                        {etapa.count.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Badge de Porcentaje sobre Total Inicial */}
                  <div style={{ width: '85px', fontSize: '0.8rem', fontWeight: 800, color: etapa.color }}>
                    {pctSobreTotal}% <span style={{ fontSize: '0.7rem', fontWeight: 500, color: '#94a3b8' }}>del total</span>
                  </div>
                </div>

                {/* Nota de Contexto cuando hay colapso automático */}
                {etapa.tieneColapso && (
                  <div style={{ marginLeft: '150px', fontSize: '0.72rem', color: '#64748b', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ background: '#f1f5f9', padding: '0.1rem 0.4rem', borderRadius: '4px', color: '#475569', fontWeight: 600 }}>
                      ℹ️ {etapa.notaContexto}
                    </span>
                  </div>
                )}
              </div>

              {/* FILA INTERMEDIA: RESALTADO DE CAÍDA REAL (DELTA) */}
              {hayCaida && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  margin: '0.25rem 0 0.25rem 150px',
                  padding: '0.45rem 0.85rem',
                  background: 'rgba(239, 68, 68, 0.05)',
                  border: '1px border-dashed rgba(239, 68, 68, 0.3)',
                  borderLeft: '4px solid #ef4444',
                  borderRadius: '8px'
                }}>
                  {/* Delta de Caída */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#dc2626', fontWeight: 700, fontSize: '0.78rem' }}>
                    <ArrowDown size={16} strokeWidth={2.5} style={{ color: '#ef4444' }} />
                    <span>
                      caída de <strong>{deltaAsesores.toLocaleString()} asesores</strong> (-{deltaPctRelativo}%) al pasar a {etapaSiguiente.label}
                    </span>
                  </div>

                  {/* Botón Accionable Ver Caída Día a Día */}
                  <button
                    onClick={handleVerDetalleDiario}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      background: '#ffffff',
                      border: '1px solid #fecdd3',
                      color: '#e11d48',
                      padding: '0.3rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.73rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 1px 3px rgba(225, 29, 72, 0.1)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#e11d48';
                      e.currentTarget.style.color = '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#ffffff';
                      e.currentTarget.style.color = '#e11d48';
                    }}
                  >
                    <span>Ver caída día a día</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
