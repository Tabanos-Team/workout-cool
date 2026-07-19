# Bruno integration tests

This collection uses Bruno OpenCollection YAML files.

## Modules added

- `Premium Billing`: covers public premium plan discovery, timezone-based region detection, anonymous premium status behavior, billing auth boundary, checkout, and billing portal flows.
- `Analytics`: covers every accepted premium analytics event plus invalid event validation.

## Suggested execution order

1. Select an environment from `environments/`.
2. Run `Auth/Sign-in` when executing authenticated premium billing requests.
3. For public/anonymous premium billing checks, run `bru run 'Premium Billing' -r --exclude-tags authenticated --env 'QA Vercel'`.
4. For authenticated premium billing checks, run `Auth/Sign-in.yml` and the authenticated requests in the same `bru run` command so cookies are preserved.
5. Run the `Analytics` folder; these endpoints are public and do not require sign-in.

## Variables

- `URLBaseApi`: base API URL, already present in each environment.
- `PremiumProvider`: defaults to `stripe`.
- `PremiumRegion`: defaults to `LATAM`.
- `PremiumTimezone`: defaults to `America/Lima`.
- `PremiumPlanId`: populated automatically by `Get Premium Plans - LATAM` when plans exist.
- `BillingReturnUrl`: return URL sent to the billing portal endpoint.

## Notes for team review

The tests were derived from the Next.js route handlers in `workout-cool`:

- `app/api/premium/plans/route.ts`
- `app/api/premium/status/route.ts`
- `app/api/billing/status/route.ts`
- `app/api/premium/checkout/route.ts`
- `app/api/premium/billing-portal/route.ts`
- `app/api/analytics/premium/route.ts`

Assertions live in `runtime.scripts` with `type: tests`, which is the Bruno YAML format for executable test scripts.
