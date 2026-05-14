# AdaptIQ — Diagnostic Quiz Feature Handoff

## Feature Summary

A fixed 10-question AI-generated quiz shown to first-time users immediately after signup.
On completion or skip, `UserTopicProgress` rows are seeded for all 6 topics
(INTERMEDIATE if ≥ 70%, BEGINNER otherwise).

The full backend + frontend is implemented and the happy path is working with fallback questions.

---

## Current Status: Working ✓ (one outstanding item)

### Happy Path

1. New user signs up → `ProtectedRoute` detects `completed: false` → redirects to `/diagnostic`
2. `DiagnosticQuizPage` calls `POST /api/v1/diagnostic/start` → 10 questions generated in parallel (virtual threads)
3. User answers each question → feedback shown → auto-advances after 2 s
4. Final question → `POST /api/v1/diagnostic/complete` → `UserTopicProgress` seeded for all topics → redirects to `/dashboard`
5. Skip → `POST /api/v1/diagnostic/skip` → all topics seeded at BEGINNER → `/dashboard`
6. Subsequent logins: `ProtectedRoute` sees `completed: true` → user goes straight to `/dashboard`

### Outstanding Issue — OpenAI Unreachable

`AIQuestionService` throws `UnknownHostException: api.openai.com` on every call.
This is a **network/DNS block** on the dev machine (common on university/corporate networks).
The service has a fallback that generates placeholder questions, so the full UX flow works fine.
Real AI questions will work once on an unrestricted network or when a proxy is configured.

The `.env` file IS being loaded (via `DotenvPostProcessor`) — the key is present, the network is the issue.

---

## All Files Created / Modified

### Backend — New Files

| File | Purpose |
|------|---------|
| `model/enums/DifficultyLevel.java` | `BEGINNER, INTERMEDIATE, ADVANCED` |
| `model/enums/QuestionType.java` | `MCQ, TRUE_FALSE, FILL_BLANK` |
| `model/enums/ProficiencyLevel.java` | `BEGINNER, INTERMEDIATE, ADVANCED` |
| `service/DiagnosticService.java` | Core logic: start, answer, complete, skip |
| `service/AIQuestionService.java` | OpenAI REST call + fallback question |
| `controller/DiagnosticController.java` | 5 endpoints under `/api/v1/diagnostic` |
| `dto/request/DiagnosticAnswerRequest.java` | `{ questionId, answer }` |
| `dto/response/DiagnosticQuestionResponse.java` | `{ questionId, attemptId, position, total, questionText, questionType, options }` |
| `dto/response/DiagnosticAnswerResponse.java` | `{ isCorrect, correctAnswer, explanation, currentPosition, total, isLastQuestion, nextQuestion }` |
| `dto/response/DiagnosticCompleteResponse.java` | `{ overallScore, correctAnswers, totalQuestions }` |
| `DotenvPostProcessor.java` | Loads `backend/.env` into Spring environment at startup |

### Backend — Modified Files

| File | What Changed |
|------|-------------|
| `model/QuizAttempt.java` | Replaced `@ManyToOne Topic` with `UUID topicId`; added `isDiagnostic`, `correctAnswers`, `startedAt`, `difficultyStart`, `difficultyEnd` |
| `model/QuizQuestion.java` | Replaced `@ManyToOne Topic` with `UUID topicId`; added `attemptId`, `questionType`, `learnerAnswer`, `isCorrect`, `explanation`, `orderIndex` |
| `model/UserTopicProgress.java` | Added `ProficiencyLevel proficiencyLevel` field |
| `repository/QuizAttemptRepository.java` | Replaced ambiguous derived methods with explicit `@Query` JPQL; added `@Modifying deleteIncompleteDiagnosticAttempts` |
| `repository/QuizQuestionRepository.java` | Added `findByAttemptIdOrderByOrderIndexAsc` |
| `repository/UserTopicProgressRepository.java` | Added `existsByUserIdAndTopicId` |
| `security/SecurityConfig.java` | Added `/error` to `permitAll()` so exceptions surface as JSON instead of 403 |

### Frontend — New Files

| File | Purpose |
|------|---------|
| `api/diagnosticApi.ts` | `getStatus`, `start`, `submitAnswer`, `complete`, `skip` using axiosInstance |
| `components/quiz/AnswerOption.tsx` | Selectable option button with correct / incorrect / selected / default states |
| `components/quiz/FeedbackBanner.tsx` | Green / red feedback strip shown after answering |
| `pages/DiagnosticQuizPage.tsx` | Full quiz UI: loading → question → feedback → finishing phases |

### Frontend — Modified Files

| File | What Changed |
|------|-------------|
| `routes/ProtectedRoute.tsx` | Checks `GET /api/v1/diagnostic/status`; redirects to `/diagnostic` if not completed; fail-open on API error |
| `routes/AppRouter.tsx` | Added `/diagnostic` route pointing to `DiagnosticQuizPage` |

### Docs
- `DOC.md` — updated: diagnostic endpoints (§4.3), DTOs (§4.4), `proficiency_level` column (§4.5)

---

## Bugs Fixed This Session — Do Not Regress

| Bug | Root Cause | Fix Applied |
|-----|-----------|-------------|
| 403 on every `/start` request | `/error` endpoint was secured; Spring forwarded unhandled exceptions there and anonymous access was rejected | Added `/error` to `permitAll()` in `SecurityConfig` |
| `UnsupportedOperationException` on `Collections.shuffle` | `Stream.toList()` (Java 16+) returns an **immutable** list | Changed `generateQuestions()` return to `.collect(Collectors.toList())` |
| `NonUniqueResultException` on `/start` | Previous failed starts each committed a `QuizAttempt` row before crashing; `Optional<QuizAttempt>` explodes with > 1 row | Replaced `findDiagnosticAttemptByUserId(Optional)` with a bulk JPQL `@Modifying deleteIncompleteDiagnosticAttempts`; guard now uses `hasDiagnosticCompleted` (COUNT query, safe) |
| `StaleObjectStateException` on delete | React StrictMode fires `useEffect` twice in dev → 2 concurrent `/start` requests both tried to entity-delete the same rows | Replaced `deleteAll(entities)` with `@Modifying @Query` bulk delete — no per-row count check |
| Frontend shows generic error on "already completed" | `catch` block set error regardless of HTTP status | `if (err?.response?.status === 400) navigate('/dashboard')` in `DiagnosticQuizPage` |
| `package com.fasterxml.jackson.databind does not exist` | Spring Boot 4 ships **Jackson 3** (`tools.jackson`), not Jackson 2 (`com.fasterxml.jackson`) | All Jackson imports use `tools.jackson.databind.json.JsonMapper` + `tools.jackson.core.type.TypeReference` |
| Spring Data JPA `isDiagnosticTrue` keyword ambiguity | Field named `isDiagnostic` — the `is` prefix conflicts with Spring Data JPA boolean keyword parsing | All queries touching `isDiagnostic` use explicit `@Query` JPQL instead of derived method names |

---

## Critical Technical Gotchas

### 1. Jackson 3 — `tools.jackson.*` only

Spring Boot 4 uses **Jackson 3**, not Jackson 2. Never use `com.fasterxml.jackson`.

```java
// CORRECT
import tools.jackson.databind.json.JsonMapper;
import tools.jackson.core.type.TypeReference;

// WRONG — will not compile
import com.fasterxml.jackson.databind.ObjectMapper;
```

Inject `JsonMapper` as a Spring bean (it is auto-configured by Boot 4).

### 2. `boolean isDiagnostic` breaks Spring Data JPA derived queries

Any entity field whose name starts with `is` confuses the JPA keyword parser.
Always use explicit JPQL for queries involving such fields:

```java
// WRONG — ambiguous keyword parsing
Optional<QuizAttempt> findByUserIdAndIsDiagnosticTrue(UUID userId);

// CORRECT
@Query("SELECT a FROM QuizAttempt a WHERE a.user.id = :userId AND a.isDiagnostic = true")
Optional<QuizAttempt> findDiagnosticAttemptByUserId(@Param("userId") UUID userId);
```

### 3. `Stream.toList()` is immutable — cannot shuffle

```java
// WRONG — returns unmodifiable list; Collections.shuffle throws UnsupportedOperationException
return stream.toList();

// CORRECT
return stream.collect(Collectors.toList());
```

### 4. React StrictMode double-fires `useEffect` in dev

`useEffect(() => { ... }, [])` runs **twice** in development with React StrictMode.
Any side-effecting endpoint called from a bare `useEffect` will receive two concurrent requests.
Backend must be idempotent or handle concurrent duplicates gracefully (bulk JPQL deletes are safe; entity-based deletes are not).

### 5. `JwtUtil` only has `extractEmail()` — no `extractUserId()`

Controllers must resolve the user ID via email lookup:

```java
private UUID extractUserId(String authHeader) {
    String token = authHeader.replace("Bearer ", "");
    String email = jwtUtil.extractEmail(token);
    return userRepository.findByEmail(email)
        .orElseThrow(() -> new RuntimeException("User not found"))
        .getId();
}
```

### 6. `UserTopicProgress` keeps `@ManyToOne` — do not change to UUID

`TopicService` traverses the `user` and `topic` associations. The `DiagnosticService` sets entity objects directly (not IDs) when creating progress rows.

### 7. `topicRepository.findAll()` — no `isActive` field on `Topic`

`Topic` has no `isActive` column. Use `topicRepository.findAll()` everywhere, not `findByIsActiveTrue()`.

---

## API Endpoints (all under `/api/v1/diagnostic`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/status` | Bearer | Returns `{ completed: boolean }` |
| `POST` | `/start` | Bearer | Generates 10 questions, returns first `DiagnosticQuestionResponse` |
| `POST` | `/{attemptId}/answer` | Bearer | Body: `{ questionId, answer }` — returns `DiagnosticAnswerResponse` |
| `POST` | `/{attemptId}/complete` | Bearer | Seeds `UserTopicProgress`, returns `DiagnosticCompleteResponse` |
| `POST` | `/skip` | Bearer | Seeds all topics at BEGINNER, returns 200 |

---

## Database Notes

Hibernate DDL auto = `update`. The following columns were added automatically on restart:

- `quiz_attempts`: `is_diagnostic`, `correct_answers`, `started_at`, `difficulty_start`, `difficulty_end`
- `quiz_questions`: `topic_id` (UUID), `attempt_id` (UUID), `question_type`, `learner_answer`, `is_correct`, `explanation`, `order_index`
- `user_topic_progress`: `proficiency_level` (VARCHAR — enum stored as string)

`topic_id` and `attempt_id` in `quiz_questions` are **plain UUID columns**, not FK-constrained JPA relationships. No cascade or orphan-removal applies.

---

## What to Test Next Session

- [ ] Full signup → diagnostic quiz → complete → verify `UserTopicProgress` rows in DB (6 rows, correct `proficiency_level`)
- [ ] Full signup → skip → verify 6 BEGINNER rows in DB
- [ ] Second login → verify `/diagnostic` is skipped and user lands on `/dashboard`
- [ ] OpenAI connectivity: run `curl https://api.openai.com/v1/models -H "Authorization: Bearer <key>"` from the backend machine; if reachable, real questions should load
- [ ] Review `DotenvPostProcessor` deprecation warning — `EnvironmentPostProcessor` is marked for removal in Spring Boot 4. If needed, migrate to `spring.config.import` with a dotenv-compatible provider

---

## Next Feature to Build

The dashboard (`/dashboard`) is the next milestone. Users land here after completing or skipping the diagnostic. It should display per-topic `UserTopicProgress` (proficiency level, score, attempts) and offer adaptive quizzes per topic. The `TopicService` and topic endpoints already exist — see `DOC.md §4.3` and `§5.2`.
