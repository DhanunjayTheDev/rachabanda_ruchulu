
import { useState, useEffect } from 'react';
import { foodsAPI, categoriesAPI } from '@/lib/api';
import { useToast } from '@/lib/ToastContext';
import AdminSelect from '@/components/AdminSelect';

export default function AdminFoodsPage() {
  const { addToast } = useToast();
  const [foods, setFoods] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [editingFood, setEditingFood] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    foodType: 'veg',
    isFeatured: false,
    ingredients: '',
    addOns: [] as Array<{ name: string; price: string }>,
    sizes: [] as Array<{ name: string; label: string; price: string; servings: string }>,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [foodsRes, catsRes] = await Promise.allSettled([foodsAPI.getAll(), categoriesAPI.getAll()]);
        if (foodsRes.status === 'fulfilled') setFoods(foodsRes.value.data?.foods || foodsRes.value.data || []);
        if (catsRes.status === 'fulfilled') setCategories(catsRes.value.data?.categories || catsRes.value.data || []);
        if (foodsRes.status === 'rejected' || catsRes.status === 'rejected') {
          addToast('Failed to load foods or categories', 'error', 3000);
        }
      } catch (error) {
        addToast('An error occurred while loading data', 'error', 3000);
      }
      setLoading(false);
    };
    fetchData();
  }, [addToast]);

  const getCatName = (cat: any) => (typeof cat === 'object' ? cat?.name : cat) || '';
  const getCatIcon = (cat: any) => (typeof cat === 'object' ? cat?.icon : null) || '🍽️';

  const getFoodTypeDisplay = (food: any) => {
    const typeMap: Record<string, any> = {
      'veg': { emoji: '🥬', label: 'Vegetarian', color: 'bg-green-500/20 text-green-400' },
      'vegan': { emoji: '🌱', label: 'Vegan', color: 'bg-green-600/20 text-green-300' },
      'jain': { emoji: '☸️', label: 'Jain (Pure Veg)', color: 'bg-green-500/20 text-green-400' },
      'non-veg': { emoji: '🍗', label: 'Non-Vegetarian', color: 'bg-red-500/20 text-red-400' },
      'egg-free': { emoji: '🚫', label: 'Egg-Free', color: 'bg-blue-500/20 text-blue-400' },
      'gluten-free': { emoji: '🌾', label: 'Gluten-Free', color: 'bg-yellow-500/20 text-yellow-400' },
      'sugar-free': { emoji: '🍯', label: 'Sugar-Free', color: 'bg-orange-500/20 text-orange-400' },
    };
    
    const foodType = food.foodType || (food.isVegetarian ? 'veg' : 'non-veg');
    return typeMap[foodType] || { emoji: '🍽️', label: 'Food', color: 'bg-gray-500/20 text-gray-400' };
  };

  const filteredFoods = foods.filter(
    (food: any) =>
      (filterCategory === 'All' || getCatName(food.category) === filterCategory) &&
      food.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this food?')) return;
    try {
      await foodsAPI.delete(id);
      setFoods(foods.filter((f: any) => (f._id || f.id) !== id));
      addToast('Food deleted successfully!', 'success', 3000);
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to delete food', 'error', 3000);
    }
  };

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
    
    if (!formData.name || !formData.price || !formData.category) {
      addToast('Please fill in all required fields', 'warning', 3000);
      return;
    }

    setUploading(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append('name', formData.name);
      formDataObj.append('description', formData.description);
      formDataObj.append('price', formData.price);
      formDataObj.append('category', formData.category);
      formDataObj.append('foodType', formData.foodType);
      formDataObj.append('isFeatured', String(formData.isFeatured));
      formDataObj.append('ingredients', formData.ingredients);
      
      // Add add-ons as JSON
      const addOnsToSend = formData.addOns
        .filter((addon) => addon.name && addon.price)
        .map((addon) => ({ name: addon.name, price: parseFloat(addon.price) }));
      formDataObj.append('addOns', JSON.stringify(addOnsToSend));

      // Add sizes as JSON
      const sizesToSend = formData.sizes
        .filter((size) => size.name && size.price)
        .map((size) => ({ 
          name: size.name, 
          label: size.label || size.name, 
          price: parseFloat(size.price),
          servings: size.servings ? parseInt(size.servings) : undefined
        }));
      formDataObj.append('sizes', JSON.stringify(sizesToSend));

      const imageInput = document.getElementById('foodImage') as HTMLInputElement;
      if (imageInput?.files?.[0]) {
        formDataObj.append('image', imageInput.files[0]);
      }

      if (editingFood) {
        const res = await foodsAPI.update(editingFood._id || editingFood.id, formDataObj);
        setFoods(foods.map((f) => (f._id === editingFood._id || f.id === editingFood.id ? res.data.food : f)));
        addToast('Food updated successfully!', 'success', 3000);
      } else {
        const res = await foodsAPI.create(formDataObj);
        setFoods([...foods, res.data.food]);
        addToast('Food created successfully!', 'success', 3000);
      }

      setShowForm(false);
      setEditingFood(null);
      setFormData({ name: '', description: '', price: '', category: '', foodType: 'veg', isFeatured: false, ingredients: '', addOns: [], sizes: [] });
      setImagePreview('');
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to save food', 'error', 3000);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (food: any) => {
    setEditingFood(food);
    
    // Handle ingredients - could be array or string
    let ingredientsStr = '';
    if (Array.isArray(food.ingredients)) {
      ingredientsStr = food.ingredients.join(', ');
    } else if (typeof food.ingredients === 'string') {
      ingredientsStr = food.ingredients;
    }
    
    setFormData({
      name: food.name,
      description: food.description,
      price: food.price,
      category: food.category?._id || food.category,
      foodType: food.foodType || (food.isVegetarian ? 'veg' : 'non-veg'),
      isFeatured: food.isFeatured,
      ingredients: ingredientsStr,
      addOns: (food.addOns || []).map((addon: any) => ({ name: addon.name, price: addon.price.toString() })),
      sizes: (food.sizes || []).map((size: any) => ({ 
        name: size.name, 
        label: size.label || size.name, 
        price: size.price.toString(),
        servings: size.servings?.toString() || ''
      })),
    });
    setImagePreview(food.image || '');
    setShowForm(true);
  };

  return (
    <main className="min-h-screen bg-dark-bg p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold">Food <span className="text-primary-gold">Management</span></h1>
            <button
              onClick={() => {
                setEditingFood(null);
                setFormData({ name: '', description: '', price: '', category: '', foodType: 'veg', isFeatured: false, ingredients: '', addOns: [], sizes: [] });
                setImagePreview('');
                setShowForm(true);
              }}
              className="btn btn-primary"
            >
              + Add New Food
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6 mb-8">
          <div className="stat-card">
            <div className="stat-card-icon bg-primary-gold/10 text-primary-gold">🍽️</div>
            <div className="stat-card-value text-primary-gold">{foods.length}</div>
            <p className="stat-card-label">Total Foods</p>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon bg-green-500/10 text-green-400">✓</div>
            <div className="stat-card-value text-green-400">{foods.filter((f: any) => f.isAvailable !== false).length}</div>
            <p className="stat-card-label">Available</p>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon bg-red-500/10 text-red-400">✕</div>
            <div className="stat-card-value text-red-400">{foods.filter((f: any) => f.isAvailable === false).length}</div>
            <p className="stat-card-label">Out of Stock</p>
          </div>
        </div>

        <div className="card mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Search</label>
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search foods..." className="w-full px-4 py-2 rounded-lg bg-dark-input border border-primary-gold/30 text-white placeholder-gray-500 focus:outline-none focus:border-primary-gold" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Category</label>
              <AdminSelect
                value={filterCategory}
                onChange={setFilterCategory}
                options={[{ value: 'All', label: 'All' }, ...categories.map((c: any) => ({ value: c.name, label: c.name }))]}
              />
            </div>
          </div>

          {/* Quick Category Filter Bar */}
          <div className="border-t border-gray-600 pt-4">
            <p className="text-xs font-semibold text-gray-400 mb-3">QUICK FILTERS</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterCategory('All')}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  filterCategory === 'All'
                    ? 'bg-primary-gold/30 text-primary-gold border border-primary-gold'
                    : 'bg-gray-700/50 text-gray-300 border border-gray-600 hover:bg-gray-600/50'
                }`}
              >
                All
              </button>
              {categories
                .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                .map((cat: any) => (
                  <button
                    key={cat._id || cat.id}
                    onClick={() => setFilterCategory(cat.name)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
                      filterCategory === cat.name
                        ? 'bg-primary-gold/30 text-primary-gold border border-primary-gold'
                        : 'bg-gray-700/50 text-gray-300 border border-gray-600 hover:bg-gray-600/50'
                    }`}
                  >
                    <span>{cat.icon || '🍽️'}</span>
                    {cat.name}
                  </button>
                ))}
            </div>
          </div>
        </div>

        <div className="card">
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading foods...</div>
          ) : (
            <div className="table-container">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="px-6 py-4 text-left font-semibold">Food</th>
                    <th className="px-6 py-4 text-left font-semibold">Category</th>
                    <th className="px-6 py-4 text-left font-semibold">Price</th>
                    <th className="px-6 py-4 text-left font-semibold">Type</th>
                    <th className="px-6 py-4 text-left font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFoods.map((food: any) => (
                    <tr key={food._id || food.id} className="border-b border-gray-600 hover:bg-dark-input/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {food.image?.startsWith('http') ? (
                            <img src={food.image} alt={food.name} className="w-10 h-10 rounded object-cover" />
                          ) : (
                            <span className="text-2xl">{food.image || '🍽️'}</span>
                          )}
                          <span className="font-semibold">{food.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{getCatIcon(food.category)}</span>
                          <span className="font-medium">{getCatName(food.category)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4"><span className="text-primary-gold font-bold">₹{food.price}</span></td>
                      <td className="px-6 py-4">
                        {(() => {
                          const typeInfo = getFoodTypeDisplay(food);
                          return (
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${typeInfo.color}`}>
                              {typeInfo.emoji} {typeInfo.label}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(food)}
                            className="px-3 py-1 rounded text-sm bg-primary-gold/20 text-primary-gold hover:bg-primary-gold/30 font-semibold"
                          >
                            Edit
                          </button>
                          <button onClick={() => handleDelete(food._id || food.id)} className="px-3 py-1 rounded text-sm bg-red-600/20 text-red-400 hover:bg-red-600/30 font-semibold">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!loading && filteredFoods.length === 0 && <div className="text-center py-12 text-gray-400">No foods found</div>}
        </div>
      </div>

      {/* Food Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingFood ? 'Edit Food' : 'Add New Food'}</h2>
              <button type="button" onClick={() => setShowForm(false)} className="modal-close-btn">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              <div className="modal-body space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Food Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter food name"
                    className="w-full px-4 py-2 rounded-lg bg-dark-bg border border-primary-gold/30 text-white placeholder-gray-500 focus:outline-none focus:border-primary-gold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="Enter price"
                    className="w-full px-4 py-2 rounded-lg bg-dark-bg border border-primary-gold/30 text-white placeholder-gray-500 focus:outline-none focus:border-primary-gold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Category *</label>
                  <AdminSelect
                    value={formData.category}
                    onChange={(v) => setFormData({ ...formData, category: v })}
                    placeholder="Select Category"
                    options={categories
                      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                      .map((c: any) => ({ 
                        value: c._id || c.id, 
                        label: `${c.icon || '🍽️'} ${c.name}` 
                      }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Type</label>
                  <AdminSelect
                    value={formData.foodType}
                    onChange={(v) => setFormData({ ...formData, foodType: v })}
                    options={[
                      { value: 'veg', label: '🥬 Vegetarian' },
                      { value: 'vegan', label: '🌱 Vegan' },
                      { value: 'jain', label: '☸️ Jain (Pure Veg)' },
                      { value: 'non-veg', label: '🍗 Non-Vegetarian' },
                      { value: 'egg-free', label: '🚫 Egg-Free' },
                      { value: 'gluten-free', label: '🌾 Gluten-Free' },
                      { value: 'sugar-free', label: '🍯 Sugar-Free' },
                    ]}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter description"
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg bg-dark-bg border border-primary-gold/30 text-white placeholder-gray-500 focus:outline-none focus:border-primary-gold"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Ingredients (comma separated)</label>
                <input
                  type="text"
                  value={formData.ingredients}
                  onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                  placeholder="e.g., Flour, Egg, Sugar"
                  className="w-full px-4 py-2 rounded-lg bg-dark-bg border border-primary-gold/30 text-white placeholder-gray-500 focus:outline-none focus:border-primary-gold"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Food Image</label>
                <input
                  id="foodImage"
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

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-semibold">Add-ons (Optional)</label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, addOns: [...formData.addOns, { name: '', price: '' }] })}
                    className="text-xs bg-primary-gold/20 text-primary-gold px-2 py-1 rounded hover:bg-primary-gold/30 font-semibold"
                  >
                    + Add
                  </button>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {formData.addOns.map((addon, idx) => (
                    <div key={idx} className="flex gap-2 items-end">
                      <input
                        type="text"
                        placeholder="Addon name"
                        value={addon.name}
                        onChange={(e) => {
                          const newAddOns = [...formData.addOns];
                          newAddOns[idx].name = e.target.value;
                          setFormData({ ...formData, addOns: newAddOns });
                        }}
                        className="flex-1 px-3 py-1 rounded bg-dark-bg border border-primary-gold/30 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary-gold"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Price"
                        value={addon.price}
                        onChange={(e) => {
                          const newAddOns = [...formData.addOns];
                          newAddOns[idx].price = e.target.value;
                          setFormData({ ...formData, addOns: newAddOns });
                        }}
                        className="w-24 px-3 py-1 rounded bg-dark-bg border border-primary-gold/30 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary-gold"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, addOns: formData.addOns.filter((_, i) => i !== idx) })}
                        className="px-2 py-1 text-red-400 hover:bg-red-500/20 rounded text-sm font-semibold"
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
                {formData.addOns.length === 0 && <p className="text-gray-500 text-xs mt-1">No add-ons added</p>}
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-semibold">Sizes (Optional)</label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, sizes: [...formData.sizes, { name: '', label: '', price: '', servings: '' }] })}
                    className="text-xs bg-primary-gold/20 text-primary-gold px-2 py-1 rounded hover:bg-primary-gold/30 font-semibold"
                  >
                    + Add
                  </button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {formData.sizes.map((size, idx) => (
                    <div key={idx} className="flex gap-2 items-end">
                      <input
                        type="text"
                        placeholder="Size name (Small, Medium, Large)"
                        value={size.name}
                        onChange={(e) => {
                          const newSizes = [...formData.sizes];
                          newSizes[idx].name = e.target.value;
                          setFormData({ ...formData, sizes: newSizes });
                        }}
                        className="flex-1 px-3 py-1 rounded bg-dark-bg border border-primary-gold/30 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary-gold"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Price"
                        value={size.price}
                        onChange={(e) => {
                          const newSizes = [...formData.sizes];
                          newSizes[idx].price = e.target.value;
                          setFormData({ ...formData, sizes: newSizes });
                        }}
                        className="w-24 px-3 py-1 rounded bg-dark-bg border border-primary-gold/30 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary-gold"
                      />
                      <input
                        type="number"
                        placeholder="Servings"
                        value={size.servings}
                        onChange={(e) => {
                          const newSizes = [...formData.sizes];
                          newSizes[idx].servings = e.target.value;
                          setFormData({ ...formData, sizes: newSizes });
                        }}
                        className="w-24 px-3 py-1 rounded bg-dark-bg border border-primary-gold/30 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary-gold"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, sizes: formData.sizes.filter((_, i) => i !== idx) })}
                        className="px-2 py-1 text-red-400 hover:bg-red-500/20 rounded text-sm font-semibold"
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
                {formData.sizes.length === 0 && <p className="text-gray-500 text-xs mt-1">No sizes added</p>}
              </div>

              <div className="flex gap-2 items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-semibold">Mark as Featured</span>
                </label>
              </div>
              </div>

              <div className="modal-footer">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-primary-gold text-dark-bg font-bold py-2 rounded-lg hover:bg-accent-gold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {uploading ? 'Uploading...' : editingFood ? 'Update Food' : 'Add Food'}
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
