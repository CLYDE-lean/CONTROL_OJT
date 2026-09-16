import React from 'react';
import { getStatusColor } from '../utils/kpiStatus';

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
  badgeLabel = null
}) {
  const esConteo = variante === 'conteo';
  const statusInfo = esConteo
    ? { status: 'INFO', deltaShort: '', deltaText: '' }
    : getStatusColor(valor, meta, tipo, objCump);
  const numVal = parseFloat(valor) || 0;
  const numMeta = parseFloat(meta) || 0;

  const palette = esConteo
    ? { color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.14)', border: 'rgba(56, 189, 248, 0.38)', glow: 'rgba(56, 189, 248, 0.22)' }
    : statusInfo.status === 'META'
      ? { color: '#34d399', bg: 'rgba(52, 211, 153, 0.14)', border: 'rgba(52, 211, 153, 0.38)', glow: 'rgba(52, 211, 153, 0.22)' }
      : statusInfo.status === 'ALERTA'
        ? { color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.14)', border: 'rgba(251, 191, 36, 0.38)', glow: 'rgba(251, 191, 36, 0.18)' }
        : { color: '#fb7185', bg: 'rgba(251, 113, 133, 0.14)', border: 'rgba(251, 113, 133, 0.38)', glow: 'rgba(251, 113, 133, 0.18)' };

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
        background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.92) 100%)',
        border: '1px solid rgba(148, 163, 184, 0.16)',
        borderRadius: '12px',
        padding: '10px 12px 10px 14px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: `0 8px 24px rgba(2, 6, 23, 0.35), inset 0 1px 0 rgba(255,255,255,0.04)`,
        boxSizing: 'border-box',
        height: '100%',
        minHeight: 0,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: '4px',
        background: palette.color,
        boxShadow: `0 0 12px ${palette.glow}`
      }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          overflow: 'hidden',
          fontSize: '0.74rem',
          fontWeight: 600,
          fontFamily: "'Inter', sans-serif",
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis'
        }}>
          {Icono && <Icono size={13} style={{ color: palette.color, flexShrink: 0 }} />}
          <span style={{ color: '#f8fafc' }}>{titulo}</span>
          {peso && (
            <span style={{ color: '#64748b', fontSize: '0.64rem', fontWeight: 500 }}>
              ({peso.replace('peso', '').trim()})
            </span>
          )}
        </div>

        <span style={{
          fontSize: '0.62rem',
          fontWeight: 700,
          fontFamily: "'Inter', sans-serif",
          color: palette.color,
          background: palette.bg,
          border: `1px solid ${palette.border}`,
          padding: '2px 8px',
          borderRadius: '999px',
          whiteSpace: 'nowrap',
          flexShrink: 0
        }}>
          {labelBadge}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', margin: '6px 0 8px 0' }}>
        <span style={{
          fontSize: '1.72rem',
          fontWeight: 800,
          color: '#ffffff',
          fontFamily: "'JetBrains Mono', 'SF Mono', Consolas, monospace",
          lineHeight: 1,
          letterSpacing: '-0.03em'
        }}>
          {esConteo ? Number(numVal).toLocaleString('es-PE') : valor}
        </span>
        <span style={{
          fontSize: '0.78rem',
          fontWeight: 600,
          color: '#94a3b8',
          fontFamily: "'Inter', sans-serif"
        }}>
          {unidad}
        </span>
      </div>

      {esConteo ? (
        <div style={{
          fontSize: '0.62rem',
          fontFamily: "'Inter', sans-serif",
          color: '#94a3b8',
          marginTop: '2px'
        }}>
          {subtitulo || 'Personas únicas en el filtro'}
        </div>
      ) : (
        <div>
          <div style={{
            position: 'relative',
            height: '7px',
            background: 'rgba(15, 23, 42, 0.85)',
            borderRadius: '999px',
            width: '100%',
            overflow: 'visible',
            border: '1px solid rgba(255,255,255,0.06)'
          }}>
            <div style={{
              width: `${barFillPct}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${palette.color} 0%, #38bdf8 100%)`,
              borderRadius: '999px',
              boxShadow: `0 0 10px ${palette.glow}`,
              transition: 'width 0.4s ease-out'
            }} />
            <div
              title={`Meta: ${meta}${unidad}`}
              style={{
                position: 'absolute',
                top: '-4px',
                bottom: '-4px',
                left: `${metaPosPct}%`,
                width: '2px',
                background: '#e2e8f0',
                borderRadius: '1px',
                zIndex: 3,
                boxShadow: '0 0 6px rgba(226,232,240,0.5)'
              }}
            />
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '5px',
            fontSize: '0.62rem',
            fontFamily: "'Inter', sans-serif",
            color: '#94a3b8'
          }}>
            <span>Meta {tipo === 'menor_mejor' ? '≤' : '≥'}{meta}{unidad}</span>
            <span style={{ color: palette.color, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
              {statusInfo.deltaShort || statusInfo.deltaText}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
