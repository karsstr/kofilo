// src/store/useCartStore.ts
import { create } from 'zustand';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  variants?: string;
}

interface CartStore {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
  cart: [],
  
  // Fungsi tambah ke keranjang (jika item sama, jumlahnya ditambah)
  addToCart: (item) => set((state) => {
    const existingItem = state.cart.find((i) => i.id === item.id);
    if (existingItem) {
      return {
        cart: state.cart.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        ),
      };
    }
    return { cart: [...state.cart, item] };
  }),

  // Fungsi hapus item dari keranjang
  removeFromCart: (id) => set((state) => ({
    cart: state.cart.filter((item) => item.id !== id)
  })),

  // Fungsi ubah jumlah (+ atau -) di halaman cart nanti
  updateQuantity: (id, quantity) => set((state) => ({
    cart: state.cart.map((item) => 
      item.id === id ? { ...item, quantity } : item
    )
  })),

  // Fungsi kosongkan keranjang (setelah sukses bayar)
  clearCart: () => set({ cart: [] }),
}));