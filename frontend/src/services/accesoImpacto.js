const CLAVE_STORAGE = 'impacto_token';

export function tokenGuardado() {
  try {
    return sessionStorage.getItem(CLAVE_STORAGE) || '';
  } catch {
    return '';
  }
}

export function guardarToken(token) {
  try {
    sessionStorage.setItem(CLAVE_STORAGE, token);
  } catch {
    /* sessionStorage bloqueado: el acceso durará solo lo que viva la pestaña */
  }
}

export function borrarToken() {
  try {
    sessionStorage.removeItem(CLAVE_STORAGE);
  } catch {
    /* nada que limpiar */
  }
}

/** Cabecera que acompaña a cada pedido de datos del panel de Impacto. */
export function cabeceraImpacto() {
  const token = tokenGuardado();
  return token ? { 'x-impacto-token': token } : {};
}

/** Estado del acceso: si el servidor tiene contraseña definida y si el token sigue vigente. */
export async function estadoAcceso() {
  try {
    const res = await fetch('/api/ojt/acceso-impacto', { headers: cabeceraImpacto() });
    if (!res.ok) return { configurado: true, autorizado: false };
    const json = await res.json();
    return { configurado: json.configurado !== false, autorizado: Boolean(json.autorizado) };
  } catch {
    return { configurado: true, autorizado: false };
  }
}

/** Pregunta al servidor si el token guardado sigue vigente. */
export async function verificarAcceso() {
  const { autorizado } = await estadoAcceso();
  return autorizado;
}

/** Envía la contraseña al servidor. Devuelve { ok, mensaje }. */
export async function solicitarAcceso(password) {
  try {
    const res = await fetch('/api/ojt/acceso-impacto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    const json = await res.json().catch(() => ({}));

    if (res.ok && json.token) {
      guardarToken(json.token);
      return { ok: true };
    }
    if (res.status === 503) {
      return { ok: false, mensaje: 'El acceso aún no está configurado en el servidor.' };
    }
    return { ok: false, mensaje: 'Contraseña incorrecta.' };
  } catch {
    return { ok: false, mensaje: 'No se pudo validar la contraseña. Revisa tu conexión.' };
  }
}
