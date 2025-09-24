import { Hero } from '@/components/Hero';
import { Testimonials } from '@/components/Testimonials';
import { apiGet } from '@/lib/api';

export default async function HomePage() {
  let testimonials: any[] = [];
  try {
    testimonials = await apiGet('/api/testimonials');
  } catch {}

  return (
    <div className="space-y-12">
      <Hero />
      <section className="grid md:grid-cols-3 gap-6">
        <div className="p-6 border rounded">
          <h3 className="font-semibold text-lg">Skills</h3>
          <p className="text-sm text-gray-600 mt-2">Hands-on courses and challenges to build real skills.</p>
        </div>
        <div className="p-6 border rounded">
          <h3 className="font-semibold text-lg">Community</h3>
          <p className="text-sm text-gray-600 mt-2">Join peers, share wins, and grow together.</p>
        </div>
        <div className="p-6 border rounded">
          <h3 className="font-semibold text-lg">Mentorship</h3>
          <p className="text-sm text-gray-600 mt-2">Get guidance from industry mentors.</p>
        </div>
      </section>
      <Testimonials items={testimonials} />
      <section className="text-center py-10">
        <a href="/signup" className="px-6 py-3 rounded bg-brand text-white">Start Learning Today</a>
      </section>
    </div>
  );
}
