import React from 'react';
import { Users, Award, TrendingUp, AlertTriangle } from 'lucide-react';
import AutoFitStage from './AutoFitStage';
import ScatterVolumenVsCalidad from './ScatterVolumenVsCalidad';
import EstadoFinalGrupoFormador from './EstadoFinalGrupoFormador';
import ExcelFlashOjtView from './ExcelFlashOjtView';

export default function FormadorView({ data, filtros, onAbrirModal, onNavegarDetalle }) {
  const embudo = data?.embudo;
  const listAsesores = data?.matriz?.asesores || [];
  
  // Total viene del backend. Sin datos del backend = 0 (nunca número estático)
  const total = embudo?.total_asesores_unicos || listAsesores.length || 0;
  const egresadosOp = listAsesores.length > 0
    ? listAsesores.filter(a => {
        const r = (a.resultado_evaluacion || a.estado_actual || a.accion_recomendada || '').toUpperCase();
        return r.includes('APROBADO') || r.includes('EGRESADO') || r.includes('OPERACI') || a.es_iop === 1;
      }).length
    : (embudo?.flujo?.total_egresados_op ?? data?.flujo?.total_egresados_op ?? 0);
  
  const bajas = total - egresadosOp;
  const tasaOp = total > 0 ? Math.round((egresadosOp / total) * 100) : 0;

  return (
    <AutoFitStage>
      <div className="formador-layout">
        {/* ── Fila 1 (Auto): KPIs del Formador Seleccionado ── */}
        <div className="kpi-header-grid">
          {/* Card 1: TOTAL INGRESARON */}
          <div className="kpi-card" style={{ 
            position: 'relative', 
            overflow: 'hidden', 
            borderLeft: '4px solid #1e6fc0', 
            padding: '10px 14px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.01em' }}>TOTAL INGRESARON</span>
              <Users size={16} style={{ color: '#1e6fc0' }} />
            </div>
            <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0f1c2e', fontFamily: 'Outfit, sans-serif', lineHeight: 1.1, margin: '3px 0', zIndex: 1 }}>
              {total.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#7a90ad', fontWeight: 500, zIndex: 1 }}>
              en día 1
            </div>
            <Users size={70} style={{ position: 'absolute', right: '-12px', bottom: '-15px', color: '#1e6fc0', opacity: 0.09, pointerEvents: 'none' }} />
          </div>

          {/* Card 2: INGRESARON A OPERACIÓN (I-OP) */}
          <div className="kpi-card" style={{ 
            position: 'relative', 
            overflow: 'hidden', 
            borderLeft: '4px solid #0d9488', 
            padding: '10px 14px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.01em' }}>INGRESARON A OPERACIÓN (I-OP)</span>
              <Award size={16} style={{ color: '#0d9488' }} />
            </div>
            <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0f1c2e', fontFamily: 'Outfit, sans-serif', lineHeight: 1.1, margin: '3px 0', zIndex: 1 }}>
              {egresadosOp.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.73rem', color: '#7a90ad', fontWeight: 500, zIndex: 1 }}>
              personas únicas por DNI ({tasaOp}%)
            </div>
            <Award size={70} style={{ position: 'absolute', right: '-12px', bottom: '-15px', color: '#0d9488', opacity: 0.09, pointerEvents: 'none' }} />
          </div>

          {/* Card 3: BAJAS OJT */}
          <div className="kpi-card" style={{ 
            position: 'relative', 
            overflow: 'hidden', 
            borderLeft: '4px solid #dc2626', 
            padding: '10px 14px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.01em' }}>BAJAS OJT</span>
              <AlertTriangle size={16} style={{ color: '#dc2626' }} />
            </div>
            <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0f1c2e', fontFamily: 'Outfit, sans-serif', lineHeight: 1.1, margin: '3px 0', zIndex: 1 }}>
              {bajas.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#7a90ad', fontWeight: 500, zIndex: 1 }}>
              no llegaron a D5
            </div>
            <AlertTriangle size={75} style={{ position: 'absolute', right: '-10px', bottom: '-16px', color: '#dc2626', opacity: 0.1, pointerEvents: 'none' }} />
          </div>

          {/* Card 4: TASA DE RETENCIÓN */}
          <div className="kpi-card" style={{ 
            position: 'relative', 
            overflow: 'hidden', 
            borderLeft: '4px solid #4f46e5', 
            padding: '10px 14px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.01em' }}>TASA DE RETENCIÓN</span>
              <TrendingUp size={16} style={{ color: '#4f46e5' }} />
            </div>
            <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0f1c2e', fontFamily: 'Outfit, sans-serif', lineHeight: 1.1, margin: '3px 0', zIndex: 1 }}>
              {tasaOp}%
            </div>
            <div style={{ fontSize: '0.74rem', color: '#7a90ad', fontWeight: 500, zIndex: 1 }}>
              meta al día 5: 55%
            </div>
            <TrendingUp size={75} style={{ position: 'absolute', right: '-10px', bottom: '-16px', color: '#4f46e5', opacity: 0.09, pointerEvents: 'none' }} />
          </div>
        </div>

        {/* ── Fila 2 (1fr): Grid Asimétrico Espacioso 2 Columnas (Matriz a la Izquierda) ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.38fr 1fr',
          gap: '12px',
          height: '100%',
          minHeight: 0
        }}>
          {/* Columna Izquierda Destacada: Matriz de Desempeño (Volumen vs. Calidad) */}
          <div className="chart-wrapper-flex chart-card-scatter" style={{ height: '100%', minHeight: 0 }}>
            <ScatterVolumenVsCalidad data={data} />
          </div>

          {/* Columna Derecha: Estado Final + Indicadores Excel Flash OJT */}
          <div style={{
            display: 'grid',
            gridTemplateRows: '1fr 1fr',
            gap: '12px',
            height: '100%',
            minHeight: 0
          }}>
            <div className="chart-wrapper-flex chart-card-heatmap" style={{ height: '100%', minHeight: 0 }}>
              <EstadoFinalGrupoFormador data={data} />
            </div>
            <div className="chart-wrapper-flex chart-card-excel" style={{ height: '100%', minHeight: 0 }}>
              <ExcelFlashOjtView filters={filtros} />
            </div>
          </div>
        </div>
      </div>
    </AutoFitStage>
  );
}

