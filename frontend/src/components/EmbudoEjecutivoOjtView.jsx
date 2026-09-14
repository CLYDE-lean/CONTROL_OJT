import React, { useEffect, useState } from 'react';
import { Users, UserX, CheckCircle2, ArrowRight, TrendingUp, ShieldCheck, Zap } from 'lucide-react';

export default function EmbudoEjecutivoOjtView({ filters = {} }) {
  const [flujoData, setFlujoData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFlujo() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.semana) params.append('semana', filters.semana);
        if (filters.campana) params.append('campana', filters.campana);
        if (filters.formador) params.append('formador', filters.formador);
        if (filters.grupo) params.append('grupo', filters.grupo);
        if (filters.modalidad) params.append('modalidad', filters.modalidad);

        const res = await fetch(`/api/ojt/embudo-flujo?${params.toString()}`);
        const data = await res.json();
        if (data.success) {
          setFlujoData(data.flujo);
        }
      } catch (err) {
        console.error('Error cargando embudo de flujo:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchFlujo();
  }, [filters]);

  if (loading) {
    return (
      <div className="executive-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-tertiary)' }}>⏳ Calculando Flujo Ejecutivo OJT $\rightarrow$ Operaciones...</p>
      </div>
    );
  }

  const f = flujoData || {
    total_ingresaron_ojt: 0,
    total_bajas_ojt: 0,
    pct_bajas_ojt: 0,
    total_egresados_op: 0,
    pct_egresados_op: 0,
    total_en_curso_ojt: 0,
    pct_en_curso_ojt: 0
  };

  return (
    <div className="executive-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden', marginBottom: 0, padding: '1rem 1.25rem' }}>
      
      {/* HEADER */}
      <div className="card-header-exec" style={{ marginBottom: '1.25rem' }}>
        <div>
          <h2 className="card-title-exec" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} color="#1e6fc0" />
            Embudo Ejecutivo de Conversión: OJT a Operaciones (I-OP)
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
            Flujo de conversión real desde el ingreso a capacitación hasta la graduación a operaciones.
          </p>
        </div>
        <span className="badge-exec badge-blue">Flujo de Conversión</span>
      </div>

      {/* 3 TARJETAS KPI DE ETAPAS CLAVE */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
        
        {/* PASO 1: INGRESARON A OJT */}
        <div style={{
          background: 'linear-gradient(135deg, #f0f7ff 0%, #e0eefe 100%)',
          padding: '1.25rem', borderRadius: '12px', border: '1px solid #bae6fd',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              1. Ingresaron a OJT
            </span>
            <Users size={18} color="#0284c7" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f1c2e', fontFamily: 'Outfit, sans-serif' }}>
            {f.total_ingresaron_ojt.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 600 }}>
            100% de la Base Evaluada
          </span>
        </div>

        {/* PASO 2: BAJAS EN OJT */}
        <div style={{
          background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
          padding: '1.25rem', borderRadius: '12px', border: '1px solid #fecdd3',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#9f1239', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              2. Bajas en OJT
            </span>
            <UserX size={18} color="#e11d48" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#9f1239', fontFamily: 'Outfit, sans-serif' }}>
            {f.total_bajas_ojt.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#e11d48', fontWeight: 700 }}>
            {f.pct_bajas_ojt}% de Atrición Pre-Operativa
          </span>
        </div>

        {/* PASO 3: EGRESADOS A OPERACIÓN (I-OP) */}
        <div style={{
          background: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)',
          padding: '1.25rem', borderRadius: '12px', border: '1px solid #99f6e4',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              3. Ingresos Únicos a Operación (I-OP)
            </span>
            <CheckCircle2 size={18} color="#0d9488" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f766e', fontFamily: 'Outfit, sans-serif' }}>
            {f.total_egresados_op.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#0d9488', fontWeight: 700 }}>
            {f.pct_egresados_op}% Graduación Efectiva
          </span>
        </div>

      </div>

      {/* DIAGRAMA VISUAL DE EMBUDO RECTANGULAR DE ALTA PRECISIÓN */}
      <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
        
        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Zap size={16} color="#d97706" /> Diagrama de Flujo de Conversión Directa
        </h4>

        {/* Nivel 1 */}
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.25rem' }}>
            <span>🔵 Ingresaron a OJT</span>
            <span>{f.total_ingresaron_ojt} Asesores (100%)</span>
          </div>
          <div style={{ background: '#e2e8f0', borderRadius: '8px', height: '24px', overflow: 'hidden' }}>
            <div style={{ width: '100%', height: '100%', background: '#0284c7', transition: 'width 0.4s ease' }} />
          </div>
        </div>

        {/* Nivel 2: Bajas */}
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.25rem' }}>
            <span style={{ color: '#dc2626' }}>🔴 Bajas Retiradas / Cesadas</span>
            <span style={{ color: '#dc2626' }}>{f.total_bajas_ojt} Asesores ({f.pct_bajas_ojt}%)</span>
          </div>
          <div style={{ background: '#e2e8f0', borderRadius: '8px', height: '24px', overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(f.pct_bajas_ojt, 100)}%`, height: '100%', background: '#e11d48', transition: 'width 0.4s ease' }} />
          </div>
        </div>

        {/* Nivel 3: Operaciones */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.25rem' }}>
            <span style={{ color: '#0d9488' }}>🟢 Egresados a Operaciones (I-OP)</span>
            <span style={{ color: '#0d9488' }}>{f.total_egresados_op} Asesores ({f.pct_egresados_op}%)</span>
          </div>
          <div style={{ background: '#e2e8f0', borderRadius: '8px', height: '24px', overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(f.pct_egresados_op, 100)}%`, height: '100%', background: '#0d9488', transition: 'width 0.4s ease' }} />
          </div>
        </div>

      </div>

    </div>
  );
}
