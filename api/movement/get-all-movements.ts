import { createClient } from '@/lib/supabase/server';

export interface Movement {
  id: number;
  name: string;
}

export async function getAllMovements(): Promise<Movement[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('movements')
    .select('id, name')
    .order('name');

  if (error) throw error;

  return (data ?? []) as Movement[];
}
