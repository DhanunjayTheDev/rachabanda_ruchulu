'use client';

import { useEffect, useCallback } from 'react';
import { useNotificationStore } from '@/store/useNotificationStore';
import {
  useRealtimeFoods,
  useRealtimeCategories,
  useRealtimeCoupons,
  useRealtimeAnnouncements,
  useRealtimeOrders,
  useRealtimeSettings,
} from '@/hooks/useRealtime';
import useStore from '@/store/useStore';

export default function GlobalRealtimeProvider() {
  const { addNotification } = useNotificationStore();
  const { user, isLoggedIn } = useStore();

  // Request notification permission only after user logs in
  useEffect(() => {
    if (isLoggedIn() && user && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [user, isLoggedIn]);

  const handleFoods = useCallback(
    (action: string, data: any) => {
      if (action === 'created') {
        addNotification({
          type: 'food',
          title: 'New Dish Added!',
          message: `${data.name} is now available on the menu.`,
          data,
        });
      } else if (action === 'updated') {
        addNotification({
          type: 'food',
          title: 'Menu Updated',
          message: `${data.name} has been updated.`,
          data,
        });
      } else if (action === 'deleted') {
        addNotification({
          type: 'food',
          title: 'Dish Removed',
          message: 'A dish has been removed from the menu.',
          data,
        });
      }
    },
    [addNotification]
  );

  const handleCategories = useCallback(
    (action: string, data: any) => {
      if (action === 'created') {
        addNotification({
          type: 'category',
          title: 'New Category',
          message: `Category "${data.name}" has been added.`,
          data,
        });
      } else if (action === 'updated') {
        addNotification({
          type: 'category',
          title: 'Category Updated',
          message: `Category "${data.name}" has been updated.`,
          data,
        });
      }
    },
    [addNotification]
  );

  const handleCoupons = useCallback(
    (action: string, data: any) => {
      if (action === 'created') {
        addNotification({
          type: 'coupon',
          title: '🎉 New Coupon Available!',
          message: `Use code ${data.code} for ${data.discountType === 'percentage' ? `${data.discountValue}% off` : `₹${data.discountValue} off`}!`,
          data,
        });
      } else if (action === 'updated') {
        addNotification({
          type: 'coupon',
          title: 'Coupon Updated',
          message: `Coupon ${data.code} has been updated.`,
          data,
        });
      } else if (action === 'deleted') {
        addNotification({
          type: 'coupon',
          title: 'Coupon Expired',
          message: 'A coupon has been removed.',
          data,
        });
      }
    },
    [addNotification]
  );

  const handleAnnouncements = useCallback(
    (action: string, data: any) => {
      if (action === 'created') {
        addNotification({
          type: 'announcement',
          title: `📢 ${data.title}`,
          message: data.description || 'New announcement from the restaurant.',
          data,
        });
      } else if (action === 'updated') {
        addNotification({
          type: 'announcement',
          title: 'Announcement Updated',
          message: data.title,
          data,
        });
      }
    },
    [addNotification]
  );

  const handleOrders = useCallback(
    (action: string, data: any) => {
      // Only show to the order owner
      if (user && data.user && data.user.toString && data.user.toString() !== user.id) return;
      if (user && typeof data.user === 'string' && data.user !== user.id) return;

      if (action === 'updated' && (data.status || data.ordersStatus)) {
        const orderStatus = data.status || data.ordersStatus;
        const statusMessages: Record<string, string> = {
          confirmed: 'Your order has been confirmed! 🎉',
          preparing: 'Your order is being prepared 👨‍🍳',
          ready: 'Your order is ready for pickup! 🍽️',
          'out-for-delivery': 'Your order is out for delivery! 🛵',
          delivered: 'Your order has been delivered! Enjoy your meal 😋',
          cancelled: 'Your order has been cancelled.',
        };
        const msg = statusMessages[orderStatus];
        if (msg) {
          addNotification({
            type: 'order',
            title: `Order #${data._id?.slice(-6).toUpperCase() || data.orderId || 'Update'}`,
            message: msg,
            data,
          });
        }
      } else if (action === 'created') {
        addNotification({
          type: 'order',
          title: 'Order Placed Successfully!',
          message: `Your order #${data._id?.slice(-6).toUpperCase() || data.orderId} has been placed.`,
          data,
        });
      }
    },
    [addNotification, user]
  );

  const handleSettings = useCallback(
    (data: any) => {
      addNotification({
        type: 'settings',
        title: 'Restaurant Update',
        message: data.isOpen === false ? 'The restaurant is currently closed.' : 'Restaurant settings have been updated.',
        data,
      });
    },
    [addNotification]
  );

  useRealtimeFoods(handleFoods);
  useRealtimeCategories(handleCategories);
  useRealtimeCoupons(handleCoupons);
  useRealtimeAnnouncements(handleAnnouncements);
  useRealtimeOrders(handleOrders);
  useRealtimeSettings(handleSettings);

  return null;
}
