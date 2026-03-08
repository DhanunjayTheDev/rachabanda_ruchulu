import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotificationStore, ClientNotification } from '@/store/useNotificationStore';
import useStore from '@/store/useStore';
import { playNotificationSound } from '@/lib/notificationSound';

const TYPE_ICONS: Record<string, string> = {
  order: '📦', announcement: '📢', coupon: '🎟️', food: '🍽️',
  category: '🗂️', settings: '⚙️', system: '🔔',
};

const TYPE_COLORS: Record<string, string> = {
  order: 'border-blue-400 bg-blue-400/10',
  announcement: 'border-yellow-400 bg-yellow-400/10',
  coupon: 'border-green-400 bg-green-400/10',
  food: 'border-orange-400 bg-orange-400/10',
  category: 'border-purple-400 bg-purple-400/10',
  settings: 'border-gray-400 bg-gray-400/10',
  system: 'border-primary-gold bg-primary-gold/10',
};

function timeAgo(timestamp: string) {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function NotificationToast({ notification, onDismiss }: { notification: ClientNotification; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 80, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.9 }}
      className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-2xl max-w-xs cursor-pointer ${TYPE_COLORS[notification.type] || TYPE_COLORS.system}`}
      onClick={onDismiss}
    >
      <span className="text-2xl shrink-0">{TYPE_ICONS[notification.type] || '🔔'}</span>
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-sm truncate">{notification.title}</p>
        <p className="text-gray-300 text-xs mt-0.5 line-clamp-2">{notification.message}</p>
      </div>
      <button className="text-gray-400 hover:text-white shrink-0" onClick={onDismiss}>✕</button>
    </motion.div>
  );
}

function NotificationDrawer({ onClose }: { onClose: () => void }) {
  const { notifications, markAsRead, markAllAsRead, removeNotification, clearAll } = useNotificationStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="absolute bottom-14 right-0 w-96 max-w-[calc(100vw-2rem)] bg-secondary-dark-brown/95 backdrop-blur-md border border-primary-gold/20 rounded-2xl shadow-2xl overflow-hidden z-50"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-primary-gold/20">
        <h3 className="text-white font-bold text-sm">Notifications</h3>
        <div className="flex items-center gap-2">
          {notifications.some((n) => !n.read) && (
            <button onClick={markAllAsRead} className="text-xs text-primary-gold hover:text-yellow-300 transition-colors">Mark all read</button>
          )}
          {notifications.length > 0 && (
            <button onClick={clearAll} className="text-xs text-gray-400 hover:text-red-400 transition-colors">Clear all</button>
          )}
          <button onClick={onClose} className="text-gray-400 hover:text-white ml-1">✕</button>
        </div>
      </div>

      <div className="max-h-[420px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <span className="text-4xl mb-2">🔔</span>
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`flex items-start gap-3 px-4 py-3 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${notif.read ? 'opacity-60' : ''}`}
              onClick={() => markAsRead(notif.id)}
            >
              <span className="text-xl shrink-0 mt-0.5">{TYPE_ICONS[notif.type] || '🔔'}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-semibold truncate ${notif.read ? 'text-gray-400' : 'text-white'}`}>{notif.title}</p>
                  {!notif.read && <span className="shrink-0 w-2 h-2 bg-primary-gold rounded-full" />}
                </div>
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{notif.message}</p>
                <p className="text-xs text-gray-500 mt-1">{timeAgo(notif.timestamp)}</p>
              </div>
              <button className="text-gray-500 hover:text-red-400 shrink-0 transition-colors" onClick={(e) => { e.stopPropagation(); removeNotification(notif.id); }}>✕</button>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}

export default function NotificationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [toasts, setToasts] = useState<ClientNotification[]>([]);
  const [mounted, setMounted] = useState(false);
  const { notifications, getUnreadCount } = useNotificationStore();
  const { isLoggedIn } = useStore();
  const prevCountRef = useRef(0);
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted.current) return;
    const unread = notifications.filter((n) => !n.read);
    if (unread.length > prevCountRef.current) {
      const newest = unread[0];
      setToasts((prev) => [newest, ...prev].slice(0, 3));
      playNotificationSound();
      if (newest.type === 'order' && document.hidden && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(newest.title, { body: newest.message, icon: '/favicon.svg' });
      }
    }
    prevCountRef.current = unread.length;
  }, [notifications]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const unreadCount = getUnreadCount();

  if (!mounted) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <NotificationToast key={toast.id} notification={toast} onDismiss={() => dismissToast(toast.id)} />
        ))}
      </AnimatePresence>

      {isLoggedIn() && (
        <div className="relative">
          <AnimatePresence>
            {isOpen && <NotificationDrawer onClose={() => setIsOpen(false)} />}
          </AnimatePresence>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen((o) => !o)}
            className="relative w-14 h-14 rounded-full bg-secondary-dark-brown border border-primary-gold/40 shadow-2xl flex items-center justify-center text-2xl hover:border-primary-gold transition-colors"
            title="Notifications"
          >
            <motion.span animate={unreadCount > 0 ? { rotate: [0, -15, 15, -10, 10, 0] } : {}} transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 4 }}>
              🔔
            </motion.span>
            {unreadCount > 0 && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </motion.span>
            )}
          </motion.button>
        </div>
      )}
    </div>
  );
}

export function useRequestNotificationPermission() {
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);
}
