import { Routes, Route } from 'react-router-dom';
import { ToastProvider } from './lib/ToastContext';
import ToastContainer from './components/ToastContainer';
import Header from './components/shared/Header';
import Footer from './components/shared/Footer';
import NotificationPanel from './components/shared/NotificationPanel';
import GlobalRealtimeProvider from './components/shared/GlobalRealtimeProvider';
import ScrollToTop from './components/shared/ScrollToTop';
import useStore from './store/useStore';
import { useEffect } from 'react';

import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import FoodDetailsPage from './pages/FoodDetailsPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import OrdersPage from './pages/OrdersPage';
import ProfilePage from './pages/ProfilePage';
import WishlistPage from './pages/WishlistPage';

export default function App() {
  const { user, token, setUser, setToken } = useStore();

  // Failsafe: if Zustand persist loses the state but localStorage has it, restore it
  useEffect(() => {
    if (!user || !token) {
      try {
        const stored = localStorage.getItem('rachabanda-store');
        if (stored) {
          const parsed = JSON.parse(stored);
          const stateUser = parsed?.state?.user;
          const stateToken = parsed?.state?.token;

          if (stateUser && !user) setUser(stateUser);
          if (stateToken && !token) setToken(stateToken);
        }
      } catch (e) {
        // ignore
      }
    }
  }, [user, token, setUser, setToken]);

  return (
    <ToastProvider>
      <ScrollToTop />
      <GlobalRealtimeProvider />
      <Header />
      <main className="pt-20">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/food/:id" element={<FoodDetailsPage />} />
          <Route path="/order/:id" element={<OrderTrackingPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
        </Routes>
      </main>
      <Footer />
      <ToastContainer />
      <NotificationPanel />
    </ToastProvider>
  );
}
