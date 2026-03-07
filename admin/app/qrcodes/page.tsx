'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import QRCode from 'qrcode';
import { qrCodesAPI } from '@/lib/api';
import { useToast } from '@/lib/ToastContext';
import AdminSelect from '@/components/AdminSelect';

interface QRRecord {
  _id?: string;
  id?: string;
  name: string;
  qrType: string;
  qrValue: string;
  fgColor: string;
  bgColor: string;
  errorCorrectionLevel: string;
  dotStyle: string;
  logoUrl: string;
  logoSizePercent: number;
  imageUrl: string;
  createdAt?: string;
}

const QR_TYPES = [
  { value: 'website', label: '🌐 Website URL' },
  { value: 'phone', label: '📞 Phone Number' },
  { value: 'menu', label: '🍽️ Menu Card' },
  { value: 'custom', label: '✏️ Custom Text' },
];

const ECL_OPTIONS = [
  { value: 'L', label: 'L — Low (7%)' },
  { value: 'M', label: 'M — Medium (15%)' },
  { value: 'Q', label: 'Q — High (25%)' },
  { value: 'H', label: 'H — Best (30%)' },
];

const DOT_STYLES = [
  { value: 'square', label: '■ Square' },
  { value: 'rounded', label: '◉ Rounded' },
  { value: 'dots', label: '● Dots' },
  { value: 'classy', label: '◆ Classy' },
];

const DEFAULT_FORM = {
  name: '',
  qrType: 'website',
  qrValue: '',
  fgColor: '#D4AF37',
  bgColor: '#0F0B08',
  errorCorrectionLevel: 'M',
  dotStyle: 'square',
  logoSizePercent: 20,
};

export default function QRCodesPage() {
  const { addToast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [qrList, setQrList] = useState<QRRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [editingQR, setEditingQR] = useState<QRRecord | null>(null);

  const [form, setForm] = useState(DEFAULT_FORM);
  const [logoPreview, setLogoPreview] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState('');

  // ─── Fetch QR list ────────────────────────────────────────────────
  const fetchQRs = useCallback(async () => {
    try {
      const res = await qrCodesAPI.getAll();
      setQrList(res.data?.qrCodes || []);
    } catch {
      addToast('Failed to load QR codes', 'error', 3000);
    }
    setLoading(false);
  }, [addToast]);

  useEffect(() => { fetchQRs(); }, [fetchQRs]);

  // ─── Generate live QR preview ──────────────────────────────────────
  const generatePreview = useCallback(async () => {
    if (!form.qrValue.trim()) {
      setQrDataUrl('');
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      await QRCode.toCanvas(canvas, form.qrValue, {
        width: 300,
        margin: 2,
        color: {
          dark: form.fgColor,
          light: form.bgColor,
        },
        errorCorrectionLevel: form.errorCorrectionLevel as 'L' | 'M' | 'Q' | 'H',
      });

      // Overlay logo in center if exists
      if (logoPreview) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const img = new Image();
          img.src = logoPreview;
          img.onload = () => {
            const logoSize = canvas.width * (form.logoSizePercent / 100);
            const logoX = (canvas.width - logoSize) / 2;
            const logoY = (canvas.height - logoSize) / 2;
            // White padding around logo
            ctx.fillStyle = '#ffffff';
            ctx.roundRect(logoX - 4, logoY - 4, logoSize + 8, logoSize + 8, 6);
            ctx.fill();
            ctx.drawImage(img, logoX, logoY, logoSize, logoSize);
            setQrDataUrl(canvas.toDataURL('image/png'));
          };
          return;
        }
      }
      setQrDataUrl(canvas.toDataURL('image/png'));
    } catch {
      // ignore invalid QR value errors during typing
    }
  }, [form, logoPreview]);

  useEffect(() => {
    generatePreview();
  }, [generatePreview]);

  // ─── Logo file handler ─────────────────────────────────────────────
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoPreview('');
    setLogoFile(null);
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  // ─── Open generator for new QR ────────────────────────────────────
  const openNew = () => {
    setEditingQR(null);
    setForm(DEFAULT_FORM);
    setLogoPreview('');
    setLogoFile(null);
    setQrDataUrl('');
    setShowGenerator(true);
  };

  // ─── Open generator for editing ───────────────────────────────────
  const openEdit = (qr: QRRecord) => {
    setEditingQR(qr);
    setForm({
      name: qr.name,
      qrType: qr.qrType,
      qrValue: qr.qrValue,
      fgColor: qr.fgColor,
      bgColor: qr.bgColor,
      errorCorrectionLevel: qr.errorCorrectionLevel,
      dotStyle: qr.dotStyle,
      logoSizePercent: qr.logoSizePercent,
    });
    setLogoPreview(qr.logoUrl || '');
    setLogoFile(null);
    setShowGenerator(true);
  };

  // ─── Save QR (create or update) ───────────────────────────────────
  const handleSave = async () => {
    if (!form.name.trim()) return addToast('Please enter a name for the QR code', 'warning', 3000);
    if (!form.qrValue.trim()) return addToast('Please enter the QR value/URL', 'warning', 3000);
    if (!qrDataUrl) return addToast('QR code preview is empty. Enter a valid value first.', 'warning', 3000);

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: form.name,
        qrType: form.qrType,
        qrValue: form.qrValue,
        fgColor: form.fgColor,
        bgColor: form.bgColor,
        errorCorrectionLevel: form.errorCorrectionLevel,
        dotStyle: form.dotStyle,
        logoSizePercent: form.logoSizePercent,
        imageBase64: qrDataUrl,
      };

      // Include logo as base64 if a new file was picked
      if (logoFile && logoPreview) {
        payload.logoBase64 = logoPreview;
      }

      if (editingQR) {
        const res = await qrCodesAPI.update(editingQR._id || editingQR.id || '', payload);
        setQrList((prev) => prev.map((q) => (q._id === editingQR._id ? res.data.qr : q)));
        addToast('QR code updated successfully!', 'success', 3000);
      } else {
        const res = await qrCodesAPI.create(payload);
        setQrList((prev) => [res.data.qr, ...prev]);
        addToast('QR code saved to Cloudinary!', 'success', 3000);
      }
      setShowGenerator(false);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to save QR code';
      addToast(message, 'error', 4000);
    } finally {
      setSaving(false);
    }
  };

  // ─── Delete QR ────────────────────────────────────────────────────
  const handleDelete = async (qr: QRRecord) => {
    if (!confirm(`Delete QR code "${qr.name}"? This will also remove it from Cloudinary.`)) return;
    try {
      await qrCodesAPI.delete(qr._id || qr.id || '');
      setQrList((prev) => prev.filter((q) => q._id !== qr._id && q.id !== qr.id));
      addToast('QR code deleted from Cloudinary', 'success', 3000);
    } catch {
      addToast('Failed to delete QR code', 'error', 3000);
    }
  };

  // ─── Download helpers ─────────────────────────────────────────────
  const downloadAs = async (qr: QRRecord, format: 'png' | 'jpg' | 'pdf') => {
    if (format === 'pdf') {
      // Simple PDF using a print-friendly popup
      const win = window.open('', '_blank');
      if (!win) return;
      win.document.write(`
        <html><head><title>${qr.name} QR Code</title>
        <style>body{margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;background:#fff;}
        h2{margin-bottom:16px;color:#333;}img{max-width:300px;}p{color:#666;margin-top:12px;font-size:14px;}</style>
        </head><body>
        <h2>${qr.name}</h2>
        <img src="${qr.imageUrl}" alt="QR Code" />
        <p>${qr.qrValue}</p>
        <script>window.onload=()=>{window.print();}<\/script>
        </body></html>`);
      win.document.close();
      return;
    }

    // PNG / JPG download via canvas conversion
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = qr.imageUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      if (format === 'jpg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);
      const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
      const url = canvas.toDataURL(mimeType, 0.95);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${qr.name.replace(/\s+/g, '_')}.${format}`;
      a.click();
    };
    img.onerror = () => addToast('Failed to download image', 'error', 3000);
  };

  // ─── Render ───────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-dark-bg p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">QR Code <span className="text-primary-gold">Generator</span></h1>
            <p className="text-gray-400 mt-1 text-sm">Create, customize, and manage QR codes. Saved to Cloudinary.</p>
          </div>
          <button onClick={openNew} className="btn btn-primary px-6 py-2.5 text-sm font-bold rounded-xl">
            + Create QR Code
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="stat-card">
            <div className="stat-card-icon bg-primary-gold/10 text-primary-gold">📱</div>
            <div className="stat-card-value text-primary-gold">{qrList.length}</div>
            <p className="stat-card-label">Total QR Codes</p>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon bg-blue-500/10 text-blue-400">🌐</div>
            <div className="stat-card-value text-blue-400">{qrList.filter((q) => q.qrType === 'website').length}</div>
            <p className="stat-card-label">Website QRs</p>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon bg-green-500/10 text-green-400">🍽️</div>
            <div className="stat-card-value text-green-400">{qrList.filter((q) => q.qrType === 'menu').length}</div>
            <p className="stat-card-label">Menu QRs</p>
          </div>
        </div>

        {/* QR List */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-primary-gold">Saved QR Codes</h2>
            <span className="text-xs text-gray-500">{qrList.length} total</span>
          </div>
          {loading ? (
            <div className="text-center py-16 text-gray-400">Loading QR codes...</div>
          ) : qrList.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <div className="text-5xl mb-4">📱</div>
              <p>No QR codes yet. Create your first one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {qrList.map((qr) => (
                <div
                  key={qr._id || qr.id}
                  className="rounded-2xl border border-primary-gold/15 overflow-hidden transition-all hover:border-primary-gold/35 hover:shadow-lg"
                  style={{ background: 'rgba(212,175,55,0.03)' }}
                >
                  {/* QR Image */}
                  <div className="flex items-center justify-center p-6 bg-white rounded-t-2xl">
                    <img
                      src={qr.imageUrl}
                      alt={qr.name}
                      className="w-44 h-44 object-contain"
                    />
                  </div>
                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-white truncate">{qr.name}</h3>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-gold/15 text-primary-gold capitalize">
                      {qr.qrType}
                    </span>
                    <p className="text-xs text-gray-500 mt-1.5 truncate">{qr.qrValue}</p>
                    {qr.createdAt && (
                      <p className="text-xs text-gray-600 mt-1">
                        {new Date(qr.createdAt).toLocaleDateString()}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => openEdit(qr)}
                        className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-primary-gold/15 text-primary-gold hover:bg-primary-gold/25 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(qr)}
                        className="py-1.5 px-3 rounded-lg text-xs font-semibold bg-red-600/15 text-red-400 hover:bg-red-600/25 transition-colors"
                      >
                        Delete
                      </button>
                    </div>

                    {/* Download */}
                    <div className="flex gap-1.5 mt-2">
                      {(['png', 'jpg', 'pdf'] as const).map((fmt) => (
                        <button
                          key={fmt}
                          onClick={() => downloadAs(qr, fmt)}
                          className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition-colors uppercase tracking-wide"
                        >
                          {fmt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Generator Modal ───────────────────────────────────────── */}
      {showGenerator && (
        <div className="modal-overlay">
          <div
            className="w-full flex flex-col rounded-2xl overflow-hidden"
            style={{
              maxWidth: 900,
              maxHeight: '93vh',
              background: 'linear-gradient(160deg, #1e1812 0%, #0f0b08 100%)',
              border: '1px solid rgba(212,175,55,0.15)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
            }}
          >
            {/* Modal Header */}
            <div className="modal-header">
              <h2>{editingQR ? 'Edit QR Code' : 'Create QR Code'}</h2>
              <button type="button" onClick={() => setShowGenerator(false)} className="modal-close-btn">✕</button>
            </div>

            {/* Modal Body — two-column */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* LEFT — Settings */}
                <div className="space-y-5">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">QR Code Name *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g., Menu QR, Restaurant QR"
                      className="w-full px-4 py-2 rounded-lg bg-dark-bg border border-primary-gold/30 text-white placeholder-gray-500 focus:outline-none focus:border-primary-gold"
                    />
                  </div>

                  {/* QR Type */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">QR Type</label>
                    <AdminSelect
                      value={form.qrType}
                      onChange={(v) => setForm({ ...form, qrType: v })}
                      options={QR_TYPES}
                    />
                  </div>

                  {/* QR Value */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      {form.qrType === 'phone' ? 'Phone Number *' :
                       form.qrType === 'website' ? 'Website URL *' :
                       form.qrType === 'menu' ? 'Menu URL *' : 'Custom Text *'}
                    </label>
                    <input
                      type="text"
                      value={form.qrValue}
                      onChange={(e) => setForm({ ...form, qrValue: e.target.value })}
                      placeholder={
                        form.qrType === 'phone' ? 'tel:+917890123456' :
                        form.qrType === 'website' ? 'https://rachabanda.com' :
                        form.qrType === 'menu' ? 'https://rachabanda.com/menu' :
                        'Enter any text or URL'
                      }
                      className="w-full px-4 py-2 rounded-lg bg-dark-bg border border-primary-gold/30 text-white placeholder-gray-500 focus:outline-none focus:border-primary-gold"
                    />
                  </div>

                  {/* Colors */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">QR Color (Foreground)</label>
                      <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-dark-bg border border-primary-gold/30">
                        <input
                          type="color"
                          value={form.fgColor}
                          onChange={(e) => setForm({ ...form, fgColor: e.target.value })}
                          className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
                        />
                        <span className="text-sm text-gray-300 font-mono">{form.fgColor}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Background Color</label>
                      <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-dark-bg border border-primary-gold/30">
                        <input
                          type="color"
                          value={form.bgColor}
                          onChange={(e) => setForm({ ...form, bgColor: e.target.value })}
                          className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
                        />
                        <span className="text-sm text-gray-300 font-mono">{form.bgColor}</span>
                      </div>
                    </div>
                  </div>

                  {/* Error Correction Level */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">Error Correction Level</label>
                    <AdminSelect
                      value={form.errorCorrectionLevel}
                      onChange={(v) => setForm({ ...form, errorCorrectionLevel: v })}
                      options={ECL_OPTIONS}
                    />
                    <p className="text-xs text-gray-500 mt-1">Higher = more robust, larger QR. Use H if adding a logo.</p>
                  </div>

                  {/* Logo Upload */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">Center Logo (optional)</label>
                    {logoPreview ? (
                      <div className="flex items-center gap-4">
                        <img src={logoPreview} alt="Logo" className="w-14 h-14 object-contain rounded-lg border border-primary-gold/30 bg-white p-1" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-400">Logo size: {form.logoSizePercent}%</span>
                            <button onClick={removeLogo} className="text-xs text-red-400 hover:text-red-300">Remove</button>
                          </div>
                          <input
                            type="range"
                            min={10}
                            max={35}
                            value={form.logoSizePercent}
                            onChange={(e) => setForm({ ...form, logoSizePercent: Number(e.target.value) })}
                            className="w-full accent-primary-gold"
                          />
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center gap-2 px-4 py-5 rounded-lg border border-dashed border-primary-gold/30 cursor-pointer hover:border-primary-gold/60 hover:bg-primary-gold/5 transition-all">
                        <span className="text-2xl">🖼️</span>
                        <span className="text-sm text-gray-400">Click to upload logo</span>
                        <span className="text-xs text-gray-600">PNG/JPG, recommended square</span>
                        <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>

                {/* RIGHT — Live Preview */}
                <div className="flex flex-col items-center gap-4">
                  <h3 className="text-sm font-semibold text-gray-400 self-start">Live Preview</h3>
                  <div
                    className="rounded-2xl p-4 flex items-center justify-center"
                    style={{ background: form.bgColor, minWidth: 280, minHeight: 280 }}
                  >
                    <canvas ref={canvasRef} style={{ display: form.qrValue ? 'block' : 'none' }} />
                    {!form.qrValue && (
                      <div className="flex flex-col items-center gap-2 text-gray-500">
                        <span className="text-6xl opacity-30">📱</span>
                        <span className="text-sm">Enter a value to preview</span>
                      </div>
                    )}
                  </div>
                  {form.qrValue && (
                    <p className="text-xs text-gray-500 text-center max-w-xs break-all">{form.qrValue}</p>
                  )}

                  {/* Quick preset buttons */}
                  <div className="w-full">
                    <p className="text-xs text-gray-500 mb-2">Quick Color Presets</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { fg: '#D4AF37', bg: '#0F0B08', label: 'Gold on Dark' },
                        { fg: '#000000', bg: '#FFFFFF', label: 'Classic' },
                        { fg: '#FFFFFF', bg: '#1A1A2E', label: 'White on Navy' },
                        { fg: '#E63946', bg: '#F1FAEE', label: 'Red on Ivory' },
                        { fg: '#2D6A4F', bg: '#D8F3DC', label: 'Forest' },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setForm({ ...form, fgColor: preset.fg, bgColor: preset.bg })}
                          title={preset.label}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-white/10 hover:border-primary-gold/30 transition-all"
                          style={{ background: preset.bg, color: preset.fg }}
                        >
                          <span
                            className="w-3 h-3 rounded-sm flex-shrink-0"
                            style={{ background: preset.fg, border: `1px solid ${preset.fg}` }}
                          />
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-primary-gold text-dark-bg font-bold py-2.5 rounded-xl hover:bg-accent-gold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Saving to Cloudinary...' : editingQR ? 'Update QR Code' : 'Save QR Code'}
              </button>
              <button
                onClick={() => setShowGenerator(false)}
                className="flex-1 bg-gray-700 text-white font-bold py-2.5 rounded-xl hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
