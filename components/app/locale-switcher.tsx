'use client';

import { useLocale } from 'next-intl';
import { usePathname, getPathname } from '@/i18n/navigation';

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();

  const otherLocale = locale === 'es' ? 'en' : 'es';
  const label = locale === 'es' ? 'EN' : 'ES';

  function handleSwitch() {
    // Set NEXT_LOCALE cookie so the middleware respects the user's explicit choice
    // over the browser's Accept-Language header.
    const oneYear = 60 * 60 * 24 * 365;
    document.cookie = `NEXT_LOCALE=${otherLocale}; path=/; max-age=${oneYear}; SameSite=Lax`;
    // Full-page navigation so the request goes through Next.js middleware,
    // which correctly resolves the default locale (es) at the root path.
    const targetPath = getPathname({ href: pathname, locale: otherLocale });
    window.location.href = targetPath;
  }

  return (
    <button
      onClick={handleSwitch}
      className="text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted"
    >
      {label}
    </button>
  );
}
