import Link from 'next/link';
import { apiGet } from '@/lib/api';

export default async function BlogIndex() {
  let posts: any[] = [];
  try { posts = await apiGet('/api/blog'); } catch {}
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Blog & Insights</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {posts.map((p) => (
          <Link key={p.id} href={`/blog/${p.slug}`} className="border rounded p-4 block hover:shadow-sm">
            <h3 className="font-semibold text-lg">{p.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{p.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
