import React, { useState } from 'react';
import { Copy, Check, SlidersHorizontal, RotateCcw } from 'lucide-react';

export const ORDEN_FILTROS = [
  { key: 'periodo', label: 'Periodo' },
  { key: 'semana', label: 'Semana' },
  { key: 'segmento', label: 'Segmento' },
  { key: 'campana', label: 'Campaña' },
  { key: 'grupo', label: 'Grupo' },
  { key: 'formador', label: 'Formador' },
  { key: 'modalidad', label: 'Modalidad' },
  { key: 'estado', label: 'Estado' }
];

export function textoContextoFiltros(filtros = {}, totalAsesores = 0) {
  const ahora = new Date();
  const fecha = ahora.toLocaleString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  const lineas = [
    'GEA PERÚ · Contexto de consulta OJT',
    `Fecha captura: ${fecha}`,
    `Personas en vista: ${Number(totalAsesores || 0).toLocaleString('es-PE')}`
  ];
  ORDEN_FILTROS.forEach(({ key, label }) => {
    const val = String(filtros[key] || '').trim();
    lineas.push(`${label}: ${val || 'Todos'}`);
  });
  return lineas.join('\n');
}

export default function BarraContextoFiltros({
  filtros = {},
  totalAsesores = 0,
  onAbrirFiltros,
  onLimpiarFiltros,
  onRemoverFiltro
}) {
  const [copiado, setCopiado] = useState(false);
  const activos = ORDEN_FILTROS.filter(({ key }) => Boolean(String(filtros[key] || '').trim()));

  const copiar = async () => {
    const texto = textoContextoFiltros(filtros, totalAsesores);
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      window.prompt('Copia este contexto para el reporte:', texto);
    }
  };

  return (
    <div className="barra-contexto-filtros" role="region" aria-label="Contexto de filtros activos">
      <div className="barra-contexto-filtros__meta">
        <span className="barra-contexto-filtros__tag">
          {activos.length > 0 ? `${activos.length} filtro${activos.length === 1 ? '' : 's'}` : 'Sin filtros'}
        </span>
        <span className="barra-contexto-filtros__count">
          <strong>{Number(totalAsesores || 0).toLocaleString('es-PE')}</strong> personas
        </span>
      </div>

      <div className="barra-contexto-filtros__slots">
        {ORDEN_FILTROS.map(({ key, label }) => {
          const val = String(filtros[key] || '').trim();
          const activo = Boolean(val);
          return (
            <button
              key={key}
              type="button"
              className={`barra-contexto-slot${activo ? ' is-on' : ''}`}
              onClick={() => onAbrirFiltros && onAbrirFiltros()}
              title={activo ? `${label}: ${val}` : `${label}: Todos (clic para filtrar)`}
            >
              <span className="barra-contexto-slot__label">{label}</span>
              <span className="barra-contexto-slot__value">{activo ? val : 'Todos'}</span>
              {activo && onRemoverFiltro && (
                <span
                  className="barra-contexto-slot__x"
                  role="button"
                  tabIndex={0}
                  title={`Quitar ${label}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoverFiltro(key);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.stopPropagation();
                      onRemoverFiltro(key);
                    }
                  }}
                >
                  ×
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="barra-contexto-filtros__actions">
        <button type="button" className="barra-contexto-btn" onClick={copiar} title="Copiar contexto para pegarlo en un reporte">
          {copiado ? <Check size={13} /> : <Copy size={13} />}
          {copiado ? 'Copiado' : 'Copiar'}
        </button>
        {activos.length > 0 && (
          <button type="button" className="barra-contexto-btn barra-contexto-btn--danger" onClick={onLimpiarFiltros}>
            <RotateCcw size={13} />
            Limpiar
          </button>
        )}
        <button type="button" className="barra-contexto-btn barra-contexto-btn--primary" onClick={onAbrirFiltros}>
          <SlidersHorizontal size={13} />
          Editar
        </button>
      </div>
    </div>
  );
}
