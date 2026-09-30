import React, { useState, useEffect } from 'react';
import AutoFitStage from './AutoFitStage';
import CostoLlamadasExtensionCard from './CostoLlamadasExtensionCard';
import KpiImpactoCard from './KpiImpactoCard';
import { cabeceraImpacto } from '../services/accesoImpacto';

export default function GerenciaView({ filtros = {} }) {
  const [costoPostpago, setCostoPostpago] = useState(null);
  const [resumen, setResumen] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filtros.periodo) params.set('periodo', filtros.periodo);
    if (filtros.campana) params.set('campana', filtros.campana);
    if (filtros.semana) params.set('semana', filtros.semana);
    if (filtros.formador) params.set('formador', filtros.formador);
    if (filtros.grupo) params.set('grupo', filtros.grupo);
    if (filtros.modalidad) params.set('modalidad', filtros.modalidad);
    const qs = params.toString();

    const opciones = { headers: cabeceraImpacto() };

    const cargar = async () => {
      try {
        const [resCosto, resResumen] = await Promise.all([
          fetch(`/api/ojt/costo-extension-postpago?${qs}`, opciones),
          fetch(`/api/ojt/resumen-impacto?${qs}`, opciones)
        ]);
        if (resCosto.ok) setCostoPostpago(await resCosto.json());
        if (resResumen.ok) setResumen(await resResumen.json());
      } catch (err) {
        console.warn('Error cargando datos de impacto:', err);
      }
    };
    cargar();
  }, [filtros.periodo, filtros.campana, filtros.semana, filtros.formador, filtros.grupo, filtros.modalidad]);

  const indicadores = resumen?.indicadores || [];
  const etiquetaBase = resumen?.base?.etiqueta || 'iniciaron OJT';

  return (
    <AutoFitStage>
      <div className="gerencia-layout">
        <div className="kpi-header-grid">
          {indicadores.map((ind) => (
            <KpiImpactoCard key={ind.id} indicador={ind} etiquetaBase={etiquetaBase} />
          ))}
        </div>

        <div className="chart-wrapper-flex">
          <CostoLlamadasExtensionCard data={costoPostpago} />
        </div>
      </div>
    </AutoFitStage>
  );
}
