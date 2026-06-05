"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product } from "../lib/products";

export interface CartItem extends Product {
  cartQuantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  walletBalance: number;
  addFunds: (amount: number) => void;
  deductFunds: (amount: number) => void;
}

const CartContext = createContext<CartContextType>({
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  cartCount: 0,
  cartTotal: 0,
  wishlist: [],
  addToWishlist: () => {},
  removeFromWishlist: () => {},
  walletBalance: 0,
  addFunds: () => {},
  deductFunds: () => {},
});

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [walletBalance, setWalletBalance] = useState<number>(0);

  // Load from local storage
  useEffect(() => {
    const savedCart = localStorage.getItem("sd_bhulia_cart");
    const savedWishlist = localStorage.getItem("sd_bhulia_wishlist");
    const savedWallet = localStorage.getItem("sd_bhulia_wallet");

    if (savedCart && cart.length === 0) {
      try {
        const parsed = JSON.parse(savedCart);
        if (parsed.length > 0) {
          // Avoiding setState loop for empty init
          setCart(parsed);
        }
      } catch {}
    }
    
    if (savedWishlist && wishlist.length === 0) {
      try {
        const parsed = JSON.parse(savedWishlist);
        if (parsed.length > 0) {
          setWishlist(parsed);
        }
      } catch {}
    }

    if (savedWallet) {
      try {
        setWalletBalance(parseFloat(savedWallet));
      } catch {}
    }
  }, []); // Only run once on mount

  // Save to local storage
  useEffect(() => {
    localStorage.setItem("sd_bhulia_cart", JSON.stringify(cart));
    localStorage.setItem("sd_bhulia_wishlist", JSON.stringify(wishlist));
    localStorage.setItem("sd_bhulia_wallet", walletBalance.toString());
  }, [cart, wishlist, walletBalance]);

  const addToWishlist = (product: Product) => {
    setWishlist((prev) => {
      if (prev.find((item) => item.id === product.id)) return prev;
      return [...prev, product];
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist((prev) => prev.filter((item) => item.id !== productId));
  };

  const addFunds = (amount: number) => {
    setWalletBalance((prev) => prev + amount);
  };

  const deductFunds = (amount: number) => {
    setWalletBalance((prev) => Math.max(0, prev - amount));
  };

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, cartQuantity: item.cartQuantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, cartQuantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((total, item) => total + item.cartQuantity, 0);
  
  const cartTotal = cart.reduce((total, item) => {
    const priceNum = parseInt(item.price.replace(/[^0-9]/g, ""));
    return total + priceNum * item.cartQuantity;
  }, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, cartCount, cartTotal, wishlist, addToWishlist, removeFromWishlist, walletBalance, addFunds, deductFunds }}>
      {children}
    </CartContext.Provider>
  );
};
