"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle, Info, XCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getShopNotifications, ShopNotification } from '@/lib/firestore/notifications';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<ShopNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    if (!user) return;
    const notifs = await getShopNotifications(user.uid);
    setNotifications(notifs);
  };

  const markAsRead = async (notificationId: string) => {
    if (!notificationId) return;
    try {
      const docRef = doc(db, "notifications", notificationId);
      await updateDoc(docRef, { isRead: true });
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
    } catch (e) {
      console.error("Error marking as read", e);
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    for (const n of unread) {
      if (n.id) await markAsRead(n.id);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIconForType = (type: string) => {
    switch (type) {
      case 'approved': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'info_requested': return <Info className="w-5 h-5 text-blue-500" />;
      default: return <Bell className="w-5 h-5 text-[#C5A059]" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
      >
        <Bell className="w-6 h-6 text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0A1121] border border-white/20 shadow-2xl rounded-xl z-50 overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-white/10 bg-black/40">
            <h3 className="font-bold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs text-[#C5A059] hover:underline font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                No notifications yet.
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {notifications.map(notif => (
                  <div 
                    key={notif.id} 
                    className={`p-4 hover:bg-white/5 transition-colors cursor-pointer ${!notif.isRead ? 'bg-[#C5A059]/5' : ''}`}
                    onClick={() => { if(notif.id && !notif.isRead) markAsRead(notif.id); }}
                  >
                    <div className="flex gap-3 items-start">
                      <div className="mt-1">
                        {getIconForType(notif.type)}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm ${!notif.isRead ? 'text-white font-medium' : 'text-gray-300'}`}>
                          {notif.message}
                        </p>
                        <span className="text-[10px] text-gray-500 mt-1 block">
                          {notif.createdAt?.toDate ? notif.createdAt.toDate().toLocaleString() : new Date(notif.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {!notif.isRead && (
                        <div className="w-2 h-2 rounded-full bg-[#C5A059] mt-2"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
