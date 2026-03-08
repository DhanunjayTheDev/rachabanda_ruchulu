import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const testimonials = [
  {
    name: 'Priya Sharma',
    avatar: '👩',
    rating: 5,
    text: 'The biryani is absolutely divine! Reminds me of my grandmother\'s cooking. The spices are perfectly balanced.',
    dish: 'Hyderabadi Biryani',
  },
  {
    name: 'Rahul Kumar',
    avatar: '👨',
    rating: 5,
    text: 'Best village-style food in the city! The delivery is always on time and the food arrives hot and fresh.',
    dish: 'Chicken Curry Meals',
  },
  {
    name: 'Anita Reddy',
    avatar: '👩‍🦱',
    rating: 4,
    text: 'Love the authentic flavors! The gutti vankaya curry is exactly like my mom makes. Will order again!',
    dish: 'Gutti Vankaya',
  },
  {
    name: 'Suresh Babu',
    avatar: '👨‍🦳',
    rating: 5,
    text: 'Excellent quality and taste. The portions are generous and pricing is very reasonable for the quality you get.',
    dish: 'Special Thali',
  },
  {
    name: 'Meena Devi',
    avatar: '👩‍🍳',
    rating: 5,
    text: 'I\'ve tried many restaurants but Rachabanda Ruchulu stands out. The traditional recipes are authentic and delicious.',
    dish: 'Pesarattu',
  },
];

const TestimonialsSection = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-24 px-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-primary-gold/5 rounded-full blur-3xl" style={{ top: '20%', right: '-5%' }} />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="mb-16 text-center">
          <h2 className="text-5xl font-bold mb-4">What Our <span className="text-primary-gold">Customers</span> Say</h2>
          <p className="text-gray-400 text-lg">Real reviews from our happy customers</p>
        </div>

        <div className="relative h-80">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              <div className="glass rounded-3xl p-12 h-full flex flex-col justify-center items-center text-center">
                <div className="text-6xl mb-6">{testimonials[current].avatar}</div>
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonials[current].rating }, (_, i) => (
                    <span key={i} className="text-primary-gold text-xl">⭐</span>
                  ))}
                </div>
                <p className="text-xl text-gray-300 italic mb-6 max-w-2xl">"{testimonials[current].text}"</p>
                <p className="text-primary-gold font-bold text-lg">{testimonials[current].name}</p>
                <p className="text-gray-400 text-sm">Ordered: {testimonials[current].dish}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-center gap-3 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === current ? 'bg-primary-gold w-8' : 'bg-gray-600 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
