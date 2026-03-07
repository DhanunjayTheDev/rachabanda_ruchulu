'use client';

interface CustomerDetailsModalProps {
  isOpen: boolean;
  customer: any;
  onClose: () => void;
}

export default function CustomerDetailsModal({ isOpen, customer, onClose }: CustomerDetailsModalProps) {
  if (!isOpen || !customer) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content w-full max-w-2xl">
        <div className="modal-header flex items-center justify-between">
          <h2>Customer Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl transition"
          >
            ✕
          </button>
        </div>
        <div className="modal-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-gold to-accent-gold flex items-center justify-center text-dark-bg font-bold text-xl mb-4">
                  {(customer.name || '?').charAt(0).toUpperCase()}
                </div>
                <h3 className="text-2xl font-bold text-white">{customer.name || 'Unknown'}</h3>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Email</label>
                <p className="text-white break-all">{customer.email || '-'}</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Phone</label>
                <p className="text-white">{customer.phone || '-'}</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Status</label>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold ${
                      customer.isActive
                        ? 'bg-green-500/20 text-green-300 border border-green-400/30'
                        : 'bg-red-500/20 text-red-300 border border-red-400/30'
                    }`}
                  >
                    {customer.isActive ? '✓ Active' : '✕ Blocked'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Member Since</label>
                <p className="text-white">
                  {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : '-'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Account Created</label>
                <p className="text-gray-400 text-sm">
                  {customer.createdAt ? new Date(customer.createdAt).toLocaleString() : '-'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Last Updated</label>
                <p className="text-gray-400 text-sm">
                  {customer.updatedAt ? new Date(customer.updatedAt).toLocaleString() : '-'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Total Orders</label>
                <p className="text-2xl font-bold text-primary-gold">{customer.totalOrders || 0}</p>
              </div>
            </div>
          </div>

          {/* Address Section */}
          {customer.address && (
            <div className="mt-8 pt-8 border-t border-primary-gold/25">
              <h4 className="text-sm font-bold uppercase text-gray-400 mb-4">Address</h4>
              <p className="text-gray-300">
                {customer.address.street && <>{customer.address.street}<br /></>}
                {customer.address.city && customer.address.state && (
                  <>{customer.address.city}, {customer.address.state} {customer.address.zip}<br /></>
                )}
                {customer.address.country && <>{customer.address.country}</>}
              </p>
            </div>
          )}
        </div>
        <div className="modal-footer justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg bg-gray-600/30 text-gray-300 border border-gray-500/30 hover:bg-gray-600/50 hover:border-gray-500/50 font-semibold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
