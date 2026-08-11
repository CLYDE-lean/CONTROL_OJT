import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DecisionModal from './components/DecisionModal';
import { fetchDashboardResumen, registrarDecisionOperativa } from './services/apiService';
import { CheckCircle2, RefreshCw } from 'lucide-react';

import ErrorBoundary from './components/ErrorBoundary';
import Embudo5DiasView        from './components/Embudo5DiasView';
import ControlOperativoTabla  from './components/ControlOperativoTabla';
import FormadorView           from './components/FormadorView';
import GerenciaView           from './components/GerenciaView';
import ExcelFlashOjtView      from './components/ExcelFlashOjtView';
import ScatterVolumenVsCalidad from './components/ScatterVolumenVsCalidad';
import DistribucionAtencionesView from './components/DistribucionAtencionesView';
import ReglasDeOroCard        from './components/ReglasDeOroCard';
import FiltroFlotantePro      from './components/FiltroFlotantePro';

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
    setTimeout(() => {
      const el = document.getElementById('funnel-d1-d8-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleNavegarAOperacion = () => {
    setVistaActiva('supervisor');
    setSubVistaOperacion('ranking');
    setTimeout(() => {
      const el = document.getElementById('flash-ojt-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  };

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const res = await fetchDashboardResumen(filtros);
      setData(res);
    } catch (err) {
      console.error('Error al cargar datos:', err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarDatos(); }, [filtros]);

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

  return (
    <div className="app-container">

      {/* ── Navbar con Pestañas ── */}
      <Navbar
        vistaActiva={vistaActiva}
        onCambiarVista={setVistaActiva}
        totalDecisionesPendientes={totalPendientes}
        dbConnected={data?.success || false}
      />

      {/* ── Toast ── */}
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

      {/* ── Subheader con Título Principal Destacado y Botón Actualizar ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', marginTop: '0.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ 
            fontSize: '1.85rem', 
            fontWeight: 800, 
            color: 'var(--text-primary)', 
            fontFamily: 'var(--font-heading)', 
            letterSpacing: '-0.03em',
            lineHeight: 1.15
          }}>
            Control de Formación y Retención OJT
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
            <span className="badge-exec badge-blue" style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem', fontWeight: 700 }}>
              { vistaActiva === 'supervisor' && 'Panel de Supervisión Operativa' }
              { vistaActiva === 'formador'   && 'Panel de Formadores' }
              { vistaActiva === 'gerencia'   && 'Panel Gerencial' }
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
              <strong style={{ color: 'var(--accent-primary)' }}>{data?.embudo?.total_asesores_unicos?.toLocaleString() || '–'} asesores únicos</strong> en base · {new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </div>
        </div>
        <button onClick={cargarDatos} className="btn-exec touch-target" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.95rem' }}>
          <RefreshCw size={14} className={cargando ? 'spin' : ''} />
          Actualizar
        </button>
      </div>

      {/* ── Contenido de cada pestaña ── */}
      <div style={{ opacity: cargando ? 0.7 : 1, transition: 'opacity 0.25s ease' }}>

        {/* ── PESTAÑA: SUPERVISOR (OPERACIÓN) ── */}
        {vistaActiva === 'supervisor' && (
          <ErrorBoundary>
            {/* Gráfico 1 al 8 de Conversión */}
            <div id="funnel-d1-d8-section" style={{ marginBottom: '1.75rem' }}>
              <Embudo5DiasView embudoData={data?.embudo} />
            </div>

            {/* 📈 Scatter Plot & Distribución de Atenciones */}
            <div className="grid-2" style={{ gap: '1.25rem', marginBottom: '1.75rem' }}>
              <ScatterVolumenVsCalidad data={data} />
              <DistribucionAtencionesView data={data} />
            </div>

            {/* 📊 SECCIÓN EXCEL FLASH OJT E INDICADORES PONDERADOS (EXCLUSIVO EN OPERACIÓN) */}
            <div id="flash-ojt-section" style={{ marginBottom: '1.75rem' }}>
              <ExcelFlashOjtView filters={filtros} />
            </div>

            {/* Sub-Tabs Internos de Operación: Ranking Operativo vs Evolución Diaria */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '0.5rem'
            }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setSubVistaOperacion('ranking')}
                  className="touch-target"
                  style={{
                    padding: '0.4rem 0.85rem',
                    fontSize: '0.8rem',
                    fontWeight: subVistaOperacion === 'ranking' ? 700 : 500,
                    color: subVistaOperacion === 'ranking' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    background: subVistaOperacion === 'ranking' ? 'var(--accent-primary-subtle)' : 'transparent',
                    border: `1px solid ${subVistaOperacion === 'ranking' ? 'rgba(30, 111, 192, 0.25)' : 'transparent'}`,
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer'
                  }}
                >
                  Ranking Operativo
                </button>
                <button
                  onClick={() => setSubVistaOperacion('evolucion')}
                  className="touch-target"
                  style={{
                    padding: '0.4rem 0.85rem',
                    fontSize: '0.8rem',
                    fontWeight: subVistaOperacion === 'evolucion' ? 700 : 500,
                    color: subVistaOperacion === 'evolucion' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    background: subVistaOperacion === 'evolucion' ? 'var(--accent-primary-subtle)' : 'transparent',
                    border: `1px solid ${subVistaOperacion === 'evolucion' ? 'rgba(30, 111, 192, 0.25)' : 'transparent'}`,
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer'
                  }}
                >
                  Evolución Diaria (D1-D8)
                </button>
              </div>
            </div>

            {/* Tabla de Control Operativo con Scorecard / Heatmap */}
            <div style={{ marginBottom: '2rem' }}>
              <ControlOperativoTabla
                asesores={data?.matriz?.asesores}
                onEjecutarDecision={handleAbrirModal}
                modoVista={subVistaOperacion}
              />
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
            <GerenciaView 
              data={data} 
              roiData={data?.roi} 
              filtros={filtros} 
              onNavegarAOperacion={handleNavegarAOperacion}
            />
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

      {/* ── Filtro Flotante FAB en Cascada Auto-Excluyente (Sticky / Fixed) ── */}
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
