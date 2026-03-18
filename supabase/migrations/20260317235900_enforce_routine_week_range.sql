CREATE OR REPLACE FUNCTION public.enforce_routine_week_in_range()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_length_weeks integer;
BEGIN
  SELECT plans.length_weeks
    INTO v_length_weeks
    FROM public.plan_movements
    JOIN public.plans ON plans.id = plan_movements.plan_id
   WHERE plan_movements.id = NEW.plan_movement_id;

  IF v_length_weeks IS NULL THEN
    RAISE EXCEPTION 'plan_movement_id % does not resolve to a valid plan', NEW.plan_movement_id;
  END IF;

  IF NEW.week > v_length_weeks THEN
    RAISE EXCEPTION 'week % exceeds plan length of % weeks', NEW.week, v_length_weeks;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_enforce_routine_week_in_range
  BEFORE INSERT OR UPDATE OF week, plan_movement_id
  ON public.plan_routines
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_routine_week_in_range();
