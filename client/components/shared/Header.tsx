'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import useStore from '@/store/useStore';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { getTotalItems, user, logout, isLoggedIn, syncCartFromServer, syncWishlistFromServer } = useStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync cart and wishlist from server when user logs in or on first load
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
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary-gold rounded-lg flex items-center justify-center font-bold text-secondary-dark-brown group-hover:shadow-glow transition-all">
            🍱
          </div>
          <span className="font-bold text-lg text-white hidden sm:inline">Rachabanda</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-gray-300 hover:text-primary-gold transition-colors">
            Home
          </Link>
          <Link href="/menu" className="text-gray-300 hover:text-primary-gold transition-colors">
            Menu
          </Link>
          <Link href="/about" className="text-gray-300 hover:text-primary-gold transition-colors">
            About
          </Link>
          <Link href="/contact" className="text-gray-300 hover:text-primary-gold transition-colors">
            Contact
          </Link>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Wishlist */}
          <Link href="/wishlist">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="relative glass rounded-lg px-4 py-2"
              title="My Wishlist"
            >
              ❤️
            </motion.button>
          </Link>

          {/* Cart */}
          <Link href="/cart">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="relative glass rounded-lg px-4 py-2"
            >
              🛒
              {isMounted && getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-gold text-secondary-dark-brown text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </motion.button>
          </Link>

          {/* Auth */}
          {isMounted && user ? (
            <div className="flex items-center gap-4">
              <Link href="/profile" className="text-gray-300 hover:text-primary-gold transition-colors">
                {user.name}
              </Link>
              <button onClick={logout} className="btn btn-outline px-4 py-2">
                Logout
              </button>
            </div>
          ) : isMounted ? (
            <Link href="/login" className="btn btn-primary px-4 py-2">
              Login
            </Link>
          ) : (
            <div className="btn btn-primary px-4 py-2 invisible">Login</div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-2"
          >
            <div className="w-6 h-0.5 bg-primary-gold" />
            <div className="w-6 h-0.5 bg-primary-gold" />
            <div className="w-6 h-0.5 bg-primary-gold" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && isMounted && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-primary-gold/20 bg-dark-card/50"
        >
          <div className="max-w-7xl mx-auto px-6 py-4 space-y-4">
            <Link href="/" className="block text-gray-300 hover:text-primary-gold">
              Home
            </Link>
            <Link href="/menu" className="block text-gray-300 hover:text-primary-gold">
              Menu
            </Link>
            <Link href="/about" className="block text-gray-300 hover:text-primary-gold">
              About
            </Link>
            <Link href="/contact" className="block text-gray-300 hover:text-primary-gold">
              Contact
            </Link>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
};

export default Header;
