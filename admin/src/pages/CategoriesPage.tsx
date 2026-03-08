
import { useState, useEffect } from 'react';
import { categoriesAPI } from '@/lib/api';
import { useToast } from '@/lib/ToastContext';

export default function AdminCategoriesPage() {
  const { addToast } = useToast();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoriesAPI.getAll();
        setCategories(res.data?.categories || res.data || []);
      } catch (error) {
        addToast('Failed to load categories', 'error', 3000);
      }
      setLoading(false);
    };
    fetchCategories();
  }, [addToast]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      addToast('Please enter category name', 'warning', 3000);
      return;
    }

    setUploading(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append('name', formData.name);
      formDataObj.append('description', formData.description);

      const imageInput = document.getElementById('categoryImage') as HTMLInputElement;
      if (imageInput?.files?.[0]) {
        formDataObj.append('image', imageInput.files[0]);
      }

      if (editingCategory) {
        await categoriesAPI.update(editingCategory._id || editingCategory.id, formDataObj);
        setCategories(categories.map((c) => (c._id === editingCategory._id || c.id === editingCategory.id ? { ...c, ...formData } : c)));
        addToast('Category updated successfully!', 'success', 3000);
      } else {
        const res = await categoriesAPI.create(formDataObj);
        const created = res.data?.category || res.data;
        setCategories([...categories, created]);
        addToast('Category created successfully!', 'success', 3000);
      }

      setShowForm(false);
      setEditingCategory(null);
      setFormData({ name: '', description: '' });
      setImagePreview('');
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to save category', 'error', 3000);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
    });
    setImagePreview(category.image || '');
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await categoriesAPI.delete(id);
      setCategories(categories.filter((c: any) => (c._id || c.id) !== id));
      addToast('Category deleted successfully!', 'success', 3000);
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to delete category', 'error', 3000);
    }
  };

  return (
    <main className="min-h-screen bg-dark-bg p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold">Category <span className="text-primary-gold">Management</span></h1>
            <button
              onClick={() => {
                setEditingCategory(null);
                setFormData({ name: '', description: '' });
                setImagePreview('');
                setShowForm(true);
              }}
              className="btn btn-primary"
            >
              + Add Category
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          <div className="stat-card">
            <div className="stat-card-icon bg-primary-gold/10 text-primary-gold">📁</div>
            <div className="stat-card-value text-primary-gold">{categories.length}</div>
            <p className="stat-card-label">Total Categories</p>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon bg-green-500/10 text-green-400">✓</div>
            <div className="stat-card-value text-green-400">{categories.length}</div>
            <p className="stat-card-label">Active Categories</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading categories...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category: any) => (
              <div key={category._id || category.id} className="card">
                {category.image?.startsWith('http') ? (
                  <img src={category.image} alt={category.name} className="w-full h-40 object-cover rounded-lg mb-4" />
                ) : (
                  <div className="w-full h-40 bg-dark-input rounded-lg mb-4 flex items-center justify-center text-5xl">
                    {category.image || '📁'}
                  </div>
                )}
                <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                {category.description && <p className="text-gray-400 mb-6 text-sm">{category.description}</p>}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleEdit(category)}
                    className="flex-1 px-3 py-2 rounded-lg border border-primary-gold/30 text-primary-gold hover:bg-primary-gold/10 font-semibold"
                  >
                    Edit
                  </button>
                  <button onClick={() => handleDelete(category._id || category.id)} className="flex-1 px-3 py-2 rounded-lg border border-red-600/30 text-red-400 hover:bg-red-600/10 font-semibold">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
              <button type="button" onClick={() => setShowForm(false)} className="modal-close-btn">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              <div className="modal-body space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Category Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Biryani, Curries, Breads"
                  className="w-full px-4 py-2 rounded-lg bg-dark-bg border border-primary-gold/30 text-white placeholder-gray-500 focus:outline-none focus:border-primary-gold"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter category description"
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg bg-dark-bg border border-primary-gold/30 text-white placeholder-gray-500 focus:outline-none focus:border-primary-gold"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Category Image</label>
                <input
                  id="categoryImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-2 rounded-lg bg-dark-bg border border-primary-gold/30 text-white focus:outline-none focus:border-primary-gold cursor-pointer"
                />
                {imagePreview && (
                  <div className="mt-4">
                    <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
                  </div>
                )}
              </div>
              </div>

              <div className="modal-footer">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-primary-gold text-dark-bg font-bold py-2 rounded-lg hover:bg-accent-gold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {uploading ? 'Uploading...' : editingCategory ? 'Update Category' : 'Add Category'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-700 text-white font-bold py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
