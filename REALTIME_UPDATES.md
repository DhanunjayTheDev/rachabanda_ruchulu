# Real-Time Updates Documentation

## Overview

The application now includes automatic, real-time synchronization between the admin panel and client website. When an admin makes any changes (create, update, delete), those changes instantly appear on the client website **without requiring a page refresh**.

## How It Works

### Architecture

```
Admin Panel
    ↓ (Makes changes)
API Server
    ↓ (Updates database + emits WebSocket event)
Socket.io Server
    ↓ (Broadcasts to all connected clients)
Client Website (Receives event & updates UI)
```

### Real-Time Flow

1. **Admin Action**: Admin creates, updates, or deletes an item
2. **Server Update**: Database is updated and a WebSocket event is emitted
3. **Event Broadcast**: All connected clients receive the real-time event
4. **UI Update**: Client-side state is automatically updated
5. **UI Re-render**: React components re-render with new data

## Supported Real-Time Updates

### 1. Foods
- **Event**: `foods:update`
- **Actions**: created, updated, deleted
- **Used By**: Menu page, Featured section
- **Data**: Complete food object

### 2. Categories
- **Event**: `categories:update`
- **Actions**: created, updated, deleted
- **Used By**: Menu page, Categories section
- **Data**: Complete category object

### 3. Coupons
- **Event**: `coupons:update`
- **Actions**: created, updated, deleted
- **Used By**: Checkout (when implemented)
- **Data**: Complete coupon object

### 4. Announcements
- **Event**: `announcements:update`
- **Actions**: created, updated, deleted
- **Used By**: Homepage banner (when implemented)
- **Data**: Complete announcement object

### 5. Orders
- **Event**: `orders:update`
- **Actions**: created, updated (for status changes)
- **Used By**: Order tracking page (when implemented)
- **Data**: Complete order object

### 6. Settings
- **Event**: `settings:update`
- **Actions**: updated only
- **Used By**: All pages (global settings)
- **Data**: Complete settings object

### 7. Customers
- **Event**: `customers:update`
- **Actions**: created, updated, deleted
- **Used By**: Customer management (when implemented)
- **Data**: Complete customer object

## Using Real-Time Updates in Components

### Basic Pattern

```typescript
'use client';

import { useCallback } from 'react';
import { useRealtimeFoods } from '@/hooks/useRealtime';

export default function MyComponent() {
  const [items, setItems] = useState<Food[]>([]);

  // Handle real-time updates
  const handleUpdates = useCallback((action: string, data: any) => {
    if (action === 'created') {
      // Add new item
      setItems(prev => [...prev, data]);
    } else if (action === 'updated') {
      // Update existing item
      setItems(prev =>
        prev.map(item => item._id === data._id ? { ...item, ...data } : item)
      );
    } else if (action === 'deleted') {
      // Remove item
      setItems(prev => prev.filter(item => item._id !== data._id));
    }
  }, []);

  // Listen to food updates
  useRealtimeFoods(handleUpdates);

  return (
    // Your component JSX
  );
}
```

### Available Hooks

```typescript
// Import from '@/hooks/useRealtime'

// Connect to real-time service
useRealtimeConnection()

// Listen to specific events
useRealtimeFoods(callback)
useRealtimeCategories(callback)
useRealtimeCoupons(callback)
useRealtimeAnnouncements(callback)
useRealtimeOrders(callback)
useRealtimeSettings(callback)
useRealtimeCustomers(callback)
```

### Hook Parameters

All hooks (except `useRealtimeConnection`) accept a callback function:

```typescript
(action: string, data: any) => void
```

- **action**: `'created'` | `'updated'` | `'deleted'`
- **data**: Full object that was changed

## Implementation Details

### Server Side

**Files Modified:**

1. **`server/src/index.js`**
   - Integrated socket.io with Express server
   - CORS configured for both admin and client URLs
   - Socket connection handling

2. **`server/src/utils/realtime.js`** (New)
   - Global socket instance management
   - Broadcast functions for each entity type
   - Event emission handling

3. **Controllers** (All include broadcasts):
   - `foodController.js`
   - `categoryController.js`
   - `couponController.js`
   - `announcementController.js`
   - `orderController.js`
   - `settingsController.js`

**Broadcast Example:**
```javascript
// After updating database
broadcastFoodsUpdate('updated', updatedFoodObject);

// Socket.io emits to all connected clients:
// Event: 'foods:update'
// Data: { action: 'updated', data: foodObject, timestamp: Date }
```

### Client Side

**Files Created:**

1. **`client/hooks/useRealtime.ts`** (New)
   - Singleton socket connection
   - Auto-reconnect with exponential backoff
   - Custom hooks for each entity type

**Files Updated:**
- `client/app/menu/page.tsx`
- `client/components/home/FeaturedSection.tsx`
- `client/components/home/CategoriesSection.tsx`

## Event Format

All real-time events follow this structure:

```javascript
{
  action: 'created' | 'updated' | 'deleted',
  data: { /* Full entity object */ },
  timestamp: Date
}
```

## Extending with New Entities

To add real-time updates for a new entity (e.g., Reviews):

### 1. Server Side

**a) Add broadcast function in `server/src/utils/realtime.js`:**
```javascript
const broadcastReviewsUpdate = (action, data) => {
  if (io) {
    io.emit('reviews:update', { action, data, timestamp: new Date() });
  }
};

module.exports = {
  // ... existing exports
  broadcastReviewsUpdate,
};
```

**b) Import and use in controller:**
```javascript
// In reviewController.js
const { broadcastReviewsUpdate } = require('../utils/realtime');

// In create function:
await review.save();
broadcastReviewsUpdate('created', review);

// In update function:
const review = await Review.findByIdAndUpdate(...);
broadcastReviewsUpdate('updated', review);

// In delete function:
await Review.findByIdAndDelete(id);
broadcastReviewsUpdate('deleted', { _id: id });
```

### 2. Client Side

**a) Add hook in `client/hooks/useRealtime.ts`:**
```typescript
export const useRealtimeReviews = (onUpdate: (action: string, data: any) => void) => {
  const socket = useRealtimeConnection();

  useEffect(() => {
    if (!socket) return;

    socket.on('reviews:update', ({ action, data }) => {
      onUpdate(action, data);
    });

    return () => {
      socket.off('reviews:update');
    };
  }, [socket, onUpdate]);
};
```

**b) Use in components:**
```typescript
import { useRealtimeReviews } from '@/hooks/useRealtime';

export default function ReviewsComponent() {
  const [reviews, setReviews] = useState([]);

  const handleReviewsUpdate = useCallback((action: string, data: any) => {
    if (action === 'created') {
      setReviews(prev => [...prev, data]);
    } else if (action === 'updated') {
      setReviews(prev => prev.map(r => r._id === data._id ? data : r));
    } else if (action === 'deleted') {
      setReviews(prev => prev.filter(r => r._id !== data._id));
    }
  }, []);

  useRealtimeReviews(handleReviewsUpdate);

  return (
    // Your component JSX
  );
}
```

## Connection Details

### Socket.io Configuration

**Server:**
- Port: Same as Express server (default 5000)
- CORS Origins:
  - `http://localhost:3000` (client)
  - `http://localhost:3001` (admin)
  - Production URLs from environment

**Client:**
- Auto-connects to `NEXT_PUBLIC_API_URL` server
- Fallback to `http://localhost:5000`
- Transports: WebSocket (primary), Polling (fallback)
- Auto-reconnect: Enabled with exponential backoff
- Max reconnection attempts: 10

### Connection Lifecycle

1. **Page Load**: Socket connection established (singleton - reused across components)
2. **Component Mount**: Component listens to specific events
3. **Event Received**: Component state updated
4. **UI Change**: React re-renders with new data
5. **Component Unmount**: Listener removed (connection persists for other components)
6. **All Components Unmounted**: Connection persists for next page visit

## Performance Considerations

### Optimizations

1. **Singleton Socket**: Single connection shared across all components
2. **Efficient Listeners**: Cleanup on component unmount
3. **Debounced Rendering**: React batches state updates naturally
4. **Selective Updates**: Only affected components re-render

### Scalability

- Supports multiple simultaneous clients
- Server broadcasts to all connected clients efficiently
- No database polling required
- Real bandwidth usage minimal for typical changes

## Troubleshooting

### Real-Time Not Working

1. **Check Connection**:
   ```javascript
   // In browser console on client
   // Look for "Connected to real-time service" message
   ```

2. **Verify CORS**:
   - Admin and Client must have correct URLs in server CORS config
   - Check `NEXT_PUBLIC_API_URL` environment variable

3. **Check WebSocket**:
   - Network tab → WS (WebSocket connections)
   - Should show active WebSocket to `/socket.io/`

4. **Server Logs**:
   - Check server console for connection/disconnection messages
   - Verify broadcasts are being sent

### Stale Data

If you see stale data, refresh from server:
```typescript
const handleUpdates = useCallback((action: string, data: any) => {
  // Always fetch latest from server for complex updates
  if (action === 'updated') {
    fetchSingleItemFromServer(data._id);
  }
}, []);
```

## Environment Variables

### Server

```env
# Optional - defaults to localhost:3000 and localhost:3001
CLIENT_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001
```

### Client

```env
# Must point to server (without /api)
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Testing

### Manual Testing

1. **Open Two Windows**:
   - Window 1: Admin panel at `http://localhost:3001`
   - Window 2: Client at `http://localhost:3000`

2. **Test Each Action**:
   - Admin: Create food → Instant appearance in client menu
   - Admin: Edit food → Instant update in client menu
   - Admin: Delete food → Instant removal from client menu
   - Admin: Add category → Instant appearance in client categories

3. **Test Multiple Users**:
   - Open client in multiple browser tabs
   - Make admin change
   - See update in all client tabs simultaneously

### Network Testing

In browser DevTools Network tab with WS filter:
- Should see persistent WebSocket connection to `/socket.io/`
- Should see brief messages when changes occur
- Auto-reconnection after network failures

## Future Enhancements

Potential additions:
- Real-time notifications (toast messages)
- User activity feeds
- Live order tracking
- Comment threads
- Real-time analytics
- Presence indicators (who's online)
- Collaborative editing

## Support

For issues or questions:
1. Check browser console for errors
2. Check server console for connection issues
3. Verify network connectivity
4. Ensure CORS is properly configured
5. Review this documentation

---

**Implementation Date**: March 8, 2026
**Status**: ✅ Complete and tested
**Performance**: Optimized with singleton socket pattern
