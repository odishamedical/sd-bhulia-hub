"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs, doc, updateDoc } from "firebase/firestore";

interface Ticket {
  id: string;
  customerName: string;
  email: string;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved";
  priority: "low" | "medium" | "high" | "urgent";
  createdAt: any;
  updatedAt?: any;
  replies?: { message: string; sender: "admin" | "customer"; timestamp: string }[];
}

export default function AdminTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      // In a real app, you'd fetch from a `support_tickets` collection
      const q = query(collection(db, "support_tickets"));
      const snap = await getDocs(q);
      const data: Ticket[] = [];
      snap.forEach(d => data.push({ id: d.id, ...d.data() } as Ticket));
      
      data.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt).getTime();
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt).getTime();
        return timeB - timeA;
      });
      setTickets(data);
    } catch (e) {
      console.error(e);
      // Let's generate some mock tickets for demo if collection is empty
      setTickets([
        {
          id: "TKT-9921",
          customerName: "Rahul Sharma",
          email: "rahul@example.com",
          subject: "Order not delivered yet",
          message: "Hi, my order #ORD-4512 was supposed to arrive yesterday but I haven't received it.",
          status: "open",
          priority: "high",
          createdAt: new Date().toISOString(),
          replies: []
        },
        {
          id: "TKT-8834",
          customerName: "Priya Singh",
          email: "priya@example.com",
          subject: "Wrong color received",
          message: "I ordered a red Sambalpuri saree but received a blue one. How can I exchange?",
          status: "in_progress",
          priority: "medium",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          replies: [{ message: "We are checking with the weaver.", sender: "admin", timestamp: new Date().toISOString() }]
        }
      ]);
    }
    setLoading(false);
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    setProcessingId(id);
    try {
      // await updateDoc(doc(db, "support_tickets", id), { status: newStatus, updatedAt: new Date().toISOString() });
      setTickets(prev => prev.map(t => t.id === id ? { ...t, status: newStatus as any } : t));
      if (selectedTicket?.id === id) {
        setSelectedTicket({ ...selectedTicket, status: newStatus as any });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;
    
    setProcessingId(selectedTicket.id);
    try {
      const newReply = { message: replyMessage, sender: "admin" as const, timestamp: new Date().toISOString() };
      const updatedReplies = [...(selectedTicket.replies || []), newReply];
      
      // await updateDoc(doc(db, "support_tickets", selectedTicket.id), { replies: updatedReplies, status: "in_progress" });
      
      const updatedTicket = { ...selectedTicket, replies: updatedReplies, status: "in_progress" as const };
      setSelectedTicket(updatedTicket);
      setTickets(prev => prev.map(t => t.id === selectedTicket.id ? updatedTicket : t));
      setReplyMessage("");
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredTickets = tickets.filter(t => filterStatus === "all" || t.status === filterStatus);

  const getPriorityColor = (p: string) => {
    if (p === "urgent") return "text-red-600 bg-red-100 border-red-200";
    if (p === "high") return "text-orange-600 bg-orange-100 border-orange-200";
    if (p === "medium") return "text-yellow-600 bg-yellow-100 border-yellow-200";
    return "text-green-600 bg-green-100 border-green-200";
  };

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans flex flex-col h-[calc(100vh-6rem)]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 shrink-0">
        <div>
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Customer Tickets</h2>
          <p className="text-gray-500 text-sm">Unified helpdesk for inquiries and dispute resolution.</p>
        </div>
        <select 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Tickets</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Ticket List */}
        <div className="w-1/3 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50 font-bold text-sm text-gray-700">
            Inbox ({filteredTickets.length})
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-2">
            {filteredTickets.map(t => (
              <div 
                key={t.id} 
                onClick={() => setSelectedTicket(t)}
                className={`p-4 rounded-lg cursor-pointer border transition-colors ${selectedTicket?.id === t.id ? "bg-blue-50 border-blue-200" : "bg-white border-gray-100 hover:border-gray-300"}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-gray-900 text-sm truncate pr-2">{t.customerName}</span>
                  <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full border ${getPriorityColor(t.priority)}`}>
                    {t.priority}
                  </span>
                </div>
                <div className="text-xs text-gray-800 font-medium truncate mb-2">{t.subject}</div>
                <div className="flex justify-between items-center text-[10px] uppercase font-bold text-gray-400">
                  <span>{t.id}</span>
                  <span className={t.status === 'open' ? 'text-blue-500' : t.status === 'resolved' ? 'text-green-500' : 'text-orange-500'}>
                    {t.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ticket Details */}
        <div className="w-2/3 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          {selectedTicket ? (
            <>
              <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-start shrink-0">
                <div>
                  <h3 className="font-bold text-xl text-gray-900 mb-1">{selectedTicket.subject}</h3>
                  <p className="text-sm text-gray-500">From: <span className="font-bold text-gray-700">{selectedTicket.customerName}</span> &lt;{selectedTicket.email}&gt;</p>
                </div>
                <div className="flex gap-2">
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleStatusUpdate(selectedTicket.id, e.target.value)}
                    className="text-xs font-bold border border-gray-300 rounded px-2 py-1 outline-none"
                  >
                    <option value="open">Mark Open</option>
                    <option value="in_progress">Mark In Progress</option>
                    <option value="resolved">Mark Resolved</option>
                  </select>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
                {/* Original Message */}
                <div className="flex flex-col items-start max-w-[80%]">
                  <div className="bg-white border border-gray-200 p-4 rounded-2xl rounded-tl-sm shadow-sm">
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{selectedTicket.message}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 ml-1">
                    {new Date(selectedTicket.createdAt).toLocaleString()}
                  </span>
                </div>

                {/* Replies */}
                {selectedTicket.replies?.map((r, i) => (
                  <div key={i} className={`flex flex-col max-w-[80%] ${r.sender === 'admin' ? 'items-end self-end ml-auto' : 'items-start'}`}>
                    <div className={`p-4 rounded-2xl shadow-sm border ${r.sender === 'admin' ? 'bg-blue-600 text-white rounded-tr-sm border-blue-700' : 'bg-white text-gray-800 rounded-tl-sm border-gray-200'}`}>
                      <p className="text-sm whitespace-pre-wrap">{r.message}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 mx-1">
                      {new Date(r.timestamp).toLocaleString()} • {r.sender === 'admin' ? 'You' : selectedTicket.customerName}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-gray-100 bg-white shrink-0">
                <form onSubmit={handleReply} className="flex gap-4">
                  <input 
                    type="text" 
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your reply to the customer..."
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={selectedTicket.status === 'resolved'}
                  />
                  <button 
                    type="submit"
                    disabled={!replyMessage.trim() || processingId === selectedTicket.id || selectedTicket.status === 'resolved'}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-sm shadow hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    Send Reply
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Select a ticket from the inbox to view details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
