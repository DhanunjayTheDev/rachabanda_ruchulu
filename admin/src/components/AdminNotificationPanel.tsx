
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminNotificationStore, AdminNotification } from '@/store/useAdminNotificationStore';
import { useAdminRealtimeOrders, useAdminRealtimeGeneral } from '@/hooks/useAdminRealtime';
import { playNotificationSound, startOrderAlertSound, stopOrderAlertSound } from '@/lib/notificationSound';

function timeAgo(timestamp: string) {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// Persistent order alert overlay
function OrderAlertBanner({
  order,
  onDismiss,
}: {
  order: any;
  onDismiss: (orderId: string) => void;
}) {
  const itemList = order.items
    ?.slice(0, 3)
    .map((i: any) => `${i.food?.name || i.name || 'Item'} ×${i.quantity}`)
    .join(', ');
  const extras = (order.items?.length || 0) > 3 ? ` +${order.items.length - 3} more` : '';

  return (
    <motion.div
      initial={{ opacity: 0, x: 80 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 80 }}
      className="bg-gradient-to-r from-orange-600 to-red-600 border border-orange-400 rounded-xl shadow-2xl p-4 max-w-sm w-full"
    >
      <div className="flex items-start gap-3">
        <motion.span
          className="text-3xl shrink-0"
          animate={{ rotate: [0, -20, 20, -15, 15, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1.5 }}
        >
          🔔
        </motion.span>
        <div className="flex-1">
          <p className="text-white font-bold text-sm">New Order Received!</p>
          <p className="text-orange-100 text-xs mt-0.5">
            Order #{order._id?.slice(-6).toUpperCase()} — ₹{Number(order.totalAmount || order.total || 0).toFixed(2)}
          </p>
          <p className="text-orange-200 text-xs mt-0.5">
            👤 {order.customerName || order.user?.name || 'Customer'}
          </p>
          {itemList && (
            <p className="text-orange-100 text-xs mt-1 line-clamp-2">
              🍽️ {itemList}{extras}
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <a
          href="/orders"
          onClick={() => onDismiss(order._id)}
          className="flex-1 bg-white text-orange-700 font-bold text-xs py-1.5 rounded-lg text-center hover:bg-orange-50 transition-colors"
        >
          View &amp; Accept Order
        </a>
        <button
          onClick={() => onDismiss(order._id)}
          className="px-3 bg-orange-700/50 text-white text-xs py-1.5 rounded-lg hover:bg-orange-700 transition-colors"
        >
          Dismiss
        </button>
      </div>
    </motion.div>
  );
}

// Notification drawer panel  
function NotificationDrawer({ onClose }: { onClose: () => void }) {
  const { notifications, markAsRead, markAllAsRead, removeNotification, clearAll } =
    useAdminNotificationStore();

  const TYPE_ICONS: Record<string, string> = {
    order: '📦',
    system: '🔔',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="absolute bottom-14 right-0 w-96 max-w-[calc(100vw-2rem)] bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden z-50"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <h3 className="text-white font-bold text-sm">Admin Notifications</h3>
        <div className="flex items-center gap-2">
          {notifications.some((n) => !n.read) && (
            <button onClick={markAllAsRead} className="text-xs text-yellow-400 hover:text-yellow-300">
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button onClick={clearAll} className="text-xs text-gray-400 hover:text-red-400">
              Clear all
            </button>
          )}
          <button onClick={onClose} className="text-gray-400 hover:text-white ml-1">✕</button>
        </div>
      </div>
      <div className="max-h-[420px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <span className="text-4xl mb-2">🔔</span>
            <p className="text-sm">No notifications</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`flex items-start gap-3 px-4 py-3 border-b border-gray-800 cursor-pointer hover:bg-gray-800/50 transition-colors ${notif.read ? 'opacity-60' : ''}`}
              onClick={() => markAsRead(notif.id)}
            >
              <span className="text-xl shrink-0 mt-0.5">{TYPE_ICONS[notif.type] || '🔔'}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-semibold truncate ${notif.read ? 'text-gray-400' : 'text-white'}`}>
                    {notif.title}
                  </p>
                  {!notif.read && <span className="shrink-0 w-2 h-2 bg-yellow-400 rounded-full" />}
                </div>
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{notif.message}</p>
                <p className="text-xs text-gray-500 mt-1">{timeAgo(notif.timestamp)}</p>
              </div>
              <button
                className="text-gray-500 hover:text-red-400 shrink-0 transition-colors"
                onClick={(e) => { e.stopPropagation(); removeNotification(notif.id); }}
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}

export default function AdminNotificationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const { addNotification, getUnreadCount } = useAdminNotificationStore();

  useEffect(() => {
    setIsMounted(true);
    // Request browser notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    return () => { stopOrderAlertSound(); };
  }, []);

  // Start/stop looping sound based on pending orders
  useEffect(() => {
    if (pendingOrders.length > 0) {
      startOrderAlertSound();
      // Update page title to show pending orders
      document.title = `(${pendingOrders.length} New Order${pendingOrders.length > 1 ? 's' : ''}) Admin Panel`;
    } else {
      stopOrderAlertSound();
      document.title = 'Admin Panel';
    }
  }, [pendingOrders]);

  const handleNewOrder = useCallback((data: any) => {
    addNotification({
      type: 'order',
      title: `New Order #${data._id?.slice(-6).toUpperCase()}`,
      message: `₹${data.totalAmount?.toFixed(2)} from ${data.customerName || 'Customer'} — ${data.items?.length || 0} item(s)`,
      data,
    });
    setPendingOrders((prev) => [...prev, data]);

    // Browser notification when tab is hidden
    if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
      const n = new Notification('🔔 New Order Received!', {
        body: `Order #${data._id?.slice(-6).toUpperCase()} — ₹${data.totalAmount?.toFixed(2)}`,
        icon: '/favicon.ico',
        requireInteraction: true,
      });
      n.onclick = () => { window.focus(); n.close(); };
    }
  }, [addNotification]);

  const handleOrderUpdate = useCallback(({ action, data }: any) => {
    if (data?.status === 'confirmed' || data?.status === 'cancelled') {
      // Remove from pending when accepted or rejected
      setPendingOrders((prev) => prev.filter((o) => o._id !== data._id));
    }
    addNotification({
      type: 'order',
      title: `Order #${data._id?.slice(-6).toUpperCase()} ${data.status === 'confirmed' ? 'Confirmed' : 'Updated'}`,
      message: `Status changed to: ${data.status}`,
      data,
    });
  }, [addNotification]);

  const handleGeneral = useCallback((event: string, action: string, data: any) => {
    const eventTitles: Record<string, string> = {
      'foods:update': `Food ${action}: ${data?.name || ''}`,
      'categories:update': `Category ${action}: ${data?.name || ''}`,
      'coupons:update': `Coupon ${action}: ${data?.code || ''}`,
      'announcements:update': `Announcement ${action}: ${data?.title || ''}`,
      'customers:update': `Customer ${action}`,
      'settings:update': 'Settings updated',
    };
    addNotification({
      type: 'system',
      title: eventTitles[event] || `${event} — ${action}`,
      message: `Admin action recorded at ${new Date().toLocaleTimeString()}`,
      data,
    });
    playNotificationSound();
  }, [addNotification]);

  const dismissPendingOrder = useCallback((orderId: string) => {
    setPendingOrders((prev) => prev.filter((o) => o._id !== orderId));
  }, []);

  useAdminRealtimeOrders(handleNewOrder, handleOrderUpdate);
  useAdminRealtimeGeneral(handleGeneral);

  // Only render dynamic content after client hydration
  if (!isMounted) {
    return (
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        <button
          className="relative w-14 h-14 rounded-full bg-gray-900 border border-gray-600 shadow-2xl flex items-center justify-center text-2xl hover:border-yellow-400 transition-colors"
          title="Admin Notifications"
        >
          <span>🔔</span>
        </button>
      </div>
    );
  }

  const unreadCount = getUnreadCount();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Persistent order alerts */}
      <AnimatePresence>
        {pendingOrders.map((order) => (
          <OrderAlertBanner
            key={order._id}
            order={order}
            onDismiss={dismissPendingOrder}
          />
        ))}
      </AnimatePresence>

      {/* Notification drawer */}
      <div className="relative">
        <AnimatePresence>
          {isOpen && <NotificationDrawer onClose={() => setIsOpen(false)} />}
        </AnimatePresence>

        {/* Bell button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen((o) => !o)}
          className="relative w-14 h-14 rounded-full bg-gray-900 border border-gray-600 shadow-2xl flex items-center justify-center text-2xl hover:border-yellow-400 transition-colors"
          title="Admin Notifications"
        >
          <motion.span
            animate={pendingOrders.length > 0 || unreadCount > 0
              ? { rotate: [0, -20, 20, -15, 15, 0] }
              : {}
            }
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
          >
            🔔
          </motion.span>
          {(unreadCount > 0 || pendingOrders.length > 0) && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
            >
              {unreadCount + pendingOrders.length > 99 ? '99+' : unreadCount + pendingOrders.length}
            </motion.span>
          )}
        </motion.button>
      </div>
    </div>
  );
}
