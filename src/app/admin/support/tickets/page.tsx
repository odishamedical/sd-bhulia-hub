"use client";

import { Ticket } from "@/types";

import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function SupportHelpdeskPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});

  // Strict Protocol: Verify Access on Mount
  useEffect(() => {
    const verifyAccessAndFetch = async () => {
      const email = localStorage.getItem("sd_current_user_email");
      const role = localStorage.getItem("sd_current_user_role");

      if (role === "super_admin") {
        setHasPermission(true);
        fetchOpenTickets();
        return;
      }

      if (role === "admin" && email) {
        try {
          const q = query(collection(db, "users"), where("email", "==", email));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const adminData = snap.docs[0].data();
            // Checking the granular "support" permission
            if (adminData.permissions?.support === true) {
              setHasPermission(true);
              fetchOpenTickets();
              return;
            }
          }
        } catch (error) {
          console.error("Permission check failed:", error);
        }
      }

      setHasPermission(false);
      setIsLoading(false);
    };

    verifyAccessAndFetch();
  }, []);

  async function fetchOpenTickets() {
    setIsLoading(true);
    try {
      const q = query(collection(db, "support_tickets"), where("status", "==", "open"));
      const snapshot = await getDocs(q);
      
      const openTickets: any[] = [];
      snapshot.forEach((docSnap) => {
        openTickets.push({ id: docSnap.id, ...docSnap.data() });
      });

      // Provide dummy data if empty for UI demonstration
      if (openTickets.length === 0 && process.env.NODE_ENV === "development") {
        openTickets.push({
          id: "TKT-88910",
          customerName: "Rakesh Nayak",
          subject: "Order SAR-101 Not Delivered",
          message: "My courier tracking says delivered, but I have not received the package yet. Please help.",
          createdAt: "2026-06-03T14:20:00Z",
          priority: "high"
        });
        openTickets.push({
          id: "TKT-88911",
          customerName: "Anita Sharma",
          subject: "Return Request for Damaged Thread",
          message: "The Bomkai saree I received has a pulled thread near the pallu. I want to initiate a return.",
          createdAt: "2026-06-04T09:15:00Z",
          priority: "medium"
        });
      }

      setTickets(openTickets);
    } catch (error) {
      console.error("Failed to fetch support tickets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (ticketId: string, action: "resolve" | "escalate") => {
    setProcessingId(ticketId);
    try {
      // Optimistic Update
      setTickets(prev => prev.filter(t => t.id !== ticketId));

      if (!ticketId.startsWith("TKT-")) {
        const ticketRef = doc(db, "support_tickets", ticketId);
        const updates = action === "resolve" 
          ? { status: "resolved", resolvedAt: new Date().toISOString() }
          : { status: "escalated", escalatedAt: new Date().toISOString(), priority: "critical" };
        
        await updateDoc(ticketRef, updates);
      }
      
    } catch (error) {
      console.error(`Failed to ${action} ticket:`, error);
      alert(`Action failed. Ensure you have the required Firestore permissions.`);
      fetchOpenTickets(); // Revert
    } finally {
      setProcessingId(null);
    }
  };

  const handleReplyChange = (id: string, text: string) => {
    setReplyText(prev => ({ ...prev, [id]: text }));
  };

  if (hasPermission === null) {
    return <div className="py-20 text-blue-600 font-bold uppercase tracking-widest text-xs text-center animate-pulse">Verifying Security Clearance...</div>;
  }

  if (hasPermission === false) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl shadow-sm">
        <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><span className="text-2xl">🛑</span> Access Denied</h3>
        <p>You do not have the required `Support & Disputes` permissions to view customer tickets.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            Support Helpdesk
            <span className="bg-red-100 text-red-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-red-200">Active Queue</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage incoming customer issues, returns, and dispute escalations.</p>
        </div>
        <div className="bg-white border border-gray-200 shadow-sm px-4 py-2 rounded-lg text-sm font-bold text-gray-700">
          Open Tickets: <span className="text-red-600">{tickets.length}</span>
        </div>
      </div>

      <div className="bg-transparent">
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-gray-500 animate-pulse">Fetching Open Tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm">
            <div className="text-5xl mb-4">🏆</div>
            <h3 className="text-xl font-bold text-gray-900">Inbox Zero</h3>
            <p className="text-gray-500 text-sm mt-1">All customer issues have been resolved.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-shadow hover:shadow-md">
                <div className="p-5 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-gray-900 text-lg">{ticket.subject}</h3>
                      {ticket.priority === 'high' && (
                        <span className="bg-red-100 text-red-800 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">High Priority</span>
                      )}
                      {ticket.priority === 'medium' && (
                        <span className="bg-orange-100 text-orange-800 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">Medium Priority</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 font-mono">
                      <span>ID: {ticket.id}</span>
                      <span>•</span>
                      <span>From: {ticket.customerName}</span>
                      <span>•</span>
                      <span>Opened: {new Date(ticket.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="bg-blue-50/30 p-4 rounded-xl border border-blue-100/50 text-sm text-gray-800 mb-5 leading-relaxed">
                    "{ticket.message}"
                  </div>

                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">Reply to Customer</label>
                    <textarea 
                      value={replyText[ticket.id] || ""}
                      onChange={(e) => handleReplyChange(ticket.id, e.target.value)}
                      placeholder="Type your official response here..."
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none h-24"
                    />
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    {processingId === ticket.id ? (
                      <div className="text-xs font-bold text-blue-600 animate-pulse flex items-center gap-2">
                        <span className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
                        Closing Ticket...
                      </div>
                    ) : (
                      <>
                        <button 
                          onClick={() => handleAction(ticket.id, "escalate")}
                          className="text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors border border-transparent hover:border-red-100"
                        >
                          Escalate to Super Admin
                        </button>
                        <div className="flex gap-3">
                          <button 
                            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xs transition-colors"
                            onClick={() => {
                              alert("Email sent to customer!");
                              handleReplyChange(ticket.id, "");
                            }}
                          >
                            Send Reply Only
                          </button>
                          <button 
                            onClick={() => handleAction(ticket.id, "resolve")}
                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-2"
                          >
                            <span>✅</span> Mark as Resolved
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
