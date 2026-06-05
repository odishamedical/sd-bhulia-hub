"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useCart } from "../context/CartContext";

export default function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { cart, removeFromCart, cartTotal, wishlist, removeFromWishlist } = useCart();
  const [activeTab, setActiveTab] = useState<"cart" | "wishlist">("cart");

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-[#0A1021] border-l border-[#C5A059]/30 z-50 shadow-2xl flex flex-col font-sans transition-transform transform translate-x-0">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#C5A059]/20 bg-[#051815]">
          <div className="flex gap-4">
            <button 
              onClick={() => setActiveTab("cart")}
              className={`text-lg font-serif font-bold ${activeTab === "cart" ? "text-[#C5A059]" : "text-gray-500"}`}
            >
              Shopping Cart ({cart.length})
            </button>
            <button 
              onClick={() => setActiveTab("wishlist")}
              className={`text-lg font-serif font-bold ${activeTab === "wishlist" ? "text-[#C5A059]" : "text-gray-500"}`}
            >
              Wishlist ({wishlist.length})
            </button>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl font-light"
          >
            ×
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === "cart" ? (
            cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <span className="text-5xl opacity-50">🛒</span>
                <p className="text-gray-400 text-sm">Your cart is empty.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4 bg-[#0B2B26] p-3 rounded-xl border border-[#C5A059]/20 relative">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
                      <Image src={item.img} alt={item.title} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white text-sm font-bold truncate">{item.title}</h4>
                      <p className="text-[#C5A059] text-sm mt-1">{item.price}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Qty: {item.cartQuantity}</p>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="absolute top-2 right-2 text-red-400 hover:text-red-300 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )
          ) : (
            wishlist.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <span className="text-5xl opacity-50">❤️</span>
                <p className="text-gray-400 text-sm">Your wishlist is empty.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {wishlist.map((item) => (
                  <div key={item.id} className="flex gap-4 bg-[#0B2B26] p-3 rounded-xl border border-[#C5A059]/20 relative">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
                      <Image src={item.img} alt={item.title} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white text-sm font-bold truncate">{item.title}</h4>
                      <p className="text-[#C5A059] text-sm mt-1">{item.price}</p>
                    </div>
                    <button 
                      onClick={() => removeFromWishlist(item.id)}
                      className="absolute top-2 right-2 text-red-400 hover:text-red-300 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* Footer */}
        {activeTab === "cart" && cart.length > 0 && (
          <div className="p-5 border-t border-[#C5A059]/20 bg-[#051815]">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-300 text-sm">Subtotal</span>
              <span className="text-[#C5A059] text-xl font-serif font-bold">₹{cartTotal.toLocaleString()}</span>
            </div>
            <button className="w-full py-3 bg-gradient-to-r from-[#E57138] to-[#D56128] text-white font-bold uppercase tracking-widest rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all">
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
