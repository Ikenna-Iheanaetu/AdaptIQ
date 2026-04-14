# Topics — Data Layer Design Spec
**Date:** 2026-04-14
**Branch:** feature/topics
**Sprint scope:** Backend data side only — model, seeding, service, controller, DTOs. Frontend pages are next sprint.

---

## 1. Context

AdaptIQ needs a Topic entity as the foundation for quizzes. Before any quiz can be attached to a topic, the 6 topics must exist in the database and be queryable via API. This spec covers Sprint 1 of the topics feature: the data layer only.

---

## 2. The 6 Topics (seed data)

| Name | Description |
|---|---|
| Python | Beginner-friendly scripting and general-purpose programming |
| JavaScript | Web scripting, async patterns, and the DOM |
| Java | Object-oriented programming, JVM, and the Collections API |
| Databases | SQL, relational design, joins, and indexing |
| Data Structures & Algorithms | Arrays, trees, graphs, sorting, and complexity |
| Cloud Computing | AWS/GCP/Azure concepts, IaaS, PaaS, and serverless |

---

## 3. Model Changes

### 3.1 `Topic` entity — no changes
Current fields (`id`, `name`, `description`) are sufficient. Icon is derived on the frontend from the topic name (CDN lookup).

### 3.2 `UserTopicProgress` — add two fields
Add `bestScore` (int) and `lastQuizDate` (LocalDate). Hibernate `ddl-auto=update` adds the columns automatically. These are populated by the quiz sprint when attempts complete.

---

## 4. Seeding — DataInitializer

`@Component implements ApplicationRunner` in `config` package. On startup: if `topicRepository.count() > 0` return immediately (idempotent). Otherwise bulk-insert the 6 topics.

---

## 5. API Endpoints

| Method | Path | Auth | Returns |
|---|---|---|---|
| `GET` | `/api/v1/topics` | Bearer | `List<TopicResponse>` |
| `GET` | `/api/v1/topics/{id}` | Bearer | `TopicDetailResponse` |

---

## 6. DTOs

### `TopicResponse` (existing — no changes)
```json
{ "id": "uuid", "name": "Python", "description": "..." }
```

### `TopicDetailResponse` (new)
```json
{
  "id": "uuid",
  "name": "Python",
  "description": "...",
  "averageScore": 74,
  "bestScore": 90,
  "quizzesTaken": 5,
  "lastQuizDate": "2026-04-10",
  "recentAttempts": [
    { "attemptId": "uuid", "score": 85, "totalQuestions": 10, "completedAt": "2026-04-10T14:00:00" }
  ]
}
```
Fields default to 0 / null / empty list when no progress exists yet.

---

## 7. Service — `TopicService`

```
listTopics() → topicRepository.findAll() → map → List<TopicResponse>

getTopicDetail(UUID topicId, UUID userId)
  ├── topic = topicRepository.findById(topicId) or throw ResourceNotFoundException
  ├── progress = userTopicProgressRepository.findByUserIdAndTopicId(userId, topicId) (Optional)
  ├── recentAttempts = quizAttemptRepository.findTop5ByTopicIdAndUserIdOrderByCompletedAtDesc(topicId, userId)
  └── assemble TopicDetailResponse
```

---

## 8. Repository Changes

### `QuizAttemptRepository`
Add: `List<QuizAttempt> findTop5ByTopicIdAndUserIdOrderByCompletedAtDesc(UUID topicId, UUID userId)`

### `UserTopicProgressRepository`
Already has `findByUserIdAndTopicId` — no changes needed.

---

## 9. Next Sprint — Topics UI (handoff prompt)

```
NEXT SPRINT: Topics UI — feature/topics (Sprint 2)
===================================================
Backend data layer is complete. Two endpoints are live:
  GET /api/v1/topics        → List<TopicResponse>
  GET /api/v1/topics/{id}   → TopicDetailResponse

Build the following frontend work on feature/topics branch:

1. topicsApi.ts (frontend/src/api/topicsApi.ts)
   Replace the stub with:
   - getTopics(): Promise<TopicResponse[]>      → GET /topics
   - getTopicDetail(id): Promise<TopicDetailResponse> → GET /topics/:id
   Types: TopicResponse { id, name, description }
          TopicDetailResponse { id, name, description, averageScore, bestScore, quizzesTaken, lastQuizDate, recentAttempts: RecentAttemptDTO[] }
          RecentAttemptDTO { attemptId, score, totalQuestions, completedAt }

2. AppLayout (frontend/src/components/layout/AppLayout.tsx)
   Build out the navbar properly:
   - Left: "AdaptIQ" wordmark as NavLink to /dashboard
   - Nav links: Dashboard, Topics, History, Profile
   - Right: logout button (AuthContext.logout())
   - Use NavLink with className callback for active highlight
   - Background: surface-container-low (#eef0fa), active link: brand-primary (#004ac6)
   - No 1px solid borders — use background-color tier shifts

3. TopicLibraryPage (frontend/src/pages/TopicLibraryPage.tsx)
   - Page heading + subheading
   - Calls getTopics() on mount
   - Grid: 2 cols mobile, 3 cols desktop
   - Each card: topic image from devicons CDN mapped by topic name, name, description (2-line clamp)
   - Card click → navigate to /topics/:id
   - Loading skeleton + error state

4. TopicDetailPage (frontend/src/pages/TopicDetailPage.tsx)
   Implements PRD Screen 7:
   - Hero card: topic image, name, proficiency badge (Beginner <40 / Intermediate 40–74 / Advanced ≥75 based on averageScore), score ring (averageScore %)
   - Three mini-stats: quizzesTaken, bestScore, lastQuizDate
   - Quiz length selector: 10 / 15 / 20 buttons (local state, default 10)
   - "Start Quiz" CTA → navigate to /quiz/new?topicId=X&length=Y (quiz sprint wires this up)
   - Recent attempts table: Date | Score | Questions — last 5 rows, empty state if none
   - Loading skeleton

Brand colours: #004ac6 primary, #6a1edb tertiary, #f9f9ff surface, #eef0fa surface-container-low, #141b2b on-surface, #434655 on-surface-variant
Design rules: no 1px solid borders, no #000 shadows (tint with #141b2b), Inter font everywhere
```
