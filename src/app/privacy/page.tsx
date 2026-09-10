import { Metadata } from "next";

import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "This Privacy Policy outlines how we collects, uses, and protects your personal information when you use our service. Learn about your rights and how we ensure your data privacy. We explain what data we collect, why we collect it, and how you can control your information.",
};

export default function Page() {
  return (
    <section>
      <Nav showButton={true} />
      <div className="mx-auto mb-6 mt-2 flex max-w-6xl flex-col gap-5 px-6 md:mb-10 md:px-10 lg:px-14">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-2xl font-semibold text-foreground md:text-4xl">
            Privacy Policy
          </h1>
          <p className="mb-1 text-xs text-foreground/70 md:text-sm">
            Last updated June 10, 2025
          </p>
        </div>
        <div>
          <h4 className="mb-1 text-base font-medium text-foreground md:text-xl">
            Information We Collect
          </h4>
          <ul className="space-y-2 text-sm text-foreground/70 md:text-base">
            <li>
              • Personal information, including your name, email address,
              profile picture, and institutional affiliation
            </li>
            <li>
              • Additional background information provided by instructors
              relevant to course management
            </li>
            <li>
              • Usage data such as login details, IP addresses, browser types,
              device information, pages visited, and features used
            </li>
            <li>
              • Course data, including assignments, grades, forum posts, and
              classwork scores
            </li>
            <li>
              • Communication content like messages in group chats and personal
              notes
            </li>
            <li>
              • Cookies and similar technologies to enhance functionality,
              personalize your experience, and analyze usage (you can manage
              cookie preferences in your browser settings)
            </li>
          </ul>
        </div>
        <div>
          <h4 className="mb-1 text-base font-medium text-foreground md:text-xl">
            How We Use Your Information
          </h4>
          <p className="text-sm text-foreground/70 md:text-base">
            We use your information to operate and improve the Service,
            personalize your experience, communicate with you, and ensure
            compliance with legal obligations.
          </p>
        </div>
        <div>
          <h4 className="mb-1 text-base font-medium text-foreground md:text-xl">
            How We Share Your Information
          </h4>
          <ul className="space-y-2 text-sm text-foreground/70 md:text-base">
            <li>
              • Third-party service providers under strict confidentiality
              agreements
            </li>
            <li>
              • Vercel for hosting and Service access (does not directly store
              user data)
            </li>
            <li>• Supabase for secure user data storage</li>
            <li>
              • Educational institutions for relevant course data when
              applicable
            </li>
            <li>
              • Group chat participants can see your name, profile picture, and
              messages
            </li>
            <li>• Notes remain private unless you choose to share them</li>
            <li>• Instructors can access student submissions and grades</li>
            <li>
              • Legal authorities when required by law or as part of business
              transfers when necessary
            </li>
          </ul>
        </div>
        <div>
          <h4 className="mb-1 text-base font-medium text-foreground md:text-xl">
            Security
          </h4>
          <p className="text-sm text-foreground/70 md:text-base">
            We implement industry-standard security measures to protect your
            data. However, no method of transmission over the internet or
            electronic storage is entirely secure.
          </p>
        </div>
        <div>
          <h4 className="mb-1 text-base font-medium text-foreground md:text-xl">
            Children&apos;s Privacy
          </h4>
          <p className="text-sm text-foreground/70 md:text-base">
            Our Service is not intended for children under 13. We do not
            knowingly collect personal information from children. If you believe
            we have collected such information, please contact us immediately.
          </p>
        </div>
        <div>
          <h4 className="mb-1 text-base font-medium text-foreground md:text-xl">
            Your Choices & Data Deletion
          </h4>
          <p className="text-sm text-foreground/70 md:text-base">
            You can access, update, or correct your personal information in your
            account settings. You may also close your account, which will remove
            your data from the Service.
          </p>
        </div>
        <div>
          <h4 className="mb-1 text-base font-medium text-foreground md:text-xl">
            Changes to this Privacy Policy
          </h4>
          <p className="text-sm text-foreground/70 md:text-base">
            We may update this Privacy Policy periodically. Any changes will be
            posted on the Service with an updated effective date.
          </p>
        </div>
        <div>
          <h4 className="mb-1 text-base font-medium text-foreground md:text-xl">
            Contact Us
          </h4>
          <p className="text-sm text-foreground md:text-base">
            If you have any questions or concerns about this Privacy Policy, you
            can contact us at{" "}
            <a
              href="mailto:scholaflow@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#5c7cfa] hover:underline"
            >
              scholaflow@gmail.com
            </a>{" "}
            or{" "}
            <a
              href="https://github.com/LuisCabantac/scholaflow/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#5c7cfa] hover:underline"
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
