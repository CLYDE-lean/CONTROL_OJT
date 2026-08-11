import React, { useEffect, useState } from 'react';
import { TrendingUp, Award, Zap, PhoneCall } from 'lucide-react';

export default function CurvaMaduracionView({ filters = {} }) {
  const [curvaData, setCurvaData] = useState([]);
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

        const res = await fetch(`/api/ojt/curva-maduracion?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success) {
            setCurvaData(data.curva || []);
          }
        }
      } catch (err) {
        console.error('Error cargando curva de maduración:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, [filters.semana, filters.periodo, filters.campana, filters.formador, filters.grupo, filters.modalidad]);

  if (loading) {
    return (
      <div className="executive-card" style={{ gridColumn: 'span 2', textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: 'var(--text-tertiary)' }}>⏳ Cargando Curva de Maduración Operativa real...</p>
      </div>
    );
  }

  if (!curvaData || curvaData.length === 0) {
    return (
      <div className="executive-card" style={{ gridColumn: 'span 2', padding: '1.5rem' }}>
        <h3 className="card-title-exec">📈 Curva de Maduración y Ramp-up Operativo</h3>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
          Sin datos de conexión en el filtro seleccionado.
        </p>
      </div>
    );
  }

  const maxLlamadas = Math.max(...curvaData.map(d => d.promedio_llamadas), 10);
  const diaBreakeven = curvaData.find(d => d.promedio_llamadas >= 15)?.dia || 'Día 4+';

  return (
    <div className="executive-card" style={{ gridColumn: 'span 2' }}>
      <div className="card-header-exec">
        <h2 className="card-title-exec">
          <TrendingUp size={18} style={{ color: '#3b82f6' }} />
          Curva de Maduración y Ramp-up Operativo (Llamadas Atendidas & Calidad %)
        </h2>
        <span className="badge-exec badge-blue">Analítica Predictiva • Maduración</span>
      </div>

      <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', marginBottom: '1.25rem' }}>
        Evolución real del volumen diario de llamadas atendidas y porcentaje de calidad técnica por cada día de conexión efectiva en OJT.
      </p>

      {/* MÉTRICAS DESTACADAS DE RAMP-UP */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <PhoneCall size={14} color="#3b82f6" /> Promedio Inicial (Día 1)
          </span>
          <strong style={{ fontSize: '1.2rem', color: 'var(--text-primary)', display: 'block', marginTop: '0.2rem' }}>
            {curvaData[0]?.promedio_llamadas || 0} llamadas/día
          </strong>
        </div>

        <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Zap size={14} color="#eab308" /> Punto de Equilibrio (Break-even)
          </span>
          <strong style={{ fontSize: '1.2rem', color: '#0d9488', display: 'block', marginTop: '0.2rem' }}>
            {diaBreakeven} ({curvaData.find(d => d.dia === diaBreakeven)?.promedio_llamadas || 15}+ llamadas)
          </strong>
        </div>

        <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Award size={14} color="#0d9488" /> Calidad Técnica Promedio
          </span>
          <strong style={{ fontSize: '1.2rem', color: 'var(--text-primary)', display: 'block', marginTop: '0.2rem' }}>
            {curvaData[curvaData.length - 1]?.promedio_calidad || 85}%
          </strong>
        </div>
      </div>

      {/* GRÁFICO DE BARRAS DE MADURACIÓN POR DÍA */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${curvaData.length}, 1fr)`,
        gap: '0.5rem',
        alignItems: 'end',
        background: '#f7f9fc',
        padding: '1.25rem 1rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-color)',
        minHeight: '200px'
      }}>
        {curvaData.map((item) => {
          const heightPct = Math.max(12, (item.promedio_llamadas / maxLlamadas) * 100);

          return (
            <div key={item.dia} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ fontSize: '0.7rem', textAlign: 'center', marginBottom: '0.3rem' }}>
                <strong style={{ display: 'block', color: 'var(--text-primary)', fontSize: '0.82rem' }}>
                  {item.promedio_llamadas}
                </strong>
                <span style={{ color: '#0d9488', fontSize: '0.65rem', fontWeight: 600 }}>
                  {item.promedio_calidad}%
                </span>
              </div>

              <div style={{
                width: '100%',
                maxWidth: '38px',
                height: `${heightPct * 1.2}px`,
                maxHeight: '120px',
                minHeight: '16px',
                borderRadius: '6px 6px 2px 2px',
                background: item.dia <= 5 ? 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)' : 'linear-gradient(180deg, #0d9488 0%, #0f766e 100%)',
                boxShadow: '0 2px 6px rgba(59, 130, 246, 0.2)'
              }} />

              <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
                <span className="badge-exec badge-neutral" style={{ fontSize: '0.62rem', padding: '0.12rem 0.3rem' }}>
                  {item.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        marginTop: '1rem',
        padding: '0.75rem 1rem',
        borderRadius: 'var(--radius-md)',
        background: 'rgba(59, 130, 246, 0.04)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        fontSize: '0.78rem',
        color: 'var(--text-secondary)'
      }}>
        💡 <strong>Análisis de Aceleración Operativa:</strong> La curva muestra la aceleración de llamadas atendidas por día de conexión. Un crecimiento constante entre el Día 1 y el Día 5 indica una inducción exitosa antes de pasar a Operaciones.
      </div>
    </div>
  );
}
