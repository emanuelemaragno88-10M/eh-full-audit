import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="border-t border-border mt-20">
      <div className="max-w-6xl mx-auto px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
        <Logo size="sm" />
        <div>© 2026 ECOM HOUSE GmbH — Full Funnel Audit</div>
      </div>
    </footer>
  );
}
