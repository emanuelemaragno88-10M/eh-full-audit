import Link from 'next/link';
import Logo from './Logo';

export default function Header() {
  return (
    <header className="border-b border-border bg-bg/80 backdrop-blur-sm sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Logo size="md" />
        </Link>
        <nav className="hidden sm:flex items-center gap-6 text-sm text-muted">
          <a href="#what" className="hover:text-white transition-colors">What's included</a>
          <a href="#how" className="hover:text-white transition-colors">How it works</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </nav>
      </div>
    </header>
  );
}
