import { createClient } from '@/lib/supabase/server';

export interface Plan {
  id: number;
  name: string;
}

export async function getPlanBySlug(slug: string): Promise<Plan | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('plans')
    .select('id, name')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}
