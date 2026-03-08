import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import useStore from '@/store/useStore';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { getTotalItems, getWishlistCount, user, logout, isLoggedIn, syncCartFromServer, syncWishlistFromServer } = useStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isLoggedIn()) {
      syncCartFromServer();
      syncWishlistFromServer();
    }
  }, [isLoggedIn, syncCartFromServer, syncWishlistFromServer]);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass-dark"
    >
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary-gold rounded-lg flex items-center justify-center font-bold text-secondary-dark-brown group-hover:shadow-glow transition-all">
            🍱
          </div>
          <span className="font-bold text-lg text-white hidden sm:inline">Rachabanda</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-gray-300 hover:text-primary-gold transition-colors">Home</Link>
          <Link to="/menu" className="text-gray-300 hover:text-primary-gold transition-colors">Menu</Link>
          <Link to="/orders" className="text-gray-300 hover:text-primary-gold transition-colors">My Orders</Link>
          <Link to="/contact" className="text-gray-300 hover:text-primary-gold transition-colors">Contact</Link>
        </div>

        <div className="flex items-center gap-4">
          {isMounted && isLoggedIn() && (
            <Link to="/wishlist">
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="relative glass rounded-lg px-4 py-2" title="My Wishlist">
                ❤️
                {getWishlistCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary-gold text-secondary-dark-brown text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {getWishlistCount()}
                  </span>
                )}
              </motion.button>
            </Link>
          )}

          {isMounted && isLoggedIn() && (
            <Link to="/cart">
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="relative glass rounded-lg px-4 py-2">
                🛒
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary-gold text-secondary-dark-brown text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </motion.button>
            </Link>
          )}

          {isMounted && user ? (
            <div className="flex items-center gap-3">
              <Link to="/profile" className="flex items-center gap-2 text-gray-300 hover:text-primary-gold transition-colors text-sm font-medium">
                <span className="text-xl">👤</span>
                <span>{user.name?.split(' ')[0] || 'Account'}</span>
              </Link>
            </div>
          ) : isMounted ? (
            <Link to="/login" className="btn btn-primary px-4 py-2">Login</Link>
          ) : (
            <div className="btn btn-primary px-4 py-2 invisible">Login</div>
          )}

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-2">
            <div className="w-6 h-0.5 bg-primary-gold" />
            <div className="w-6 h-0.5 bg-primary-gold" />
            <div className="w-6 h-0.5 bg-primary-gold" />
          </button>
        </div>
      </nav>

      {menuOpen && isMounted && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden border-t border-primary-gold/20 bg-dark-card/50">
          <div className="max-w-7xl mx-auto px-6 py-4 space-y-4">
            <Link to="/" className="block text-gray-300 hover:text-primary-gold">Home</Link>
            <Link to="/menu" className="block text-gray-300 hover:text-primary-gold">Menu</Link>
            <Link to="/orders" className="block text-gray-300 hover:text-primary-gold">My Orders</Link>
            <Link to="/contact" className="block text-gray-300 hover:text-primary-gold">Contact</Link>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
};

export default Header;
