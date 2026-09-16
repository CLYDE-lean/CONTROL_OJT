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
import ImpactoLock            from './components/ImpactoLock';
import RankingFormadoresView  from './components/RankingFormadoresView';
import FiltroFlotantePro      from './components/FiltroFlotantePro';
import ScatterVolumenVsCalidad from './components/ScatterVolumenVsCalidad';
import FlashOjtResumenCard    from './components/FlashOjtResumenCard';
import ExcelFlashOjtView      from './components/ExcelFlashOjtView';
import CurvaAprendizajeSemana from './components/CurvaAprendizajeSemana';
import TendenciaHistoricaView  from './components/TendenciaHistoricaView';
import RealtimeBadge          from './components/RealtimeBadge';
import useRealtimeSync        from './hooks/useRealtimeSync';
import TacometrosHeroPanel    from './components/TacometrosHeroPanel';
import GraficaLlamadasDiaCard from './components/GraficaLlamadasDiaCard';
import GraficaMotivosBajaCard from './components/GraficaMotivosBajaCard';
import DetalleAuditoriaModal  from './components/DetalleAuditoriaModal';
import BarraContextoFiltros from './components/BarraContextoFiltros';
import CapacidadRysView from './components/CapacidadRysView';
import { verificarAcceso } from './services/accesoImpacto';
import { sumFte } from './utils/fte';
import { personaCohorteKey } from './utils/personaKey';


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
  const [modalAuditoriaOpen, setModalAuditoriaOpen] = useState(false);
  const [drawerFiltrosOpen, setDrawerFiltrosOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const [impactoDesbloqueado, setImpactoDesbloqueado] = useState(false);

  // Si la pestaña ya tenía un acceso vigente, el candado del navbar no debe aparecer.
  useEffect(() => {
    verificarAcceso().then(setImpactoDesbloqueado);
  }, []);

  const [subVistaOperacion, setSubVistaOperacion] = useState('ranking'); // 'ranking' | 'evolucion'
  const [filtroTablaInicial, setFiltroTablaInicial] = useState('');

  const handleAuditarCaidasEnTabla = () => {
    setModalAuditoriaOpen(true);
  };

  const FILTER_CASCADE = ['periodo', 'semana', 'segmento', 'campana', 'grupo'];

  const handleFiltroChange = (key, value) => {
    setFiltros((prev) => {
      const next = { ...prev, [key]: value };
      const idx = FILTER_CASCADE.indexOf(key);
      if (idx >= 0) {
        for (let i = idx + 1; i < FILTER_CASCADE.length; i++) {
          next[FILTER_CASCADE[i]] = '';
        }
      }
      return next;
    });
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
  const ingresaronOp = [];
  const vistosIop = new Set();
  for (const a of asesoresList) {
    if (Number(a.es_iop) !== 1) continue;
    const key = personaCohorteKey(a);
    if (!key || vistosIop.has(key)) continue;
    vistosIop.add(key);
    ingresaronOp.push(a);
  }
  const iopUnicos = ingresaronOp.length || Number(embudo?.supervivencia?.llegaron_op || 0);
  const dotacionFte = ingresaronOp.length > 0 ? sumFte(ingresaronOp) : iopUnicos;
  const kpiAgregado = data?.matriz?.metricas_kpi || {};

  const avgTransf = kpiAgregado.transferencia_pct ?? null;
  const avgTnps = kpiAgregado.tnps_pct ?? null;
  const avgCalidad = kpiAgregado.calidad_pct ?? null;
  const scorePonderado = kpiAgregado.score_ponderado ?? null;

  return (
    <div className="dashboard-container">

      {/* ── Navbar & Contexto Global (Fila 1: auto) ── */}
      <div className="top-bar-wrapper">
        <Navbar
          vistaActiva={vistaActiva}
          onCambiarVista={setVistaActiva}
          totalDecisionesPendientes={totalPendientes}
          dbConnected={data?.success || false}
          onActualizar={cargarDatos}
          totalAsesores={total}
          filtros={filtros}
          onAbrirFiltros={() => setDrawerFiltrosOpen(true)}
          impactoBloqueado={!impactoDesbloqueado}
          statusSlot={(
            <RealtimeBadge
              wsStatus={wsStatus}
              lastUpdate={lastUpdate}
              pendingUpdate={pendingUpdate}
              eventCount={eventCount}
              onDismiss={dismissUpdate}
              onForceRefresh={forceRefresh}
            />
          )}
        />
        {vistaActiva !== 'capacidad' && (
          <BarraContextoFiltros
            filtros={filtros}
            totalAsesores={total}
            onAbrirFiltros={() => setDrawerFiltrosOpen(true)}
            onLimpiarFiltros={handleLimpiarFiltros}
            onRemoverFiltro={(k) => handleFiltroChange(k, '')}
          />
        )}
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
      <div className={`vista-content vista-${vistaActiva}`} style={{ opacity: cargando ? 0.75 : 1, transition: 'opacity 0.2s ease' }}>

        {/* ── PESTAÑA: OPERACIÓN / SUPERVISOR (100% Pantalla Única Ejecutiva) ── */}
        {vistaActiva === 'supervisor' && (
          <ErrorBoundary>
            <div className="operacion-layout">
              {/* Fila 1 (Auto): Hero Panel con Tacómetros Reactivos + Switcher + Selector Cohorte */}
              <TacometrosHeroPanel
                avgTransf={avgTransf}
                avgTnps={avgTnps}
                avgCalidad={avgCalidad}
                scorePonderado={scorePonderado}
                totalAsesores={iopUnicos}
                totalFte={dotacionFte}
                subVistaOperacion={subVistaOperacion}
                onCambiarSubVista={setSubVistaOperacion}
              />

              {/* Fila 2 (1fr): Sub-tab activo */}
              {subVistaOperacion === 'ranking' ? (
                  <div className="operacion-charts-stack">
                    <div className="operacion-mid-charts">
                      <GraficaLlamadasDiaCard filtros={filtros} />
                      <GraficaMotivosBajaCard filtros={filtros} />
                    </div>
                    <div className="operacion-ranking-grid">
                      <div className="operacion-chart-cell">
                        <Embudo5DiasView
                          embudoData={data?.embudo}
                          onAuditarEnTabla={handleAuditarCaidasEnTabla}
                        />
                      </div>
                      <div className="operacion-chart-cell">
                        <RankingFormadoresView filtros={filtros} />
                      </div>
                    </div>
                  </div>
              ) : (
                <div style={{ height: '100%', minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <ControlOperativoTabla
                    asesores={data?.matriz?.asesores}
                    onEjecutarDecision={handleAbrirModal}
                    modoVista={subVistaOperacion}
                    filtroInicial={filtroTablaInicial}
                  />
                </div>
              )}
            </div>
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
            <ImpactoLock onDesbloquear={() => setImpactoDesbloqueado(true)}>
              <GerenciaView
                data={data}
                filtros={filtros}
              />
            </ImpactoLock>
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

        {vistaActiva === 'capacidad' && (
          <ErrorBoundary>
            <CapacidadRysView />
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

      {/* ── Modal de Auditoría Día a Día Flash OJT (16 Columnas) ── */}
      <DetalleAuditoriaModal
        isOpen={modalAuditoriaOpen}
        onClose={() => setModalAuditoriaOpen(false)}
        filtros={filtros}
      />

      {/* ── Drawer de Filtros BI Avanzados (Sin botón flotante que tape la tabla) ── */}
      <FiltroFlotantePro
        filtros={filtros}
        opciones={data?.filtros_disponibles}
        onFiltroChange={handleFiltroChange}
        onLimpiarFiltros={handleLimpiarFiltros}
        totalFiltrado={data?.embudo?.total_asesores_unicos || 0}
        cargando={cargando}
        abierto={drawerFiltrosOpen}
        onToggle={setDrawerFiltrosOpen}
      />
    </div>
  );
}
