import HeroSection from '@/components/home/HeroSection';
import FeaturedSection from '@/components/home/FeaturedSection';
import CategoriesSection from '@/components/home/CategoriesSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <CategoriesSection />
      <FeaturedSection />
      <TestimonialsSection />
    </div>
  );
}
