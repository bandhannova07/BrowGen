'use client';
import { useState } from 'react';
import { apiPost, authStore } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const res = await apiPost<{ token: string }>('/api/auth/signup', { name, email, password });
      authStore.setToken(res.token);
      router.push('/dashboard');
    } catch (e) {
      setError('Signup failed. Try a different email or stronger password.');
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold">Create your account</h1>
      <form onSubmit={submit} className="mt-6 space-y-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="border rounded px-3 py-2 w-full" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="border rounded px-3 py-2 w-full" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (min 6 chars)" className="border rounded px-3 py-2 w-full" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="px-4 py-2 rounded bg-brand text-white" type="submit">Create Account</button>
      </form>
      <p className="text-sm mt-3">Have an account? <a className="underline" href="/login">Login</a></p>
    </div>
  );
}
