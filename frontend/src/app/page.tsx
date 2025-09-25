import Link from 'next/link';
import { Hero } from '@/components/ui/Hero';
import { Testimonials } from '@/components/Testimonials';
import { apiGet } from '@/lib/api';

export default async function HomePage() {
  let testimonials: any[] = [];
  try {
    testimonials = await apiGet('/api/testimonials');
  } catch {}

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero variant="feature-rich" />
      <Testimonials items={testimonials} />
      <section className="text-center py-10">
        <a href="/signup" className="px-6 py-3 rounded bg-brand text-white">Start Learning Today</a>
      </section>
    </div>
  );
}
