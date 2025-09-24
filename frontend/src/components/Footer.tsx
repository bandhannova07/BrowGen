export function Footer() {
  return (
    <footer className="border-t">
      <div className="container py-6 text-sm flex items-center justify-between">
        <p>© {new Date().getFullYear()} BrowGen. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="#" target="_blank" rel="noreferrer">Twitter</a>
          <a href="#" target="_blank" rel="noreferrer">LinkedIn</a>
          <a href="#" target="_blank" rel="noreferrer">YouTube</a>
        </div>
      </div>
    </footer>
  );
}
