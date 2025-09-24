"use client";
import { useEffect, useState } from 'react';
import { apiGet, apiPost, authStore } from '@/lib/api';

export default function MentorshipPage() {
  const [mentors, setMentors] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await apiGet('/api/mentors');
        setMentors(data);
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  async function book(mentor_id: string) {
    setMessage('');
    const token = authStore.getToken();
    if (!token) {
      setMessage('Please login to book a session.');
      return;
    }
    try {
      await apiPost('/api/mentors/book', { mentor_id, scheduled_at: new Date().toISOString() }, token);
      setMessage('Booking requested! We will confirm shortly.');
    } catch (e) {
      setMessage('Could not book session.');
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Mentorship</h1>
      {message && <p className="text-sm text-gray-700">{message}</p>}
      <div className="grid md:grid-cols-3 gap-4">
        {mentors.map((m) => (
          <div key={m.id} className="border rounded p-4">
            <h3 className="font-semibold text-lg">{m.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{m.bio}</p>
            <div className="flex flex-wrap gap-2 mt-2 text-xs">
              {m.expertise?.map((e: string) => (
                <span key={e} className="px-2 py-0.5 rounded bg-gray-100">{e}</span>
              ))}
            </div>
            <button className="mt-3 px-3 py-2 rounded bg-brand text-white" onClick={() => book(m.id)}>
              Book 1-on-1
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
