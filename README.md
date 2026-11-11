# ScholaFlow

[![TanStack Start](https://img.shields.io/badge/TanStack_Start-1.168-orange)](https://tanstack.com/start)
[![React](https://img.shields.io/badge/React-19.2-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://www.postgresql.org/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.45-C5F74F?logo=drizzle)](https://orm.drizzle.team/)
[![Supabase](https://img.shields.io/badge/Supabase-Storage_%26_Realtime-3ECF8E?logo=supabase)](https://supabase.com/)
[![Better Auth](https://img.shields.io/badge/Better_Auth-1.7-purple)](https://www.better-auth.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An open-source Learning Management System (LMS) built for structured academic workflows, real-time classroom collaboration, and streamlined assignment management.

![ScholaFlow Overview](https://github.com/user-attachments/assets/413b1771-8ca9-49fb-8d79-9d446430334f)

---

## 1. Overview & Key Capabilities

ScholaFlow is a self-hostable learning platform designed to streamline instructional coordination between educators and students. Built with TanStack Start, React 19, TypeScript, Drizzle ORM, and Supabase, it provides a performant alternative to traditional classroom software while keeping infrastructure requirements transparent and customizable.

> **Live Demo Classroom**  
> Join the live staging instance to explore ScholaFlow directly:  
> **Class Code:** `ebeqdca9`  
> **Direct Link:** [https://scholaflow.vercel.app/join-class/ebeqdca9](https://scholaflow.vercel.app/join-class/ebeqdca9)

### Core Capabilities

- **Course Lifecycle & Enrollment:** Teachers can provision courses with distinct color themes, metadata (subject, room, section), and unique 8-character joining codes. Students can enroll via one-click invitation links or by entering join codes.
- **Stream & Publishing Engine:** Supports five distinct stream content categories: Announcements (`stream`), `assignment`, `quiz`, `question`, and `material`. Features include scheduled publishing, topic classification, item pinning, and granular target delivery (publish to all enrolled students or select individuals).
- **Assignment & Submission Pipeline:** Complete student submission workflow with document attachments, hyperlinks, turn-in timestamp tracking, and late-submission cutoff toggles (`closeSubmissionsAfterDueDate`). Teachers review submissions, input rubric scores, provide feedback with embedded media, and return graded work.
- **Class Chat:** Group communication per class with image attachments. Messages refresh every few seconds; when the `chat` table has row-level-security policies that allow it, Supabase Realtime change events refresh them instantly.
- **Lexical Rich-Text Integration:** Embedded Meta Lexical editor supporting rich text styling, lists, code blocks, quote formatting, hyperlinks, and multi-file attachment management.
- **Personal Productivity Workspace:** User-isolated personal notes engine supporting rich-text formatting, pinning, and storage uploads, alongside an automated **To-Do** dashboard that aggregates assignments across all enrolled classes by status: _Assigned_, _Missing_, and _Completed_.
- **Granular Role-Based Access Control (RBAC):** Native `user` and `admin` roles, structured instructor verification requests, and administrative directories for user auditing and account de-provisioning.

---

## 2. Architecture / How it Works

ScholaFlow is a TanStack Start application: file-based routes guard access in `beforeLoad`, prefetch data in `loader`s into TanStack Query, and render on the server with Nitro. Mutations go through TanStack Start server functions validated against Zod contracts and persisted via Drizzle ORM. Binary object storage and (optionally) realtime change events are offloaded to Supabase, and transactional email is sent server-side with nodemailer over SMTP.

### System Architecture Flow

```mermaid
flowchart TD
    subgraph Client ["Client Layer (Browser / PWA)"]
        UI["React 19 UI / Radix UI / Tailwind CSS 4"]
        TQ["TanStack Query (Client Cache & State)"]
        Router["TanStack Router (Loaders & Guards)"]
        Lex["Lexical Rich Text Editor"]
        AuthClient["Better Auth Client"]
    end

    subgraph Server ["Application Layer (TanStack Start on Nitro)"]
        AuthRoute["Auth API Route (/api/auth/$)"]
        ServerFns["Server Functions (src/server/functions)"]
        ZodValidation["Zod Schema Validation (src/lib/schema)"]
        Services["Data Services (src/services)"]
        AuthEngine["Better Auth Engine (src/lib/auth.ts)"]
        Mailer["nodemailer (SMTP)"]
    end

    subgraph ExternalServices ["Cloud & Transport Services"]
        SMTP["SMTP Provider (e.g. Gmail)"]
        GoogleOAuth["Google OAuth 2.0 Provider"]
    end

    subgraph DataLayer ["Data & Storage Layer"]
        Drizzle["Drizzle ORM (Postgres.js)"]
        Postgres[("PostgreSQL Database")]
        SupaRealtime["Supabase Realtime (postgres_changes, optional)"]
        SupaStorage["Supabase Storage Buckets"]
    end

    Router -->|"loader: ensureQueryData"| ServerFns
    UI -->|"Mutations"| ServerFns
    UI -->|"Session & Auth Requests"| AuthClient
    AuthClient --> AuthRoute
    AuthRoute --> AuthEngine
    AuthEngine -->|"Validate & Issue Cookies"| Drizzle
    AuthEngine -.->|"OAuth 2.0 Handshake"| GoogleOAuth
    ServerFns --> ZodValidation
    ZodValidation --> Services
    Services --> Drizzle
    Drizzle --> Postgres
    Services -->|"File Upload / Delete"| SupaStorage
    ServerFns -->|"Verification & Reset Emails"| Mailer
    Mailer --> SMTP
    Postgres -.->|"WAL Change Streaming"| SupaRealtime
    SupaRealtime -.->|"Invalidate Chat Query"| TQ
    TQ --> UI
```

### Data Flow Lifecycle

1. **Authentication & Session Issuance:** Requests pass through Better Auth. Upon Google OAuth verification or credential sign-in, session tokens are written to PostgreSQL and stored in secure HTTP-only cookies. The `_main` layout route reads the session once per navigation and shares it through router context.
2. **Guards & Prefetching:** Route `beforeLoad` hooks validate the user's role and class membership (redirecting otherwise); `loader`s call `queryClient.ensureQueryData` for every query the page suspends on, so pages render on the server with data already in the TanStack Query cache.
3. **Mutation Pipeline:** When an action occurs (e.g., submitting classwork or creating an announcement), a server function checks the session and membership, validates the payload with Zod, writes database rows via Drizzle, uploads any binary payloads to Supabase Storage, and the client invalidates the affected query keys. Deletes are optimistic with rollback.
4. **Chat Updates:** The chat query refetches every 5 seconds while open. The browser also subscribes to `postgres_changes` on the `chat` table filtered by class; it refreshes instantly on projects whose row-level-security policies let the publishable key receive those events.

---

## 3. Tech Stack

### Core Framework & Runtime

- **Framework:** [TanStack Start 1.168](https://tanstack.com/start) with [TanStack Router 1.170](https://tanstack.com/router) (file-based routes, loaders, server functions)
- **Build & Server:** [Vite 8](https://vite.dev/) and [Nitro 3](https://nitro.build/)
- **Frontend Library:** [React 19.2](https://react.dev/)
- **Language:** [TypeScript 6.0](https://www.typescriptlang.org/)
- **Runtime:** [Node.js](https://nodejs.org/) (v22+ recommended), package manager [pnpm](https://pnpm.io/)

### Database & Data Modeling

- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **ORM:** [Drizzle ORM 0.45](https://orm.drizzle.team/)
- **Database Driver:** [Postgres.js](https://github.com/porsager/postgres)
- **Migration Kit:** [Drizzle Kit 0.31](https://orm.drizzle.team/kit-docs/overview)

### Cloud, Storage & Real-time

- **Object Storage:** [Supabase Storage](https://supabase.com/storage) (Buckets: `avatars`, `streams`, `classworks`, `messages`, `comments`, `notes`)
- **Real-time Synchronization:** [Supabase Realtime](https://supabase.com/docs/guides/realtime) (`@supabase/supabase-js`), with polling as the baseline
- **Email Service:** [nodemailer](https://nodemailer.com/) over SMTP (server-side)

### Authentication & Authorization

- **Authentication Engine:** [Better Auth 1.7](https://www.better-auth.com/) with Drizzle adapter and TanStack Start cookie integration
- **Identity Providers:** Email & Password credentials (with verification) and Google OAuth 2.0

### UI, State & Formatting

- **Styling:** [Tailwind CSS 4.1](https://tailwindcss.com/) via `@tailwindcss/vite`
- **Primitive Components:** [Radix UI](https://www.radix-ui.com/) through [shadcn/ui](https://ui.shadcn.com/)
- **Client State Management:** [TanStack React Query v5](https://tanstack.com/query/latest)
- **Validation:** [Zod v4](https://zod.dev/)
- **Rich Text Editing:** [Meta Lexical 0.32](https://lexical.dev/) (`@lexical/react`, rich-text, link, list, table)
- **Internationalization:** [i18next](https://www.i18next.com/) / [react-i18next](https://react.i18next.com/) (English locale files under `src/i18n/locales`)
- **Animation & Icons:** [Motion](https://motion.dev/), [Lucide React](https://lucide.dev/)
- **Notifications / Toast:** [Sonner](https://sonner.emilkowal.ski/)
- **Date Utilities:** [date-fns 4](https://date-fns.org/)
- **Tooling:** [Biome](https://biomejs.dev/) (lint + format), [Vitest](https://vitest.dev/), an import-group sorter (`scripts/sort-imports.mjs`)

---

## 4. Project Structure

```text
scholaflow/
├── src/
│   ├── routes/                         # File-based routes (TanStack Router)
│   │   ├── __root.tsx                  # HTML shell, providers, head defaults
│   │   ├── index.tsx                   # Public landing page
│   │   ├── _auth/                      # Sign-in, sign-up, verify, forget/reset password
│   │   ├── _main/                      # Authenticated layout: sidebar, header, session context
│   │   │   ├── classroom/              # Dashboard and class pages
│   │   │   │   └── class/              # $classId layout (tabs) + stream/classwork/people/chat,
│   │   │   │                           #   $classId_.stream.$streamId (detail, submissions)
│   │   │   ├── notes.tsx               # Personal notes with the Lexical editor
│   │   │   ├── notifications.tsx       # Activity feed
│   │   │   ├── profile.tsx             # Profile, avatar, password, role request
│   │   │   ├── to-do.tsx               # Assigned / Missing / Done across classes
│   │   │   └── user-management.tsx     # Admin user table and role requests
│   │   ├── api/auth/$.ts               # Better Auth handler
│   │   ├── join-class/$classCode.tsx   # Invitation links
│   │   ├── close-account.tsx           # Account closure via emailed token
│   │   ├── error.tsx                   # Auth error page
│   │   ├── privacy.tsx, terms.tsx      # Legal pages
│   │   └── signin.tsx, signup.tsx, terms-of-use.tsx   # 301 redirects from the old slugs
│   ├── components/                     # UI grouped by domain
│   │   ├── auth/ landing/ layout/ shared/
│   │   ├── classroom/ stream/ classwork/ people/ chat/
│   │   ├── notes/ todo/ notifications/ profile/ user-management/
│   │   ├── editor/                     # Lexical editor (client-only, lazy loaded)
│   │   └── ui/                         # shadcn/ui primitives
│   ├── server/functions/               # Server functions (createServerFn): auth, classroom, stream,
│   │                                   #   classwork, comment, class-topic, message, notes,
│   │                                   #   notification, user, user-management
│   ├── services/                       # Drizzle queries, storage, email, account deletion
│   ├── queries/                        # TanStack Query key and queryOptions factories
│   ├── lib/                            # Pure logic: auth config, schema (Zod), rules, formatting
│   ├── db/                             # Drizzle client and PostgreSQL schema
│   ├── i18n/                           # i18next setup and English locale namespaces
│   ├── types/                          # Shared TypeScript types by domain
│   ├── hooks/ providers/ integrations/ # Hooks, app providers, QueryClient
│   └── styles.css                      # Tailwind 4 theme tokens
├── tests/                              # Vitest suites mirroring src/ (lib rules, scripts)
├── scripts/                            # sort-imports.mjs, generate-assetlinks.mjs
├── public/                             # Static assets (icons, illustrations)
├── drizzle.config.ts                   # Drizzle Kit configuration
├── vite.config.ts                      # Vite + TanStack Start + Nitro + Tailwind plugins
├── biome.json                          # Lint and format rules
├── vitest.config.ts                    # Test configuration
└── package.json                        # Dependencies and scripts
```

---

## 5. Getting Started

### Prerequisites

- **Node.js:** v22.x or higher
- **Package Manager:** `pnpm` (lockfile is pnpm's)
- **PostgreSQL Database:** A running PostgreSQL instance (or a managed [Supabase](https://supabase.com/) project)
- **Google Cloud Console Credentials:** For OAuth 2.0 authentication
- **SMTP credentials:** For verification, password reset and account-closure emails (a Gmail account with an app password works)

### Step-by-Step Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/LuisCabantac/scholaflow.git
cd scholaflow
```

#### 2. Install Dependencies

```bash
pnpm install
```

#### 3. Provision Supabase Storage Buckets

In the Supabase dashboard under **Storage**, create six buckets and allow reads plus inserts and deletes for the key you configure:

- `avatars`
- `streams`
- `classworks`
- `messages`
- `comments`
- `notes`

#### 4. Configure Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

| Variable                        | Required | Description                                                                 | Example / Default                        |
| :------------------------------ | :------: | :-------------------------------------------------------------------------- | :--------------------------------------- |
| `DATABASE_URL`                  | **Yes**  | PostgreSQL connection URI                                                   | `postgresql://postgres:[password]@...`   |
| `VITE_SUPABASE_URL`             | **Yes**  | Supabase project URL (also exposed to the browser)                          | `https://[project-id].supabase.co`       |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | **Yes**  | Supabase publishable (anon) key, used for storage and realtime              | `sb_publishable_...`                     |
| `BETTER_AUTH_SECRET`            | **Yes**  | Secret used by Better Auth to sign session tokens                           | Random 32+ character string              |
| `BETTER_AUTH_URL`               | **Yes**  | Origin the app is served from (sign-in requests from other origins fail)    | `http://localhost:3000`                  |
| `APP_URL`                       | **Yes**  | Base URL used in emailed links                                              | `http://localhost:3000`                  |
| `GOOGLE_CLIENT_ID`              | **Yes**  | Google Cloud OAuth 2.0 Client ID                                            | `xxx.apps.googleusercontent.com`         |
| `GOOGLE_CLIENT_SECRET`          | **Yes**  | Google Cloud OAuth 2.0 Client Secret                                        | `GOCSPX-xxxxxx`                          |
| `SMTP_EMAIL`                    | **Yes**  | SMTP user (also the default sender)                                         | `you@gmail.com`                          |
| `SMTP_PASSWORD`                 | **Yes**  | SMTP password or app password                                               |                                          |
| `SMTP_HOST`                     |    No    | SMTP host                                                                   | `smtp.gmail.com`                         |
| `SMTP_PORT`                     |    No    | SMTP port (465 uses TLS)                                                    | `465`                                    |
| `SMTP_FROM`                     |    No    | Sender shown on emails                                                      | `ScholaFlow <SMTP_EMAIL>`                |
| `SHA256_FINGERPRINT`            |    No    | SHA-256 Android certificate fingerprint; when set, the build writes `public/.well-known/assetlinks.json` | `14:6D:E8:...` |

#### 5. Initialize the Database Schema

Push the Drizzle schema to a fresh PostgreSQL database:

```bash
pnpm db:push
```

#### 6. Launch the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

#### 7. Building for Production

```bash
pnpm build
pnpm preview
```

The build output under `.output/` is a Nitro server; on Vercel it deploys as serverless functions with no extra configuration.

### Scripts

| Script                         | Purpose                                                        |
| :----------------------------- | :------------------------------------------------------------- |
| `pnpm dev`                     | Vite dev server with HMR on port 3000                          |
| `pnpm build` / `pnpm preview`  | Production build (Nitro) and local preview                     |
| `pnpm check`                   | Biome lint + format check and import-group order check         |
| `pnpm check:fix`               | Apply Biome fixes and sort import groups                       |
| `pnpm lint` / `pnpm format`    | Biome lint only / format only                                  |
| `pnpm generate-routes`         | Regenerate `src/routeTree.gen.ts`                              |
| `pnpm imports:fix`             | Sort import groups by line length                              |
| `pnpm typecheck`               | `tsc --noEmit`                                                 |
| `pnpm test`                    | Vitest suites under `tests/`                                   |
| `pnpm db:generate` / `db:migrate` / `db:push` / `db:pull` / `db:studio` | Drizzle Kit |

---

## 6. Usage / Reference

### 1. Course Creation and Enrollment

#### Creating a Classroom

1. Navigate to the Classroom dashboard (`/classroom`).
2. Click **Add class** and choose **Create class**.
3. Supply the course name, subject, section, and room details.
4. ScholaFlow generates a unique 8-character join code (e.g., `ebeqdca9`).

#### Enrolling in a Classroom

Students can enroll using either:

- **Direct Invitation Link:** `http://localhost:3000/join-class/{code}`
- **Join Dialog:** Open `/classroom`, choose **Add class** then **Join class**, and input the 8-character code.

```typescript
// Example: enrollment through the server functions used by the join dialog
import {
  getClassByClassCodeFn,
  joinClassFn,
} from "@/server/functions/classroom";

const classroom = await getClassByClassCodeFn({ data: "ebeqdca9" });
const result = await joinClassFn({ data: classroom.id });
// { success: true, message: "You've successfully joined the class!" }; the UI then navigates to /classroom/class/{classId}
```

### 2. Stream Publishing (Announcements & Assignments)

Educators publish posts from the Stream tab (`/classroom/class/{classId}`) and classwork (assignments, quizzes, materials, topics) from the Classwork tab (`/classroom/class/{classId}/classwork`):

- `stream`: General updates and syllabus notices.
- `assignment`: Tasks requiring student deliverables with due dates and point allocations.
- `quiz`: Formative or summative evaluation links.
- `question`: Discussion prompts with threaded responses.
- `material`: Reference documents, lecture slides, or reading lists.

Form fields travel as `FormData` to `createStreamFn` / `updateStreamFn` (`src/server/functions/stream.ts`): `type`, `classroomId`, `title`, `description`, `topicId`, `isAssignToAll`, `announceTo[]`, `points`, `dueDate` and `scheduledAt` (ISO strings), `acceptingSubmissions`, `closeSubmissionsAfterDueDate`, `links[]`, `attachments[]`, and on edit `curUrlLinks[]` / `curAttachments[]`.

### 3. Assignment Submission and Grading Workflow

1. **Student Submission:** Students open `/classroom/class/{classId}/stream/{streamId}` to view instructions, add files or links in the **Your work** panel, and click **Turn in** (or unsubmit while submissions are open).
2. **Teacher Grading View:** Educators open the **Submissions** tab (`/stream/{streamId}/submissions`), see turned-in and assigned students, open a student's work and exchange private comments.
3. **Score:** Teachers enter points in the grade dialog; students see the grade on their work panel and in the to-do Done tab.

### 4. Class Chat

Each course has a chat at `/classroom/class/{classId}/chat`. The messages query refetches every 5 seconds while the page is open, and the browser subscribes to inserts on the `chat` table for the class:

```typescript
// src/components/chat/ClassChatSection.tsx (abridged)
const channel = supabase
  .channel(`chat-${classroom.id}`)
  .on(
    "postgres_changes",
    { event: "INSERT", schema: "public", table: "chat", filter: `class_id=eq.${classroom.id}` },
    () => queryClient.invalidateQueries({ queryKey: messageKeys.byClass(classroom.id) }),
  )
  .subscribe();
```

---

## 7. Intentional differences from the Next.js version

The rewrite keeps main's features and markup, with these deliberate changes:

- **Routes:** `/sign-in`, `/sign-up` and `/terms` replace `/signin`, `/signup` and `/terms-of-use` (the old paths redirect with 301). Signed-in users are redirected away from the auth pages; non-admins are redirected away from `/user-management`; `/close-account` without a valid token goes to the landing page.
- **Email:** verification, password-reset and account-closure emails are sent server-side with nodemailer over SMTP instead of EmailJS from the browser.
- **Uploads:** the per-request cap is 4 MB (Vercel's body limit) instead of 5 MB; a note or post with several files is capped on the total.
- **Authorization moved server-side:** scheduled and targeted posts are filtered on the server for students; classwork, grades, comments, private comments, topics, roster changes and chat are bound to the caller's class and role; users can read only their own classwork, profile row and private threads; admin functions return nothing to non-admins.
- **Submissions:** turning in, resubmitting and unsubmitting are refused once the teacher turns off "accepting submissions" or the due date passes with "close after due date" on (main only disabled the button). Turning in again after an unsubmit counts as a change.
- **Account deletion:** closing an account (self-service or admin) deletes the user's classes, posts, comments, classworks, notes, notifications and messages in one transaction and then removes their files from storage.
- **Profile edits:** name, avatar and email changes propagate to the user's posts, comments, roster rows and role request; the header updates without a reload.
- **Chat:** polling every 5 seconds is the baseline; Realtime delivers nothing when the `chat` table has row-level security without policies (as on the reference deployment).
- **Dates and times:** the date-time picker stores the chosen time (main stored midnight); choosing "No due date" on edit clears the date; dates that depend on the viewer's timezone render client-side.
- **Lists:** searches on the classwork tab, notes and admin users are debounced or client-side instead of one query per keystroke; the grade dialog starts from the selected student's grade; the classwork tab and notes are cached per class and per user.
- **Fixes of main bugs:** posts and edits that main's own schema rejected (`className`, `updatedAt`), notifications sent to the class id instead of the roster, the notification "read" toggle, private-comment notifications to the addressee, a rejected role request that could not be re-submitted, admin user creation that never created a login, the mobile add-class button overlapping the open sidebar, the unread-notification dot keeping its grey color while the sidebar link is hovered, and several stale-state issues.
- **SEO:** every public page sets a canonical link, per-page Open Graph and Twitter tags and a description; the landing page carries JSON-LD; signed-in pages and token pages are `noindex`; `/robots.txt`, `/sitemap.xml` and `/site.webmanifest` are served by the app.
- **Tooling:** pnpm, Biome, Vitest and an import-group sorter; English UI strings live in `src/i18n/locales/en`.

---

## 8. Troubleshooting / Error Handling

#### 1. Database Connection Timeout or SSL Rejection

- **Symptom:** `error: connection to server at "..." failed: Connection refused` or `SSL connection has been closed unexpectedly`.
- **Resolution:** Ensure `DATABASE_URL` matches your PostgreSQL hosting environment. If connecting to Supabase, use the pooler port `6543` (transaction mode) or `5432` (session mode) as appropriate and append `?sslmode=require` when needed.

#### 2. Sign-in returns `403 INVALID_ORIGIN`

- **Symptom:** Credential sign-in fails from the browser or from scripts with an invalid-origin error.
- **Resolution:** `BETTER_AUTH_URL` must equal the origin the app is served from, including protocol and port (for example `http://localhost:3000` in development, or your deployment URL).

#### 3. Session Cookies Not Retained Across Navigations

- **Symptom:** User is redirected to `/sign-in` immediately after completing authentication.
- **Resolution:** Verify `BETTER_AUTH_URL` and `BETTER_AUTH_SECRET`; the cookie integration for TanStack Start is configured in `src/lib/auth.ts`.

#### 4. Supabase Storage 403 Forbidden on File Upload or Delete

- **Symptom:** Uploading attachments or avatars fails with `new row violates row-level security policy for table "objects"`, or removed files stay in the bucket.
- **Resolution:** In **Storage > Policies**, allow `SELECT`, `INSERT` and `DELETE` for the publishable key on the six buckets, or make them public for reads. Note that public URLs may keep serving a deleted file from the CDN for a while.

#### 5. Emails Not Delivering

- **Symptom:** No verification, reset or account-closure email arrives.
- **Resolution:** Check `SMTP_EMAIL`, `SMTP_PASSWORD`, `SMTP_HOST` and `SMTP_PORT`; Gmail requires an app password. Server logs show nodemailer errors.

#### 6. Chat Messages Do Not Appear Instantly

- **Symptom:** New messages show up only after a few seconds.
- **Resolution:** That is the polling baseline. For instant updates, add the `chat` table to the `supabase_realtime` publication and define row-level-security policies that let the publishable key read the rows (or expose a members-only policy through your own JWT); the subscription is already in place.

---

## License

This project is licensed under the [MIT License](LICENSE).
