import { useEffect, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';

const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

// Global socket instance (singleton pattern)
let globalSocket: Socket | null = null;
let socketReady = false;
let loggedSocketInit = false;

export const useRealtimeConnection = () => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // If already connected, return immediately
    if (globalSocket && globalSocket.connected) {
      socketRef.current = globalSocket;
      setIsConnected(true);
      return;
    }

    // If socket exists but not connected, wait for it
    if (globalSocket && !globalSocket.connected) {
      socketRef.current = globalSocket;
      
      const handleConnect = () => {
        console.log('✅ Socket connected:', globalSocket?.id);
        setIsConnected(true);
      };
      
      globalSocket.on('connect', handleConnect);
      return () => {
        globalSocket?.off('connect', handleConnect);
      };
    }

    // Create new socket connection
    if (!loggedSocketInit) {
      loggedSocketInit = true;
      console.log('🔌 Initializing real-time connection...');
    }
    const socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      socketReady = true;
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from real-time service');
      socketReady = false;
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.warn('⚠️ Real-time connection error:', error);
    });

    socketRef.current = socket;
    globalSocket = socket;

    return () => {
      // Don't disconnect on unmount - keep connection alive for other components
    };
  }, []);

  return isConnected ? socketRef.current : null;
};

export const useRealtimeFoods = (onUpdate: (action: string, data: any) => void) => {
  const socket = useRealtimeConnection();

  useEffect(() => {
    if (!socket) return;

    const handleFoodsUpdate = ({ action, data }: any) => {
      console.log('📨 Received foods:update event:', { action, data: { id: data._id, name: data.name } });
      onUpdate(action, data);
    };

    socket.on('foods:update', handleFoodsUpdate);
    return () => { socket.off('foods:update', handleFoodsUpdate); };
  }, [socket, onUpdate]);
};

export const useRealtimeCategories = (onUpdate: (action: string, data: any) => void) => {
  const socket = useRealtimeConnection();

  useEffect(() => {
    if (!socket) return;

    const handleCategoriesUpdate = ({ action, data }: any) => {
      console.log('📨 Received categories:update event:', { action, data: { id: data._id, name: data.name } });
      onUpdate(action, data);
    };

    socket.on('categories:update', handleCategoriesUpdate);
    return () => { socket.off('categories:update', handleCategoriesUpdate); };
  }, [socket, onUpdate]);
};

export const useRealtimeCoupons = (onUpdate: (action: string, data: any) => void) => {
  const socket = useRealtimeConnection();

  useEffect(() => {
    if (!socket) return;
    const handler = ({ action, data }: any) => onUpdate(action, data);
    socket.on('coupons:update', handler);
    return () => { socket.off('coupons:update', handler); };
  }, [socket, onUpdate]);
};

export const useRealtimeAnnouncements = (onUpdate: (action: string, data: any) => void) => {
  const socket = useRealtimeConnection();

  useEffect(() => {
    if (!socket) return;
    const handler = ({ action, data }: any) => onUpdate(action, data);
    socket.on('announcements:update', handler);
    return () => { socket.off('announcements:update', handler); };
  }, [socket, onUpdate]);
};

export const useRealtimeOrders = (onUpdate: (action: string, data: any) => void) => {
  const socket = useRealtimeConnection();

  useEffect(() => {
    if (!socket) return;
    const handler = ({ action, data }: any) => onUpdate(action, data);
    socket.on('orders:update', handler);
    return () => { socket.off('orders:update', handler); };
  }, [socket, onUpdate]);
};

export const useRealtimeSettings = (onUpdate: (data: any) => void) => {
  const socket = useRealtimeConnection();

  useEffect(() => {
    if (!socket) return;
    const handler = ({ data }: any) => onUpdate(data);
    socket.on('settings:update', handler);
    return () => { socket.off('settings:update', handler); };
  }, [socket, onUpdate]);
};

export const useRealtimeCustomers = (onUpdate: (action: string, data: any) => void) => {
  const socket = useRealtimeConnection();

  useEffect(() => {
    if (!socket) return;
    const handler = ({ action, data }: any) => onUpdate(action, data);
    socket.on('customers:update', handler);
    return () => { socket.off('customers:update', handler); };
  }, [socket, onUpdate]);
};
