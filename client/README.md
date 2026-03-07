# CLIENT (Frontend) README

Premium Next.js 14 food ordering application with Apple-level UI design.

## 🎨 Features

- Apple/Google-level UI with glassmorphism
- Smooth animations with Framer Motion
- 3D elements with Three.js
- Responsive mobile-first design
- Advanced color palette system
- Real-time cart management
- Complete product filtering
- User authentication
- Order tracking

## 🚀 Quick Start

```bash
cd client
npm install
npm run dev
```

Visit http://localhost:3000

## 📁 Structure

```
app/
├── (pages)/             # Route groups
├── api/                 # API routes
├── layout.tsx           # Root layout
├── page.tsx             # Home page
└── globals.css          # Global styles

components/
├── home/               # Home sections
│   ├── HeroSection.tsx
│   ├── FoodCard.tsx
│   ├── FeaturedSection.tsx
│   ├── CategoriesSection.tsx
│   └── TestimonialsSection.tsx
└── shared/             # Shared components
    ├── Header.tsx
    └── Footer.tsx

store/
└── useStore.ts         # Zustand cart & auth state

lib/
└── api.ts              # API client & endpoints

hooks/
└── useThreeScene.ts    # Three.js integration
```

## 🎯 Pages to Implement

- [x] Home (`/page.tsx`)
- [ ] Menu (`/menu/page.tsx`) - With filters
- [ ] Food Details (`/food/[id]/page.tsx`)
- [ ] Cart (`/cart/page.tsx`)
- [ ] Checkout (`/checkout/page.tsx`)
- [ ] Order Tracking (`/order/[id]/page.tsx`)
- [ ] Profile (`/profile/page.tsx`)
- [ ] Orders History (`/orders/page.tsx`)
- [ ] Login (`/login/page.tsx`)
- [ ] Signup (`/signup/page.tsx`)

## 🎨 Color System

All colors defined in `tailwind.config.js`:
- `primary-gold`: #D4AF37
- `primary-accent-gold`: #E7C873
- `secondary-dark-brown`: #2B1D15
- `secondary-warm-brown`: #5A3E2B
- `dark-bg`: #0F0B08
- `dark-card`: #1A1410
- `dark-input`: #252019

## 🔧 API Integration

All API calls through `lib/api.ts`:

```typescript
import { foodAPI, orderAPI, cartAPI } from '@/lib/api';

// Use in components
const foods = await foodAPI.getAll({ category: 'biryani' });
const food = await foodAPI.getById('123');
```

## 📦 Dependencies

- Next.js 14
- React 18.2
- TypeScript
- TailwindCSS
- Framer Motion
- Three.js
- Zustand
- React Query
- Axios

## 🎬 Animations

Uses Framer Motion for:
- Fade-in animations
- Stagger animations
- Hover effects
- Scroll reveal
- Page transitions

## 📱 Responsive Design

Mobile-first approach with breakpoints:
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px

## 🚀 Build & Deploy

```bash
# Build
npm run build

# Production start
npm start

# Analyze bundle
npm run analyze
```

## 🔐 Environment Variables

Create `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=xxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=xxx
```

## 💡 Tips

1. Use `useStore` hook for cart management
2. Wrap server calls in `try-catch`
3. Use React Query for data fetching
4. Lazy load images with Next.js Image
5. Mobile test with device toolbar
