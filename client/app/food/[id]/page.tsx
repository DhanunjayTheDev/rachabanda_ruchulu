'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { foodAPI } from '@/lib/api';
import useStore from '@/store/useStore';
import LoginDialog from '@/components/modals/LoginDialog';
import { useToast } from '@/lib/ToastContext';

interface FoodData {
  _id: string;
  name: string;
  price: number;
  image: string;
  rating: number;
  reviewCount: number;
  isVegetarian: boolean;
  description: string;
  ingredients: string[];
  category: { _id: string; name: string } | string;
  sizes?: { id: string; name: string; price: number; servings: number }[];
  addOns?: { id: string; name: string; price: number }[];
  reviews?: { _id: string; user: { name: string }; rating: number; comment: string }[];
}

export default function FoodDetailsPage({ params }: { params: { id: string } }) {
  const [food, setFood] = useState<FoodData | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [added, setAdded] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const addToCart = useStore((s) => s.addToCart);
  const isLoggedIn = useStore((s) => s.isLoggedIn());
  const { addToast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await foodAPI.getById(params.id);
        const data = res.data.food || res.data;
        setFood(data);
        if (data.sizes?.length) setSelectedSize(data.sizes[0].id);
      } catch {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.id]);

  if (loading) {
    return (
      <main className="min-h-screen pt-28 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="card h-96 animate-pulse"><div className="w-full h-full bg-white/5 rounded-xl" /></div>
            <div className="space-y-4">
              <div className="h-8 bg-white/5 rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-white/5 rounded w-1/2 animate-pulse" />
              <div className="h-24 bg-white/5 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!food) {
    return (
      <main className="min-h-screen pt-28 pb-20 px-6 flex items-center justify-center">
        <div className="card text-center py-12">
          <p className="text-4xl mb-4">😕</p>
          <h2 className="text-2xl font-bold mb-4">Food not found</h2>
          <Link href="/menu"><button className="btn btn-primary">Back to Menu</button></Link>
        </div>
      </main>
    );
  }

  const sizes = food.sizes || [];
  const addOns = food.addOns || [];
  const reviews = food.reviews || [];
  const selectedSizeData = sizes.find((s) => s.id === selectedSize);
  const basePrice = selectedSizeData?.price || food.price;
  const addOnsTotal = addOns.filter((a) => selectedAddOns.includes(a.id)).reduce((s, a) => s + a.price, 0);

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      addToast('Please login to add items to cart', 'warning');
      setShowLoginDialog(true);
      return;
    }

    addToCart({
      foodId: food._id,
      name: food.name,
      price: basePrice + addOnsTotal,
      quantity,
      image: food.image,
      selectedSize: selectedSize || undefined,
      selectedAddOns: selectedAddOns.length ? selectedAddOns : undefined,
    });
    addToast(`${food.name} added to cart!`, 'success');
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const toggleAddOn = (id: string) => {
    setSelectedAddOns((prev) => prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]);
  };

  return (
    <main className="min-h-screen pt-28 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 text-gray-400 text-sm">
            <Link href="/" className="text-primary-gold hover:underline">Home</Link>
            {' / '}
            <Link href="/menu" className="text-primary-gold hover:underline">Menu</Link>
            {' / '}<span>{food.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image */}
            <div className="card flex items-center justify-center overflow-hidden">
              {food.image && food.image.startsWith('http') ? (
                <img src={food.image} alt={food.name} className="w-full h-80 object-cover rounded-xl" loading="lazy" />
              ) : (
                <div className="text-9xl">{food.image || '🍽️'}</div>
              )}
            </div>

            {/* Details */}
            <div>
              <div className="mb-6">
                <h1 className="text-4xl font-bold mb-2">{food.name}</h1>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-primary-gold">⭐ {food.rating?.toFixed(1) || 'N/A'}</span>
                  {food.reviewCount > 0 && <span className="text-gray-400">({food.reviewCount} reviews)</span>}
                  {food.isVegetarian ? (
                    <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-xs font-semibold">🌱 Veg</span>
                  ) : (
                    <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-xs font-semibold">🍖 Non-Veg</span>
                  )}
                </div>
                <p className="text-gray-400">{food.description}</p>
              </div>

              {/* Size Selection */}
              {sizes.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold mb-3">Select Size</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {sizes.map((size) => (
                      <button
                        key={size.id}
                        onClick={() => setSelectedSize(size.id)}
                        className={`p-3 rounded-lg border transition-all ${
                          selectedSize === size.id
                            ? 'border-primary-gold bg-primary-gold/10'
                            : 'border-gray-600 hover:border-primary-gold'
                        }`}
                      >
                        <div className="font-semibold">{size.name}</div>
                        <div className="text-sm text-gray-400">₹{size.price}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Add-ons */}
              {addOns.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold mb-3">Add-ons</h3>
                  <div className="space-y-2">
                    {addOns.map((addon) => (
                      <label
                        key={addon.id}
                        className="flex items-center gap-3 p-3 border border-gray-600 rounded-lg hover:border-primary-gold cursor-pointer transition-all"
                      >
                        <input
                          type="checkbox"
                          checked={selectedAddOns.includes(addon.id)}
                          onChange={() => toggleAddOn(addon.id)}
                          className="w-4 h-4 accent-primary-gold"
                        />
                        <span className="flex-1">{addon.name}</span>
                        <span className="text-primary-gold font-bold">+₹{addon.price}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="card mb-6">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Quantity</span>
                  <div className="flex items-center gap-4">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-lg bg-primary-gold/20 hover:bg-primary-gold/30 text-primary-gold font-bold">−</button>
                    <span className="text-xl font-bold w-8 text-center">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 rounded-lg bg-primary-gold/20 hover:bg-primary-gold/30 text-primary-gold font-bold">+</button>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6 card">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold">Total</span>
                  <span className="text-2xl font-bold text-primary-gold">₹{(basePrice + addOnsTotal) * quantity}</span>
                </div>
              </div>

              <button onClick={handleAddToCart} className={`w-full btn mb-4 ${added ? 'bg-green-500 text-white' : 'btn-primary'}`}>
                {added ? '✓ Added to Cart!' : '🛒 Add to Cart'}
              </button>

              <Link href="/menu">
                <button className="w-full btn btn-outline">Continue Shopping</button>
              </Link>
            </div>
          </div>

          {/* Ingredients & Reviews */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-20">
            {food.ingredients?.length > 0 && (
              <div className="card">
                <h3 className="text-2xl font-bold mb-6">Ingredients</h3>
                <div className="grid grid-cols-2 gap-4">
                  {food.ingredients.map((ingredient) => (
                    <div key={ingredient} className="flex items-center gap-3 p-3 rounded-lg bg-primary-gold/10 border border-primary-gold/20">
                      <span className="text-primary-gold">✓</span>
                      <span>{ingredient}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {reviews.length > 0 && (
              <div className="card">
                <h3 className="text-2xl font-bold mb-6">Customer Reviews</h3>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review._id} className="pb-4 border-b border-gray-600">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold">{review.user?.name || 'Customer'}</span>
                        <span className="text-primary-gold">{'⭐'.repeat(review.rating)}</span>
                      </div>
                      <p className="text-gray-400 text-sm">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Login Dialog */}
        <LoginDialog
          open={showLoginDialog}
          onClose={() => setShowLoginDialog(false)}
          onLoginSuccess={() => {
            addToCart({
              foodId: food._id,
              name: food.name,
              price: basePrice + addOnsTotal,
              quantity,
              image: food.image,
              selectedSize: selectedSize || undefined,
              selectedAddOns: selectedAddOns.length ? selectedAddOns : undefined,
            });
            addToast(`${food.name} added to cart!`, 'success');
            setAdded(true);
            setTimeout(() => setAdded(false), 2000);
          }}
        />
      </main>
  );
}
