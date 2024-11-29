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
    <section className="relative min-h-screen bg-[#f3f6ff] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(116,143,252,0.2),rgba(255,255,255,0))]">
      <Nav showButton={true} />
      <div className="mx-4 mb-4 grid gap-4 md:mx-8 md:mb-8">
        <div className="grid gap-1">
          <h1 className="text-2xl font-semibold">Privacy Policy</h1>
          <p className="text-base">
            This Privacy Policy describes how we collects, uses, and shares your
            personal information when you use our free learning management
            system (LMS) web application. This policy applies to all users.
          </p>
        </div>
        <div>
          <h4 className="text-lg font-semibold">Information We Collect</h4>
          <p className="text-base">
            We collect personal information, including your name, email address,
            profile picture, and institutional affiliation. Instructors may
            provide additional background information relevant to course
            management. We also collect usage data such as login details, IP
            addresses, browser types, device information, pages visited, and
            features used. Course data, including assignments, grades, forum
            posts, and quiz scores, may be stored, along with communication
            content like messages in group chats and personal notes. Cookies and
            similar technologies are employed to enhance functionality,
            personalize your experience, and analyze usage. You can manage
            cookie preferences in your browser settings.
          </p>
        </div>

        <div>
          <h4 className="text-lg font-semibold">How We Use Your Information</h4>
          <p className="text-base">
            We use your information to operate and improve the Service,
            personalize your experience, communicate with you, and ensure
            compliance with legal obligations.
          </p>
        </div>
        <div>
          <h4 className="text-lg font-semibold">
            How We Share Your Information
          </h4>
          <p className="text-base">
            Your information may be shared with third-party service providers
            under strict confidentiality. For example, Vercel facilitates
            hosting and access to the Service but does not directly store user
            data. Supabase securely stores user data. Relevant course data may
            be shared with educational institutions if applicable. Your name,
            profile picture, and messages are visible in group chats. Notes are
            private unless shared. Instructors can access student submissions
            and grades. We may disclose information to legal authorities or as
            part of a business transfer if necessary.
          </p>
        </div>
        <div>
          <h4 className="text-lg font-semibold">Security</h4>
          <p className="text-base">
            We implement industry-standard security measures to protect your
            data. However, no method of transmission over the internet or
            electronic storage is entirely secure.
          </p>
        </div>
        <div>
          <h4 className="text-lg font-semibold">Children&apos;s Privacy</h4>
          <p className="text-base">
            Our Service is not intended for children under 13. We do not
            knowingly collect personal information from children. If you believe
            we have collected such information, please contact us immediately.
          </p>
        </div>
        <div>
          <h4 className="text-lg font-semibold">
            Your Choices & Data Deletion
          </h4>
          <p className="text-base">
            You can access, update, or correct your personal information in your
            account settings. You may also close your account, which will remove
            your data from the Service.
          </p>
        </div>
        <div>
          <h4 className="text-lg font-semibold">
            Changes to this Privacy Policy
          </h4>
          <p className="text-base">
            We may update this Privacy Policy periodically. Any changes will be
            posted on the Service with an updated effective date.
          </p>
        </div>
        <div>
          <h4 className="text-lg font-semibold">Contact Us</h4>
          <p className="text-base">
            If you have any questions or concerns about this Privacy Policy, you
            can contact us at{" "}
            <a
              href="mailto:scholaflow@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#5c7cfa] hover:underline"
            >
              scholaflow@gmail.com.
            </a>
          </p>
        </div>
      </div>
      <Footer />
    </section>
  );
}
