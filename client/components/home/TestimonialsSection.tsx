'use client';

const TestimonialsSection = () => {
  const testimonials = [
    { id: 1, name: 'Rajesh Kumar', text: 'The Hyderabadi biryani here is absolutely authentic and delicious. Best food delivery experience!', rating: 5, image: '👨' },
    { id: 2, name: 'Priya Sharma', text: 'Fresh ingredients, generous portions, and amazing flavors. Highly recommended!', rating: 5, image: '👩' },
    { id: 3, name: 'Arjun Singh', text: 'Fast delivery and the food arrived hot and fresh. Will definitely order again!', rating: 4, image: '👨' },
  ];

  return (
    <section className="py-24 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 text-center">
          <h2 className="text-5xl font-bold mb-4">What Our <span className="text-primary-gold">Customers</span> Say</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="card">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-4xl">{testimonial.image}</span>
                <div>
                  <h4 className="font-semibold text-white">{testimonial.name}</h4>
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-primary-gold">⭐</span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-400 italic">"{testimonial.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
