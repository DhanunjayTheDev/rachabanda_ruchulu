import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  foodId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  selectedSize?: string;
  selectedAddOns?: string[];
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface CartStore {
  items: CartItem[];
  user: User | null;
  token: string | null;
  addToCart: (item: CartItem) => void;
  removeFromCart: (foodId: string) => void;
  updateQuantity: (foodId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  isLoggedIn: () => boolean;
}

const useStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      user: null,
      token: null,

      addToCart: (item) => {
        set((state) => {
          const existingItem = state.items.find((i) => i.foodId === item.foodId);
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.foodId === item.foodId ? { ...i, quantity: i.quantity + item.quantity } : i
              ),
            };
          }
          return { items: [...state.items, item] };
        });
      },

      removeFromCart: (foodId) => {
        set((state) => ({
          items: state.items.filter((item) => item.foodId !== foodId),
        }));
      },

      updateQuantity: (foodId, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.foodId === foodId ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      setUser: (user) => {
        set({ user });
      },

      setToken: (token) => {
        set({ token });
      },

      isLoggedIn: () => {
        return !!get().token && !!get().user;
      },

      logout: () => {
        set({ user: null, token: null, items: [] });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
      },
    }),
    {
      name: 'rachabanda-store',
    }
  )
);

export default useStore;
