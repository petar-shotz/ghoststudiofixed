import Link from "next/link";
import { Ghost, ArrowLeft, ShieldCheck } from "@/components/ui/icons";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your project details & privacy",
  description: "How Ghost Studio handles your information, draft choices, database storage, and email notifications.",
};

export default function Privacy() {
  return (
    <div className="site-shell">
      <header className="site-header container">
        <Link href="/" className="brand" aria-label="Ghost Studio home">
          <Ghost size={31} />
          <span>
            ghost<span className="brand-light">studio</span>
          </span>
        </Link>
        <Link href="/" className="planner-back">
          <ArrowLeft size={16} /> Back to the studio
        </Link>
      </header>

      <main id="main-content" className="privacy-page container">
        <div className="privacy-icon">
          <ShieldCheck size={35} />
        </div>
        <div className="eyebrow">YOUR IDEA DESERVES CARE AND CLARITY.</div>
        <h1>
          Your project.
          <br />
          Your details.
        </h1>
        <p className="privacy-lead">
          Here is how Ghost Studio collects, protects, and stores information when you plan a website brief or contact the studio.
        </p>

        <section>
          <h2>1. What we collect</h2>
          <p>
            When you complete the 5-step project planner at <code>/start</code>, we collect:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-neutral-700">
            <li><strong>Contact details:</strong> Your name, email address, and optional phone number.</li>
            <li><strong>Project specifications:</strong> Website name, project overview, design style, color palette, navigation style, requested pages, features, planning budget, timeline, assets ready, and design inspiration notes.</li>
          </ul>
          <p className="mt-2 text-xs text-neutral-500">
            Please do not include passwords, payment card numbers, or proprietary business secrets in your initial brief.
          </p>
        </section>

        <section>
          <h2>2. How drafts are saved on your device</h2>
          <p>
            To prevent you from losing your progress if you close your tab or refresh your browser, your website design choices (style, pages, features, and current step) are stored locally on your device in standard browser local storage.
          </p>
          <p>
            <strong>Your personal contact information (name, email, phone) and privacy consent are intentionally NOT stored in local storage</strong>.
            You must actively confirm your consent when submitting. Once your brief is submitted and confirmed with a reference number, your local draft is immediately cleared.
          </p>
        </section>

        <section>
          <h2>3. Durable database storage & internal email notification</h2>
          <p>
            When you submit your brief:
          </p>
          <ol className="list-decimal pl-5 mt-2 space-y-1 text-sm text-neutral-700">
            <li>
              <strong>Durable Storage First:</strong> Your enquiry is first saved into Ghost Studio’s persistent database, and an immutable reference identifier (e.g. <code>GS-XXXXXXXXXXXX</code>) is generated.
            </li>
            <li>
              <strong>Notification to Studio:</strong> A notification containing your complete project requirements is sent to our review mailbox (<code>p8339378@gmail.com</code>) so our studio team can evaluate your scope.
            </li>
          </ol>
          <p className="mt-2 text-sm text-neutral-700">
            Your enquiry is saved in the database even if email delivery encounters a temporary issue, ensuring your request is never lost.
          </p>
        </section>

        <section>
          <h2>4. Security, rate limiting & anti-abuse</h2>
          <p>
            We take privacy and security seriously:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-neutral-700">
            <li>We do not use advertising trackers, third-party analytics pixels, or marketing trackers.</li>
            <li>To protect against denial-of-service and automated spam, network identifiers are cryptographically hashed using one-way SHA-256 hashing. Raw IP addresses are not stored in database records.</li>
            <li>Admin portal access is protected with timing-safe credential verification, rate-limiting lockout protection, and server-validated cryptographic sessions.</li>
          </ul>
        </section>

        <section>
          <h2>5. What submitting commits you to</h2>
          <p>
            Submitting a brief is an enquiry. It does not initiate payment, enter you into a contract, or sign you up for promotional newsletters. After reviewing your brief, we reach out to discuss scope, quote, and timeline. No work begins until both parties agree.
          </p>
        </section>

        <section>
          <h2>6. Accessing or deleting your data</h2>
          <p>
            If you wish to view, update, or request the deletion of your submitted brief, simply contact us at{" "}
            <a href="mailto:p8339378@gmail.com" className="font-semibold underline text-neutral-900">
              p8339378@gmail.com
            </a>{" "}
            with your project reference (e.g. <code>GS-XXXXXXXXXXXX</code>).
          </p>
        </section>

        <div className="pt-6">
          <Link href="/start" className="button button-dark">
            Back to the project planner <ArrowLeft className="rotate-180" size={17} />
          </Link>
        </div>
      </main>

      <footer className="privacy-footer container">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-500 w-full">
          <span>ghoststudio.mk · Ghost Studio</span>
          <span>Questions? Contact p8339378@gmail.com</span>
        </div>
      </footer>
    </div>
  );
}
