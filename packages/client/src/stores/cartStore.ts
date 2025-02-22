import { create } from 'zustand';
import { api } from '../lib/api';
import type { ApiResponse } from '../types/api';
import { AxiosError } from 'axios';

interface Book {
  id: string;
  title: string;
  description: string;
  price: number;
  author?: string;
}

interface ApiErrorResponse {
  status: string;
  message: string;
  data: null;
}

interface CartState {
  items: Book[];
  isLoading: boolean;
  error: string | null;
  addToCart: (book: Book) => Promise<void>;
  removeFromCart: (bookId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  initializeCart: () => Promise<void>;
  totalPrice: () => number;
  setError: (error: string | null) => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  initializeCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<ApiResponse<Book[]>>('/cart');
      if (response.data.data) {
        set({ items: response.data.data });
      }
    } catch (error) {
      console.error('Erreur chargement panier:', error);
      set({ error: 'Erreur lors du chargement du panier' });
    } finally {
      set({ isLoading: false });
    }
  },

  addToCart: async (book) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<ApiResponse<Book>>('/cart', { 
        bookId: Number(book.id),
      });

      if (response.data.status === 'success') {
        set((state) => ({
          items: [...state.items, book],
          error: null
        }));
      } else {
        throw new Error(response.data.message || 'Erreur lors de l\'ajout au panier');
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const errorMessage = axiosError.response?.data?.message || 'Erreur lors de l\'ajout au panier';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },

  removeFromCart: async (bookId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.delete<ApiResponse<null>>(`/cart/${bookId}`);
      
      if (response.data.status === 'success') {
        set((state) => ({
          items: state.items.filter(item => item.id !== bookId),
          error: null
        }));
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const errorMessage = axiosError.response?.data?.message || 'Erreur lors de la suppression du panier';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },

  clearCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.delete<ApiResponse<null>>('/cart/clear');
      
      if (response.data.status === 'success') {
        set({ items: [], error: null });
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      const errorMessage = axiosError.response?.data?.message || 'Erreur lors du vidage du panier';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },

  totalPrice: () => {
    return get().items.reduce((sum, item) => sum + Number(item.price), 0);
  },

  setError: (error) => set({ error })
}));