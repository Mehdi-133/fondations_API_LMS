# FAL-42 — Learner quiz read verification

Verified locally on 23 October 2026 (Africa/Casablanca).

## Implemented contract

`GET /api/quizzes/:quizId` requires a learner token and active enrollment in
the quiz's course. The course and module must be published, the quiz active,
and the published module at order minus one completed if it exists. This
matches the existing module progression rule. Completed/cancelled enrollments
are currently rejected, following the existing active-enrollment access policy.

The response contains status, message and data. Quiz data explicitly includes
only `_id`, `moduleId`, `title`, `passingScore`, `isRequired`, `isActive` and
`questions`. Questions contain only `id`, `text` and `choices`; choices contain
only `id` and `text`. Correct answers remain in MongoDB for backend scoring.
Trainer POST/PATCH routes remain separate from this learner-only GET.

## Evidence

- Quiz suite: **32 tests passed**, including 12 learner-read cases.
- Full suite: **98 tests passed across 7 suites**, exit code 0, 22.374 seconds.
- Syntax and whitespace checks passed.
- Tests use real HTTP requests through Supertest and local MongoDB `lms_test`.
- Checks cover safe response fields, retained database answers, anonymous and
  trainer rejection, missing/cancelled/completed enrollment, unpublished
  course/module, inactive quiz, sequential unlocking, and missing/invalid IDs.

```powershell
$env:MONGO_TEST_URI = 'mongodb://127.0.0.1:27017/lms_test'
npm test -- --runTestsByPath tests/quiz.test.js
npm test
```

The existing environment supplies `JWT_SECRET`. Tests clean up their own data;
no application database reset is used.

## Remaining FAL-42 acceptance work

This verifies quiz reading, not attempt/result responses after submission.
No QuizAttempt model or attempt route was found in this checkout during this
check. Integrate with FAL-41/FAL-43 and prove their learner responses never
expose correct answers before closing the whole story. PR review/merge and
team acceptance remain separate. Docker rebuild and container checks were not
performed in this checkpoint.
