'use client';
import { useState } from 'react';
import { apiPost, authStore } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const res = await apiPost<{ token: string }>('/api/auth/login', { email, password });
      authStore.setToken(res.token);
      router.push('/dashboard');
    } catch (e) {
      setError('Login failed. Check your email/password.');
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold">Login</h1>
      <form onSubmit={submit} className="mt-6 space-y-3">
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="border rounded px-3 py-2 w-full" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="border rounded px-3 py-2 w-full" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="px-4 py-2 rounded bg-brand text-white" type="submit">Login</button>
      </form>
      <p className="text-sm mt-3">No account? <a className="underline" href="/signup">Sign up</a></p>
    </div>
  );
}
