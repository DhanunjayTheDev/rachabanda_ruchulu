# Real-Time Testing Instructions

## Step 1: Reload Client Page
In client browser (http://localhost:3000), press **Ctrl+Shift+R** to hard refresh and clear cache.

## Step 2: Wait for Connection
In browser console (F12), wait for:
```
✅ Socket connected: [socket-id]
🔔 Registering foods:update listener
🔔 Registering categories:update listener
```

## Step 3: Test Food Creation
1. Open admin panel: `http://localhost:3001`
2. Go to Foods section
3. Click "Add Food"
4. Fill in details:
   - Name: "Test Pizza"
   - Price: 250
   - Category: Any
   - Image: Any
5. Click Submit

## Step 4: Watch the Logs
1. **Server Console** - Should show:
   ```
   📨 Broadcasting foods:update (created): { id: '...', name: 'Test Pizza' }
   ```

2. **Client Console** - Should show:
   ```
   📨 Received foods:update event: { action: 'created', data: { id: '...', name: 'Test Pizza' } }
   🎯 FeaturedSection received food update: { action: 'created', data: {...} }
   ➕ Adding featured food to section (if marked as featured)
   ```

3. **Client UI** - Check:
   - Menu page: New food appears instantly
   - Admin deletes food: Instantly disappears from client menu
   - Admin updates food price: Price updates instantly in client

## If Not Working

1. **Check Server is Running**
   - Terminal should show: `✅ Real-time service initialized with socket.io`
   - Check for any red errors

2. **Check Client Console**
   - Should see: `✅ Socket connected: [id]`
   - If not, server might not be running

3. **Restart if Needed**
   ```bash
   # Kill server: Ctrl+C
   # Restart: npm run dev
   # Hard refresh client: Ctrl+Shift+R
   ```

4. **Try Different Actions**
   - Create new food
   - Update existing food
   - Delete food
   - Create new category

## Expected Results

✅ Changes appear instantly without page refresh
✅ Multiple clients see the same changes simultaneously
✅ Console shows all the emoji logs (📨, 🔔, ✅, etc.)
✅ No "Socket not available" warnings
