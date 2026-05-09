export default function Logo({ className = '', size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'sm' ? 'text-xs tracking-[2px]' : size === 'lg' ? 'text-base tracking-[3px]' : 'text-sm tracking-[2.5px]';
  return (
    <div className={`font-extrabold ${sizeClass} ${className}`}>
      ECOM <span className="text-gold">HOUSE</span>
    </div>
  );
}
