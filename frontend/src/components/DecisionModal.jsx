import React, { useState } from 'react';
import { X, ShieldAlert } from 'lucide-react';

export default function DecisionModal({ modalData, onClose, onConfirm }) {
  if (!modalData) return null;

  const [motivo, setMotivo] = useState('');
  const [autor, setAutor] = useState('Supervisor GEA');

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({
      documento: modalData.documento,
      accion: modalData.accion,
      motivo: motivo || `Intervención de Día 2 (${modalData.accion})`,
      autor
    });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(11, 15, 23, 0.85)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div className="executive-card" style={{ width: '100%', maxWidth: '460px', border: '1px solid var(--border-focus)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={18} style={{ color: 'var(--accent-warning)' }} />
            Ejecutar Decisión Operativa
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', border: '1px solid var(--border-muted)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Asesor Seleccionado:</div>
          <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{modalData.nombre}</strong>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.1rem' }}>DNI: {modalData.documento}</div>
          
          <div style={{ marginTop: '0.6rem', paddingTop: '0.6rem', borderTop: '1px solid var(--border-muted)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Acción Requerida:</span>
            <div style={{ fontSize: '0.9rem', color: '#fbbf24', fontWeight: 600 }}>
              {modalData.accion}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {modalData.accion?.includes('Regularizar') && (
            <div style={{ marginBottom: '1rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#0f1c2e', marginBottom: '0.4rem' }}>
                Selecciona Tipo de Regularización:
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.78rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', color: '#dc2626', fontWeight: 600 }}>
                  <input type="radio" name="tipo_reg" value="🔴 Registrar Baja Formal por Inasistencia" defaultChecked onChange={(e) => setMotivo(e.target.value)} />
                  🔴 Registrar Baja Formal (Deserción D1→D2)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', color: '#0d9488', fontWeight: 600 }}>
                  <input type="radio" name="tipo_reg" value="🟢 Regularizar Asistencia / Vigencia en OJT" onChange={(e) => setMotivo(e.target.value)} />
                  🟢 Regularizar Asistencia (Asesor Vigente en OJT)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', color: '#1e6fc0', fontWeight: 600 }}>
                  <input type="radio" name="tipo_reg" value="🔵 Egresar a Operación (I-OP Directo)" onChange={(e) => setMotivo(e.target.value)} />
                  🔵 Egresar a Operación (I-OP Directo)
                </label>
              </div>
            </div>
          )}

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-tertiary)', marginBottom: '0.4rem' }}>
              Justificación / Sustento Operativo:
            </label>
            <textarea
              rows="3"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej: Auditoría de asistencia completada por Supervisor."
              style={{
                width: '100%',
                padding: '0.65rem 0.75rem',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontSize: '0.82rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-exec"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-exec btn-exec-primary"
            >
              Confirmar Registro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
