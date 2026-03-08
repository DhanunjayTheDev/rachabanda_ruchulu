'use client';

import { useEffect, useState, useCallback } from 'react';
import FoodCard from './FoodCard';
import { foodAPI } from '@/lib/api';
import { useRealtimeFoods } from '@/hooks/useRealtime';

const FeaturedSection = () => {
  const [foods, setFoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time food updates
  const handleFoodsUpdate = useCallback((action: string, data: any) => {
    console.log('🎯 FeaturedSection received food update:', { action, data });
    setFoods((prev) => {
      if (action === 'created') {
        if (data.isFeatured) {
          console.log('➕ Adding featured food to section');
          return [...prev, data];
        }
        console.log('⏭️ Skipping non-featured food');
        return prev;
      } else if (action === 'updated') {
        console.log('🔄 Updating featured food');
        return prev.map((food) => (food._id === data._id ? { ...food, ...data } : food));
      } else if (action === 'deleted') {
        console.log('➖ Removing deleted food from section');
        return prev.filter((food) => food._id !== data._id);
      }
      return prev;
    });
  }, []);

  useRealtimeFoods(handleFoodsUpdate);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await foodAPI.getFeatured();
        const data = res.data?.foods || res.data || [];
        setFoods(data.slice(0, 4));
      } catch {
        try {
          const res = await foodAPI.getAll();
          const data = res.data?.foods || res.data || [];
          setFoods(data.slice(0, 4));
        } catch {
          setFoods([]);
        }
      }
      setLoading(false);
    };
    fetchFeatured();
  }, []);

  return (
    <section className="py-24 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <h2 className="text-5xl font-bold mb-4">
            Featured <span className="text-primary-gold">Dishes</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl">
            Discover our best-selling and most-loved dishes crafted to perfection
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse bg-dark-card rounded-2xl h-72"></div>
            ))}
          </div>
        ) : foods.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {foods.map((food: any) => (
              <FoodCard
                key={food._id || food.id}
                id={food._id || food.id}
                name={food.name}
                price={food.price}
                image={food.image || '🍽️'}
                rating={food.rating || 4.5}
                isVegetarian={food.isVegetarian || false}
                foodType={food.foodType}
                categoryName={typeof food.category === 'object' ? food.category?.name : food.category || ''}
                description={food.description}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-12">No featured dishes available</p>
        )}

        <div className="text-center mt-16">
          <a href="/menu">
            <button className="btn btn-primary px-8 py-4 text-lg">
              Explore Full Menu →
            </button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;
