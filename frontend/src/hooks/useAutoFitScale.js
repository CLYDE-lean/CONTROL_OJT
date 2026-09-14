import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook para calcular la escala fluida transform: scale() en escenarios donde el contenido
 * de un dashboard debe encajar sin scroll en el viewport disponible.
 *
 * @param {Object} options
 * @param {number} [options.minScale=0.78] Piso mínimo de escala antes de activar el modo fallback con scroll
 * @param {number} [options.debounceMs=80] Tiempo de throttle para recálculo durante resizes continuos
 * @returns {Object} { containerRef, contentRef, scale, isFallback, ready }
 */
export default function useAutoFitScale({ minScale = 0.55, debounceMs = 80 } = {}) {
  const containerRef = useRef(null);
  const contentRef = useRef(null);

  const [state, setState] = useState({
    scale: 1,
    isFallback: false,
    ready: false
  });

  const timerRef = useRef(null);

  const calculateScale = useCallback(() => {
    const container = containerRef.current;
    const content = contentRef.current;

    if (!container || !content) return;

    // Medir espacio disponible del contenedor externo
    const availWidth = container.clientWidth;
    const availHeight = container.clientHeight;

    if (availWidth === 0 || availHeight === 0) return;

    // Medir tamaño natural del contenido interno (hijo layout sin transform)
    const child = content.firstElementChild;
    const naturalWidth = (child && child.scrollWidth > 0) ? child.scrollWidth : (content.scrollWidth || 1280);
    const naturalHeight = (child && child.scrollHeight > 0) ? child.scrollHeight : (content.scrollHeight || 760);

    if (naturalWidth === 0 || naturalHeight === 0) return;

    // Calcular la escala para encajar ambos ejes (ancho y alto) dentro del viewport disponible
    const rawScaleX = availWidth / naturalWidth;
    const rawScaleY = availHeight / naturalHeight;
    const calculatedScale = Math.min(rawScaleX, rawScaleY, 1);

    // Si la escala calculada cae por debajo del piso mínimo, se activa el modo fallback con scroll
    if (calculatedScale < minScale) {
      setState({
        scale: 1,
        isFallback: true,
        ready: true
      });
    } else {
      setState({
        scale: Number(calculatedScale.toFixed(4)),
        isFallback: false,
        ready: true
      });
    }
  }, [minScale]);

  const debouncedCalculate = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      calculateScale();
    }, debounceMs);
  }, [calculateScale, debounceMs]);

  useEffect(() => {
    // Ejecutar medición inicial síncrona/inmediata
    calculateScale();

    const container = containerRef.current;
    const content = contentRef.current;

    if (!window.ResizeObserver) {
      window.addEventListener('resize', debouncedCalculate);
      return () => {
        window.removeEventListener('resize', debouncedCalculate);
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }

    const observer = new ResizeObserver(() => {
      debouncedCalculate();
    });

    if (container) observer.observe(container);
    if (content) observer.observe(content);

    return () => {
      observer.disconnect();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [calculateScale, debouncedCalculate]);

  return {
    containerRef,
    contentRef,
    scale: state.scale,
    isFallback: state.isFallback,
    ready: state.ready
  };
}
