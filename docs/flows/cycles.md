# Cycles

A `cycle` identifies the period of time in which a user can complete the `workout sets` designated by a plan. The `workout sets` are defined using users' Personal Record (PR) configured for each `movement` in a specific `cycle`.

> The core idea of a cycle is that users improve their PR, so next cycle they can use more weight during the workouts.

- Users can have only one cycle `active` at a time.
- Users can have multiple cycles created in the past marked as `completed`.
- A cycle has an `start_date` that is aproximated to the last Monday of a week, for example:
  - If the cycle is created on Wednesday, the `start_date` will be set as Monday of the same week.
- A cycle `end_date` should be calculated based on the `start_date` and the `plan.week_length`. TODO: This can change now with the cycle creation
  > end_date = start_date + (plan.week_length \* 7)

## Lifecycle

### Creation

A `cycle` is created intentionally by a user, via the UI. When a `cycle` is created, the PRs for the `movements` of the `cycle` must be registered (these are used during the `workout sets` generation).

The creation of a `cycle` and the registration of the `movement`'s PR can vary, depending on the following cases:

| Case                                        | Expected Behavior                                                                                                     |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| User doesn't have results of previous cycle | `cycle` will be created and the `movements` for the cycle will be initialized without a max PR.                       |
| User have results of previous cycle         | `cycle` will be created and the `movements` for the cycle will be initialized with the results of the previous cycle. |

> TODO: Document how the results of a previous cycle are stored (mention what is an evaluation week on how is configured on a plan)

### Completion

A `cycle` will be marked as `complete` when its timeframe has passed (`end_date` has already passed). This is handled at system level, there is not user interaction to prevent inconsistencies.

## Technical Implementation

### Database Tables

The cycles are modeled at Database label with 2 tables:

- `cycles`: Stores the metadata of a cycle
- `cycle_movements`: Stores the movements for the current cycle, and the max PR.

### Database Views

### PostgreSQL

#### Creation

`cycles` are created via PostgreSQL functions to mantain data consistency. All the functions share the same core idea: "Insert a cycle into `cycle` and add the movements of the cycle to `cycle_movements`". The functions are the following:

- `create_onboarding_cycle`: Used when the user doesn't have any PR for the movements of the cycle.
- `create_cycle_with_workouts`: Used when the user have PR for the movements of the cycle.

#### Completion

A cron job handles the `cycle` completion. This is run every midnight, and validates that the exisiting active cycles are still `active`. In case the `end_date` has passed, the `cycle` should be marked as `completed`.
