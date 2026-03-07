'use client';

import { useState, useEffect } from 'react';
import { foodAPI, categoryAPI } from '@/lib/api';
import FoodCard from '@/components/home/FoodCard';

interface Food {
  _id: string;
  name: string;
  price: number;
  image: string;
  rating: number;
  isVegetarian: boolean;
  category: { _id: string; name: string } | string;
}

interface Category {
  _id: string;
  name: string;
}

export default function MenuPage() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [vegetarian, setVegetarian] = useState(false);
  const [priceRange, setPriceRange] = useState(1000);
  const [sortBy, setSortBy] = useState('popular');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [foodsRes, catsRes] = await Promise.all([
          foodAPI.getAll(),
          categoryAPI.getAll(),
        ]);
        setFoods(foodsRes.data.foods || foodsRes.data || []);
        setCategories(catsRes.data.categories || catsRes.data || []);
      } catch {
        // API might be down, show empty state
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getCategoryName = (cat: { _id: string; name: string } | string) =>
    typeof cat === 'object' ? cat.name : cat;

  const getCategoryId = (cat: { _id: string; name: string } | string) =>
    typeof cat === 'object' ? cat._id : cat;

  let filteredFoods = foods.filter((food) => {
    let matches = true;
    if (selectedCategory !== 'all') {
      matches = matches && getCategoryId(food.category) === selectedCategory;
    }
    if (vegetarian) matches = matches && food.isVegetarian;
    if (food.price > priceRange) matches = false;
    if (searchQuery) {
      matches = matches && food.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return matches;
  });

  if (sortBy === 'price-low') filteredFoods = [...filteredFoods].sort((a, b) => a.price - b.price);
  else if (sortBy === 'price-high') filteredFoods = [...filteredFoods].sort((a, b) => b.price - a.price);
  else if (sortBy === 'rating') filteredFoods = [...filteredFoods].sort((a, b) => (b.rating || 0) - (a.rating || 0));

  return (
    <main className="min-h-screen pt-28 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h1 className="text-5xl font-bold mb-4">
              Our <span className="text-primary-gold">Menu</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Explore our delicious collection of authentic dishes
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - Filters */}
            <div className="lg:col-span-1">
              <div className="card sticky top-28">
                <h3 className="text-xl font-bold mb-6">Filters</h3>

                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-2">Search</label>
                  <input
                    type="text"
                    placeholder="Search dishes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-dark-input border border-primary-gold/30 text-white focus:outline-none focus:border-primary-gold transition-all"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-3">Categories</label>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`block w-full text-left px-4 py-2 rounded-lg transition-all ${
                        selectedCategory === 'all'
                          ? 'bg-primary-gold text-dark-bg font-bold'
                          : 'text-gray-300 hover:text-primary-gold'
                      }`}
                    >
                      All Items
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat._id}
                        onClick={() => setSelectedCategory(cat._id)}
                        className={`block w-full text-left px-4 py-2 rounded-lg transition-all ${
                          selectedCategory === cat._id
                            ? 'bg-primary-gold text-dark-bg font-bold'
                            : 'text-gray-300 hover:text-primary-gold'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={vegetarian}
                      onChange={(e) => setVegetarian(e.target.checked)}
                      className="w-4 h-4 accent-primary-gold"
                    />
                    <span className="text-sm font-semibold">Vegetarian Only</span>
                  </label>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-3">Price: ₹{priceRange}</label>
                  <input
                    type="range"
                    min="50"
                    max="1000"
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full accent-primary-gold"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>₹50</span>
                    <span>₹1000</span>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-dark-input border border-primary-gold/30 text-white focus:outline-none focus:border-primary-gold"
                  >
                    <option value="popular">Popular</option>
                    <option value="rating">Highest Rated</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>

                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setVegetarian(false);
                    setPriceRange(1000);
                    setSortBy('popular');
                    setSearchQuery('');
                  }}
                  className="w-full px-4 py-2 rounded-lg bg-primary-gold/20 text-primary-gold hover:bg-primary-gold/30 transition-all font-semibold"
                >
                  Reset Filters
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="mb-6 flex justify-between items-center">
                <p className="text-gray-400">
                  Showing <span className="text-primary-gold font-bold">{filteredFoods.length}</span> results
                </p>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="card h-80 animate-pulse">
                      <div className="w-full h-48 bg-white/5 rounded-xl mb-4" />
                      <div className="h-4 bg-white/5 rounded w-3/4 mb-2" />
                      <div className="h-4 bg-white/5 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : filteredFoods.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredFoods.map((food) => (
                    <FoodCard
                      key={food._id}
                      id={food._id}
                      name={food.name}
                      price={food.price}
                      image={food.image}
                      rating={food.rating || 0}
                      isVegetarian={food.isVegetarian}
                      categoryName={getCategoryName(food.category)}
                    />
                  ))}
                </div>
              ) : (
                <div className="card text-center py-12">
                  <p className="text-xl text-gray-400">
                    No dishes found. Try adjusting your filters.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
  );
}
