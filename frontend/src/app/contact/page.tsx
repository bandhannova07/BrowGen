export default function ContactPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold">Contact & Support</h1>
      <form className="space-y-3">
        <input placeholder="Your name" className="border rounded px-3 py-2 w-full" />
        <input placeholder="Your email" className="border rounded px-3 py-2 w-full" />
        <textarea placeholder="How can we help?" className="border rounded px-3 py-2 w-full" rows={5} />
        <button className="px-4 py-2 rounded bg-brand text-white" type="button">Send</button>
      </form>
      <div>
        <h2 className="text-2xl font-semibold">Follow us</h2>
        <div className="flex gap-4 mt-2">
          <a href="#" className="underline">Twitter</a>
          <a href="#" className="underline">LinkedIn</a>
          <a href="#" className="underline">YouTube</a>
        </div>
      </div>
    </div>
  );
}
