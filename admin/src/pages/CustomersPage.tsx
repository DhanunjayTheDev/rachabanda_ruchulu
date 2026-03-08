
import { useState, useEffect } from 'react';
import { customersAPI } from '@/lib/api';
import { useToast } from '@/lib/ToastContext';
import AdminSelect from '@/components/AdminSelect';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import CustomerDetailsModal from '@/components/CustomerDetailsModal';

export default function AdminCustomersPage() {
  const { addToast } = useToast();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [suspending, setSuspending] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [confirmDeleteCustomer, setConfirmDeleteCustomer] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await customersAPI.getAll();
        setCustomers(res.data?.customers || res.data || []);
      } catch {}
      setLoading(false);
    };
    fetchCustomers();
  }, []);

  const handleSuspend = async (customerId: string, customerName: string) => {
    setSuspending(customerId);
    try {
      await customersAPI.block(customerId);
      setCustomers((prev) =>
        prev.map((c) => (c._id === customerId || c.id === customerId ? { ...c, isActive: false } : c))
      );
      addToast(`${customerName} has been suspended`, 'success', 3000);
    } catch {
      addToast('Failed to suspend customer', 'error', 3000);
    } finally {
      setSuspending(null);
    }
  };

  const handleReactivate = async (customerId: string, customerName: string) => {
    setSuspending(customerId);
    try {
      await customersAPI.unblock(customerId);
      setCustomers((prev) =>
        prev.map((c) => (c._id === customerId || c.id === customerId ? { ...c, isActive: true } : c))
      );
      addToast(`${customerName} has been reactivated`, 'success', 3000);
    } catch {
      addToast('Failed to reactivate customer', 'error', 3000);
    } finally {
      setSuspending(null);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!confirmDeleteCustomer) return;
    setDeleting(true);
    try {
      await customersAPI.delete(confirmDeleteCustomer._id || confirmDeleteCustomer.id);
      setCustomers((prev) => prev.filter((c) => (c._id || c.id) !== (confirmDeleteCustomer._id || confirmDeleteCustomer.id)));
      addToast(`${confirmDeleteCustomer.name} has been deleted`, 'success', 3000);
    } catch {
      addToast('Failed to delete customer', 'error', 3000);
    } finally {
      setDeleting(false);
      setConfirmDeleteCustomer(null);
    }
  };

  const filteredCustomers = customers.filter(
    (customer: any) =>
      (filterStatus === 'All' ||
        (filterStatus === 'blocked' ? !customer.isActive : customer.isActive !== false)) &&
      ((customer.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.email || '').toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <main className="min-h-screen bg-dark-bg p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Customer <span className="text-primary-gold">Management</span></h1>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="stat-card">
            <div className="stat-card-icon bg-primary-gold/10 text-primary-gold">👥</div>
            <div className="stat-card-value text-primary-gold">{customers.length}</div>
            <p className="stat-card-label">Total Customers</p>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon bg-green-500/10 text-green-400">✓</div>
            <div className="stat-card-value text-green-400">{customers.filter((c: any) => c.isActive !== false).length}</div>
            <p className="stat-card-label">Active</p>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon bg-primary-gold/10 text-primary-gold">📦</div>
            <div className="stat-card-value text-primary-gold">{customers.reduce((sum: number, c: any) => sum + (c.totalOrders || 0), 0)}</div>
            <p className="stat-card-label">Total Orders</p>
          </div>
        </div>

        <div className="cards-filter space-y-6">
          {/* Filter Card */}
          <div className="card relative z-30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-300">Search</label>
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by name or email..." className="w-full px-4 py-2.5 rounded-lg bg-dark-input border border-primary-gold/30 text-white placeholder-gray-500 focus:outline-none focus:border-primary-gold transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-300">Status</label>
                <AdminSelect
                  value={filterStatus}
                  onChange={setFilterStatus}
                  options={[
                    { value: 'All', label: 'All' },
                    { value: 'active', label: 'Active' },
                    { value: 'blocked', label: 'Blocked' },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Table Card */}
          <div className="card">
            <h2 className="text-lg font-bold text-primary-gold mb-6 flex items-center justify-between">
              <span>Customers List</span>
              <span className="text-xs font-normal text-gray-500">{filteredCustomers.length} customers</span>
            </h2>
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading customers...</div>
          ) : (
            <div className="table-container">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-primary-gold/25 bg-primary-gold/8">
                    <th className="px-6 py-4 text-left font-bold text-primary-gold uppercase text-xs tracking-wide">Customer</th>
                    <th className="px-6 py-4 text-left font-bold text-primary-gold uppercase text-xs tracking-wide">Phone</th>
                    <th className="px-6 py-4 text-left font-bold text-primary-gold uppercase text-xs tracking-wide">Orders</th>
                    <th className="px-6 py-4 text-left font-bold text-primary-gold uppercase text-xs tracking-wide">Joined</th>
                    <th className="px-6 py-4 text-left font-bold text-primary-gold uppercase text-xs tracking-wide">Status</th>
                    <th className="px-6 py-4 text-left font-bold text-primary-gold uppercase text-xs tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer: any) => (
                    <tr key={customer._id || customer.id} className="border-b border-primary-gold/10 hover:bg-primary-gold/8 transition-colors duration-150\">
                      <td className="px-6 py-4 font-semibold text-white">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-gold to-accent-gold flex items-center justify-center text-dark-bg font-bold text-sm flex-shrink-0">{(customer.name || '?').charAt(0).toUpperCase()}</div>
                          <span className="truncate">{customer.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">{customer.phone || '-'}</td>
                      <td className="px-6 py-4 font-semibold text-gray-300">{customer.totalOrders || 0}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">{customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : '-'}</td>
                      <td className="px-6 py-4">
                        <span
                          title={customer.isActive ? 'Active' : 'Blocked'}
                          className={`text-xl cursor-help transition-colors ${
                            customer.isActive ? 'text-green-400 hover:text-green-300' : 'text-red-400 hover:text-red-300'
                          }`}
                        >
                          {customer.isActive ? '✓' : '✕'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setSelectedCustomer(customer)}
                            className="text-primary-gold hover:text-accent-gold transition-colors text-lg"
                            title="View Details"
                            disabled={suspending === (customer._id || customer.id)}
                          >
                            👁️
                          </button>
                          {customer.isActive ? (
                            <button
                              onClick={() => handleSuspend(customer._id || customer.id, customer.name || 'Customer')}
                              className="text-yellow-500 hover:text-yellow-400 transition-colors text-lg disabled:opacity-50"
                              title="Suspend Customer"
                              disabled={suspending === (customer._id || customer.id)}
                            >
                              🔒
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReactivate(customer._id || customer.id, customer.name || 'Customer')}
                              className="text-green-400 hover:text-green-300 transition-colors text-lg disabled:opacity-50"
                              title="Reactivate Customer"
                              disabled={suspending === (customer._id || customer.id)}
                            >
                              🔓
                            </button>
                          )}
                          <button
                            onClick={() => setConfirmDeleteCustomer(customer)}
                            className="text-red-400 hover:text-red-300 transition-colors text-lg"
                            title="Delete Customer"
                            disabled={suspending === (customer._id || customer.id)}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!loading && filteredCustomers.length === 0 && <div className="text-center py-12 text-gray-400">No customers found</div>}
          </div>
        </div>
      </div>

      {/* Modals */}
      <CustomerDetailsModal
        isOpen={!!selectedCustomer}
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
      />
      <ConfirmationDialog
        isOpen={!!confirmDeleteCustomer}
        title="Delete Customer"
        message={`Are you sure you want to permanently delete ${confirmDeleteCustomer?.name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDanger={true}
        onConfirm={handleDeleteCustomer}
        onCancel={() => setConfirmDeleteCustomer(null)}
        isLoading={deleting}
      />
    </main>
  );
}
