import React, { useState, useEffect, useRef } from 'react';
import { SlidersHorizontal, X, ChevronDown, CheckCircle2 } from 'lucide-react';

export default function FiltrosPanel({ filtros, opciones, onFiltroChange, onLimpiarFiltros }) {
  const [abierto, setAbierto] = useState(false);
  const panelRef = useRef(null);

  const campanas   = opciones?.campanas   || [];
  const formadores = opciones?.formadores || [];
  const grupos     = opciones?.grupos     || [];
  const modalidades = opciones?.modalidades || ['PRESENCIAL', 'TELETRABAJO', 'HÍBRIDO'];
  const semanas    = opciones?.semanas    || [];

  const filtrosActivos = Object.entries(filtros).filter(([, v]) => v !== '');
  const cantidadActivos = filtrosActivos.length;

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setAbierto(false);
      }
    };
    if (abierto) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [abierto]);

  const etiquetaFiltro = {
    campana:   'Campaña',
    formador:  'Formador',
    grupo:     'Código de Grupo',
    semana:    'Cohorte',
    modalidad: 'Modalidad',
    estado:    'Estado'
  };

  return (
    <>
      {/* ── Overlay oscuro cuando el panel está abierto ── */}
      {abierto && (
        <div
          onClick={() => setAbierto(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 28, 46, 0.35)',
            backdropFilter: 'blur(2px)',
            zIndex: 399,
            transition: 'opacity 0.2s ease'
          }}
        />
      )}

      {/* ── Sidebar Drawer ── */}
      <div
        ref={panelRef}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100vh',
          width: '320px',
          background: '#ffffff',
          borderLeft: '1px solid #dce3ee',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.1)',
          zIndex: 400,
          transform: abierto ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header del panel */}
        <div style={{
          padding: '1.25rem 1.5rem 1rem',
          borderBottom: '1px solid #dce3ee',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#f7f9fc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <SlidersHorizontal size={16} style={{ color: '#1e6fc0' }} />
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f1c2e', fontFamily: 'Outfit, Inter, sans-serif' }}>
              Filtros del Panel
            </span>
          </div>
          <button
            onClick={() => setAbierto(false)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '0.35rem', borderRadius: '6px', color: '#7a90ad',
              transition: 'background 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f0f4f9'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <X size={18} />
          </button>
        </div>

        {/* Cuerpo de filtros */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>

          {/* Campaña */}
          <FiltroSelect
            label="Campaña"
            value={filtros.campana}
            onChange={(v) => onFiltroChange('campana', v)}
            opciones={campanas}
            placeholder="Todas las campañas"
          />

          {/* Formador */}
          <FiltroSelect
            label="Formador"
            value={filtros.formador}
            onChange={(v) => onFiltroChange('formador', v)}
            opciones={formadores}
            placeholder="Todos los formadores"
          />

          {/* Código de Grupo */}
          <FiltroSelect
            label="Código de Grupo"
            value={filtros.grupo}
            onChange={(v) => onFiltroChange('grupo', v)}
            opciones={grupos}
            placeholder="Todos los grupos"
          />

          {/* Cohorte / Semana */}
          {semanas.length > 0 && (
            <FiltroSelect
              label="Cohorte / Semana"
              value={filtros.semana}
              onChange={(v) => onFiltroChange('semana', v)}
              opciones={semanas}
              placeholder="Todas las cohortes"
            />
          )}

          {/* Modalidad */}
          <FiltroSelect
            label="Modalidad"
            value={filtros.modalidad}
            onChange={(v) => onFiltroChange('modalidad', v)}
            opciones={modalidades}
            placeholder="Todas las modalidades"
          />

          {/* Estado */}
          <FiltroSelect
            label="Estado"
            value={filtros.estado}
            onChange={(v) => onFiltroChange('estado', v)}
            opciones={['EN OJT', 'OPERATIVO', 'BAJA']}
            placeholder="Todos los estados"
          />
        </div>

        {/* Footer del panel */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #dce3ee', background: '#f7f9fc' }}>
          {cantidadActivos > 0 ? (
            <button
              onClick={() => { onLimpiarFiltros(); }}
              style={{
                width: '100%',
                padding: '0.65rem',
                background: '#fff1f2',
                color: '#dc2626',
                border: '1px solid rgba(220,38,38,0.2)',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff1f2'}
            >
              <X size={14} />
              Limpiar {cantidadActivos} filtro{cantidadActivos > 1 ? 's' : ''}
            </button>
          ) : (
            <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#7a90ad' }}>
              Sin filtros aplicados
            </p>
          )}
        </div>
      </div>

      {/* ── BARRA DE FILTROS HORIZONTAL REACTIVA (ACCESO INSTANTÁNEO) ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #dce3ee',
        borderRadius: '12px',
        padding: '0.85rem 1.25rem',
        marginBottom: '1.25rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.85rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginRight: '0.5rem' }}>
          <SlidersHorizontal size={16} style={{ color: '#1e6fc0' }} />
          <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0f1c2e', fontFamily: 'Outfit, sans-serif' }}>
            Filtros Rápidos:
          </span>
        </div>

        {/* Selector de Campaña */}
        {campanas.length > 0 && (
          <div style={{ flex: '1 1 180px', minWidth: '160px' }}>
            <select
              value={filtros.campana || ''}
              onChange={(e) => onFiltroChange('campana', e.target.value)}
              style={{
                width: '100%',
                padding: '0.45rem 0.75rem',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: filtros.campana ? '#1e6fc0' : '#0f1c2e',
                background: filtros.campana ? 'rgba(30,111,192,0.06)' : '#f8fafc',
                border: `1px solid ${filtros.campana ? '#1e6fc0' : '#dce3ee'}`,
                borderRadius: '8px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="">Todas las Campañas ({campanas.length})</option>
              {campanas.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}

        {/* Selector de Formador */}
        {formadores.length > 0 && (
          <div style={{ flex: '1 1 180px', minWidth: '160px' }}>
            <select
              value={filtros.formador || ''}
              onChange={(e) => onFiltroChange('formador', e.target.value)}
              style={{
                width: '100%',
                padding: '0.45rem 0.75rem',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: filtros.formador ? '#1e6fc0' : '#0f1c2e',
                background: filtros.formador ? 'rgba(30,111,192,0.06)' : '#f8fafc',
                border: `1px solid ${filtros.formador ? '#1e6fc0' : '#dce3ee'}`,
                borderRadius: '8px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="">Todos los Formadores ({formadores.length})</option>
              {formadores.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        )}

        {/* Selector de Cohorte / Semana */}
        {semanas.length > 0 && (
          <div style={{ flex: '1 1 150px', minWidth: '130px' }}>
            <select
              value={filtros.semana || ''}
              onChange={(e) => onFiltroChange('semana', e.target.value)}
              style={{
                width: '100%',
                padding: '0.45rem 0.75rem',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: filtros.semana ? '#1e6fc0' : '#0f1c2e',
                background: filtros.semana ? 'rgba(30,111,192,0.06)' : '#f8fafc',
                border: `1px solid ${filtros.semana ? '#1e6fc0' : '#dce3ee'}`,
                borderRadius: '8px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="">Todas las Cohortes</option>
              {semanas.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}

        {/* Selector de Modalidad */}
        <div style={{ flex: '1 1 140px', minWidth: '120px' }}>
          <select
            value={filtros.modalidad || ''}
            onChange={(e) => onFiltroChange('modalidad', e.target.value)}
            style={{
              width: '100%',
              padding: '0.45rem 0.75rem',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: filtros.modalidad ? '#1e6fc0' : '#0f1c2e',
              background: filtros.modalidad ? 'rgba(30,111,192,0.06)' : '#f8fafc',
              border: `1px solid ${filtros.modalidad ? '#1e6fc0' : '#dce3ee'}`,
              borderRadius: '8px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="">Todas Modalidades</option>
            {modalidades.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        {/* Botón de limpiar si hay filtros activos */}
        {cantidadActivos > 0 && (
          <button
            onClick={onLimpiarFiltros}
            style={{
              padding: '0.45rem 0.75rem',
              background: '#fff1f2',
              color: '#dc2626',
              border: '1px solid rgba(220,38,38,0.25)',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <X size={13} /> Limpiar ({cantidadActivos})
          </button>
        )}
      </div>
    </>
  );
}

/* ── Componente de Select Individual ── */
function FiltroSelect({ label, value, onChange, opciones, placeholder }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <label style={{
        display: 'block',
        fontSize: '0.72rem',
        fontWeight: 700,
        color: '#7a90ad',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        marginBottom: '0.4rem'
      }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            width: '100%',
            padding: '0.6rem 2rem 0.6rem 0.85rem',
            background: '#f7f9fc',
            border: `1px solid ${value ? '#1e6fc0' : '#dce3ee'}`,
            borderRadius: '8px',
            color: value ? '#0f1c2e' : '#7a90ad',
            fontSize: '0.83rem',
            fontWeight: value ? 600 : 400,
            cursor: 'pointer',
            outline: 'none',
            appearance: 'none',
            fontFamily: 'Inter, sans-serif',
            transition: 'border-color 0.15s ease',
            boxShadow: value ? '0 0 0 3px rgba(30,111,192,0.08)' : 'none'
          }}
        >
          <option value="">{placeholder}</option>
          {opciones.map(op => (
            <option key={op} value={op}>{op}</option>
          ))}
        </select>
        <ChevronDown size={14} style={{
          position: 'absolute', right: '0.75rem', top: '50%',
          transform: 'translateY(-50%)', pointerEvents: 'none',
          color: value ? '#1e6fc0' : '#7a90ad'
        }} />
      </div>
      {value && (
        <button
          onClick={() => onChange('')}
          style={{
            marginTop: '0.35rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.72rem',
            color: '#7a90ad',
            display: 'flex',
            alignItems: 'center',
            gap: '0.2rem',
            padding: 0
          }}
        >
          <X size={11} /> Quitar filtro
        </button>
      )}
    </div>
  );
}
