import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useStore from '@/store/useStore';
import { useToast } from '@/lib/ToastContext';

export default function WishlistPage() {
  const wishlistItems = useStore((s) => s.wishlistItems);
  const removeFromWishlist = useStore((s) => s.removeFromWishlist);
  const addToCart = useStore((s) => s.addToCart);
  const isLoggedIn = useStore((s) => s.isLoggedIn());
  const syncWishlistFromServer = useStore((s) => s.syncWishlistFromServer);
  const { addToast } = useToast();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      syncWishlistFromServer();
    }
  }, [isLoggedIn, syncWishlistFromServer]);

  const handleAddToCart = (item: any) => {
    addToCart({ 
      foodId: item.foodId, 
      name: item.name, 
      price: item.price, 
      quantity: 1, 
      image: item.image 
    });
  };

  const handleRemove = (foodId: string) => {
    removeFromWishlist(foodId);
  };

  return (
    <main className="min-h-screen pt-28 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4">
            My <span className="text-primary-gold">Wishlist</span>
          </h1>
        </div>

        {!isMounted ? (
          <div className="card text-center py-12">
            <div className="animate-pulse">
              <div className="h-6 bg-dark-input rounded w-32 mx-auto"></div>
            </div>
          </div>
        ) : !isLoggedIn ? (
          <div className="card text-center py-12">
            <p className="text-gray-400 mb-6">Please login to view your wishlist</p>
            <Link to="/login">
              <button className="px-6 py-3 bg-primary-gold text-dark-bg rounded-lg font-semibold hover:bg-accent-gold transition-all">
                Sign In
              </button>
            </Link>
          </div>
        ) : wishlistItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => (
              <div key={item.foodId} className="card overflow-hidden group">
                <div className="relative w-full h-48 rounded-lg overflow-hidden mb-4 bg-dark-input">
                  {item.image && item.image.startsWith('http') ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      {item.image || '🍽️'}
                    </div>
                  )}
                  <button
                    onClick={() => handleRemove(item.foodId)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-red-500/90 hover:bg-red-600 transition-colors"
                    title="Remove from wishlist"
                  >
                    <span className="text-xl">❤️</span>
                  </button>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-white group-hover:text-primary-gold transition-colors">
                    {item.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary-gold">₹{item.price}</span>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-primary-gold/20">
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="flex-1 px-4 py-2 bg-primary-gold/20 text-primary-gold rounded-lg font-semibold hover:bg-primary-gold/30 transition-all text-sm"
                    >
                      🛒 Add to Cart
                    </button>
                    <Link to={`/food/${item.foodId}`} className="flex-1">
                      <button className="w-full px-4 py-2 bg-primary-gold text-dark-bg rounded-lg font-semibold hover:bg-accent-gold transition-all text-sm">
                        View
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <p className="text-gray-400 text-lg mb-6">Your wishlist is empty</p>
            <Link to="/menu">
              <button className="px-6 py-3 bg-primary-gold text-dark-bg rounded-lg font-semibold hover:bg-accent-gold transition-all">
                Browse Menu
              </button>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
