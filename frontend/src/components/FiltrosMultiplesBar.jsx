import React from 'react';
import { Filter, X } from 'lucide-react';

export default function FiltrosMultiplesBar({ 
  filtros, 
  opciones, 
  onFiltroChange, 
  onLimpiarFiltros 
}) {
  const campanas = opciones?.campanas || [];
  const formadores = opciones?.formadores || [];
  const grupos = opciones?.grupos || [];
  const modalidades = opciones?.modalidades || ['PRESENCIAL', 'TELETRABAJO', 'HÍBRIDO'];
  const semanas = opciones?.semanas || [];

  const tieneFiltrosActivos = Boolean(
    filtros.semana || filtros.campana || filtros.formador || filtros.grupo || filtros.modalidad || filtros.estado
  );

  return (
    <div className="executive-card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          <Filter size={16} style={{ color: 'var(--accent-primary)' }} />
          <span>Filtros Supabase en Vivo:</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
          {/* Filtro por Campaña (Extraído de Supabase) */}
          <select 
            value={filtros.campana || ''} 
            onChange={(e) => onFiltroChange('campana', e.target.value)}
            className="btn-exec"
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
          >
            <option value="" style={{ background: '#131b2e' }}>
              {campanas.length > 0 ? `Todas las Campañas (${campanas.length})` : 'Todas las Campañas'}
            </option>
            {campanas.map(c => (
              <option key={c} value={c} style={{ background: '#131b2e' }}>{c}</option>
            ))}
          </select>

          {/* Filtro por Formador (Extraído de Supabase) */}
          <select 
            value={filtros.formador || ''} 
            onChange={(e) => onFiltroChange('formador', e.target.value)}
            className="btn-exec"
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
          >
            <option value="" style={{ background: '#131b2e' }}>
              {formadores.length > 0 ? `Todos los Formadores (${formadores.length})` : 'Todos los Formadores'}
            </option>
            {formadores.map(f => (
              <option key={f} value={f} style={{ background: '#131b2e' }}>{f}</option>
            ))}
          </select>

          {/* Filtro por Código de Grupo (Extraído de Supabase) */}
          {grupos.length > 0 && (
            <select 
              value={filtros.grupo || ''} 
              onChange={(e) => onFiltroChange('grupo', e.target.value)}
              className="btn-exec"
              style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
            >
              <option value="" style={{ background: '#131b2e' }}>
                Todos los Grupos ({grupos.length})
              </option>
              {grupos.map(g => (
                <option key={g} value={g} style={{ background: '#131b2e' }}>{g}</option>
              ))}
            </select>
          )}

          {/* Filtro por Semana / Cohorte (Extraído de Supabase) */}
          {semanas.length > 0 && (
            <select 
              value={filtros.semana || ''} 
              onChange={(e) => onFiltroChange('semana', e.target.value)}
              className="btn-exec"
              style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
            >
              <option value="" style={{ background: '#131b2e' }}>Todas las Cohortes ({semanas.length})</option>
              {semanas.map(s => (
                <option key={s} value={s} style={{ background: '#131b2e' }}>Semana {s}</option>
              ))}
            </select>
          )}

          {/* Filtro por Modalidad */}
          <select 
            value={filtros.modalidad || ''} 
            onChange={(e) => onFiltroChange('modalidad', e.target.value)}
            className="btn-exec"
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
          >
            <option value="" style={{ background: '#131b2e' }}>Todas las Modalidades</option>
            {modalidades.map(m => (
              <option key={m} value={m} style={{ background: '#131b2e' }}>{m}</option>
            ))}
          </select>

          {/* Filtro por Estado */}
          <select 
            value={filtros.estado || ''} 
            onChange={(e) => onFiltroChange('estado', e.target.value)}
            className="btn-exec"
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
          >
            <option value="" style={{ background: '#131b2e' }}>Todos los Estados</option>
            <option value="EN OJT" style={{ background: '#131b2e' }}>EN OJT</option>
            <option value="OPERATIVO" style={{ background: '#131b2e' }}>OPERATIVO (Egresado)</option>
            <option value="BAJA" style={{ background: '#131b2e' }}>BAJA</option>
          </select>

          {/* Botón Limpiar Filtros */}
          {tieneFiltrosActivos && (
            <button 
              onClick={onLimpiarFiltros}
              className="btn-exec btn-exec-danger"
              style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.45rem 0.75rem' }}
            >
              <X size={14} />
              Limpiar Filtros
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
