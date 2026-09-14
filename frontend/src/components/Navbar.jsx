import React from 'react';
import { BarChart3, Users, DollarSign, TrendingUp } from 'lucide-react';
import GEA_LOGO_URL from '../assets/geaLogoAsset.js';

const TABS = [
  { id: 'supervisor', label: 'Operación',  icon: BarChart3   },
  { id: 'formador',   label: 'Rendimiento', icon: Users       },
  { id: 'gerencia',   label: 'Impacto',     icon: DollarSign  },
  { id: 'historico',  label: 'Histórico',   icon: TrendingUp  },
];

const LABELS_MAP = {
  campana: 'Campaña',
  semana: 'Semana',
  formador: 'Formador',
  grupo: 'Grupo',
  modalidad: 'Modalidad',
  segmento: 'Segmento',
  periodo: 'Periodo',
  estado: 'Estado'
};

export default function Navbar({ vistaActiva, onCambiarVista, totalDecisionesPendientes, dbConnected, onActualizar, cargando, totalAsesores, filtros = {}, onRemoverFiltro, onLimpiarFiltros }) {
  const activos = Object.entries(filtros).filter(([_, v]) => Boolean(v));

  return (
    <header className="header-compacto">
      {/* ── Fila Superior / Sección Izquierda: Logo GEA PERÚ + Título + Active Filter Badges + Status ── */}
      <div className="navbar-top-row" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Logo GEA PERÚ Oficial con Slogan "GEA PIENSA EN TI" */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '2px 8px 2px 4px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
          flexShrink: 0
        }}>
          <img 
            src={GEA_LOGO_URL} 
            alt="GEA PERÚ - GEA PIENSA EN TI" 
            style={{
              height: '26px',
              width: '26px',
              objectFit: 'cover',
              borderRadius: '5px',
              border: '1px solid rgba(255, 255, 255, 0.35)'
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span style={{ fontSize: '11px', fontWeight: 900, color: '#ffffff', letterSpacing: '0.06em', fontFamily: 'Outfit, sans-serif' }}>
              GEA PERÚ
            </span>
            <span style={{ fontSize: '6.5px', color: '#93c5fd', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: '2px' }}>
              GEA PIENSA EN TI
            </span>
          </div>
        </div>

        {/* Título */}
        <span style={{
          fontSize: '13.5px',
          fontWeight: 800,
          color: '#f8fafc',
          fontFamily: 'Outfit, Inter, sans-serif',
          whiteSpace: 'nowrap',
          letterSpacing: '-0.02em'
        }}>
          Control de Formación y Retención OJT
        </span>

        {/* Badges de Filtros Activos (Súper visibles para Capturas de Pantalla) */}
        {activos.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            marginLeft: '6px',
            overflowX: 'auto',
            maxWidth: '28vw',
            padding: '2px 0',
            flexShrink: 1
          }}>
            <span style={{ fontSize: '0.68rem', color: '#fbbf24', fontWeight: 800, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              🎯 Filtro:
            </span>
            {activos.map(([k, val]) => (
              <span
                key={k}
                style={{
                  fontSize: '0.68rem',
                  background: 'linear-gradient(135deg, #1e6fc0 0%, #3b82f6 100%)',
                  color: '#ffffff',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.35)',
                  whiteSpace: 'nowrap'
                }}
              >
                <span>{LABELS_MAP[k] || k}: <strong style={{ color: '#fef08a' }}>{val}</strong></span>
                {onRemoverFiltro && (
                  <button
                    onClick={() => onRemoverFiltro(k)}
                    style={{
                      background: 'rgba(255,255,255,0.25)',
                      border: 'none',
                      color: '#fff',
                      borderRadius: '50%',
                      width: '13px',
                      height: '13px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '9px',
                      cursor: 'pointer',
                      padding: 0,
                      lineHeight: 1
                    }}
                    title={`Quitar filtro ${LABELS_MAP[k] || k}`}
                  >
                    ✕
                  </button>
                )}
              </span>
            ))}
            {onLimpiarFiltros && (
              <button
                onClick={onLimpiarFiltros}
                style={{
                  fontSize: '0.65rem',
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#fca5a5',
                  padding: '2px 7px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                Limpiar ✕
              </button>
            )}
          </div>
        )}

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
          {totalAsesores > 0 && (
            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
              <strong style={{ color: '#38bdf8' }}>{totalAsesores.toLocaleString()}</strong> asesores
            </span>
          )}

          {onActualizar && (
            <button
              onClick={onActualizar}
              title="Actualizar datos"
              style={{
                height: '28px',
                padding: '0 10px',
                fontSize: '0.72rem',
                fontWeight: 600,
                color: '#ffffff',
                background: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
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
                fontSize: '0.7rem',
                color: '#fca5a5',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '2px 8px',
                borderRadius: '12px',
                fontWeight: 700
              }}
            >
              ⚠️ {totalDecisionesPendientes}
            </span>
          )}

          <span
            className={`header-estado ${dbConnected ? 'ok' : 'error'}`}
            title={dbConnected ? 'Supabase conectado' : 'Sin conexión a Supabase'}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: dbConnected ? '#34d399' : '#f87171',
              boxShadow: dbConnected ? '0 0 8px #34d399' : '0 0 8px #f87171',
              transition: 'background 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer'
            }}
          />
        </div>
      </div>

      {/* ── Segmented Control Tabs (Con Scroll Horizontal Táctil en Móvil) ── */}
      <div className="navbar-tabs-scroll">
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'rgba(255, 255, 255, 0.06)',
          padding: '3px',
          borderRadius: '8px',
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
                  height: '32px',
                  padding: '0 12px',
                  fontSize: '12.5px',
                  fontWeight: activo ? 600 : 400,
                  color: activo ? '#f8fafc' : 'rgba(255, 255, 255, 0.65)',
                  background: activo ? 'rgba(255, 255, 255, 0.14)' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                  boxShadow: activo ? '0 1px 4px rgba(0,0,0,0.25)' : 'none',
                  touchAction: 'manipulation'
                }}
              >
                <Icon size={14} style={{ opacity: activo ? 1 : 0.75, color: activo ? '#38bdf8' : 'currentColor' }} />
                {tab.label}
                {tab.id === 'supervisor' && totalDecisionesPendientes > 0 && (
                  <span style={{
                    background: '#ef4444',
                    color: '#ffffff',
                    borderRadius: '10px',
                    padding: '0 5px',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    minWidth: '16px',
                    textAlign: 'center',
                    lineHeight: '14px'
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
