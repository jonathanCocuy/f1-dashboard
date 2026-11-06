'use client';

import { usePathname, useRouter } from 'next/navigation';

export function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const segments = pathname.split('/');
  const currentLocale = segments[1] ?? 'en';

  const toggle = () => {
    const nextLocale = currentLocale === 'en' ? 'es' : 'en';
    segments[1] = nextLocale;
    router.push(segments.join('/'));
  };

  return (
    <button
      onClick={toggle}
      className="ml-2 px-3 py-1.5 rounded-xl text-sm font-medium bg-surface border border-[#2c2c2e] text-text-secondary hover:text-text-primary transition-all duration-200"
    >
      {currentLocale === 'en' ? 'ES' : 'EN'}
    </button>
  );
}
