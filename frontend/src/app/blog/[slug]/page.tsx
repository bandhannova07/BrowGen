import { apiGet } from '@/lib/api';

export default async function BlogPost({ params }: { params: { slug: string } }) {
  let post: any = null;
  try { post = await apiGet(`/api/blog/${params.slug}`); } catch {}
  if (!post) return <div>Post not found</div>;
  return (
    <article className="prose max-w-none">
      <h1>{post.title}</h1>
      <p className="text-gray-500">{new Date(post.created_at).toLocaleString()}</p>
      <div className="mt-6 whitespace-pre-wrap">{post.content}</div>
    </article>
  );
}
