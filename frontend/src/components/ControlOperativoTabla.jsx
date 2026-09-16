import React, { useState, useEffect } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import AsesorDetalleDrawer from './AsesorDetalleDrawer';
import { KPI_OFICIALES, semaforoMayorMejor, colorSemaforoKpi } from '../utils/kpiOficiales';

function fmtKpi(valor) {
  if (valor === null || valor === undefined || valor === '' || Number.isNaN(parseFloat(valor))) return '—';
  return `${parseFloat(valor)}%`;
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
    if (ordenarPor === 'calidad')       return (parseFloat(b.calidad_pct) || -1) - (parseFloat(a.calidad_pct) || -1);
    if (ordenarPor === 'transferencia') return (parseFloat(b.transferencia_pct) || -1) - (parseFloat(a.transferencia_pct) || -1);
    if (ordenarPor === 'tnps')          return (parseFloat(b.tnps_pct) || -1) - (parseFloat(a.tnps_pct) || -1);
    if (ordenarPor === 'llamadas')      return (b.llamadas_q || 0) - (a.llamadas_q || 0);
    if (ordenarPor === 'dia')           return b.dia_logico_ojt - a.dia_logico_ojt;
    return 0;
  });

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0,
      overflow: 'hidden',
      padding: '8px 12px',
      boxSizing: 'border-box',
      background: 'var(--card-bg, #0f172a)',
      border: '1px solid var(--border-color, rgba(255, 255, 255, 0.08))',
      borderRadius: '10px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
      position: 'relative'
    }}>
      {/* ── Fila 1: Cabecera Corporativa ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '6px',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h2 style={{
            fontSize: '0.84rem',
            fontWeight: 700,
            color: 'var(--text-primary, #f8fafc)',
            fontFamily: "'Inter', sans-serif",
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            Control operativo
            <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 500 }}>
              (Evolución D1-D8)
            </span>
          </h2>
          {/* Micro leyenda inline compacta */}
          <span style={{ fontSize: '0.64rem', color: '#64748b', fontFamily: "'Inter', sans-serif" }}>
            · <span style={{ color: '#38bdf8' }}>D1-D2</span> Inducción · <span style={{ color: '#3C9D5C' }}>D3-D5</span> Medible · <span style={{ color: '#D9822B' }}>D6-D8</span> Extensión
          </span>
        </div>

        <span style={{
          fontSize: '0.64rem',
          fontWeight: 600,
          fontFamily: "'Inter', sans-serif",
          color: '#38bdf8',
          background: 'rgba(56, 189, 248, 0.12)',
          border: '1px solid rgba(0, 240, 255, 0.35)',
          padding: '2px 8px',
          borderRadius: '6px',
          boxShadow: '0 0 8px rgba(0, 240, 255, 0.2)'
        }}>
          {ordenados.length} ASESORES
        </span>
      </div>

      {/* ── Fila 2: Barra de Filtros en una Sola Fila Horizontal (Ultra-Delgada ~30px) ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginBottom: '8px',
        flexShrink: 0,
        flexWrap: 'nowrap'
      }}>
        {/* Buscador Compacto */}
        <div style={{ flex: 1, minWidth: '180px', position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#00f0ff' }} />
          <input
            type="text"
            placeholder="Buscar DNI, Nombre, Campaña, Formador..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{
              width: '100%',
              padding: '4px 8px 4px 26px',
              background: 'rgba(7, 11, 20, 0.8)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: '6px',
              color: '#f8fafc',
              fontSize: '0.72rem',
              fontFamily: 'monospace',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Botón de Alerta de Caídas Pendientes */}
        {caidasPendientesCount > 0 && (
          <button
            onClick={() => setFiltroResultado(filtroResultado === 'DESCONEXION' ? '' : 'DESCONEXION')}
            style={{
              padding: '4px 8px',
              background: filtroResultado === 'DESCONEXION' ? '#ff0055' : 'rgba(255, 0, 85, 0.15)',
              color: '#ffffff',
              border: '1px solid #ff0055',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.68rem',
              fontFamily: 'monospace',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '0 0 8px rgba(255, 0, 85, 0.35)',
              transition: 'all 0.15s ease'
            }}
          >
            🚨 Caídas ({caidasPendientesCount})
          </button>
        )}

        {/* Filtro Día */}
        <select
          value={filtroDia}
          onChange={(e) => setFiltroDia(e.target.value)}
          style={{
            padding: '4px 6px',
            background: 'rgba(7, 11, 20, 0.8)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '6px',
            color: '#cbd5e1',
            fontSize: '0.68rem',
            fontFamily: 'monospace',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="" style={{ background: '#070b14' }}>Todos los Días</option>
          <option value="1" style={{ background: '#070b14' }}>Día 1 (Inducción)</option>
          <option value="2" style={{ background: '#070b14' }}>Día 2 (Inducción)</option>
          <option value="3" style={{ background: '#070b14' }}>Día 3 (Inicio Eval.)</option>
          <option value="4" style={{ background: '#070b14' }}>Día 4 (Evaluación)</option>
          <option value="5" style={{ background: '#070b14' }}>Día 5 (Eval. Final)</option>
          <option value="6" style={{ background: '#070b14' }}>Día 6 (Extensión 1)</option>
          <option value="7" style={{ background: '#070b14' }}>Día 7 (Extensión 2)</option>
          <option value="8" style={{ background: '#070b14' }}>Día 8 (Máx Política)</option>
          <option value="atipicos" style={{ background: '#070b14' }}>🚨 Exceso (&gt;8D)</option>
        </select>

        {/* Filtro Resultado */}
        <select
          value={filtroResultado}
          onChange={(e) => setFiltroResultado(e.target.value)}
          style={{
            padding: '4px 6px',
            background: 'rgba(7, 11, 20, 0.8)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '6px',
            color: '#cbd5e1',
            fontSize: '0.68rem',
            fontFamily: 'monospace',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="" style={{ background: '#070b14' }}>Todos los Estados</option>
          <option value="DESCONEXION" style={{ background: '#070b14' }}>🚨 Desconexión D1→D2</option>
          <option value="APROBADO" style={{ background: '#070b14' }}>🟢 Aprobado / Operativo</option>
          <option value="DESAPROBADO" style={{ background: '#070b14' }}>🔴 Desaprobado / Baja</option>
          <option value="INDUCCIÓN" style={{ background: '#070b14' }}>🔵 Inducción (D1-D2)</option>
          <option value="EXTENSIÓN" style={{ background: '#070b14' }}>🟠 En Extensión (D6-D8)</option>
        </select>

        {/* Ordenamiento */}
        <select
          value={ordenarPor}
          onChange={(e) => setOrdenarPor(e.target.value)}
          style={{
            padding: '4px 8px',
            background: 'rgba(0, 240, 255, 0.15)',
            border: '1px solid #00f0ff',
            borderRadius: '6px',
            color: '#00f0ff',
            fontWeight: 700,
            fontSize: '0.68rem',
            fontFamily: 'monospace',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="calidad" style={{ background: '#070b14' }}>Ordenar: Calidad %</option>
          <option value="transferencia" style={{ background: '#070b14' }}>Ordenar: Transf. %</option>
          <option value="tnps" style={{ background: '#070b14' }}>Ordenar: tNPS %</option>
          <option value="llamadas" style={{ background: '#070b14' }}>Ordenar: Llamadas</option>
          <option value="dia" style={{ background: '#070b14' }}>Ordenar: Día OJT</option>
        </select>
      </div>

      {/* ── Tabla Cyberpunk de Máxima Altura (Scroll Interno Sticky Header) ── */}
      <div style={{
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        overflowX: 'auto',
        border: '1px solid rgba(56, 189, 248, 0.2)',
        borderRadius: '8px',
        background: 'rgba(7, 11, 20, 0.6)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem', margin: 0 }}>
          <thead style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            background: '#070b14',
            borderBottom: '1px solid rgba(0, 240, 255, 0.35)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.5)'
          }}>
            <tr style={{ color: '#00f0ff', fontFamily: 'monospace', fontSize: '0.62rem', letterSpacing: '0.04em' }}>
              <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 700 }}>DNI / ASESOR</th>
              <th style={{ padding: '6px 8px', textAlign: 'left', minWidth: '150px', fontWeight: 700 }}>CAMPAÑA &amp; FORMADOR</th>
              <th style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 700 }}>EVOLUCIÓN (D1 → D8)</th>
              <th style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 700 }}>INGRESO A OP (I-OP)</th>
              <th style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 700 }}>EVALUACIÓN FINAL</th>
              <th style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 700 }}>LLAMADAS</th>
              <th style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 700 }}>KPI 1: TRANSF.</th>
              <th style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 700 }}>KPI 2: tNPS</th>
              <th style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 700 }}>KPI 3: CALIDAD</th>
              <th style={{ padding: '6px 8px', textAlign: 'center', minWidth: '130px', fontWeight: 700 }}>ACCIÓN</th>
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
                  key={a.cohort_key || `${a.documento}-${a.semana}-${a.grupo}-${idx}`}
                  onClick={() => setAsesorSeleccionado(a)}
                  style={{
                    cursor: 'pointer',
                    background: esBucle ? 'rgba(255, 0, 85, 0.1)' : esBaja ? 'rgba(15, 23, 42, 0.4)' : idx % 2 === 0 ? 'rgba(30, 41, 59, 0.4)' : 'transparent',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(56, 189, 248, 0.08)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = esBucle ? 'rgba(255, 0, 85, 0.1)' : esBaja ? 'rgba(15, 23, 42, 0.4)' : idx % 2 === 0 ? 'rgba(30, 41, 59, 0.4)' : 'transparent'}
                  title="Haz clic para ver la Ficha Completa del Asesor"
                >
                  {/* DNI & Asesor */}
                  <td style={{ padding: '6px 8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.76rem', whiteSpace: 'nowrap' }}>
                          {a.nombre || a.asesor || 'SIN NOMBRE'}
                        </div>
                        <code style={{ fontSize: '0.66rem', color: '#00f0ff', fontFamily: 'monospace', fontWeight: 600 }}>
                          {a.documento || a.dni || ''}
                        </code>
                        {(a.semana || a.grupo) && (
                          <div style={{ fontSize: '0.6rem', color: '#64748b', marginTop: '2px' }}>
                            {[a.semana, a.grupo].filter(Boolean).join(' · ')}
                          </div>
                        )}
                      </div>
                      <ChevronRight size={12} style={{ color: '#64748b', marginLeft: 'auto' }} />
                    </div>
                  </td>

                  {/* Campaña & Formador */}
                  <td style={{ padding: '6px 8px', maxWidth: '160px' }}>
                    <div style={{ fontSize: '0.74rem', fontWeight: 600, color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={a.campana}>
                      {a.campana}
                    </div>
                    <div style={{ fontSize: '0.64rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={a.formador}>
                      {a.formador}
                    </div>
                  </td>

                  {/* Tira Visual de Evolución D1 a D8 */}
                  <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: '3px', alignItems: 'center' }}>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(d => {
                        const hit = Array.isArray(a.trayectoria)
                          ? a.trayectoria.find((t) => Number(t.dia) === d)
                          : (d <= diaActual ? { dia: d } : null);
                        const esInduccion = d <= 2;
                        const esExtension = d >= 6;
                        
                        let bg = 'rgba(56, 189, 248, 0.08)';
                        let color = '#64748b';
                        let border = '1px solid transparent';

                        if (hit) {
                          if (hit.es_baja || esBaja) {
                            bg = 'rgba(255, 0, 85, 0.15)'; color = '#ff0055'; border = '1px solid rgba(255, 0, 85, 0.35)';
                          } else if (hit.es_iop || (esOperativo && d === diaActual)) {
                            bg = 'rgba(0, 255, 157, 0.15)'; color = '#00ff9d'; border = '1px solid rgba(0, 255, 157, 0.35)';
                          } else if (esInduccion) {
                            bg = 'rgba(0, 240, 255, 0.15)'; color = '#00f0ff'; border = '1px solid rgba(0, 240, 255, 0.35)';
                          } else if (esExtension) {
                            bg = 'rgba(255, 183, 3, 0.15)'; color = '#ffb703'; border = '1px solid rgba(255, 183, 3, 0.35)';
                          } else {
                            bg = 'rgba(0, 255, 157, 0.12)'; color = '#00ff9d'; border = '1px solid rgba(0, 255, 157, 0.28)';
                          }
                        }

                        return (
                          <div
                            key={d}
                            onClick={(e) => {
                              e.stopPropagation();
                              setAsesorSeleccionado(a);
                            }}
                            title={hit
                              ? `D${d} con registro${hit.llamadas != null ? ` · ${hit.llamadas} llamadas` : ''}`
                              : `D${d} sin registro`}
                            style={{
                              padding: '1px 4px',
                              borderRadius: '4px',
                              background: bg,
                              color: color,
                              border: d === diaActual && hit ? '1px solid #00f0ff' : border,
                              fontSize: '0.62rem',
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              cursor: 'pointer',
                              opacity: hit ? 1 : 0.35
                            }}
                          >
                            D{d}
                          </div>
                        );
                      })}
                      {esBucle && (
                        <div style={{ padding: '1px 4px', borderRadius: '4px', background: 'rgba(255, 0, 85, 0.25)', color: '#ff0055', border: '1px solid #ff0055', fontSize: '0.62rem', fontFamily: 'monospace', fontWeight: 800 }}>
                          &gt;8D
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Transición / Ingreso a Operación */}
                  <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                    <div style={{
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      fontFamily: 'monospace',
                      color: esOperativo ? '#00ff9d' : esBaja ? '#ff0055' : '#00f0ff',
                      textShadow: esOperativo ? '0 0 6px rgba(0, 255, 157, 0.4)' : esBaja ? '0 0 6px rgba(255, 0, 85, 0.4)' : 'none'
                    }}>
                      {esOperativo ? `🟢 DÍA ${diaActual} OP` : esBaja ? `🔴 CESADO D${diaActual}` : `🔵 DÍA ${diaActual} OJT`}
                    </div>
                    <span style={{ fontSize: '0.6rem', color: '#64748b', fontFamily: 'monospace' }}>
                      {a.dias_conexion_ojt || diaActual}d conexión
                    </span>
                  </td>

                  {/* Evaluación Final */}
                  <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                    <span style={{
                      fontSize: '0.62rem',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      display: 'inline-block',
                      color: (a.requiere_regularizacion || a.es_desconexion_sin_registro) ? '#ff0055' :
                             a.resultado_evaluacion?.includes('APROBADO') ? '#00ff9d' :
                             a.resultado_evaluacion?.includes('DESAPROBADO') ? '#ff0055' :
                             a.resultado_evaluacion?.includes('INDUCCIÓN') ? '#00f0ff' : '#ffb703',
                      background: (a.requiere_regularizacion || a.es_desconexion_sin_registro) ? 'rgba(255, 0, 85, 0.15)' :
                                  a.resultado_evaluacion?.includes('APROBADO') ? 'rgba(0, 255, 157, 0.15)' :
                                  a.resultado_evaluacion?.includes('DESAPROBADO') ? 'rgba(255, 0, 85, 0.15)' :
                                  a.resultado_evaluacion?.includes('INDUCCIÓN') ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 183, 3, 0.15)',
                      border: `1px solid ${
                        (a.requiere_regularizacion || a.es_desconexion_sin_registro) ? 'rgba(255, 0, 85, 0.4)' :
                        a.resultado_evaluacion?.includes('APROBADO') ? 'rgba(0, 255, 157, 0.4)' :
                        a.resultado_evaluacion?.includes('DESAPROBADO') ? 'rgba(255, 0, 85, 0.4)' :
                        a.resultado_evaluacion?.includes('INDUCCIÓN') ? 'rgba(0, 240, 255, 0.4)' : 'rgba(255, 183, 3, 0.4)'
                      }`
                    }}>
                      {(a.requiere_regularizacion || a.es_desconexion_sin_registro) ? '🚨 DESCONEXIÓN' : a.resultado_evaluacion}
                    </span>
                    {a.motivo_baja && (
                      <div style={{ fontSize: '0.6rem', color: '#ff0055', marginTop: '2px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={a.motivo_baja}>
                        {a.motivo_baja}
                      </div>
                    )}
                  </td>

                  {/* Productividad (Llamadas) */}
                  <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, fontFamily: 'monospace', color: (a.llamadas_q || 0) > 0 ? '#f8fafc' : '#64748b' }}>
                      {a.llamadas_q || 0}
                    </span>
                  </td>

                  {/* KPI 1: Transferencia */}
                  <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                    <span style={{
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      fontFamily: 'monospace',
                      color: colorSemaforoKpi(semaforoMayorMejor(a.transferencia_pct, KPI_OFICIALES.transferencia.meta, KPI_OFICIALES.transferencia.objCump))
                    }}>
                      {fmtKpi(a.transferencia_pct)}
                    </span>
                  </td>

                  {/* KPI 2: tNPS */}
                  <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                    <span style={{
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      fontFamily: 'monospace',
                      color: colorSemaforoKpi(semaforoMayorMejor(a.tnps_pct, KPI_OFICIALES.tnps.meta, KPI_OFICIALES.tnps.objCump))
                    }}>
                      {fmtKpi(a.tnps_pct)}
                    </span>
                  </td>

                  {/* KPI 3: Calidad */}
                  <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                    <span style={{
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      fontFamily: 'monospace',
                      color: colorSemaforoKpi(semaforoMayorMejor(a.calidad_pct, KPI_OFICIALES.calidad.meta, KPI_OFICIALES.calidad.objCump))
                    }}>
                      {fmtKpi(a.calidad_pct)}
                    </span>
                  </td>

                  {/* Acción Cyberpunk */}
                  <td style={{ padding: '6px 8px', textAlign: 'center', whiteSpace: 'nowrap' }} onClick={(e) => e.stopPropagation()}>
                    {esOperativo ? (
                      <span style={{ fontSize: '0.64rem', fontFamily: 'monospace', fontWeight: 700, color: '#00ff9d', background: 'rgba(0, 255, 157, 0.12)', border: '1px solid rgba(0, 255, 157, 0.35)', padding: '2px 8px', borderRadius: '6px' }}>
                        🟢 OPERATIVO
                      </span>
                    ) : esBaja ? (
                      <span style={{ fontSize: '0.64rem', fontFamily: 'monospace', fontWeight: 700, color: '#ff0055', background: 'rgba(255, 0, 85, 0.12)', border: '1px solid rgba(255, 0, 85, 0.35)', padding: '2px 8px', borderRadius: '6px' }}>
                        🔴 BAJA OJT
                      </span>
                    ) : (a.requiere_regularizacion || a.es_desconexion_sin_registro) ? (
                      <button
                        style={{ cursor: 'pointer', background: 'rgba(255, 0, 85, 0.2)', border: '1px solid #ff0055', color: '#ffffff', fontWeight: 800, fontSize: '0.64rem', fontFamily: 'monospace', padding: '2px 8px', borderRadius: '6px', boxShadow: '0 0 6px rgba(255, 0, 85, 0.4)' }}
                        onClick={() => onEjecutarDecision && onEjecutarDecision(a.documento || a.dni, 'Regularizar Desconexión D1-D2', a.nombre || a.asesor)}
                      >
                        🚨 REGULARIZAR
                      </button>
                    ) : esBucle ? (
                      <button
                        style={{ cursor: 'pointer', background: 'rgba(255, 0, 85, 0.2)', border: '1px solid #ff0055', color: '#ff0055', fontWeight: 800, fontSize: '0.64rem', fontFamily: 'monospace', padding: '2px 8px', borderRadius: '6px' }}
                        onClick={() => onEjecutarDecision && onEjecutarDecision(a.documento || a.dni, 'Corte Bucle Exceso', a.nombre || a.asesor)}
                      >
                        🚨 CORTE BUCLE
                      </button>
                    ) : a.calidad_pct < 65 && diaActual >= 3 ? (
                      <button
                        style={{ cursor: 'pointer', background: 'rgba(255, 183, 3, 0.15)', border: '1px solid #ffb703', color: '#ffb703', fontWeight: 700, fontSize: '0.64rem', fontFamily: 'monospace', padding: '2px 8px', borderRadius: '6px' }}
                        onClick={() => onEjecutarDecision && onEjecutarDecision(a.documento || a.dni, 'Corte Preventivo', a.nombre || a.asesor)}
                      >
                        ⚠️ CORTE PREV.
                      </button>
                    ) : diaActual >= 6 ? (
                      <button
                        style={{ cursor: 'pointer', background: 'rgba(255, 183, 3, 0.15)', border: '1px solid #ffb703', color: '#ffb703', fontWeight: 700, fontSize: '0.64rem', fontFamily: 'monospace', padding: '2px 8px', borderRadius: '6px' }}
                        onClick={() => onEjecutarDecision && onEjecutarDecision(a.documento || a.dni, 'Aprobar Extensión', a.nombre || a.asesor)}
                      >
                        ⏳ EXTENSIÓN
                      </button>
                    ) : (
                      <button
                        style={{ cursor: 'pointer', background: 'rgba(0, 240, 255, 0.15)', border: '1px solid #00f0ff', color: '#00f0ff', fontWeight: 700, fontSize: '0.64rem', fontFamily: 'monospace', padding: '2px 8px', borderRadius: '6px' }}
                        onClick={() => onEjecutarDecision && onEjecutarDecision(a.documento || a.dni, 'Acompañamiento Coaching', a.nombre || a.asesor)}
                      >
                        ⚡ COACHING
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}

            {ordenados.length === 0 && (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontFamily: 'monospace', fontSize: '0.78rem' }}>
                  NO SE ENCONTRARON ASESORES CON LOS CRITERIOS SELECCIONADOS.
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
