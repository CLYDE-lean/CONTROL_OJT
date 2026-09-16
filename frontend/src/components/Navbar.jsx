import React from 'react';
import { BarChart3, Users, DollarSign, TrendingUp, CalendarRange, Sun, Moon, SlidersHorizontal } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import GEA_LOGO_URL from '../assets/geaLogoAsset.js';

const TABS = [
  { id: 'supervisor', label: 'Operación',  icon: BarChart3   },
  { id: 'formador',   label: 'Rendimiento', icon: Users       },
  { id: 'gerencia',   label: 'Impacto',     icon: DollarSign  },
  { id: 'historico',  label: 'Histórico',   icon: TrendingUp  },
  { id: 'capacidad',  label: 'Capacidad RYS', icon: CalendarRange },
];

export default function Navbar({
  vistaActiva,
  onCambiarVista,
  totalDecisionesPendientes,
  dbConnected,
  onActualizar,
  filtros = {},
  onAbrirFiltros,
  statusSlot = null
}) {
  const { isDark, toggleTheme } = useTheme();
  const activos = Object.entries(filtros).filter(([, v]) => Boolean(v));

  return (
    <header className="header-compacto">
      {/* ── Fila Superior / Sección Izquierda: Logo GEA PERÚ + Título + Active Filter Badges + Status ── */}
      <div className="navbar-top-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0, overflow: 'hidden' }}>
        {/* Logo GEA PERÚ Oficial con Slogan "GEA PIENSA EN TI" */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '2px 6px 2px 3px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '7px',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
          flexShrink: 0
        }}>
          <img 
            src={GEA_LOGO_URL} 
            alt="GEA PERÚ - GEA PIENSA EN TI" 
            style={{
              height: '24px',
              width: '24px',
              objectFit: 'cover',
              borderRadius: '4px',
              border: '1px solid rgba(255, 255, 255, 0.35)'
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span style={{ fontSize: '10.5px', fontWeight: 900, color: '#ffffff', letterSpacing: '0.05em', fontFamily: 'Outfit, sans-serif' }}>
              GEA PERÚ
            </span>
            <span style={{ fontSize: '6px', color: '#93c5fd', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: '1px' }}>
              GEA PIENSA EN TI
            </span>
          </div>
        </div>

        {/* Título */}
        <span style={{
          fontSize: '12.5px',
          fontWeight: 700,
          color: 'var(--text-primary, #f8fafc)',
          fontFamily: 'Outfit, Inter, sans-serif',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          letterSpacing: '-0.01em',
          flexShrink: 1
        }}>
          Control de Formación y Retención OJT
        </span>

        {/* Divisor ocultable en móvil */}
        <div 
          className="nav-divider"
          style={{
            width: '1px',
            height: '16px',
            background: 'rgba(255, 255, 255, 0.18)',
            flexShrink: 0,
            margin: '0 2px'
          }} 
        />

        {/* Status indicator + Actualizar en la fila superior */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto', flexShrink: 0 }}>
          {statusSlot}

          {onActualizar && (
            <button
              onClick={onActualizar}
              title="Actualizar datos"
              style={{
                height: '26px',
                padding: '0 7px',
                fontSize: '0.68rem',
                fontWeight: 600,
                color: '#ffffff',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '5px',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                cursor: 'pointer'
              }}
            >
              🔄
            </button>
          )}

          {totalDecisionesPendientes > 0 && (
            <span 
              title={`${totalDecisionesPendientes} alertas de Día 2 pendientes`}
              style={{
                fontSize: '0.65rem',
                color: '#fca5a5',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '1px 6px',
                borderRadius: '10px',
                fontWeight: 700,
                whiteSpace: 'nowrap'
              }}
            >
              ⚠️ {totalDecisionesPendientes}
            </span>
          )}

          <span
            className={`header-estado ${dbConnected ? 'ok' : 'error'}`}
            title={dbConnected ? 'Supabase conectado' : 'Sin conexión a Supabase'}
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: dbConnected ? '#3C9D5C' : '#D9534F',
              transition: 'background 0.2s ease',
              cursor: 'pointer',
              flexShrink: 0
            }}
          />

          {/* ── Botón Corporativo Filtros BI en Barra Superior ── */}
          {onAbrirFiltros && (
            <button
              onClick={onAbrirFiltros}
              style={{
                height: '26px',
                padding: '0 8px',
                fontSize: '0.68rem',
                fontWeight: 600,
                color: activos.length > 0 ? '#38bdf8' : '#e2e8f0',
                background: activos.length > 0 ? 'rgba(56, 189, 248, 0.14)' : 'rgba(255, 255, 255, 0.06)',
                border: `1px solid ${activos.length > 0 ? '#38bdf8' : 'rgba(255, 255, 255, 0.12)'}`,
                borderRadius: '5px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap'
              }}
              title="Abrir panel de filtros avanzados"
            >
              <SlidersHorizontal size={12} />
              <span>Filtros</span>
              {activos.length > 0 && (
                <span style={{
                  background: '#38bdf8',
                  color: '#0f172a',
                  borderRadius: '10px',
                  padding: '1px 5px',
                  fontSize: '0.58rem',
                  fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace"
                }}>
                  {activos.length}
                </span>
              )}
            </button>
          )}

          {/* ── Botón Minimalista Modo Oscuro / Claro Plano ── */}
          <button
            onClick={toggleTheme}
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '5px',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid #dce3ee',
              background: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.9)',
              color: isDark ? '#f8fafc' : '#D9822B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
              transition: 'all 0.15s ease',
              padding: 0,
              flexShrink: 0
            }}
            title={isDark ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
            aria-label="Alternar tema oscuro o claro"
          >
            {isDark ? <Sun size={13} /> : <Moon size={13} />}
          </button>
        </div>
      </div>

      {/* ── Segmented Control Tabs (Compacto) ── */}
      <div className="navbar-tabs-scroll" style={{ flexShrink: 0, marginLeft: '6px' }}>
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '2px',
          borderRadius: '7px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          width: 'fit-content'
        }}>
          {TABS.map(tab => {
            const Icon = tab.icon;
            const activo = vistaActiva === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onCambiarVista(tab.id)}
                style={{
                  height: '26px',
                  padding: '0 9px',
                  fontSize: '11.5px',
                  fontWeight: activo ? 600 : 400,
                  color: activo ? '#f8fafc' : 'rgba(255, 255, 255, 0.65)',
                  background: activo ? 'rgba(255, 255, 255, 0.14)' : 'transparent',
                  border: 'none',
                  borderRadius: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                  boxShadow: activo ? '0 1px 3px rgba(0,0,0,0.2)' : 'none',
                  touchAction: 'manipulation'
                }}
              >
                <Icon size={12} style={{ opacity: activo ? 1 : 0.75, color: activo ? '#38bdf8' : 'currentColor' }} />
                {tab.label}
                {tab.id === 'supervisor' && totalDecisionesPendientes > 0 && (
                  <span style={{
                    background: '#ef4444',
                    color: '#ffffff',
                    borderRadius: '10px',
                    padding: '0 4px',
                    fontSize: '0.6rem',
                    fontWeight: 800,
                    minWidth: '14px',
                    textAlign: 'center',
                    lineHeight: '12px'
                  }}>
                    {totalDecisionesPendientes}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
