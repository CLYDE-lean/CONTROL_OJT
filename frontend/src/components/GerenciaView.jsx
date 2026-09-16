import React, { useState, useEffect } from 'react';
import AutoFitStage from './AutoFitStage';
import RoiExtensionesView from './RoiExtensionesView';
import ComparativaModalidadView from './ComparativaModalidadView';
import CostoLlamadasExtensionCard from './CostoLlamadasExtensionCard';
import KpiImpactoCard from './KpiImpactoCard';
import { cabeceraImpacto } from '../services/accesoImpacto';

export default function GerenciaView({ data, roiData, filtros = {} }) {
  const [costoPostpago, setCostoPostpago] = useState(null);
  const [resumen, setResumen] = useState(null);
  const [roiRemoto, setRoiRemoto] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filtros.periodo) params.set('periodo', filtros.periodo);
    if (filtros.campana) params.set('campana', filtros.campana);
    if (filtros.semana) params.set('semana', filtros.semana);
    if (filtros.formador) params.set('formador', filtros.formador);
    if (filtros.grupo) params.set('grupo', filtros.grupo);
    if (filtros.modalidad) params.set('modalidad', filtros.modalidad);
    const qs = params.toString();

    // Los tres endpoints son de acceso restringido: viajan con el token del candado.
    const opciones = { headers: cabeceraImpacto() };

    const cargar = async () => {
      try {
        const [resCosto, resResumen, resRoi] = await Promise.all([
          fetch(`/api/ojt/costo-extension-postpago?${qs}`, opciones),
          fetch(`/api/ojt/resumen-impacto?${qs}`, opciones),
          fetch(`/api/ojt/roi-extensiones?${qs}`, opciones)
        ]);
        if (resCosto.ok) setCostoPostpago(await resCosto.json());
        if (resResumen.ok) setResumen(await resResumen.json());
        if (resRoi.ok) setRoiRemoto(await resRoi.json());
      } catch (err) {
        console.warn('Error cargando datos de impacto:', err);
      }
    };
    cargar();
  }, [filtros.periodo, filtros.campana, filtros.semana, filtros.formador, filtros.grupo, filtros.modalidad]);

  const roi = roiData || roiRemoto || data?.roi;
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

        <div className="gerencia-grid-3col">
          <div className="chart-wrapper-flex">
            <RoiExtensionesView roiData={roi} compactHero />
          </div>
          <div className="chart-wrapper-flex">
            <CostoLlamadasExtensionCard data={costoPostpago} />
          </div>
          <div className="chart-wrapper-flex">
            <ComparativaModalidadView filtros={filtros} />
          </div>
        </div>
      </div>
    </AutoFitStage>
  );
}
