import React from 'react';
import { getStatusColor } from '../utils/kpiStatus';

/**
 * Componente: KpiBulletCard (Diseño Ejecutivo Nítido de Alto Contraste)
 * Resuelve el problema de colores difuminados:
 * - Colores coherentes y definidos por estado (Crítico: Carmesí puro | Alerta: Ámbar oro puro | Meta: Esmeralda pura | I-OP: Cyan puro)
 * - Barras de progreso con gradientes propios homogéneos (sin contaminación cyan en estados críticos/alerta)
 * - Marcador de meta limpio y nítido
 * - Tipografía y badges de alto contraste y legibilidad ejecutiva
 */
export default function KpiBulletCard({
  titulo,
  peso,
  valor = 0,
  meta = 0,
  unidad = '%',
  tipo = 'mayor_mejor',
  objCump = null,
  icono: Icono,
  variante = 'kpi',
  subtitulo = null,
  badgeLabel = null,
  extraValor = null,
  extraUnidad = ''
}) {
  const esConteo = variante === 'conteo';
  const statusInfo = esConteo
    ? { status: 'INFO', deltaShort: '', deltaText: '' }
    : getStatusColor(valor, meta, tipo, objCump);
  const numVal = parseFloat(valor) || 0;
  const numMeta = parseFloat(meta) || 0;

  // Paleta de colores puros y nítidos (sin difuminados lechosos)
  const palette = esConteo
    ? {
        color: '#38bdf8',
        bg: 'rgba(56, 189, 248, 0.16)',
        border: 'rgba(56, 189, 248, 0.45)',
        glow: 'rgba(56, 189, 248, 0.35)',
        gradientBar: 'linear-gradient(90deg, #0284c7 0%, #0ea5e9 60%, #38bdf8 100%)'
      }
    : statusInfo.status === 'META'
      ? {
          color: '#34d399',
          bg: 'rgba(52, 211, 153, 0.16)',
          border: 'rgba(52, 211, 153, 0.45)',
          glow: 'rgba(52, 211, 153, 0.35)',
          gradientBar: 'linear-gradient(90deg, #059669 0%, #10b981 60%, #34d399 100%)'
        }
      : statusInfo.status === 'ALERTA'
        ? {
            color: '#fbbf24',
            bg: 'rgba(251, 191, 36, 0.16)',
            border: 'rgba(251, 191, 36, 0.45)',
            glow: 'rgba(251, 191, 36, 0.35)',
            gradientBar: 'linear-gradient(90deg, #d97706 0%, #f59e0b 60%, #fbbf24 100%)'
          }
        : {
            color: '#fb7185',
            bg: 'rgba(251, 113, 133, 0.16)',
            border: 'rgba(251, 113, 133, 0.45)',
            glow: 'rgba(251, 113, 133, 0.35)',
            gradientBar: 'linear-gradient(90deg, #be123c 0%, #e11d48 60%, #f43f5e 100%)'
          };

  const barFillPct = Math.min(100, Math.max(0, numVal));
  const metaPosPct = Math.min(100, Math.max(0, numMeta));

  let labelBadge = badgeLabel;
  if (!labelBadge) {
    labelBadge = 'En meta';
    if (statusInfo.status === 'ALERTA') labelBadge = 'Alerta';
    else if (statusInfo.status === 'CRITICO') labelBadge = 'Crítico';
  }

  return (
    <div
      title={`${titulo} ${peso || ''}`}
      style={{
        background: 'linear-gradient(180deg, rgba(20, 31, 52, 0.96) 0%, rgba(13, 21, 37, 0.98) 100%)',
        border: `1px solid rgba(255, 255, 255, 0.10)`,
        borderRadius: '12px',
        padding: '9px 12px 9px 14px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: '0 8px 24px rgba(2, 6, 23, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        boxSizing: 'border-box',
        height: '100%',
        minHeight: 0,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* ── Franja lateral izquierda indicadora del estado ── */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: '4px',
        background: palette.color,
        boxShadow: `0 0 10px ${palette.glow}`
      }} />

      {/* ── Encabezado: Título + Icono + Badge de Estado ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          overflow: 'hidden',
          fontSize: '0.78rem',
          fontWeight: 700,
          fontFamily: "'Outfit', 'Inter', sans-serif",
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis'
        }}>
          {Icono && <Icono size={14} style={{ color: palette.color, flexShrink: 0 }} />}
          <span style={{ color: '#ffffff', letterSpacing: '-0.01em' }}>{titulo}</span>
          {peso && (
            <span style={{ color: '#94a3b8', fontSize: '0.66rem', fontWeight: 600 }}>
              ({peso.replace('peso', '').trim()})
            </span>
          )}
        </div>

        {/* Badge de Estado Nítido con Alto Contraste */}
        <span style={{
          fontSize: '0.66rem',
          fontWeight: 800,
          fontFamily: "'Outfit', 'Inter', sans-serif",
          color: palette.color,
          background: palette.bg,
          border: `1px solid ${palette.border}`,
          padding: '2px 8px',
          borderRadius: '6px',
          whiteSpace: 'nowrap',
          flexShrink: 0,
          boxShadow: `0 0 8px ${palette.glow}`,
          letterSpacing: '0.02em'
        }}>
          {labelBadge}
        </span>
      </div>

      {/* ── Cuerpo: Número Gigante de Valor + Unidad ── */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '4px 0 6px 0', flexWrap: 'wrap' }}>
        <span style={{
          fontSize: '1.95rem',
          fontWeight: 900,
          color: '#ffffff',
          fontFamily: "'JetBrains Mono', 'SF Mono', Consolas, monospace",
          lineHeight: 1,
          letterSpacing: '-0.03em',
          textShadow: '0 2px 10px rgba(0, 0, 0, 0.4)'
        }}>
          {esConteo ? Number(numVal).toLocaleString('es-PE') : valor}
        </span>
        <span style={{
          fontSize: '0.80rem',
          fontWeight: 700,
          color: '#94a3b8',
          fontFamily: "'Outfit', 'Inter', sans-serif"
        }}>
          {unidad}
        </span>
        {esConteo && extraValor != null && (
          <>
            <span style={{ color: '#64748b', fontWeight: 700, fontSize: '1.15rem', lineHeight: 1, margin: '0 2px' }}>→</span>
            <span style={{
              fontSize: '1.65rem',
              fontWeight: 900,
              color: '#38bdf8',
              fontFamily: "'JetBrains Mono', 'SF Mono', Consolas, monospace",
              lineHeight: 1,
              letterSpacing: '-0.03em',
              textShadow: '0 0 14px rgba(56, 189, 248, 0.45)'
            }}>
              {Number(extraValor).toLocaleString('es-PE')}
            </span>
            <span style={{
              fontSize: '0.74rem',
              fontWeight: 800,
              color: '#38bdf8',
              fontFamily: "'Outfit', 'Inter', sans-serif"
            }}>
              {extraUnidad || 'FTE'}
            </span>
          </>
        )}
      </div>

      {/* ── Pie: Barra de Progreso Nítida o Subtítulo ── */}
      {esConteo ? (
        <div style={{
          fontSize: '0.64rem',
          fontFamily: "'Outfit', 'Inter', sans-serif",
          color: '#94a3b8',
          fontWeight: 500,
          marginTop: '2px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {subtitulo || 'Personas únicas en el filtro'}
        </div>
      ) : (
        <div>
          {/* Pista de Barra de Progreso Sólida */}
          <div style={{
            position: 'relative',
            height: '8px',
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '999px',
            width: '100%',
            overflow: 'visible',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            {/* Barra con gradiente propio de su color de estado */}
            <div style={{
              width: `${barFillPct}%`,
              height: '100%',
              background: palette.gradientBar,
              borderRadius: '999px',
              boxShadow: `0 0 10px ${palette.glow}`,
              transition: 'width 0.4s ease-out'
            }} />
            {/* Marcador de Meta Limpio y Nítido */}
            <div
              title={`Meta: ${meta}${unidad}`}
              style={{
                position: 'absolute',
                top: '-3px',
                bottom: '-3px',
                left: `${metaPosPct}%`,
                width: '2.5px',
                background: '#ffffff',
                borderRadius: '1px',
                zIndex: 3,
                boxShadow: '0 0 8px rgba(255, 255, 255, 0.85)'
              }}
            />
          </div>

          {/* Información inferior de Meta vs Delta */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '5px',
            fontSize: '0.66rem',
            fontFamily: "'Outfit', 'Inter', sans-serif",
            color: '#cbd5e1'
          }}>
            <span style={{ fontWeight: 600 }}>Meta {tipo === 'menor_mejor' ? '≤' : '≥'}{meta}{unidad}</span>
            <span style={{
              color: palette.color,
              fontWeight: 800,
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: '-0.01em'
            }}>
              {statusInfo.deltaShort || statusInfo.deltaText}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
