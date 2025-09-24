type Testimonial = { user_name: string; content: string; role?: string };

export function Testimonials({ items }: { items: Testimonial[] }) {
  return (
    <section className="py-12">
      <h2 className="text-2xl font-bold">What learners say</h2>
      <div className="grid md:grid-cols-2 gap-4 mt-4">
        {items.map((t, idx) => (
          <blockquote key={idx} className="border rounded p-4 bg-gray-50">
            <p className="text-gray-700">“{t.content}”</p>
            <footer className="text-sm mt-2">— {t.user_name}{t.role ? `, ${t.role}` : ''}</footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
