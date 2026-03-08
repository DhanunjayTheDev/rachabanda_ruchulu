# Real-Time Updates - Debugging Guide

## Quick Checklist

### 1. Restart the Server
This is **critical** - the server must be restarted to load the socket.io changes.

```bash
cd server
npm run dev
```

Wait for message: `✅ Real-time service initialized with socket.io`

### 2. Check Server Console

After restarting, you should see:
```
🔌 Initializing real-time service with socket.io
✅ Real-time service initialized with socket.io
✅ Real-time client connected: [socket-id]
```

### 3. Open Client in Browser

Open `http://localhost:3000` and **check the browser console** (F12 or Ctrl+Shift+I).

You should see:
```
🔌 Socket URL: http://localhost:5000
✅ Socket connected: [socket-id]
✅ Reusing existing socket connection
🔔 Registering foods:update listener
🔔 Registering categories:update listener
```

### 4. Test with Admin Panel

1. Keep both windows open:
   - Admin: `http://localhost:3001`
   - Client: `http://localhost:3000` (with console open)

2. In Admin Panel, create a new food or category

3. Check:
   - **Server Console**: Should show `📨 Broadcasting foods:update (created): ...`
   - **Client Console**: Should show `📨 Received foods:update event: ...`
   - **Client UI**: Should instantly show the new item

## Common Issues & Fixes

### Issue: Socket URL is wrong
**Fix**: Check `NEXT_PUBLIC_API_URL` environment variable
- Should be: `http://localhost:5000/api` (development)
- Socket connects to: `http://localhost:5000`

### Issue: "Socket not available" warning
**Fix**: Socket might still be connecting. Wait a moment and refresh.

### Issue: Server shows connection but client doesn't show in console
**Fix**: 
1. Hard refresh client (Ctrl+Shift+R)
2. Check Network tab → WebSocket connections
3. Should see active WS to `/socket.io/`

### Issue: Broadcasts showing in server but not in client
**Fix**: Check browser console for CORS or connection errors

## Testing Steps

### Step 1: Verify Server is Ready
```bash
# In server terminal, should see:
✅ Real-time client connected: [socket-id]
```

### Step 2: Verify Client Connection
```
In browser console (F12):
🔌 Socket URL: http://localhost:5000
✅ Socket connected: [socket-id]
```

### Step 3: Create Test Food in Admin
1. Go to `http://localhost:3001/admin/foods`
2. Click "Add Food"
3. Fill details and submit
4. Watch both consoles:
   - Server: `📨 Broadcasting foods:update`
   - Client: `📨 Received foods:update event`

### Step 4: Check Menu Page
1. In client, go to `http://localhost:3000/menu`
2. The new food should appear instantly in the menu

## Manual Socket Test

In browser console on client page, test manually:

```javascript
// Check if socket exists
console.log('Socket URL:', 'http://localhost:5000');

// Try to connect
const testSocket = io('http://localhost:5000');
testSocket.on('connect', () => console.log('Manual test: Connected!'));
testSocket.on('foods:update', (data) => console.log('Received:', data));
```

## Environment Variables Check

### Client (.env.local or .env)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Server (.env)
```
CLIENT_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001
PORT=5000
```

## Logs to Watch

### Server should show:
```
🔌 Initializing real-time service with socket.io
✅ Real-time service initialized with socket.io
✅ Real-time client connected: [socket-id]
📨 Broadcasting foods:update (created): { id: '...', name: 'Pizza' }
```

### Client should show:
```
🔌 Socket URL: http://localhost:5000
✅ Socket connected: [socket-id]
🔔 Registering foods:update listener
📨 Received foods:update event: { action: 'created', data: {...} }
🎯 FeaturedSection received food update: { action: 'created', data: {...} }
```

## Network Tab Check

In browser DevTools → Network tab:

1. Filter by "WS" (WebSocket)
2. You should see:
   - `/socket.io/` connection
   - Status: 101 Switching Protocols
   - Type: websocket

## If Still Not Working

1. **Restart everything**:
   ```bash
   # Kill all processes
   # Terminal 1: npm run dev (in server)
   # Terminal 2: npm run dev (in admin)  
   # Terminal 3: npm run dev (in client)
   ```

2. **Hard refresh client** (Ctrl+Shift+R)

3. **Check for errors**:
   - Browser console (F12)
   - Network tab (XHR errors)
   - Terminal output (yellow/red text)

4. **Clear browser cache**:
   - DevTools → Application → Clear site data
   - Or use Incognito mode

## Debug Mode

To enable more detailed logging, edit `client/hooks/useRealtime.ts` and change:

```typescript
const SOCKET_DEBUG = true; // Add this

if (SOCKET_DEBUG) {
  socket.onAny((event, ...args) => {
    console.log('📡 Socket event:', event, args);
  });
}
```

This will log ALL socket events, not just the ones you're listening to.
