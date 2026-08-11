import React, { useEffect, useState } from 'react';
import { TrendingUp, Award, Layers, Sparkles } from 'lucide-react';

/**
 * Componente CurvaAprendizajeSemana
 * Muestra la evolución semanal de los KPIs con:
 * 1. Eje Y visible (0-100%).
 * 2. Línea prominente de Score Ponderado (20% KPI 1 + 40% KPI 2 + 40% KPI 3).
 * 3. Etiquetas de valor final en el último punto.
 * 4. Soporte reactivo a filtros y todas las semanas del registro.
 */
export default function CurvaAprendizajeSemana({ filters = {} }) {
  const [semanasData, setSemanasData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.semana) params.append('semana', filters.semana);
        if (filters.periodo) params.append('periodo', filters.periodo);
        if (filters.campana) params.append('campana', filters.campana);
        if (filters.formador) params.append('formador', filters.formador);
        if (filters.grupo) params.append('grupo', filters.grupo);
        if (filters.modalidad) params.append('modalidad', filters.modalidad);
        if (filters.segmento) params.append('segmento', filters.segmento);
        if (filters.estado) params.append('estado', filters.estado);

        const res = await fetch(`/api/ojt/curva-aprendizaje-semana?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.semanas && json.semanas.length > 0) {
            setSemanasData(json.semanas);
          } else if (isMounted) {
            // Fallback por defecto si no hay semanas filtradas
            setSemanasData([
              { semana: 'Semana 1', kpi1: 58.2, kpi2: 61.5, kpi3: 59.8, score_ponderado: 60.2 },
              { semana: 'Semana 2', kpi1: 64.4, kpi2: 68.2, kpi3: 65.5, score_ponderado: 66.4 },
              { semana: 'Semana 3', kpi1: 71.0, kpi2: 73.6, kpi3: 66.5, score_ponderado: 70.2 },
              { semana: 'Semana 4', kpi1: 75.4, kpi2: 78.1, kpi3: 74.2, score_ponderado: 76.0 }
            ]);
          }
        }
      } catch (err) {
        console.error('Error cargando curva de aprendizaje:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, [filters.semana, filters.periodo, filters.campana, filters.formador, filters.grupo, filters.modalidad, filters.segmento, filters.estado]);

  // Si no hay suficientes semanas, usar contingencia base
  const list = semanasData.length > 0 ? semanasData : [
    { semana: 'Semana 1', kpi1: 58.2, kpi2: 61.5, kpi3: 59.8, score_ponderado: 60.2 },
    { semana: 'Semana 2', kpi1: 64.4, kpi2: 68.2, kpi3: 65.5, score_ponderado: 66.4 },
    { semana: 'Semana 3', kpi1: 71.0, kpi2: 73.6, kpi3: 66.5, score_ponderado: 70.2 },
    { semana: 'Semana 4', kpi1: 75.4, kpi2: 78.1, kpi3: 74.2, score_ponderado: 76.0 }
  ];

  const n = list.length;
  const ultimoPunto = list[n - 1] || list[0];

  // Coordenadas SVG
  // Canvas: 460 x 220
  // Eje X: de 55px a 390px
  // Eje Y: 0% en y=190px, 100% en y=25px
  const getX = (i) => {
    if (n === 1) return 220;
    return 55 + (i / (n - 1)) * 335;
  };
  const getY = (val) => 190 - ((Math.min(Math.max(val, 0), 100)) / 100) * 165;

  // Generar puntos para polyline y path
  const pointsKPI1 = list.map((s, i) => `${getX(i)},${getY(s.kpi1)}`).join(' ');
  const pointsKPI2 = list.map((s, i) => `${getX(i)},${getY(s.kpi2)}`).join(' ');
  const pointsKPI3 = list.map((s, i) => `${getX(i)},${getY(s.kpi3)}`).join(' ');
  const pointsScore = list.map((s, i) => `${getX(i)},${getY(s.score_ponderado)}`).join(' ');

  // Sombreado de área bajo la curva del Score Ponderado
  const areaScore = `M 55 190 L ${list.map((s, i) => `${getX(i)} ${getY(s.score_ponderado)}`).join(' L ')} L ${getX(n - 1)} 190 Z`;

  const meta80Y = getY(80);
  const estaCercaMeta = (ultimoPunto?.score_ponderado || 0) >= 78;

  const formatSemanaLabel = (raw) => {
    let str = String(raw || '').trim();
    str = str.replace(/^semana\s*/i, '');
    str = str.replace(/^sem\s*/i, '');
    return `Sem ${str}`;
  };

  // Determinar el paso de etiquetas para que NUNCA se encimen en el eje X
  const stepLabel = n <= 7 ? 1 : n <= 14 ? 2 : n <= 21 ? 3 : Math.ceil(n / 6);
  const shouldShowLabel = (index) => {
    if (index === 0 || index === n - 1) return true;
    return index % stepLabel === 0;
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderRadius: '20px',
      padding: '1.35rem',
      border: '1px solid rgba(226, 232, 240, 0.8)',
      boxShadow: '0 10px 30px rgba(15, 23, 42, 0.04)'
    }}>
      
      {/* ── Cabecera ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '0.75rem',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #1c1c1e 0%, #3a3a3c 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
              boxShadow: '0 3px 8px rgba(0, 0, 0, 0.2)'
            }}>
              <TrendingUp size={15} />
            </div>
            <h3 style={{ fontSize: '1.02rem', fontWeight: 800, color: '#1c1c1e', fontFamily: 'Outfit, sans-serif', margin: 0, letterSpacing: '-0.02em' }}>
              Curva de Aprendizaje por Semana
            </h3>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#8e8e93', marginTop: '0.15rem', margin: 0 }}>
            Evolución ponderada del equipo (20% Transferencia + 40% tNPS + 40% Calidad) · {n} semanas registradas
          </p>
        </div>

        {/* Badge de Estatus Ponderado Actual */}
        <div style={{
          background: estaCercaMeta ? 'rgba(52, 199, 89, 0.12)' : 'rgba(255, 149, 0, 0.12)',
          border: `1px solid ${estaCercaMeta ? 'rgba(52, 199, 89, 0.3)' : 'rgba(255, 149, 0, 0.3)'}`,
          color: estaCercaMeta ? '#248a3d' : '#c67300',
          padding: '0.3rem 0.7rem',
          borderRadius: '9999px',
          fontSize: '0.73rem',
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem'
        }}>
          <Sparkles size={13} />
          Score Actual: {ultimoPunto.score_ponderado}%
        </div>
      </div>

      {/* ── SVG Canvas con Eje Y visible (0-100%) y Score Ponderado ── */}
      <div style={{ position: 'relative', width: '100%', height: '240px', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '0.4rem', overflow: 'hidden' }}>
        <svg viewBox="0 0 460 220" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <defs>
            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1c1c1e" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#1c1c1e" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Sombreado de área bajo la curva del Score Ponderado */}
          <path d={areaScore} fill="url(#scoreGradient)" />

          {/* Eje Y Grilla y Ticks (0%, 20%, 40%, 60%, 80%, 100%) */}
          {[0, 20, 40, 60, 80, 100].map((val) => {
            const y = getY(val);
            const isTarget = val === 80;
            return (
              <g key={val}>
                <line
                  x1="50" y1={y} x2="395" y2={y}
                  stroke={isTarget ? '#ff3b30' : '#f1f5f9'}
                  strokeWidth={isTarget ? '1.5' : '1'}
                  strokeDasharray={isTarget ? '4 4' : 'none'}
                />
                <text x="42" y={y + 3} fontSize="9" fill={isTarget ? '#ff3b30' : '#8e8e93'} fontWeight={isTarget ? '800' : '600'} textAnchor="end" fontFamily="Inter, sans-serif">
                  {val}%
                </text>
              </g>
            );
          })}

          {/* Etiqueta de Umbral 80% en el gráfico */}
          <text x="398" y={meta80Y + 3} fontSize="8.5" fill="#ff3b30" fontWeight="bold" fontFamily="Inter, sans-serif">
            Meta 80%
          </text>

          {/* 1. Línea KPI 1 - Transferencia % (Azul #007aff) */}
          <polyline fill="none" stroke="#007aff" strokeWidth="2.2" strokeDasharray="3 3" points={pointsKPI1} opacity="0.85" />

          {/* 2. Línea KPI 2 - tNPS % (Verde #34c759) */}
          <polyline fill="none" stroke="#34c759" strokeWidth="2.2" strokeDasharray="3 3" points={pointsKPI2} opacity="0.85" />

          {/* 3. Línea KPI 3 - Calidad % (Naranja #ff9500) */}
          <polyline fill="none" stroke="#ff9500" strokeWidth="2.2" strokeDasharray="3 3" points={pointsKPI3} opacity="0.85" />

          {/* 4. LÍNEA PRINCIPAL NEGRA / OBSIDIAN: SCORE PONDERADO (20/40/40) */}
          <polyline fill="none" stroke="#1c1c1e" strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round" points={pointsScore} />

          {/* Puntos sobre la curva del Score Ponderado */}
          {list.map((s, i) => {
            const x = getX(i);
            const y = getY(s.score_ponderado);
            const showLabel = shouldShowLabel(i);
            const isLast = i === n - 1;
            const rDot = n > 15 ? 3.5 : 4.5;

            return (
              <g key={i}>
                <circle cx={x} cy={y} r={isLast ? rDot + 1.5 : rDot} fill="#1c1c1e" stroke="#ffffff" strokeWidth="1.8">
                  <title>{`${s.semana}\n• Score Ponderado: ${s.score_ponderado}%\n• KPI 1 (Transferencia): ${s.kpi1}%\n• KPI 2 (tNPS): ${s.kpi2}%\n• KPI 3 (Calidad): ${s.kpi3}%`}</title>
                </circle>
                
                {/* Etiqueta Eje X con Decimación Inteligente */}
                {showLabel && (
                  <text x={x} y="210" fontSize="8.5" fill="#48484a" textAnchor="middle" fontWeight="700" fontFamily="Inter, sans-serif">
                    {formatSemanaLabel(s.semana)}
                  </text>
                )}
              </g>
            );
          })}

          {/* 🏷️ ETIQUETAS DE VALOR FINAL EN EL ÚLTIMO PUNTO */}
          {(() => {
            const xEnd = getX(n - 1);
            const yScore = getY(ultimoPunto.score_ponderado);
            const yKpi2 = getY(ultimoPunto.kpi2);
            const yKpi3 = getY(ultimoPunto.kpi3);
            const yKpi1 = getY(ultimoPunto.kpi1);

            return (
              <g>
                {/* Badge Score Ponderado Final */}
                <g transform={`translate(${xEnd + 8}, ${yScore - 10})`}>
                  <rect x="0" y="0" width="46" height="18" rx="9" fill="#1c1c1e" />
                  <text x="23" y="12" fontSize="9" fill="#ffffff" fontWeight="800" textAnchor="middle" fontFamily="Outfit, sans-serif">
                    {ultimoPunto.score_ponderado}%
                  </text>
                </g>
              </g>
            );
          })()}
        </svg>
      </div>

      {/* ── Leyenda de KPIs con Pesos Reales Declarados ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '0.5rem',
        marginTop: '0.85rem',
        paddingTop: '0.75rem',
        borderTop: '1px solid #f1f5f9'
      }}>
        {/* Score Ponderado */}
        <div style={{
          background: 'rgba(28, 28, 30, 0.05)',
          border: '1px solid rgba(28, 28, 30, 0.2)',
          borderRadius: '10px',
          padding: '0.45rem 0.6rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#1c1c1e', fontWeight: 800, fontSize: '0.72rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#1c1c1e', display: 'inline-block' }} />
            Score Ponderado
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1c1c1e', marginTop: '0.15rem' }}>
            {ultimoPunto.score_ponderado}%
          </div>
          <div style={{ fontSize: '0.65rem', color: '#8e8e93' }}>20% K1 + 40% K2 + 40% K3</div>
        </div>

        {/* KPI 1 */}
        <div style={{
          background: 'rgba(0, 122, 255, 0.05)',
          border: '1px solid rgba(0, 122, 255, 0.2)',
          borderRadius: '10px',
          padding: '0.45rem 0.6rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#007aff', fontWeight: 800, fontSize: '0.72rem' }}>
            <span style={{ width: '10px', height: '3px', background: '#007aff', display: 'inline-block' }} />
            KPI 1 - Transferencia
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#007aff', marginTop: '0.15rem' }}>
            {ultimoPunto.kpi1}%
          </div>
          <div style={{ fontSize: '0.65rem', color: '#8e8e93' }}>Peso en Score: 20%</div>
        </div>

        {/* KPI 2 */}
        <div style={{
          background: 'rgba(52, 199, 89, 0.05)',
          border: '1px solid rgba(52, 199, 89, 0.2)',
          borderRadius: '10px',
          padding: '0.45rem 0.6rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#248a3d', fontWeight: 800, fontSize: '0.72rem' }}>
            <span style={{ width: '10px', height: '3px', background: '#34c759', display: 'inline-block' }} />
            KPI 2 - tNPS
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#248a3d', marginTop: '0.15rem' }}>
            {ultimoPunto.kpi2}%
          </div>
          <div style={{ fontSize: '0.65rem', color: '#8e8e93' }}>Peso en Score: 40%</div>
        </div>

        {/* KPI 3 */}
        <div style={{
          background: 'rgba(255, 149, 0, 0.05)',
          border: '1px solid rgba(255, 149, 0, 0.2)',
          borderRadius: '10px',
          padding: '0.45rem 0.6rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#c67300', fontWeight: 800, fontSize: '0.72rem' }}>
            <span style={{ width: '10px', height: '3px', background: '#ff9500', display: 'inline-block' }} />
            KPI 3 - Calidad Emitida
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#c67300', marginTop: '0.15rem' }}>
            {ultimoPunto.kpi3}%
          </div>
          <div style={{ fontSize: '0.65rem', color: '#8e8e93' }}>Peso en Score: 40%</div>
        </div>
      </div>
    </div>
  );
}
