import React from 'react';

interface Transaction {
  id: string;
  orderId: string;
  type: string;
  status: string;
  amount: number;
}

interface WalletManagerProps {
  availableBalance: number;
  escrowBalance: number;
  totalEarned: number;
  myTransactions: Transaction[];
  handleRequestPayout: () => void;
}

export default function WalletManager({
  availableBalance,
  escrowBalance,
  totalEarned,
  myTransactions,
  handleRequestPayout
}: WalletManagerProps) {
  return (
    <div className="space-y-6 animate-in fade-in">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Wallet & Earnings</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-500 to-green-700 p-8 rounded-3xl shadow-lg text-white">
          <h3 className="text-white/80 text-xs font-bold uppercase tracking-wider mb-2">Available Balance</h3>
          <div className="text-4xl font-black mb-1">₹{availableBalance.toLocaleString('en-IN')}</div>
          <p className="text-xs text-green-100 mt-4">Funds cleared from delivered orders. Ready to withdraw.</p>
          <button 
            onClick={handleRequestPayout}
            className="mt-6 w-full py-2 bg-white text-green-700 font-bold rounded-xl text-sm shadow-sm hover:bg-gray-50 transition-colors"
          >
            Request Withdrawal
          </button>
        </div>
        
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Pending Escrow</h3>
            <div className="text-4xl font-black text-orange-500">₹{escrowBalance.toLocaleString('en-IN')}</div>
            <p className="text-xs text-gray-400 mt-4">Commissions locked in active transit. Auto-funds upon delivery.</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Total Earned</h3>
            <div className="text-4xl font-black text-gray-900">₹{totalEarned.toLocaleString('en-IN')}</div>
            <p className="text-xs text-gray-400 mt-4">Lifetime earnings from Bhulia Hub.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Ledger Transactions</h3>
        {myTransactions.length === 0 ? (
          <div className="text-center py-10 text-gray-500 font-medium">No transactions found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-gray-500 border-b border-gray-100 bg-gray-50">
                  <th className="py-4 px-4 font-bold rounded-tl-xl">Order Ref</th>
                  <th className="py-4 px-4 font-bold">Type</th>
                  <th className="py-4 px-4 font-bold">Status</th>
                  <th className="py-4 px-4 font-bold text-right rounded-tr-xl">Amount</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-50">
                {myTransactions.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 font-mono text-xs text-gray-500">{t.orderId}</td>
                    <td className="py-4 px-4 font-medium text-gray-700 capitalize">{t.type.replace('_', ' ')}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                        t.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                        t.status === 'pending_escrow' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                        'bg-gray-50 text-gray-700 border-gray-200'
                      }`}>
                        {t.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-gray-900">+₹{t.amount.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
