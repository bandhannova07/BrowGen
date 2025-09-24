import { CourseCard } from '@/components/CourseCard';
import { apiGet } from '@/lib/api';

export default async function LearningPage({ searchParams }: { searchParams?: { q?: string; category?: string; level?: string } }) {
  const q = searchParams?.q || '';
  const category = searchParams?.category || '';
  const level = searchParams?.level || '';
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (category) params.set('category', category);
  if (level) params.set('level', level);

  let courses: any[] = [];
  try {
    courses = await apiGet(`/api/courses${params.toString() ? `?${params.toString()}` : ''}`);
  } catch {}

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Learning Hub</h1>
      <form className="flex flex-wrap gap-3">
        <input name="q" defaultValue={q} placeholder="Search courses" className="border rounded px-3 py-2 w-full md:w-64" />
        <select name="category" defaultValue={category} className="border rounded px-3 py-2">
          <option value="">All Categories</option>
          <option value="tech">Tech</option>
          <option value="soft-skills">Soft Skills</option>
          <option value="entrepreneurship">Entrepreneurship</option>
          <option value="creative">Creative</option>
        </select>
        <select name="level" defaultValue={level} className="border rounded px-3 py-2">
          <option value="">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        <button type="submit" className="px-4 py-2 rounded bg-brand text-white">Filter</button>
      </form>
      <div className="grid md:grid-cols-3 gap-4">
        {courses.map((c) => (
          <CourseCard key={c.id} title={c.title} description={c.description} level={c.level} moduleCount={Number(c.module_count)} />
        ))}
      </div>
    </div>
  );
}
