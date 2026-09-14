/**
 * RealtimeBadge — Indicador visual de sincronización Realtime
 *
 * Muestra en el Navbar:
 *  • Punto pulsante verde = conectado y escuchando
 *  • Punto amarillo = conectando
 *  • Punto rojo = error/desconectado
 *  • Badge con el tiempo desde el último evento
 *
 * Cuando hay un update pendiente, muestra un toast flotante con botón
 * "Actualizar ahora" y un countdown de 2s.
 */
import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, X, Zap } from 'lucide-react';

const STATUS_CONFIG = {
  connected:    { color: '#10b981', label: 'En vivo',      pulse: true  },
  connecting:   { color: '#f59e0b', label: 'Conectando…',  pulse: false },
  disconnected: { color: '#94a3b8', label: 'Desconectado', pulse: false },
  error:        { color: '#f43f5e', label: 'Error RT',     pulse: false },
};

function timeAgo(date) {
  if (!date) return null;
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60)  return `hace ${diff}s`;
  if (diff < 3600) return `hace ${Math.floor(diff / 60)}m`;
  return `hace ${Math.floor(diff / 3600)}h`;
}

export default function RealtimeBadge({ wsStatus, lastUpdate, pendingUpdate, eventCount, onDismiss, onForceRefresh }) {
  const [timeLabel, setTimeLabel] = useState(null);
  const cfg = STATUS_CONFIG[wsStatus] || STATUS_CONFIG.connecting;

  // Actualizar el "hace Xs" cada segundo
  useEffect(() => {
    if (!lastUpdate) return;
    const interval = setInterval(() => setTimeLabel(timeAgo(lastUpdate)), 1000);
    setTimeLabel(timeAgo(lastUpdate));
    return () => clearInterval(interval);
  }, [lastUpdate]);

  return (
    <>
      {/* ── Indicador en Navbar ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        padding: '3px 8px 3px 6px',
        borderRadius: '20px',
        background: 'rgba(255,255,255,0.08)',
        border: `1px solid ${cfg.color}44`,
        cursor: 'default',
        userSelect: 'none',
        position: 'relative',
      }}
        title={`Realtime: ${cfg.label}${lastUpdate ? ` · Último evento ${timeAgo(lastUpdate)}` : ''}`}
      >
        {/* Punto de estado */}
        <span style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 10, height: 10 }}>
          {/* Anillo pulsante */}
          {cfg.pulse && (
            <span style={{
              position: 'absolute',
              width: '100%', height: '100%',
              borderRadius: '50%',
              background: cfg.color,
              opacity: 0.35,
              animation: 'rt-ping 1.5s cubic-bezier(0,0,0.2,1) infinite',
            }} />
          )}
          <span style={{
            width: 7, height: 7,
            borderRadius: '50%',
            background: cfg.color,
            display: 'block',
            flexShrink: 0,
          }} />
        </span>

        {/* Label */}
        <span style={{ fontSize: '0.7rem', color: cfg.color, fontWeight: 700, lineHeight: 1 }}>
          {cfg.label}
        </span>

        {/* Contador de eventos */}
        {eventCount > 0 && (
          <span style={{
            fontSize: '0.62rem',
            color: '#a5b4fc',
            fontWeight: 600,
            marginLeft: '2px',
            background: 'rgba(99,102,241,0.2)',
            borderRadius: '10px',
            padding: '0 5px',
          }}>
            {eventCount} {eventCount === 1 ? 'evento' : 'eventos'}
          </span>
        )}

        {/* Tiempo del último update */}
        {timeLabel && (
          <span style={{ fontSize: '0.62rem', color: '#94a3b8', marginLeft: '1px' }}>
            · {timeLabel}
          </span>
        )}
      </div>

      {/* ── Toast Flotante de Update Pendiente ── */}
      {pendingUpdate && (
        <div style={{
          position: 'fixed',
          top: '62px',
          right: '18px',
          zIndex: 3500,
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          border: '1px solid #6366f1',
          borderRadius: '14px',
          boxShadow: '0 8px 32px rgba(99,102,241,0.35), 0 2px 8px rgba(0,0,0,0.3)',
          padding: '0.9rem 1.1rem',
          minWidth: '280px',
          maxWidth: '320px',
          animation: 'rt-slide-in 0.3s cubic-bezier(0.16,1,0.3,1)',
        }}>
          {/* Header del toast */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Zap size={14} color="#6366f1" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#e2e8f0' }}>
                Nuevos datos detectados
              </span>
            </div>
            <button
              onClick={onDismiss}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', lineHeight: 0, padding: '2px' }}
            >
              <X size={13} />
            </button>
          </div>

          {/* Mensaje */}
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0 0 0.75rem', lineHeight: 1.4 }}>
            Se detectaron cambios en la tabla <strong style={{ color: '#a5b4fc' }}>CONTROL</strong>.
            El dashboard se actualizará automáticamente.
          </p>

          {/* Barra de progreso countdown */}
          <div style={{ height: '3px', background: '#1e293b', borderRadius: '2px', overflow: 'hidden', marginBottom: '0.75rem' }}>
            <div style={{
              height: '100%',
              background: 'linear-gradient(90deg, #6366f1, #a78bfa)',
              borderRadius: '2px',
              animation: 'rt-progress 2s linear forwards',
              width: '100%',
            }} />
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={onForceRefresh}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                padding: '0.45rem 0.75rem',
                background: '#6366f1',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#4f46e5'}
              onMouseLeave={e => e.currentTarget.style.background = '#6366f1'}
            >
              <RefreshCw size={12} />
              Actualizar ahora
            </button>
            <button
              onClick={onDismiss}
              style={{
                padding: '0.45rem 0.75rem',
                background: 'rgba(255,255,255,0.06)',
                color: '#94a3b8',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                fontSize: '0.76rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Ignorar
            </button>
          </div>
        </div>
      )}

      {/* ── Keyframes CSS ── */}
      <style>{`
        @keyframes rt-ping {
          0%   { transform: scale(1);   opacity: 0.35; }
          75%  { transform: scale(2.2); opacity: 0;    }
          100% { transform: scale(2.2); opacity: 0;    }
        }
        @keyframes rt-slide-in {
          from { opacity: 0; transform: translateY(-12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)     scale(1);    }
        }
        @keyframes rt-progress {
          from { width: 100%; }
          to   { width: 0%;   }
        }
      `}</style>
    </>
  );
}
