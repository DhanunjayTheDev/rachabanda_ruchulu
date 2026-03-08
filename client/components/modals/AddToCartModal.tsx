'use client';

import { useState, useEffect } from 'react';
import useStore from '@/store/useStore';
import { foodAPI } from '@/lib/api';
import { useToast } from '@/lib/ToastContext';

interface AddToCartModalProps {
  open: boolean;
  onClose: () => void;
  foodId: string;
  name: string;
  initialPrice: number;
}

export default function AddToCartModal({ open, onClose, foodId, name, initialPrice }: AddToCartModalProps) {
  const [food, setFood] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const { addToast } = useToast();
  const addToCart = useStore((s) => s.addToCart);

  // Every time the modal opens: reset all state and re-fetch
  useEffect(() => {
    if (!open) return;

    setFood(null);
    setSelectedSize('');
    setSelectedAddOns([]);
    setQuantity(1);
    setLoading(true);

    foodAPI.getById(foodId)
      .then((res) => {
        const data = res.data.food || res.data;
        setFood(data);
        if (data.sizes && data.sizes.length > 0) {
          setSelectedSize(String(data.sizes[0]._id));
        }
      })
      .catch(() => {
        addToast('Failed to load food details', 'error');
      })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, foodId]);

  // Derived prices — always in sync, no stale state
  const selectedSizeObj = food?.sizes?.find((s: any) => String(s._id) === selectedSize);
  const basePrice: number = selectedSizeObj?.price ?? initialPrice;
  const addOnsPrice: number = food?.addOns
    ?.filter((a: any) => selectedAddOns.includes(String(a._id)))
    .reduce((sum: number, a: any) => sum + (a.price || 0), 0) ?? 0;
  const pricePerItem = basePrice + addOnsPrice;
  const totalPrice = pricePerItem * quantity;

  const handleAddToCart = () => {
    setAdding(true);
    try {
      addToCart({
        foodId,
        name,
        price: pricePerItem,
        quantity,
        image: food?.image,
        selectedSize: selectedSize || undefined,
        selectedAddOns: selectedAddOns.length > 0 ? selectedAddOns : undefined,
      });
      addToast(`${name} added to cart!`, 'success');
      onClose();
    } catch {
      addToast('Failed to add to cart', 'error');
    } finally {
      setAdding(false);
    }
  };

  const toggleAddOn = (id: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md bg-dark-bg border border-primary-gold/30 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-dark-bg border-b border-primary-gold/20 p-5 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-white">{name}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
          >
            x
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : (
          <div className="p-5 space-y-5">

            {/* Sizes */}
            {food?.sizes && food.sizes.length > 0 && (
              <div>
                <h3 className="font-bold mb-3 text-white text-sm uppercase tracking-wider">Select Size</h3>
                <div className="grid grid-cols-3 gap-2">
                  {food.sizes.map((size: any) => {
                    const sizeId = String(size._id);
                    const isSelected = selectedSize === sizeId;
                    return (
                      <button
                        key={sizeId}
                        type="button"
                        onClick={() => setSelectedSize(sizeId)}
                        className={`p-3 rounded-xl border-2 transition-all text-center ${
                          isSelected
                            ? 'border-primary-gold bg-primary-gold/20 text-white'
                            : 'border-gray-600 text-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="font-semibold text-sm">{size.name}</div>
                        <div className={`text-xs mt-0.5 ${isSelected ? 'text-primary-gold font-bold' : 'text-gray-500'}`}>
                          Rs.{size.price}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Add-ons */}
            {food?.addOns && food.addOns.length > 0 && (
              <div>
                <h3 className="font-bold mb-3 text-white text-sm uppercase tracking-wider">Add-ons</h3>
                <div className="space-y-2">
                  {food.addOns.map((addon: any) => {
                    const addonId = String(addon._id);
                    const isChecked = selectedAddOns.includes(addonId);
                    return (
                      <div
                        key={addonId}
                        onClick={() => toggleAddOn(addonId)}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all select-none ${
                          isChecked
                            ? 'border-primary-gold bg-primary-gold/10'
                            : 'border-gray-600 hover:border-gray-400'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          isChecked ? 'border-primary-gold bg-primary-gold' : 'border-gray-500 bg-transparent'
                        }`}>
                          {isChecked && <span className="text-dark-bg text-xs font-bold">v</span>}
                        </div>
                        <span className="flex-1 text-white text-sm font-medium">{addon.name}</span>
                        <span className="text-primary-gold font-bold text-sm">+Rs.{addon.price}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="font-bold mb-3 text-white text-sm uppercase tracking-wider">Quantity</h3>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded-xl bg-primary-gold/20 hover:bg-primary-gold/40 text-primary-gold font-bold text-lg transition-all"
                >
                  -
                </button>
                <span className="text-xl font-bold w-8 text-center text-white">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-10 h-10 rounded-xl bg-primary-gold/20 hover:bg-primary-gold/40 text-primary-gold font-bold text-lg transition-all"
                >
                  +
                </button>
              </div>
            </div>

            {/* Price Summary */}
            <div className="border-t border-primary-gold/20 pt-4 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Price per item</span>
                <span className="font-bold text-primary-gold">Rs.{pricePerItem.toFixed(2)}</span>
              </div>
              {quantity > 1 && (
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>x {quantity} items</span>
                  <span>Rs.{pricePerItem.toFixed(2)} x {quantity}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-white/10">
                <span className="text-white font-bold text-lg">Total</span>
                <span className="text-2xl font-bold text-primary-gold">Rs.{totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={adding}
                className="flex-1 px-4 py-3 bg-primary-gold text-dark-bg rounded-xl font-bold hover:bg-accent-gold transition-all disabled:opacity-50"
              >
                {adding ? 'Adding...' : `Add to Cart (${quantity})`}
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
