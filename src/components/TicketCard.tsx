import React from "react";
import { Ticket } from "@/types";

interface TicketCardProps {
  ticket: Ticket;
  index: number; // zero‑based position in the list
}

const gradients = [
  "bg-gradient-to-br from-amber-600 to-amber-500",
  "bg-gradient-to-br from-sky-700 to-sky-500",
  "bg-gradient-to-br from-emerald-600 to-emerald-500",
  "bg-gradient-to-br from-purple-700 to-purple-500",
];

export default function TicketCard({ ticket, index }: TicketCardProps) {
  const bgClass = gradients[index % gradients.length];
  return (
    <div className={`rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden transition-shadow hover:shadow-md ${bgClass} p-5`}>
      <div className="border-b border-gray-100 flex justify-between items-start bg-white/10 p-3 rounded-t-lg">
        <h3 className="font-bold text-lg text-white">{ticket.subject}</h3>
        {ticket.priority === "high" && (
          <span className="bg-red-100 text-red-800 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">High Priority</span>
        )}
        {ticket.priority === "medium" && (
          <span className="bg-orange-100 text-orange-800 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">Medium Priority</span>
        )}
      </div>
      <div className="p-4 text-white">
        <p className="mb-4">{(ticket as any).description}</p>
        <textarea
          placeholder="Type your official response here..."
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-sm text-white focus:bg-white/20 focus:border-white focus:ring-1 focus:ring-white outline-none transition-all resize-none h-24"
        />
        {/* Action buttons */}
        <div className="mt-5 flex items-center justify-between text-white">
          <button className="text-xs font-bold text-red-200 hover:text-red-100 hover:bg-red-900 px-3 py-2 rounded-lg transition-colors border border-transparent hover:border-red-800">
            Escalate to Super Admin
          </button>
          <div className="flex gap-3">
            <button className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl text-xs transition-colors">
              Send Reply Only
            </button>
            <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-2">
              ✅ Mark as Resolved
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
