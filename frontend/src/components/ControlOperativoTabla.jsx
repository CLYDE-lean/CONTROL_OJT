import React, { useState, useEffect } from 'react';
import { Table, Search, CheckCircle2, XCircle, Clock, BookOpen, Target, ChevronRight } from 'lucide-react';
import AsesorDetalleDrawer from './AsesorDetalleDrawer';

function Sparkline({ data, target = 70, isLowerBetter = false, width = 45, height = 16 }) {
  if (!data || !Array.isArray(data) || data.length === 0) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1 || 1)) * width;
    const y = height - ((val - min) / range) * (height - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const lastVal = data[data.length - 1];
  const isGood = isLowerBetter ? lastVal <= target : lastVal >= target;
  const strokeColor = isGood ? '#0d9488' : '#dc2626';

  return (
    <svg width={width} height={height} style={{ overflow: 'visible', display: 'inline-block' }}>
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      {points.length > 0 && (() => {
        const lastPt = points.split(' ').pop().split(',');
        return (
          <circle
            cx={lastPt[0]}
            cy={lastPt[1]}
            r="2"
            fill={strokeColor}
          />
        );
      })()}
    </svg>
  );
}

export default function ControlOperativoTabla({ asesores, onEjecutarDecision, filtroInicial }) {
  const [busqueda, setBusqueda] = useState('');
  const [filtroDia, setFiltroDia] = useState('');
  const [filtroResultado, setFiltroResultado] = useState(filtroInicial || '');
  const [ordenarPor, setOrdenarPor] = useState('calidad');
  const [asesorSeleccionado, setAsesorSeleccionado] = useState(null);

  useEffect(() => {
    if (filtroInicial) {
      setFiltroResultado(filtroInicial);
    }
  }, [filtroInicial]);

  if (!asesores) return null;

  const asesoresFiltrados = asesores.filter(a => {
    const nombre = (a.nombre || a.asesor || '').toLowerCase();
    const doc = (a.documento || a.dni || '').toString();
    const campana = (a.campana || '').toLowerCase();
    const formador = (a.formador || '').toLowerCase();
    const term = (busqueda || '').toLowerCase();

    const matchBusqueda = !term ||
      nombre.includes(term) ||
      doc.includes(term) ||
      campana.includes(term) ||
      formador.includes(term);

    const diaActual = a.dia_actual || a.dia_logico_ojt || 1;
    const matchDia = filtroDia === 'atipicos'
      ? diaActual > 8
      : filtroDia
      ? diaActual === parseInt(filtroDia)
      : true;

    const resultado = (a.resultado_evaluacion || a.estado_actual || a.accion_recomendada || '').toUpperCase();
    let matchResultado = true;

    if (filtroResultado === 'DESCONEXION') {
      matchResultado = a.requiere_regularizacion || a.es_desconexion_sin_registro || (a.resultado_evaluacion || '').includes('REGULARIZAR');
    } else if (filtroResultado === 'APROBADO') {
      matchResultado = resultado.includes('APROBADO') || resultado.includes('EGRESADO') || resultado.includes('OPERACI') || a.es_iop === 1;
    } else if (filtroResultado === 'DESAPROBADO') {
      matchResultado = resultado.includes('DESAPROBADO') || resultado.includes('BAJA') || resultado.includes('CESADO') || a.es_baja === 1;
    } else if (filtroResultado === 'INDUCCIÓN') {
      matchResultado = diaActual <= 2;
    } else if (filtroResultado === 'EXTENSIÓN') {
      matchResultado = diaActual >= 6;
    } else if (filtroResultado) {
      matchResultado = resultado.includes(filtroResultado.toUpperCase());
    }

    return matchBusqueda && matchDia && matchResultado;
  });

  const caidasPendientesCount = asesores.filter(a => a.requiere_regularizacion || a.es_desconexion_sin_registro).length;

  const ordenados = [...asesoresFiltrados].sort((a, b) => {
    if (ordenarPor === 'calidad')       return b.calidad_pct - a.calidad_pct;
    if (ordenarPor === 'transferencia') return a.transferencia_pct - b.transferencia_pct;
    if (ordenarPor === 'tnps')          return b.tnps_pct - a.tnps_pct;
    if (ordenarPor === 'llamadas')      return (b.llamadas_q || 0) - (a.llamadas_q || 0);
    if (ordenarPor === 'dia')           return b.dia_logico_ojt - a.dia_logico_ojt;
    return 0;
  });

  return (
    <div className="executive-card">

      {/* Header */}
      <div className="card-header-exec" style={{ marginBottom: '1rem', paddingBottom: '0.85rem', borderBottom: '1px solid #e8edf5' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Table size={18} style={{ color: '#1e6fc0' }} />
          <div>
            <h2 className="card-title-exec" style={{ fontSize: '1.05rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>
              Evolución Diaria (D1-D8) y Evaluación de Asesores OJT
            </h2>
            <p style={{ fontSize: '0.76rem', color: '#7a90ad', marginTop: '0.1rem' }}>
              Haz clic en cualquier asesor para desplegar su Ficha Completa y métricas de asistencia.
            </p>
          </div>
        </div>
        <span className="badge-exec badge-neutral" style={{ fontWeight: 700, fontSize: '0.78rem' }}>
          {ordenados.length} Asesores
        </span>
      </div>

      {/* Leyenda Visual de Etapas con Íconos */}
      <div style={{
        display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'center',
        padding: '0.75rem 1rem', background: '#f7f9fc', border: '1px solid #e8edf5',
        borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.76rem'
      }}>
        <strong style={{ color: '#0f1c2e' }}>Etapas OJT:</strong>
        
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#0284c7', fontWeight: 600 }}>
          <BookOpen size={14} /> D1 - D2: Inducción (No Medible)
        </span>

        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#0d9488', fontWeight: 600 }}>
          <Target size={14} /> D3 - D5: Evaluación Medible (Aprobación)
        </span>

        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#d97706', fontWeight: 600 }}>
          <Clock size={14} /> D6 - D8: Extensión Autorizada
        </span>
      </div>

      {/* Controles de Búsqueda, Filtros y Ordenamiento */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>

        {/* Buscador */}
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#7a90ad' }} />
          <input
            type="text"
            placeholder="Buscar por DNI, Nombre, Campaña o Formador..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 0.75rem 0.55rem 2.2rem',
              background: '#f7f9fc',
              border: '1px solid #dce3ee',
              borderRadius: '8px',
              color: '#0f1c2e',
              fontSize: '0.83rem',
              outline: 'none'
            }}
          />
        </div>

        {/* Botón de Alerta de Caídas Pendientes de Regularizar */}
        {caidasPendientesCount > 0 && (
          <button
            onClick={() => setFiltroResultado(filtroResultado === 'DESCONEXION' ? '' : 'DESCONEXION')}
            style={{
              padding: '0.55rem 0.95rem',
              background: filtroResultado === 'DESCONEXION' ? '#dc2626' : '#fff1f2',
              color: filtroResultado === 'DESCONEXION' ? '#ffffff' : '#dc2626',
              border: '1px solid #fecdd3',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(220, 38, 38, 0.15)',
              transition: 'all 0.15s ease'
            }}
          >
            🚨 Caídas Sin Regularizar ({caidasPendientesCount})
          </button>
        )}

        {/* Filtro Día */}
        <select
          value={filtroDia}
          onChange={(e) => setFiltroDia(e.target.value)}
          style={{
            padding: '0.55rem 0.85rem',
            background: '#f7f9fc',
            border: '1px solid #dce3ee',
            borderRadius: '8px',
            color: '#0f1c2e',
            fontSize: '0.82rem',
            outline: 'none'
          }}
        >
          <option value="">Todos los Días</option>
          <option value="1">Día 1 (Inducción)</option>
          <option value="2">Día 2 (Inducción)</option>
          <option value="3">Día 3 (Inicio Evaluación)</option>
          <option value="4">Día 4 (Evaluación)</option>
          <option value="5">Día 5 (Evaluación Final)</option>
          <option value="6">Día 6 (Extensión 1)</option>
          <option value="7">Día 7 (Extensión 2)</option>
          <option value="8">Día 8 (Máx Política)</option>
          <option value="atipicos">🚨 Exceso (&gt;8 Días)</option>
        </select>

        {/* Filtro Resultado */}
        <select
          value={filtroResultado}
          onChange={(e) => setFiltroResultado(e.target.value)}
          style={{
            padding: '0.55rem 0.85rem',
            background: '#f7f9fc',
            border: '1px solid #dce3ee',
            borderRadius: '8px',
            color: '#0f1c2e',
            fontSize: '0.82rem',
            outline: 'none'
          }}
        >
          <option value="">Todos los Resultados</option>
          <option value="DESCONEXION">🚨 REGULARIZAR: Desconexión D1→D2</option>
          <option value="APROBADO">🟢 APROBADO / EGRESADO A OP</option>
          <option value="DESAPROBADO">🔴 DESAPROBADO / BAJA OJT</option>
          <option value="INDUCCIÓN">🔵 INDUCCIÓN (D1-D2)</option>
          <option value="EXTENSIÓN">🟠 EN EXTENSIÓN (D6-D8)</option>
        </select>

        {/* Ordenamiento */}
        <select
          value={ordenarPor}
          onChange={(e) => setOrdenarPor(e.target.value)}
          style={{
            padding: '0.55rem 0.85rem',
            background: '#f0f7ff',
            border: '1px solid #1e6fc0',
            borderRadius: '8px',
            color: '#1e6fc0',
            fontWeight: 600,
            fontSize: '0.82rem',
            outline: 'none'
          }}
        >
          <option value="calidad">Ordenar: KPI 3 Calidad %</option>
          <option value="transferencia">Ordenar: KPI 1 Transferencia %</option>
          <option value="tnps">Ordenar: KPI 2 tNPS %</option>
          <option value="llamadas">Ordenar: Productividad (Llamadas)</option>
          <option value="dia">Ordenar: Día OJT Alcanzado</option>
        </select>
      </div>

      {/* Tabla de Alta Densidad con Scroll Contenido y Encabezados Fijados */}
      <div style={{ width: '100%', maxHeight: '600px', overflowY: 'auto', overflowX: 'auto', border: '1px solid #e8edf5', borderRadius: '10px' }}>
        <table className="exec-table" style={{ margin: 0 }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <tr>
              <th>DNI / Asesor</th>
              <th style={{ minWidth: '160px' }}>Campaña &amp; Formador</th>
              <th style={{ textAlign: 'center' }}>Evolución (D1 → D8)</th>
              <th style={{ textAlign: 'center' }}>Ingreso a Operación (I-OP)</th>
              <th style={{ textAlign: 'center' }}>Evaluación Final</th>
              <th style={{ textAlign: 'center' }}>Llamadas</th>
              <th style={{ textAlign: 'center' }}>KPI 1: Transf. %</th>
              <th style={{ textAlign: 'center' }}>KPI 2: tNPS %</th>
              <th style={{ textAlign: 'center' }}>KPI 3: Calidad %</th>
              <th style={{ textAlign: 'center', minWidth: '140px', whiteSpace: 'nowrap' }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {ordenados.map((a, idx) => {
              const estadoStr   = (a.estado_actual || a.estado || '').toUpperCase();
              const evalStr     = (a.resultado_evaluacion || '').toUpperCase();
              const recStr      = (a.accion_recomendada || '').toUpperCase();
              const esBaja      = estadoStr.includes('BAJA') || evalStr.includes('BAJA') || recStr.includes('BAJA') || a.es_baja === 1;
              const esOperativo = a.es_iop === 1 || estadoStr.includes('OPERAC') || estadoStr.includes('EGRESADO') || evalStr.includes('EGRESADO') || recStr.includes('PASÓ A OPERACIONES');
              const diaActual   = a.dia_actual || a.dia_logico_ojt || 1;
              const esBucle     = diaActual > 8 && !esOperativo;

              return (
                <tr
                  key={`${a.documento}-${idx}`}
                  onClick={() => setAsesorSeleccionado(a)}
                  style={{
                    cursor: 'pointer',
                    background: esBucle ? '#fff1f2' : esBaja ? '#fafafa' : undefined,
                    transition: 'background 0.15s ease'
                  }}
                  title="Haz clic para ver la Ficha Completa del Asesor"
                >
                  
                  {/* DNI & Asesor */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f1c2e', fontSize: '0.84rem' }}>
                          {a.nombre || a.asesor || 'SIN NOMBRE'}
                        </div>
                        <code style={{ fontSize: '0.73rem', color: '#1e6fc0', fontWeight: 600 }}>{a.documento || a.dni || ''}</code>
                      </div>
                      <ChevronRight size={14} style={{ color: '#7a90ad', marginLeft: 'auto' }} />
                    </div>
                  </td>

                  {/* Campaña & Formador */}
                  <td style={{ maxWidth: '180px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f1c2e', display: 'block', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={a.campana}>{a.campana}</div>
                    <div style={{ fontSize: '0.72rem', color: '#7a90ad', display: 'block', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={a.formador}>{a.formador}</div>
                  </td>

                  {/* Tira Visual de Evolución de 8 Días con Íconos */}
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(d => {
                        const esDiaPasado = d <= diaActual;
                        const esInduccion = d <= 2;
                        const esExtension = d >= 6;
                        
                        let bg = '#e8edf5';
                        let color = '#7a90ad';

                        if (esDiaPasado) {
                          if (esBaja) {
                            bg = '#fecdd3'; color = '#dc2626';
                          } else if (esInduccion) {
                            bg = '#e0f2fe'; color = '#0284c7'; // Azul Inducción
                          } else if (esExtension) {
                            bg = '#fef3c7'; color = '#d97706'; // Ámbar Extensión
                          } else {
                            bg = a.calidad_pct >= 75 ? '#ccfbf1' : '#fef3c7'; 
                            color = a.calidad_pct >= 75 ? '#0d9488' : '#d97706'; // Verde Medible
                          }
                        }

                        return (
                          <div
                            key={d}
                            onClick={(e) => {
                              e.stopPropagation();
                              setAsesorSeleccionado(a);
                            }}
                            title={
                              esInduccion
                                ? `Día ${d}: Inducción (No Medible en Nota)`
                                : d <= 5
                                ? `Día ${d}: Evaluación Medible (Aprobación)`
                                : `Día ${d}: Extensión Autorizada`
                            }
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2px',
                              padding: '2px 5px',
                              borderRadius: '5px',
                              background: bg,
                              color: color,
                              fontSize: '0.64rem',
                              fontWeight: 700,
                              border: d === diaActual ? `1px solid ${color}` : 'none',
                              cursor: 'pointer'
                            }}
                          >
                            {esInduccion ? <BookOpen size={10} /> : esExtension ? <Clock size={10} /> : <Target size={10} />}
                            D{d}
                          </div>
                        );
                      })}
                      {esBucle && (
                        <div style={{ padding: '2px 5px', borderRadius: '4px', background: '#fee2e2', color: '#dc2626', fontSize: '0.64rem', fontWeight: 800 }}>
                          &gt;8D
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Transición / Ingreso a Operación (Días de Conexión) */}
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: esOperativo ? '#0d9488' : esBaja ? '#dc2626' : '#0284c7' }}>
                      {esOperativo ? `🟢 Día ${diaActual} OP` : esBaja ? `🔴 Cesado D${diaActual}` : `🔵 Día ${diaActual} OJT`}
                    </div>
                    <span style={{ fontSize: '0.67rem', color: '#7a90ad', fontWeight: 600 }}>
                      {a.dias_conexion_ojt || diaActual} días conexión
                    </span>
                  </td>

                  {/* Evaluación Final (Aprobó / Desaprobó) */}
                  <td style={{ textAlign: 'center' }}>
                    <span className={`badge-exec ${
                      (a.requiere_regularizacion || a.es_desconexion_sin_registro) ? 'badge-red' :
                      a.resultado_evaluacion?.includes('APROBADO') ? 'badge-green' :
                      a.resultado_evaluacion?.includes('DESAPROBADO') ? 'badge-red' :
                      a.resultado_evaluacion?.includes('INDUCCIÓN') ? 'badge-blue' : 'badge-amber'
                    }`}>
                      {(a.requiere_regularizacion || a.es_desconexion_sin_registro) ? '🚨 DESCONEXIÓN D1→D2' : a.resultado_evaluacion}
                    </span>
                    {a.motivo_baja && (
                      <div style={{ fontSize: '0.67rem', color: '#dc2626', marginTop: '0.2rem', maxWidth: '130px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={a.motivo_baja}>
                        {a.motivo_baja}
                      </div>
                    )}
                  </td>

                  {/* Productividad (Llamadas) */}
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '0.86rem', fontWeight: 800, color: (a.llamadas_q || 0) > 0 ? '#0f1c2e' : '#7a90ad' }}>
                      {a.llamadas_q || 0}
                    </span>
                  </td>

                  {/* KPI 1: Transferencia % + Sparkline */}
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <Sparkline
                        data={a.historico_transf || [Math.min(100, (a.transferencia_pct || 0) + 8), Math.min(100, (a.transferencia_pct || 0) + 3), a.transferencia_pct || 0]}
                        target={15}
                        isLowerBetter={true}
                      />
                      <span style={{
                        fontSize: '0.82rem', fontWeight: 800,
                        color: a.transferencia_pct <= 15 ? '#0d9488' : a.transferencia_pct <= 25 ? '#d97706' : '#dc2626'
                      }}>
                        {a.transferencia_pct}%
                      </span>
                    </div>
                  </td>

                  {/* KPI 2: tNPS % + Sparkline */}
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <Sparkline
                        data={a.historico_tnps || [Math.max(0, (a.tnps_pct || 0) - 10), Math.max(0, (a.tnps_pct || 0) - 4), a.tnps_pct || 0]}
                        target={55}
                      />
                      <span style={{
                        fontSize: '0.82rem', fontWeight: 800,
                        color: a.tnps_pct >= 65 ? '#0d9488' : a.tnps_pct >= 45 ? '#d97706' : '#dc2626'
                      }}>
                        {a.tnps_pct}%
                      </span>
                    </div>
                  </td>

                  {/* KPI 3: Calidad % + Sparkline */}
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <Sparkline
                        data={a.historico_calidad || [Math.max(0, (a.calidad_pct || 0) - 12), Math.max(0, (a.calidad_pct || 0) - 5), a.calidad_pct || 0]}
                        target={75}
                      />
                      <span style={{
                        fontSize: '0.85rem', fontWeight: 800,
                        color: a.calidad_pct >= 80 ? '#0d9488' : a.calidad_pct >= 70 ? '#d97706' : '#dc2626'
                      }}>
                        {a.calidad_pct}%
                      </span>
                    </div>
                  </td>

                  {/* Acción */}
                  <td style={{ textAlign: 'center', minWidth: '140px', whiteSpace: 'nowrap' }} onClick={(e) => e.stopPropagation()}>
                    {esOperativo ? (
                      <span className="badge-status-pill badge-status-verde">
                        🟢 En Operación
                      </span>
                    ) : esBaja ? (
                      <span className="badge-status-pill badge-status-rojo">
                        🔴 Baja OJT
                      </span>
                    ) : (a.requiere_regularizacion || a.es_desconexion_sin_registro) ? (
                      <button
                        className="badge-status-pill badge-status-rojo touch-target"
                        style={{ cursor: 'pointer', background: '#fff1f2', border: '1px solid #fecdd3', color: '#dc2626', fontWeight: 800 }}
                        onClick={() => onEjecutarDecision && onEjecutarDecision(a.documento || a.dni, 'Regularizar Desconexión D1-D2', a.nombre || a.asesor)}
                      >
                        🚨 Regularizar
                      </button>
                    ) : esBucle ? (
                      <button
                        className="badge-status-pill badge-status-rojo touch-target"
                        style={{ cursor: 'pointer' }}
                        onClick={() => onEjecutarDecision && onEjecutarDecision(a.documento || a.dni, 'Corte Bucle Exceso', a.nombre || a.asesor)}
                      >
                        🚨 Corte Bucle
                      </button>
                    ) : a.calidad_pct < 65 && diaActual >= 3 ? (
                      <button
                        className="badge-status-pill badge-status-rojo touch-target"
                        style={{ cursor: 'pointer' }}
                        onClick={() => onEjecutarDecision && onEjecutarDecision(a.documento || a.dni, 'Corte Preventivo', a.nombre || a.asesor)}
                      >
                        ⚠️ Corte Preventivo
                      </button>
                    ) : diaActual >= 6 ? (
                      <button
                        className="badge-status-pill badge-status-amber touch-target"
                        style={{ cursor: 'pointer' }}
                        onClick={() => onEjecutarDecision && onEjecutarDecision(a.documento || a.dni, 'Aprobar Extensión', a.nombre || a.asesor)}
                      >
                        ⏳ Extensión
                      </button>
                    ) : (
                      <button
                        className="badge-status-pill badge-status-blue touch-target"
                        style={{ cursor: 'pointer' }}
                        onClick={() => onEjecutarDecision && onEjecutarDecision(a.documento || a.dni, 'Acompañamiento Coaching', a.nombre || a.asesor)}
                      >
                        ⚡ Coaching
                      </button>
                    )}
                  </td>

                </tr>
              );
            })}

            {ordenados.length === 0 && (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '2.5rem', color: '#7a90ad', fontSize: '0.85rem' }}>
                  No se encontraron asesores que coincidan con los criterios seleccionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Drawer Lateral de Ficha del Asesor */}
      {asesorSeleccionado && (
        <AsesorDetalleDrawer
          asesor={asesorSeleccionado}
          onClose={() => setAsesorSeleccionado(null)}
          onEjecutarDecision={onEjecutarDecision}
        />
      )}

    </div>
  );
}
