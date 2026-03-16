import { requireAuth } from '@/lib/auth';
import { getTranslations } from 'next-intl/server';

function getFirstName(claims: Record<string, unknown>): string {
  const metadata = claims.user_metadata as Record<string, unknown> | undefined;
  const fullName =
    (metadata?.full_name as string | undefined) ??
    (metadata?.name as string | undefined) ??
    (claims.email as string | undefined)?.split('@')[0] ??
    'there';
  return fullName.split(' ')[0];
}

export async function DashboardGreeting() {
  const claims = await requireAuth();
  const firstName = getFirstName(claims as Record<string, unknown>);
  const t = await getTranslations('Dashboard');

  return (
    <header className="px-4 md:px-6 pt-8 pb-4">
      <h1 className="text-3xl font-bold tracking-tight leading-tight break-words">
        {t('greeting', { name: firstName })}
      </h1>
      <p className="text-muted-foreground mt-2">{t('subGreeting')}</p>
    </header>
  );
}
