const express = require('express');
const router = express.Router();
const ojtMetricsService = require('../services/ojtMetricsService');

/**
 * GET /api/ojt/filtros-disponibles
 * Retorna las opciones de Campaña, Formador y Modalidad extraídas de Supabase.
 */
router.get('/filtros-disponibles', async (req, res) => {
  try {
    const filtros = await ojtMetricsService.getFiltrosDisponibles();
    res.json(filtros);
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error al consultar filtros', message: err.message });
  }
});

/**
 * GET /api/ojt/embudo-semanal
 */
router.get('/embudo-semanal', async (req, res) => {
  try {
    const filters = req.query || {};
    const data = await ojtMetricsService.getEmbudo5Dias(filters);
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error al consultar embudo', message: err.message });
  }
});

/**
 * GET /api/ojt/roi-extensiones
 */
router.get('/roi-extensiones', async (req, res) => {
  try {
    const filters = req.query || {};
    const data = await ojtMetricsService.getRoiExtensiones(filters);
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error al consultar ROI', message: err.message });
  }
});

/**
 * GET /api/ojt/matriz-intervencion
 */
router.get('/matriz-intervencion', async (req, res) => {
  try {
    const filters = req.query || {};
    const data = await ojtMetricsService.getMatrizIntervencion(filters);
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error al consultar matriz', message: err.message });
  }
});

/**
 * GET & POST /api/ojt/dashboard-resumen
 * Endpoint consolidado con filtrado en cascada auto-excluyente e in-memory cache.
 */
const handleDashboardResumen = async (req, res) => {
  try {
    const filters = req.method === 'POST' ? (req.body || {}) : (req.query || {});
    const [embudo, roi, matriz, opcionesFiltros] = await Promise.all([
      ojtMetricsService.getEmbudo5Dias(filters),
      ojtMetricsService.getRoiExtensiones(filters),
      ojtMetricsService.getMatrizIntervencion(filters),
      ojtMetricsService.getFiltrosDisponibles(filters)
    ]);

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      filtros_disponibles: opcionesFiltros,
      embudo,
      roi,
      matriz
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error al obtener resumen OJT', message: err.message });
  }
};

router.get('/dashboard-resumen', handleDashboardResumen);
router.post('/dashboard-resumen', handleDashboardResumen);

/**
 * POST /api/ojt/registrar-decision
 */
router.post('/registrar-decision', async (req, res) => {
  try {
    const { documento, accion, motivo, autor = 'Supervisor' } = req.body || {};

    if (!documento || !accion) {
      return res.status(400).json({ success: false, error: 'Documento y acción son requeridos.' });
    }

    res.json({
      success: true,
      message: `Decisión '${accion}' registrada para el asesor ${documento}.`,
      registro: {
        documento,
        accion,
        motivo: motivo || 'Intervención de Día 2',
        autor,
        fecha: new Date().toISOString()
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error al registrar decisión', message: err.message });
  }
});

/**
 * GET /api/ojt/ranking-formadores
 * Retorna la tasa de retención al Día 5 por formador, ordenada de mayor a menor.
 */
router.get('/ranking-formadores', async (req, res) => {
  try {
    const filters = req.query || {};
    const data = await ojtMetricsService.getRankingFormadores(filters);
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error al consultar ranking de formadores', message: err.message });
  }
});

/**
 * GET /api/ojt/comparativa-modalidad
 * Retorna la comparativa entre Remoto vs Presencial (retención, calidad, llamadas).
 */
router.get('/comparativa-modalidad', async (req, res) => {
  try {
    const filters = req.query || {};
    const data = await ojtMetricsService.getComparativaModalidad(filters);
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error al consultar comparativa de modalidad', message: err.message });
  }
});

router.get('/gantt-cumplimiento', async (req, res) => {
  try {
    const filters = req.query || {};
    const data = await ojtMetricsService.getGanttCumplimientoSupervisor(filters);
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error al consultar gantt', message: err.message });
  }
});

router.get('/costo-incumplimiento', async (req, res) => {
  try {
    const filters = req.query || {};
    const data = await ojtMetricsService.getCostoIncumplimientoGerencia(filters);
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error al consultar costo incumplimiento', message: err.message });
  }
});

router.get('/timeline-formador', async (req, res) => {
  try {
    const filters = req.query || {};
    const data = await ojtMetricsService.getTimelineFormador(filters);
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error al consultar timeline formador', message: err.message });
  }
});

router.get('/matriz-riesgo-formadores', async (req, res) => {
  try {
    const filters = req.query || {};
    const data = await ojtMetricsService.getMatrizRiesgoEficienciaFormadores(filters);
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error al consultar matriz de riesgo formadores', message: err.message });
  }
});

router.get('/curva-maduracion', async (req, res) => {
  try {
    const filters = req.query || {};
    const data = await ojtMetricsService.getCurvaMaduracionLlamadas(filters);
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error al consultar curva de maduración', message: err.message });
  }
});

router.get('/heatmap-bajas', async (req, res) => {
  try {
    const filters = req.query || {};
    const data = await ojtMetricsService.getHeatmapMotivosBaja(filters);
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error al consultar heatmap de bajas', message: err.message });
  }
});

router.get('/matriz-cohortes', async (req, res) => {
  try {
    const filters = req.query || {};
    const data = await ojtMetricsService.getMatrizBurbujasCohortes(filters);
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error al consultar matriz de cohortes', message: err.message });
  }
});

router.get('/curva-aprendizaje-semana', async (req, res) => {
  try {
    const filters = req.query || {};
    const data = await ojtMetricsService.getCurvaAprendizajeSemana(filters);
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error al consultar curva de aprendizaje', message: err.message });
  }
});

router.get('/flash-ojt', async (req, res) => {
  try {
    const filters = req.query || {};
    const data = await ojtMetricsService.getExcelFlashOjtMetrics(filters);
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error al consultar métricas Flash OJT', message: err.message });
  }
});

router.get('/embudo-flujo', async (req, res) => {
  try {
    const filters = req.query || {};
    const data = await ojtMetricsService.getEmbudoEjecutivoFlujo(filters);
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error al consultar embudo ejecutivo de flujo', message: err.message });
  }
});

router.get('/refresh-cache', async (req, res) => {
  try {
    await ojtMetricsService.ensureCache(true);
    res.json({ success: true, message: 'Cache de métricas actualizado en memoria correctamente.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error al refrescar cache', message: err.message });
  }
});

module.exports = router;
