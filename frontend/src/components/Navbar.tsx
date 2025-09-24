import Link from 'next/link';

export function Navbar() {
  return (
    <header className="border-b">
      <div className="container flex items-center justify-between h-16">
        <Link href="/" className="font-bold text-xl text-brand">BrowGen</Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/about">About</Link>
          <Link href="/learning">Learning Hub</Link>
          <Link href="/community">Community</Link>
          <Link href="/mentorship">Mentorship</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/login" className="px-3 py-1.5 rounded bg-brand text-white">Login</Link>
        </nav>
      </div>
    </header>
  );
}
