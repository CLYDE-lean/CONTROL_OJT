import React, { useState, useEffect, useRef } from 'react';
import { Lock, AlertCircle, Loader2 } from 'lucide-react';
import { estadoAcceso, solicitarAcceso } from '../services/accesoImpacto';

/**
 * Candado del panel de Impacto. Solo deja pasar a quien acierta la contraseña,
 * que se valida contra el servidor. El acceso dura mientras la pestaña siga abierta.
 */
export default function ImpactoLock({ children, onDesbloquear }) {
  const [autorizado, setAutorizado] = useState(false);
  const [configurado, setConfigurado] = useState(true);
  const [verificando, setVerificando] = useState(true);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    let vigente = true;
    const revisar = async () => {
      const estado = await estadoAcceso();
      if (!vigente) return;
      setAutorizado(estado.autorizado);
      setConfigurado(estado.configurado);
      setVerificando(false);
      if (estado.autorizado) onDesbloquear?.();
    };
    revisar();
    return () => { vigente = false; };
  }, []);

  useEffect(() => {
    if (!verificando && !autorizado) inputRef.current?.focus();
  }, [verificando, autorizado]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || enviando) return;

    setEnviando(true);
    setError('');
    const res = await solicitarAcceso(password);
    setEnviando(false);

    if (res.ok) {
      setPassword('');
      setAutorizado(true);
      onDesbloquear?.();
    } else {
      setError(res.mensaje);
      setPassword('');
      inputRef.current?.focus();
    }
  };

  if (verificando) {
    return (
      <div style={contenedor}>
        <Loader2 size={22} style={{ color: 'var(--text-tertiary)', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (autorizado) return children;

  if (!configurado) {
    return (
      <div style={contenedor}>
        <div style={tarjeta}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div style={iconoCirculo}>
              <AlertCircle size={20} style={{ color: '#f59e0b' }} />
            </div>
            <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Acceso sin configurar
            </h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.5 }}>
              Falta definir la variable <code>IMPACTO_PASSWORD</code> en el servidor.
              Mientras tanto, el panel queda cerrado para todos.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={contenedor}>
      <form onSubmit={handleSubmit} style={tarjeta}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={iconoCirculo}>
            <Lock size={20} style={{ color: '#f59e0b' }} />
          </div>
          <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Panel restringido
          </h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.5 }}>
            El análisis de Impacto contiene información económica.
            Ingresa la contraseña para verlo.
          </p>
        </div>

        <input
          ref={inputRef}
          type="password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(''); }}
          placeholder="Contraseña"
          autoComplete="off"
          style={{
            ...campo,
            borderColor: error ? '#dc2626' : 'var(--border-color)'
          }}
        />

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#dc2626', fontSize: '0.8rem' }}>
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        <button type="submit" disabled={!password || enviando} style={{ ...boton, opacity: !password || enviando ? 0.55 : 1 }}>
          {enviando ? 'Validando…' : 'Entrar'}
        </button>

        <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>
          El acceso se cierra al cerrar la pestaña.
        </span>
      </form>
    </div>
  );
}

const contenedor = {
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1.5rem'
};

const tarjeta = {
  width: 'min(360px, 100%)',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.9rem',
  padding: '1.75rem',
  background: 'var(--bg-card)',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius-lg, 12px)',
  boxShadow: '0 10px 30px rgba(0,0,0,0.25)'
};

const iconoCirculo = {
  width: 44,
  height: 44,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(245, 158, 11, 0.12)',
  border: '1px solid rgba(245, 158, 11, 0.3)'
};

const campo = {
  width: '100%',
  padding: '0.6rem 0.75rem',
  borderRadius: 'var(--radius-md, 8px)',
  border: '1px solid var(--border-color)',
  background: 'var(--bg-card-subtle)',
  color: 'var(--text-primary)',
  fontSize: '0.95rem',
  letterSpacing: '0.08em',
  boxSizing: 'border-box',
  outline: 'none'
};

const boton = {
  width: '100%',
  padding: '0.6rem',
  borderRadius: 'var(--radius-md, 8px)',
  border: 'none',
  background: '#f59e0b',
  color: '#1a1200',
  fontWeight: 800,
  fontSize: '0.9rem',
  cursor: 'pointer'
};
