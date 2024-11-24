# ScholaFlow

ScholaFlow is an open-source learning management system (LMS) that aims to improve upon the foundation of existing platforms like Google Classroom. We're not just checking boxes – we're focused on features that genuinely enhance the learning experience.

## Key Differences:

- **Visual Feedback:** Embed images directly in comments. Because sometimes a picture is worth a thousand words (especially in feedback).
- **Seamless Communication:** Integrated group chat eliminates the need for external communication tools. Keep conversations centralized and focused.
- **Integrated Note-Taking:** A built-in personal notes section (think Google Keep) helps students and educators stay organized within the platform.

## Beyond the Basics:

ScholaFlow offers the core functionality you expect from an LMS (assignments, grading, announcements), but with a focus on:

- **Intuitive Interface:** Minimize the learning curve with a familiar design.
- **Efficient Workflow:** Streamline tasks and communication for both teachers and students

## Built with

- [Next.js 14](https://nextjs.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/)
- [Auth.js](https://authjs.dev/getting-started)
- [TanStack Query](https://tanstack.com/query/latest)
- [Date-fns](https://date-fns.org/)
- [React Hot Toast](https://react-hot-toast.com/)
- [React Linkify](https://www.npmjs.com/package/react-linkify)
- [Framer Motion](https://motion.dev/)

## Getting Started

### Prerequisites

- Node.js v16 or higher
- npm or yarn
- A Supabase account (sign up for free at [https://supabase.com/](https://supabase.com/))

### Installation

1. **Set up a Supabase Project:**

   - Go to the Supabase Dashboard and create a new project.
   - Choose a region and name for your project.
   - Wait for the project to be provisioned (this might take a few minutes).

2. **Set up NextAuth.js with Google Provider:**

   - Follow the official NextAuth.js guide for setting up the Google provider: [https://next-auth.js.org/providers/google](https://next-auth.js.org/providers/google)

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

**How to Contribute:**

1. **Fork the Repository:** Fork the ScholaFlow repository to your GitHub account.
2. **Create a Branch:** Create a new branch for your feature or bug fix: `git checkout -b feature/your-feature-name` or `git checkout -b bugfix/bug-description`.
3. **Make Changes:** Implement your changes, following the coding style guidelines (see below).
4. **Commit Your Changes:** Commit your changes with clear and descriptive commit messages: `git commit -m "Add feature: Your feature description"`.
5. **Push to Your Fork:** Push your changes to your forked repository: `git push origin feature/your-feature-name`.
6. **Create a Pull Request:** Open a pull request against the main branch of the ScholaFlow repository. Provide a detailed description of your changes and why they are necessary.

**Reporting Bugs:**

If you encounter a bug, please open an issue on the GitHub repository. Provide a clear description of the bug, steps to reproduce it, and any relevant information that might help in debugging.

**Feature Requests:**

If you have an idea for a new feature, please open an issue on the GitHub repository. Describe the feature you'd like to see, explain why it's useful, and provide any relevant details or mockups.

We appreciate your contributions and look forward to working with you to improve ScholaFlow!
