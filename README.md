# ScholaFlow

[![Next.js](https://img.shields.io/badge/Next.js-15.4-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://www.postgresql.org/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.45-C5F74F?logo=drizzle)](https://orm.drizzle.team/)
[![Supabase](https://img.shields.io/badge/Supabase-Realtime_%26_Storage-3ECF8E?logo=supabase)](https://supabase.com/)
[![Better Auth](https://img.shields.io/badge/Better_Auth-1.6-purple?style=flat-square)](https://www.better-auth.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An open-source Learning Management System (LMS) built for structured academic workflows, real-time classroom collaboration, and assignment management.

![ScholaFlow Overview](https://github.com/user-attachments/assets/413b1771-8ca9-49fb-8d79-9d446430334f)

---

## 1. Overview & Key Capabilities

ScholaFlow is a self-hostable learning platform designed to streamline instructional coordination between educators and students. Built with Next.js 15, React 19, TypeScript, Drizzle ORM, and Supabase, it provides a performant alternative to traditional classroom software while keeping infrastructure requirements transparent and customizable.

> **Live Demo Classroom**  
> Join the live staging instance to explore ScholaFlow directly:  
> **Class Code:** `ebeqdca9`  
> **Direct Link:** [https://scholaflow.vercel.app/join-class/ebeqdca9](https://scholaflow.vercel.app/join-class/ebeqdca9)

### Core Capabilities

- **Course Lifecycle & Enrollment:** Teachers can provision courses with distinct color themes, metadata (subject, room, section), and unique 8-character joining codes. Students can enroll via one-click invitation links or by entering join codes.
- **Stream & Publishing Engine:** Supports five distinct stream content categories: Announcements (`stream`), `assignment`, `quiz`, `question`, and `material`. Features include scheduled publishing, topic classification, item pinning, and granular target delivery (publish to all enrolled students or select individuals).
- **Assignment & Submission Pipeline:** Complete student submission workflow with document attachments, hyperlinks, turn-in timestamp tracking, and late-submission cutoff toggles (`closeSubmissionsAfterDueDate`). Teachers review submissions, input rubric scores, provide feedback with embedded media, and return graded work.
- **Real-Time Synchronous Classroom Chat:** Low-latency group communication per class powered by Supabase Realtime change-data-capture channels on PostgreSQL, coupled with TanStack Query optimistic cache invalidation.
- **Lexical Rich-Text Integration:** Embedded Meta Lexical editor supporting rich text styling, lists, code blocks, quote formatting, hyperlinks, and multi-file attachment management.
- **Personal Productivity Workspace:** User-isolated personal notes engine supporting rich-text formatting, pinning, and storage uploads, alongside an automated **To-Do** dashboard that aggregates assignments across all enrolled classes by status: _Assigned_, _Missing_, and _Completed_.
- **Granular Role-Based Access Control (RBAC):** Native `user` and `admin` roles, structured instructor verification requests, and administrative directories for user auditing and account de-provisioning.

---

## 2. Architecture / How it Works

ScholaFlow leverages the Next.js App Router paradigm with React Server Components (RSC) for authenticated layout rendering and Server Actions for data mutations, validated against Zod contracts and persisted via Drizzle ORM. Real-time updates and binary object storage are offloaded to Supabase.

### System Architecture Flow

```mermaid
flowchart TD
    subgraph Client ["Client Layer (Browser / PWA)"]
        UI["React 19 UI / Radix UI / Tailwind CSS"]
        TQ["TanStack Query (Client Cache & State)"]
        Lex["Lexical Rich Text Editor"]
        AuthClient["Better Auth Client"]
    end

    subgraph Server ["Application Layer (Next.js 15 App Router)"]
        RouteHandlers["API Routes (/api/auth/*)"]
        ServerActions["Server Actions (lib/*-actions.ts)"]
        ZodValidation["Zod Schema Validation (lib/schema)"]
        AuthEngine["Better Auth Engine (lib/auth.ts)"]
    end

    subgraph ExternalServices ["Cloud & Transport Services"]
        EmailJS["EmailJS (Verification & Reset Emails)"]
        GoogleOAuth["Google OAuth 2.0 Provider"]
    end

    subgraph DataLayer ["Data & Storage Layer"]
        Drizzle["Drizzle ORM (Postgres.js Pooler)"]
        Postgres[("PostgreSQL Database")]
        SupaRealtime["Supabase Realtime (CDC / Postgres Changes)"]
        SupaStorage["Supabase Storage Buckets (Avatars, Work, Notes, Messages)"]
    end

    UI -->|"User Interactions"| ServerActions
    UI -->|"Session & Auth Requests"| AuthClient
    AuthClient --> RouteHandlers
    RouteHandlers --> AuthEngine
    AuthEngine -->|"Validate & Issue Cookies"| Drizzle
    AuthEngine -.->|"OAuth 2.0 Handshake"| GoogleOAuth
    ServerActions --> ZodValidation
    ZodValidation --> Drizzle
    Drizzle --> Postgres
    ServerActions -->|"File Upload / Delete"| SupaStorage
    ServerActions -.->|"Trigger Transactional Emails"| EmailJS
    Postgres -->|"WAL Change Streaming"| SupaRealtime
    SupaRealtime -->|"Live Chat Sync"| TQ
    TQ --> UI
```

### Data Flow Lifecycle

1. **Authentication & Session Issuance:** Requests pass through Better Auth. Upon Google OAuth verification or credential sign-in, session tokens are written to PostgreSQL and stored in secure HTTP-only cookies.
2. **Server-Side Authorization & Fetching:** Layouts and pages execute server queries directly via Drizzle ORM, validating the user's role and class membership before rendering HTML to the client.
3. **Mutation Pipeline:** When an action occurs (e.g., submitting classwork or creating an announcement), a Server Action validates the payload with Zod, writes database rows via Drizzle, uploads any binary payloads to Supabase Storage, and issues `revalidatePath` to refresh affected route caches.
4. **Synchronous Messaging:** When a message is posted to a class chat, the row insertion in the `chat` table triggers a PostgreSQL Change Event through Supabase Realtime (`postgres_changes`), notifying active classroom clients to invalidate their query cache.

---

## 3. Tech Stack

### Core Framework & Runtime

- **Framework:** [Next.js 15.4](https://nextjs.org/) (App Router, Server Actions, Turbopack)
- **Frontend Library:** [React 19.0](https://react.dev/)
- **Language:** [TypeScript 5.9](https://www.typescriptlang.org/)
- **Runtime:** [Node.js](https://nodejs.org/) (v20+ LTS recommended) / compatible with [Bun](https://bun.sh/)

### Database & Data Modeling

- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **ORM:** [Drizzle ORM 0.45](https://orm.drizzle.team/)
- **Database Driver:** [Postgres.js](https://github.com/porsager/postgres)
- **Migration Kit:** [Drizzle Kit 0.31](https://orm.drizzle.team/kit-docs/overview)

### Cloud, Storage & Real-time

- **Object Storage:** [Supabase Storage](https://supabase.com/storage) (Buckets: `avatars`, `streams`, `classworks`, `messages`, `comments`, `notes`)
- **Real-time Synchronization:** [Supabase Realtime](https://supabase.com/docs/guides/realtime) (`@supabase/supabase-js`)
- **Email Service:** [EmailJS](https://www.emailjs.com/) (`@emailjs/browser`)

### Authentication & Authorization

- **Authentication Engine:** [Better Auth 1.6](https://www.better-auth.com/) with Drizzle adapter
- **Identity Providers:** Email & Password credentials (with verification) and Google OAuth 2.0

### UI, State & Formatting

- **Styling:** [Tailwind CSS 3.4](https://tailwindcss.com/), `postcss`, `tailwindcss-animate`
- **Primitive Components:** [Radix UI](https://www.radix-ui.com/) (`dialog`, `dropdown-menu`, `popover`, `select`, `tabs`, `tooltip`)
- **Client State Management:** [TanStack React Query v5](https://tanstack.com/query/latest)
- **Validation:** [Zod v3/v4](https://zod.dev/)
- **Rich Text Editing:** [Meta Lexical](https://lexical.dev/) (`@lexical/react`, rich-text, code, link, list, table)
- **Animation & Icons:** [Motion](https://motion.dev/) (Framer Motion), [Lucide React](https://lucide.dev/)
- **Notifications / Toast:** [Sonner](https://sonner.emilkowal.ski/)
- **Date Utilities:** [Date-fns 4.4](https://date-fns.org/)

---

## 4. Project Structure

```text
scholaflow/
├── app/                                # Next.js App Router root
│   ├── (auth)/                         # Unauthenticated route group
│   │   ├── close-account/              # Account deletion confirmation
│   │   ├── error/                      # Authentication error fallback
│   │   ├── forget-password/            # Password reset request flow
│   │   ├── reset-password/             # Token-based password modification
│   │   ├── signin/                     # Credential & OAuth sign-in
│   │   ├── signup/                     # User registration
│   │   └── verify/                     # Email verification handler
│   ├── (main)/                         # Authenticated application layout & routes
│   │   ├── classroom/                  # Classroom dashboard & detail pages
│   │   │   └── class/[classId]/        # Class space: stream, classwork, chat, people
│   │   ├── notes/                      # Personal scratchpad & document store
│   │   ├── notifications/              # Activity and submission alerts
│   │   ├── profile/                    # User profile settings & role escalation
│   │   ├── to-do/                      # Aggregated student assignment tracker
│   │   └── user-management/            # Administrator panel for user moderation
│   ├── api/                            # API endpoints
│   │   └── auth/[...all]/              # Better Auth dynamic API route handler
│   ├── join-class/[code]/              # Direct link enrollment route
│   ├── layout.tsx                      # Root HTML layout and theme providers
│   ├── page.tsx                        # Public landing page
│   └── Provider.tsx                    # Top-level client providers (QueryClient, Theme)
├── components/                         # Application UI layer
│   ├── blocks/                         # Composed interface sections
│   ├── editor/                         # Lexical rich-text editor components and plugins
│   ├── ui/                             # Reusable Radix UI & shadcn design primitives
│   ├── ClassChatSection.tsx            # Real-time classroom message thread
│   ├── ClassworksSection.tsx           # Teacher and student classwork index
│   ├── LandingPage.tsx                 # Public marketing view
│   ├── StreamCard.tsx                  # Stream item card (posts, assignments, quizzes)
│   ├── StreamDetailSection.tsx         # Detailed assignment view & submission dock
│   └── UserManagementSection.tsx       # Admin user table and role approval
├── contexts/                           # React context definitions
│   ├── NavContext.tsx                  # Header navigation state
│   ├── QueryProvider.tsx               # TanStack React Query client instantiation
│   └── SidebarContext.tsx              # Responsive navigation drawer state
├── drizzle/                            # Database definitions & connection
│   ├── index.tsx                       # Postgres.js client & Drizzle db instance
│   └── schema.tsx                      # PostgreSQL schema, enums, tables, and relations
├── hooks/                              # Custom React hooks
│   └── use-mobile.tsx                  # Viewport breakpoint observer
├── lib/                                # Domain logic and integrations
│   ├── schema/                         # Zod validation schemas and TypeScript types
│   ├── auth.ts                         # Better Auth server configuration
│   ├── auth-actions.ts                 # Credential registration & password actions
│   ├── auth-client.ts                  # Better Auth React client export
│   ├── classroom-actions.ts            # Server actions for classes, streams, & grading
│   ├── classroom-service.ts            # Database query services for classrooms
│   ├── classwork-service.ts            # Assignment submission queries
│   ├── notification-service.ts         # User activity notification services
│   ├── supabase.js                     # Supabase client instantiation
│   ├── user-management-actions.ts      # User deletion, avatar mutations, role toggles
│   └── utils.ts                        # File path parsers, class code generator, helpers
├── public/                             # Static public assets (icons, illustrations)
├── generate-assetlinks.js              # Script generating Android assetlinks.json
├── middleware.ts                       # Next.js edge route protection & redirection
├── next.config.mjs                     # Next.js configuration and image domains
├── package.json                        # Project dependencies and script declarations
├── tailwind.config.ts                  # Tailwind theme, plugins, and color scales
└── tsconfig.json                       # TypeScript compiler options and path aliases
```

---

## 5. Getting Started

### Prerequisites

Ensure you have the following installed on your development workstation:

- **Node.js:** v20.x or higher
- **Package Manager:** `npm`, `pnpm`, or `bun`
- **PostgreSQL Database:** A running PostgreSQL instance (or a managed [Supabase](https://supabase.com/) project)
- **Google Cloud Console Credentials:** For OAuth 2.0 authentication
- **EmailJS Account:** For email verification and password reset delivery

---

### Step-by-Step Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/LuisCabantac/scholaflow.git
cd scholaflow
```

#### 2. Install Dependencies

```bash
npm install
# or
bun install
```

#### 3. Provision Supabase Storage Buckets

If using Supabase, navigate to the **Storage** section in your dashboard and create the following six buckets (set public or configure read policies according to your deployment strategy):

- `avatars`
- `streams`
- `classworks`
- `messages`
- `comments`
- `notes`

#### 4. Configure Environment Variables

Create a `.env.local` file in the root directory by copying the configuration below:

```bash
touch .env.local
```

Populate `.env.local` with your target credentials:

| Variable                                        | Type   |  Required  | Description                                                                                    | Example / Default                                               |
| :---------------------------------------------- | :----- | :--------: | :--------------------------------------------------------------------------------------------- | :-------------------------------------------------------------- |
| `DATABASE_URL`                                  | String |  **Yes**   | PostgreSQL connection URI                                                                      | `postgresql://postgres:[password]@db.example.com:5432/postgres` |
| `NEXT_PUBLIC_SUPABASE_URL`                      | String |  **Yes**   | Supabase project URL                                                                           | `https://[project-id].supabase.co`                              |
| `NEXT_PUBLIC_SUPABASE_KEY`                      | String |  **Yes**   | Supabase anonymous / public API key                                                            | `eyJhbGciOi...`                                                 |
| `BETTER_AUTH_SECRET`                            | String |  **Yes**   | Secret used by Better Auth to sign session tokens                                              | Random 32+ character string                                     |
| `BETTER_AUTH_URL`                               | String |  **Yes**   | Base URL for Better Auth routing                                                               | `http://localhost:3000`                                         |
| `NEXT_PUBLIC_APP_URL`                           | String |  **Yes**   | Canonical client application URL                                                               | `http://localhost:3000`                                         |
| `GOOGLE_CLIENT_ID`                              | String |  **Yes**   | Google Cloud OAuth 2.0 Client ID                                                               | `xxx.apps.googleusercontent.com`                                |
| `GOOGLE_CLIENT_SECRET`                          | String |  **Yes**   | Google Cloud OAuth 2.0 Client Secret                                                           | `GOCSPX-xxxxxx`                                                 |
| `NEXT_PUBLIC_EMAILJS_SERVICE_ID`                | String |  **Yes**   | EmailJS service identifier                                                                     | `service_xxxx`                                                  |
| `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID`               | String |  **Yes**   | EmailJS verification template ID                                                               | `template_xxxx`                                                 |
| `NEXT_PUBLIC_EMAILJS_CLOSE_ACCOUNT_TEMPLATE_ID` | String |  **Yes**   | EmailJS account deletion template ID                                                           | `template_yyyy`                                                 |
| `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY`                | String |  **Yes**   | EmailJS account public key                                                                     | `user_xxxx`                                                     |
| `SHA256_FINGERPRINT`                            | String | Optional\* | SHA-256 Android certificate fingerprint (\*required for production `npm run build` assetlinks) | `14:6D:E8:...`                                                  |

#### 5. Initialize the Database Schema

Push the Drizzle schema to your PostgreSQL database:

```bash
npx drizzle-kit push
```

#### 6. Launch the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

#### 7. Building for Production

```bash
# Ensure SHA256_FINGERPRINT is defined in your environment or .env.local
npm run build
npm run start
```

---

## 6. Usage / Reference

### 1. Course Creation and Enrollment

#### Creating a Classroom

1. Navigate to the Classroom dashboard (`/classroom`).
2. Click the **+** (Create Class) action in the navigation bar.
3. Supply the course name, subject, section, and room details.
4. ScholaFlow generates a unique 8-character join code (e.g., `ebeqdca9`).

#### Enrolling in a Classroom

Students can enroll using either:

- **Direct Invitation Link:** `http://localhost:3000/join-class/{code}`
- **Join Modal:** Open `/classroom`, select **Join Class**, and input the 8-character alphanumeric code.

```typescript
// Example: Programmatic enrollment verification via Server Action
import { enrollClass } from "@/lib/classroom-actions";

const formData = new FormData();
formData.append("code", "ebeqdca9");

const response = await enrollClass(formData);
// Redirects to /classroom/class/{classId} on success
```

---

### 2. Stream Publishing (Announcements & Assignments)

Educators publish structured course items via `/classroom/class/[classId]`:

- **Item Types:**
  - `stream`: General updates and syllabus notices.
  - `assignment`: Tasks requiring student deliverables with due dates and rubric point allocations.
  - `quiz`: Formative or summative evaluation links.
  - `question`: Discussion prompts with threaded responses.
  - `material`: Reference documents, lecture slides, or reading lists.

```typescript
// Structure of a stream payload validated by createStreamSchema
const assignmentPayload = {
  classId: "6b5832ea-f489-4099-a9a2-a140f7d5c7c2",
  className: "Computer Science 101",
  title: "Problem Set 1: Data Structures",
  content: "Implement a balanced binary search tree in TypeScript.",
  type: "assignment",
  points: 100,
  dueDate: new Date("2026-10-15T23:59:59Z"),
  closeSubmissionsAfterDueDate: true,
  announceToAll: true,
  announceTo: [],
  attachments: [
    "https://[project-id].supabase.co/storage/v1/object/public/streams/...",
  ],
  links: ["https://en.wikipedia.org/wiki/Binary_search_tree"],
};
```

---

### 3. Assignment Submission and Grading Workflow

1. **Student Submission:** Students open `/classroom/class/[classId]/stream/[streamId]` to view instructions, upload files to Supabase Storage, attach external URLs, and click **Turn In**.
2. **Teacher Grading View:** Educators navigate to the **Submissions** tab (`/stream/[streamId]/submissions`).
3. **Score & Feedback:** Teachers inspect student attachments, assign points, input private feedback, and mark the assignment as **Returned**.

---

### 4. Real-time Classroom Chat

Each course contains an isolated real-time channel (`/classroom/class/[classId]/chat`):

```typescript
// Subscription hook in ClassChatSection.tsx
useEffect(() => {
  const channel = supabase
    .channel("chat-db-changes")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "chat" },
      () => refetch(),
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [refetch]);
```

---

## 7. Troubleshooting / Error Handling

### Common Issues & Diagnostic Steps

#### 1. Database Connection Timeout or SSL Rejection

- **Symptom:** `error: connection to server at "..." failed: Connection refused` or `SSL connection has been closed unexpectedly`.
- **Resolution:** Ensure your `DATABASE_URL` matches your PostgreSQL hosting environment. If connecting to Supabase or AWS RDS, append `?sslmode=require` or ensure connection pooler port `6543` (transaction mode) or `5432` (session mode) is configured appropriately.

#### 2. Build Failure: `SHA256_FINGERPRINT environment variable is not set`

- **Symptom:** Running `npm run build` exits immediately with status code `1` in `generate-assetlinks.js`.
- **Resolution:** ScholaFlow includes an automated Android App Links generator script before `next build`. Add a placeholder SHA-256 fingerprint in your `.env.local` during development:
  ```env
  SHA256_FINGERPRINT="14:6D:E8:D2:C3:57:EC:D5:78:E5:60:44:8D:19:D4:58:65:21:54:8B:11:01:46:1D:64:8A:27:EB:FE:A9:72:91"
  ```

#### 3. Session Cookies Not Retained Across Navigations

- **Symptom:** User is redirected to `/signin` immediately after completing authentication.
- **Resolution:** Verify that `BETTER_AUTH_URL` matches the exact protocol and port of your browser session (e.g., `http://localhost:3000` in development). Ensure `BETTER_AUTH_SECRET` is defined with a secure string.

#### 4. Supabase Storage 403 Forbidden on File Upload

- **Symptom:** Uploading attachments or avatars throws an error: `new row violates row-level security policy for table "objects"`.
- **Resolution:** In your Supabase Dashboard under **Storage > Policies**, configure Row Level Security (RLS) policies allowing authenticated users to `INSERT` and `SELECT` from the `avatars`, `streams`, `classworks`, `messages`, `comments`, and `notes` buckets, or set the buckets to public for read-only asset resolution.

#### 5. Email Verification Links Not Delivering

- **Symptom:** No verification email arrives upon registration.
- **Resolution:** Verify that `NEXT_PUBLIC_EMAILJS_SERVICE_ID`, `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID`, and `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` are accurately populated and that the email template contains the `{{message}}` placeholder variable as expected by `SignUpForm.tsx`.

---

## License

This project is licensed under the [MIT License](LICENSE).
