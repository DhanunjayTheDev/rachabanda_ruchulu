# QUICK START GUIDE

Get the Rachabanda Ruchulu platform running in minutes!

## 1️⃣ Prerequisites Check

```bash
# Verify Node.js version (need 18+)
node --version

# Verify npm
npm --version

# Have MongoDB running (local or Docker)
```

## 2️⃣ Clone & Setup

```bash
# Clone repository
git clone <repo-url>
cd rachabanda_ruchulu

# Install all dependencies
npm install
```

## 3️⃣ Environment Configuration

### Server Setup
```bash
cd server

# Copy example file
cp .env.example .env

# Edit .env with your actual values:
# - MONGODB_URI (can use local: mongodb://localhost:27017/rachabanda)
# - JWT_SECRET (can use any string for dev)
# - Optional: Cloudinary, Razorpay, Google Maps keys
```

### Client Setup (Optional)
```bash
cd ../client

# Create .env.local
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:5000/api
EOF
```

## 4️⃣ Start Services

### Option A: Individual Terminals (Recommended for Development)

**Terminal 1 - Backend**
```bash
cd server
npm run dev
# Runs on http://localhost:5000
```

**Terminal 2 - Frontend**
```bash
cd client
npm run dev
# Runs on http://localhost:3000
```

**Terminal 3 - Admin (Optional)**
```bash
cd admin
npm run dev
# Runs on http://localhost:3001
```

### Option B: All at Once
```bash
# From root directory
npm run dev
```

### Option C: Docker
```bash
# Ensure Docker is running
docker-compose up --build

# Access:
# - Frontend: http://localhost:3000
# - Admin: http://localhost:3001
# - Backend: http://localhost:5000
# - MongoDB: localhost:27017
```

## 5️⃣ Test the Setup

### Test Frontend
- Open http://localhost:3000 in browser
- Should see premium home page with hero section
- Smooth animations and glassmorphism effects

### Test Backend
```bash
# Check server health
curl http://localhost:5000

# Should return: { message: "Rachabanda Ruchulu API Server" }
```

### Test MongoDB Connection
```bash
# The server logs should show:
# MongoDB Connected: localhost
```

## 6️⃣ Create Test Product (Optional)

```bash
# First, create a category
curl -X POST http://localhost:5000/api/admin/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Biryani",
    "description": "Traditional biryani dishes",
    "displayOrder": 1
  }'

# Then create a food item
curl -X POST http://localhost:5000/api/admin/foods \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hyderabadi Biryani",
    "price": 280,
    "category": "CATEGORY_ID_FROM_ABOVE",
    "isVegetarian": false,
    "description": "Traditional Hyderabadi biryani",
    "image": "https://images.unsplash.com/photo-1563379091339-03b21ab4a104?w=400"
  }'
```

## 7️⃣ Project Pages Reference

**Frontend Pages:**
- Home: http://localhost:3000/
- Menu: http://localhost:3000/menu
- Login: http://localhost:3000/login
- Profile: http://localhost:3000/profile
- Cart: http://localhost:3000/cart
- Orders: http://localhost:3000/orders

**Admin Pages:**
- Dashboard: http://localhost:3001/
- Orders: http://localhost:3001/orders
- Foods: http://localhost:3001/foods
- Settings: http://localhost:3001/settings

## 📱 Mobile Testing

```bash
# Get your machine IP
ipconfig getifaddr en0    # macOS/Linux
ipconfig                  # Windows

# Open in mobile browser
http://YOUR_IP:3000
```

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Kill process on port
npx kill-port 3000 5000 3001

# Or specify different port
PORT=3002 npm run dev
```

### MongoDB Not Connecting
```bash
# Start MongoDB if installed locally
mongod

# Or use Docker
docker run -d -p 27017:27017 mongo:6.0
```

### Dependencies Not Installing
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### CORS Errors
```bash
# Ensure correct API URL in .env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 🎯 Next Steps

1. **Explore the codebase**: Read READMEs in each directory
2. **Customize branding**: Update colors in `client/tailwind.config.js`
3. **Set up APIs**: Get Razorpay, Cloudinary, Google Maps keys
4. **Add more pages**: Implement remaining pages from structure
5. **Deploy**: Use docker-compose for production

## 📚 Key Files to Know

- `client/app/page.tsx` - Home page
- `server/src/index.js` - Server setup
- `server/src/models/` - Database schemas
- `client/tailwind.config.js` - Design tokens
- `docker-compose.yml` - Docker setup

## 💡 Tips

- Use `console.log()` for debugging
- Check browser DevTools Console for errors
- Check server logs for backend errors
- Hot reload works for both frontend & backend
- Database changes don't require server restart
- Restart browser if styles don't update

## 🚀 Ready to Deploy?

See main README.md for deployment guides:
- AWS EC2
- Vercel (Frontend)
- Railway/Heroku (Backend)

---

**You're all set! 🎉 Start building amazing features for Rachabanda Ruchulu!**
