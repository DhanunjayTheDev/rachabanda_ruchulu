
import { useState, useEffect } from 'react';
import { paymentsAPI, ordersAPI } from '@/lib/api';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both payments and orders to get complete payment data
        const [paymentsRes, revenueRes, ordersRes] = await Promise.allSettled([
          paymentsAPI.getAll(),
          paymentsAPI.getRevenue(),
          ordersAPI.getAll(),
        ]);
        
        // Get payments from Payment model
        if (paymentsRes.status === 'fulfilled') {
          setPayments(paymentsRes.value.data?.payments || paymentsRes.value.data || []);
        }
        
        // Get revenue stats
        if (revenueRes.status === 'fulfilled') {
          setRevenueData(revenueRes.value.data?.revenue || revenueRes.value.data || []);
        }
        
        // If no payments from Payment model, use orders as payment records
        if (paymentsRes.status === 'rejected' || !paymentsRes.value.data?.payments?.length) {
          if (ordersRes.status === 'fulfilled') {
            const orders = ordersRes.value.data?.orders || ordersRes.value.data || [];
            const paymentRecords = orders.map((order: any) => ({
              _id: order._id,
              order: { orderId: order.orderId, _id: order._id },
              user: order.user,
              amount: order.total,
              paymentMethod: order.paymentMethod,
              status: order.paymentStatus || 'completed',
              createdAt: order.createdAt,
            }));
            setPayments(paymentRecords);
          }
        }
      } catch {}
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredPayments = payments.filter((p: any) => {
    const matchesFilter = filter === 'all' || p.paymentMethod === filter || p.status === filter;
    const customerName = p.user?.name || p.customer || '';
    const orderId = p.order?.orderId || p.orderId || '';
    const matchesSearch =
      customerName.toLowerCase().includes(search.toLowerCase()) ||
      orderId.toLowerCase().includes(search.toLowerCase()) ||
      (p._id || p.id || '').toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalRevenue = payments.filter((p: any) => p.status === 'completed').reduce((s: number, p: any) => s + (p.amount || 0), 0);
  const onlineTotal = payments.filter((p: any) => (p.paymentMethod === 'razorpay' || p.paymentMethod === 'online') && p.status === 'completed').reduce((s: number, p: any) => s + (p.amount || 0), 0);
  const codTotal = payments.filter((p: any) => (p.paymentMethod === 'cod' || p.method === 'cod') && p.status === 'completed').reduce((s: number, p: any) => s + (p.amount || 0), 0);

  const statusColors: Record<string, string> = {
    completed: 'bg-green-500/10 text-green-400 border-green-500/20',
    pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    failed: 'bg-red-500/10 text-red-400 border-red-500/20',
    refunded: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  };

  const methodBadge: Record<string, string> = {
    razorpay: 'bg-purple-500/10 text-purple-400',
    online: 'bg-purple-500/10 text-purple-400',
    cod: 'bg-orange-500/10 text-orange-400',
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Payments</h1>
        <p className="text-gray-400 text-sm mt-1">Track revenue and payment transactions</p>
      </div>

      {revenueData.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {revenueData.map((item: any, i: number) => (
            <div key={i} className="glass rounded-2xl p-5 border border-white/10">
              <p className="text-sm text-gray-400">{item.label || item.period}</p>
              <p className="text-2xl font-bold text-white mt-1">₹{(item.amount || item.total || 0).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="glass rounded-2xl p-5 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 text-lg">💰</div>
            <div><p className="text-sm text-gray-400">Total Revenue</p><p className="text-xl font-bold text-white">₹{totalRevenue.toLocaleString()}</p></div>
          </div>
        </div>
        <div className="glass rounded-2xl p-5 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 text-lg">💳</div>
            <div><p className="text-sm text-gray-400">Online Payments</p><p className="text-xl font-bold text-white">₹{onlineTotal.toLocaleString()}</p></div>
          </div>
        </div>
        <div className="glass rounded-2xl p-5 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 text-lg">🏷️</div>
            <div><p className="text-sm text-gray-400">Cash on Delivery</p><p className="text-xl font-bold text-white">₹{codTotal.toLocaleString()}</p></div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by customer, order ID..." className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-primary-gold/50 focus:outline-none transition-all" />
        <div className="flex gap-2 flex-wrap">
            {['all', 'completed', 'pending', 'failed', 'refunded', 'razorpay', 'cod'].map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${filter === f ? 'bg-primary-gold/15 text-primary-gold border border-primary-gold/30' : 'bg-white/5 text-gray-400 border border-white/10 hover:text-white'}`}>{f === 'razorpay' ? 'Online' : f}</button>
            ))}
          </div>
      </div>

      <div className="glass rounded-2xl border border-white/10 overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading payments...</div>
        ) : (
          <div className="table-container">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-5 text-sm font-medium text-gray-400">Payment ID</th>
                  <th className="text-left py-4 px-5 text-sm font-medium text-gray-400">Order</th>
                  <th className="text-left py-4 px-5 text-sm font-medium text-gray-400">Customer</th>
                  <th className="text-left py-4 px-5 text-sm font-medium text-gray-400">Amount</th>
                  <th className="text-left py-4 px-5 text-sm font-medium text-gray-400">Method</th>
                  <th className="text-left py-4 px-5 text-sm font-medium text-gray-400">Status</th>
                  <th className="text-left py-4 px-5 text-sm font-medium text-gray-400">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment: any) => (
                  <tr key={payment._id || payment.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-5 text-sm text-gray-300 font-mono">{(payment._id || payment.id)?.slice(-8)}</td>
                    <td className="py-3.5 px-5 text-sm text-primary-gold">{payment.order?.orderId || payment.orderId || 'N/A'}</td>
                    <td className="py-3.5 px-5 text-sm text-white">{payment.user?.name || payment.customer || 'Customer'}</td>
                    <td className="py-3.5 px-5 text-sm text-white font-semibold">₹{(payment.amount || 0).toLocaleString()}</td>
                    <td className="py-3.5 px-5">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium uppercase ${methodBadge[payment.paymentMethod] || 'bg-gray-500/10 text-gray-400'}`}>{payment.paymentMethod?.toUpperCase() || 'N/A'}</span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border capitalize ${statusColors[payment.status] || statusColors.pending}`}>{payment.status || 'pending'}</span>
                    </td>
                    <td className="py-3.5 px-5 text-sm text-gray-400">
                      {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && filteredPayments.length === 0 && <div className="text-center py-12 text-gray-500"><p className="text-4xl mb-3">💳</p><p>No payments found</p></div>}
      </div>
    </div>
  );
}
