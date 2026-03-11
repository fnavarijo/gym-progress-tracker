Redefining cycle creation

When a cycle is created, multiple rows are created in different tables. For consistency, a PostgreSQL handles the creation and validation of this records.

Creating a cycle
Create a cycle means the following from a DB perspective:

- Create cycle instance. A new record is added to the cycle table which describes the cycle information like status, start_date, the user it belongs to and the plan that is based on.
- Add the movements that belongs to the cycle. A cycle contains different movements that will be tracked during user workouts and are used to track user progress. To track that progress we need to log an initial PR (max_pr) for each movement.

Workout creation
Once the cycle is created (We have identified when the cycle started and what are the movements for it), we need to create the workouts.
A workout is an instance of a plan routine, based on the user cycle.
A plan routine is the definition of what the user need to perform for a movement in an specific week.

The tables involved on the workout creation:

- Workouts: Metadata for a movement workout. It stores the week, the movement of the cycle and the date of completion.
- workout_sets: This logs all the repetitions with the number of sets and scheduled weight that a user needs to complete.
