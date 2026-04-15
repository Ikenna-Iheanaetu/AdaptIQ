# AdaptIQ — Project Documentation

> **Keep this file current.** Every time a feature, endpoint, component, or config value is added or changed, update the relevant section here. See `CLAUDE.md` for the enforcement rule.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture Overview](#2-architecture-overview)
3. [Environment Setup](#3-environment-setup)
4. [Backend](#4-backend)
   - [Package Structure](#41-package-structure)
   - [Security Layer](#42-security-layer)
   - [API Endpoints](#43-api-endpoints)
   - [DTOs](#44-dtos)
   - [Data Model](#45-data-model)
   - [Exception Handling](#46-exception-handling)
   - [Configuration](#47-configuration)
5. [Frontend](#5-frontend)
   - [Directory Structure](#51-directory-structure)
   - [Routing](#52-routing)
   - [Auth Flow](#53-auth-flow)
   - [API Layer](#54-api-layer)
   - [Pages](#55-pages)
   - [Design System](#56-design-system)
6. [Auth Flow — End to End](#6-auth-flow--end-to-end)
7. [Testing](#7-testing)
8. [Environment Variables Reference](#8-environment-variables-reference)

---

## 1. Project Overview

AdaptIQ is an AI-powered adaptive learning platform for programming education. It delivers personalised diagnostics, adaptive quizzes, and growth analytics that evolve with the learner.

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript + Vite 8 |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Routing | React Router v7 |
| Package manager | pnpm |
| Backend | Java 21 + Spring Boot 4 |
| Security | Spring Security 6 + JWT (JJWT 0.12.3) |
| Database | PostgreSQL |
| ORM | Spring Data JPA / Hibernate |

---

## 2. Architecture Overview

```
Browser
  └── React SPA (Vite, port 5173)
        ├── Public routes  → Landing, Login, Signup
        └── Protected routes (JWT required)
              └── Dashboard, Topics, Quiz, Profile …

              ↕ HTTP/JSON  (Authorization: Bearer <jwt>)

Spring Boot API (port 8080)
  ├── /api/v1/auth/**   → public  (register, login)
  └── /api/v1/**        → guarded by JwtAuthFilter
        ├── /users/me
        └── (future: /topics, /quiz, /progress …)
```

All API responses follow a consistent JSON shape:
- **Success:** resource object or array
- **Error:** `{ "message": "Human-readable reason" }`
- **Validation error:** `{ "fieldName": "constraint message", …, "message": "Validation failed" }`

---

## 3. Environment Setup

### Prerequisites
- Java 21+
- Maven (bundled via `./mvnw`)
- Node 20+ and pnpm
- PostgreSQL 15+ running locally

### Backend — first-time setup

```bash
# 1. Create the database
psql -U postgres -c "CREATE DATABASE adaptiq_db;"

# 2. Set environment variables (or rely on defaults in application.properties)
export DB_USERNAME=postgres
export DB_PASSWORD=yourpassword
export JWT_SECRET=a_random_secret_at_least_32_chars

# 3. Start the API
cd backend && ./mvnw spring-boot:run
# → Listening on http://localhost:8080
```

### Frontend — first-time setup

```bash
cd frontend
pnpm install
pnpm dev
# → http://localhost:5173
```

---

## 4. Backend

### 4.1 Package Structure

```
com.adaptiq.adaptiq_backend
├── AdaptiqBackendApplication.java   Entry point
├── config/
│   ├── CorsConfig.java              CORS configuration (allowed origins)
│   └── DataInitializer.java         Seeds 6 topics on startup (idempotent)
├── controller/
│   ├── AuthController.java          POST /auth/register, POST /auth/login
│   ├── UserController.java          GET  /users/me
│   ├── TopicController.java         GET  /topics, GET /topics/{id}
│   └── DiagnosticController.java    GET /diagnostic/status, POST /diagnostic/start,
│                                    POST /diagnostic/{attemptId}/answer,
│                                    POST /diagnostic/{attemptId}/complete,
│                                    POST /diagnostic/skip
├── dto/
│   ├── request/
│   │   ├── LoginRequest.java        { email, password }
│   │   ├── RegisterRequest.java     { email, password (≥8), name }
│   │   └── DiagnosticAnswerRequest.java  { questionId, answer }
│   └── response/
│       ├── AuthResponse.java        { token, id, email, name }
│       ├── UserResponse.java        { id, email, name }
│       ├── TopicDetailResponse.java   Combined topic + progress + recent attempts
│       ├── RecentAttemptDTO.java      Nested DTO for recent quiz attempts
│       ├── DiagnosticQuestionResponse.java  { questionId, attemptId, position, total, questionText, questionType, options }
│       ├── DiagnosticAnswerResponse.java    { isCorrect, correctAnswer, explanation, currentPosition, total, isLastQuestion, nextQuestion }
│       └── DiagnosticCompleteResponse.java  { overallScore, correctAnswers, totalQuestions }
├── exception/
│   ├── BadRequestException.java     → HTTP 400
│   ├── ResourceNotFoundException.java → HTTP 404
│   └── GlobalExceptionHandler.java  @RestControllerAdvice
├── model/
│   ├── User.java                    JPA entity — users table
│   ├── Topic.java                   JPA entity — topics table
│   ├── QuizAttempt.java             JPA entity — quiz_attempts table (updated: topicId UUID, isDiagnostic, correctAnswers, startedAt, difficultyStart, difficultyEnd)
│   ├── QuizQuestion.java            JPA entity — quiz_questions table (updated: topicId UUID, attemptId, questionType, learnerAnswer, isCorrect, explanation)
│   ├── UserTopicProgress.java       JPA entity — user_topic_progress table (updated: + proficiencyLevel)
│   └── enums/
│       ├── DifficultyLevel.java     BEGINNER, INTERMEDIATE, ADVANCED
│       ├── QuestionType.java        MCQ, TRUE_FALSE, FILL_BLANK
│       └── ProficiencyLevel.java    BEGINNER, INTERMEDIATE, ADVANCED
├── repository/
│   ├── UserRepository.java          findByEmail, existsByEmail
│   ├── TopicRepository.java         (JpaRepository default)
│   ├── QuizAttemptRepository.java   findTop5ByTopicIdAndUserId…, findByUserIdAndIsDiagnosticTrue, existsByUserIdAndIsDiagnosticTrueAndCompletedAtIsNotNull
│   ├── QuizQuestionRepository.java  findByAttemptId
│   └── UserTopicProgressRepository.java  findByUserIdAndTopicId, existsByUserIdAndTopicId
├── security/
│   ├── JwtUtil.java                 generateToken / extractEmail / isTokenValid
│   ├── JwtAuthFilter.java           OncePerRequestFilter — validates Bearer token
│   ├── SecurityConfig.java          SecurityFilterChain, PasswordEncoder, AuthManager
│   └── UserDetailsServiceImpl.java  Loads UserDetails by email
└── service/
    ├── AuthService.java             register() and login() business logic
    ├── TopicService.java            listTopics(), getTopicDetail()
    ├── AIQuestionService.java       generateQuestion() via OpenAI GPT-4o; GeneratedQuestion record
    └── DiagnosticService.java       hasCompletedDiagnostic, startDiagnostic, submitAnswer, completeDiagnostic, skipDiagnostic
```

### 4.2 Security Layer

#### JWT Utility (`JwtUtil`)

| Method | Description |
|---|---|
| `generateToken(email)` | Creates a signed JWT with `sub=email`, valid for `jwt.expiration.ms` ms |
| `extractEmail(token)` | Parses claims and returns the `sub` field |
| `isTokenValid(token, email)` | Returns `true` if signature is valid, token is not expired, and email matches |

**Algorithm:** HMAC-SHA256 (`Keys.hmacShaKeyFor`). Secret is read as plain UTF-8 bytes from `jwt.secret` property (minimum 32 characters).

**Default expiration:** 30 days (`jwt.expiration.ms=2592000000`).

#### Request Filter (`JwtAuthFilter`)

Runs before `UsernamePasswordAuthenticationFilter` on every request:
1. Reads `Authorization: Bearer <token>` header — skips if absent.
2. Extracts email from token via `JwtUtil`.
3. Loads `UserDetails` via `UserDetailsServiceImpl`.
4. Validates token; if valid, sets `UsernamePasswordAuthenticationToken` in `SecurityContext`.
5. Any exception (invalid/expired token) is silently swallowed — the request continues unauthenticated and Spring Security's access rules handle the 401.

#### Security Config (`SecurityConfig`)

```
CSRF       → disabled (stateless JWT API)
CORS       → delegated to CorsConfig bean
Sessions   → STATELESS
Permit all → /api/v1/auth/**
Require auth → everything else
```

Beans provided: `PasswordEncoder` (BCrypt), `AuthenticationManager`.

#### CORS (`CorsConfig`)

Allowed origin read from `cors.allowed-origins` property (default: `http://localhost:5173`).
Uses `setAllowedOriginPatterns` (not `setAllowedOrigins`) to work correctly with `allowCredentials=true`.

### 4.3 API Endpoints

#### Authentication — public, no token required

| Method | Path | Request body | Success response |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | `RegisterRequest` | `201 Created` + `AuthResponse` |
| `POST` | `/api/v1/auth/login` | `LoginRequest` | `200 OK` + `AuthResponse` |

#### Users — requires `Authorization: Bearer <token>`

| Method | Path | Response |
|---|---|---|
| `GET` | `/api/v1/users/me` | `200 OK` + `UserResponse` |

#### Topics — requires `Authorization: Bearer <token>`

| Method | Path | Response |
| --- | --- | --- |
| `GET` | `/api/v1/topics` | `200 OK` + `List<TopicResponse>` |
| `GET` | `/api/v1/topics/{id}` | `200 OK` + `TopicDetailResponse` |

#### Diagnostic — requires `Authorization: Bearer <token>`

| Method | Path | Request body | Response |
| --- | --- | --- | --- |
| `GET` | `/api/v1/diagnostic/status` | — | `200 OK` + `{ "completed": boolean }` |
| `POST` | `/api/v1/diagnostic/start` | — | `200 OK` + `DiagnosticQuestionResponse` (first question) |
| `POST` | `/api/v1/diagnostic/{attemptId}/answer` | `DiagnosticAnswerRequest` | `200 OK` + `DiagnosticAnswerResponse` |
| `POST` | `/api/v1/diagnostic/{attemptId}/complete` | — | `200 OK` + `DiagnosticCompleteResponse` |
| `POST` | `/api/v1/diagnostic/skip` | — | `200 OK` + `{ "message": "Diagnostic skipped." }` |

### 4.4 DTOs

#### `LoginRequest`
```json
{ "email": "user@example.com", "password": "mypassword" }
```
Constraints: `email` must be valid format; `password` must not be blank.

#### `RegisterRequest`
```json
{ "email": "user@example.com", "password": "mypassword", "name": "Jane Doe" }
```
Constraints: valid email; password ≥ 8 characters; name not blank.

#### `AuthResponse` (register + login success)
```json
{
  "token": "<jwt>",
  "id":    "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "name":  "Jane Doe"
}
```

#### `UserResponse` (GET /me)
```json
{
  "id":    "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "name":  "Jane Doe"
}
```

#### Error response (all 4xx)
```json
{ "message": "Human-readable reason" }
```
Validation errors also include per-field entries:
```json
{ "password": "Password must be at least 8 characters", "message": "Validation failed" }
```

#### `TopicResponse`

```json
{ "id": "uuid", "name": "Python", "description": "Beginner-friendly scripting and general-purpose programming" }
```

#### `TopicDetailResponse`

```json
{
  "id": "uuid",
  "name": "Python",
  "description": "Beginner-friendly scripting and general-purpose programming",
  "averageScore": 74,
  "bestScore": 90,
  "quizzesTaken": 5,
  "lastQuizDate": "2026-04-10",
  "recentAttempts": [
    { "attemptId": "uuid", "score": 85, "totalQuestions": 10, "completedAt": "2026-04-10T14:00:00" }
  ]
}
```

Fields default to `0` / `null` / `[]` when the user has no progress on that topic.

#### `DiagnosticAnswerRequest`

```json
{ "questionId": "uuid", "answer": "Functions" }
```

#### `DiagnosticQuestionResponse`

```json
{
  "questionId": "uuid",
  "attemptId": "uuid",
  "position": 1,
  "total": 10,
  "questionText": "What is a function in Python?",
  "questionType": "MCQ",
  "options": ["Variable", "Loop", "Function", "Class"]
}
```

#### `DiagnosticAnswerResponse`

```json
{
  "isCorrect": true,
  "correctAnswer": "Function",
  "explanation": "A function is a reusable block of code.",
  "currentPosition": 1,
  "total": 10,
  "isLastQuestion": false,
  "nextQuestion": { }
}
```

#### `DiagnosticCompleteResponse`

```json
{ "overallScore": 70, "correctAnswers": 7, "totalQuestions": 10 }
```

### 4.5 Data Model

#### `users` table

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | Primary key, generated |
| `email` | VARCHAR | NOT NULL, UNIQUE |
| `password` | VARCHAR | NOT NULL (BCrypt hash) |
| `name` | VARCHAR | nullable |

Schema is managed by `spring.jpa.hibernate.ddl-auto=update` — Hibernate creates/alters tables automatically. Set to `validate` or `none` in production.

#### `topics` table

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | Primary key, generated |
| `name` | VARCHAR | NOT NULL |
| `description` | VARCHAR | nullable |

Seeded on startup by `DataInitializer` with 6 topics: Python, JavaScript, Java, Databases, Data Structures & Algorithms, Cloud Computing.

#### `user_topic_progress` table

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | Primary key, generated |
| `user_id` | UUID | FK → users |
| `topic_id` | UUID | FK → topics |
| `score` | INT | average score |
| `attempts` | INT | total quizzes taken |
| `best_score` | INT | highest score achieved |
| `last_quiz_date` | DATE | date of most recent attempt |
| `proficiency_level` | VARCHAR | `BEGINNER`, `INTERMEDIATE`, or `ADVANCED` (stored as enum string) |

### 4.6 Exception Handling

All exceptions are handled in `GlobalExceptionHandler` (`@RestControllerAdvice`):

| Exception | HTTP status | Response body |
|---|---|---|
| `ResourceNotFoundException` | 404 | `{"message": "..."}` |
| `BadRequestException` | 400 | `{"message": "..."}` |
| `MethodArgumentNotValidException` | 400 | `{"fieldName": "msg", ..., "message": "Validation failed"}` |

`BadRequestException` is used for business-level errors (duplicate email, wrong password). Login errors are always generic — `"Invalid email or password"` — regardless of whether email or password was wrong, to prevent user enumeration.

### 4.7 Configuration

All config lives in `backend/src/main/resources/application.properties`. Sensitive values are injected via environment variables with fallback defaults (safe for local dev only):

| Property | Env var | Default | Notes |
|---|---|---|---|
| `spring.datasource.url` | — | `jdbc:postgresql://localhost:5432/adaptiq_db` | |
| `spring.datasource.username` | `DB_USERNAME` | `postgres` | |
| `spring.datasource.password` | `DB_PASSWORD` | `password` | **Change in prod** |
| `jwt.secret` | `JWT_SECRET` | `changeme_use_...` | Must be ≥ 32 chars in prod |
| `jwt.expiration.ms` | — | `2592000000` | 30 days |
| `cors.allowed-origins` | — | `http://localhost:5173` | Comma-separate for multiple |
| `openai.api.key` | `OPENAI_API_KEY` | placeholder | Required for AI features |
| `spring.mail.username` | `MAIL_USERNAME` | placeholder | Required for password reset |
| `spring.mail.password` | `MAIL_PASSWORD` | placeholder | Gmail app password |

---

## 5. Frontend

### 5.1 Directory Structure

```
frontend/src/
├── api/
│   ├── axiosInstance.ts     Axios base config + auth interceptors
│   ├── authApi.ts           login(), register(), getMe()
│   ├── progressApi.ts       (stub)
│   ├── quizApi.ts           (stub)
│   └── topicsApi.ts         (stub)
├── components/
│   ├── landing/             HeroSection, HowItWorksSection, TopicsSection, CtaFooter, ParticleCanvas
│   ├── layout/              AppLayout (authenticated shell + navbar)
│   └── ui/                  shadcn/ui primitives (button, card, input, …)
├── context/
│   └── AuthContext.tsx      Auth state, token storage, user hydration
├── hooks/
│   ├── useAuth.ts           Re-export of useAuth from AuthContext
│   ├── useProgress.ts       (stub)
│   └── useQuiz.ts           (stub)
├── pages/
│   ├── LandingPage.tsx      Public — assembled from landing/ components
│   ├── LoginPage.tsx        Public — login form
│   ├── SignupPage.tsx        Public — signup form
│   ├── ForgotPasswordPage.tsx  Public — (stub)
│   ├── ResetPasswordPage.tsx   Public — (stub)
│   ├── DiagnosticQuizPage.tsx  Protected — first-time assessment
│   ├── DashboardPage.tsx       Protected — main hub
│   ├── TopicLibraryPage.tsx    Protected
│   ├── TopicDetailPage.tsx     Protected
│   ├── QuizPage.tsx            Protected
│   ├── QuizSummaryPage.tsx     Protected
│   ├── QuizHistoryPage.tsx     Protected
│   └── ProfilePage.tsx         Protected
├── routes/
│   ├── AppRouter.tsx        All route definitions
│   └── ProtectedRoute.tsx   Auth guard — redirects to /login if no token
├── constants/
│   └── index.ts             API_BASE_URL, TOKEN_KEY
├── lib/
│   └── utils.ts             cn() Tailwind class merger
└── utils/
    ├── formatDate.ts
    └── scoreHelpers.ts
```

### 5.2 Routing

| Path | Component | Auth required |
|---|---|---|
| `/` | `LandingPage` | No |
| `/login` | `LoginPage` | No |
| `/signup` | `SignupPage` | No |
| `/forgot-password` | `ForgotPasswordPage` | No |
| `/reset-password` | `ResetPasswordPage` | No |
| `/diagnostic` | `DiagnosticQuizPage` | Yes |
| `/dashboard` | `DashboardPage` (AppLayout) | Yes |
| `/topics` | `TopicLibraryPage` (AppLayout) | Yes |
| `/topics/:topicId` | `TopicDetailPage` (AppLayout) | Yes |
| `/history` | `QuizHistoryPage` (AppLayout) | Yes |
| `/profile` | `ProfilePage` (AppLayout) | Yes |
| `/quiz/:attemptId` | `QuizPage` | Yes |
| `/quiz/:attemptId/summary` | `QuizSummaryPage` | Yes |
| `*` | Redirect to `/` | — |

`ProtectedRoute` reads `token` from `AuthContext`. While `loading=true` it renders nothing. If no token it redirects to `/login`.

### 5.3 Auth Flow

#### Token storage
JWT is stored in `localStorage` under the key `adaptiq_token`.

#### `AuthContext` (`src/context/AuthContext.tsx`)

Provides `{ user, token, login, logout, loading }` to the entire app.

| Function | Behaviour |
|---|---|
| On mount | If a token exists in localStorage, calls `GET /api/v1/users/me` to re-hydrate `user` state. Sets `loading=false` when done. |
| `login(token, user)` | Persists token to localStorage, sets state. |
| `logout()` | Removes token from localStorage, clears state. |
| 401 response | The Axios interceptor in `axiosInstance.ts` removes the token from localStorage and hard-redirects to `/login` before the catch handler in AuthContext runs. |

#### `axiosInstance` (`src/api/axiosInstance.ts`)

- Base URL: `VITE_API_BASE_URL` env var, defaults to `http://localhost:8080/api/v1`
- **Request interceptor:** reads `adaptiq_token` from localStorage and adds `Authorization: Bearer <token>` header.
- **Response interceptor:** on 401, removes the token and redirects to `/login`.

### 5.4 API Layer

All API functions live in `src/api/authApi.ts` and return typed promises via `axiosInstance`.

```typescript
// Types
interface LoginPayload    { email: string; password: string; }
interface RegisterPayload { name: string; email: string; password: string; }
interface AuthApiResponse { token: string; id: string; email: string; name: string; }
interface UserApiResponse { id: string; email: string; name: string; }

// Functions
login(data: LoginPayload)      → Promise<AuthApiResponse>
register(data: RegisterPayload) → Promise<AuthApiResponse>
getMe()                         → Promise<UserApiResponse>
```

Error handling pattern in pages:
```typescript
const errData = (err as { response?: { data?: { message?: string } } })?.response?.data;
setApiError(errData?.message ?? 'Fallback error message');
```

### 5.5 Pages

#### `LoginPage`
- Split-panel layout (left = brand, right = form)
- Fields: `email`, `password` (with show/hide toggle)
- Zod schema: valid email + password not blank
- On success: calls `login()`, shows toast, navigates to `/dashboard`
- On failure: displays inline error banner with `{"message"}` from API

#### `SignupPage`
- Split-panel layout (left = brand + feature list, right = form)
- Fields: `name`, `email`, `password` (with show/hide toggle), `terms` checkbox
- Zod schema: name ≥ 2 chars, valid email, password ≥ 8 chars, terms must be checked
- Live password strength indicator (Weak / Fair / Strong / Very Strong)
- On success: calls `login()`, shows toast, navigates to `/diagnostic`
- On failure: displays inline error banner

### 5.6 Design System

Full spec in `docs/superpowers/specs/` and `frontend/src/index.css`.

#### Key brand colours used in auth pages

| Hex | Role |
|---|---|
| `#004ac6` | Primary actions, links |
| `#2563eb` | Button gradient end |
| `#6a1edb` | Tertiary / signup left panel |
| `#00174b` | Login left panel gradient start |
| `#f9f9ff` | App background |
| `#f1f3ff` | Input background (surface-container-low) |
| `#dce2f7` | Input focus background (surface-container-highest) |
| `#141b2b` | Primary text (on-surface) |
| `#434655` | Secondary text (on-surface-variant) |
| `#737686` | Placeholder / muted (outline) |
| `#ba1a1a` | Error text |
| `#ffdad6` | Error banner background |

#### Layout rules
- No 1px solid borders for layout — use background-color shifts
- No `#000000` shadows — tint with `#141b2b`
- Glassmorphism: `rgba(255,255,255,0.12)` + `backdrop-filter: blur(20px)`
- Inter font for all UI; monospace only for code blocks

---

## 6. Auth Flow — End to End

```
User fills LoginPage form
  │
  ├─ Zod validates client-side → shows field errors if invalid
  │
  └─ POST /api/v1/auth/login  { email, password }
        │
        ├─ 400 Bad Request → { "message": "Invalid email or password" }
        │     └── LoginPage shows inline error banner
        │
        └─ 200 OK → { token, id, email, name }
              │
              ├─ AuthContext.login(token, user) — writes to localStorage + state
              ├─ toast.success("Welcome back, Name!")
              └─ navigate("/dashboard")
                    │
                    └─ ProtectedRoute checks token → renders DashboardPage


User refreshes the browser (any protected page)
  │
  └─ AuthProvider mounts → token found in localStorage
        │
        └─ GET /api/v1/users/me  (Authorization: Bearer <token>)
              │
              ├─ 200 OK → sets user state, loading=false → renders page
              │
              └─ 401 Unauthorized → axiosInstance removes token, redirects /login
```

---

## 7. Testing

### Backend

| Test class | Type | Location |
|---|---|---|
| `AuthServiceTest` | Unit (Mockito) | `src/test/…/service/AuthServiceTest.java` |
| `AuthControllerTest` | Slice (`@WebMvcTest`) | `src/test/…/controller/AuthControllerTest.java` |

Run all backend tests:
```bash
cd backend && ./mvnw test
```

Run a single class:
```bash
cd backend && ./mvnw test -Dtest=AuthServiceTest
```

`src/test/resources/application.properties` excludes datasource and JPA auto-config so context tests pass without a running database.

### Frontend

No tests yet. Planned: Vitest + React Testing Library for component tests.

---

## 8. Environment Variables Reference

| Variable | Where used | Description |
|---|---|---|
| `DB_USERNAME` | Backend | PostgreSQL username (default: `postgres`) |
| `DB_PASSWORD` | Backend | PostgreSQL password (default: `password`) |
| `JWT_SECRET` | Backend | HMAC-SHA256 signing key — must be ≥ 32 chars in production |
| `OPENAI_API_KEY` | Backend | Key for AI-powered features |
| `MAIL_USERNAME` | Backend | Gmail address for password-reset emails |
| `MAIL_PASSWORD` | Backend | Gmail app password |
| `VITE_API_BASE_URL` | Frontend | Backend base URL (default: `http://localhost:8080/api/v1`) |

---

*Last updated: 2026-04-14 — covers authentication (feature/authentication) and topics data layer (feature/topics).*
