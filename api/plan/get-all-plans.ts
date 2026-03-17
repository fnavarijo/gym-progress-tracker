import { createClient } from '@/lib/supabase/server';

interface PlanRow {
  id: number;
  name: string;
  description: string | null;
  length_weeks: number;
  is_system: boolean;
  plan_movements: Array<{ count: number }>;
}

export interface PlanSummary {
  id: number;
  name: string;
  description: string | null;
  lengthWeeks: number;
  isSystem: boolean;
  movementCount: number;
}

function toPlanSummary(row: PlanRow): PlanSummary {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    lengthWeeks: row.length_weeks,
    isSystem: row.is_system,
    movementCount: row.plan_movements[0]?.count ?? 0,
  };
}

export async function getAllPlans(): Promise<PlanSummary[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('plans')
    .select('id, name, description, length_weeks, is_system, plan_movements(count)')
    .order('created_at', { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => toPlanSummary(row as unknown as PlanRow));
}
