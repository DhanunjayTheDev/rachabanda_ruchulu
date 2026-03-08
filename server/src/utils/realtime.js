// Global socket.io instance for broadcasting real-time updates
let io = null;

const initializeRealtime = (socketIoInstance) => {
  io = socketIoInstance;
  console.log('✅ Real-time service initialized with socket.io');
};

const getRealtime = () => io;

// Broadcast functions for different entities
const broadcastFoodsUpdate = (action, data) => {
  if (io) {
    console.log(`📨 Broadcasting foods:update (${action}):`, { id: data._id, name: data.name });
    io.emit('foods:update', { action, data, timestamp: new Date() });
  } else {
    console.warn('⚠️ Socket.io not initialized, cannot broadcast foods update');
  }
};

const broadcastCategoriesUpdate = (action, data) => {
  if (io) {
    console.log(`📨 Broadcasting categories:update (${action}):`, { id: data._id, name: data.name });
    io.emit('categories:update', { action, data, timestamp: new Date() });
  } else {
    console.warn('⚠️ Socket.io not initialized, cannot broadcast categories update');
  }
};

const broadcastCouponsUpdate = (action, data) => {
  if (io) {
    io.emit('coupons:update', { action, data, timestamp: new Date() });
  }
};

const broadcastAnnouncementsUpdate = (action, data) => {
  if (io) {
    io.emit('announcements:update', { action, data, timestamp: new Date() });
  }
};

const broadcastOrdersUpdate = (action, data) => {
  if (io) {
    io.emit('orders:update', { action, data, timestamp: new Date() });
  }
};

const broadcastSettingsUpdate = (data) => {
  if (io) {
    io.emit('settings:update', { data, timestamp: new Date() });
  }
};

const broadcastCustomerUpdate = (action, data) => {
  if (io) {
    io.emit('customers:update', { action, data, timestamp: new Date() });
  }
};

module.exports = {
  initializeRealtime,
  getRealtime,
  broadcastFoodsUpdate,
  broadcastCategoriesUpdate,
  broadcastCouponsUpdate,
  broadcastAnnouncementsUpdate,
  broadcastOrdersUpdate,
  broadcastSettingsUpdate,
  broadcastCustomerUpdate,
};
