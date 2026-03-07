# ADMIN DASHBOARD README

Next.js 14 admin dashboard with analytics, order management, and restaurant configuration.

## 🎯 Features

- Revenue & order statistics
- Real-time analytics dashboard
- Order management system
- Food & category management
- Customer management
- Sales charts & graphs
- Payment tracking
- Restaurant settings

## 🚀 Quick Start

```bash
cd admin
npm install
npm run dev
```

Visit http://localhost:3001

## 📁 Structure

```
app/
├── layout.tsx          # Admin layout
└── page.tsx            # Dashboard

components/
├── AdminDashboard.tsx  # Main dashboard
└── StatCard.tsx        # Stat component
```

## 📊 Key Pages to Implement

- [x] Dashboard (`/page.tsx`) - Overview & stats
- [ ] Orders (`/orders/page.tsx`)
- [ ] Food Management (`/foods/page.tsx`)
- [ ] Categories (`/categories/page.tsx`)
- [ ] Customers (`/customers/page.tsx`)
- [ ] Analytics (`/analytics/page.tsx`)
- [ ] Settings (`/settings/page.tsx`)
- [ ] Reviews (`/reviews/page.tsx`)

## 📈 Dashboard Sections

### Stats Cards
- Daily Revenue
- Orders Today
- Total Customers
- Average Rating

### Charts
- Weekly Sales Line Chart
- Top Categories Pie Chart
- Sales Trend
- Popular Items

### Recent Orders Table
- Order ID
- Customer
- Amount
- Status

## 🔧 API Integration

Same API client as frontend:

```typescript
import { orderAPI, foodAPI } from '@/lib/api';

const orders = await orderAPI.getAll();
const foods = await foodAPI.getAll();
```

## 🎨 Charts Library

Uses Recharts for:
- Line charts
- Bar charts
- Pie charts
- Area charts

Example:
```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

<LineChart data={data}>
  <CartesianGrid />
  <XAxis />
  <YAxis />
  <Line type="monotone" dataKey="value" stroke="#D4AF37" />
</LineChart>
```

## 📦 Dependencies

- Next.js 14
- Recharts
- Framer Motion
- TailwindCSS
- Zustand
- Axios

## 🔐 Authentication

Admin-only routes protected by JWT:

```typescript
const token = localStorage.getItem('token');
// Verify admin role in API routes
```

## 🚀 Build & Deploy

```bash
npm run build
npm start
```

## 💡 Development Tips

1. Mock data for development
2. Use development API URL
3. Test with admin account
4. Implement error states
5. Add loading skeletons
