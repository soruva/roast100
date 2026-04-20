// ============================================================
// FILE: app/legal/page.tsx
// Terms of Service + Privacy Policy for Roast100
// Route: /legal
// ============================================================

"use client";
import { useState } from "react";

export default function Legal() {
  const [tab, setTab] = useState<"terms" | "privacy" | "refund">("terms");

  const containerStyle: any = {
    minHeight: "100vh",
    background: "#fdfaf7",
    fontFamily: "'Georgia', serif",
    color: "#1a1a1a",
  };

  const navStyle: any = {
    background: "#0f0a07",
    padding: "20px 40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  };

  const logoStyle: any = {
    fontFamily: "Georgia, serif",
    fontStyle: "italic",
    fontWeight: "900",
    fontSize: "22px",
    background: "linear-gradient(135deg,#ff6b00,#ee0979)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    textDecoration: "none",
  };

  const contentStyle: any = {
    maxWidth: "760px",
    margin: "0 auto",
    padding: "60px 24px",
  };

  const h1Style: any = {
    fontSize: "42px",
    fontWeight: "900",
    letterSpacing: "-2px",
    marginBottom: "8px",
    fontStyle: "italic",
  };

  const dateStyle: any = {
    fontSize: "12px",
    color: "#aaa",
    fontFamily: "monospace",
    letterSpacing: "2px",
    marginBottom: "48px",
  };

  const h2Style: any = {
    fontSize: "18px",
    fontWeight: "900",
    marginTop: "40px",
    marginBottom: "12px",
    letterSpacing: "-0.5px",
  };

  const pStyle: any = {
    fontSize: "15px",
    lineHeight: 1.8,
    color: "#444",
    marginBottom: "16px",
  };

  const tabStyle = (active: boolean): any => ({
    padding: "10px 24px",
    borderRadius: "100px",
    fontSize: "12px",
    fontFamily: "monospace",
    fontWeight: "700",
    letterSpacing: "1px",
    cursor: "pointer",
    border: "none",
    background: active
      ? "linear-gradient(135deg,#ff6b00,#ee0979)"
      : "rgba(0,0,0,0.06)",
    color: active ? "#fff" : "#888",
    transition: "all 0.2s",
  });

  return (
    <div style={containerStyle}>
      {/* Nav */}
      <nav style={navStyle}>
        <a href="/" style={logoStyle}>
          Roast100
        </a>
        <span
          style={{
            fontSize: "11px",
            color: "rgba(255,255,255,0.3)",
            fontFamily: "monospace",
            letterSpacing: "2px",
          }}
        >
          LEGAL
        </span>
      </nav>

      <div style={contentStyle}>
        {/* Tab switcher */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "48px",
            flexWrap: "wrap",
          }}
        >
          <button
            style={tabStyle(tab === "terms")}
            onClick={() => setTab("terms")}
          >
            TERMS OF SERVICE
          </button>
          <button
            style={tabStyle(tab === "privacy")}
            onClick={() => setTab("privacy")}
          >
            PRIVACY POLICY
          </button>
          <button
            style={tabStyle(tab === "refund")}
            onClick={() => setTab("refund")}
          >
            REFUND POLICY
          </button>
        </div>

        {/* ── TERMS OF SERVICE ── */}
        {tab === "terms" && (
          <div>
            <h1 style={h1Style}>Terms of Service</h1>
            <p style={dateStyle}>LAST UPDATED: APRIL 2026</p>

            <p style={pStyle}>
              By using Roast100 ("Service"), you agree to these Terms. Please
              read them carefully. If you do not agree, do not use the Service.
            </p>

            <h2 style={h2Style}>1. What Roast100 Does</h2>
            <p style={pStyle}>
              Roast100 is an AI-powered website feedback tool. You submit a URL
              and/or product description, and our system generates critical
              feedback using large language models. The output is for
              entertainment and informational purposes only.
            </p>

            <h2 style={h2Style}>2. No Professional Advice</h2>
            <p style={pStyle}>
              Nothing produced by Roast100 constitutes professional business,
              legal, technical, or marketing advice. AI-generated feedback may
              be inaccurate, incomplete, or irrelevant to your specific
              situation. Use the output at your own discretion.
            </p>

            <h2 style={h2Style}>3. Payment</h2>
            <p style={pStyle}>
              The core Roast service is priced at $5 USD as a one-time payment.
              An optional Fix Plan is available for an additional $10 USD. All
              payments are processed securely by Stripe. By completing payment,
              you authorize Roast100 to charge your selected payment method.
            </p>

            <h2 style={h2Style}>4. Acceptable Use</h2>
            <p style={pStyle}>
              You may only submit URLs and descriptions for websites or products
              you own or have permission to analyze. You may not use Roast100 to
              analyze competitors' internal systems, generate defamatory
              content, or engage in any unlawful activity.
            </p>

            <h2 style={h2Style}>5. Intellectual Property</h2>
            <p style={pStyle}>
              You retain ownership of any URLs or descriptions you submit. The
              AI-generated output is provided to you for personal and commercial
              use. Roast100 retains no rights over your submitted content.
            </p>

            <h2 style={h2Style}>6. Disclaimer of Warranties</h2>
            <p style={pStyle}>
              The Service is provided "as is" without warranty of any kind. We
              do not guarantee that the AI feedback will be accurate, useful, or
              free from errors. Roast100 is not liable for any business
              decisions made based on the output.
            </p>

            <h2 style={h2Style}>7. Limitation of Liability</h2>
            <p style={pStyle}>
              To the maximum extent permitted by law, Roast100's total liability
              to you for any claim arising from use of the Service shall not
              exceed the amount you paid for the specific transaction in
              question.
            </p>

            <h2 style={h2Style}>8. Changes to Terms</h2>
            <p style={pStyle}>
              We may update these Terms at any time. Continued use of the
              Service after changes constitutes acceptance of the new Terms.
            </p>

            <h2 style={h2Style}>9. Contact</h2>
            <p style={pStyle}>
              For questions about these Terms, contact us at:{" "}
              <strong>support@soruvalab.com</strong>
            </p>
          </div>
        )}

        {/* ── PRIVACY POLICY ── */}
        {tab === "privacy" && (
          <div>
            <h1 style={h1Style}>Privacy Policy</h1>
            <p style={dateStyle}>LAST UPDATED: APRIL 2026</p>

            <p style={pStyle}>
              Roast100 is committed to protecting your privacy. This policy
              explains what data we collect and how we use it.
            </p>

            <h2 style={h2Style}>1. Information We Collect</h2>
            <p style={pStyle}>
              <strong>Information you provide:</strong> The URL and/or product
              description you submit for analysis. This content is used solely
              to generate your feedback.
            </p>
            <p style={pStyle}>
              <strong>Payment information:</strong> We do not store your credit
              card details. All payment data is handled by Stripe, Inc. We
              receive only a confirmation of payment and a transaction ID.
            </p>
            <p style={pStyle}>
              <strong>Usage data:</strong> We may collect basic analytics such
              as page views and session duration to improve the Service. This
              data is anonymized and not linked to individuals.
            </p>

            <h2 style={h2Style}>2. How We Use Your Information</h2>
            <p style={pStyle}>
              We use the information you submit exclusively to generate AI
              feedback for your session. We do not sell, rent, or share your
              submitted URLs or descriptions with third parties for marketing
              purposes.
            </p>

            <h2 style={h2Style}>3. Data Retention</h2>
            <p style={pStyle}>
              Submitted URLs and descriptions may be retained in our database
              for up to 30 days for operational purposes (e.g., refund
              processing), after which they are deleted. We do not use your data
              to train AI models.
            </p>

            <h2 style={h2Style}>4. Third-Party Services</h2>
            <p style={pStyle}>
              <strong>Stripe:</strong> Payment processing. Subject to Stripe's
              Privacy Policy.
            </p>
            <p style={pStyle}>
              <strong>Groq:</strong> AI inference provider. Submitted content is
              processed through Groq's API. Subject to Groq's Privacy Policy.
            </p>
            <p style={pStyle}>
              <strong>Supabase:</strong> Database hosting. Data is stored on
              Supabase infrastructure.
            </p>
            <p style={pStyle}>
              <strong>Vercel:</strong> Hosting provider. Subject to Vercel's
              Privacy Policy.
            </p>

            <h2 style={h2Style}>5. Cookies</h2>
            <p style={pStyle}>
              Roast100 uses minimal cookies necessary for session management and
              payment processing. We do not use advertising or tracking cookies.
            </p>

            <h2 style={h2Style}>6. Your Rights</h2>
            <p style={pStyle}>
              You may request deletion of any data associated with your session
              by contacting us. We will respond within 30 days.
            </p>

            <h2 style={h2Style}>7. Children's Privacy</h2>
            <p style={pStyle}>
              Roast100 is not intended for users under the age of 13. We do not
              knowingly collect data from children.
            </p>

            <h2 style={h2Style}>8. Contact</h2>
            <p style={pStyle}>
              For privacy-related requests:{" "}
              <strong>support@soruvalab.com</strong>
            </p>
          </div>
        )}

        {/* ── REFUND POLICY ── */}
        {tab === "refund" && (
          <div>
            <h1 style={h1Style}>Refund Policy</h1>
            <p style={dateStyle}>LAST UPDATED: APRIL 2026</p>

            <p style={pStyle}>
              We want you to be satisfied with Roast100. If you are not happy
              with your results, we offer a hassle-free refund.
            </p>

            <h2 style={h2Style}>Full Refund — No Questions Asked</h2>
            <p style={pStyle}>
              If you are not satisfied with your Roast results, you may request
              a full refund within <strong>7 days</strong> of your purchase.
              Simply click the "↩ Refund" button on your results page, or
              contact us at support@soruvalab.com with your transaction ID.
            </p>

            <h2 style={h2Style}>How Refunds Work</h2>
            <p style={pStyle}>
              Refunds are processed automatically through Stripe. Once approved,
              the refund will appear on your original payment method within{" "}
              <strong>5–10 business days</strong>, depending on your bank or
              card issuer.
            </p>

            <h2 style={h2Style}>Fix Plan Refunds</h2>
            <p style={pStyle}>
              The optional $10 Fix Plan is also eligible for a full refund
              within 7 days if you are not satisfied with the output.
            </p>

            <h2 style={h2Style}>Contact</h2>
            <p style={pStyle}>
              For refund requests: <strong>support@soruvalab.com</strong>
            </p>
          </div>
        )}

        {/* Back link */}
        <div
          style={{
            marginTop: "60px",
            paddingTop: "40px",
            borderTop: "1px solid #e0e0e0",
          }}
        >
          <a
            href="/"
            style={{
              fontSize: "13px",
              color: "#aaa",
              fontFamily: "monospace",
              textDecoration: "none",
              letterSpacing: "1px",
            }}
          >
            ← Back to Roast100
          </a>
        </div>
      </div>
    </div>
  );
}
