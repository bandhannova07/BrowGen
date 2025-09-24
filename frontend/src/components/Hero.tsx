import Link from 'next/link';

export function Hero() {
  return (
    <section className="py-16 text-center">
      <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
        Learn. Grow. Belong.
      </h1>
      <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
        BrowGen is your hub for skills, challenges, community, and mentorship. Start learning and track your progress.
      </p>
      <div className="mt-8 flex gap-4 justify-center">
        <Link href="/signup" className="px-5 py-3 rounded bg-brand text-white">Join Now</Link>
        <Link href="/learning" className="px-5 py-3 rounded border">Start Learning</Link>
      </div>
    </section>
  );
}
