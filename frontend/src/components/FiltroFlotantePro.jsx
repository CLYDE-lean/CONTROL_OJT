import React, { useState, useEffect, useRef } from 'react';
import { 
  SlidersHorizontal, X, ChevronDown, Check, Filter, 
  RotateCcw, Sparkles, Database, Calendar, Users, Target, 
  Briefcase, Layers, CheckCircle2, Search
} from 'lucide-react';

/**
 * Componente FiltroFlotantePro
 * Botón flotante FAB (Sticky) con Drawer/Modal minimalista y profesional.
 * Conectado en cascada auto-excluyente con la caché in-memory de Supabase.
 */
export default function FiltroFlotantePro({ 
  filtros, 
  opciones = {}, 
  onFiltroChange, 
  onLimpiarFiltros,
  totalFiltrado = 0,
  cargando = false
}) {
  const [abierto, setAbierto] = useState(false);
  const [busquedaLocal, setBusquedaLocal] = useState('');
  const drawerRef = useRef(null);

  // Extraer las opciones disponibles recalculadas en cascada por el backend
  const campanas   = opciones?.campanas   || [];
  const formadores = opciones?.formadores || [];
  const grupos     = opciones?.grupos     || [];
  const semanas    = opciones?.semanas    || [];
  const periodos   = opciones?.periodos   || [];
  const segmentos  = opciones?.segmentos  || [];
  const modalidades= opciones?.modalidades|| ['PRESENCIAL', 'TELETRABAJO', 'HÍBRIDO'];
  const estados    = opciones?.estados    || ['EN OJT', 'OPERATIVO', 'BAJA'];

  // Calcular número de filtros activos
  const filtrosActivos = Object.entries(filtros).filter(([_, v]) => Boolean(v) && v !== '');
  const cantidadActivos = filtrosActivos.length;

  // Cerrar al presionar tecla ESC o clic afuera + Bloquear scroll de body
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setAbierto(false);
    };
    const handleClickOutside = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        setAbierto(false);
      }
    };

    if (abierto) {
      document.body.classList.add('modal-open');
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [abierto]);

  const etiquetasFiltros = {
    semana:    { label: 'Semana / Cohorte', icon: Calendar, color: '#38bdf8' },
    periodo:   { label: 'Periodo / Mes', icon: Calendar, color: '#a855f7' },
    campana:   { label: 'Campaña', icon: Target, color: '#f59e0b' },
    grupo:     { label: 'Código de Grupo', icon: Layers, color: '#10b981' },
    formador:  { label: 'Formador', icon: Users, color: '#3b82f6' },
    segmento:  { label: 'Segmento', icon: Briefcase, color: '#ec4899' },
    modalidad: { label: 'Modalidad', icon: Briefcase, color: '#6366f1' },
    estado:    { label: 'Estado', icon: CheckCircle2, color: '#ef4444' }
  };

  return (
    <>
      {/* ── 1. BOTÓN FLOTANTE FAB (STICKY / FIXED OVERLAY) ── */}
      <div className="fab-container">
        <button
          onClick={() => setAbierto(!abierto)}
          aria-label="Abrir Filtros del Dashboard"
          className="touch-target"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.85rem 1.35rem',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%)',
            backdropFilter: 'blur(16px)',
            color: '#ffffff',
            border: `1.5px solid ${cantidadActivos > 0 ? '#38bdf8' : 'rgba(148, 163, 184, 0.25)'}`,
            borderRadius: '9999px',
            boxShadow: cantidadActivos > 0 
              ? '0 10px 30px -5px rgba(56, 189, 248, 0.4), 0 4px 12px rgba(15, 23, 42, 0.6)' 
              : '0 10px 30px -5px rgba(15, 23, 42, 0.5), 0 4px 12px rgba(0, 0, 0, 0.2)',
            cursor: 'pointer',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: abierto ? 'scale(0.96)' : 'scale(1)',
            outline: 'none',
            userSelect: 'none'
          }}
          onMouseEnter={(e) => {
            if (!abierto) e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)';
          }}
          onMouseLeave={(e) => {
            if (!abierto) e.currentTarget.style.transform = 'translateY(0) scale(1)';
          }}
        >
          {/* Icono de Filtro Animado */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <SlidersHorizontal 
              size={18} 
              style={{ 
                color: cantidadActivos > 0 ? '#38bdf8' : '#e2e8f0',
                transition: 'transform 0.3s ease',
                transform: abierto ? 'rotate(90deg)' : 'rotate(0deg)'
              }} 
            />
            {cantidadActivos > 0 && (
              <span style={{
                position: 'absolute',
                top: -3,
                right: -3,
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#38bdf8',
                boxShadow: '0 0 8px #38bdf8'
              }} />
            )}
          </div>

          {/* Texto del Botón */}
          <span style={{
            fontWeight: 700,
            fontSize: '0.88rem',
            letterSpacing: '0.02em',
            fontFamily: 'Outfit, Inter, sans-serif'
          }}>
            {abierto ? 'Cerrar Filtros' : 'Filtros BI'}
          </span>

          {/* Conteo de Filtros Activos Badge */}
          {cantidadActivos > 0 ? (
            <span style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '0.2rem 0.55rem',
              borderRadius: '9999px',
              border: '1px solid rgba(255,255,255,0.3)',
              boxShadow: '0 2px 6px rgba(2, 132, 199, 0.4)'
            }}>
              {cantidadActivos}
            </span>
          ) : (
            <Sparkles size={14} style={{ color: '#64748b' }} />
          )}
        </button>
      </div>

      {/* ── 2. MODAL / OVERLAY BACKDROP WITH BLUR ── */}
      {abierto && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(8px)',
            zIndex: 1050,
            animation: 'fadeIn 0.2s ease-out'
          }}
        />
      )}

      {/* ── 3. DRAWER SLIDE-IN PANEL ── */}
      <div
        ref={drawerRef}
        className="drawer-panel"
        style={{
          transform: abierto ? 'translateX(0)' : 'translateX(100%)',
          visibility: abierto ? 'visible' : 'hidden'
        }}
      >
        {/* Cabecera del Panel */}
        <div style={{
          padding: '1.25rem 1.5rem',
          background: 'linear-gradient(135deg, #0f1c2e 0%, #1e293b 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.08)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={18} style={{ color: '#38bdf8' }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', margin: 0, color: '#f8fafc' }}>
                Filtros en Cascada DB
              </h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem' }}>
              <Database size={12} style={{ color: '#4ade80' }} />
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
                Conectado a In-Memory Cache (Supabase)
              </span>
            </div>
          </div>

          <button
            onClick={() => setAbierto(false)}
            aria-label="Cerrar modal"
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: '#cbd5e1',
              cursor: 'pointer',
              padding: '0.4rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            <X size={18} />
          </button>
        </div>

        {/* Resumen de Impacto de Asesores */}
        <div style={{
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          padding: '0.75rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.78rem'
        }}>
          <span style={{ color: '#64748b', fontWeight: 600 }}>Asesores Coincidentes:</span>
          <span style={{ 
            fontWeight: 800, 
            color: '#0f172a',
            background: 'rgba(56, 189, 248, 0.12)',
            padding: '0.2rem 0.6rem',
            borderRadius: '6px',
            border: '1px solid rgba(56, 189, 248, 0.25)'
          }}>
            {cargando ? 'Calculando...' : `${totalFiltrado.toLocaleString()} asesores`}
          </span>
        </div>

        {/* Chips de Filtros Activos con eliminación rápida */}
        {cantidadActivos > 0 && (
          <div style={{
            padding: '0.85rem 1.5rem',
            background: '#ffffff',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.4rem',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', width: '100%' }}>
              Filtros activos ({cantidadActivos}):
            </span>
            {filtrosActivos.map(([key, val]) => {
              const meta = etiquetasFiltros[key] || { label: key, color: '#3b82f6' };
              return (
                <span
                  key={key}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.25rem 0.6rem',
                    background: `${meta.color}12`,
                    border: `1px solid ${meta.color}35`,
                    borderRadius: '6px',
                    fontSize: '0.73rem',
                    fontWeight: 700,
                    color: '#0f172a'
                  }}
                >
                  <span style={{ color: meta.color }}>{meta.label}:</span>
                  <strong style={{ maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {val}
                  </strong>
                  <X
                    size={13}
                    style={{ cursor: 'pointer', color: '#64748b', marginLeft: '0.1rem' }}
                    onClick={() => onFiltroChange(key, '')}
                  />
                </span>
              );
            })}

            <button
              onClick={onLimpiarFiltros}
              style={{
                background: 'none',
                border: 'none',
                color: '#ef4444',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                padding: '0.2rem 0.4rem',
                marginLeft: 'auto',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.2rem'
              }}
            >
              <RotateCcw size={11} /> Limpiar todo
            </button>
          </div>
        )}

        {/* Búsqueda rápida dentro del panel */}
        <div style={{ padding: '0.85rem 1.5rem 0.35rem' }}>
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Search size={14} style={{ position: 'absolute', left: '0.75rem', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Buscar en opciones de filtro..."
              value={busquedaLocal}
              onChange={(e) => setBusquedaLocal(e.target.value)}
              style={{
                width: '100%',
                padding: '0.45rem 0.75rem 0.45rem 2.2rem',
                fontSize: '0.78rem',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                outline: 'none',
                color: '#0f172a'
              }}
            />
            {busquedaLocal && (
              <X 
                size={13} 
                style={{ position: 'absolute', right: '0.75rem', cursor: 'pointer', color: '#94a3b8' }} 
                onClick={() => setBusquedaLocal('')}
              />
            )}
          </div>
        </div>

        {/* Cuerpo de Selectores en Cascada */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 1.5rem 1.5rem' }}>

          {/* 1. Formador */}
          <FiltroSelectCascada
            label="Formador"
            icon={Users}
            iconColor="#3b82f6"
            value={filtros.formador || ''}
            onChange={(v) => onFiltroChange('formador', v)}
            opciones={formadores}
            placeholder="Todos los Formadores"
            searchQuery={busquedaLocal}
          />

          {/* 2. Campaña */}
          <FiltroSelectCascada
            label="Campaña"
            icon={Target}
            iconColor="#f59e0b"
            value={filtros.campana || ''}
            onChange={(v) => onFiltroChange('campana', v)}
            opciones={campanas}
            placeholder="Todas las Campañas"
            searchQuery={busquedaLocal}
          />

          {/* 3. Código de Grupo */}
          <FiltroSelectCascada
            label="Código de Grupo"
            icon={Layers}
            iconColor="#10b981"
            value={filtros.grupo || ''}
            onChange={(v) => onFiltroChange('grupo', v)}
            opciones={grupos}
            placeholder="Todos los Grupos"
            searchQuery={busquedaLocal}
          />

          {/* 4. Cohorte / Semana */}
          <FiltroSelectCascada
            label="Cohorte / Semana"
            icon={Calendar}
            iconColor="#38bdf8"
            value={filtros.semana || ''}
            onChange={(v) => onFiltroChange('semana', v)}
            opciones={semanas}
            placeholder="Todas las Cohortes"
            searchQuery={busquedaLocal}
          />

          {/* 5. Periodo / Mes */}
          <FiltroSelectCascada
            label="Periodo / Mes"
            icon={Calendar}
            iconColor="#a855f7"
            value={filtros.periodo || ''}
            onChange={(v) => onFiltroChange('periodo', v)}
            opciones={periodos}
            placeholder="Todos los Periodos"
            searchQuery={busquedaLocal}
          />

          {/* 6. Segmento */}
          {segmentos.length > 0 && (
            <FiltroSelectCascada
              label="Segmento"
              icon={Briefcase}
              iconColor="#ec4899"
              value={filtros.segmento || ''}
              onChange={(v) => onFiltroChange('segmento', v)}
              opciones={segmentos}
              placeholder="Todos los Segmentos"
              searchQuery={busquedaLocal}
            />
          )}

          {/* 7. Modalidad */}
          <FiltroSelectCascada
            label="Modalidad de Trabajo"
            icon={Briefcase}
            iconColor="#6366f1"
            value={filtros.modalidad || ''}
            onChange={(v) => onFiltroChange('modalidad', v)}
            opciones={modalidades}
            placeholder="Todas las Modalidades"
            searchQuery={busquedaLocal}
          />

          {/* 8. Estado */}
          <FiltroSelectCascada
            label="Estado del Asesor"
            icon={CheckCircle2}
            iconColor="#ef4444"
            value={filtros.estado || ''}
            onChange={(v) => onFiltroChange('estado', v)}
            opciones={estados}
            placeholder="Todos los Estados"
            searchQuery={busquedaLocal}
          />
        </div>

        {/* Footer del Panel */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid #e2e8f0',
          background: '#f8fafc',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'center'
        }}>
          {cantidadActivos > 0 && (
            <button
              onClick={onLimpiarFiltros}
              style={{
                flex: '0 0 auto',
                padding: '0.65rem 1rem',
                background: '#fff1f2',
                color: '#dc2626',
                border: '1px solid rgba(220,38,38,0.2)',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <RotateCcw size={14} />
              Resetear
            </button>
          )}

          <button
            onClick={() => setAbierto(false)}
            style={{
              flex: 1,
              padding: '0.65rem 1.25rem',
              background: 'linear-gradient(135deg, #0f1c2e 0%, #1e293b 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(15,28,46,0.25)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            <Check size={16} />
            Aplicar Filtros ({cantidadActivos})
          </button>
        </div>
      </div>
    </>
  );
}

/**
 * Subcomponente de Selector Individual en Cascada Auto-Excluyente
 */
function FiltroSelectCascada({ 
  label, 
  icon: IconComponent, 
  iconColor, 
  value, 
  onChange, 
  opciones = [], 
  placeholder,
  searchQuery = ''
}) {
  // Filtrar las opciones si hay término en el buscador local
  const opcionesFiltradas = searchQuery 
    ? opciones.filter(op => String(op).toLowerCase().includes(searchQuery.toLowerCase()))
    : opciones;

  const estaActivo = Boolean(value);

  return (
    <div style={{ marginBottom: '1.15rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.72rem',
          fontWeight: 800,
          color: estaActivo ? '#0f172a' : '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '0.04em'
        }}>
          {IconComponent && <IconComponent size={13} style={{ color: iconColor }} />}
          {label}
        </label>

        <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#94a3b8' }}>
          {opciones.length} disponible{opciones.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div style={{ position: 'relative' }}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '100%',
            padding: '0.6rem 2.2rem 0.6rem 0.85rem',
            background: estaActivo ? 'rgba(56, 189, 248, 0.06)' : '#f8fafc',
            border: `1.5px solid ${estaActivo ? iconColor : '#cbd5e1'}`,
            borderRadius: '9px',
            color: estaActivo ? '#0f172a' : '#475569',
            fontSize: '0.82rem',
            fontWeight: estaActivo ? 700 : 500,
            cursor: 'pointer',
            outline: 'none',
            appearance: 'none',
            fontFamily: 'Inter, sans-serif',
            transition: 'border-color 0.15s ease, background 0.15s ease',
            boxShadow: estaActivo ? `0 0 0 3px ${iconColor}18` : 'none'
          }}
        >
          <option value="">{placeholder} ({opciones.length})</option>
          {opcionesFiltradas.map((op) => (
            <option key={op} value={op}>
              {op}
            </option>
          ))}
        </select>

        <ChevronDown 
          size={14} 
          style={{
            position: 'absolute',
            right: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: estaActivo ? iconColor : '#94a3b8'
          }} 
        />
      </div>

      {estaActivo && (
        <button
          onClick={() => onChange('')}
          style={{
            marginTop: '0.25rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.7rem',
            color: '#64748b',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.2rem',
            padding: 0
          }}
        >
          <X size={11} /> Remover este filtro
        </button>
      )}
    </div>
  );
}
