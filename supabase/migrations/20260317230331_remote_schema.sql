


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."cycle_dimension_enum" AS ENUM (
    'WEEKS',
    'MONTHS',
    'DAYS'
);


ALTER TYPE "public"."cycle_dimension_enum" OWNER TO "postgres";


CREATE TYPE "public"."plan_status_enum" AS ENUM (
    'ACTIVE',
    'INACTIVE'
);


ALTER TYPE "public"."plan_status_enum" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."_create_cycle_internal"("p_user_id" "uuid", "p_plan_id" bigint, "p_start_date" "date", "p_pr_by_movement" "jsonb" DEFAULT NULL::"jsonb", "p_round_increment" numeric DEFAULT 5) RETURNS bigint
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_cycle_id    bigint;
  v_length_weeks integer;
BEGIN
  IF p_pr_by_movement IS NOT NULL AND jsonb_typeof(p_pr_by_movement) <> 'object' THEN
    RAISE EXCEPTION 'p_pr_by_movement must be a JSON object: {"<movement_id>": <pr>, ...}';
  END IF;

  SELECT length_weeks INTO v_length_weeks
  FROM public.plans
  WHERE id = p_plan_id;

  IF v_length_weeks IS NULL THEN
    RAISE EXCEPTION 'Plan % not found', p_plan_id;
  END IF;

  INSERT INTO public.cycles (user_id, plan_id, start_date, length_weeks)
  VALUES (p_user_id, p_plan_id, p_start_date, v_length_weeks)
  RETURNING id INTO v_cycle_id;

  INSERT INTO public.cycle_movements (cycle_id, plan_id, movement_id, max_pr)
  SELECT
    v_cycle_id,
    p_plan_id,
    pm.movement_id,
    CASE
      WHEN p_pr_by_movement IS NULL
        OR NOT (p_pr_by_movement ? pm.movement_id::text)
        OR (p_pr_by_movement ->> pm.movement_id::text) IS NULL THEN NULL
      ELSE public.round_to_increment(
        (p_pr_by_movement ->> pm.movement_id::text)::numeric,
        p_round_increment
      )
    END
  FROM public.plan_movements pm
  WHERE pm.plan_id = p_plan_id;

  RETURN v_cycle_id;
END;
$$;


ALTER FUNCTION "public"."_create_cycle_internal"("p_user_id" "uuid", "p_plan_id" bigint, "p_start_date" "date", "p_pr_by_movement" "jsonb", "p_round_increment" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_cycle_with_workouts"("p_plan_id" bigint, "p_start_date" "date", "p_pr_by_movement" "jsonb" DEFAULT NULL::"jsonb", "p_round_increment" numeric DEFAULT 5) RETURNS bigint
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_user_id uuid;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  RETURN public._create_cycle_internal(
    p_user_id         => v_user_id,
    p_plan_id         => p_plan_id,
    p_start_date      => p_start_date,
    p_pr_by_movement  => p_pr_by_movement,
    p_round_increment => p_round_increment
  );
END;
$$;


ALTER FUNCTION "public"."create_cycle_with_workouts"("p_plan_id" bigint, "p_start_date" "date", "p_pr_by_movement" "jsonb", "p_round_increment" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_onboarding_cycle"("p_plan_id" bigint, "p_start_date" "date") RETURNS bigint
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_user_id uuid;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  RETURN public._create_cycle_internal(
    p_user_id    => v_user_id,
    p_plan_id    => p_plan_id,
    p_start_date => p_start_date
  );
END;
$$;


ALTER FUNCTION "public"."create_onboarding_cycle"("p_plan_id" bigint, "p_start_date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_plan_with_movements"("p_description" "text", "p_cycle_length" integer, "p_cycle_dimension" "public"."cycle_dimension_enum", "p_start_date" "date", "p_end_date" "date", "p_movement_ids" "uuid"[]) RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_plan_id UUID;
BEGIN
    -- Insert plan
    INSERT INTO plans (
        description,
        cycle_length,
        cycle_dimension,
        start_date,
        end_date
    )
    VALUES (
        p_description,
        p_cycle_length,
        p_cycle_dimension,
        p_start_date,
        p_end_date
    )
    RETURNING id INTO v_plan_id;

    -- Insert related movements
    INSERT INTO plan_movements (plan_id, movement_id)
    SELECT v_plan_id, unnest(p_movement_ids);

    RETURN v_plan_id;
END;
$$;


ALTER FUNCTION "public"."create_plan_with_movements"("p_description" "text", "p_cycle_length" integer, "p_cycle_dimension" "public"."cycle_dimension_enum", "p_start_date" "date", "p_end_date" "date", "p_movement_ids" "uuid"[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."enforce_workout_set_consistency"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  v_ok boolean;
begin
  /*
    Ensure:
    - workout_sets.workout_id belongs to a workout whose cycle_movement points to a cycle with a plan
    - plan_routine_id belongs to that same plan
    - plan_movement matches workout's movement (via cycle_movement)
    - plan_routines.week matches workouts.week
  */
  select true into v_ok
  from public.workouts w
  join public.cycle_movements cm on cm.id = w.cycle_movement_id
  join public.cycles c on c.id = cm.cycle_id
  join public.plan_routines pr on pr.id = new.plan_routine_id
  join public.plan_movements pm on pm.id = pr.plan_movement_id
  where w.id = new.workout_id
    and pm.plan_id = c.plan_id
    and pm.movement_id = cm.movement_id
    and pr.week = w.week
  limit 1;

  if v_ok is distinct from true then
    raise exception 'Invalid workout_set: plan_routine does not match workout week/movement/plan';
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."enforce_workout_set_consistency"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_or_create_workout"("p_cycle_movement_id" bigint, "p_week" integer) RETURNS TABLE("out_workout_id" bigint, "out_is_evaluation" boolean, "out_plan_routine_id" bigint, "out_set_number" integer, "out_scheduled_weight" numeric, "out_completed_at" timestamp with time zone)
    LANGUAGE "plpgsql"
    AS $$DECLARE
  v_workout_row_id  bigint;
  v_evaluation_week integer;
  v_is_eval         boolean;
BEGIN
  -- 1. Resolve evaluation week from the plan
  SELECT pl.evaluation_week
    INTO v_evaluation_week
  FROM cycle_movements cm
  JOIN cycles cy ON cy.id = cm.cycle_id
  JOIN plans  pl ON pl.id = cy.plan_id
  WHERE cm.id = p_cycle_movement_id;

  IF v_evaluation_week IS NULL THEN
    RAISE EXCEPTION 'Could not resolve plan for cycle_movement %', p_cycle_movement_id;
  END IF;

  v_is_eval := (p_week = v_evaluation_week);

  -- 2. Get or create the workout row
  INSERT INTO workouts (cycle_movement_id, week, is_evaluation)
  VALUES (p_cycle_movement_id, p_week, v_is_eval)
  ON CONFLICT (cycle_movement_id, week) DO NOTHING;

  SELECT id INTO v_workout_row_id
  FROM workouts w
  WHERE w.cycle_movement_id = p_cycle_movement_id
    AND w.week = p_week;

  -- 3. Snapshot sets from plan_routines if not yet generated
  INSERT INTO workout_sets (
    workout_id,
    plan_routine_id,
    set_number,
    scheduled_weight
  )
  SELECT
    v_workout_row_id,
    pr.id,
    pr.set_number,
    CASE
      WHEN v_is_eval         THEN NULL
      WHEN cm.max_pr IS NULL THEN NULL
      ELSE public.round_to_next_plate(
        cm.max_pr * pr.percentage_pr,
        5,   -- increment
        45   -- barbell weight
      )
    END
  FROM cycle_movements cm
  JOIN plan_movements pm
    ON pm.plan_id     = cm.plan_id
   AND pm.movement_id = cm.movement_id
  JOIN plan_routines pr
    ON pr.plan_movement_id = pm.id
   AND pr.week = p_week
  WHERE cm.id = p_cycle_movement_id
  ON CONFLICT ON CONSTRAINT uq_workout_sets DO NOTHING;


  -- 4. Return sets with workout context
  RETURN QUERY
  SELECT
    w.id,
    w.is_evaluation,
    ws.plan_routine_id,
    ws.set_number,
    ws.scheduled_weight,
    ws.completed_at
  FROM workouts w
  JOIN workout_sets ws ON ws.workout_id = w.id
  WHERE w.id = v_workout_row_id
  ORDER BY ws.set_number;
END;$$;


ALTER FUNCTION "public"."get_or_create_workout"("p_cycle_movement_id" bigint, "p_week" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."normalize_cycle_start_date"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.start_date := date_trunc('week', new.start_date)::date;
  return new;
end;
$$;


ALTER FUNCTION "public"."normalize_cycle_start_date"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."protect_system_plan_mutation"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  if old.is_system = true and new.is_system = false then
    raise exception 'Cannot remove system flag from a system plan.';
  end if;
  return new;
end;
$$;


ALTER FUNCTION "public"."protect_system_plan_mutation"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."protect_system_plans"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  if old.is_system = true then
    raise exception 'System plans cannot be deleted.';
  end if;
  return old;
end;
$$;


ALTER FUNCTION "public"."protect_system_plans"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."round_to_increment"("p_value" numeric, "p_increment" numeric) RETURNS numeric
    LANGUAGE "sql" IMMUTABLE
    AS $$
  select
    case
      when p_increment is null or p_increment <= 0 then p_value
      else round(p_value / p_increment) * p_increment
    end
$$;


ALTER FUNCTION "public"."round_to_increment"("p_value" numeric, "p_increment" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."round_to_next_plate"("p_raw_weight" numeric, "p_increment" numeric DEFAULT 5, "p_barbell" numeric DEFAULT 45) RETURNS numeric
    LANGUAGE "sql" IMMUTABLE
    AS $$SELECT GREATEST(
  p_barbell,
  (CEIL((p_raw_weight - p_barbell) / 2 / p_increment) * p_increment * 2) + p_barbell
);$$;


ALTER FUNCTION "public"."round_to_next_plate"("p_raw_weight" numeric, "p_increment" numeric, "p_barbell" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_cycle_movement_pr"("p_workout_id" bigint, "p_cycle_movement_id" bigint, "p_pr" numeric) RETURNS TABLE("out_workout_set_id" bigint, "out_plan_routine_id" bigint, "out_set_number" integer, "out_scheduled_weight" numeric, "out_completed_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$DECLARE
  v_user_id uuid;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_pr <= 0 THEN
    RAISE EXCEPTION 'PR must be greater than 0';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.cycle_movements cm
    JOIN public.cycles c ON c.id = cm.cycle_id
    WHERE cm.id = p_cycle_movement_id
      AND c.user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'cycle_movement % not found', p_cycle_movement_id;
  END IF;

  -- 1. Update the PR on cycle_movements
  UPDATE public.cycle_movements
    SET max_pr = p_pr
  WHERE id = p_cycle_movement_id;

  -- 2. Update scheduled_weight and return affected rows
  RETURN QUERY
  UPDATE public.workout_sets
    SET scheduled_weight = public.round_to_next_plate(
    p_pr * pr.percentage_pr,
    5,   -- increment
    45   -- barbell weight
  )
  FROM public.plan_routines pr
  JOIN public.plan_movements pm  ON pm.id = pr.plan_movement_id
  JOIN public.cycle_movements cm ON cm.movement_id = pm.movement_id
                                AND cm.plan_id     = pm.plan_id
  WHERE workout_sets.workout_id      = p_workout_id
    AND workout_sets.plan_routine_id = pr.id
    AND cm.id                        = p_cycle_movement_id
    AND workout_sets.completed_at    IS NULL
    AND EXISTS (
      SELECT 1 FROM public.workouts w
      WHERE w.id            = workout_sets.workout_id
        AND w.is_evaluation = false
    )
  RETURNING
    workout_sets.id,
    workout_sets.plan_routine_id,
    workout_sets.set_number,
    workout_sets.scheduled_weight,
    workout_sets.completed_at;
END;$$;


ALTER FUNCTION "public"."update_cycle_movement_pr"("p_workout_id" bigint, "p_cycle_movement_id" bigint, "p_pr" numeric) OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."cycle_movements" (
    "id" bigint NOT NULL,
    "cycle_id" bigint NOT NULL,
    "movement_id" bigint NOT NULL,
    "max_pr" numeric(8,2),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "plan_id" bigint NOT NULL,
    CONSTRAINT "cycle_movements_max_pr_check" CHECK ((("max_pr" IS NULL) OR ("max_pr" > (0)::numeric)))
);


ALTER TABLE "public"."cycle_movements" OWNER TO "postgres";


ALTER TABLE "public"."cycle_movements" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."cycle_movements_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."cycles" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "plan_id" bigint NOT NULL,
    "start_date" "date" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "length_weeks" integer DEFAULT 0 NOT NULL,
    "end_date" "date" GENERATED ALWAYS AS (("start_date" + (("length_weeks" * 7) - 1))) STORED,
    CONSTRAINT "chk_cycles_start_monday" CHECK ((EXTRACT(dow FROM "start_date") = (1)::numeric)),
    CONSTRAINT "cycles_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'completed'::"text", 'archived'::"text"])))
);


ALTER TABLE "public"."cycles" OWNER TO "postgres";


ALTER TABLE "public"."cycles" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."cycles_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."evaluation_results" (
    "id" bigint NOT NULL,
    "cycle_movement_id" bigint NOT NULL,
    "used_weight" numeric(8,2) NOT NULL,
    "evaluated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "evaluation_results_used_weight_check" CHECK (("used_weight" > (0)::numeric))
);


ALTER TABLE "public"."evaluation_results" OWNER TO "postgres";


ALTER TABLE "public"."evaluation_results" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."evaluation_results_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."movement_types" (
    "id" bigint NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."movement_types" OWNER TO "postgres";


ALTER TABLE "public"."movement_types" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."movement_types_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."movements" (
    "id" bigint NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "movement_type_id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."movements" OWNER TO "postgres";


ALTER TABLE "public"."movements" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."movements_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."plan_movements" (
    "id" bigint NOT NULL,
    "plan_id" bigint NOT NULL,
    "movement_id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "day_of_week" smallint DEFAULT 1 NOT NULL,
    CONSTRAINT "plan_movements_day_of_week_check" CHECK ((("day_of_week" >= 1) AND ("day_of_week" <= 5)))
);


ALTER TABLE "public"."plan_movements" OWNER TO "postgres";


ALTER TABLE "public"."plan_movements" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."plan_movements_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."plan_routines" (
    "id" bigint NOT NULL,
    "plan_movement_id" bigint NOT NULL,
    "week" integer NOT NULL,
    "set_number" integer NOT NULL,
    "percentage_pr" numeric(5,4) NOT NULL,
    "repetitions" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "plan_routines_percentage_pr_check" CHECK ((("percentage_pr" > (0)::numeric) AND ("percentage_pr" <= (1)::numeric))),
    CONSTRAINT "plan_routines_repetitions_check" CHECK (("repetitions" > 0)),
    CONSTRAINT "plan_routines_set_number_check" CHECK (("set_number" >= 1)),
    CONSTRAINT "plan_routines_week_check" CHECK (("week" >= 1))
);


ALTER TABLE "public"."plan_routines" OWNER TO "postgres";


ALTER TABLE "public"."plan_routines" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."plan_routines_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."plans" (
    "id" bigint NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "length_weeks" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "evaluation_week" integer,
    "is_system" boolean DEFAULT false NOT NULL,
    "slug" "text",
    CONSTRAINT "chk_evaluation_week_in_range" CHECK ((("evaluation_week" IS NULL) OR (("evaluation_week" >= 1) AND ("evaluation_week" <= "length_weeks")))),
    CONSTRAINT "plans_length_weeks_check" CHECK (("length_weeks" >= 1))
);


ALTER TABLE "public"."plans" OWNER TO "postgres";


ALTER TABLE "public"."plans" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."plans_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "username" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."v_active_cycles" AS
 SELECT "id",
    "user_id",
    "plan_id",
    "start_date",
    "end_date",
    "status",
    "created_at",
    "updated_at",
    "length_weeks" AS "total_weeks",
    LEAST((("floor"((((CURRENT_DATE - "start_date"))::numeric / 7.0)))::integer + 1), "length_weeks") AS "current_week",
    GREATEST(((("start_date" + ((("length_weeks" * 7))::double precision * '1 day'::interval)))::"date" - CURRENT_DATE), 0) AS "days_remaining",
        CASE
            WHEN ("status" = 'archived'::"text") THEN 'archived'::"text"
            WHEN ((CURRENT_DATE >= "start_date") AND (CURRENT_DATE <= ("start_date" + (("length_weeks" * 7) - 1)))) THEN 'active'::"text"
            ELSE 'completed'::"text"
        END AS "computed_status"
   FROM "public"."cycles" "c"
  WHERE (("status" = 'active'::"text") AND ("start_date" <= CURRENT_DATE) AND (CURRENT_DATE < (("start_date" + ((("length_weeks" * 7))::double precision * '1 day'::interval)))::"date"));


ALTER VIEW "public"."v_active_cycles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."workout_sets" (
    "id" bigint NOT NULL,
    "workout_id" bigint NOT NULL,
    "plan_routine_id" bigint NOT NULL,
    "set_number" integer NOT NULL,
    "scheduled_weight" numeric(8,2),
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "used_weight" numeric(8,2),
    CONSTRAINT "workout_sets_scheduled_weight_check" CHECK ((("scheduled_weight" IS NULL) OR ("scheduled_weight" >= (0)::numeric))),
    CONSTRAINT "workout_sets_set_number_check" CHECK (("set_number" >= 1)),
    CONSTRAINT "workout_sets_used_weight_check" CHECK (("used_weight" > (0)::numeric))
);


ALTER TABLE "public"."workout_sets" OWNER TO "postgres";


ALTER TABLE "public"."workout_sets" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."workout_sets_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."workouts" (
    "id" bigint NOT NULL,
    "cycle_movement_id" bigint NOT NULL,
    "week" integer NOT NULL,
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_evaluation" boolean DEFAULT false NOT NULL,
    CONSTRAINT "workouts_week_check" CHECK (("week" >= 1))
);


ALTER TABLE "public"."workouts" OWNER TO "postgres";


ALTER TABLE "public"."workouts" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."workouts_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "public"."cycle_movements"
    ADD CONSTRAINT "cycle_movements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cycles"
    ADD CONSTRAINT "cycles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."evaluation_results"
    ADD CONSTRAINT "evaluation_results_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."movement_types"
    ADD CONSTRAINT "movement_types_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."movement_types"
    ADD CONSTRAINT "movement_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."movements"
    ADD CONSTRAINT "movements_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."movements"
    ADD CONSTRAINT "movements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."plan_movements"
    ADD CONSTRAINT "plan_movements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."plan_routines"
    ADD CONSTRAINT "plan_routines_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."plans"
    ADD CONSTRAINT "plans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."plans"
    ADD CONSTRAINT "plans_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."cycle_movements"
    ADD CONSTRAINT "uq_cycle_movements" UNIQUE ("cycle_id", "movement_id");



ALTER TABLE ONLY "public"."cycles"
    ADD CONSTRAINT "uq_cycles_id_plan" UNIQUE ("id", "plan_id");



ALTER TABLE ONLY "public"."evaluation_results"
    ADD CONSTRAINT "uq_eval_results" UNIQUE ("cycle_movement_id");



ALTER TABLE ONLY "public"."plan_movements"
    ADD CONSTRAINT "uq_plan_movements" UNIQUE ("plan_id", "movement_id");



ALTER TABLE ONLY "public"."plan_movements"
    ADD CONSTRAINT "uq_plan_movements_plan_day" UNIQUE ("plan_id", "day_of_week") DEFERRABLE INITIALLY DEFERRED;



ALTER TABLE ONLY "public"."plan_routines"
    ADD CONSTRAINT "uq_plan_routines" UNIQUE ("plan_movement_id", "week", "set_number");



ALTER TABLE ONLY "public"."workout_sets"
    ADD CONSTRAINT "uq_workout_sets" UNIQUE ("workout_id", "plan_routine_id");



ALTER TABLE ONLY "public"."workouts"
    ADD CONSTRAINT "uq_workouts" UNIQUE ("cycle_movement_id", "week");



ALTER TABLE ONLY "public"."workout_sets"
    ADD CONSTRAINT "workout_sets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workouts"
    ADD CONSTRAINT "workouts_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_plan_routines_plan_movement_week" ON "public"."plan_routines" USING "btree" ("plan_movement_id", "week");



CREATE INDEX "idx_workout_sets_workout_completed" ON "public"."workout_sets" USING "btree" ("workout_id", "completed_at");



CREATE INDEX "idx_workouts_cycle_movement_week" ON "public"."workouts" USING "btree" ("cycle_movement_id", "week");



CREATE OR REPLACE TRIGGER "trg_cycle_movements_updated_at" BEFORE UPDATE ON "public"."cycle_movements" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_cycles_normalize_start_date" BEFORE INSERT ON "public"."cycles" FOR EACH ROW EXECUTE FUNCTION "public"."normalize_cycle_start_date"();



CREATE OR REPLACE TRIGGER "trg_cycles_updated_at" BEFORE UPDATE ON "public"."cycles" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_movement_types_updated_at" BEFORE UPDATE ON "public"."movement_types" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_movements_updated_at" BEFORE UPDATE ON "public"."movements" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_plan_movements_updated_at" BEFORE UPDATE ON "public"."plan_movements" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_plan_routines_updated_at" BEFORE UPDATE ON "public"."plan_routines" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_plans_updated_at" BEFORE UPDATE ON "public"."plans" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_protect_system_plan_mutation" BEFORE UPDATE ON "public"."plans" FOR EACH ROW EXECUTE FUNCTION "public"."protect_system_plan_mutation"();



CREATE OR REPLACE TRIGGER "trg_protect_system_plans" BEFORE DELETE ON "public"."plans" FOR EACH ROW EXECUTE FUNCTION "public"."protect_system_plans"();



CREATE OR REPLACE TRIGGER "trg_workout_sets_consistency" BEFORE INSERT OR UPDATE OF "workout_id", "plan_routine_id" ON "public"."workout_sets" FOR EACH ROW EXECUTE FUNCTION "public"."enforce_workout_set_consistency"();



CREATE OR REPLACE TRIGGER "trg_workout_sets_updated_at" BEFORE UPDATE ON "public"."workout_sets" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_workouts_updated_at" BEFORE UPDATE ON "public"."workouts" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



ALTER TABLE ONLY "public"."cycle_movements"
    ADD CONSTRAINT "cycle_movements_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "public"."cycles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cycle_movements"
    ADD CONSTRAINT "cycle_movements_movement_id_fkey" FOREIGN KEY ("movement_id") REFERENCES "public"."movements"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."cycles"
    ADD CONSTRAINT "cycles_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."cycles"
    ADD CONSTRAINT "cycles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."evaluation_results"
    ADD CONSTRAINT "evaluation_results_cycle_movement_id_fkey" FOREIGN KEY ("cycle_movement_id") REFERENCES "public"."cycle_movements"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cycle_movements"
    ADD CONSTRAINT "fk_cycle_movements_cycle_plan" FOREIGN KEY ("cycle_id", "plan_id") REFERENCES "public"."cycles"("id", "plan_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cycle_movements"
    ADD CONSTRAINT "fk_cycle_movements_plan_movement" FOREIGN KEY ("plan_id", "movement_id") REFERENCES "public"."plan_movements"("plan_id", "movement_id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."movements"
    ADD CONSTRAINT "movements_movement_type_id_fkey" FOREIGN KEY ("movement_type_id") REFERENCES "public"."movement_types"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."plan_movements"
    ADD CONSTRAINT "plan_movements_movement_id_fkey" FOREIGN KEY ("movement_id") REFERENCES "public"."movements"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."plan_movements"
    ADD CONSTRAINT "plan_movements_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."plan_routines"
    ADD CONSTRAINT "plan_routines_plan_movement_id_fkey" FOREIGN KEY ("plan_movement_id") REFERENCES "public"."plan_movements"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workout_sets"
    ADD CONSTRAINT "workout_sets_plan_routine_id_fkey" FOREIGN KEY ("plan_routine_id") REFERENCES "public"."plan_routines"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."workout_sets"
    ADD CONSTRAINT "workout_sets_workout_id_fkey" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workouts"
    ADD CONSTRAINT "workouts_cycle_movement_id_fkey" FOREIGN KEY ("cycle_movement_id") REFERENCES "public"."cycle_movements"("id") ON DELETE CASCADE;





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";














































































































































































GRANT ALL ON FUNCTION "public"."_create_cycle_internal"("p_user_id" "uuid", "p_plan_id" bigint, "p_start_date" "date", "p_pr_by_movement" "jsonb", "p_round_increment" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."_create_cycle_internal"("p_user_id" "uuid", "p_plan_id" bigint, "p_start_date" "date", "p_pr_by_movement" "jsonb", "p_round_increment" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."_create_cycle_internal"("p_user_id" "uuid", "p_plan_id" bigint, "p_start_date" "date", "p_pr_by_movement" "jsonb", "p_round_increment" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."create_cycle_with_workouts"("p_plan_id" bigint, "p_start_date" "date", "p_pr_by_movement" "jsonb", "p_round_increment" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."create_cycle_with_workouts"("p_plan_id" bigint, "p_start_date" "date", "p_pr_by_movement" "jsonb", "p_round_increment" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_cycle_with_workouts"("p_plan_id" bigint, "p_start_date" "date", "p_pr_by_movement" "jsonb", "p_round_increment" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."create_onboarding_cycle"("p_plan_id" bigint, "p_start_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."create_onboarding_cycle"("p_plan_id" bigint, "p_start_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_onboarding_cycle"("p_plan_id" bigint, "p_start_date" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_plan_with_movements"("p_description" "text", "p_cycle_length" integer, "p_cycle_dimension" "public"."cycle_dimension_enum", "p_start_date" "date", "p_end_date" "date", "p_movement_ids" "uuid"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."create_plan_with_movements"("p_description" "text", "p_cycle_length" integer, "p_cycle_dimension" "public"."cycle_dimension_enum", "p_start_date" "date", "p_end_date" "date", "p_movement_ids" "uuid"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_plan_with_movements"("p_description" "text", "p_cycle_length" integer, "p_cycle_dimension" "public"."cycle_dimension_enum", "p_start_date" "date", "p_end_date" "date", "p_movement_ids" "uuid"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."enforce_workout_set_consistency"() TO "anon";
GRANT ALL ON FUNCTION "public"."enforce_workout_set_consistency"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."enforce_workout_set_consistency"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_or_create_workout"("p_cycle_movement_id" bigint, "p_week" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_or_create_workout"("p_cycle_movement_id" bigint, "p_week" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_or_create_workout"("p_cycle_movement_id" bigint, "p_week" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."normalize_cycle_start_date"() TO "anon";
GRANT ALL ON FUNCTION "public"."normalize_cycle_start_date"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."normalize_cycle_start_date"() TO "service_role";



GRANT ALL ON FUNCTION "public"."protect_system_plan_mutation"() TO "anon";
GRANT ALL ON FUNCTION "public"."protect_system_plan_mutation"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."protect_system_plan_mutation"() TO "service_role";



GRANT ALL ON FUNCTION "public"."protect_system_plans"() TO "anon";
GRANT ALL ON FUNCTION "public"."protect_system_plans"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."protect_system_plans"() TO "service_role";



GRANT ALL ON FUNCTION "public"."round_to_increment"("p_value" numeric, "p_increment" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."round_to_increment"("p_value" numeric, "p_increment" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."round_to_increment"("p_value" numeric, "p_increment" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."round_to_next_plate"("p_raw_weight" numeric, "p_increment" numeric, "p_barbell" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."round_to_next_plate"("p_raw_weight" numeric, "p_increment" numeric, "p_barbell" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."round_to_next_plate"("p_raw_weight" numeric, "p_increment" numeric, "p_barbell" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_cycle_movement_pr"("p_workout_id" bigint, "p_cycle_movement_id" bigint, "p_pr" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."update_cycle_movement_pr"("p_workout_id" bigint, "p_cycle_movement_id" bigint, "p_pr" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_cycle_movement_pr"("p_workout_id" bigint, "p_cycle_movement_id" bigint, "p_pr" numeric) TO "service_role";
























GRANT ALL ON TABLE "public"."cycle_movements" TO "anon";
GRANT ALL ON TABLE "public"."cycle_movements" TO "authenticated";
GRANT ALL ON TABLE "public"."cycle_movements" TO "service_role";



GRANT ALL ON SEQUENCE "public"."cycle_movements_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."cycle_movements_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."cycle_movements_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."cycles" TO "anon";
GRANT ALL ON TABLE "public"."cycles" TO "authenticated";
GRANT ALL ON TABLE "public"."cycles" TO "service_role";



GRANT ALL ON SEQUENCE "public"."cycles_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."cycles_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."cycles_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."evaluation_results" TO "anon";
GRANT ALL ON TABLE "public"."evaluation_results" TO "authenticated";
GRANT ALL ON TABLE "public"."evaluation_results" TO "service_role";



GRANT ALL ON SEQUENCE "public"."evaluation_results_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."evaluation_results_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."evaluation_results_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."movement_types" TO "anon";
GRANT ALL ON TABLE "public"."movement_types" TO "authenticated";
GRANT ALL ON TABLE "public"."movement_types" TO "service_role";



GRANT ALL ON SEQUENCE "public"."movement_types_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."movement_types_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."movement_types_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."movements" TO "anon";
GRANT ALL ON TABLE "public"."movements" TO "authenticated";
GRANT ALL ON TABLE "public"."movements" TO "service_role";



GRANT ALL ON SEQUENCE "public"."movements_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."movements_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."movements_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."plan_movements" TO "anon";
GRANT ALL ON TABLE "public"."plan_movements" TO "authenticated";
GRANT ALL ON TABLE "public"."plan_movements" TO "service_role";



GRANT ALL ON SEQUENCE "public"."plan_movements_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."plan_movements_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."plan_movements_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."plan_routines" TO "anon";
GRANT ALL ON TABLE "public"."plan_routines" TO "authenticated";
GRANT ALL ON TABLE "public"."plan_routines" TO "service_role";



GRANT ALL ON SEQUENCE "public"."plan_routines_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."plan_routines_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."plan_routines_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."plans" TO "anon";
GRANT ALL ON TABLE "public"."plans" TO "authenticated";
GRANT ALL ON TABLE "public"."plans" TO "service_role";



GRANT ALL ON SEQUENCE "public"."plans_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."plans_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."plans_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."v_active_cycles" TO "anon";
GRANT ALL ON TABLE "public"."v_active_cycles" TO "authenticated";
GRANT ALL ON TABLE "public"."v_active_cycles" TO "service_role";



GRANT ALL ON TABLE "public"."workout_sets" TO "anon";
GRANT ALL ON TABLE "public"."workout_sets" TO "authenticated";
GRANT ALL ON TABLE "public"."workout_sets" TO "service_role";



GRANT ALL ON SEQUENCE "public"."workout_sets_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."workout_sets_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."workout_sets_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."workouts" TO "anon";
GRANT ALL ON TABLE "public"."workouts" TO "authenticated";
GRANT ALL ON TABLE "public"."workouts" TO "service_role";



GRANT ALL ON SEQUENCE "public"."workouts_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."workouts_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."workouts_id_seq" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";


