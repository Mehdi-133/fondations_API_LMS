# FAL-186 - Current route documentation

Verified locally on 27 October 2026.

## Coverage

The generated OpenAPI 3.0 specification covers **53 operations across 39 paths**.
All mounted application routes are covered, including public health/diagnostic
routes and both `/api/jobs` and `/api/admin/jobs` aliases. `/api-docs` serves
the documentation UI and is not an application operation in the specification.

New annotations cover quizzes, attempts, feedback, notification configuration,
execution history, trainer preferences and manual jobs. Existing module-completion
documentation now includes the active mandatory-quiz requirement.

Shared request/response schemas live in `docs/openapiSchemas.js`. Route-specific
annotations stay beside their routes. Specification discovery uses absolute
paths so it does not depend on the process working directory.

## Verification

- OpenAPI validation and reference resolution passed.
- A route inventory test checks both directions: no undocumented mounted
  operations and no documented operations that are not mounted.
- Eight request examples pass their actual Zod validators.
- Public health examples and anonymous errors match real Supertest responses.
- Swagger UI returns HTTP 200.
- Documentation suite: **20 tests passed**.
- Full regression: **229 tests across 19 suites passed**.
- Whitespace checks passed. Application/router changes contain comments only;
  endpoint logic, authentication and validation behavior were not changed.

```powershell
npm test -- --runTestsByPath tests/swagger.test.js
npm test
```

Restart the API after documentation changes, then open
`http://localhost:3000/api-docs/`.

## Current behavior and remaining scope

The specification describes actual response envelopes, including config/message
responses that do not use the status/message/data format. It distinguishes safe
learner quiz responses from private trainer quiz responses.

Existing implementation boundaries are documented: attempt submission does not
apply quiz-read enrollment/publication/unlock checks; the config validator accepts
`smtp` although the email service implements only `log` and `sandbox`; deleting
configuration does not itself stop registered cron tasks. These were not fixed
as part of this documentation task.

The checks above do not constitute exhaustive schema validation of every success
payload or a browser interaction test of every Swagger request. Existing feature
tests provide separate behavior coverage. Future routes remain FAL-187. PR review,
merge and Jira completion are separate delivery steps.
