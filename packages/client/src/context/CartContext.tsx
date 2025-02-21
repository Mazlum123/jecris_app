import { createContext } from "react";

type Book = {
  id: string;
  title: string;
  author: string;
  price: number;
};

export type CartContextType = {
  cartItems: Book[];
  addToCart: (book: Book) => void;
  removeFromCart: (bookId: string) => void;
  clearCart: () => void;
};

export const CartContext = createContext<CartContextType | undefined>(undefined);