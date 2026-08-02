# Meal Planning Contract Notes

- `POST /api/weekly-plans/{weeklyPlanId}/shopping-list/items` accepts selected missing ingredients and returns `204`. The frontend sends the selected items and invalidates the household shopping-list query; it does not deduplicate or claim idempotency because the contract does not expose either guarantee.
- The preparation endpoint supports only planned meals with `source=RECIPE`. Its GET/POST responses are `PreparedBatchResponseDto`; participants and quantities remain backend-owned.
- Consumption linking is available through `POST /api/consumed-meals/{consumedMealId}/link`. No skip or cancel command exists for planned meals, so the UI only renders backend statuses and does not add unsupported actions.
- Adherence exposes typed counts, percentages and nutrition values. Opaque `breakdown.byDay` and `breakdown.byAdult` are intentionally not rendered.
- Planned meals have no planned-hour field. Home shows household-timezone date, meal type and position instead of inventing a time.
