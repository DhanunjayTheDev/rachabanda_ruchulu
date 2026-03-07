'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { settingsAPI } from '@/lib/api';

const formatTime = (t: string) => {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
};

const Footer = () => {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    settingsAPI.get()
      .then((res) => setSettings(res.data?.settings))
      .catch(() => {});
  }, []);

  const restaurantName = settings?.restaurantName || 'Rachabanda Ruchulu';
  const tagline = settings?.tagline || 'Authentic Hyderabadi cuisine delivered fresh to your doorstep';
  const phone = settings?.phone || '';
  const email = settings?.email || '';
  const address = settings?.address || '';
  const openTime = settings?.openTime || '10:00';
  const closeTime = settings?.closeTime || '23:00';

  return (
    <footer className="bg-dark-card/50 border-t border-primary-gold/20">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
            <h3 className="text-xl font-bold text-primary-gold mb-4">{restaurantName}</h3>
            <p className="text-gray-400 mb-6">{tagline}</p>
            <div className="flex gap-4">
              <a href="#" className="text-primary-gold hover:text-primary-accent-gold transition-colors">
                f
              </a>
              <a href="#" className="text-primary-gold hover:text-primary-accent-gold transition-colors">
                Instagram
              </a>
              <a href="#" className="text-primary-gold hover:text-primary-accent-gold transition-colors">
                Twitter
              </a>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/menu" className="text-gray-400 hover:text-primary-gold transition-colors">
                  Menu
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-primary-gold transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-primary-gold transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-gray-400 hover:text-primary-gold transition-colors">
                  My Orders
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            {address && <p className="text-gray-400 mb-2">📍 {address}</p>}
            {phone && <p className="text-gray-400 mb-2">📞 {phone}</p>}
            {email && <p className="text-gray-400">✉️ {email}</p>}
            {!address && !phone && !email && (
              <p className="text-gray-600 text-sm">Contact info not configured</p>
            )}
          </motion.div>

          {/* Hours */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <h4 className="font-semibold text-white mb-4">Opening Hours</h4>
            <p className="text-gray-400 mb-1">Mon – Sun</p>
            <p className="text-gray-400 mb-4">{formatTime(openTime)} – {formatTime(closeTime)}</p>
            {settings && (
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                settings.isOpen ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
              }`}>
                {settings.isOpen ? '● Open Now' : '● Closed'}
              </span>
            )}
          </motion.div>
        </div>

        {/* Bottom */}
        <div className="border-t border-primary-gold/20 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} {restaurantName}. All rights reserved.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-gray-400 hover:text-primary-gold text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-primary-gold text-sm transition-colors">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
