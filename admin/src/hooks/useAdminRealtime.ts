import { useEffect, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';

const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '') || 'http://localhost:5000';

let globalAdminSocket: Socket | null = null;
let adminSocketInit = false;

export const useAdminRealtimeConnection = () => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (globalAdminSocket && globalAdminSocket.connected) {
      socketRef.current = globalAdminSocket;
      setIsConnected(true);
      return;
    }

    if (globalAdminSocket && !globalAdminSocket.connected) {
      socketRef.current = globalAdminSocket;
      const handleConnect = () => setIsConnected(true);
      globalAdminSocket.on('connect', handleConnect);
      return () => { globalAdminSocket?.off('connect', handleConnect); };
    }

    if (!adminSocketInit) {
      adminSocketInit = true;
      console.log('🔌 Admin real-time initializing...');
    }

    const socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('✅ Admin socket connected:', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.warn('⚠️ Admin socket error:', err.message);
    });

    socketRef.current = socket;
    globalAdminSocket = socket;

    return () => {};
  }, []);

  return isConnected ? socketRef.current : null;
};

export const useAdminRealtimeOrders = (onNewOrder: (data: any) => void, onOrderUpdate: (data: any) => void) => {
  const socket = useAdminRealtimeConnection();

  useEffect(() => {
    if (!socket) return;

    const handler = ({ action, data }: any) => {
      if (action === 'created') onNewOrder(data);
      else onOrderUpdate({ action, data });
    };

    socket.on('orders:update', handler);
    return () => { socket.off('orders:update', handler); };
  }, [socket, onNewOrder, onOrderUpdate]);
};

export const useAdminRealtimeGeneral = (onUpdate: (event: string, action: string, data: any) => void) => {
  const socket = useAdminRealtimeConnection();

  useEffect(() => {
    if (!socket) return;

    const events = ['foods:update', 'categories:update', 'coupons:update', 'announcements:update', 'customers:update', 'settings:update'];
    const handlers: Record<string, (payload: any) => void> = {};

    events.forEach((event) => {
      handlers[event] = (payload: any) => onUpdate(event, payload.action, payload.data);
      socket.on(event, handlers[event]);
    });

    return () => {
      events.forEach((event) => socket.off(event, handlers[event]));
    };
  }, [socket, onUpdate]);
};
