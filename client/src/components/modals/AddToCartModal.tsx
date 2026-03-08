import { useState, useEffect } from 'react';
import useStore from '@/store/useStore';
import { useToast } from '@/lib/ToastContext';
import { foodAPI } from '@/lib/api';

interface AddToCartModalProps {
  open: boolean;
  onClose: () => void;
  foodId: string;
  name: string;
  initialPrice: number;
}

interface Size {
  _id?: string;
  name: string;
  price: number;
  servings?: number;
}

interface AddOn {
  _id?: string;
  name: string;
  price: number;
}

const AddToCartModal = ({ open, onClose, foodId, name, initialPrice }: AddToCartModalProps) => {
  const addToCart = useStore((s) => s.addToCart);
  const updateCartItem = useStore((s) => s.updateCartItem);
  const cart = useStore((s) => s.cart);
  const { addToast } = useToast();

  // Helper function: Generate unique identifier for size/addon (use _id if present, fallback to name)
  const getItemId = (item: any): string => {
    if (item._id) return item._id.toString?.() || String(item._id);
    if (item.name) return `name-${item.name}`;
    return Math.random().toString();
  };

  // State management
  const [loading, setLoading] = useState(false);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [foodImage, setFoodImage] = useState('');
  const [basePrice, setBasePrice] = useState(initialPrice);

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');

  const existingItem = cart.find((item: any) => item.foodId === foodId);

  // Load food data when modal opens
  useEffect(() => {
    if (!open) {
      // Reset state when modal closes
      setSizes([]);
      setAddOns([]);
      setFoodImage('');
      setBasePrice(initialPrice);
      setQuantity(1);
      setSelectedSize('');
      setSelectedAddOnIds([]);
      setSpecialInstructions('');
      return;
    }

    setLoading(true);
    foodAPI
      .getById(foodId)
      .then((res: any) => {
        const food = res.data?.food || res.data;
        
        // Set food details
        setFoodImage(food?.image || '');
        setBasePrice(food?.price || initialPrice);
        setSizes(food?.sizes || []);
        setAddOns(food?.addOns || []);

        // Set default selections - check if we have an existing item in the cart
        const cartItem = cart.find((item: any) => item.foodId === foodId);
        if (cartItem) {
          // Editing existing cart item - preserve selections
          const defaultSize = food?.sizes?.[0] ? getItemId(food.sizes[0]) : '';
          setSelectedSize(cartItem.selectedSize || defaultSize);
          setSelectedAddOnIds(Array.isArray(cartItem.selectedAddOns) ? cartItem.selectedAddOns : []);
          setQuantity(cartItem.quantity || 1);
          setSpecialInstructions(cartItem.specialInstructions || '');
        } else {
          // Fresh add to cart - reset to defaults
          const defaultSize = food?.sizes?.[0] ? getItemId(food.sizes[0]) : '';
          setSelectedSize(defaultSize);
          setSelectedAddOnIds([]);
          setQuantity(1);
          setSpecialInstructions('');
        }
      })
      .catch((err) => {
        console.error('Error loading food:', err);
      })
      .finally(() => setLoading(false));
  }, [open, foodId]);

  if (!open) return null;

  // Deduplicate addons in case server returns duplicates
  const uniqueAddOns = addOns.filter((addon, index, self) => 
    self.findIndex(a => getItemId(a) === getItemId(addon)) === index
  );

  // Calculate prices
  const selectedSizeObj = sizes.find(s => getItemId(s) === selectedSize);
  const sizePriceToAdd = selectedSizeObj ? selectedSizeObj.price : basePrice;
  const addonsPriceToAdd = uniqueAddOns
    .filter(addon => selectedAddOnIds.includes(getItemId(addon)))
    .reduce((sum, addon) => sum + addon.price, 0);
  
  const itemPrice = sizePriceToAdd + addonsPriceToAdd;
  const totalPrice = itemPrice * quantity;

  const handleSizeClick = (size: Size) => {
    setSelectedSize(getItemId(size));
  };

  const handleAddonToggle = (addon: AddOn) => {
    const addonId = getItemId(addon);
    setSelectedAddOnIds(prev => {
      const alreadySelected = prev.includes(addonId);
      if (alreadySelected) {
        // Remove addon
        return prev.filter(id => id !== addonId);
      } else {
        // Add addon
        return [...prev, addonId];
      }
    });
  };

  const handleSubmit = () => {
    if (existingItem) {
      updateCartItem(foodId, {
        quantity,
        specialInstructions: specialInstructions || undefined,
        selectedSize: selectedSize || undefined,
        selectedAddOns: selectedAddOnIds.length > 0 ? selectedAddOnIds : undefined,
        price: itemPrice,
      });
      addToast(`Updated ${name} in cart`, 'success');
    } else {
      addToCart({
        foodId,
        name,
        price: itemPrice,
        quantity,
        image: foodImage,
        specialInstructions: specialInstructions || undefined,
        selectedSize: selectedSize || undefined,
        selectedAddOns: selectedAddOnIds.length > 0 ? selectedAddOnIds : undefined,
      });
      addToast(`Added ${name} to cart!`, 'success');
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="glass rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="sticky top-0 flex justify-between items-center p-6 border-b border-primary-gold/20 z-10">
          <h2 className="text-xl font-bold text-white">
            {existingItem ? 'Update Cart' : 'Add to Cart'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading...</div>
          ) : (
            <>
              {/* Food Info */}
              <div className="flex items-center gap-4">
                {foodImage && foodImage.startsWith('http') ? (
                  <img
                    src={foodImage}
                    alt={name}
                    className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-dark-input flex items-center justify-center text-3xl flex-shrink-0">
                    {foodImage || '🍽️'}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-white">{name}</h3>
                  <p className="text-primary-gold font-bold text-lg">
                    ₹{sizePriceToAdd}
                    {addonsPriceToAdd > 0 && ` + ₹${addonsPriceToAdd}`}
                  </p>
                </div>
              </div>

              {/* Sizes */}
              {sizes.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-white mb-3">
                    Select Size
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {sizes.map((size) => {
                      const sizeId = getItemId(size);
                      const isSelected = selectedSize === sizeId;
                      return (
                        <button
                          key={sizeId}
                          onClick={() => handleSizeClick(size)}
                          className={`p-4 rounded-lg border-2 transition-all text-left font-semibold ${
                            isSelected
                              ? 'border-primary-gold bg-primary-gold/20 text-white'
                              : 'border-gray-600 text-gray-200 hover:border-primary-gold hover:bg-primary-gold/10'
                          }`}
                        >
                          <div className="text-sm">{size.name}</div>
                          <div
                            className={`text-xs mt-1 ${
                              isSelected
                                ? 'text-primary-gold font-bold'
                                : 'text-gray-400'
                            }`}
                          >
                            ₹{size.price}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Add-ons */}
              {uniqueAddOns.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-white mb-3">
                    Add-ons (Optional)
                  </label>
                  <div className="space-y-2">
                    {uniqueAddOns.map((addon) => {
                      const addonId = getItemId(addon);
                      const isChecked = selectedAddOnIds.includes(addonId);
                      return (
                        <label
                          key={`addon-${addonId}`}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border ${
                            isChecked
                              ? 'border-primary-gold bg-primary-gold/10'
                              : 'border-gray-600 hover:border-primary-gold'
                          }`}
                        >
                          <input
                            type="checkbox"
                            id={`check-${addonId}`}
                            checked={isChecked}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleAddonToggle(addon);
                            }}
                            className="w-4 h-4 accent-primary-gold cursor-pointer flex-shrink-0"
                          />
                          <span className="flex-1 text-white">{addon.name}</span>
                          <span className="text-primary-gold font-bold text-sm flex-shrink-0">
                            +₹{addon.price}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg bg-dark-input text-white hover:bg-dark-border transition-colors flex items-center justify-center text-xl flex-shrink-0"
                  >
                    −
                  </button>
                  <span className="text-2xl font-bold text-white w-12 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(20, quantity + 1))}
                    className="w-10 h-10 rounded-lg bg-dark-input text-white hover:bg-dark-border transition-colors flex items-center justify-center text-xl flex-shrink-0"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Special Instructions */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Special Instructions (optional)
                </label>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="e.g., Extra spicy, no onions..."
                  className="input w-full h-20 resize-none"
                  maxLength={200}
                />
              </div>
            </>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 flex justify-between items-center p-6 border-t border-primary-gold/20 bg-dark-bg/95 backdrop-blur-sm">
          <div>
            <p className="text-sm text-gray-400">Total</p>
            <p className="text-2xl font-bold text-primary-gold">
              ₹{totalPrice}
            </p>
          </div>
          <button
            onClick={handleSubmit}
            className="btn btn-primary px-8"
          >
            {existingItem ? '✓ Update Cart' : '🛒 Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddToCartModal;
