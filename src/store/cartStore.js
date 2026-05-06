import { create } from 'zustand';

export const useCartStore = create((set) => ({
  cartItems: [],
  
  addToCart: (product, customization) => set((state) => ({
    cartItems: [...state.cartItems, { ...product, customization, id: Date.now() }]
  })),
  
  removeFromCart: (id) => set((state) => ({
    cartItems: state.cartItems.filter(item => item.id !== id)
  })),
  
  clearCart: () => set({ cartItems: [] }),
  
  updateCart: (items) => set({ cartItems: items }),
}));
