import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'BrowGen — Learn. Grow. Belong.',
  description: 'Learning, community, and mentorship for students and youth.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="container py-10 min-h-[70vh]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
