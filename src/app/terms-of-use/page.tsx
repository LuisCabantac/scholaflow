import { Metadata } from "next";

import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description:
    "Read our Terms and Conditions to understand the rules and guidelines for using ScholaFlow. Learn about user responsibilities, acceptable use policies, and your rights when using our educational platform.",
};

export default function Page() {
  return (
    <section>
      <Nav showButton={true} />
      <div className="mx-auto mb-6 mt-2 flex max-w-6xl flex-col gap-5 px-6 md:mb-10 md:px-10 lg:px-14">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-2xl font-semibold text-foreground md:text-4xl">
            Terms and Conditions
          </h1>
          <p className="mb-1 text-xs text-foreground/70 md:text-sm">
            Last updated June 17, 2025
          </p>
        </div>

        <div>
          <h4 className="mb-1 text-base font-medium text-foreground md:text-xl">
            Acceptance of Terms
          </h4>
          <p className="text-sm text-foreground/70 md:text-base">
            By accessing or using ScholaFlow (&quot;the Service&quot;), you
            agree to be bound by these Terms and Conditions and our{" "}
            <a href="/privacy" className="text-sidebar-ring hover:underline">
              Privacy Policy
            </a>
            . If you do not agree to these terms, please do not use the Service.
          </p>
        </div>

        <div>
          <h4 className="mb-1 text-base font-medium text-foreground md:text-xl">
            Description of Service
          </h4>
          <p className="text-sm text-foreground/70 md:text-base">
            ScholaFlow is an educational platform that facilitates course
            management, assignment submissions, grading, group communications,
            and note-taking for students and instructors in academic
            institutions.
          </p>
        </div>

        <div>
          <h4 className="mb-1 text-base font-medium text-foreground md:text-xl">
            User Accounts and Eligibility
          </h4>
          <ul className="space-y-2 text-sm text-foreground/70 md:text-base">
            <li>• You must be at least 13 years old to use this Service</li>
            <li>
              • You must provide accurate and complete information when creating
              an account
            </li>
            <li>
              • You are responsible for maintaining the confidentiality of your
              account credentials
            </li>
            <li>
              • You may only create one account and must not share your account
              with others
            </li>
            <li>
              • Institutional affiliation may be required for certain features
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-1 text-base font-medium text-foreground md:text-xl">
            Acceptable Use Policy
          </h4>
          <p className="mb-2 text-sm text-foreground/70 md:text-base">
            You agree not to use the Service to:
          </p>
          <ul className="space-y-2 text-sm text-foreground/70 md:text-base">
            <li>• Violate any applicable laws or regulations</li>
            <li>• Harass, abuse, or harm other users</li>
            <li>• Share inappropriate, offensive, or harmful content</li>
            <li>• Plagiarize or submit work that is not your own</li>
            <li>
              • Attempt to gain unauthorized access to the Service or other
              users&apos; accounts
            </li>
            <li>
              • Upload malicious software or engage in activities that could
              harm the Service
            </li>
            <li>• Interfere with the proper functioning of the Service</li>
            <li>
              • Use the Service for commercial purposes without permission
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-1 text-base font-medium text-foreground md:text-xl">
            User Content and Intellectual Property
          </h4>
          <ul className="space-y-2 text-sm text-foreground/70 md:text-base">
            <li>
              • You retain ownership of content you create and submit through
              the Service
            </li>
            <li>
              • You grant us a license to use, store, and display your content
              as necessary to provide the Service
            </li>
            <li>
              • You are responsible for ensuring you have the right to submit
              any content
            </li>
            <li>
              • We reserve the right to remove content that violates these terms
            </li>
            <li>• Respect the intellectual property rights of others</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-1 text-base font-medium text-foreground md:text-xl">
            Privacy and Data Protection
          </h4>
          <p className="text-sm text-foreground/70 md:text-base">
            Your privacy is important to us. Please review our Privacy Policy to
            understand how we collect, use, and protect your personal
            information. By using the Service, you consent to our data practices
            as described in the Privacy Policy.
          </p>
        </div>

        <div>
          <h4 className="mb-1 text-base font-medium text-foreground md:text-xl">
            Service Availability and Modifications
          </h4>
          <ul className="space-y-2 text-sm text-foreground/70 md:text-base">
            <li>
              • We strive to provide reliable service but cannot guarantee 100%
              uptime
            </li>
            <li>
              • We may modify, suspend, or discontinue the Service at any time
            </li>
            <li>
              • We may update features and functionality to improve the Service
            </li>
            <li>
              • Scheduled maintenance may temporarily interrupt service
              availability
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-1 text-base font-medium text-foreground md:text-xl">
            Limitation of Liability
          </h4>
          <p className="text-sm text-foreground/70 md:text-base">
            The Service is provided &quot;as is&quot; without warranties. We are
            not liable for any indirect, incidental, or consequential damages
            arising from your use of the Service. Our total liability shall not
            exceed the amount you paid for the Service, if any.
          </p>
        </div>

        <div>
          <h4 className="mb-1 text-base font-medium text-foreground md:text-xl">
            Account Termination
          </h4>
          <ul className="space-y-2 text-sm text-foreground/70 md:text-base">
            <li>
              • You may close your account at any time through account settings
            </li>
            <li>
              • We may suspend or terminate accounts that violate these terms
            </li>
            <li>
              • Upon termination, your data will be removed as described in our
              Privacy Policy
            </li>
            <li>
              • Some data may be retained for legal or administrative purposes
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-1 text-base font-medium text-foreground md:text-xl">
            Educational Use and Academic Integrity
          </h4>
          <p className="text-sm text-foreground/70 md:text-base">
            Users must maintain academic integrity and follow their
            institution&apos;s policies regarding coursework, assignments, and
            collaboration. Instructors have access to student submissions and
            grades as necessary for educational purposes.
          </p>
        </div>

        <div>
          <h4 className="mb-1 text-base font-medium text-foreground md:text-xl">
            Third-Party Services
          </h4>
          <p className="text-sm text-foreground/70 md:text-base">
            The Service uses third-party providers including Vercel for hosting
            and Supabase for data storage. These providers have their own terms
            of service and privacy policies that may apply to your use of the
            Service.
          </p>
        </div>

        <div>
          <h4 className="mb-1 text-base font-medium text-foreground md:text-xl">
            Dispute Resolution
          </h4>
          <p className="text-sm text-foreground/70 md:text-base">
            Any disputes arising from these terms or your use of the Service
            will be resolved through binding arbitration in accordance with
            applicable laws. You waive your right to participate in class action
            lawsuits.
          </p>
        </div>

        <div>
          <h4 className="mb-1 text-base font-medium text-foreground md:text-xl">
            Changes to Terms
          </h4>
          <p className="text-sm text-foreground/70 md:text-base">
            We may update these Terms and Conditions periodically. Any changes
            will be posted on the Service with an updated effective date.
            Continued use of the Service after changes constitutes acceptance of
            the new terms.
          </p>
        </div>

        <div>
          <h4 className="mb-1 text-base font-medium text-foreground md:text-xl">
            Contact Us
          </h4>
          <p className="text-sm text-foreground md:text-base">
            If you have any questions or concerns about these Terms and
            Conditions, you can contact us at{" "}
            <a
              href="mailto:scholaflow@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sidebar-ring hover:underline"
            >
              scholaflow@gmail.com
            </a>{" "}
            or{" "}
            <a
              href="https://github.com/LuisCabantac/scholaflow/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sidebar-ring hover:underline"
            >
              open an issue on GitHub.
            </a>
          </p>
        </div>
      </div>
      <Footer />
    </section>
  );
}
