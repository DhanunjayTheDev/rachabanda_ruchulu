import HeroSection from '@/components/home/HeroSection';
import FeaturedSection from '@/components/home/FeaturedSection';
import CategoriesSection from '@/components/home/CategoriesSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';

export const metadata = {
  title: 'Home | Rachabanda Ruchulu',
  description: 'Order authentic Hyderabadi biryani and premium cuisine online',
};

export default function Home() {
  return (
    <div>
      <HeroSection />
      <CategoriesSection />
      <FeaturedSection />
      <TestimonialsSection />
    </div>
  );
}
