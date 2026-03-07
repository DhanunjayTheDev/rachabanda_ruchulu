# Rachabanda Ruchulu - Premium Food Ordering Platform

A production-ready, full-stack food ordering platform for a luxury restaurant with Apple-level UI design, 3D animations, and enterprise-grade backend.

## 🎯 Overview

Rachabanda Ruchulu is a premium food ordering system featuring:

- **Premium UI Design**: Apple/Google-level design with glassmorphism, smooth animations, and cinematic scrolling
- **3D Elements**: Three.js for interactive 3D food models
- **Full Stack**: Next.js frontend, Express.js backend, MongoDB database
- **Admin Dashboard**: Complete restaurant management system
- **Location Services**: GPS-based delivery detection and Google Maps integration
- **Payment Integration**: Razorpay payment gateway with COD option
- **Real-time Tracking**: Order tracking with status timeline
- **Authentication**: JWT-based secure authentication

---

## 🎨 Color Palette (From Logo)

```
PRIMARY_GOLD:       #D4AF37
ACCENT_GOLD:        #E7C873
DARK_BROWN:         #2B1D15
WARM_BROWN:         #5A3E2B
BACKGROUND_BLACK:   #0F0B08
```

---

## 📁 Project Structure

```
rachabanda_ruchulu/
├── client/                    # Next.js 14 Frontend App
│   ├── app/                   # App Router pages & layouts
│   ├── components/            # Reusable UI components
│   │   ├── home/             # Home page sections
│   │   └── shared/           # Header, Footer, etc.
│   ├── store/                # Zustand state management
│   ├── lib/                  # API client & utilities
│   ├── hooks/                # Custom React hooks
│   ├── public/               # Static assets
│   └── package.json
│
├── admin/                     # Next.js 14 Admin Dashboard
│   ├── app/                  # Admin pages
│   ├── components/           # Admin-specific components
│   └── package.json
│
├── server/                    # Node.js/Express Backend
│   ├── src/
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/           # API endpoints
│   │   ├── middleware/       # Auth, error handling
│   │   ├── config/           # Database, JWT config
│   │   ├── utils/            # Helper functions
│   │   └── index.js          # Server entry point
│   └── package.json
│
├── docker-compose.yml        # Multi-container setup
├── package.json              # Root workspace
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6.0+
- Docker & Docker Compose (optional)

### Local Development

```bash
# 1. Clone repository
git clone <repo-url>
cd rachabanda_ruchulu

# 2. Install all dependencies
npm install

# 3. Environment setup
cd server && cp .env.example .env
# Edit server/.env with your credentials

# 4. Start development servers
npm run dev

# Access:
# Frontend: http://localhost:3000
# Admin: http://localhost:3001
# Backend: http://localhost:5000
```

### Docker Setup

```bash
# Build and start all services
docker-compose up --build

# Stop services
docker-compose down

# View logs
docker-compose logs -f
```

---

## 📦 Tech Stack

### Frontend (Client)
- Next.js 14 with App Router
- TypeScript
- TailwindCSS + Custom CSS
- Framer Motion (animations)
- Three.js (3D elements)
- Zustand (state management)
- React Query (data fetching)
- Axios (HTTP client)

### Admin Dashboard
- Next.js 14
- Recharts (analytics & charts)
- Same styling as client

### Backend (Server)
- Node.js 18
- Express.js
- MongoDB 6.0
- Mongoose ODM
- JWT Authentication
- bcryptjs (password hashing)
- Environment-based config

### DevOps
- Docker & Docker Compose
- MongoDB service
- Multi-container orchestration

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
```

### Foods
```
GET    /api/foods              # With filters: ?category=, ?veg=, ?priceMin=, ?priceMax=
GET    /api/foods/:id
GET    /api/foods/featured
GET    /api/foods/bestsellers
```

### Categories
```
GET    /api/categories
GET    /api/categories/:id
POST   /api/admin/categories
PUT    /api/admin/categories/:id
DELETE /api/admin/categories/:id
```

### Cart
```
POST   /api/cart/add
GET    /api/cart
PUT    /api/cart/update/:itemId
DELETE /api/cart/remove/:itemId
DELETE /api/cart/clear
```

### Orders
```
POST   /api/orders
GET    /api/orders
GET    /api/orders/:id
GET    /api/admin/orders
PUT    /api/admin/orders/:id/status
```

### Payments
```
POST   /api/payments/create-order
POST   /api/payments/verify
```

### Users
```
GET    /api/users/profile
PUT    /api/users/profile
GET    /api/users/addresses
POST   /api/users/addresses
PUT    /api/users/addresses/:id
DELETE /api/users/addresses/:id
```

---

## 📚 Database Models

**Collections:**
- users (customer accounts)
- admins (restaurant staff)
- restaurant (settings & info)
- categories (food categories)
- foods (menu items)
- orders (customer orders)
- addresses (delivery addresses)
- cart (shopping carts)
- reviews (food ratings)
- payments (payment records)
- coupons (discount codes)
- notifications (user notifications)

---

## 🎬 Features

### User Frontend
✅ Premium glassmorphism design
✅ Smooth animations & transitions
✅ 3D rotating food elements
✅ Food menu with advanced filters
✅ Shopping cart management
✅ Multiple delivery addresses
✅ Real-time order tracking
✅ Order history
✅ User profile management
✅ Razorpay payment integration

### Admin Dashboard
✅ Revenue analytics
✅ Order statistics dashboard
✅ Real-time order management
✅ Food inventory management
✅ Category management
✅ Customer management
✅ Payment tracking
✅ Sales charts & graphs

---

## 🔐 Security

- JWT-based authentication
- Password hashing with bcryptjs
- CORS protection
- Helmet security middleware
- Input validation (express-validator)
- Environment variables for secrets
- MongoDB indexes for optimization

---

## 📈 Performance

- Next.js image optimization
- Code splitting & lazy loading
- Zustand lightweight state
- MongoDB query optimization
- Docker multi-stage builds
- Response compression
- Caching strategies

---

## 🚢 Deployment

### Environment Variables Required

**Server (.env)**
```
MONGODB_URI=mongodb://...
JWT_SECRET=your-secret
CLOUDINARY_NAME=...
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
GOOGLE_MAPS_API_KEY=...
```

**Client (.env.local)**
```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
NEXT_PUBLIC_RAZORPAY_KEY_ID=...
```

### Deploy Commands

```bash
# Build all
npm run build

# Production server
NODE_ENV=production npm start --workspace=server

# Production client
npm start --workspace=client
```

---

## 🛠️ Development

### Key Files to Modify

**To add a new Food Field:**
1. Update `server/src/models/Food.js`
2. Update food creation form in `client/components/`
3. Display on `client/app/food/[id]/page.tsx`

**To add a new API Endpoint:**
1. Create controller in `server/src/controllers/`
2. Create route in `server/src/routes/`
3. Import in `server/src/index.js`
4. Use with `apiClient` in frontend

**To add Admin Feature:**
1. Create page in `admin/app/`
2. Create component in `admin/components/`
3. Add to navigation

---

## 📝 Important Notes

1. **JWT Security**: Change `JWT_SECRET` for production
2. **Database**: Use MongoDB Atlas for production
3. **Uploads**: Set up Cloudinary account for image storage
4. **Payments**: Configure Razorpay for payment processing
5. **Maps**: Get Google Maps API key for location features

---

## 🐛 Troubleshooting

```bash
# Port conflicts
lsof -t -i :3000 | xargs kill -9

# Database connection issues
docker-compose restart mongodb

# Clear cache
rm -rf node_modules package-lock.json
npm install

# Build failures
npm run build -- --no-cache
```

---

## 📞 Support

For questions or issues, refer to individual README files in each directory or contact the development team.

---

**Built with ❤️ for Rachabanda Ruchulu**