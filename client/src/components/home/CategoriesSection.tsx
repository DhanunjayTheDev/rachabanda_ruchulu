import { useEffect, useState, useCallback } from 'react';
import { categoryAPI } from '@/lib/api';
import { useRealtimeCategories } from '@/hooks/useRealtime';

const defaultEmojis: Record<string, string> = {
  biryani: '🍚', starters: '🍗', meals: '🍽️', snacks: '🍟', beverages: '🥤',
  desserts: '🍰', rice: '🍚', curries: '🍛', breads: '🫓', soups: '🍜',
};

const CategoriesSection = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const handleCategoriesUpdate = useCallback((action: string, data: any) => {
    if (action === 'created') {
      setCategories((prev) => [...prev, data]);
    } else if (action === 'updated') {
      setCategories((prev) => prev.map((cat) => (cat._id === data._id ? { ...cat, ...data } : cat)));
    } else if (action === 'deleted') {
      setCategories((prev) => prev.filter((cat) => cat._id !== data._id));
    }
  }, []);

  useRealtimeCategories(handleCategoriesUpdate);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryAPI.getAll();
        const data = res.data?.categories || res.data || [];
        setCategories(data);
      } catch {
        setCategories([]);
      }
      setLoading(false);
    };
    fetchCategories();
  }, []);

  return (
    <section className="py-24 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 text-center">
          <h2 className="text-5xl font-bold mb-4">Browse <span className="text-primary-gold">Categories</span></h2>
          <p className="text-gray-400 text-lg">Choose from our extensive range of delicious dishes</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse bg-dark-card rounded-2xl h-32"></div>
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {categories.map((cat: any) => {
              const name = cat.name || '';
              const hasImage = cat.image && typeof cat.image === 'string' && cat.image.startsWith('http');
              const emoji = !hasImage ? (cat.emoji || defaultEmojis[name.toLowerCase()] || '🍽️') : null;
              
              return (
                <a key={cat._id || cat.id} href={`/menu?category=${name.toLowerCase()}`} className="group flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full overflow-hidden mb-4 relative group-hover:shadow-glow-lg transition-all duration-300 group-hover:scale-110">
                    {hasImage ? (
                      <>
                        <img src={cat.image} alt={name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300"></div>
                      </>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-gold/20 to-primary-gold/5 flex items-center justify-center group-hover:from-primary-gold/30 group-hover:to-primary-gold/10 transition-all duration-300">
                        <span className="text-5xl group-hover:scale-125 transition-transform duration-300">{emoji}</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-primary-gold transition-colors text-center">{name}</h3>
                </a>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-12">No categories available</p>
        )}
      </div>
    </section>
  );
};

export default CategoriesSection;
