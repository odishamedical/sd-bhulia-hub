export default function MessagesTab() {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 animate-in fade-in">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Customer Messages</h2>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3 md:border-r border-gray-100 md:pr-6">
          <div className="p-5 bg-gray-50 rounded-2xl text-sm text-gray-500 font-medium text-center border border-gray-100">No active conversations</div>
        </div>
        <div className="w-full md:w-2/3 flex items-center justify-center text-gray-400 font-medium bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 min-h-[300px]">
          Select a chat to start messaging
        </div>
      </div>
    </div>
  );
}
