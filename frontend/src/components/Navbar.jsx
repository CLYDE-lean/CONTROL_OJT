import React from 'react';
import { Layers, BarChart3, Users, DollarSign } from 'lucide-react';

const TABS = [
  { id: 'supervisor', label: 'Operación', icon: BarChart3 },
  { id: 'formador',   label: 'Rendimiento', icon: Users },
  { id: 'gerencia',   label: 'Impacto', icon: DollarSign },
];

export default function Navbar({ vistaActiva, onCambiarVista, totalDecisionesPendientes, dbConnected }) {
  return (
    <header className="header-compacto">
      {/* ── Fila Superior / Sección Izquierda: Logo + Título + Status ── */}
      <div className="navbar-top-row" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Logo */}
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '6px',
          background: 'linear-gradient(135deg, #1e6fc0, #4f46e5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: '0 2px 8px rgba(30, 111, 192, 0.4)',
          flexShrink: 0
        }}>
          <Layers size={14} />
        </div>

        {/* Título */}
        <span style={{
          fontSize: '14px',
          fontWeight: 800,
          color: '#f8fafc',
          fontFamily: 'Outfit, Inter, sans-serif',
          whiteSpace: 'nowrap',
          letterSpacing: '-0.02em'
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

        {/* Status indicator en la fila superior para móvil */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
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
