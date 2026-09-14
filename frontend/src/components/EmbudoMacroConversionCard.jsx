import React from 'react';
import { TrendingUp } from 'lucide-react';

/**
 * Componente Tarjeta Independiente: Embudo Macro de Conversión
 * Muestra el flujo general de conversión: Capacitación ➔ OJT ➔ Operación en barras horizontales.
 */
export default function EmbudoMacroConversionCard({ embudoData = {} }) {
  const totalCapacitacion = embudoData?.total_asesores_unicos || 0;
  const totalOjt = embudoData?.dias_principales_1_8?.find(d => d.dia === 1)?.activos || 0;
  const totalOperacion = embudoData?.supervivencia?.llegaron_op || 0;

  const pctOjt = totalCapacitacion > 0 ? Math.round((totalOjt / totalCapacitacion) * 100) : 0;
  const pctOpGlobal = totalCapacitacion > 0 ? Math.round((totalOperacion / totalCapacitacion) * 100) : 0;
  const pctOpConversion = totalOjt > 0 ? Math.round((totalOperacion / totalOjt) * 100) : 0;

  const steps = [
    {
      id: 1,
      label: '1. CAPACITACIÓN',
      sub: 'Iniciaron Curso',
      valor: totalCapacitacion,
      pctBarra: 100,
      badge: '100% Base',
      color: '#6366f1',
      bgGradient: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
      glow: 'rgba(99, 102, 241, 0.25)'
    },
    {
      id: 2,
      label: '2. PASARON A OJT',
      sub: 'Ingresaron a Día 1 OJT',
      valor: totalOjt,
      pctBarra: pctOjt,
      badge: `${pctOjt}% Conversión`,
      color: '#1e6fc0',
      bgGradient: 'linear-gradient(90deg, #1e6fc0 0%, #38bdf8 100%)',
      glow: 'rgba(30, 111, 192, 0.25)'
    },
    {
      id: 3,
      label: '3. INGRESARON A OPERACIÓN',
      sub: 'Graduados I-OP',
      valor: totalOperacion,
      pctBarra: pctOpGlobal,
      badge: `${pctOpGlobal}% Retención Final (${pctOpConversion}% de OJT)`,
      color: '#0d9488',
      bgGradient: 'linear-gradient(90deg, #0d9488 0%, #34d399 100%)',
      glow: 'rgba(13, 148, 136, 0.25)'
    }
  ];

  return (
    <div className="executive-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden', padding: '0.85rem 1.1rem', marginBottom: 0 }}>
      
      {/* Header Independiente de la Tarjeta */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', paddingBottom: '0.45rem', borderBottom: '1px solid #edf2f7', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={15} style={{ color: '#0284c7' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f1c2e', fontFamily: 'Outfit, sans-serif', margin: 0 }}>
              Embudo Macro de Conversión
            </h2>
            <p style={{ fontSize: '0.72rem', color: '#7a90ad', marginTop: '0.05rem', margin: 0 }}>
              Flujo General: Capacitación ➔ OJT ➔ Operación
            </p>
          </div>
        </div>

        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#0284c7', background: '#f0f9ff', padding: '2px 8px', borderRadius: '10px', border: '1px solid #bae6fd' }}>
          ● Flujo Global
        </span>
      </div>

      {/* Lista de Barras Echadas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, justifyContent: 'center' }}>
        {steps.map((st) => (
          <div key={st.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            {/* Fila Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: st.color, letterSpacing: '0.02em' }}>
                  {st.label}
                </span>
                <span style={{ fontSize: '0.64rem', color: '#64748b', fontWeight: 500 }}>
                  ({st.sub})
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f1c2e', fontFamily: 'Outfit, sans-serif' }}>
                  {st.valor.toLocaleString()}
                </span>
                <span style={{
                  fontSize: '0.64rem',
                  fontWeight: 700,
                  color: st.color,
                  background: '#ffffff',
                  border: `1px solid ${st.color}30`,
                  padding: '1px 7px',
                  borderRadius: '10px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                }}>
                  {st.badge}
                </span>
              </div>
            </div>

            {/* Pista de Barra */}
            <div style={{
              position: 'relative',
              width: '100%',
              height: '10px',
              background: '#e2e8f0',
              borderRadius: '5px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${st.pctBarra}%`,
                height: '100%',
                background: st.bgGradient,
                borderRadius: '5px',
                boxShadow: `0 0 8px ${st.glow}`,
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
