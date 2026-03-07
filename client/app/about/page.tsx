'use client';

import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="min-h-screen pt-28 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4">
            About <span className="text-primary-gold">Rachabanda Ruchulu</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Bringing the authentic flavors of Telangana to your doorstep since 2020
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <div className="card h-full">
              <h2 className="text-3xl font-bold mb-4 text-primary-gold">Our Story</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Rachabanda Ruchulu was born from a passion for authentic Telugu cuisine. 
                Our founder, inspired by the rich culinary traditions of Hyderabad and 
                Telangana, set out to create a restaurant that serves genuine homestyle 
                food with love and care.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Every dish we serve carries the legacy of generations of family recipes, 
                prepared with the freshest ingredients and traditional cooking methods. 
                From our signature Hyderabadi Biryani to our flavorful curries, each 
                plate tells a story of tradition and taste.
              </p>
            </div>
          </div>

          <div>
            <div className="card h-full">
              <h2 className="text-3xl font-bold mb-4 text-primary-gold">Our Mission</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                We are committed to delivering an exceptional dining experience, whether 
                you visit us or order from the comfort of your home. Quality, hygiene, 
                and authentic taste are the pillars of everything we do.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Our kitchen uses only premium ingredients, fresh spices ground in-house, 
                and oils that meet the highest standards. We believe great food starts 
                with great ingredients.
              </p>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            What Sets Us <span className="text-primary-gold">Apart</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '🍳', title: 'Authentic Recipes', desc: 'Traditional Telugu recipes passed down through generations' },
              { icon: '🥬', title: 'Fresh Ingredients', desc: 'Locally sourced, premium quality ingredients in every dish' },
              { icon: '🚀', title: 'Fast Delivery', desc: 'Hot food delivered to your door within 30-45 minutes' },
              { icon: '💎', title: 'Premium Quality', desc: 'No compromises on taste, hygiene, or presentation' },
              { icon: '❤️', title: 'Made with Love', desc: 'Every dish prepared with care by our experienced chefs' },
              { icon: '💰', title: 'Fair Pricing', desc: 'Restaurant-quality food at affordable prices' },
            ].map((item, i) => (
              <div key={i} className="card text-center">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="card text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to <span className="text-primary-gold">Taste the Difference</span>?
          </h2>
          <p className="text-gray-400 mb-6">Explore our menu and order your favorite dishes today.</p>
          <div className="flex gap-4 justify-center">
            <Link href="/menu">
              <button className="btn btn-primary">Explore Menu</button>
            </Link>
            <Link href="/contact">
              <button className="btn btn-outline">Contact Us</button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
