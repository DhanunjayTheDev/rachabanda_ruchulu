# Configuration & Deployment Guide

Complete deployment guide for production environments.

## 🌍 Environment Setup

### Production Environment Variables

#### Server (.env)

```env
# Node Environment
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rachabanda?retryWrites=true&w=majority

# JWT
JWT_SECRET=generate-a-strong-random-string-here-minimum-32-characters

# Cloudinary (Image Upload)
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Razorpay (Payments)
RAZORPAY_KEY_ID=your_razorpay_live_key_id
RAZORPAY_KEY_SECRET=your_razorpay_live_key_secret

# Google Maps
GOOGLE_MAPS_API_KEY=your_production_google_maps_key

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

#### Client (.env.production.local)

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
```

#### Admin (.env.production.local)

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

---

## 🚀 Deployment Options

### Option 1: AWS EC2 (Recommended)

#### 1.1 Launch EC2 Instance

```bash
# Instance specifications:
# - OS: Ubuntu 22.04 LTS
# - Type: t3.medium (2vCPU, 4GB RAM)
# - Storage: 50GB EBS
# - Security Groups: 80, 443, 3000, 3001, 5000, 27017
```

#### 1.2 Install Dependencies

```bash
# SSH into instance
ssh -i your-key.pem ubuntu@your-instance-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Nginx
sudo apt install -y nginx
```

#### 1.3 Deploy Application

```bash
# Clone repository
git clone https://github.com/yourusername/rachabanda_ruchulu.git
cd rachabanda_ruchulu

# Setup environment
cp server/.env.example server/.env
nano server/.env  # Edit with production values

# Start with Docker
sudo docker-compose up -d

# Verify services
sudo docker-compose ps
```

#### 1.4 Configure Nginx Reverse Proxy

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/default
```

```nginx
upstream backend {
    server localhost:5000;
}

upstream client {
    server localhost:3000;
}

upstream admin {
    server localhost:3001;
}

server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name yourdomain.com www.yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://client;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Admin Dashboard
    location /admin {
        proxy_pass http://admin;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
}
```

```bash
# Enable Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

#### 1.5 Setup SSL (HTTPS)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal enabled automatically
sudo systemctl status certbot.timer
```

---

### Option 2: Vercel (Frontend Only)

#### 2.1 Deploy Client

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
cd client
vercel --prod

# Configure environment variables in Vercel dashboard
```

**Environment Variables in Vercel:**
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`

#### 2.2 Deploy Admin

```bash
cd admin
vercel --prod
```

---

### Option 3: Railway (Backend & Database)

#### 3.1 Deploy Backend

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Create project
railway init

# Configure environment
railway variables set MONGODB_URI=...
railway variables set JWT_SECRET=...
# Set all other variables

# Deploy
railway up

# Get public URL
railway open
```

#### 3.2 Deploy Database

```bash
# Add MongoDB to project
railway add MongoDB

# Connect to your backend
railway variables set MONGODB_URI=$DATABASE_URL
```

---

### Option 4: Docker Compose (Full Stack)

#### 4.1 Prepare Server

```bash
# On your server:
mkdir -p /opt/rachabanda
cd /opt/rachabanda

git clone https://github.com/yourusername/rachabanda_ruchulu.git .

# Create .env files
cp server/.env.example server/.env
echo "NEXT_PUBLIC_API_URL=https://api.yourdomain.com" > client/.env.local
echo "NEXT_PUBLIC_API_URL=https://api.yourdomain.com" > admin/.env.local
```

#### 4.2 Start Services

```bash
# Build and start
sudo docker-compose --file docker-compose.yml up -d

# View logs
sudo docker-compose logs -f

# Update application
git pull origin main
sudo docker-compose restart server client admin
```

---

## 📊 Monitoring & Maintenance

### Health Check

```bash
# Check service status
curl https://yourdomain.com/api/

# Check MongoDB
docker exec rachabanda_mongodb mongosh --eval "db.adminCommand('ping')"

# View logs
docker-compose logs -f [service-name]
```

### Backup MongoDB

```bash
# Full backup
docker exec rachabanda_mongodb mongodump --out /data/backup

# Backup to file
docker exec rachabanda_mongodb mongodump --archive > backup.archive
```

### Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild services
docker-compose build --no-cache

# Restart
docker-compose up -d
```

---

## 🔐 Security Checklist

- [ ] Change all default passwords
- [ ] Generate strong JWT_SECRET
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Setup database backups
- [ ] Configure rate limiting on API
- [ ] Enable CORS properly
- [ ] Use environment variables for secrets
- [ ] Keep dependencies updated
- [ ] Setup monitoring alerts
- [ ] Enable database authentication
- [ ] Configure API key rotation

---

## 🚨 Troubleshooting

### Port Conflicts

```bash
# Check what's using ports
sudo lsof -i :80
sudo lsof -i :443
sudo lsof -i :5000

# Kill process
sudo kill -9 PID
```

### Docker Issues

```bash
# View logs
docker-compose logs -f

# Rebuild
docker-compose down
docker-compose up --build

# Clean up
docker system prune -a
```

### Database Connection

```bash
# Test connection
docker exec rachabanda_mongodb mongosh

# Check MongoDB logs
docker logs rachabanda_mongodb
```

### SSL Certificate Issues

```bash
# Renew certificate
sudo certbot renew --dry-run

# Manual renewal
sudo certbot renew

# Check status
sudo certbot certificates
```

---

## 📈 Performance Optimization

### Frontend

```nginx
# Add to Nginx config
gzip on;
gzip_vary on;
gzip_min_length 1000;
gzip_types text/plain text/css text/javascript application/json;

# Browser cache
expires 30d;
add_header Cache-Control "public, immutable";
```

### Backend

```javascript
// Add caching headers
res.set('Cache-Control', 'public, max-age=3600');

// Enable compression
app.use(compression());
```

### Database

```javascript
// Add indexes for frequently queried fields
db.foods.createIndex({ category: 1 });
db.orders.createIndex({ user: 1, createdAt: -1 });
db.users.createIndex({ email: 1 });
```

---

## 📞 Support & Resources

- [Docker Documentation](https://docs.docker.com/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
- [MongoDB Deployment](https://docs.mongodb.com/manual/deployment/)

---

**Deployment completed!** 🎉

For issues, check logs and verify all environment variables are set correctly.
