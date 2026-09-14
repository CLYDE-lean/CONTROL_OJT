/**
 * useRealtimeSync — Hook de Sincronización en Tiempo Real con Supabase
 *
 * Suscribe al canal de Postgres Changes de Supabase para detectar
 * cualquier INSERT, UPDATE o DELETE en la tabla CONTROL (y opcionalmente otras).
 *
 * Cuando se detecta un cambio:
 *  1. Muestra una notificación flotante ("Nuevos datos disponibles")
 *  2. Después de un debounce de 2s, llama a onRefresh() automáticamente
 *  3. Expone el estado de conexión WS y el timestamp del último evento
 *
 * Uso:
 *   const { wsStatus, lastUpdate, pendingUpdate } = useRealtimeSync({ onRefresh: cargarDatos });
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';

const DEBOUNCE_MS = 2000; // ms de espera antes del auto-refresh

/**
 * @param {{ onRefresh: () => void, tables?: string[], enabled?: boolean }} opts
 */
export default function useRealtimeSync({ onRefresh, tables = ['CONTROL'], enabled = true }) {
  const [wsStatus, setWsStatus]         = useState('connecting'); // 'connecting' | 'connected' | 'disconnected' | 'error'
  const [lastUpdate, setLastUpdate]     = useState(null);         // Date del último evento
  const [pendingUpdate, setPendingUpdate] = useState(false);      // Toast visible
  const [eventCount, setEventCount]     = useState(0);            // Total de eventos recibidos
  const debounceRef  = useRef(null);
  const channelRef   = useRef(null);
  const onRefreshRef = useRef(onRefresh);

  // Mantener referencia actualizada de onRefresh sin recrear el efecto
  useEffect(() => { onRefreshRef.current = onRefresh; }, [onRefresh]);

  const handleChange = useCallback((payload) => {
    const now = new Date();
    console.log(`🔄 Realtime [${payload.table}] ${payload.eventType}:`, payload);
    setLastUpdate(now);
    setEventCount(c => c + 1);
    setPendingUpdate(true);

    // Debounce: si llegan varios cambios seguidos, espera 2s desde el último
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPendingUpdate(false);
      onRefreshRef.current?.();
    }, DEBOUNCE_MS);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Crear canal Realtime único por sesión
    const channelName = `ojt-sync-${Date.now()}`;
    let channel = supabase.channel(channelName);

    // Suscribirse a cambios en cada tabla
    for (const table of tables) {
      channel = channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        handleChange
      );
    }

    channel.subscribe((status) => {
      console.log(`📡 Realtime canal "${channelName}" estado:`, status);
      if (status === 'SUBSCRIBED') {
        setWsStatus('connected');
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        setWsStatus('error');
      } else if (status === 'CLOSED') {
        setWsStatus('disconnected');
      } else {
        setWsStatus('connecting');
      }
    });

    channelRef.current = channel;

    return () => {
      console.log('🔌 Realtime: desconectando canal', channelName);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      supabase.removeChannel(channel);
      setWsStatus('disconnected');
    };
  }, [enabled, tables.join(','), handleChange]);

  /** Descarta el toast de pendiente manualmente */
  const dismissUpdate = useCallback(() => {
    setPendingUpdate(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  /** Fuerza un refresh manual y descarta el toast */
  const forceRefresh = useCallback(() => {
    dismissUpdate();
    onRefreshRef.current?.();
  }, [dismissUpdate]);

  return {
    wsStatus,        // Estado del WebSocket
    lastUpdate,      // Date del último evento recibido
    pendingUpdate,   // true si hay un cambio pendiente de aplicar
    eventCount,      // Número total de eventos recibidos
    dismissUpdate,   // Función para descartar el toast
    forceRefresh,    // Función para forzar refresh manual
  };
}
