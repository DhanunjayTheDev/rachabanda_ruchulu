'use client';

import { useState } from 'react';
import Link from 'next/link';
import useStore from '@/store/useStore';
import LoginDialog from '@/components/modals/LoginDialog';
import { useToast } from '@/lib/ToastContext';

interface FoodCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  rating: number;
  isVegetarian: boolean;
  categoryName: string;
  description?: string;
}

const FoodCard = ({ id, name, price, image, rating, isVegetarian, categoryName, description }: FoodCardProps) => {
  const addToCart = useStore((s) => s.addToCart);
  const addToWishlist = useStore((s) => s.addToWishlist);
  const removeFromWishlist = useStore((s) => s.removeFromWishlist);
  const isInWishlist = useStore((s) => s.isInWishlist);
  const isInCart = useStore((s) => s.isInCart);
  const isLoggedIn = useStore((s) => s.isLoggedIn());
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const { addToast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if user is logged in
    if (!isLoggedIn) {
      addToast('Please login to add items to cart', 'warning');
      setShowLoginDialog(true);
      return;
    }

    // Add to cart
    addToCart({ foodId: id, name, price, quantity: 1, image });
    addToast(`${name} added to cart!`, 'success');
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      addToast('Please login to save items', 'warning');
      setShowLoginDialog(true);
      return;
    }

    if (isInWishlist(id)) {
      removeFromWishlist(id);
      addToast(`${name} removed from wishlist`, 'info');
    } else {
      addToWishlist({ foodId: id, name, price, image });
      addToast(`${name} added to wishlist!`, 'success');
    }
  };

  return (
    <>
      <div className="card h-full overflow-hidden group hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(212,175,55,0.15)] transition-all duration-300">
        {/* Image Container */}
        <div className="relative w-full h-48 overflow-hidden rounded-xl mb-4">
          {image && !image.startsWith('http') ? (
            <div className="w-full h-full flex items-center justify-center bg-dark-input text-6xl">{image}</div>
          ) : (
            <img
              src={image || '/placeholder.jpg'}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/80 to-transparent" />

          {/* Badge */}
          <div className="absolute top-3 right-3">
            {isVegetarian ? (
              <div className="bg-green-500/90 text-white px-3 py-1 rounded-full text-xs font-semibold">
                🌱 Veg
              </div>
            ) : (
              <div className="bg-red-500/90 text-white px-3 py-1 rounded-full text-xs font-semibold">
                🍖 Non-Veg
              </div>
            )}
          </div>

          {/* Rating */}
          <div className="absolute bottom-3 left-3 glass px-2 py-1 rounded-lg text-sm font-semibold text-primary-gold">
            ⭐ {rating?.toFixed?.(1) || rating}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlist}
            className="absolute top-3 left-3 p-2 rounded-full bg-dark-bg/80 hover:bg-dark-bg transition-colors"
            title={isInWishlist(id) ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <span className="text-xl">{isInWishlist(id) ? '❤️' : '🤍'}</span>
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3 flex-grow">
          <div>
            <h3 className="text-lg font-bold text-white group-hover:text-primary-gold transition-colors">
              {name}
            </h3>
            <p className="text-sm text-gray-400">{description || categoryName}</p>
          </div>

          {/* Price and Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-primary-gold/20">
            <span className="text-2xl font-bold text-primary-gold">₹{price}</span>
            <div className="flex gap-2">
              <button
                onClick={handleAddToCart}
                className={`px-3 py-2 rounded-lg font-semibold transition-all text-sm ${
                  isInCart(id)
                    ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                    : "bg-primary-gold/20 text-primary-gold hover:bg-primary-gold/30"
                }`}
              >
                {isInCart(id) ? "✓ In Cart" : "🛒 Add"}
              </button>
              <Link href={`/food/${id}`}>
                <button className="px-3 py-2 bg-primary-gold text-dark-bg rounded-lg font-semibold hover:bg-accent-gold transition-all text-sm">
                  View
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Login Dialog */}
      <LoginDialog
        open={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
        onLoginSuccess={() => {
          addToCart({ foodId: id, name, price, quantity: 1, image });
          addToast(`${name} added to cart!`, 'success');
        }}
      />
    </>
  );
};

export default FoodCard;
