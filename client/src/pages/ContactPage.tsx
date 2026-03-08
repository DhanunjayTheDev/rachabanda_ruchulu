import { useState, useEffect } from 'react';
import { contactAPI, settingsAPI } from '@/lib/api';
import { useToast } from '@/lib/ToastContext';

const formatTime = (t: string) => {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
};

export default function ContactPage() {
  const { addToast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    settingsAPI.get()
      .then((res) => setSettings(res.data?.settings))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await contactAPI.submit(form);
      setSubmitted(true);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
      addToast('Message sent successfully! We will get back to you soon.', 'success', 3000);
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to send message. Please try again.';
      setError(errorMsg);
      addToast(errorMsg, 'error', 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen pt-28 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4">
            Get in <span className="text-primary-gold">Touch</span>
          </h1>
          <p className="text-gray-400 text-lg">We&apos;d love to hear from you</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-2xl font-bold mb-6 text-primary-gold">Contact Information</h2>
              <div className="space-y-5">
                {[
                  { icon: '📍', label: 'Address', value: settings?.address || '' },
                  { icon: '📞', label: 'Phone', value: settings?.phone || '' },
                  { icon: '✉️', label: 'Email', value: settings?.email || '' },
                  {
                    icon: '⏰',
                    label: 'Hours',
                    value: settings
                      ? `Mon - Sun: ${formatTime(settings.openTime || '10:00')} – ${formatTime(settings.closeTime || '23:00')}`
                      : '',
                  },
                ].filter((item) => item.value).map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <p className="font-semibold text-white">{item.label}</p>
                      <p className="text-gray-400">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="text-xl font-bold mb-4 text-primary-gold">Follow Us</h3>
              <div className="flex gap-4">
                {['Instagram', 'Facebook', 'Twitter', 'YouTube'].map((social) => (
                  <span
                    key={social}
                    className="px-4 py-2 rounded-lg bg-primary-gold/10 text-primary-gold text-sm font-medium border border-primary-gold/20"
                  >
                    {social}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <div className="card">
              <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>

              {submitted && (
                <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400">
                  Thank you! Your message has been sent. We&apos;ll get back to you soon.
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Name *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                      placeholder="Your name"
                      className="w-full px-4 py-3 rounded-lg bg-dark-input border border-primary-gold/30 text-white placeholder-gray-500 focus:outline-none focus:border-primary-gold transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Phone</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 rounded-lg bg-dark-input border border-primary-gold/30 text-white placeholder-gray-500 focus:outline-none focus:border-primary-gold transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-lg bg-dark-input border border-primary-gold/30 text-white placeholder-gray-500 focus:outline-none focus:border-primary-gold transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Subject *</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    required
                    placeholder="What's this about?"
                    className="w-full px-4 py-3 rounded-lg bg-dark-input border border-primary-gold/30 text-white placeholder-gray-500 focus:outline-none focus:border-primary-gold transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Message *</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                    rows={4}
                    placeholder="Your message..."
                    className="w-full px-4 py-3 rounded-lg bg-dark-input border border-primary-gold/30 text-white placeholder-gray-500 focus:outline-none focus:border-primary-gold transition-all resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
