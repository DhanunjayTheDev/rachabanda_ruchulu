import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AdminNotificationType = 'order' | 'system';

export interface AdminNotification {
  id: string;
  type: AdminNotificationType;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  timestamp: string;
}

interface AdminNotificationStore {
  notifications: AdminNotification[];
  pendingOrderIds: string[];
  addNotification: (notif: Omit<AdminNotification, 'id' | 'read' | 'timestamp'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  getUnreadCount: () => number;
  addPendingOrder: (orderId: string) => void;
  removePendingOrder: (orderId: string) => void;
}

export const useAdminNotificationStore = create<AdminNotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],
      pendingOrderIds: [],

      addNotification: (notif) => {
        const newNotif: AdminNotification = {
          ...notif,
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          read: false,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          notifications: [newNotif, ...state.notifications].slice(0, 200),
        }));
      },

      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),

      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      clearAll: () => set({ notifications: [] }),

      getUnreadCount: () => get().notifications.filter((n) => !n.read).length,

      addPendingOrder: (orderId) =>
        set((state) => ({
          pendingOrderIds: state.pendingOrderIds.includes(orderId)
            ? state.pendingOrderIds
            : [...state.pendingOrderIds, orderId],
        })),

      removePendingOrder: (orderId) =>
        set((state) => ({
          pendingOrderIds: state.pendingOrderIds.filter((id) => id !== orderId),
        })),
    }),
    {
      name: 'admin-notifications',
      partialize: (state) => ({
        notifications: state.notifications,
      }),
    }
  )
);
