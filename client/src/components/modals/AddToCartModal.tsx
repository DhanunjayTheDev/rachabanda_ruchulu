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

const AddToCartModal = ({ open, onClose, foodId, name, initialPrice }: AddToCartModalProps) => {
  const addToCart = useStore((s) => s.addToCart);
  const updateCartItem = useStore((s) => s.updateCartItem);
  const cart = useStore((s) => s.cart);
  const { addToast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [price, setPrice] = useState(initialPrice);
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);

  const existingItem = cart.find((item: any) => item.foodId === foodId);

  useEffect(() => {
    if (open && foodId) {
      setLoading(true);
      foodAPI
        .getById(foodId)
        .then((res: any) => {
          const food = res.data?.food || res.data;
          if (food) {
            setPrice(food.price || initialPrice);
            setImage(food.image || '');
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));

      if (existingItem) {
        setQuantity(existingItem.quantity || 1);
        setSpecialInstructions(existingItem.specialInstructions || '');
      } else {
        setQuantity(1);
        setSpecialInstructions('');
      }
    }
  }, [open, foodId, existingItem, initialPrice]);

  if (!open) return null;

  const totalPrice = price * quantity;

  const handleSubmit = () => {
    if (existingItem) {
      updateCartItem(foodId, { quantity, specialInstructions });
      addToast(`Updated ${name} in cart`, 'success');
    } else {
      addToCart({ foodId, name, price, quantity, image, specialInstructions });
      addToast(`Added ${name} to cart!`, 'success');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass rounded-2xl max-w-md w-full p-6 space-y-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">{existingItem ? 'Update Cart' : 'Add to Cart'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">✕</button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading...</div>
        ) : (
          <>
            <div className="flex items-center gap-4">
              {image && image.startsWith('http') ? (
                <img src={image} alt={name} className="w-20 h-20 rounded-xl object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-dark-input flex items-center justify-center text-3xl">{image || '🍽️'}</div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-white">{name}</h3>
                <p className="text-primary-gold font-bold">₹{price}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Quantity</label>
              <div className="flex items-center gap-4">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-lg bg-dark-input text-white hover:bg-dark-border transition-colors flex items-center justify-center text-xl">−</button>
                <span className="text-2xl font-bold text-white w-12 text-center">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(20, quantity + 1))} className="w-10 h-10 rounded-lg bg-dark-input text-white hover:bg-dark-border transition-colors flex items-center justify-center text-xl">+</button>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Special Instructions (optional)</label>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="e.g., Extra spicy, no onions..."
                className="input w-full h-20 resize-none"
                maxLength={200}
              />
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-primary-gold/20">
              <div>
                <p className="text-sm text-gray-400">Total</p>
                <p className="text-2xl font-bold text-primary-gold">₹{totalPrice}</p>
              </div>
              <button onClick={handleSubmit} className="btn btn-primary px-8">
                {existingItem ? '✓ Update Cart' : '🛒 Add to Cart'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AddToCartModal;
