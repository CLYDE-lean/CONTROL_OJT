import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import DecisionModal from './components/DecisionModal';
import { fetchDashboardResumen, registrarDecisionOperativa } from './services/apiService';
import { CheckCircle2, RefreshCw, Users, Award, AlertTriangle, TrendingUp, Zap, Target, PhoneCall } from 'lucide-react';

import ErrorBoundary from './components/ErrorBoundary';
import AutoFitStage from './components/AutoFitStage';
import Embudo5DiasView        from './components/Embudo5DiasView';
import ControlOperativoTabla  from './components/ControlOperativoTabla';
import FormadorView           from './components/FormadorView';
import GerenciaView           from './components/GerenciaView';
import RankingFormadoresView  from './components/RankingFormadoresView';
import FiltroFlotantePro      from './components/FiltroFlotantePro';
import ScatterVolumenVsCalidad from './components/ScatterVolumenVsCalidad';
import FlashOjtResumenCard    from './components/FlashOjtResumenCard';
import ExcelFlashOjtView      from './components/ExcelFlashOjtView';
import CurvaAprendizajeSemana from './components/CurvaAprendizajeSemana';
import TendenciaHistoricaView  from './components/TendenciaHistoricaView';
import RealtimeBadge          from './components/RealtimeBadge';
import useRealtimeSync        from './hooks/useRealtimeSync';

// ── Gráficos SVG para Tarjetas KPI Horizontales (Adaptación de Maqueta Oficial) ──

function RadialGaugeArc({ pct = 75, color = '#0d9488', size = 62 }) {
  const radius = 22;
  const circumference = Math.PI * radius;
  const fillVal = Math.min(100, Math.max(0, parseFloat(pct) || 0)) / 100;
  const dashOffset = circumference * (1 - fillVal);

  return (
    <div style={{ position: 'relative', width: size, height: size * 0.58, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <svg width={size} height={size * 0.56} viewBox="0 0 56 30">
        <path
          d="M 6,26 A 22,22 0 0,1 50,26"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <path
          d="M 6,26 A 22,22 0 0,1 50,26"
          fill="none"
          stroke={color}
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
        />
      </svg>
      <div style={{
        position: 'absolute',
        bottom: 0,
        fontSize: '0.66rem',
        fontWeight: 800,
        color: color,
        lineHeight: 1
      }}>
        {pct}%
      </div>
    </div>
  );
}

function ScoreDonutRing({ score = 66.8, size = 54 }) {
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} viewBox="0 0 40 40">
        <circle
          cx="20" cy="20" r="15"
          fill="transparent"
          stroke="#f59e0b"
          strokeWidth="3.6"
          strokeDasharray="18.8 75.3"
          strokeDashoffset="25"
        />
        <circle
          cx="20" cy="20" r="15"
          fill="transparent"
          stroke="#0d9488"
          strokeWidth="3.6"
          strokeDasharray="37.7 56.5"
          strokeDashoffset="6.2"
        />
        <circle
          cx="20" cy="20" r="15"
          fill="transparent"
          stroke="#10b981"
          strokeWidth="3.6"
          strokeDasharray="37.7 56.5"
          strokeDashoffset="-31.5"
        />
      </svg>
      <div style={{ position: 'absolute', textAlign: 'center', lineHeight: 1 }}>
        <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#4f46e5', display: 'block' }}>{score}%</span>
        <span style={{ fontSize: '0.5rem', color: '#7a90ad', textTransform: 'uppercase', fontWeight: 700 }}>score</span>
      </div>
    </div>
  );
}

function TrendAreaSparkline({ color = '#1e6fc0', width = 68, height = 34 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 68 34" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="gradKpiTransf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d="M 0,28 Q 14,32 22,16 T 44,20 T 68,5 L 68,34 L 0,34 Z" fill="url(#gradKpiTransf)" />
      <path d="M 0,28 Q 14,32 22,16 T 44,20 T 68,5" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <circle cx="68" cy="5" r="2.5" fill={color} />
    </svg>
  );
}

export default function App() {
  const [vistaActiva, setVistaActiva] = useState('supervisor');
  const [filtros, setFiltros] = useState({
    semana: '',
    periodo: '',
    campana: '',
    formador: '',
    grupo: '',
    segmento: '',
    modalidad: '',
    estado: ''
  });
  const [data, setData] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [modalDecision, setModalDecision] = useState(null);
  const [toast, setToast] = useState(null);

  const [subVistaOperacion, setSubVistaOperacion] = useState('ranking'); // 'ranking' | 'evolucion'
  const [filtroTablaInicial, setFiltroTablaInicial] = useState('');

  const handleAuditarCaidasEnTabla = () => {
    setFiltroTablaInicial('DESCONEXION');
    setSubVistaOperacion('evolucion');
  };

  const handleFiltroChange = (key, value) => {
    setFiltros(prev => ({ ...prev, [key]: value }));
  };

  const handleLimpiarFiltros = () => {
    setFiltros({
      semana: '',
      periodo: '',
      campana: '',
      formador: '',
      grupo: '',
      segmento: '',
      modalidad: '',
      estado: ''
    });
  };

  const handleNavegarADetalle = () => {
    setVistaActiva('supervisor');
    setSubVistaOperacion('evolucion');
  };

  const handleNavegarAOperacion = () => {
    setVistaActiva('supervisor');
    setSubVistaOperacion('ranking');
  };

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      const res = await fetchDashboardResumen(filtros);
      setData(res);
    } catch (err) {
      console.error('Error al cargar datos:', err);
    } finally {
      setCargando(false);
    }
  }, [filtros]);

  useEffect(() => { cargarDatos(); }, [filtros]);

  // ── Realtime: escucha cambios en CONTROL y recarga automáticamente ──
  const { wsStatus, lastUpdate, pendingUpdate, eventCount, dismissUpdate, forceRefresh } = useRealtimeSync({
    onRefresh: cargarDatos,
    tables: ['CONTROL'],
    enabled: true,
  });

  const handleAbrirModal = (documento, accion, nombre) => setModalDecision({ documento, accion, nombre });

  const handleConfirmarDecision = async (decisionData) => {
    setModalDecision(null);
    const res = await registrarDecisionOperativa(decisionData);
    if (res.success) {
      setToast({ mensaje: res.message || 'Decisión registrada correctamente.' });
      setTimeout(() => setToast(null), 3500);
      cargarDatos();
    }
  };

  const totalPendientes = data?.matriz?.resumen
    ? (data.matriz.resumen.corte_preventivo || 0) + (data.matriz.resumen.candidatos_extension || 0)
    : 0;

  // Cálculos reactivos de los 3 Indicadores Operativos Oficiales (KPI 1, KPI 2, KPI 3) + Score Ponderado
  // NOTA: Sin datos del backend, los valores son 0 — nunca se usan números estáticos de relleno.
  const embudo = data?.embudo;
  const asesoresList = data?.matriz?.asesores || [];
  const total = embudo?.total_asesores_unicos || asesoresList.length || 0;
  const countAsesores = asesoresList.length;

  const avgTransf = countAsesores > 0 
    ? Math.round((asesoresList.reduce((acc, a) => acc + (parseFloat(a.transferencia_pct) || 0), 0) / countAsesores) * 10) / 10
    : 0;

  const avgTnps = countAsesores > 0 
    ? Math.round((asesoresList.reduce((acc, a) => acc + (parseFloat(a.tnps_pct) || 0), 0) / countAsesores) * 10) / 10
    : 0;

  const avgCalidad = countAsesores > 0 
    ? Math.round((asesoresList.reduce((acc, a) => acc + (parseFloat(a.calidad_pct) || 0), 0) / countAsesores) * 10) / 10
    : 0;

  const scorePonderado = countAsesores > 0
    ? Math.round(((avgTransf * 0.20) + (avgTnps * 0.40) + (avgCalidad * 0.40)) * 10) / 10
    : 0;

  return (
    <div className="dashboard-container">

      {/* ── Navbar & Contexto Global (Fila 1: auto) ── */}
      <div className="top-bar-wrapper" style={{ position: 'relative' }}>
        <Navbar
          vistaActiva={vistaActiva}
          onCambiarVista={setVistaActiva}
          totalDecisionesPendientes={totalPendientes}
          dbConnected={data?.success || false}
          onActualizar={cargarDatos}
          cargando={cargando}
          totalAsesores={total}
          filtros={filtros}
          onRemoverFiltro={(k) => handleFiltroChange(k, '')}
          onLimpiarFiltros={handleLimpiarFiltros}
        />
        {/* Badge Realtime flotante en esquina superior izquierda del navbar */}
        <div style={{ position: 'absolute', top: '50%', left: '460px', transform: 'translateY(-50%)', zIndex: 10 }}>
          <RealtimeBadge
            wsStatus={wsStatus}
            lastUpdate={lastUpdate}
            pendingUpdate={pendingUpdate}
            eventCount={eventCount}
            onDismiss={dismissUpdate}
            onForceRefresh={forceRefresh}
          />
        </div>
      </div>

      {/* ── Toast Flotante ── */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px',
          background: '#ffffff', border: '1px solid var(--accent-success)',
          color: '#0f1c2e', padding: '0.75rem 1.25rem',
          borderRadius: 'var(--radius-md)', boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          zIndex: 2000, display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem'
        }}>
          <CheckCircle2 size={16} style={{ color: 'var(--accent-success)' }} />
          {toast.mensaje}
        </div>
      )}

      {/* ── Canvas Principal de la Vista (Fila 2: 1fr - Single-Pane) ── */}
      <div className="vista-content" style={{ opacity: cargando ? 0.75 : 1, transition: 'opacity 0.2s ease' }}>

        {/* ── PESTAÑA: OPERACIÓN / SUPERVISOR ── */}
        {vistaActiva === 'supervisor' && (
          <ErrorBoundary>
            <AutoFitStage>
              <div className="operacion-layout">
                {/* Fila 1 (Auto): KPIs Summary Header + Sub-Tabs Switcher */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'center', height: '100%', minHeight: 0 }}>
                  <div className="kpi-header-grid">
                    {/* KPI 1: Transferencia % */}
                    <div className="kpi-card" style={{ borderLeft: '4px solid #1e6fc0', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span className="kpi-subtexto">KPI 1: TRANSFERENCIA</span>
                          <TrendingUp size={13} style={{ color: '#1e6fc0' }} />
                        </div>
                        <div className="kpi-valor" style={{ color: '#1e6fc0' }}>{avgTransf}%</div>
                        <div className="kpi-subtexto">Meta: ≤15.0% · Peso: 20%</div>
                      </div>
                      <div style={{ width: '70px', display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
                        <TrendAreaSparkline color="#1e6fc0" />
                      </div>
                    </div>

                    {/* KPI 2: tNPS % */}
                    <div className="kpi-card" style={{ borderLeft: '4px solid #0d9488', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px' }}>
                      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span className="kpi-subtexto" style={{ fontWeight: 800, color: '#0f1c2e' }}>KPI 2: TNPS %</span>
                          <Award size={13} style={{ color: '#0d9488' }} />
                        </div>
                        <div className="kpi-subtexto">Meta: ≥65.0% · Peso: 40%</div>
                      </div>
                      <div style={{ width: '74px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <RadialGaugeArc pct={avgTnps} color="#0d9488" size={74} />
                      </div>
                    </div>

                    {/* KPI 3: Calidad Emitida % */}
                    <div className="kpi-card" style={{ borderLeft: '4px solid #f59e0b', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px' }}>
                      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span className="kpi-subtexto" style={{ fontWeight: 800, color: '#0f1c2e' }}>KPI 3: CALIDAD EMITIDA</span>
                          <Zap size={13} style={{ color: '#f59e0b' }} />
                        </div>
                        <div className="kpi-subtexto">Meta: ≥75.0% · Peso: 40%</div>
                      </div>
                      <div style={{ width: '74px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <RadialGaugeArc pct={avgCalidad} color="#d97706" size={74} />
                      </div>
                    </div>

                    {/* Score Ponderado Global OJT */}
                    <div className="kpi-card" style={{ borderLeft: '4px solid #4f46e5', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px' }}>
                      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span className="kpi-subtexto" style={{ fontWeight: 800, color: '#0f1c2e' }}>SCORE PONDERADO OJT</span>
                          <Target size={13} style={{ color: '#4f46e5' }} />
                        </div>
                        <div className="kpi-subtexto">{total > 0 ? `${total.toLocaleString()} asesores` : 'Consolidado'}</div>
                      </div>
                      <div style={{ width: '58px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <ScoreDonutRing score={scorePonderado} size={54} />
                      </div>
                    </div>
                  </div>

                  {/* Switcher de Sub-tabs Internos */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '3px',
                    background: 'var(--bg-surface)',
                    padding: '3px 4px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    height: '100%',
                    justifyContent: 'center',
                    boxSizing: 'border-box'
                  }}>
                    <button
                      onClick={() => setSubVistaOperacion('ranking')}
                      className="touch-target"
                      style={{
                        padding: '0.25rem 0.65rem',
                        fontSize: '0.73rem',
                        fontWeight: subVistaOperacion === 'ranking' ? 700 : 500,
                        color: subVistaOperacion === 'ranking' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        background: subVistaOperacion === 'ranking' ? 'var(--accent-primary-subtle)' : 'transparent',
                        border: `1px solid ${subVistaOperacion === 'ranking' ? 'rgba(30, 111, 192, 0.25)' : 'transparent'}`,
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        lineHeight: '1.2'
                      }}
                    >
                      📊 Ranking Operativo
                    </button>
                    <button
                      onClick={() => setSubVistaOperacion('evolucion')}
                      className="touch-target"
                      style={{
                        padding: '0.25rem 0.65rem',
                        fontSize: '0.73rem',
                        fontWeight: subVistaOperacion === 'evolucion' ? 700 : 500,
                        color: subVistaOperacion === 'evolucion' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        background: subVistaOperacion === 'evolucion' ? 'var(--accent-primary-subtle)' : 'transparent',
                        border: `1px solid ${subVistaOperacion === 'evolucion' ? 'rgba(30, 111, 192, 0.25)' : 'transparent'}`,
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        lineHeight: '1.2'
                      }}
                    >
                      📋 Evolución Diaria (D1-D8)
                    </button>
                  </div>
                </div>

                {/* Fila 2 (1fr): Sub-tab activo */}
                {subVistaOperacion === 'ranking' ? (
                  <div className="operacion-ranking-grid">
                    {/* Columna Izquierda: Embudo D1-D8 (Arriba) + Curva de Aprendizaje por Semana (Abajo) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%', minHeight: 0 }}>
                      <div className="chart-card-embudo" style={{ flex: '1.1 1 0', minHeight: '290px', overflow: 'hidden' }}>
                        <Embudo5DiasView embudoData={data?.embudo} onAuditarEnTabla={handleAuditarCaidasEnTabla} />
                      </div>
                      <div className="chart-card-curva" style={{ flex: '1 1 0', minHeight: '260px', overflow: 'hidden' }}>
                        <CurvaAprendizajeSemana data={data} filters={filtros} />
                      </div>
                    </div>

                    {/* Columna Derecha: Ranking de Retención por Formador (Altura Fija Optimizada: 290px + 12px + 260px = 562px) */}
                    <div style={{ height: '562px', maxHeight: '562px', overflow: 'hidden' }}>
                      <RankingFormadoresView filtros={filtros} />
                    </div>
                  </div>
                ) : (
                  <div className="tabla-asesores-wrapper">
                    <ControlOperativoTabla
                      asesores={data?.matriz?.asesores}
                      onEjecutarDecision={handleAbrirModal}
                      modoVista={subVistaOperacion}
                      filtroInicial={filtroTablaInicial}
                    />
                  </div>
                )}
              </div>
            </AutoFitStage>
          </ErrorBoundary>
        )}

        {/* ── PESTAÑA: FORMADOR ── */}
        {vistaActiva === 'formador' && (
          <ErrorBoundary>
            <FormadorView 
              data={data} 
              filtros={filtros} 
              onAbrirModal={handleAbrirModal} 
              onNavegarDetalle={handleNavegarADetalle} 
            />
          </ErrorBoundary>
        )}

        {/* ── PESTAÑA: GERENCIA ── */}
        {vistaActiva === 'gerencia' && (
          <ErrorBoundary>
            <GerenciaView 
              data={data} 
              roiData={data?.roi} 
              filtros={filtros} 
              onNavegarAOperacion={handleNavegarAOperacion}
            />
          </ErrorBoundary>
        )}

        {/* ── PESTAÑA: HISTÓRICO (datos reales Supabase) ── */}
        {vistaActiva === 'historico' && (
          <ErrorBoundary>
            <div style={{ height: '100%', padding: '12px', boxSizing: 'border-box' }}>
              <TendenciaHistoricaView filtros={filtros} />
            </div>
          </ErrorBoundary>
        )}
      </div>

      {/* ── Modal de decisión ── */}
      {modalDecision && (
        <DecisionModal
          modalData={modalDecision}
          onClose={() => setModalDecision(null)}
          onConfirm={handleConfirmarDecision}
        />
      )}

      {/* ── Filtro Flotante FAB (z-index 1000 fixed) ── */}
      <FiltroFlotantePro
        filtros={filtros}
        opciones={data?.filtros_disponibles}
        onFiltroChange={handleFiltroChange}
        onLimpiarFiltros={handleLimpiarFiltros}
        totalFiltrado={data?.embudo?.total_asesores_unicos || 0}
        cargando={cargando}
      />
    </div>
  );
}

