'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LanguageSwitcher } from './LanguageSwitcher';

const links = [
  { href: '/', label: 'Home' },
  { href: '/live', label: 'Live' },
  { href: '/calendar', label: 'Calendar' },
  { href: '/standings', label: 'Standings' },
];

export function Navbar() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] ?? 'en';

  return (
    <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-black/70 border-b border-[#2c2c2e]">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <span className="text-accent-red font-bold text-xl tracking-tight">F1</span>
          <span className="text-text-primary font-semibold text-sm hidden sm:block">Dashboard</span>
        </Link>

        <div className="flex items-center gap-1">
          {links.map(({ href, label }) => {
            const fullHref = `/${locale}${href === '/' ? '' : href}`;
            const isActive = pathname === fullHref || (href !== '/' && pathname.startsWith(fullHref));
            return (
              <Link
                key={href}
                href={fullHref}
                className={`px-3 py-1.5 rounded-xl text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-surface-2 text-text-primary font-medium'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {label}
              </Link>
            );
          })}
          <LanguageSwitcher />
        </div>
      </div>
    </nav>
  );
}
