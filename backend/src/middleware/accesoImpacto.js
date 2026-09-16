const crypto = require('crypto');

/**
 * Control de acceso al panel de Impacto.
 * La contraseña vive en la variable de entorno IMPACTO_PASSWORD (nunca en el código
 * ni en el bundle del frontend). Quien la acierta recibe un token firmado con vigencia
 * limitada, que el navegador envía en la cabecera x-impacto-token.
 */

const VIGENCIA_HORAS = 8;

function passwordConfigurada() {
  const p = process.env.IMPACTO_PASSWORD;
  return typeof p === 'string' && p.length > 0 ? p : null;
}

function firmar(payload, secreto) {
  return crypto.createHmac('sha256', secreto).update(payload).digest('hex');
}

/** Compara sin filtrar información por el tiempo de respuesta. */
function igualSeguro(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function crearToken(secreto) {
  const expira = Date.now() + VIGENCIA_HORAS * 60 * 60 * 1000;
  return `${expira}.${firmar(String(expira), secreto)}`;
}

function tokenValido(token, secreto) {
  if (typeof token !== 'string' || !token.includes('.')) return false;
  const [expira, firma] = token.split('.');
  if (!expira || !firma) return false;
  if (!igualSeguro(firma, firmar(expira, secreto))) return false;
  return Number(expira) > Date.now();
}

/** Bloquea la ruta si no llega un token vigente. */
function requiereAccesoImpacto(req, res, next) {
  const secreto = passwordConfigurada();
  if (!secreto) {
    return res.status(503).json({
      success: false,
      error: 'acceso_no_configurado',
      message: 'Falta definir IMPACTO_PASSWORD en el servidor.'
    });
  }

  const token = req.get('x-impacto-token') || '';
  if (!tokenValido(token, secreto)) {
    return res.status(401).json({
      success: false,
      error: 'acceso_denegado',
      message: 'El panel de Impacto requiere contraseña.'
    });
  }

  return next();
}

module.exports = {
  VIGENCIA_HORAS,
  passwordConfigurada,
  igualSeguro,
  crearToken,
  tokenValido,
  requiereAccesoImpacto
};
