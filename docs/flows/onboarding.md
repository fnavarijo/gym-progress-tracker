# Onboarding

All the new users won't have an active cycle after signup. To these users 2 options will be presented:

1. User already knows the max PR, an option on the dashboard will be shown and on click should take to /cycle/new screen.
2. If the user haven't done any exercise before, the onboarding cycle should be started.

## Onboarding cycle

The "Onboarding cycle" is a cycle created from the plan with `slug` equal to "onboarding". This is a system plan that will be always present. It's length in weeks is 1 and is the evaluation week. This is used for new users to register their max PR during the exercises of the week.

## API integration

PostgresSQL sql via Supabase client, expose a function called create_onboarding_cycle. This function creates a cycle, add the movements of the cycle based on the plan.

When user clicks on the CTA on "Start Evaluation Week", this function should be called with the parameters:

```sql
-- New user, no PRs yet
SELECT create_onboarding_cycle(<id_plan_onboarding>, '2026-03-10');
```

> The id_plan_onboarding should be fetched first

## Onboarding (Dashboard)

Once the cycle has been created, the workout information will be lazily creation. Check @docs/flows/workouts.md for more information.
