# LearnStratum API & Server Actions Reference

This document outlines the API endpoints and Server Actions exposed by LearnStratum, including parameter schemas, return shapes, and error conventions.

---

## 1. REST & Streaming API Endpoints

### 1.1 In-Lesson Streaming AI Tutor: `POST /api/tutor`

Streams contextual pedagogical responses via Server-Sent Events (SSE).

- **Route:** `src/app/api/tutor/route.ts`
- **Authentication:** Supabase session cookie required.
- **Content-Type:** `application/json` (Request) $\rightarrow$ `text/event-stream` (Response)

#### Request Body
```typescript
interface TutorRequest {
  lessonId: string;
  message: string;
  history?: Array<{
    role: 'user' | 'model';
    parts: string;
  }>;
  context?: {
    lessonTitle: string;
    courseTitle?: string;
    moduleTitle?: string;
    objectives?: string[];
    mode?: 'general' | 'analogy' | 'code' | 'quiz';
  };
}
```

#### Response Stream Format
Server sends standard Server-Sent Events chunks:
```http
HTTP/1.1 200 OK
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive

data: {"chunk": "To understand "}

data: {"chunk": "backpropagation, imagine "}

data: [DONE]
```

#### Status Codes & Error Objects
- `200 OK`: Successful SSE stream connection.
- `401 Unauthorized`: User is not authenticated.
- `400 Bad Request`: Missing `message` or `lessonId`.
- `429 Too Many Requests`: Sliding-window rate limit exceeded.
- `500 Internal Server Error`: All Gemini model fallback tiers failed.

---

## 2. Server Actions

Server Actions are located in Next.js Server Components / Actions modules and called directly from Client Components via RPC.

### 2.1 Course Actions (`src/app/courses/actions.ts`)

#### `generateCourseOutline(params)`
Synthesizes a structured curriculum outline using Google Gemini.
```typescript
interface GenerateCourseParams {
  topic: string;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  weeklyHours: number;
  customGoals?: string;
}

// Return Shape:
interface GenerateCourseResult {
  success: boolean;
  curriculum?: GeneratedCurriculum;
  error?: string;
  creditsRemaining?: number;
}
```

#### `saveCourse(curriculum)`
Persists a confirmed curriculum tree (from the Syllabus Editor) into PostgreSQL.
```typescript
// Return Shape:
interface SaveCourseResult {
  success: boolean;
  courseId?: string;
  error?: string;
}
```

---

### 2.2 Lesson & Resource Actions (`src/app/courses/lesson-actions.ts`)

#### `harvestLessonResources(lessonId)`
Queries YouTube and Jina Reader / Tavily for the target lesson if resources have not already been gathered.
```typescript
// Return Shape:
interface HarvestResult {
  success: boolean;
  videoResources: LessonResource[];
  docResources: LessonResource[];
  error?: string;
}
```

#### `toggleLessonCompletion(lessonId, isCompleted)`
Updates the completed status of a lesson, logs an activity event, and awards `+50 XP`.
```typescript
// Return Shape:
interface CompletionResult {
  success: boolean;
  isCompleted: boolean;
  xpAwarded?: number;
  newBadges?: Badge[];
  error?: string;
}
```

---

### 2.3 Quiz Actions (`src/app/courses/quiz-actions.ts`)

#### `generateQuizForLesson(lessonId)`
Generates or retrieves cached knowledge questions for the lesson.
```typescript
// Return Shape:
interface QuizResult {
  success: boolean;
  questions?: QuizQuestion[];
  error?: string;
}
```

#### `submitQuizAnswers(lessonId, answers)`
Validates submitted choices, calculates percentage, logs submission, and awards XP.
```typescript
// Return Shape:
interface SubmitQuizResult {
  success: boolean;
  scorePercentage: number;
  correctCount: number;
  totalCount: number;
  xpAwarded: number;
  error?: string;
}
```

---

### 2.4 Flashcard & Spaced Repetition Actions (`src/app/courses/actions.ts`)

#### `generateFlashcardsForLesson(lessonId)`
Creates Anki-style active recall cards.
```typescript
// Return Shape:
interface FlashcardGenResult {
  success: boolean;
  cards?: Flashcard[];
  error?: string;
}
```

#### `submitFlashcardReview(flashcardId, grade)`
Applies the SuperMemo-2 algorithm to calculate next review timestamp based on grade (`0` to `5`).
```typescript
// Return Shape:
interface ReviewResult {
  success: boolean;
  nextReviewAt: string;
  intervalDays: number;
  easeFactor: number;
  xpAwarded: number;
  error?: string;
}
```

---

### 2.5 Course Sharing & Forking Actions (`src/app/courses/sharing-actions.ts`)

#### `toggleCoursePublic(courseId, isPublic, slug)`
Publishes or unpublishes a course to the community explore feed.
```typescript
// Return Shape:
interface ShareResult {
  success: boolean;
  slug?: string;
  isPublic: boolean;
  error?: string;
}
```

#### `forkCourse(courseId)`
Clones an existing public course into the calling user's workspace with new IDs and resets progress.
```typescript
// Return Shape:
interface ForkResult {
  success: boolean;
  forkedCourseId?: string;
  error?: string;
}
```

---

### 2.6 Certificate Actions (`src/app/courses/certificate-actions.ts`)

#### `generateCertificate(courseId)`
Verifies 100% completion of all lessons in the course, generates a 32-character SHA verification hash, and logs the certificate.
```typescript
// Return Shape:
interface CertificateResult {
  success: boolean;
  verificationHash?: string;
  certificateUrl?: string;
  error?: string;
}
```

---

### 2.7 Credits Actions (`src/app/credits/actions.ts`)

#### `getCreditState()`
Returns user credit balance, active plan, and recent transaction audit trail.
```typescript
// Return Shape:
interface CreditState {
  balance: number;
  plan: 'free' | 'pro';
  transactions: CreditTransaction[];
}
```

#### `submitPaymentRequest(packageId, method, phone, txRef)`
Submits a demo payment request (bKash, Nagad, Rocket) and tops up credits.
```typescript
// Return Shape:
interface PaymentResult {
  success: boolean;
  creditsAdded?: number;
  newBalance?: number;
  error?: string;
}
```

---

### 2.8 Gamification Actions (`src/app/gamification/actions.ts`)

#### `getUserGamificationState()`
Fetches total XP, current level, progress towards next level, active streak, and badge unlock statuses.
```typescript
// Return Shape:
interface UserGamificationState {
  rankInfo: RankInfo;
  badges: Array<Badge & { isUnlocked: boolean; unlockedAt: string | null }>;
  unlockedCount: number;
  totalCount: number;
}
```

---

### 2.9 Semantic Search Actions (`src/app/search/actions.ts`)

#### `searchContent(query)`
Converts query into vector embedding with `text-embedding-004` and queries PostgreSQL `pgvector`.
```typescript
// Return Shape:
interface SearchResult {
  success: boolean;
  results: Array<{
    id: string;
    type: 'lesson' | 'resource';
    title: string;
    snippet: string;
    courseTitle?: string;
    similarity: number;
    url: string;
  }>;
  isSemanticSearch: boolean;
  error?: string;
}
```
