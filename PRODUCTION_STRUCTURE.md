# Production Build & Deployment Structure

## 📁 Current Monorepo Structure

Your project uses **npm workspaces** - each workspace has its own `node_modules`:

```
rachabanda_ruchulu/
├── node_modules/          ← Root workspace dependencies (shared)
├── package.json           ← Root workspace config
├── package-lock.json
│
├── admin/                 ← Next.js Admin Dashboard
│   ├── node_modules/      ← Admin-specific deps
│   ├── .next/             ← ⭐ PRODUCTION BUILD OUTPUT
│   ├── app/               ← Source code
│   ├── components/
│   ├── lib/
│   ├── package.json
│   └── next.config.js
│
├── client/                ← Next.js Customer Frontend
│   ├── node_modules/      ← Client-specific deps
│   ├── .next/             ← ⭐ PRODUCTION BUILD OUTPUT
│   ├── app/               ← Source code
│   ├── components/
│   ├── lib/
│   ├── package.json
│   └── next.config.js
│
├── server/                ← Express.js Backend
│   ├── node_modules/      ← Server-specific deps
│   ├── src/               ← Source code (NO BUILD NEEDED)
│   ├── .env               ← Configuration
│   └── package.json
│
└── docker-compose.yml     ← For containerized deployment
```

---

## 🏗️ Build Outputs for Production

### Admin Dashboard
```
admin/.next/
├── server/               ← Pre-compiled server-side code
├── static/               ← Client-side JS/CSS bundled
├── standalone/           ← Self-contained standalone build
├── cache/                ← Build cache
└── BUILD_ID              ← Build identifier
```

### Client Frontend
```
client/.next/
├── server/               ← Pre-compiled server-side code
├── static/               ← Client-side JS/CSS bundled
├── standalone/           ← Self-contained standalone build
├── cache/                ← Build cache
└── BUILD_ID              ← Build identifier
```

### Server Backend
```
server/src/
├── index.js              ← NO BUILD - runs directly with Node.js
├── routes/
├── controllers/
├── models/
└── middleware/
```

---

## 🚀 Production Deployment (3 Separate Services)

### Option 1: Deploy Each Service Separately (Recommended)

#### Admin Dashboard Deployment
```bash
# 1. Build
cd admin
npm run build

# 2. Deploy the .next folder
# Upload entire: admin/.next/
# Also upload: admin/package.json, admin/node_modules/

# 3. Start
npm start
# Runs on port 3000 (default)
```

#### Client Frontend Deployment
```bash
# 1. Build
cd client
npm run build

# 2. Deploy the .next folder
# Upload entire: client/.next/
# Also upload: client/package.json, client/node_modules/

# 3. Start
npm start
# Runs on port 3000 (default) - use different port in .env
```

#### Server Backend Deployment
```bash
# 1. No build needed - Node.js runs directly
# 2. Deploy
# Upload: server/src/, server/node_modules/, server/.env

# 3. Start
npm start
# Runs on port 5000
```

---

## 📦 Optimized Production Setup

### For Easy Deployment (Monorepo Approach)

**Key Files to Deploy:**

```
ROOT FOLDER:
  ├── admin/
  │   ├── .next/              ← ADMIN BUILD (Optimized)
  │   ├── public/
  │   └── package.json
  │
  ├── client/
  │   ├── .next/              ← CLIENT BUILD (Optimized)
  │   ├── public/
  │   └── package.json
  │
  ├── server/
  │   ├── src/                ← SERVER CODE (No build)
  │   ├── .env                ← Secrets/Config
  │   └── package.json
  │
  └── docker-compose.yml      ← For Docker deployment
```

---

## 🐳 Docker Deployment (Recommended)

We already have `docker-compose.yml`. Each service runs in its own container:

```yaml
services:
  admin:       # Admin .next build in Node environment
  client:      # Client .next build in Node environment  
  server:      # Express.js backend
  mongodb:     # Database
```

Deploy with:
```bash
docker-compose up -d
```

---

## 💾 Size Optimization

### Before Production (Reduce deployment size):

```bash
# Remove dev dependencies
npm install --production

# Remove .next cache (rebuild on deployment)
rm -rf admin/.next/cache
rm -rf client/.next/cache

# Remove source maps in production
# Edit next.config.js:
productionBrowserSourceMaps: false
```

### Typical Sizes:
- Admin `.next/` build: ~50-100 MB
- Client `.next/` build: ~50-100 MB  
- Server `/src`: ~2-5 MB (minimal)

---

## ✅ Production Checklist

- [ ] Build both Next.js apps (`npm run build`)
- [ ] Set Cloudinary credentials in `server/.env`
- [ ] Set MongoDB URI in `server/.env`
- [ ] Configure environment: `NODE_ENV=production`
- [ ] Deploy `.next/` folders (contains production-optimized code)
- [ ] Deploy `server/src/` folder (no compilation needed)
- [ ] Install production dependencies only
- [ ] Set proper CORS/security headers
- [ ] Use reverse proxy (Nginx) to route traffic
- [ ] Enable HTTPS/SSL certificates

---

## 🔄 Deployment Flow

```
Development (Your Machine)
├── npm run dev       (Admin, Client, Server)
├── Changes to src
└── Testing

Production Build
├── npm run build     (Admin & Client create .next/)
├── Optimize sizes
└── Ready for deployment

Server Deployment
├── Upload .next/ folders
├── Upload server/src
├── Set .env variables
└── Start services (npm start)

User Access
├── Customer: admin.yourdomain.com → Client .next
├── Admin: admin.yourdomain.com    → Admin .next
└── APIs: api.yourdomain.com:5000 → Server
```

---

## 📌 Key Points

1. **Separate node_modules** in each workspace → Allows independent versioning
2. **.next/ folder** → Already optimized for production
3. **No build step for server** → Node.js runs source directly
4. **Three independent services** → Can scale separately
5. **Docker ready** → Use docker-compose for one-command deployment

