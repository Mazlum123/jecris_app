import { useState, ReactNode } from "react";
import { CartContext, CartContextType } from "./CartContext";

type Book = {
  id: string;
  title: string;
  author: string;
  price: number;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<Book[]>([]);

  const addToCart = (book: Book) => setCartItems((prev) => [...prev, book]);
  const removeFromCart = (bookId: string) =>
    setCartItems((prev) => prev.filter((book) => book.id !== bookId));
  const clearCart = () => setCartItems([]);

  const value: CartContextType = {
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
