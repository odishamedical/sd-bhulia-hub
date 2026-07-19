export default function SupportTicketsTab() {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6 animate-in fade-in max-w-3xl">
      <h2 className="text-xl font-bold text-gray-900">Contact Admin Support</h2>
      <p className="text-sm text-gray-500 mb-6 font-medium">Raise a dispute or ask for help regarding GI-tags or payouts.</p>
      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-5">Raise a Ticket</h3>
        <form className="space-y-4">
          <input type="text" placeholder="Subject" className="w-full border border-gray-300 bg-white rounded-xl p-3 text-sm text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all" />
          <textarea rows={4} placeholder="Describe your issue..." className="w-full border border-gray-300 bg-white rounded-xl p-3 text-sm text-gray-900 shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0070F3] outline-none transition-all"></textarea>
          <button type="button" className="bg-[#1f2937] text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-colors shadow-sm">Submit Ticket</button>
        </form>
      </div>
    </div>
  );
}
