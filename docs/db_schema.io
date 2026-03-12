// Use DBML to define your database structure
// Docs: https://dbml.dbdiagram.io/docs

// Enforcements:
// plan_routines.week BETWEEN 1 AND plans.length_weeks
// plan_routines.percentage_pr > 0 AND percentage_pr <= 1
// plan_routines.repetitions > 0
// workouts.week BETWEEN 1 AND plans.length_weeks
// scheduled_weight >= 0

Table users {
  id integer [primary key]
  username varchar
  role varchar
  created_at timestampz
}

Table cycles {
  id integer [primary key]
  user_id integer [ref: > users.id, not null]
  start_date date [not null]
  plan_id integer [ref: > plans.id, not null]
  created_at timestampz
  updated_at timestampz
}

Table cycle_movements {
  id integer [primary key]
  cycle_id integer [ref: > cycles.id, not null]
  movement_id integer [ref: > movements.id, not null]
  max_pr numeric(8,2) [not null]
  created_at timestampz
  updated_at timestampz

  indexes {
    (cycle_id, movement_id) [unique]
  }
}

Table movement_types {
  id integer [primary key]
  name varchar [not null]
  created_at timestampz
  updated_at timestampz
}

Table movements {
  id integer [primary key]
  name varchar [not null]
  description varchar
  movement_type_id integer [ref: > movement_types.id, not null]
  created_at timestampz
  updated_at timestampz
}

Table plans {
  id integer [primary key]
  name varchar [not null]
  description varchar
  length_weeks integer [not null, note: '1,2,3 weeks']
  created_at timestampz
  updated_at timestampz
}

Table plan_movements {
  id integer [primary key]
  plan_id integer [ref: > plans.id, not null]
  movement_id integer [ref: > movements.id, not null]

  indexes {
    (plan_id, movement_id) [unique]
  }
}

Table plan_routines {
  id integer [primary key]
  week integer [not null]
  percentage_pr numeric(5,4) [not null]
  set_number integer [not null]
  repetitions integer [not null]
  plan_movement_id integer [ref: > plan_movements.id, not null]
  created_at timestampz
  updated_at timestampz

  indexes {
    (set_number, week, plan_movement_id) [unique]
  }
}

Table workouts {
  id integer [primary key]
  cycle_movement_id integer [ref: > cycle_movements.id, not null]
  week integer [not null]
  completed_at timestampz

  indexes {
    (cycle_movement_id, week) [unique]
  }

  Note: 'Add trigger to update completed_at once all the sets have been completed'
}

Table workout_sets {
  id integer [primary key]
  workout_id integer [ref: > workouts.id, not null]
  plan_routine_id integer [ref: > plan_routines.id, not null]
  scheduled_weight numeric(8,2) [not null]
  completed_at timestampz
  created_at timestampz
  updated_at timestampz

  indexes {
    (workout_id, plan_routine_id) [unique]
  }

  Note: 'Make sure this table is generated via procedure'
}
