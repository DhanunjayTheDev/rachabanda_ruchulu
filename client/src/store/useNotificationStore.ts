import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NotificationType = 'order' | 'announcement' | 'coupon' | 'food' | 'category' | 'settings' | 'system';

export interface ClientNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  timestamp: string;
}

interface NotificationStore {
  notifications: ClientNotification[];
  addNotification: (notif: Omit<ClientNotification, 'id' | 'read' | 'timestamp'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  getUnreadCount: () => number;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],

      addNotification: (notif) => {
        const newNotif: ClientNotification = {
          ...notif,
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          read: false,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          notifications: [newNotif, ...state.notifications].slice(0, 100),
        }));
      },

      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        }));
      },

      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },

      clearAll: () => set({ notifications: [] }),

      getUnreadCount: () => get().notifications.filter((n) => !n.read).length,
    }),
    {
      name: 'client-notifications',
    }
  )
);
