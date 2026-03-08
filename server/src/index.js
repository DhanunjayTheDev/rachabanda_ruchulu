require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/database');
const createDefaultAdmin = require('./utils/createDefaultAdmin');
const initializeCategories = require('./utils/initializeCategories');
const errorHandler = require('./middleware/errorHandler');
const { initializeRealtime } = require('./utils/realtime');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [process.env.CLIENT_URL || 'http://localhost:3000', process.env.ADMIN_URL || 'http://localhost:3001'],
    methods: ['GET', 'POST'],
  },
});

const startServer = async () => {
  // Connect to database
  await connectDB();

  // Create default admin
  await createDefaultAdmin();

  // Initialize categories
  await initializeCategories();

  // Middleware
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/', (req, res) => {
    res.json({ message: 'Rachabanda Ruchulu API Server' });
  });

  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/users', require('./routes/users'));
  app.use('/api/foods', require('./routes/foods'));
  app.use('/api/categories', require('./routes/categories'));
  app.use('/api/cart', require('./routes/cart'));
  app.use('/api/wishlist', require('./routes/wishlist'));
  app.use('/api/orders', require('./routes/orders'));
  app.use('/api/payments', require('./routes/payments'));
  app.use('/api/contact', require('./routes/contact'));
  app.use('/api/announcements', require('./routes/announcements'));
  app.use('/api/coupons', require('./routes/coupons'));
  app.use('/api/admin', require('./routes/admin'));

  // Public settings route (no auth required - for client UI)
  app.get('/api/settings', async (req, res) => {
    try {
      const Settings = require('./models/Settings');
      let settings = await Settings.findOne();
      if (!settings) settings = await Settings.create({});
      res.json({ success: true, settings });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.use(errorHandler);

  // Initialize real-time service
  console.log('🔌 Initializing real-time service with socket.io');
  initializeRealtime(io);

  // Socket.io connection handling
  io.on('connection', (socket) => {
    console.log(`✅ Real-time client connected: ${socket.id}`);
    socket.emit('connected', { message: 'Connected to real-time service' });
    socket.on('disconnect', () => {
      console.log(`❌ Real-time client disconnected: ${socket.id}`);
    });
  });

  // Auto-cancel pending_payment orders after 5 minutes
  setInterval(async () => {
    try {
      const Order = require('./models/Order');
      const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
      const result = await Order.updateMany(
        {
          status: 'pending_payment',
          createdAt: { $lt: fiveMinsAgo }
        },
        {
          $set: { status: 'cancelled' },
          $push: {
            statusTimeline: {
              status: 'cancelled',
              timestamp: new Date(),
              notes: 'Auto-cancelled due to payment timeout (5 mins)'
            }
          }
        }
      );
      if (result.modifiedCount > 0) {
        console.log(`🧹 Auto-cancelled ${result.modifiedCount} stale pending orders.`);
      }
    } catch (err) {
      console.error('Failed to auto-cancel orders:', err);
    }
  }, 60000); // Check every minute

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

module.exports = app;
