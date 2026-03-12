import { createClient } from '@/lib/supabase/server';

export async function hasUserPastCycles(): Promise<boolean> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('cycles')
    .select('id')
    .eq('user_id', user.id)
    .in('status', ['completed', 'archived'])
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data !== null;
}
