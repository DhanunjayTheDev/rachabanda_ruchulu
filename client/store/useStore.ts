import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cartAPI, wishlistAPI } from '@/lib/api';

interface CartItem {
  _id?: string;
  foodId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  selectedSize?: string;
  selectedAddOns?: string[];
}

interface WishlistItem {
  _id?: string;
  foodId: string;
  name: string;
  price: number;
  image: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface CartStore {
  items: CartItem[];
  wishlistItems: WishlistItem[];
  user: User | null;
  token: string | null;
  isLoadingCart: boolean;
  isLoadingWishlist: boolean;
  addToCart: (item: CartItem) => void;
  removeFromCart: (foodId: string) => void;
  updateQuantity: (foodId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  getWishlistCount: () => number;
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (foodId: string) => void;
  isInWishlist: (foodId: string) => boolean;
  isInCart: (foodId: string) => boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  isLoggedIn: () => boolean;
  syncCartFromServer: () => Promise<void>;
  syncWishlistFromServer: () => Promise<void>;
  syncCartToServer: () => Promise<void>;
}

const useStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      wishlistItems: [],
      user: null,
      token: null,
      isLoadingCart: false,
      isLoadingWishlist: false,

      addToCart: (item) => {
        const normalizeAddOns = (addOns?: string[]) =>
          addOns && addOns.length > 0 ? JSON.stringify([...addOns].sort()) : '[]';

        set((state) => {
          const existingItem = state.items.find(
            (i) =>
              i.foodId === item.foodId &&
              (i.selectedSize || '') === (item.selectedSize || '') &&
              normalizeAddOns(i.selectedAddOns) === normalizeAddOns(item.selectedAddOns)
          );
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i === existingItem ? { ...i, quantity: i.quantity + item.quantity } : i
              ),
            };
          }
          return { items: [...state.items, item] };
        });
        // Sync to server and capture the server-assigned _id
        cartAPI.add({
          foodId: item.foodId,
          quantity: item.quantity,
          selectedSize: item.selectedSize,
          selectedAddOns: item.selectedAddOns,
        }).then((res) => {
          if (res.data?.cart?.items) {
            // Find the matching server item by food + size + addons
            const serverItem = res.data.cart.items.find(
              (i: any) =>
                (i.food?.toString() === item.foodId || i.food === item.foodId) &&
                (i.selectedSize || '') === (item.selectedSize || '') &&
                normalizeAddOns(i.selectedAddOns) === normalizeAddOns(item.selectedAddOns)
            );
            if (serverItem?._id) {
              set((state) => ({
                items: state.items.map((i) =>
                  i.foodId === item.foodId &&
                  (i.selectedSize || '') === (item.selectedSize || '') &&
                  normalizeAddOns(i.selectedAddOns) === normalizeAddOns(item.selectedAddOns)
                    ? { ...i, _id: serverItem._id }
                    : i
                ),
              }));
            }
          }
        }).catch((error) => {
          console.error('Failed to add to cart on server:', error);
        });
      },

      removeFromCart: async (itemId) => {
        // itemId can be _id (from cart page) or foodId (fallback)
        const itemToRemove = get().items.find((i) => i._id === itemId || i.foodId === itemId);
        if (!itemToRemove) return;
        const serverItemId = itemToRemove._id;
        
        // Call server API to remove item from cart first
        if (serverItemId) {
          try {
            await cartAPI.remove(serverItemId);
          } catch (error) {
            console.error('Failed to remove from cart on server:', error);
            return; // Don't update local state if server deletion failed
          }
        }

        // Only update local state after successful server deletion
        set((state) => ({
          items: state.items.filter((item) =>
            serverItemId ? item._id !== serverItemId : item.foodId !== itemId
          ),
        }));
      },

      updateQuantity: (itemId, quantity) => {
        // itemId can be _id (from cart page) or foodId (fallback)
        set((state) => ({
          items: state.items.map((item) =>
            (item._id === itemId || item.foodId === itemId) ? { ...item, quantity } : item
          ),
        }));
        // Call server API to update cart item
        if (quantity > 0) {
          const item = get().items.find((i) => i._id === itemId || i.foodId === itemId);
          if (item?._id) {
            cartAPI.update(item._id, { quantity }).catch((error) => {
              console.error('Failed to update cart on server:', error);
            });
          }
        }
      },

      clearCart: () => {
        set({ items: [] });
        // Call server API to clear cart
        cartAPI.clear().catch((error) => {
          console.error('Failed to clear cart on server:', error);
        });
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getWishlistCount: () => {
        return get().wishlistItems.length;
      },

      addToWishlist: (item) => {
        set((state) => {
          const exists = state.wishlistItems.find((i) => i.foodId === item.foodId);
          if (exists) return state;
          return { wishlistItems: [...state.wishlistItems, item] };
        });
        // Call server API
        wishlistAPI.add({ foodId: item.foodId }).catch((error) => {
          console.error('Failed to add to wishlist on server:', error);
        });
      },

      removeFromWishlist: async (foodId) => {
        // Call server API first
        try {
          await wishlistAPI.remove({ foodId });
        } catch (error) {
          console.error('Failed to remove from wishlist on server:', error);
          return; // Don't update local state if server deletion failed
        }

        // Only update local state after successful server deletion
        set((state) => ({
          wishlistItems: state.wishlistItems.filter((item) => item.foodId !== foodId),
        }));
      },

      isInWishlist: (foodId) => {
        return get().wishlistItems.some((item) => item.foodId === foodId);
      },

      isInCart: (foodId) => {
        return get().items.some((item) => item.foodId === foodId);
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
        set({ user: null, token: null, items: [], wishlistItems: [] });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
      },

      syncCartFromServer: async () => {
        try {
          set({ isLoadingCart: true });
          const res = await cartAPI.get();
          
          if (res.data?.success && res.data?.cart?.items) {
            // Filter out items where food data is missing (deleted foods)
            const validItems = res.data.cart.items.filter((item: any) => item.food && item.food._id);
            
            const cartItems = validItems.map((item: any) => ({
              _id: item._id,
              foodId: item.food._id,
              name: item.food.name,
              price: item.price,
              quantity: item.quantity,
              image: item.food.image || '',
              selectedSize: item.selectedSize,
              selectedAddOns: item.selectedAddOns,
            }));
            set({ items: cartItems });
          }
        } catch (error) {
          console.error('Failed to sync cart from server:', error);
        } finally {
          set({ isLoadingCart: false });
        }
      },

      syncWishlistFromServer: async () => {
        try {
          set({ isLoadingWishlist: true });
          const res = await wishlistAPI.get();
          
          if (res.data?.success && res.data?.wishlist?.items) {
            // Filter out items where food data is missing (deleted foods)
            const validItems = res.data.wishlist.items.filter((item: any) => item.food && item.food._id);
            
            const wishlistItems = validItems.map((item: any) => ({
              _id: item._id,
              foodId: item.food._id,
              name: item.food.name,
              price: item.food.price,
              image: item.food.image || '',
            }));
            set({ wishlistItems });
          }
        } catch (error) {
          console.error('Failed to sync wishlist from server:', error);
        } finally {
          set({ isLoadingWishlist: false });
        }
      },

      syncCartToServer: async () => {
        try {
          const currentItems = get().items;
          if (currentItems.length === 0) return;

          for (const item of currentItems) {
            if (!item._id) {
              // New item, add to server
              await cartAPI.add({
                foodId: item.foodId,
                quantity: item.quantity,
                selectedSize: item.selectedSize,
                selectedAddOns: item.selectedAddOns,
              });
            }
          }
        } catch (error) {
          console.error('Failed to sync cart to server:', error);
        }
      },
    }),
    {
      name: 'rachabanda-store',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        items: state.items,
        wishlistItems: state.wishlistItems,
      }),
    }
  )
);

export default useStore;
