/**
 * Entrada serverless para Vercel.
 * Reenvía cualquier /api/* al app Express del backend.
 */
const app = require('../backend/src/app');

module.exports = (req, res) => {
  // Vercel puede entregar la ruta ya sin el prefijo /api según el rewrite.
  if (req.url && !req.url.startsWith('/api')) {
    req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
  }
  return app(req, res);
};
