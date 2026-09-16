import React, { useEffect, useMemo, useState } from 'react';
import { CalendarRange, RefreshCw, Download, ExternalLink, Search } from 'lucide-react';
import { fetchCapacidadRys } from '../services/apiService';

function fmt(n, digits = 0) {
  const x = Number(n) || 0;
  return x.toLocaleString('es-PE', { maximumFractionDigits: digits, minimumFractionDigits: digits });
}

function estadoClass(estado) {
  const e = String(estado || '').toUpperCase();
  if (e.includes('CURSO')) return 'is-curso';
  if (e.includes('PROYECC')) return 'is-proy';
  if (e.includes('RIESGO') || e.includes('ALERTA')) return 'is-risk';
  if (e.includes('CANCEL')) return 'is-cancel';
  if (e.includes('CERRAD')) return 'is-cerrado';
  return 'is-otro';
}

function Kpi({ label, value, sub, extra, tone }) {
  return (
    <div className={`capacidad-kpi ${tone || ''}`}>
      <span className="capacidad-kpi__label">{label}</span>
      <strong className="capacidad-kpi__value">{value}</strong>
      {sub && <span className="capacidad-kpi__sub">{sub}</span>}
      {extra && <span className="capacidad-kpi__extra">{extra}</span>}
    </div>
  );
}

export default function CapacidadRysView() {
  const [data, setData] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [filtros, setFiltros] = useState({
    periodo: '', semana: '', segmento: '', campana: '', estado: ''
  });

  const cargar = async (refresh = false) => {
    setCargando(true);
    setError('');
    try {
      const json = await fetchCapacidadRys({ ...filtros, q, refresh });
      if (!json?.success) throw new Error(json?.message || json?.error || 'Sin datos');
      setData(json);
    } catch (err) {
      setError(err.message || 'No se pudo leer Google Sheets');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros.periodo, filtros.semana, filtros.segmento, filtros.campana, filtros.estado]);

  const grupos = data?.grupos || [];
  const kpis = data?.kpis || {};
  const opts = data?.filtros || {};

  const filtradosLocal = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return grupos;
    return grupos.filter((r) => `${r.grupo} ${r.campana} ${r.segmento} ${r.semana}`.toLowerCase().includes(needle));
  }, [grupos, q]);

  const setF = (key, val) => setFiltros((p) => ({ ...p, [key]: val }));

  const exportar = () => {
    const cols = ['SEGMENTO', 'AREA', 'CAMPAÑA', 'GRUPO', 'SEMANA', 'MODALIDAD', 'CONDICION', 'ESTADO', 'FECHA INICIO', 'PERIODO', 'RQ FTES', 'META D0', 'META D1'];
    const lines = [cols.join(';')];
    filtradosLocal.forEach((r) => {
      lines.push([r.segmento, r.area, r.campana, r.grupo, r.semana, r.modalidad, r.condicion_laboral, r.estado, r.fecha_inicio, r.periodo, r.rq_ftes, r.meta_d0, r.meta_d1].join(';'));
    });
    const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'capacidad-rys.csv';
    a.click();
  };

  return (
    <div className="capacidad-rys">
      <div className="capacidad-rys__top">
        <div>
          <h2>Capacidad RYS — Planificación de cohortes</h2>
          <p>Cada fila es un grupo de capacitación con metas D0/D1 y requerimiento de FTEs. Fuente: Google Sheets.</p>
        </div>
        <div className="capacidad-rys__actions">
          <button type="button" className="capacidad-btn" onClick={() => cargar(true)} disabled={cargando}>
            <RefreshCw size={14} /> {cargando ? 'Cargando…' : 'Refrescar'}
          </button>
          <button type="button" className="capacidad-btn" onClick={exportar} disabled={!filtradosLocal.length}>
            <Download size={14} /> Exportar
          </button>
          <a
            className="capacidad-btn is-link"
            href="https://docs.google.com/spreadsheets/d/1GNbzbpIDbueydVqOQr-D032Pma1L9FkHf-JPsU9Qi1s/edit#gid=249081259"
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink size={14} /> Sheets
          </a>
        </div>
      </div>

      <div className="capacidad-kpis">
        <Kpi
          label="Total grupos"
          value={fmt(kpis.total_grupos)}
          sub={`En curso ${fmt(kpis.en_curso)}`}
          extra={`Proy ${fmt(kpis.proyeccion)}`}
          tone="is-blue"
        />
        <Kpi label="RQ solicitado" value={fmt(kpis.rq_ftes, 0)} extra="FTEs" tone="is-violet" />
        <Kpi
          label="Metas D0 / D1"
          value={fmt(kpis.meta_d1)}
          sub={`Meta D0 ${fmt(kpis.meta_d0)} cups`}
          extra="Meta D1 (aula)"
          tone="is-cyan"
        />
        <Kpi
          label="Cobertura real"
          value={`${fmt(kpis.cobertura_real)} / ${fmt(kpis.meta_d1)}`}
          sub={`${fmt(kpis.cubierto_pct, 1)}% cubierto`}
          extra={`Falta ${fmt(kpis.falta)}`}
          tone="is-green"
        />
        <Kpi
          label="Grupos en riesgo"
          value={fmt(kpis.grupos_riesgo)}
          extra="Bajo cubrimiento vs meta D1"
          tone="is-rose"
        />
      </div>

      <div className="capacidad-filters">
        <label className="capacidad-search">
          <Search size={14} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar grupo, campaña, segmento…"
          />
        </label>
        {[
          ['periodo', 'Periodo', opts.periodos],
          ['semana', 'Semana', opts.semanas],
          ['segmento', 'Segmento', opts.segmentos],
          ['campana', 'Campaña', opts.campanas],
          ['estado', 'Estado', opts.estados]
        ].map(([key, label, list]) => (
          <select key={key} value={filtros[key]} onChange={(e) => setF(key, e.target.value)}>
            <option value="">Todos {label}</option>
            {(list || []).map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        ))}
      </div>

      {error && <div className="capacidad-error">{error}</div>}
      {data?.warning && !error && <div className="capacidad-warn">Usando cache: {data.warning}</div>}

      <div className="capacidad-table-wrap">
        <table className="capacidad-table">
          <thead>
            <tr>
              <th>Segmento</th>
              <th>Área / traslado</th>
              <th>Campaña</th>
              <th>Grupo de capacitación</th>
              <th>Semana</th>
              <th>Sede</th>
              <th>Modalidad</th>
              <th>Condición laboral</th>
              <th>Estado</th>
              <th>Fecha de inicio</th>
              <th>Periodo</th>
              <th>Rango horario</th>
              <th>Ext. teoría</th>
              <th>Real / meta</th>
            </tr>
          </thead>
          <tbody>
            {cargando && !filtradosLocal.length ? (
              <tr><td colSpan={14} className="capacidad-empty">Sincronizando Google Sheets…</td></tr>
            ) : filtradosLocal.length === 0 ? (
              <tr><td colSpan={14} className="capacidad-empty">Sin grupos para este filtro.</td></tr>
            ) : filtradosLocal.map((r) => {
              const meta = r.meta_d1 || r.meta_d0 || 0;
              const pct = meta > 0 ? Math.round(((r.real || 0) / meta) * 100) : 0;
              return (
                <tr key={r.id}>
                  <td>{r.segmento}</td>
                  <td>{r.area}</td>
                  <td>{r.campana}</td>
                  <td className="is-mono">{r.grupo}</td>
                  <td className="is-mono">{r.semana}</td>
                  <td>{r.sede}</td>
                  <td>{r.modalidad}</td>
                  <td>{r.condicion_laboral}</td>
                  <td><span className={`capacidad-estado ${estadoClass(r.estado)}`}>{r.estado || '—'}</span></td>
                  <td className="is-mono">{r.fecha_inicio}</td>
                  <td className="is-mono">{r.periodo}</td>
                  <td>{r.rango_horario || '—'}</td>
                  <td>{r.extension_teoria || '—'}</td>
                  <td className="is-meta">
                    {r.real || 0}/{meta || 0} <small>({pct}%)</small>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="capacidad-foot">
        <CalendarRange size={12} />
        {filtradosLocal.length} grupos en vista
        {data?.updated_at ? ` · actualizado ${new Date(data.updated_at).toLocaleString('es-PE')}` : ''}
      </div>
    </div>
  );
}
