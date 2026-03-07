'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRef } from 'react';

const HeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  return (
    <section className="relative w-full h-screen overflow-hidden bg-dark-bg flex items-center justify-center">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute w-96 h-96 bg-primary-gold/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          style={{ top: '10%', left: '10%' }}
        />
        <motion.div
          className="absolute w-80 h-80 bg-primary-gold/5 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 25, repeat: Infinity }}
          style={{ bottom: '10%', right: '10%' }}
        />
      </div>

      {/* Content */}
      <div ref={containerRef} className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Logo */}
          <motion.div variants={itemVariants} className="inline-block">
            <div className="glass rounded-full px-6 py-2 mb-8 inline-block">
              <p className="text-primary-gold font-semibold text-sm">Premium Village Flavors</p>
            </div>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={itemVariants}
            className="text-6xl md:text-7xl font-bold text-white leading-tight"
          >
            Authentic Village Flavors
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-gold to-primary-accent-gold">
              Delivered Fresh
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed"
          >
            Experience the authentic taste of traditional Hyderabadi cuisine crafted with premium
            ingredients and served with excellence.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="flex gap-6 justify-center pt-8">
            <Link href="/menu">
              <button className="btn btn-primary">Order Now</button>
            </Link>
            <Link href="/menu">
              <button className="btn btn-outline">View Menu</button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-3 gap-6 pt-16">
            {[
              { label: '1000+', desc: 'Happy Customers' },
              { label: '30 min', desc: 'Fast Delivery' },
              { label: '⭐ 4.8', desc: 'Rating' },
            ].map((stat, i) => (
              <div key={i} className="glass rounded-xl p-4">
                <p className="text-2xl font-bold text-primary-gold">{stat.label}</p>
                <p className="text-sm text-gray-400">{stat.desc}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-primary-gold rounded-full flex items-start justify-center p-2">
          <motion.div
            className="w-1 h-2 bg-primary-gold rounded-full"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
