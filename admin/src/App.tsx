import { Routes, Route } from 'react-router-dom';
import { ToastProvider } from '@/lib/ToastContext';
import { ToastContainer } from '@/components/ToastContainer';
import AdminShell from '@/components/AdminShell';
import AdminNotificationPanel from '@/components/AdminNotificationPanel';

import DashboardPage from '@/pages/DashboardPage';
import LoginPage from '@/pages/LoginPage';
import OrdersPage from '@/pages/OrdersPage';
import CategoriesPage from '@/pages/CategoriesPage';
import FoodsPage from '@/pages/FoodsPage';
import CouponsPage from '@/pages/CouponsPage';
import AnnouncementsPage from '@/pages/AnnouncementsPage';
import PaymentsPage from '@/pages/PaymentsPage';
import SettingsPage from '@/pages/SettingsPage';
import CustomersPage from '@/pages/CustomersPage';
import RestaurantsPage from '@/pages/RestaurantsPage';
import ReviewsPage from '@/pages/ReviewsPage';
import ProfilePage from '@/pages/ProfilePage';
import QRCodesPage from '@/pages/QRCodesPage';

function App() {
  return (
    <ToastProvider>
      <AdminShell>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/foods" element={<FoodsPage />} />
          <Route path="/coupons" element={<CouponsPage />} />
          <Route path="/announcements" element={<AnnouncementsPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/restaurants" element={<RestaurantsPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/qrcodes" element={<QRCodesPage />} />
        </Routes>
      </AdminShell>
      <ToastContainer />
      <AdminNotificationPanel />
    </ToastProvider>
  );
}

export default App;
