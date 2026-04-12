# AdaptIQ 🎓

**AI-powered adaptive learning for coding and tech.**
AdaptIQ personalises every quiz to your skill level in real time — getting harder when you're flying, easier when you're struggling — and shows you exactly where to focus next.

---

## What it does

Most coding platforms give everyone the same content in the same order. AdaptIQ is different. It uses an AI backend to generate quiz questions on the fly, adjusts difficulty based on your consecutive correct or incorrect answers, and builds a progress dashboard that surfaces your strongest topics, weakest areas, and recommended next steps — all without a single fixed curriculum.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js + Tailwind CSS + Vite |
| Backend | Spring Boot 3.2 (Java 17) |
| Database | PostgreSQL |
| ORM | Spring Data JPA + Hibernate |
| Auth | Spring Security + JWT |
| AI | OpenAI GPT-4o API |
| Frontend Hosting | Netlify |
| Backend Hosting | Railway |

---

## Project Structure

```
adaptiq/
├── adaptiq-frontend/     # React.js SPA
│   ├── src/
│   │   ├── api/          # Axios instance + API functions
│   │   ├── components/   # Reusable UI components
│   │   ├── context/      # Auth context
│   │   ├── hooks/        # Custom React hooks
│   │   ├── pages/        # One file per screen/route
│   │   ├── routes/       # Router setup + protected routes
│   │   └── utils/        # Helper functions
│   └── ...
└── adaptiq-backend/      # Spring Boot REST API
    └── src/main/java/com/adaptiq/
        ├── controller/   # REST endpoints
        ├── service/      # Business logic
        ├── repository/   # JPA repositories
        ├── model/        # JPA entities
        ├── dto/          # Request/response bodies
        ├── security/     # JWT filter + Spring Security config
        ├── config/       # CORS, OpenAI config
        └── exception/    # Custom exceptions + global handler
```

---

## Features (MVP)

- **Diagnostic quiz** on first sign-up — sets your starting proficiency per topic
- **Adaptive quizzes** — difficulty adjusts in real time based on consecutive answers
- **AI-generated questions** — fresh questions every session via OpenAI GPT-4o
- **Progress dashboard** — score over time, topic breakdown, streak tracker
- **Recommendation engine** — tells you what to study next based on your performance
- **6 topics at launch:** Python Fundamentals, JavaScript Basics, HTML & CSS, Data Structures & Algorithms, Databases & SQL, Git & Version Control
- **Email/password auth** with JWT — no third-party OAuth

---

## Getting Started

### Prerequisites

- Node.js 18+
- Java 17+
- Maven 3.9+
- PostgreSQL 15+
- An OpenAI API key

---

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/adaptiq.git
cd adaptiq
```

---

### 2. Set up the database

Create a PostgreSQL database called `adaptiq_db`:

```sql
CREATE DATABASE adaptiq_db;
```

---

### 3. Configure the backend

```bash
cd adaptiq-backend
cp .env.example .env
```

Open `.env` and fill in your values:

```
DB_USERNAME=postgres
DB_PASSWORD=yourpassword
JWT_SECRET=a_long_random_string_at_least_32_chars
OPENAI_API_KEY=sk-...
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_gmail_app_password
```

Run the backend:

```bash
./mvnw spring-boot:run
```

The API will be available at `http://localhost:8080`.

---

### 4. Configure the frontend

```bash
cd ../adaptiq-frontend
cp .env.example .env
```

The default `.env` already points to `http://localhost:8080/api/v1`. Change it if needed.

Install dependencies and run:

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## API Overview

All endpoints are prefixed with `/api/v1`. All protected routes require a `Authorization: Bearer <JWT>` header.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register with email + password |
| POST | `/auth/login` | Login, returns JWT |
| POST | `/auth/forgot-password` | Send password reset email |
| POST | `/auth/reset-password` | Reset password with token |
| GET | `/users/me` | Get current user profile |
| GET | `/topics` | List all topics with proficiency |
| GET | `/topics/:id` | Topic detail + learner stats |
| POST | `/quizzes/start` | Start a new quiz |
| GET | `/quizzes/:id/next-question` | Get next adaptive question |
| POST | `/quizzes/:id/answer` | Submit an answer |
| POST | `/quizzes/:id/complete` | Complete quiz, get summary |
| GET | `/quizzes/history` | All past quiz attempts |
| GET | `/progress/dashboard` | Full dashboard data |

---

## Data Models

| Table | Description |
|---|---|
| `users` | Learner accounts |
| `topics` | Available coding topics |
| `user_topic_progress` | Per-user proficiency score per topic |
| `quiz_attempts` | Individual quiz sessions |
| `quiz_questions` | Questions + answers per attempt |

---

## Environment Variables

### Backend (`adaptiq-backend/.env`)

| Variable | Description |
|---|---|
| `DB_USERNAME` | PostgreSQL username |
| `DB_PASSWORD` | PostgreSQL password |
| `JWT_SECRET` | Secret key for signing JWTs (min 32 chars) |
| `OPENAI_API_KEY` | Your OpenAI API key |
| `MAIL_USERNAME` | Gmail address for password reset emails |
| `MAIL_PASSWORD` | Gmail app password |

### Frontend (`adaptiq-frontend/.env`)

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Base URL of the Spring Boot API |

---

## Team

| Role | Responsibility |
|---|---|
| Frontend Developer(s) | React.js UI implementation |
| Backend Developer(s) | Spring Boot API + AI integration |
| UI/UX Designer(s) | Screens designed in Google Stitch |
| Diagram/Architecture | System diagrams (draw.io / Mermaid) |

---

## Licence

This project was built as a school project. All rights reserved by the team.
