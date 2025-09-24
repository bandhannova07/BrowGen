'use client';
import { useEffect, useState } from 'react';
import { apiGet, authStore } from '@/lib/api';

type Progress = {
  id: string;
  course_id: string;
  completed_modules: number;
  total_modules: number;
  points: number;
  badges: string[];
  course_title: string;
};

type MeResponse = { user: { id: string; email: string; name: string } };

export default function DashboardPage() {
  const [progress, setProgress] = useState<Progress[]>([]);
  const [user, setUser] = useState<MeResponse['user'] | null>(null);

  useEffect(() => {
    const token = authStore.getToken();
    if (!token) {
      window.location.href = '/login';
      return;
    }
    (async () => {
      try {
        const me = await apiGet<MeResponse>('/api/auth/me', token);
        setUser(me.user);
        const prog = await apiGet<Progress[]>('/api/progress', token);
        setProgress(prog);
      } catch {
        authStore.clear();
        window.location.href = '/login';
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      {user && <p>Welcome back, <span className="font-medium">{user.name}</span></p>}
      <section>
        <h2 className="text-2xl font-semibold">Your Progress</h2>
        <ul className="mt-2 space-y-2">
          {progress.map((p: Progress) => (
            <li key={p.id} className="border rounded p-3">
              <div className="font-medium">{p.course_title}</div>
              <div className="text-sm text-gray-600">{p.completed_modules}/{p.total_modules} modules • {p.points} points</div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
