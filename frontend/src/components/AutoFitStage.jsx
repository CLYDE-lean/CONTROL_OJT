import React from 'react';
import useAutoFitScale from '../hooks/useAutoFitScale';

/**
 * Componente wrapper AutoFitStage que encoge proporcionalmente el contenido de cada vista
 * utilizando transform: scale() para que encaje exactamente dentro del espacio disponible,
 * o conmuta al modo fallback con scroll si la escala requerida cae bajo MIN_SCALE (0.78).
 */
export default function AutoFitStage({ children, minScale = 0.55, className = '' }) {
  const { containerRef, contentRef, scale, isFallback, ready } = useAutoFitScale({ minScale });

  return (
    <div
      ref={containerRef}
      className={`autofit-stage ${isFallback ? 'is-fallback' : ''} ${className}`}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: isFallback ? 'auto' : 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start'
      }}
    >
      <div
        ref={contentRef}
        className="autofit-stage__inner"
        style={{
          width: '100%',
          height: isFallback ? 'auto' : 'max-content',
          minHeight: isFallback ? 'auto' : 'max-content',
          transform: isFallback ? 'none' : `scale(${scale})`,
          transformOrigin: 'top center',
          visibility: ready ? 'visible' : 'hidden',
          transition: 'transform 0.15s ease-out',
          willChange: isFallback ? 'auto' : 'transform'
        }}
      >
        {children}
      </div>
    </div>
  );
}
