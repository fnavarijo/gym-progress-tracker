import { createClient } from '@/lib/supabase/server';

/** Raw shape returned by Supabase — mirrors the DB columns exactly. */
interface CycleRow {
  id: number;
  user_id: string;
  plan_id: number;
  start_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

/** App-level model — all properties in camelCase. */
export interface Cycle {
  id: number;
  userId: string;
  planId: number;
  startDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

function toCycle(row: CycleRow): Cycle {
  return {
    id:        row.id,
    userId:    row.user_id,
    planId:    row.plan_id,
    startDate: row.start_date,
    status:    row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getUserActiveCycle(): Promise<Cycle | null> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('cycles')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle<CycleRow>();

  if (error) throw error;
  return data ? toCycle(data) : null;
}
