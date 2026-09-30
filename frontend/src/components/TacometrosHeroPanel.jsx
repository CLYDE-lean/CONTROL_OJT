import React from 'react';
import KpiBulletCard from './KpiBulletCard';
import { TrendingUp, Award, Zap, Target, Users } from 'lucide-react';
import { KPI_OFICIALES } from '../utils/kpiOficiales';

/**
 * Panel Hero Ejecutivo: 4 KPIs + Dotación + switcher Ranking/Evolución.
 */
export default function TacometrosHeroPanel({
  avgTransf = 0,
  avgTnps = 0,
  avgCalidad = 0,
  scorePonderado = 0,
  totalAsesores = 0,
  totalFte = 0,
  subtituloIop = null,
  subVistaOperacion = 'ranking',
  onCambiarSubVista
}) {
  return (
    <div className="tacometros-hero-wrapper" style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(5, minmax(0, 1fr)) minmax(130px, 150px)',
      gap: '8px',
      alignItems: 'stretch',
      width: '100%',
      minHeight: '96px',
      height: 'auto',
      flexShrink: 0,
      boxSizing: 'border-box'
    }}>
      {/* ── KPI 1: Transferencia (Meta 75% mayor_mejor; alerta en Obj. 65%) ── */}
      <KpiBulletCard
        titulo="Transferencia"
        peso="20%"
        valor={avgTransf}
        meta={KPI_OFICIALES.transferencia.meta}
        objCump={KPI_OFICIALES.transferencia.objCump}
        unidad="%"
        tipo="mayor_mejor"
        icono={TrendingUp}
      />

      {/* ── KPI 2: tNPS (Meta 73%; alerta Obj. 65%) ── */}
      <KpiBulletCard
        titulo="TNPS"
        peso="40%"
        valor={avgTnps}
        meta={KPI_OFICIALES.tnps.meta}
        objCump={KPI_OFICIALES.tnps.objCump}
        unidad="%"
        tipo="mayor_mejor"
        icono={Award}
      />

      {/* ── KPI 3: Calidad Emitida (Meta 73%; alerta Obj. 65%) ── */}
      <KpiBulletCard
        titulo="Calidad emitida"
        peso="40%"
        valor={avgCalidad}
        meta={KPI_OFICIALES.calidad.meta}
        objCump={KPI_OFICIALES.calidad.objCump}
        unidad="%"
        tipo="mayor_mejor"
        icono={Zap}
      />

      {/* ── KPI 4: Score Ponderado OJT (Meta 75% Aprobado, Obj. Cump 65% Ampliación) ── */}
      <KpiBulletCard
        titulo="Score ponderado"
        peso="Oficial"
        valor={scorePonderado}
        meta={KPI_OFICIALES.score.meta}
        objCump={KPI_OFICIALES.score.objCump}
        unidad="%"
        tipo="mayor_mejor"
        icono={Target}
      />

      <KpiBulletCard
        titulo="Ingreso I-OP"
        peso=""
        valor={totalAsesores}
        unidad="pers."
        extraValor={totalFte}
        extraUnidad="FTE"
        variante="conteo"
        badgeLabel="I-OP"
        subtitulo={subtituloIop || `${Number(totalAsesores || 0).toLocaleString('es-PE')} personas · ${Number(totalFte || 0).toLocaleString('es-PE')} FTE · FT=1 · PT=0.5 · sin dato = FT`}
        icono={Users}
      />

      {/* ── Columna 6: Selector Ejecutivo de Vista (Ranking vs Llamadas & Bajas vs Evolución) ── */}
      <div style={{
        background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
        border: '1px solid rgba(56, 189, 248, 0.2)',
        borderRadius: '12px',
        padding: '6px 8px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: '4px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        boxSizing: 'border-box',
        height: '100%',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <span style={{
          fontSize: '0.62rem',
          fontWeight: 600,
          color: 'var(--text-primary, #f8fafc)',
          textAlign: 'center',
          fontFamily: "'Inter', sans-serif"
        }}>
          Modo de vista
        </span>

        {/* Botón Ranking (Panel Principal con Flash OJT en Curso) */}
        <button
          onClick={() => onCambiarSubVista && onCambiarSubVista('ranking')}
          style={{
            padding: '0.24rem 0.35rem',
            borderRadius: '4px',
            border: subVistaOperacion === 'ranking' ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
            background: subVistaOperacion === 'ranking' ? 'linear-gradient(90deg, rgba(56,189,248,0.28), rgba(34,211,238,0.12))' : 'rgba(255, 255, 255, 0.04)',
            color: subVistaOperacion === 'ranking' ? '#38bdf8' : '#94a3b8',
            fontWeight: 600,
            fontSize: '0.63rem',
            fontFamily: "'Inter', sans-serif",
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            transition: 'all 0.15s ease'
          }}
        >
          <span>Flash OJT / Ranking</span>
        </button>

        {/* Botón Llamadas & Bajas (Apartado Reasignado) */}
        <button
          onClick={() => onCambiarSubVista && onCambiarSubVista('llamadas_bajas')}
          style={{
            padding: '0.24rem 0.35rem',
            borderRadius: '4px',
            border: subVistaOperacion === 'llamadas_bajas' ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.08)',
            background: subVistaOperacion === 'llamadas_bajas' ? 'linear-gradient(90deg, rgba(245,158,11,0.28), rgba(217,119,6,0.12))' : 'rgba(255, 255, 255, 0.04)',
            color: subVistaOperacion === 'llamadas_bajas' ? '#fbbf24' : '#94a3b8',
            fontWeight: 600,
            fontSize: '0.63rem',
            fontFamily: "'Inter', sans-serif",
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            transition: 'all 0.15s ease'
          }}
        >
          <span>Llamadas & Bajas</span>
        </button>

        {/* Botón Evolución */}
        <button
          onClick={() => onCambiarSubVista && onCambiarSubVista('evolucion')}
          style={{
            padding: '0.24rem 0.35rem',
            borderRadius: '4px',
            border: subVistaOperacion === 'evolucion' ? '1px solid #a78bfa' : '1px solid rgba(255, 255, 255, 0.08)',
            background: subVistaOperacion === 'evolucion' ? 'linear-gradient(90deg, rgba(167,139,250,0.28), rgba(56,189,248,0.1))' : 'rgba(255, 255, 255, 0.04)',
            color: subVistaOperacion === 'evolucion' ? '#c4b5fd' : '#94a3b8',
            fontWeight: 600,
            fontSize: '0.63rem',
            fontFamily: "'Inter', sans-serif",
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            transition: 'all 0.15s ease'
          }}
        >
          <span>Evolución</span>
        </button>
      </div>
    </div>
  );
}
