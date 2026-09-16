import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, Download, FileSpreadsheet } from 'lucide-react';
import { fetchDetalleAuditoria } from '../services/apiService';

/**
 * Modal de Detalle Día a Día por Asesor (16 Columnas Flash OJT)
 * Estilo corporativo ejecutivo:
 * - 16 columnas con tipografía sans-serif y números tabulares.
 * - Paleta de 3 estados apagados (Verde / Ámbar / Rojo / Gris slate).
 * - Sin marcas gaming ni efectos glow.
 */
export default function DetalleAuditoriaModal({ isOpen, onClose, filtros = {} }) {
  const [asesores, setAsesores] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [filtroGrupo, setFiltroGrupo] = useState('TODOS');

  useEffect(() => {
    if (!isOpen) return;
    let cancelado = false;
    async function load() {
      setCargando(true);
      try {
        const res = await fetchDetalleAuditoria(filtros);
        if (!cancelado && res.success) {
          setAsesores(res.asesores || []);
        }
      } catch (err) {
        console.error('Error cargando detalle auditoría:', err);
      } finally {
        if (!cancelado) setCargando(false);
      }
    }
    load();
    return () => { cancelado = true; };
  }, [isOpen, filtros.grupo, filtros.campana, filtros.formador, filtros.semana]);

  const gruposDisponibles = useMemo(() => {
    const set = new Set();
    asesores.forEach(a => { if (a.grupo) set.add(a.grupo); });
    return Array.from(set).sort();
  }, [asesores]);

  const asesoresFiltrados = useMemo(() => {
    return asesores.filter(a => {
      if (filtroEstado !== 'TODOS') {
        if (filtroEstado === 'APROBADO' && a.estado_badge !== 'APROBADO') return false;
        if (filtroEstado === 'DESAPROBADO' && a.estado_badge !== 'DESAPROBADO') return false;
        if (filtroEstado === 'PENDIENTE' && a.estado_badge !== 'PENDIENTE' && a.estado_badge !== 'AMPLIACION') return false;
        if (filtroEstado === 'SIN_GESTION' && a.estado_badge !== 'SIN_GESTION') return false;
      }
      if (filtroGrupo !== 'TODOS' && a.grupo !== filtroGrupo) {
        return false;
      }
      if (busqueda.trim()) {
        const term = busqueda.trim().toLowerCase();
        const matchDni = (a.dni || '').toLowerCase().includes(term);
        const matchNom = (a.asesor || '').toLowerCase().includes(term);
        const matchForm = (a.formador || '').toLowerCase().includes(term);
        if (!matchDni && !matchNom && !matchForm) return false;
      }
      return true;
    });
  }, [asesores, filtroEstado, filtroGrupo, busqueda]);

  const handleExportarCsv = () => {
    if (asesoresFiltrados.length === 0) return;
    const headers = [
      'DNI', 'Asesor', 'Formador', 'Campaña', 'Grupo', 'Modalidad', 'Estado',
      'Sigla', 'Motivo Baja', 'Último Día', 'Q Atendidas', 'KPI 1', 'KPI 2', 'KPI 3',
      'Fecha Inicio OJT', 'Fecha Ingreso OP'
    ];

    const rows = asesoresFiltrados.map(a => [
      `"${a.dni}"`,
      `"${a.asesor}"`,
      `"${a.formador}"`,
      `"${a.campana}"`,
      `"${a.grupo}"`,
      `"${a.modalidad}"`,
      `"${a.estado}"`,
      `"${a.sigla}"`,
      `"${a.motivo_baja}"`,
      `"${a.ultimo_dia}"`,
      a.q_atendidas,
      `"${a.kpi1}"`,
      `"${a.kpi2}"`,
      `"${a.kpi3}"`,
      `"${a.fecha_inicio_ojt}"`,
      `"${a.fecha_ingreso_op}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF'
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `auditoria_ojt_detalle_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(3, 7, 18, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        width: '95vw',
        maxWidth: '1480px',
        height: '90vh',
        background: '#0f172a',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* ── Header Modal Corporativo ── */}
        <div style={{
          padding: '12px 18px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#111827',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileSpreadsheet size={18} style={{ color: '#38bdf8' }} />
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <h2 style={{
                  margin: 0,
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  color: 'var(--text-primary, #f8fafc)',
                  fontFamily: "'Inter', sans-serif"
                }}>
                  Auditoría día a día por asesor
                </h2>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontFamily: "'Inter', sans-serif" }}>
                  (Detalle de cohorte)
                </span>
              </div>
              <span style={{ fontSize: '0.64rem', color: '#64748b', fontFamily: "'Inter', sans-serif" }}>
                Total registros: <strong style={{ color: '#38bdf8', fontFamily: "'JetBrains Mono', monospace" }}>{asesoresFiltrados.length}</strong> de {asesores.length} asesores
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleExportarCsv}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: 'rgba(60, 157, 92, 0.12)',
                border: '1px solid rgba(60, 157, 92, 0.28)',
                color: '#3C9D5C',
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '0.68rem',
                fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
                cursor: 'pointer'
              }}
            >
              <Download size={13} />
              Exportar CSV
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#94a3b8',
                padding: '4px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── Toolbar de Filtros y Búsqueda ── */}
        <div style={{
          padding: '8px 18px',
          background: 'rgba(255, 255, 255, 0.02)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexShrink: 0
        }}>
          {/* Input de Búsqueda */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '6px',
            padding: '4px 10px',
            width: '320px'
          }}>
            <Search size={13} style={{ color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Buscar por DNI, asesor o formador..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#f8fafc',
                fontSize: '0.72rem',
                fontFamily: "'Inter', sans-serif",
                width: '100%'
              }}
            />
          </div>

          {/* Filtros de Píldoras Rápidas */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.66rem', fontFamily: "'Inter', sans-serif" }}>
            <span style={{ color: '#64748b' }}>Estado:</span>
            {[
              { id: 'TODOS', label: 'Todos' },
              { id: 'APROBADO', label: 'Aprobados' },
              { id: 'DESAPROBADO', label: 'Desaprobados' },
              { id: 'PENDIENTE', label: 'Pendientes' },
              { id: 'SIN_GESTION', label: 'Sin gestión' }
            ].map((est) => {
              const active = filtroEstado === est.id;
              return (
                <button
                  key={est.id}
                  onClick={() => setFiltroEstado(est.id)}
                  style={{
                    background: active ? '#38bdf8' : 'rgba(255,255,255,0.04)',
                    color: active ? '#0f172a' : '#94a3b8',
                    border: `1px solid ${active ? '#38bdf8' : 'rgba(255,255,255,0.08)'}`,
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontWeight: active ? 600 : 400,
                    cursor: 'pointer',
                    fontSize: '0.64rem',
                    fontFamily: "'Inter', sans-serif"
                  }}
                >
                  {est.label}
                </button>
              );
            })}
          </div>

          {/* Filtro Dropdown por Grupo/Cohorte */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.66rem', fontFamily: "'Inter', sans-serif" }}>
            <span style={{ color: '#64748b' }}>Cohorte:</span>
            <select
              value={filtroGrupo}
              onChange={(e) => setFiltroGrupo(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#f8fafc',
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '0.66rem',
                fontFamily: "'Inter', sans-serif",
                outline: 'none'
              }}
            >
              <option value="TODOS">Todas las cohortes</option>
              {gruposDisponibles.map(g => (
                <option key={g} value={g} style={{ background: '#0f172a' }}>{g}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Tabla de 16 Columnas con Scroll Interno ── */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'auto',
          minHeight: 0,
          background: 'rgba(0, 0, 0, 0.15)'
        }}>
          {cargando ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontFamily: "'Inter', sans-serif" }}>
              Cargando matriz de auditoría...
            </div>
          ) : asesoresFiltrados.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontFamily: "'Inter', sans-serif" }}>
              No se encontraron asesores con los filtros seleccionados.
            </div>
          ) : (
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.68rem',
              fontFamily: "'Inter', sans-serif",
              whiteSpace: 'nowrap'
            }}>
              <thead>
                <tr style={{
                  position: 'sticky',
                  top: 0,
                  background: '#111827',
                  zIndex: 2,
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <th style={thStyle}>#</th>
                  <th style={thStyle}>DNI</th>
                  <th style={{ ...thStyle, minWidth: '180px' }}>Asesor</th>
                  <th style={thStyle}>Formador</th>
                  <th style={thStyle}>Campaña</th>
                  <th style={thStyle}>Grupo</th>
                  <th style={thStyle}>Modalidad</th>
                  <th style={thStyle}>Estado</th>
                  <th style={thStyle}>Sigla</th>
                  <th style={thStyle}>Motivo baja</th>
                  <th style={thStyle}>Último día</th>
                  <th style={thStyle}>Q Llamadas</th>
                  <th style={thStyle}>KPI 1</th>
                  <th style={thStyle}>KPI 2</th>
                  <th style={thStyle}>KPI 3</th>
                  <th style={thStyle}>Fecha OJT</th>
                  <th style={thStyle}>Fecha IOP</th>
                </tr>
              </thead>
              <tbody>
                {asesoresFiltrados.map((a, idx) => {
                  const badgeConfig = getBadgeConfig(a.estado_badge);
                  return (
                    <tr
                      key={`${a.dni}-${idx}`}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                        transition: 'background 0.1s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)'}
                    >
                      <td style={tdStyle}>{idx + 1}</td>
                      <td style={{ ...tdStyle, color: '#38bdf8', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{a.dni}</td>
                      <td style={{ ...tdStyle, fontWeight: 600, color: 'var(--text-primary, #f8fafc)' }}>{a.asesor}</td>
                      <td style={tdStyle}>{a.formador}</td>
                      <td style={tdStyle}>{a.campana}</td>
                      <td style={tdStyle}>{a.grupo}</td>
                      <td style={tdStyle}>{a.modalidad}</td>
                      <td style={tdStyle}>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.62rem',
                          fontWeight: 600,
                          background: badgeConfig.bg,
                          color: badgeConfig.color,
                          border: `1px solid ${badgeConfig.border}`
                        }}>
                          {a.estado}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{a.sigla}</td>
                      <td style={{ ...tdStyle, color: a.motivo_baja !== '-' ? '#D9534F' : '#64748b' }}>{a.motivo_baja}</td>
                      <td style={{ ...tdStyle, fontWeight: 600, color: getDiaColor(a.ultimo_dia), fontFamily: "'JetBrains Mono', monospace" }}>
                        {a.ultimo_dia}
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{a.q_atendidas}</td>
                      <td style={{ ...tdStyle, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace" }}>{a.kpi1}</td>
                      <td style={{ ...tdStyle, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace" }}>{a.kpi2}</td>
                      <td style={{ ...tdStyle, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace" }}>{a.kpi3}</td>
                      <td style={tdStyle}>{a.fecha_inicio_ojt}</td>
                      <td style={{ ...tdStyle, color: a.fecha_ingreso_op !== '-' ? '#3C9D5C' : '#64748b' }}>{a.fecha_ingreso_op}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Footer Modal ── */}
        <div style={{
          padding: '8px 18px',
          background: '#111827',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.64rem',
          fontFamily: "'Inter', sans-serif",
          color: '#64748b',
          flexShrink: 0
        }}>
          <span>
            Estados: <strong style={{ color: '#3C9D5C' }}>Verde: Aprobado/IOP</strong> · <strong style={{ color: '#D9534F' }}>Rojo: Desaprobado/Baja</strong> · <strong style={{ color: '#D9822B' }}>Ámbar: Pendiente/Ampliación</strong> · <strong style={{ color: '#94a3b8' }}>Gris: Sin gestión</strong>
          </span>
          <span>
            Mostrando {asesoresFiltrados.length} registros
          </span>
        </div>
      </div>
    </div>
  );
}

const thStyle = {
  padding: '8px 10px',
  textAlign: 'left',
  fontWeight: 600,
  color: '#94a3b8',
  fontSize: '0.64rem',
  fontFamily: "'Inter', sans-serif"
};

const tdStyle = {
  padding: '5px 10px',
  color: '#cbd5e1'
};

function getBadgeConfig(badge) {
  switch (badge) {
    case 'APROBADO':
      return { bg: 'rgba(60, 157, 92, 0.12)', color: '#3C9D5C', border: 'rgba(60, 157, 92, 0.28)' };
    case 'DESAPROBADO':
      return { bg: 'rgba(217, 83, 79, 0.12)', color: '#D9534F', border: 'rgba(217, 83, 79, 0.28)' };
    case 'AMPLIACION':
    case 'PENDIENTE':
      return { bg: 'rgba(217, 130, 43, 0.12)', color: '#D9822B', border: 'rgba(217, 130, 43, 0.28)' };
    case 'SIN_GESTION':
    default:
      return { bg: 'rgba(100, 116, 139, 0.12)', color: '#94a3b8', border: 'rgba(100, 116, 139, 0.28)' };
  }
}

function getDiaColor(diaStr) {
  if (!diaStr || diaStr === 'Sin gestión') return '#64748b';
  if (diaStr.startsWith('D1')) return '#D9534F';
  if (diaStr.startsWith('D2')) return '#ea580c';
  if (diaStr.startsWith('D3')) return '#D9822B';
  if (diaStr.startsWith('D4')) return '#0284c7';
  if (diaStr.startsWith('D5')) return '#6366f1';
  return '#8b5cf6';
}
