require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/database');
const createDefaultAdmin = require('./utils/createDefaultAdmin');
const errorHandler = require('./middleware/errorHandler');

const app = express();

const startServer = async () => {
  // Connect to database
  await connectDB();

  // Create default admin
  await createDefaultAdmin();

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

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

module.exports = app;
