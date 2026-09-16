import React, { useEffect, useState } from 'react';
import { Target, CheckCircle2, AlertTriangle, XCircle, Award, Percent, Layers } from 'lucide-react';

export default function ExcelFlashOjtView({ filters = {} }) {
  const [flashData, setFlashData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFlashData() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.semana) params.append('semana', filters.semana);
        if (filters.campana) params.append('campana', filters.campana);
        if (filters.formador) params.append('formador', filters.formador);
        if (filters.grupo) params.append('grupo', filters.grupo);
        if (filters.modalidad) params.append('modalidad', filters.modalidad);

        const res = await fetch(`/api/ojt/flash-ojt?${params.toString()}`);
        const data = await res.json();
        if (data.success) {
          setFlashData(data);
        }
      } catch (err) {
        console.error('Error cargando métricas Flash OJT:', err);
      } finally {
        setLoading(false);
      }
    }

    loadFlashData();
  }, [filters]);

  if (loading) {
    return (
      <div className="executive-card" style={{ gridColumn: 'span 2', padding: '1.5rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-tertiary)' }}>⏳ Calculando Cuadro de Indicadores Excel OJT...</p>
      </div>
    );
  }

  const ind = flashData?.indicadores || [];
  const cond = flashData?.resumen_condicion || {};
  const est = flashData?.resumen_estados || {};
  const des = flashData?.desercion || {};

  const semaforoDesercionBg = des.semaforo === 'VERDE' ? '#f0fdfa' : des.semaforo === 'AMARILLO' ? '#fffbeb' : '#fff1f2';
  const semaforoDesercionBorder = des.semaforo === 'VERDE' ? '#99f6e4' : des.semaforo === 'AMARILLO' ? '#fde68a' : '#fecdd3';
  const semaforoDesercionColor = des.semaforo === 'VERDE' ? '#0d9488' : des.semaforo === 'AMARILLO' ? '#d97706' : '#dc2626';

  return (
    <div className="executive-card" style={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', overflowY: 'auto', marginBottom: 0, padding: '0.85rem 1rem' }}>

      {/* ── GRID DE 2 COLUMNAS: TABLA DE INDICADORES + CONDICIÓN DE NOTA ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        
        {/* COLUMNA 1: TABLA DE INDICADORES PONDERADOS */}
        <div style={{ background: '#f8fafc', padding: '1.1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Award size={16} color="#1e6fc0" /> Indicadores & Ponderaciones Oficiales
          </h3>

          <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #dce3ee', color: 'var(--text-tertiary)', textAlign: 'left' }}>
                <th style={{ padding: '0.4rem 0' }}>Indicador</th>
                <th style={{ padding: '0.4rem 0', textAlign: 'center' }}>Meta OJT</th>
                <th style={{ padding: '0.4rem 0', textAlign: 'center' }}>Obj. Cump.</th>
                <th style={{ padding: '0.4rem 0', textAlign: 'center' }}>Peso</th>
                <th style={{ padding: '0.4rem 0', textAlign: 'right' }}>Actual</th>
              </tr>
            </thead>
            <tbody>
              {ind.map((item) => (
                <tr key={item.indicador} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '0.6rem 0', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {item.indicador}
                  </td>
                  <td style={{ padding: '0.6rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    {item.meta_ojt}%
                  </td>
                  <td style={{ padding: '0.6rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    {item.obj_cump}%
                  </td>
                  <td style={{ padding: '0.6rem 0', textAlign: 'center', fontWeight: 700, color: '#1e6fc0' }}>
                    {item.peso_pct}%
                  </td>
                  <td style={{ padding: '0.6rem 0', textAlign: 'right', fontWeight: 800 }}>
                    <span style={{
                      color: item.semaforo === 'VERDE' ? '#0d9488' : item.semaforo === 'AMARILLO' ? '#d97706' : '#dc2626',
                      background: item.semaforo === 'VERDE' ? '#f0fdfa' : item.semaforo === 'AMARILLO' ? '#fffbeb' : '#fff1f2',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '6px',
                      border: `1px solid ${item.semaforo === 'VERDE' ? '#99f6e4' : item.semaforo === 'AMARILLO' ? '#fde68a' : '#fecdd3'}`
                    }}>
                      {item.promedio_actual}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* COLUMNA 2: ESCALA DE CONDICIÓN (APROBADO / AMPLIACIÓN / DESAPROBADO) */}
        <div style={{ background: '#f8fafc', padding: '1.1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Percent size={16} color="#0d9488" /> Condición de Resultado OJT
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {/* APROBADO */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: '8px' }}>
              <div>
                <strong style={{ fontSize: '0.78rem', color: '#0d9488', display: 'block' }}>🟢 Aprobado (75% a más)</strong>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{cond.aprobados || 0} asesores</span>
              </div>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0d9488' }}>{cond.pct_aprobados || 0}%</span>
            </div>

            {/* AMPLIACIÓN */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px' }}>
              <div>
                <strong style={{ fontSize: '0.78rem', color: '#1d4ed8', display: 'block' }}>🔵 Ampliación (65% a 74.99%)</strong>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{cond.ampliacion || 0} asesores</span>
              </div>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: '#1d4ed8' }}>{cond.pct_ampliacion || 0}%</span>
            </div>

            {/* DESAPROBADO */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '8px' }}>
              <div>
                <strong style={{ fontSize: '0.78rem', color: '#dc2626', display: 'block' }}>🔴 Desaprobado (0% a 64.99%)</strong>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{cond.desaprobados || 0} asesores</span>
              </div>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: '#dc2626' }}>{cond.pct_desaprobados || 0}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTOR DE ESTADOS Y CONTROL DE DESERCIÓN ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.65rem', marginBottom: '1.25rem' }}>
        
        <div style={{ background: '#f8fafc', padding: '0.75rem 0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', display: 'block' }}>En Curso OJT</span>
          <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{est.en_curso_ojt || 0}</strong>
        </div>

        <div style={{ background: 'rgba(16, 185, 129, 0.06)', padding: '0.75rem 0.5rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.25)', textAlign: 'center' }}>
          <span style={{ fontSize: '0.7rem', color: '#047857', display: 'block', fontWeight: 700 }}>Egresados OP (I-OP)</span>
          <strong style={{ fontSize: '1.1rem', color: '#047857' }}>{est.egresados_iop || 0}</strong>
        </div>

        <div style={{ background: '#f8fafc', padding: '0.75rem 0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <span style={{ fontSize: '0.7rem', color: '#1d4ed8', display: 'block' }}>En Extensión</span>
          <strong style={{ fontSize: '1.1rem', color: '#1d4ed8' }}>{est.extension || 0}</strong>
        </div>

        <div style={{ background: '#f8fafc', padding: '0.75rem 0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <span style={{ fontSize: '0.7rem', color: '#dc2626', display: 'block' }}>Cesado en OJT</span>
          <strong style={{ fontSize: '1.1rem', color: '#dc2626' }}>{est.cesado_ojt || 0}</strong>
        </div>

        <div style={{ background: '#f8fafc', padding: '0.75rem 0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', display: 'block' }}>En Curso Teórico</span>
          <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{est.en_curso_teorico || 0}</strong>
        </div>

        <div style={{ background: '#f8fafc', padding: '0.75rem 0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <span style={{ fontSize: '0.7rem', color: '#dc2626', display: 'block' }}>Cesado en Teoría</span>
          <strong style={{ fontSize: '1.1rem', color: '#dc2626' }}>{est.cesado_teoria || 0}</strong>
        </div>
      </div>

      {/* ── BANNER DE CONTROL DE DESERCIÓN (meta de negocio 40%) ── */}
      <div style={{
        padding: '0.85rem 1.1rem',
        borderRadius: '10px',
        background: semaforoDesercionBg,
        border: `1px solid ${semaforoDesercionBorder}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {des.semaforo === 'VERDE' ? <CheckCircle2 size={18} color="#0d9488" /> : <AlertTriangle size={18} color={semaforoDesercionColor} />}
          <div>
            <strong style={{ fontSize: '0.84rem', color: semaforoDesercionColor, display: 'block' }}>
              Control de Deserción Pre-Operativa: {des.pct_desercion || 0}%
            </strong>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
              Umbral: 🟢 ≤ 40% | 🔴 > 40% (Total Bajas: {des.total_bajas || 0} de {des.total_evaluados || 0})
            </span>
          </div>
        </div>

        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: semaforoDesercionColor }}>
          {des.retencion_pct || 100}% Retención
        </span>
      </div>

    </div>
  );
}
