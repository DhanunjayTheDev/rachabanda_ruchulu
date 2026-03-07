# SERVER (Backend) README

Node.js/Express.js backend with MongoDB integration for food ordering platform.

## 🚀 Quick Start

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your values
npm run dev
```

Server runs on http://localhost:5000

## 📁 Structure

```
src/
├── models/             # Mongoose schemas
│   ├── User.js
│   ├── Food.js
│   ├── Order.js
│   ├── Category.js
│   ├── Cart.js
│   ├── Payment.js
│   ├── Address.js
│   ├── Review.js
│   ├── Coupon.js
│   ├── Admin.js
│   ├── Restaurant.js
│   └── Notification.js
│
├── routes/             # API endpoints
│   ├── auth.js         # Auth routes
│   ├── users.js        # User routes
│   ├── foods.js        # Food routes
│   ├── categories.js   # Category routes
│   ├── cart.js         # Cart routes
│   ├── orders.js       # Order routes
│   ├── payments.js     # Payment routes
│   └── admin.js        # Admin routes
│
├── middleware/         # Custom middleware
│   ├── auth.js         # JWT verification
│   └── errorHandler.js # Error handling
│
├── config/             # Configuration
│   ├── database.js     # MongoDB connection
│   └── jwt.js          # JWT utilities
│
├── utils/              # Helper functions
│   └── helpers.js      # Utilities
│
└── index.js            # Server entry point
```

## 🔧 Configuration

### .env Variables

```env
# Database
MONGODB_URI=mongodb://admin:password@localhost:27017/rachabanda?authSource=admin

# Server
NODE_ENV=development
PORT=5000

# JWT
JWT_SECRET=your-super-secret-key-change-in-production

# Cloudinary (Image Upload)
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay (Payments)
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

# Google Maps
GOOGLE_MAPS_API_KEY=your_maps_key
```

## 📦 Dependencies

- express: Web framework
- mongoose: MongoDB ODM
- jsonwebtoken: JWT auth
- bcryptjs: Password hashing
- dotenv: Environment variables
- cors: Cross-origin requests
- helmet: Security headers
- express-validator: Input validation
- axios: HTTP requests
- multer: File uploads
- cloudinary: Image hosting
- razorpay: Payment gateway

## 🔌 API Routes

### Authentication (`/api/auth`)
```
POST /register    - Create new account
POST /login       - Login user
POST /logout      - Logout user
```

### Foods (`/api/foods`)
```
GET  /           - Get all foods (with filters)
GET  /:id        - Get single food
GET  /featured   - Get featured foods
GET  /bestsellers - Get bestselling foods
```

### Categories (`/api/categories`)
```
GET  /          - Get all categories
GET  /:id       - Get category by ID
POST /          - Create category (admin)
PUT  /:id       - Update category (admin)
DELETE /:id     - Delete category (admin)
```

### Cart (`/api/cart`)
```
POST   /add              - Add item to cart
GET    /                 - Get user cart
PUT    /update/:itemId   - Update item quantity
DELETE /remove/:itemId   - Remove item
DELETE /clear            - Clear cart
```

### Orders (`/api/orders`)
```
POST   /              - Create new order
GET    /              - Get user orders
GET    /:id           - Get order details
GET    /admin/        - Get all orders (admin)
PUT    /admin/:id/status - Update order status (admin)
```

### Payments (`/api/payments`)
```
POST /create-order - Create payment order
POST /verify       - Verify payment
```

### Users (`/api/users`)
```
GET    /profile              - Get user profile
PUT    /profile              - Update profile
GET    /addresses            - Get user addresses
POST   /addresses            - Add address
PUT    /addresses/:id        - Update address
DELETE /addresses/:id        - Delete address
```

### Admin (`/api/admin`)
```
GET    /orders           - Get all orders
PUT    /orders/:id/status - Update order status
POST   /foods            - Create food
PUT    /foods/:id        - Update food
DELETE /foods/:id        - Delete food
POST   /categories       - Create category
PUT    /categories/:id   - Update category
DELETE /categories/:id   - Delete category
```

## 🔐 Authentication

Uses JWT for secure endpoints:

```javascript
// Protected route example
router.get('/profile', auth, async (req, res) => {
  // req.userId is set by auth middleware
});

// Admin-only route
router.post('/admin/foods', adminAuth, async (req, res) => {
  // Only admin can access
});
```

## 💾 Database Collections

### users
Customer accounts with profile info, addresses, and order history.

### foods
Menu items with pricing, descriptions, images, and ratings.

### orders
Customer orders with items, delivery details, and status tracking.

### categories
Food categories for organization.

### cart
Shopping carts for each user.

### payments
Payment records with Razorpay details.

### addresses
Customer delivery addresses with geolocation.

### And more...
See `models/` folder for all schemas.

## 🚀 Running

### Development
```bash
npm run dev
```

### Production
```bash
NODE_ENV=production npm start
```

### Docker
```bash
docker build -t rachabanda-server .
docker run -p 5000:5000 -e MONGODB_URI=... rachabanda-server
```

## 🔄 Git Workflow

```bash
# Create feature branch
git checkout -b feature/food-management

# Commit changes
git commit -m "Add food management API"

# Push and create PR
git push origin feature/food-management
```

## 📝 Code Style

- Use async/await
- Validate all inputs
- Return meaningful errors
- Document complex logic
- Use consistent naming

## 🐛 Common Issues

**MongoDB Connection Error**
```
Ensure MONGODB_URI is correct and MongoDB is running
```

**Port Conflicts**
```
Change PORT in .env or kill process on port 5000
```

**JWT Errors**
```
Verify JWT_SECRET is set and consistent
```

## 📚 API Examples

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "password": "password123"
  }'
```

### Get Foods with Filters
```bash
curl http://localhost:5000/api/foods?category=biryani&veg=false&priceMin=200&priceMax=400
```

### Create Order
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deliveryType": "delivery",
    "deliveryAddressId": "ADDRESS_ID",
    "paymentMethod": "razorpay"
  }'
```

---

**Built for Rachabanda Ruchulu**
