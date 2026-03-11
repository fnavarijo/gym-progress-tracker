# Workouts

Workouts and Workout sets are created when the workout information is fetched. This is done via PostgresSQL function called `get_or_create_workout`.

The signature is the following:

```sql
--- params: p_cycle_movement_id, p_week
SELECT get_or_create_workout(1, 1);
```

## Dashboard

The dashboard presents to the user the movements they will need to complete during the current week. This information should come from the relation between cycles + cycles_movements + plan_movements.

The UI present the movement, the day to do it and should how the max_pr for that exercise.

On click and navigation to the Workout Sets page.

## Workout Sets

The workout sets can be accessed on `/progress/workout/:id`. When accessing this route, the `get_or_create_workout` function should be called. This will create the workout for the user and the workout sets for the current week.

### Sets on Evaluation week

If a user is in evaluation week, the sets progress UI (`/progress/workout/:id`) will change. During this week, instead of showing a list where the users taps to register if the set was complete or not, a list of inputs with the repetitions, the number of set and the expected percentage_pr should be shown.

On clicking "Save PR and Finish" 2 actions will happen:

- The workout_sets will be updated: The set should be marked as completed and the used_weight column should be set with the value entered by the user.
- A new entry on evaluation_results will be added. This table have the columns: id, cycle_movement_id, used_weight, evaluated_at (the time of submission). \*used weight is the value of the last repetition.
- Workout needs to be marked as completed.
