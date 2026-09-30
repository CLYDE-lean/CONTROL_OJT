import React, { useState, useMemo } from 'react';
import { personaCohorteKey } from '../utils/personaKey';
import { calcularNotaPonderadaOjt, ESCALA_CONDICION_OJT } from '../utils/kpiOficiales';

/**
 * Componente: FLASH OJT EN CURSO (Tema Ejecutivo Oscuro Armónico)
 * Optimizado con gráficas amplias y números KPI al doble de tamaño:
 * - Superficie dark glassmorphic (#0d192b / #0f1d33)
 * - Banner integrado con acento ámbar / cyan de alta legibilidad
 * - Slicers de grupo con píldoras de alto contraste
 * - Columna 1: Total Agente + Estado Final (CESADO / ACTIVO con barras prominentes)
 * - Columna 2: Dia Conexion OJT (D1 a D5, >D5, Sin gestión) con barras de 15px
 * - Columna 3: Pre-Proyección Dia 1 OJT (barras de 85px) + KPI Ingresos D1 al doble (3.6rem)
 * - Columna 4: Pre-Proyección Dia 1-2 OJT (barras de 85px) + KPI Ingresos D1-D2 al doble (3.6rem)
 * - Columna 5: Proyección OJT (3-5) (barras de 85px) + KPI Ingresos D3-D5 al doble (3.6rem)
 */
export default function FlashOjtEnCursoCard({ data, filtros = {}, onGrupoSelect }) {
  const rawAsesores = data?.matriz?.asesores || [];

  // 1. Obtener lista única de grupos disponibles
  const gruposDisponibles = useMemo(() => {
    const map = new Map();
    rawAsesores.forEach(a => {
      const g = (a.grupo || '').trim();
      if (g && !g.toUpperCase().startsWith('SIN') && !g.toUpperCase().startsWith('TODO')) {
        map.set(g, (map.get(g) || 0) + 1);
      }
    });
    return Array.from(map.keys()).sort();
  }, [rawAsesores]);

  // Grupo activo (por defecto el que esté en filtros o el primero disponible)
  const [grupoLocal, setGrupoLocal] = useState('');

  const grupoActivo = useMemo(() => {
    if (filtros.grupo && filtros.grupo !== 'TODOS') return filtros.grupo;
    if (grupoLocal && gruposDisponibles.includes(grupoLocal)) return grupoLocal;
    return gruposDisponibles[0] || 'GPE-2026043';
  }, [filtros.grupo, grupoLocal, gruposDisponibles]);

  const handleSelectGrupo = (g) => {
    setGrupoLocal(g);
    if (onGrupoSelect) onGrupoSelect(g);
  };

  // 2. Filtrar asesores del grupo activo (garantizando personas únicas)
  const asesoresGrupo = useMemo(() => {
    const map = new Map();
    rawAsesores.forEach(a => {
      if ((a.grupo || '').trim() === grupoActivo) {
        const key = personaCohorteKey(a);
        if (key && !map.has(key)) {
          map.set(key, a);
        }
      }
    });
    return Array.from(map.values());
  }, [rawAsesores, grupoActivo]);

  const totalAgentes = asesoresGrupo.length || 0;

  // 3. Cálculos de ESTADO FINAL
  const metricasEstadoFinal = useMemo(() => {
    if (totalAgentes === 0) {
      return { cesados: 0, activos: 0, pctCesados: '0,0%', pctActivos: '0,0%', rawPctCesados: 0, rawPctActivos: 0 };
    }
    let cesados = 0;
    asesoresGrupo.forEach(a => {
      const est = (a.estado_actual || a.estado || '').toUpperCase();
      if (a.es_baja === 1 || est.includes('BAJA') || est.includes('CESE') || est.includes('DESAPROB')) {
        cesados++;
      }
    });
    const activos = totalAgentes - cesados;
    const pctCesados = ((cesados / totalAgentes) * 100).toFixed(1).replace('.', ',') + '%';
    const pctActivos = ((activos / totalAgentes) * 100).toFixed(1).replace('.', ',') + '%';
    return {
      cesados,
      activos,
      pctCesados,
      pctActivos,
      rawPctCesados: (cesados / totalAgentes) * 100,
      rawPctActivos: (activos / totalAgentes) * 100
    };
  }, [asesoresGrupo, totalAgentes]);

  // 4. Cálculos de DÍA CONEXIÓN OJT
  const metricasDiaConexion = useMemo(() => {
    const conteos = { d1: 0, d2: 0, d3: 0, d4: 0, d5: 0, dMas: 0, sinGestion: 0 };
    if (totalAgentes === 0) return conteos;

    asesoresGrupo.forEach(a => {
      const dia = Number(a.dia_actual || a.dia_logico_ojt || 0);
      if (dia === 0 || (a.requiere_regularizacion && dia <= 1 && a.es_iop === 0 && a.es_baja === 0)) {
        conteos.sinGestion++;
      } else if (dia === 1) conteos.d1++;
      else if (dia === 2) conteos.d2++;
      else if (dia === 3) conteos.d3++;
      else if (dia === 4) conteos.d4++;
      else if (dia === 5) conteos.d5++;
      else if (dia > 5) conteos.dMas++;
    });

    const fPct = (val) => ((val / totalAgentes) * 100).toFixed(1).replace('.', ',') + '%';

    return {
      d1: { q: conteos.d1, pct: fPct(conteos.d1), rawPct: (conteos.d1 / totalAgentes) * 100 },
      d2: { q: conteos.d2, pct: fPct(conteos.d2), rawPct: (conteos.d2 / totalAgentes) * 100 },
      d3: { q: conteos.d3, pct: fPct(conteos.d3), rawPct: (conteos.d3 / totalAgentes) * 100 },
      d4: { q: conteos.d4, pct: fPct(conteos.d4), rawPct: (conteos.d4 / totalAgentes) * 100 },
      d5: { q: conteos.d5, pct: fPct(conteos.d5), rawPct: (conteos.d5 / totalAgentes) * 100 },
      dMas: { q: conteos.dMas, pct: fPct(conteos.dMas), rawPct: (conteos.dMas / totalAgentes) * 100 },
      sinGestion: { q: conteos.sinGestion, pct: fPct(conteos.sinGestion), rawPct: (conteos.sinGestion) / totalAgentes * 100 }
    };
  }, [asesoresGrupo, totalAgentes]);

  // Función auxiliar de cálculo oficial de Nota Ponderada y Condición OJT (Calidad 40% + TNPS 40% + Transf 20%)
  const getNotaPonderadaOjt = (a) => calcularNotaPonderadaOjt(a.calidad_pct, a.tnps_pct, a.transferencia_pct);

  // 5. Cálculos de PRE-PROYECCIÓN DÍA 1 OJT (Filtro Temprano)
  const proyD1 = useMemo(() => {
    let aprobado = 0, desaprobado = 0, pendiente = 0, sinGestion = 0;
    if (totalAgentes === 0) return { aprobado: 0, desaprobado: 0, pendiente: 0, sinGestion: 0, totalIngresos: 0 };

    asesoresGrupo.forEach(a => {
      const dia = Number(a.dia_actual || a.dia_logico_ojt || 0);
      const nota = getNotaPonderadaOjt(a);

      if (dia === 0) {
        sinGestion++;
      } else if (a.es_baja === 1 || nota < 65.0) {
        // Escala Oficial: 0% a 64.99% = Desaprobado
        desaprobado++;
      } else if (a.es_iop === 1 || nota >= 75.0) {
        // Escala Oficial: 75% a más = Aprobado
        aprobado++;
      } else {
        // Escala Oficial: 65% a 74.99% = Ampliación / Pendiente
        pendiente++;
      }
    });

    const fPct = (val) => ((val / totalAgentes) * 100).toFixed(1).replace('.', ',') + '%';

    return {
      aprobado: { q: aprobado, pct: fPct(aprobado), rawPct: (aprobado / totalAgentes) * 100 },
      desaprobado: { q: desaprobado, pct: fPct(desaprobado), rawPct: (desaprobado / totalAgentes) * 100 },
      pendiente: { q: pendiente, pct: fPct(pendiente), rawPct: (pendiente / totalAgentes) * 100 },
      sinGestion: { q: sinGestion, pct: fPct(sinGestion), rawPct: (sinGestion / totalAgentes) * 100 },
      totalIngresos: aprobado
    };
  }, [asesoresGrupo, totalAgentes]);

  // 6. Cálculos de PRE-PROYECCIÓN DÍA 1-2 OJT (Filtro Intermedio 48h)
  const proyD1D2 = useMemo(() => {
    let aprobado = 0, desaprobado = 0, pendiente = 0, sinGestion = 0;
    if (totalAgentes === 0) return { aprobado: 0, desaprobado: 0, pendiente: 0, sinGestion: 0, totalIngresos: 0 };

    asesoresGrupo.forEach(a => {
      const dia = Number(a.dia_actual || a.dia_logico_ojt || 0);
      const nota = getNotaPonderadaOjt(a);

      if (dia === 0) {
        sinGestion++;
      } else if (a.es_baja === 1 || (dia <= 2 && nota < 65.0 && a.es_iop === 0)) {
        // Escala Oficial: 0% a 64.99% = Desaprobado
        desaprobado++;
      } else if (a.es_iop === 1 || (dia >= 2 && nota >= 75.0)) {
        // Escala Oficial: 75% a más = Aprobado
        aprobado++;
      } else {
        // Escala Oficial: 65% a 74.99% = Ampliación / Pendiente
        pendiente++;
      }
    });

    const fPct = (val) => ((val / totalAgentes) * 100).toFixed(1).replace('.', ',') + '%';

    return {
      aprobado: { q: aprobado, pct: fPct(aprobado), rawPct: (aprobado / totalAgentes) * 100 },
      desaprobado: { q: desaprobado, pct: fPct(desaprobado), rawPct: (desaprobado / totalAgentes) * 100 },
      pendiente: { q: pendiente, pct: fPct(pendiente), rawPct: (pendiente / totalAgentes) * 100 },
      sinGestion: { q: sinGestion, pct: fPct(sinGestion), rawPct: (sinGestion / totalAgentes) * 100 },
      totalIngresos: aprobado
    };
  }, [asesoresGrupo, totalAgentes]);

  // 7. Cálculos de PROYECCIÓN OJT (3-5) (Fase Avanzada de Cierre)
  const proyD3D5 = useMemo(() => {
    let aprobado = 0, desaprobado = 0, pendiente = 0, cesado = 0, sinGestion = 0;
    if (totalAgentes === 0) return { aprobado: 0, desaprobado: 0, pendiente: 0, cesado: 0, sinGestion: 0, totalIngresos: 0 };

    asesoresGrupo.forEach(a => {
      const dia = Number(a.dia_actual || a.dia_logico_ojt || 0);
      const est = (a.estado_actual || a.estado || '').toUpperCase();
      const nota = getNotaPonderadaOjt(a);

      if (dia === 0) {
        sinGestion++;
      } else if (a.es_baja === 1 || est.includes('CESE') || est.includes('BAJA')) {
        cesado++;
      } else if (a.es_iop === 1 || (dia >= 3 && nota >= 75.0)) {
        // Escala Oficial: 75% a más = Aprobado (Egresado OP)
        aprobado++;
      } else if (nota > 0 && nota < 65.0) {
        // Escala Oficial: 0% a 64.99% = Desaprobado
        desaprobado++;
      } else {
        // Escala Oficial: 65% a 74.99% = Ampliación / Pendiente
        pendiente++;
      }
    });

    const fPct = (val) => ((val / totalAgentes) * 100).toFixed(1).replace('.', ',') + '%';

    return {
      aprobado: { q: aprobado, pct: fPct(aprobado), rawPct: (aprobado / totalAgentes) * 100 },
      desaprobado: { q: desaprobado, pct: fPct(desaprobado), rawPct: (desaprobado / totalAgentes) * 100 },
      pendiente: { q: pendiente, pct: fPct(pendiente), rawPct: (pendiente / totalAgentes) * 100 },
      cesado: { q: cesado, pct: fPct(cesado), rawPct: (cesado / totalAgentes) * 100 },
      sinGestion: { q: sinGestion, pct: fPct(sinGestion), rawPct: (sinGestion / totalAgentes) * 100 },
      totalIngresos: aprobado
    };
  }, [asesoresGrupo, totalAgentes]);

  // Paleta armónica integrada con el dashboard dark de GEA Perú
  const GRADIENT_CYAN = 'linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)';
  const GRADIENT_CYAN_V = 'linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)';
  const GRADIENT_EMERALD_V = 'linear-gradient(180deg, #34d399 0%, #059669 100%)';
  const GRADIENT_PURPLE_V = 'linear-gradient(180deg, #a78bfa 0%, #7c3aed 100%)';
  const GRADIENT_ROSE = 'linear-gradient(90deg, #e11d48 0%, #fb7185 100%)';
  const GRADIENT_RED = 'linear-gradient(90deg, #dc2626 0%, #ef4444 100%)';
  const COLOR_MUTED_BAR = 'rgba(148, 163, 184, 0.32)';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100%',
      background: 'linear-gradient(180deg, rgba(17, 27, 46, 0.96) 0%, rgba(11, 19, 34, 0.98) 100%)',
      border: '1px solid rgba(56, 189, 248, 0.22)',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(2, 6, 23, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
      fontFamily: "'Outfit', 'Inter', -apple-system, sans-serif",
      boxSizing: 'border-box'
    }}>

      {/* ── BANNER SUPERIOR ARMÓNICO CON ACENTO ÁMBAR Y CYAN ── */}
      <div style={{
        background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.16) 0%, rgba(15, 23, 42, 0.85) 35%, rgba(15, 23, 42, 0.98) 100%)',
        padding: '6px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(245, 158, 11, 0.25)',
        flexWrap: 'wrap',
        gap: '8px',
        flexShrink: 0
      }}>
        {/* Título Estilizado en Armonía Dark */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{
            background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.25), rgba(217, 119, 6, 0.15))',
            border: '1px solid rgba(245, 158, 11, 0.45)',
            color: '#fbbf24',
            padding: '3px 9px',
            borderRadius: '4px',
            fontSize: '0.72rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            boxShadow: '0 0 10px rgba(245, 158, 11, 0.15)'
          }}>
            FLASH OJT EN CURSO
          </span>
          <span style={{
            fontSize: '0.92rem',
            fontWeight: 800,
            color: '#38bdf8',
            letterSpacing: '0.02em',
            textShadow: '0 0 12px rgba(56, 189, 248, 0.35)'
          }}>
            {grupoActivo}
          </span>
          <span style={{
            fontSize: '0.64rem',
            color: '#94a3b8',
            background: 'rgba(255, 255, 255, 0.04)',
            padding: '2px 8px',
            borderRadius: '4px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{ color: '#10b981', fontWeight: 700 }}>Aprobado ≥75%</span>
            <span style={{ color: '#64748b' }}>·</span>
            <span style={{ color: '#38bdf8', fontWeight: 700 }}>Ampliación 65-74.9%</span>
            <span style={{ color: '#64748b' }}>·</span>
            <span style={{ color: '#f43f5e', fontWeight: 700 }}>Desaprobado &lt;65%</span>
          </span>
        </div>

        {/* Slicers / Botones de grupos */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          overflowX: 'auto',
          maxWidth: '68%',
          paddingBottom: '2px'
        }}>
          {gruposDisponibles.map((g) => {
            const isSelected = g === grupoActivo;
            return (
              <button
                key={g}
                onClick={() => handleSelectGrupo(g)}
                style={{
                  background: isSelected
                    ? 'linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)'
                    : 'rgba(255, 255, 255, 0.05)',
                  color: isSelected ? '#ffffff' : '#94a3b8',
                  border: isSelected ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '4px',
                  padding: '3px 9px',
                  fontSize: '0.67rem',
                  fontWeight: isSelected ? 800 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: isSelected ? '0 0 10px rgba(56, 189, 248, 0.4)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {g}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── PANEL DE 5 COLUMNAS PRINCIPALES (TEMA DARK EJECUTIVO GRANDE) ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(120px, 0.95fr) minmax(140px, 1.2fr) minmax(150px, 1.28fr) minmax(150px, 1.28fr) minmax(170px, 1.45fr)',
        flex: 1,
        minHeight: 0,
        height: '100%',
        background: 'transparent'
      }}>

        {/* ══════════════ COLUMNA 1: TOTAL AGENTE & ESTADO FINAL ══════════════ */}
        <div style={{
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          background: 'rgba(15, 23, 42, 0.4)'
        }}>
          {/* Bloque superior: Total Agente */}
          <div style={{
            padding: '8px 12px 6px 12px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            textAlign: 'center',
            background: 'rgba(30, 41, 59, 0.35)'
          }}>
            <div style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              color: '#94a3b8',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              textAlign: 'left'
            }}>
              Total Agente
            </div>
            {/* NÚMERO GIGANTE TOTAL AGENTE */}
            <div style={{
              fontSize: '3.6rem',
              fontWeight: 900,
              color: '#38bdf8',
              lineHeight: 1,
              marginTop: '4px',
              marginBottom: '4px',
              textShadow: '0 0 20px rgba(56, 189, 248, 0.4)'
            }}>
              {totalAgentes}
            </div>
          </div>

          {/* Bloque inferior: Estado Final */}
          <div style={{
            flex: 1,
            padding: '8px 12px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            background: 'transparent'
          }}>
            <div style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#cbd5e1',
              textAlign: 'center',
              marginBottom: '10px'
            }}>
              Estado Final
            </div>

            {/* Fila CESADO (Barras de mayor altura 20px) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '0.70rem' }}>
              <div style={{ width: '52px', color: '#cbd5e1', fontWeight: 600, textAlign: 'right', lineHeight: 1.1 }}>
                <div>CESADO</div>
                <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>Q = {metricasEstadoFinal.cesados}</div>
              </div>
              <div style={{ flex: 1, background: 'rgba(255, 255, 255, 0.06)', height: '20px', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  width: `${metricasEstadoFinal.rawPctCesados}%`,
                  height: '100%',
                  background: GRADIENT_ROSE,
                  borderRadius: '4px',
                  boxShadow: metricasEstadoFinal.rawPctCesados > 0 ? '0 0 10px rgba(251, 113, 133, 0.4)' : 'none'
                }} />
              </div>
              <div style={{ width: '42px', textAlign: 'left', fontWeight: 800, color: '#fb7185', fontSize: '0.78rem' }}>
                {metricasEstadoFinal.pctCesados}
              </div>
            </div>

            {/* Fila ACTIVO (Barras de mayor altura 20px) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.70rem' }}>
              <div style={{ width: '52px', color: '#cbd5e1', fontWeight: 600, textAlign: 'right', lineHeight: 1.1 }}>
                <div>ACTIVO</div>
                <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>Q = {metricasEstadoFinal.activos}</div>
              </div>
              <div style={{ flex: 1, background: 'rgba(255, 255, 255, 0.06)', height: '20px', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  width: `${metricasEstadoFinal.rawPctActivos}%`,
                  height: '100%',
                  background: GRADIENT_CYAN,
                  borderRadius: '4px',
                  boxShadow: metricasEstadoFinal.rawPctActivos > 0 ? '0 0 10px rgba(56, 189, 248, 0.4)' : 'none'
                }} />
              </div>
              <div style={{ width: '42px', textAlign: 'left', fontWeight: 800, color: '#38bdf8', fontSize: '0.78rem' }}>
                {metricasEstadoFinal.pctActivos}
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════ COLUMNA 2: DIA CONEXION OJT ══════════════ */}
        <div style={{
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '8px 12px',
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(15, 23, 42, 0.25)'
        }}>
          <div style={{
            fontSize: '0.80rem',
            fontWeight: 700,
            color: '#cbd5e1',
            textAlign: 'center',
            marginBottom: '6px'
          }}>
            Dia Conexion OJT
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-around',
            flex: 1,
            gap: '3px'
          }}>
            {[
              { label: 'Dia 1', data: metricasDiaConexion.d1 },
              { label: 'Dia 2', data: metricasDiaConexion.d2 },
              { label: 'Dia 3', data: metricasDiaConexion.d3 },
              { label: 'Dia 4', data: metricasDiaConexion.d4 },
              { label: 'Dia 5', data: metricasDiaConexion.d5 },
              { label: '> Dia 5', data: metricasDiaConexion.dMas },
              { label: 'Sin gestión', data: metricasDiaConexion.sinGestion, isDanger: true }
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.68rem' }}>
                <div style={{ width: '74px', color: '#94a3b8', textAlign: 'right', fontWeight: 600 }}>
                  {item.label} [Q={item.data.q}]
                </div>
                {/* Barras de 15px de alto para visualización amplia */}
                <div style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.06)',
                  height: '15px',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${Math.max(item.data.rawPct, 0)}%`,
                    height: '100%',
                    background: item.isDanger ? GRADIENT_RED : GRADIENT_CYAN,
                    borderRadius: '3px',
                    boxShadow: item.data.rawPct > 0 ? (item.isDanger ? '0 0 8px rgba(239, 68, 68, 0.45)' : '0 0 8px rgba(56, 189, 248, 0.35)') : 'none'
                  }} />
                </div>
                <div style={{
                  width: '38px',
                  textAlign: 'left',
                  fontWeight: 800,
                  color: item.isDanger && item.data.rawPct > 0 ? '#ef4444' : (item.data.rawPct > 0 ? '#38bdf8' : '#64748b'),
                  fontSize: '0.70rem'
                }}>
                  {item.data.pct}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════ COLUMNA 3: PRE-PROYECCIÓN DIA 1 OJT ══════════════ */}
        <div style={{
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(15, 23, 42, 0.35)'
        }}>
          {/* Gráfico de Barras Verticales GRANDES */}
          <div style={{
            flex: 1,
            padding: '8px 10px 4px 10px',
            display: 'flex',
            flexDirection: 'column',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <div style={{
              fontSize: '0.80rem',
              fontWeight: 700,
              color: '#cbd5e1',
              textAlign: 'center',
              marginBottom: '2px'
            }}>
              Pre-Proyección Dia 1 OJT
            </div>

            {/* Barras verticales de hasta 85px de altura */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-around',
              flex: 1,
              paddingTop: '6px',
              paddingBottom: '2px',
              minHeight: '90px'
            }}>
              {[
                { label: 'Aprobado', d: proyD1.aprobado, color: GRADIENT_CYAN_V, textCol: '#38bdf8', glow: 'rgba(56, 189, 248, 0.45)' },
                { label: 'Desaprobado', d: proyD1.desaprobado, color: COLOR_MUTED_BAR, textCol: '#94a3b8' },
                { label: 'Pendiente', d: proyD1.pendiente, color: COLOR_MUTED_BAR, textCol: '#94a3b8' },
                { label: 'Sin gestión', d: proyD1.sinGestion, color: COLOR_MUTED_BAR, textCol: '#94a3b8' }
              ].map((b, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: '23%',
                  height: '100%',
                  justifyContent: 'flex-end'
                }}>
                  {/* Porcentaje grande */}
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: b.textCol, marginBottom: '3px' }}>
                    {b.d.pct}
                  </span>
                  {/* Barra ancha y alta */}
                  <div style={{
                    width: '26px',
                    height: `${Math.max(b.d.rawPct * 0.90, 4)}px`,
                    maxHeight: '85px',
                    background: b.color,
                    borderRadius: '4px 4px 1px 1px',
                    boxShadow: b.glow ? `0 0 12px ${b.glow}` : 'none'
                  }} />
                  <div style={{ textAlign: 'center', fontSize: '0.66rem', marginTop: '4px', lineHeight: 1.15 }}>
                    <div style={{ color: '#cbd5e1', fontWeight: 600 }}>{b.label}</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.62rem' }}>Q = {b.d.q}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tarjeta KPI Inferior Cyan con NÚMERO AL DOBLE DE TAMAÑO */}
          <div style={{
            padding: '6px 10px 8px 10px',
            textAlign: 'center',
            background: 'linear-gradient(180deg, rgba(56, 189, 248, 0.14) 0%, rgba(15, 23, 42, 0.6) 100%)',
            borderTop: '1px solid rgba(56, 189, 248, 0.25)'
          }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#38bdf8' }}>
              Pre-proyección Ingresos Dia 1 OJT
            </div>
            {/* NÚMERO DOBLE DE TAMAÑO (3.6rem) */}
            <div style={{
              fontSize: '3.6rem',
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1,
              marginTop: '2px',
              textShadow: '0 0 20px rgba(56, 189, 248, 0.6)'
            }}>
              {proyD1.totalIngresos}
            </div>
          </div>
        </div>

        {/* ══════════════ COLUMNA 4: PRE-PROYECCIÓN DIA 1-2 OJT ══════════════ */}
        <div style={{
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(15, 23, 42, 0.35)'
        }}>
          {/* Gráfico de Barras Verticales GRANDES */}
          <div style={{
            flex: 1,
            padding: '8px 10px 4px 10px',
            display: 'flex',
            flexDirection: 'column',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <div style={{
              fontSize: '0.80rem',
              fontWeight: 700,
              color: '#cbd5e1',
              textAlign: 'center',
              marginBottom: '2px'
            }}>
              Pre-Proyección Dia 1-2 OJT
            </div>

            {/* Barras verticales de hasta 85px de altura */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-around',
              flex: 1,
              paddingTop: '6px',
              paddingBottom: '2px',
              minHeight: '90px'
            }}>
              {[
                { label: 'Aprobado', d: proyD1D2.aprobado, color: GRADIENT_PURPLE_V, textCol: '#c4b5fd', glow: 'rgba(167, 139, 250, 0.45)' },
                { label: 'Desaprobado', d: proyD1D2.desaprobado, color: COLOR_MUTED_BAR, textCol: '#94a3b8' },
                { label: 'Pendiente', d: proyD1D2.pendiente, color: COLOR_MUTED_BAR, textCol: '#94a3b8' },
                { label: 'Sin gestión', d: proyD1D2.sinGestion, color: COLOR_MUTED_BAR, textCol: '#94a3b8' }
              ].map((b, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: '23%',
                  height: '100%',
                  justifyContent: 'flex-end'
                }}>
                  {/* Porcentaje grande */}
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: b.textCol, marginBottom: '3px' }}>
                    {b.d.pct}
                  </span>
                  {/* Barra ancha y alta */}
                  <div style={{
                    width: '26px',
                    height: `${Math.max(b.d.rawPct * 0.90, 4)}px`,
                    maxHeight: '85px',
                    background: b.color,
                    borderRadius: '4px 4px 1px 1px',
                    boxShadow: b.glow ? `0 0 12px ${b.glow}` : 'none'
                  }} />
                  <div style={{ textAlign: 'center', fontSize: '0.66rem', marginTop: '4px', lineHeight: 1.15 }}>
                    <div style={{ color: '#cbd5e1', fontWeight: 600 }}>{b.label}</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.62rem' }}>Q = {b.d.q}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tarjeta KPI Inferior Púrpura con NÚMERO AL DOBLE DE TAMAÑO */}
          <div style={{
            padding: '6px 10px 8px 10px',
            textAlign: 'center',
            background: 'linear-gradient(180deg, rgba(167, 139, 250, 0.14) 0%, rgba(15, 23, 42, 0.6) 100%)',
            borderTop: '1px solid rgba(167, 139, 250, 0.25)'
          }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#c4b5fd' }}>
              Pre-proyección Ingresos (Dia 1-2)
            </div>
            {/* NÚMERO DOBLE DE TAMAÑO (3.6rem) */}
            <div style={{
              fontSize: '3.6rem',
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1,
              marginTop: '2px',
              textShadow: '0 0 20px rgba(167, 139, 250, 0.6)'
            }}>
              {proyD1D2.totalIngresos}
            </div>
          </div>
        </div>

        {/* ══════════════ COLUMNA 5: PROYECCIÓN OJT (3-5) ══════════════ */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(15, 23, 42, 0.4)'
        }}>
          {/* Gráfico de Barras Verticales GRANDES */}
          <div style={{
            flex: 1,
            padding: '8px 10px 4px 10px',
            display: 'flex',
            flexDirection: 'column',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <div style={{
              fontSize: '0.80rem',
              fontWeight: 700,
              color: '#cbd5e1',
              textAlign: 'center',
              marginBottom: '2px'
            }}>
              Proyección OJT (3-5)
            </div>

            {/* Barras verticales de hasta 85px de altura */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-around',
              flex: 1,
              paddingTop: '6px',
              paddingBottom: '2px',
              minHeight: '90px'
            }}>
              {[
                { label: 'Aprobado', d: proyD3D5.aprobado, color: GRADIENT_EMERALD_V, textCol: '#34d399', glow: 'rgba(52, 211, 153, 0.45)' },
                { label: 'Desaprobado', d: proyD3D5.desaprobado, color: COLOR_MUTED_BAR, textCol: '#94a3b8' },
                { label: 'Pendiente', d: proyD3D5.pendiente, color: COLOR_MUTED_BAR, textCol: '#94a3b8' },
                { label: 'Cesado', d: proyD3D5.cesado, color: 'rgba(251, 113, 133, 0.45)', textCol: '#fb7185' },
                { label: 'Sin gestión', d: proyD3D5.sinGestion, color: COLOR_MUTED_BAR, textCol: '#94a3b8' }
              ].map((b, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: '18%',
                  height: '100%',
                  justifyContent: 'flex-end'
                }}>
                  {/* Porcentaje grande */}
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: b.textCol, marginBottom: '3px' }}>
                    {b.d.pct}
                  </span>
                  {/* Barra ancha y alta */}
                  <div style={{
                    width: '24px',
                    height: `${Math.max(b.d.rawPct * 0.90, 4)}px`,
                    maxHeight: '85px',
                    background: b.color,
                    borderRadius: '4px 4px 1px 1px',
                    boxShadow: b.glow ? `0 0 12px ${b.glow}` : 'none'
                  }} />
                  <div style={{ textAlign: 'center', fontSize: '0.66rem', marginTop: '4px', lineHeight: 1.15 }}>
                    <div style={{ color: '#cbd5e1', fontWeight: 600 }}>{b.label}</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.62rem' }}>Q = {b.d.q}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tarjeta KPI Inferior Esmeralda con NÚMERO AL DOBLE DE TAMAÑO */}
          <div style={{
            padding: '6px 10px 8px 10px',
            textAlign: 'center',
            background: 'linear-gradient(180deg, rgba(52, 211, 153, 0.14) 0%, rgba(15, 23, 42, 0.6) 100%)',
            borderTop: '1px solid rgba(52, 211, 153, 0.25)'
          }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#34d399' }}>
              Proyección Ingresos OJT (3-5)
            </div>
            {/* NÚMERO DOBLE DE TAMAÑO (3.6rem) */}
            <div style={{
              fontSize: '3.6rem',
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1,
              marginTop: '2px',
              textShadow: '0 0 20px rgba(52, 211, 153, 0.6)'
            }}>
              {proyD3D5.totalIngresos}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
