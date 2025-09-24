import { apiGet } from '@/lib/api';

export default async function CommunityPage() {
  let events: any[] = [];
  let links: any = {};
  try {
    events = await apiGet('/api/community/events');
    links = await apiGet('/api/community/links');
  } catch {}

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Community</h1>
      <p>Join the conversation and never miss an event.</p>
      <section>
        <h2 className="text-2xl font-semibold">Events</h2>
        <ul className="mt-2 space-y-2">
          {events.map((e) => (
            <li key={e.id} className="border rounded p-3">
              <div className="font-medium">{e.title}</div>
              <div className="text-sm text-gray-600">{new Date(e.event_date).toLocaleString()}</div>
              {e.link && (
                <a className="text-brand text-sm" href={e.link} target="_blank" rel="noreferrer">Join</a>
              )}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="text-2xl font-semibold">Join Us</h2>
        <div className="flex gap-4 mt-2">
          <a className="px-3 py-2 border rounded" href={links.discord} target="_blank" rel="noreferrer">Discord</a>
          <a className="px-3 py-2 border rounded" href={links.telegram} target="_blank" rel="noreferrer">Telegram</a>
        </div>
      </section>
    </div>
  );
}
