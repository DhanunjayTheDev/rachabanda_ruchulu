
import { useState, useEffect, useCallback } from 'react';
import { ordersAPI } from '@/lib/api';
import { useToast } from '@/lib/ToastContext';
import AdminSelect from '@/components/AdminSelect';

// ─── Types ────────────────────────────────────────────────────────────────────
interface OrderItem {
  food?: any;
  name?: string;
  quantity: number;
  price: number;
  totalPrice?: number;
  selectedSize?: string;
  selectedAddOns?: string[];
  specialInstructions?: string;
}
interface DeliveryAddress { addressLine1: string; addressLine2?: string; city: string; state: string; zipCode: string; phoneNumber?: string; label?: string; location?: { coordinates: [number, number] }; }
interface Order { _id: string; orderId?: string; user?: { name?: string; email?: string; phone?: string }; items: OrderItem[]; deliveryType: string; deliveryAddress?: DeliveryAddress; deliveryLocation?: { coordinates: [number, number] }; subtotal?: number; tax?: number; deliveryFee?: number; discount?: number; total?: number; totalAmount?: number; couponCode?: string; paymentMethod?: string; paymentStatus?: string; status: string; statusTimeline?: { status: string; timestamp: string; notes?: string }[]; notes?: string; createdAt: string; }

const STATUS_OPTIONS = [
  { value: 'pending_payment', label: 'Awaiting Payment' },
  { value: 'placed', label: 'Placed' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'ready', label: 'Ready' },
  { value: 'out-for-delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const STATUS_COLORS: Record<string, string> = {
  delivered: 'bg-green-500/20 text-green-400 border border-green-500/30',
  'out-for-delivery': 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  preparing: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  ready: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
  placed: 'bg-red-500/20 text-red-400 border border-red-500/30',
  confirmed: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
  cancelled: 'bg-gray-600/20 text-gray-400 border border-gray-500/30',
  pending_payment: 'bg-white/5 text-gray-500 border border-white/10',
};

function StatusPill({ status }: { status: string }) {
  const prefix = status === 'delivered' ? '✓ ' : status === 'cancelled' ? '✕ ' : status === 'out-for-delivery' ? '🛵 ' : '';
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize whitespace-nowrap ${STATUS_COLORS[status] || STATUS_COLORS.placed}`}>
      {prefix}{status.replace(/-/g, ' ')}
    </span>
  );
}

function getTotal(order: Order) { return Number(order.total || order.totalAmount || 0); }
function getCustomer(order: Order) { return order.user?.name || 'Unknown Customer'; }
function getPhone(order: Order) { return order.user?.phone || order.deliveryAddress?.phoneNumber || ''; }
function getItemName(item: OrderItem): string {
  if (typeof item.food === 'object' && item.food?.name) return item.food.name;
  if (item.name) return item.name;
  return 'Item';
}
function getSizeName(item: OrderItem): string | null {
  if (item.selectedSize && typeof item.food === 'object' && item.food?.sizes) {
    const size = item.food.sizes.find((s: any) => s._id === item.selectedSize || s.id === item.selectedSize || s.name === item.selectedSize);
    return size ? size.label || size.name : item.selectedSize;
  }
  return item.selectedSize || null;
}
function getAddOnNames(item: OrderItem): string[] {
  if (item.selectedAddOns && item.selectedAddOns.length > 0 && typeof item.food === 'object' && item.food?.addOns) {
    return item.selectedAddOns.map((id: string) => {
      const addon = item.food.addOns.find((a: any) => a._id === id || a.id === id || a.name === id);
      return addon ? addon.name : id;
    });
  }
  return [];
}
function getAddress(order: Order): string {
  const a = order.deliveryAddress;
  if (!a) return order.deliveryType === 'takeaway' ? 'Takeaway' : 'No address';
  return [a.addressLine1, a.addressLine2, a.city, a.state, a.zipCode].filter(Boolean).join(', ');
}
function getMapsUrl(order: Order): string | null {
  const coords = order.deliveryAddress?.location?.coordinates || order.deliveryLocation?.coordinates;
  if (coords && coords.length === 2) { const [lng, lat] = coords; return `https://www.google.com/maps?q=${lat},${lng}`; }
  const addr = getAddress(order);
  if (addr && addr !== 'Takeaway' && addr !== 'No address') return `https://www.google.com/maps/search/${encodeURIComponent(addr)}`;
  return null;
}

// ─── Print Invoice ─────────────────────────────────────────────────────────────
function printInvoice(order: Order) {
  const items = order.items.map((item) => {
    const itemName = getItemName(item);
    return `<tr><td style="padding:6px 8px;border-bottom:1px solid #eee">${itemName}${item.selectedSize ? ` (${item.selectedSize})` : ''}</td><td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td><td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right">₹${Number(item.price).toFixed(2)}</td><td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right">₹${Number(item.totalPrice || item.price * item.quantity).toFixed(2)}</td></tr>`;
  }
  ).join('');
  const html = `<!DOCTYPE html><html><head><title>Invoice #${order._id.slice(-6).toUpperCase()}</title><style>body{font-family:Arial,sans-serif;max-width:600px;margin:40px auto;color:#222;}h2{color:#b8860b;}table{width:100%;border-collapse:collapse;}th{background:#f5f5f5;padding:8px;text-align:left;font-size:13px;}td{font-size:13px;}.tr td{font-weight:bold;border-top:2px solid #222;padding-top:8px;}</style></head><body>
  <h2>Rachabanda Ruchulu</h2><p style="color:#888;font-size:13px">Order Invoice</p><hr/>
  <p><strong>Order #</strong>${order._id.slice(-6).toUpperCase()} &nbsp;|&nbsp; <strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
  <p><strong>Customer:</strong> ${getCustomer(order)} &nbsp;|&nbsp; <strong>Phone:</strong> ${getPhone(order)}</p>
  <p><strong>Type:</strong> ${order.deliveryType} &nbsp;|&nbsp; <strong>Payment:</strong> ${order.paymentMethod?.toUpperCase()} (${order.paymentStatus})</p>
  ${order.deliveryType === 'delivery' ? `<p><strong>Address:</strong> ${getAddress(order)}</p>` : ''}
  ${order.couponCode ? `<p><strong>Coupon:</strong> ${order.couponCode}</p>` : ''}
  <br/><table><thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Total</th></tr></thead>
  <tbody>${items}</tbody>
  <tfoot>
    <tr class="tr"><td colspan="3">Subtotal</td><td style="text-align:right">₹${Number(order.subtotal || 0).toFixed(2)}</td></tr>
    <tr><td colspan="3">Tax(5%)</td><td style="text-align:right">₹${Number(order.tax || 0).toFixed(2)}</td></tr>
    ${order.deliveryFee ? `<tr><td colspan="3">Delivery Fee</td><td style="text-align:right">₹${Number(order.deliveryFee).toFixed(2)}</td></tr>` : ''}
    ${order.discount ? `<tr><td colspan="3" style="color:green">Discount</td><td style="text-align:right;color:green">-₹${Number(order.discount).toFixed(2)}</td></tr>` : ''}
    <tr class="tr"><td colspan="3"><strong>TOTAL</strong></td><td style="text-align:right"><strong>₹${getTotal(order).toFixed(2)}</strong></td></tr>
  </tfoot></table>
  <br/><p style="font-size:12px;color:#888">Thank you for ordering from Rachabanda Ruchulu!</p>
  </body></html>`;
  const w = window.open('', '_blank');
  if (w) { w.document.write(html); w.document.close(); w.focus(); w.print(); }
}

// ─── WhatsApp Share ────────────────────────────────────────────────────────────
function openWhatsApp(waNumber: string, order: Order) {
  const phone = waNumber.replace(/\D/g, '');
  const addr = getAddress(order);
  const mapsUrl = getMapsUrl(order);
  const items = order.items.map((i) => `  • ${getItemName(i)} ×${i.quantity} = ₹${Number(i.totalPrice || i.price * i.quantity).toFixed(2)}`).join('\n');
  const msg = `🛵 *Delivery Details*\n\n*Order #${order._id.slice(-6).toUpperCase()}*\n*Customer:* ${getCustomer(order)}\n*Phone:* ${getPhone(order)}\n*Address:* ${addr}\n${mapsUrl ? `*Map:* ${mapsUrl}\n` : ''}\n*Items:*\n${items}\n\n*Total: ₹${getTotal(order).toFixed(2)}*\n*Payment:* ${order.paymentMethod?.toUpperCase()}\n\nPlease deliver ASAP. Thank you! 🙏`;
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
}

// ─── Order Detail Modal ────────────────────────────────────────────────────────
function OrderModal({ order, onClose, onStatusChange }: { order: Order; onClose: () => void; onStatusChange: (id: string, status: string) => void; }) {
  const [waNumber, setWaNumber] = useState('');
  const mapsUrl = getMapsUrl(order);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 overflow-y-auto" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-2xl bg-[#0f0b08] border border-primary-gold/20 rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-primary-gold/20 bg-primary-gold/5 rounded-t-2xl">
          <div>
            <h2 className="text-white font-bold text-lg">Order #{order._id.slice(-6).toUpperCase()}</h2>
            <p className="text-gray-400 text-xs mt-0.5">{new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusPill status={order.status} />
            <button onClick={onClose} className="text-gray-400 hover:text-white text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors">✕</button>
          </div>
        </div>

        <div className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {/* Customer */}
          <section>
            <h3 className="text-primary-gold font-semibold text-xs mb-3 uppercase tracking-widest">👤 Customer</h3>
            <div className="grid grid-cols-2 gap-3">
              {[['Name', getCustomer(order)], ['Email', order.user?.email || '—'], ['Phone', getPhone(order) || '—'], ['Order Type', order.deliveryType]].map(([label, val]) => (
                <div key={label} className="bg-white/5 rounded-xl p-3">
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-white font-medium mt-0.5 capitalize text-sm">{val}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Address */}
          {order.deliveryType === 'delivery' && (
            <section>
              <h3 className="text-primary-gold font-semibold text-xs mb-3 uppercase tracking-widest">📍 Delivery Address</h3>
              <div className="bg-white/5 rounded-xl p-4">
                {order.deliveryAddress ? (
                  <>
                    {order.deliveryAddress.label && <span className="text-xs bg-primary-gold/20 text-primary-gold px-2 py-0.5 rounded-full capitalize">{order.deliveryAddress.label}</span>}
                    <p className="text-white mt-2">{order.deliveryAddress.addressLine1}</p>
                    {order.deliveryAddress.addressLine2 && <p className="text-gray-400 text-sm">{order.deliveryAddress.addressLine2}</p>}
                    <p className="text-gray-400 text-sm">{[order.deliveryAddress.city, order.deliveryAddress.state, order.deliveryAddress.zipCode].filter(Boolean).join(', ')}</p>
                    {order.deliveryAddress.phoneNumber && <p className="text-gray-400 text-sm mt-1">📞 {order.deliveryAddress.phoneNumber}</p>}
                    {mapsUrl && <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors">🗺️ Open in Google Maps ↗</a>}
                  </>
                ) : <p className="text-gray-400 text-sm">No address on file</p>}
              </div>
            </section>
          )}

          {/* Items */}
          <section>
            <h3 className="text-primary-gold font-semibold text-xs mb-3 uppercase tracking-widest">🍽️ Items ({order.items.length})</h3>
            <div className="rounded-xl overflow-hidden border border-white/10">
              <table className="w-full text-sm">
                <thead className="bg-white/5">
                  <tr>
                    {['Item', 'Qty', 'Price', 'Total'].map((h, i) => <th key={h} className={`px-4 py-2.5 text-gray-400 font-medium text-xs ${i === 0 ? 'text-left' : i === 1 ? 'text-center' : 'text-right'}`}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, i) => {
                    const sizeName = getSizeName(item);
                    const addonNames = getAddOnNames(item);
                    return (
                      <tr key={i} className="border-t border-white/5">
                        <td className="px-4 py-3">
                          <p className="text-white font-medium">{getItemName(item)}</p>
                          {sizeName && <p className="text-[10px] text-gray-500 mt-0.5">Size: <span className="text-primary-gold/80">{sizeName}</span></p>}
                          {addonNames.length > 0 && (
                            <p className="text-[10px] text-gray-500">
                              Add-ons: <span className="text-gray-400">{addonNames.join(', ')}</span>
                            </p>
                          )}
                          {item.specialInstructions && <p className="text-[10px] text-yellow-500/80 italic mt-0.5">Note: {item.specialInstructions}</p>}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-300">{item.quantity}</td>
                        <td className="px-4 py-3 text-right text-gray-400 font-mono">₹{Number(item.price).toFixed(2)}</td>
                        <td className="px-4 py-3 text-right text-white font-bold font-mono">₹{Number(item.totalPrice || item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Payment */}
          <section>
            <h3 className="text-primary-gold font-semibold text-xs mb-3 uppercase tracking-widest">💳 Payment</h3>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[['Subtotal', `₹${Number(order.subtotal || 0).toFixed(2)}`], ['Tax (5%)', `₹${Number(order.tax || 0).toFixed(2)}`], ['Delivery', `₹${Number(order.deliveryFee || 0).toFixed(2)}`], ['Discount', order.discount ? `-₹${Number(order.discount).toFixed(2)}` : '—'], ['Method', order.paymentMethod?.toUpperCase() || '—'], ['Pay Status', order.paymentStatus || '—']].map(([label, val]) => (
                <div key={label} className="bg-white/5 rounded-xl p-3">
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-white text-sm font-medium mt-0.5">{val}</p>
                </div>
              ))}
            </div>
            <div className="bg-primary-gold/10 border border-primary-gold/30 rounded-xl p-4 flex justify-between items-center">
              <span className="text-primary-gold font-bold">TOTAL</span>
              <span className="text-primary-gold font-bold text-xl">₹{getTotal(order).toFixed(2)}</span>
            </div>
            {order.couponCode && <p className="text-xs text-green-400 mt-2">🎟️ Coupon: {order.couponCode}</p>}
          </section>

          {/* Timeline */}
          {order.statusTimeline && order.statusTimeline.length > 0 && (
            <section>
              <h3 className="text-primary-gold font-semibold text-xs mb-3 uppercase tracking-widest">📋 Status Timeline</h3>
              <div className="space-y-2">
                {[...order.statusTimeline].reverse().map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <StatusPill status={s.status} />
                    <p className="text-gray-500 text-xs">{new Date(s.timestamp).toLocaleString()}</p>
                    {s.notes && <p className="text-gray-400 text-xs">— {s.notes}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Actions */}
          <section className="space-y-3">
            <h3 className="text-primary-gold font-semibold text-xs mb-3 uppercase tracking-widest">⚙️ Actions</h3>
            {order.status !== 'delivered' && order.status !== 'cancelled' && (
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Update Status</label>
                <AdminSelect
                  value={order.status}
                  onChange={(v) => onStatusChange(order._id, v)}
                  options={STATUS_OPTIONS}
                />
              </div>
            )}
            <button onClick={() => printInvoice(order)} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium transition-colors">
              🖨️ Print Invoice
            </button>
            {order.deliveryType === 'delivery' && (
              <div className="bg-[#0d2216] border border-green-700/40 rounded-xl p-4">
                <h4 className="text-green-400 font-semibold text-sm mb-2">📱 Send to Delivery Agent via WhatsApp</h4>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={waNumber}
                    onChange={(e) => setWaNumber(e.target.value)}
                    placeholder="WhatsApp number (e.g. 919876543210)"
                    className="flex-1 bg-white/5 border border-white/15 text-white placeholder-gray-600 text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-green-500 transition-colors"
                  />
                  <button
                    onClick={() => { if (waNumber.trim()) openWhatsApp(waNumber.trim(), order); }}
                    disabled={!waNumber.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                    Send
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-1.5">Opens WhatsApp with customer name, phone, address, map link and order details pre-filled.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminOrdersPage() {
  const { addToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await ordersAPI.getAll();
      setOrders(res.data?.orders || res.data || []);
    } catch {
      addToast('Failed to load orders', 'error', 3000);
    }
    setLoading(false);
  }, [addToast]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const filteredOrders = orders.filter((o) => filterStatus === 'All' || o.status === filterStatus);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await ordersAPI.updateStatus(id, newStatus);
      setOrders((prev) => prev.map((o) => o._id === id ? { ...o, status: newStatus } : o));
      if (selectedOrder?._id === id) setSelectedOrder((prev) => prev ? { ...prev, status: newStatus } : prev);
      addToast('Status updated!', 'success', 3000);
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      addToast(msg || 'Failed to update status', 'error', 3000);
    }
  };

  const viewOrderDetails = async (orderId: string) => {
    try {
      const res = await ordersAPI.getById(orderId);
      setSelectedOrder(res.data?.order || res.data);
    } catch {
      addToast('Failed to load order details', 'error', 3000);
    }
  };

  return (
    <main className="min-h-screen bg-dark-bg p-8">
      {selectedOrder && (
        <OrderModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleStatusChange}
        />
      )}
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Order <span className="text-primary-gold">Management</span></h1>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          <div className="stat-card">
            <div className="stat-card-icon bg-primary-gold/10 text-primary-gold">📦</div>
            <div className="stat-card-value text-primary-gold">{orders.length}</div>
            <p className="stat-card-label">Total Orders</p>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon bg-yellow-500/10 text-yellow-400">⏳</div>
            <div className="stat-card-value text-yellow-400">{orders.filter((o) => o.status === 'placed' || o.status === 'confirmed').length}</div>
            <p className="stat-card-label">Pending</p>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon bg-blue-500/10 text-blue-400">🚚</div>
            <div className="stat-card-value text-blue-400">{orders.filter((o) => o.status === 'out-for-delivery').length}</div>
            <p className="stat-card-label">In Transit</p>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon bg-green-500/10 text-green-400">✓</div>
            <div className="stat-card-value text-green-400">{orders.filter((o) => o.status === 'delivered').length}</div>
            <p className="stat-card-label">Delivered</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="card mb-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="min-w-[180px]">
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Filter by Status</label>
              <AdminSelect
                value={filterStatus}
                onChange={setFilterStatus}
                options={[{ value: 'All', label: 'All Orders' }, ...STATUS_OPTIONS]}
              />
            </div>
            <button onClick={fetchOrders} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm transition-colors">↻ Refresh</button>
            <span className="text-gray-500 text-sm ml-auto">{filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-x-auto">
          {loading ? (
            <div className="text-center py-16 text-gray-400">Loading orders…</div>
          ) : (
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Order ID</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Customer</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Items</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Total</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Payment</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Date</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                    <td className="px-5 py-4 font-bold text-primary-gold text-sm">#{order._id.slice(-6).toUpperCase()}</td>
                    <td className="px-5 py-4">
                      <p className="text-white text-sm">{getCustomer(order)}</p>
                      <p className="text-gray-500 text-xs capitalize">{order.deliveryType}</p>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-400 max-w-[200px]">
                      <div className="space-y-1">
                        {order.items.map((i, idx) => {
                          const sizeName = getSizeName(i);
                          return (
                            <div key={idx} className="flex flex-col">
                              <span className="truncate text-white/90">{getItemName(i)} ×{i.quantity}</span>
                              {sizeName && <span className="text-[9px] text-gray-500 font-medium capitalize">Size: {sizeName}</span>}
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-primary-gold/50 text-[10px] mt-1.5 font-bold">{order.items.length} ITEM{order.items.length !== 1 ? 'S' : ''}</p>
                    </td>
                    <td className="px-5 py-4 font-bold text-white">₹{getTotal(order).toFixed(2)}</td>
                    <td className="px-5 py-4">
                      <span className="text-xs px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 font-medium">
                        {order.paymentMethod?.toUpperCase() || 'N/A'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {order.status === 'delivered' || order.status === 'cancelled' ? (
                        <StatusPill status={order.status} />
                      ) : (
                        <AdminSelect
                          value={order.status}
                          onChange={(v) => handleStatusChange(order._id, v)}
                          options={STATUS_OPTIONS}
                        />
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => viewOrderDetails(order._id)} className="text-xs px-3 py-1.5 rounded-lg bg-primary-gold/10 hover:bg-primary-gold/20 text-primary-gold border border-primary-gold/20 transition-colors font-medium">
                          View
                        </button>
                        <button onClick={() => printInvoice(order)} className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-colors">
                          🖨️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && filteredOrders.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              <p className="text-4xl mb-3">📭</p>
              <p>No orders found for &ldquo;{filterStatus}&rdquo;</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
