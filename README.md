# LMS API

A REST API for a learning management system. Trainers manage courses, modules and resources; learners enroll, consult resources, complete modules and track progress.

Built with Node.js, Express, MongoDB/Mongoose, JWT, bcrypt, Zod and Multer. Swagger UI provides interactive documentation. Jest and Supertest cover authentication, roles, enrollment and progress.

Frontend developers: start with the [React API contract](docs/react-api-contract.md)
for endpoint cards, authentication, response formats, demo setup and integration gaps.
Reviewers can use the [contract handoff](docs/react-api-contract-handoff.md)
for the backend comparison, verification evidence and remaining delivery steps.

## Local setup

Use Node.js 20 (the Dockerfile version), npm and MongoDB.

```powershell
npm ci
Copy-Item .env.example .env
```

If `.env` exists, keep it and update the needed values.

| Variable | Purpose |
| --- | --- |
| `PORT` | HTTP port; defaults to `3000` |
| `MONGO_URI` | Application database, e.g. `mongodb://localhost:27018/lms` |
| `JWT_SECRET` | Your own long random signing secret |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `1h` |
| `MONGO_TEST_URI` | Test database connection; test setup selects `lms_test` |

```powershell
npm run dev
```

Use `npm start` without automatic restarts. API: <http://localhost:3000>. Swagger UI: <http://localhost:3000/api-docs>.

## Docker

Configure `.env`, then run:

```powershell
docker compose up -d --build
```

Compose exposes the API on `3000` and MongoDB on host port `27018`. The container API uses `mongodb://mongo:27017/lms`. For Compass or a locally running API connecting to this database, use `mongodb://localhost:27018/lms`.

MongoDB data persists in `mongo_data`. The API has no source bind mount; rebuild after source or Swagger edits:

```powershell
docker compose up -d --build --no-deps api
```

Uploads have no configured Docker volume and can be lost when the API container is recreated. Stop services with `docker compose down`.

## Authentication and learning workflow

1. Register at `POST /api/auth/register` with `name`, `email` and `password` (at least eight characters). Registration creates a learner.
2. Log in at `POST /api/auth/login` with email and password.
3. Paste the returned token into Swagger's **Authorize** dialog. Protected requests use `Authorization: Bearer <token>`.
4. List published courses, enroll, then list published modules and resources.
5. Mark resources consulted before completing their module. Complete the published module at `order - 1` first when one exists.
6. Read course progress or resume information to calculate and save the enrollment percentage.

Trainer routes require an existing trainer account. There is no public role-promotion endpoint. The admin role exists but is not automatically allowed on trainer-only routes.

Progress gives each published module and each resource in those modules equal weight:

```text
percentage = (completed modules + consulted resources)
             / (published modules + their resources) * 100
```

The percentage is rounded to two decimals; an empty course has 0%. Reading progress or resume saves it and marks enrollment completed at 100%.

## Routes

Swagger describes request bodies, parameters, authentication and responses. Paths below include their full prefixes.

| Method | Path | Access / purpose |
| --- | --- | --- |
| POST | `/api/auth/register` | Public; create learner |
| POST | `/api/auth/login` | Public; obtain JWT |
| GET | `/api/auth/me` | Authenticated profile |
| GET | `/api/courses` | Public published catalogue; category, level, keyword and sortBy filters |
| GET | `/api/courses/:id` | Public course detail |
| POST | `/api/courses` | Trainer; create draft course |
| PUT, DELETE | `/api/courses/:id` | Owning trainer; update or delete |
| PATCH | `/api/courses/:id/:status` | Owning trainer; draft or published |
| GET | `/api/courses/:id/modules` | Active enrollment; published modules |
| POST | `/api/courses/:courseId/modules` | Trainer; create module |
| PUT, DELETE | `/api/courses/modules/:moduleId` | Trainer; update or delete module |
| PATCH | `/api/courses/modules/:moduleId/status/:status` | Owning trainer; module status |
| GET | `/api/modules/:id/resources` | Public resource list |
| POST | `/api/modules/:id/resources` | Trainer; create URL resource |
| PUT, DELETE | `/api/modules/:id/resources/:resourceId` | Trainer; update or delete resource |
| POST | `/api/modules/:id/resources/upload` | Owning trainer; PDF, JPEG or PNG up to 5 MiB |
| POST | `/api/courses/:courseId/enroll` | Authenticated; enroll in published course |
| GET | `/api/enrollments/me` | Authenticated; own enrollments |
| POST | `/api/modules/:resourceId/consult` | Active enrollment; record resource consultation |
| POST | `/api/modules/:moduleId/complete` | Active enrollment; complete module |
| GET | `/api/courses/:courseId/progress` | Active or completed enrollment; calculate progress |
| GET | `/api/courses/:courseId/resume` | Active or completed enrollment; current and next module |
| GET | `/api/trainer/courses` | Trainer; own courses, optional status filter |
| GET | `/api/trainer/courses/:courseId/learners` | Owning trainer; active and completed enrollments |
| GET | `/api/trainer/courses/:courseId/learners/:learnerId/progress` | Owning trainer; learner progress |

`GET /` and `GET /api/modules/test` are public diagnostic endpoints returning messages, not database health checks.

## Current behavior to know

- Module creation, update and deletion check the trainer role without course ownership. Creation does not check course existence. URL resource creation, update and deletion also check role without ownership.
- Module status updates require a complete module body because the route uses the creation validator, although the controller only changes status from the URL.
- Course deletion is blocked when modules or enrollments exist. Resource deletion is blocked when learner progress exists. Module deletion has no dependency check or cascade cleanup.
- Consultation, completion and module listing require active enrollment. Progress and resume also accept completed enrollment.
- The error handler accepts both `error.statusCode` and `error.status`. Expected progress/resume/trainer failures preserve their declared 403 or 404 status; unexpected server errors use a generic message. See [the draft error contract](docs/error-contract.md).
- Uploaded resource URLs are local storage paths; no file-download route is exposed.
- Response shapes vary: most wrap results in `data`, enrollment creation uses `enrollment`, and listing your enrollments returns an array directly.

## Tests

Tests require MongoDB and `JWT_SECRET`. They create and remove records in `lms_test`; use a development database server.

With Compose MongoDB running, in PowerShell:

```powershell
$env:MONGO_TEST_URI = "mongodb://localhost:27018/lms_test"
npm test
```

For standard local MongoDB use port `27017`. Run only enrollment tests with:

```powershell
npm test -- tests/enrollment.test.js
```

## Demo seed

`npm run seed` requires `SEED_DEMO_PASSWORD` (at least eight characters) and a
deliberately selected development `MONGO_URI`. It upserts demo learner, trainer
and admin accounts, resets their passwords, and replaces the matching demo
trainer's sample courses and related learning records. Course IDs can change
after a reset. It is not a required startup step and is not run automatically.
See [demo setup and replay](docs/react-api-contract.md#5-demo-setup-and-replay)
for account names, setup impact and current integration dependencies.

### Notification et jobs

La configuration des notifications et des tâches planifiées
est stockée dans MongoDB dans le document `NotificationConfig`
dont la clé est `global`.

Le driver email est configuré par `notifications.emailDriver`
avec les valeurs `log`, `sandbox` ou `smtp`.

Les tâches sont configurées individuellement avec `enabled`
et `frequency`. Le rappel des apprenants inactifs utilise
également `inactiveDays`.

## Project structure

```text
app.js          Express app, route mounting and Swagger UI
server.js       Database connection and HTTP server startup
config/         Database configuration
routes/         Endpoints, middleware ordering and Swagger comments
controllers/    Request handling and responses
services/       Progress, resume and trainer queries
models/         Mongoose documents and relationships
validators/     Zod request body schemas
middlewares/    Authentication, roles, enrollment, uploads and errors
docs/           Swagger setup, diagrams and workshop notes
tests/          Integration tests and helpers
seed/           Demo accounts and sample learning data
uploads/        Local uploaded files
```

Keep Swagger comments beside their route when changing an endpoint. `docs/swagger.js` collects `@swagger` blocks from `routes/*.js`. Restart the local API or rebuild its Docker image to refresh Swagger UI.
