import { create } from 'zustand';

export const useChatStore = create((set) => ({
  isOpen: false,
  isMinimized: false,
  selectedOrderId: null,
  selectedOrderStatus: null,

  openChat: (orderId, orderStatus) =>
    set({
      isOpen: true,
      isMinimized: false,
      selectedOrderId: orderId,
      selectedOrderStatus: orderStatus,
    }),

  closeChat: () =>
    set({
      isOpen: false,
      selectedOrderId: null,
      selectedOrderStatus: null,
    }),

  minimizeChat: () => set({ isMinimized: true }),
  maximizeChat: () => set({ isMinimized: false }),
  toggleMinimize: () => set((state) => ({ isMinimized: !state.isMinimized })),
}));
