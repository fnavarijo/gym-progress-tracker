import { requireAuth } from '@/lib/auth';

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

  return (
    <header className="px-4 pt-6 pb-4">
      <h1 className="text-4xl font-bold text-foreground break-all">
        Hey, {firstName}!
      </h1>
      <p className="text-muted-foreground mt-1">Ready to build momentum?</p>
    </header>
  );
}
