# ScholaFlow

ScholaFlow is a learning platform that aims to improve upon the foundation of existing platforms like Google Classroom. We're not just checking boxes – we're focused on features that genuinely enhance the learning experience.

![scholaflow og](https://github.com/user-attachments/assets/413b1771-8ca9-49fb-8d79-9d446430334f)

## Key Features:

1. **Course Management:** Create courses, lessons, assignments, manage students.
2. **Grading & Feedback:** Grade assignments, provide feedback (with image embedding).
3. **Communication:** Integrated group chat for centralized discussions.
4. **Personal Notes:** A built-in personal notes section helps students and educators stay organized within the platform.

## Try ScholaFlow

Want to experience ScholaFlow firsthand? Join our demo class:

**Class Code:** `ebeqdca9`

**Join Link:** [https://scholaflow.vercel.app/join-class/ebeqdca9](https://scholaflow.vercel.app/join-class/ebeqdca9)

## Built with

- [Next.js 15](https://nextjs.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Better Auth](https://www.better-auth.com/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Zod](https://zod.dev/)
- [Date-fns](https://date-fns.org/)
- [React Hot Toast](https://react-hot-toast.com/)
- [React Linkify](https://www.npmjs.com/package/react-linkify)
- [EmailJS](https://www.emailjs.com/)

## Getting Started

### Prerequisites

- Node.js v20
- npm or yarn
- A Supabase account (sign up for free at [https://supabase.com/](https://supabase.com/))

### Installation

1. **Set up a Supabase Project:**

   - Go to the Supabase Dashboard and create a new project.
   - Choose a region and name for your project.
   - Wait for the project to be provisioned (this might take a few minutes).

2. **Set up Better Auth with Google Provider:**

   - Follow the official Better Auth guide for setting up the Google provider: [https://www.better-auth.com/docs/authentication/google](https://www.better-auth.com/docs/authentication/google)

3. **Configure Environment Variables:**

   - In your Supabase project dashboard, navigate to "Settings" -> "API".
   - Copy the `anon` key (public API key) and the `service_role` key (used for server-side access).
   - Create a `.env` file in the root of your ScholaFlow project.
   - Add the following environment variables to your `.env` file, replacing the placeholders with your Supabase values:

     ```
     NEXT_PUBLIC_SUPABASE_URL=[Your Supabase Project URL]
     NEXT_PUBLIC_SUPABASE_KEY=[Your Supabase Anon Key]
     ```

   * You will need to configure your Google provider by setting the environment variables `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`. Refer to the guide linked below for more details on obtaining these.
   * **Important:** The `.env` file should be added to your `.gitignore` file to avoid committing sensitive API keys to version control.

4. **Clone the repository:** `git clone git@github.com:LuisCabantac/scholaflow.git`
5. **Navigate to the project directory:** `cd ScholaFlow`
6. **Install dependencies:** `npm install`
7. **Start the Development Server:** `npm run dev` or `yarn dev`
8. **Access ScholaFlow:** Open your browser and go to `http://localhost:3000` (or the port specified in your setup).

## Contributing

We welcome contributions to ScholaFlow! Whether you're fixing bugs, adding new features, or improving documentation, your help is valuable.

**Reporting Bugs:**

If you encounter a bug, please open an issue on the GitHub repository. Provide a clear description of the bug, steps to reproduce it, and any relevant information that might help in debugging.

**Feature Requests:**

If you have an idea for a new feature, please open an issue on the GitHub repository. Describe the feature you'd like to see, explain why it's useful, and provide any relevant details or mockups.

We appreciate your contributions and look forward to working with you to improve ScholaFlow!
