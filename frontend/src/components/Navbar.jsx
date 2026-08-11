import React from 'react';
import { Layers, BarChart3, Users, DollarSign } from 'lucide-react';

const TABS = [
  { id: 'supervisor', label: 'Operación', icon: BarChart3 },
  { id: 'formador',   label: 'Rendimiento', icon: Users },
  { id: 'gerencia',   label: 'Impacto', icon: DollarSign },
];

export default function Navbar({ vistaActiva, onCambiarVista, totalDecisionesPendientes, dbConnected }) {
  return (
    <header 
      className="header-compacto"
      style={{
        height: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 14px',
        background: 'linear-gradient(135deg, #0f1c2e 0%, #1e293b 100%)',
        borderRadius: '10px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 16px rgba(15, 28, 46, 0.25)',
        marginBottom: '1.25rem',
        position: 'sticky',
        top: '12px',
        zIndex: 900
      }}
    >
      {/* ── Sección Izquierda: Logo + Título + Divisor + Tabs Inline ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Logo de 22px */}
        <div style={{
          width: '22px',
          height: '22px',
          borderRadius: '6px',
          background: 'linear-gradient(135deg, #1e6fc0, #4f46e5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: '0 2px 8px rgba(30, 111, 192, 0.4)',
          flexShrink: 0
        }}>
          <Layers size={13} />
        </div>

        {/* Título corto */}
        <span style={{
          fontSize: '13px',
          fontWeight: 700,
          color: '#f8fafc',
          fontFamily: 'Outfit, Inter, sans-serif',
          whiteSpace: 'nowrap',
          letterSpacing: '-0.01em'
        }}>
          Control OJT
        </span>

        {/* Divisor vertical delgado */}
        <div style={{
          width: '0.5px',
          height: '18px',
          background: 'rgba(255, 255, 255, 0.18)',
          flexShrink: 0
        }} />

        {/* Segmented Control Inline de Tabs */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '2px',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          {TABS.map(tab => {
            const Icon = tab.icon;
            const activo = vistaActiva === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onCambiarVista(tab.id)}
                style={{
                  height: '28px',
                  padding: '0 10px',
                  fontSize: '12px',
                  fontWeight: activo ? 600 : 400,
                  color: activo ? '#f8fafc' : 'rgba(255, 255, 255, 0.6)',
                  background: activo ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                  boxShadow: activo ? '0 1px 4px rgba(0,0,0,0.2)' : 'none'
                }}
                onMouseEnter={e => { if (!activo) e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)'; }}
                onMouseLeave={e => { if (!activo) e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'; }}
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

      {/* ── Sección Derecha: Alertas + Punto de Estado Supabase ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {totalDecisionesPendientes > 0 && (
          <span 
            title={`${totalDecisionesPendientes} alertas de Día 2 pendientes`}
            style={{
              fontSize: '0.72rem',
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

        {/* Punto de estado con tooltip */}
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
    </header>
  );
}
