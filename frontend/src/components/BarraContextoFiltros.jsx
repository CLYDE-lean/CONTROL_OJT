import React, { useState } from 'react';
import { Copy, Check, RotateCcw } from 'lucide-react';

export const ORDEN_FILTROS = [
  { key: 'periodo', label: 'Periodo', opciones: 'periodos' },
  { key: 'semana', label: 'Semana', opciones: 'semanas' },
  { key: 'segmento', label: 'Segmento', opciones: 'segmentos' },
  { key: 'campana', label: 'Campaña', opciones: 'campanas' },
  { key: 'grupo', label: 'Grupo', opciones: 'grupos' },
  { key: 'formador', label: 'Formador', opciones: 'formadores' },
  { key: 'modalidad', label: 'Modalidad', opciones: 'modalidades' },
  { key: 'estado', label: 'Estado', opciones: 'estados' }
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
  opciones = {},
  totalAsesores = 0,
  onFiltroChange,
  onLimpiarFiltros
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
        {ORDEN_FILTROS.map(({ key, label, opciones: campoOpciones }) => {
          const val = String(filtros[key] || '').trim();
          const lista = opciones?.[campoOpciones] || [];
          const listaCompleta = val && !lista.includes(val) ? [val, ...lista] : lista;

          return (
            <label key={key} className={`barra-filtro${val ? ' is-on' : ''}`}>
              <span className="barra-filtro__label">{label}</span>
              <select
                className="barra-filtro__select"
                value={val}
                onChange={(e) => {
                  const valor = e.target.value;
                  e.target.blur();
                  if (onFiltroChange) onFiltroChange(key, valor);
                }}
                title={val ? `${label}: ${val}` : `${label}: todos`}
              >
                <option value="">Todos</option>
                {listaCompleta.map((op) => (
                  <option key={op} value={op}>{op}</option>
                ))}
              </select>
            </label>
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
      </div>
    </div>
  );
}
