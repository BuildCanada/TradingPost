import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Notice",
  description: "Build Canada privacy notice — how we collect, use, and protect your information.",
};

export default function PrivacyNoticePage() {
  return (
    <div className="mx-[10px] my-[10px] border border-border-light bg-bg">
      <article className="animate-fade-in max-w-2xl mx-auto px-5 pt-[50px] pb-[60px]">
        <h1 className="type-title mb-8">Privacy Notice</h1>

        <section className="space-y-6">
          <div>
            <h2 className="type-h3 text-dark mb-2">Who we are</h2>
            <p className="type-body text-text-secondary leading-relaxed">
              Build Canada&apos;s Prosperity Inc. (&ldquo;Build Canada&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) is a non-profit, non-partisan community for builders. We respect your privacy.
            </p>
          </div>

          <div>
            <h2 className="type-h3 text-dark mb-2">What we collect</h2>
            <p className="type-body text-text-secondary leading-relaxed">
              Information you give us (e.g., name, email, postal code, city/chapter, RSVPs, survey responses, messages). Basic device/usage data from cookies/analytics. Payment info is handled by our providers; we don&apos;t store full card numbers.
            </p>
          </div>

          <div>
            <h2 className="type-h3 text-dark mb-2">Why we use it</h2>
            <p className="type-body text-text-secondary leading-relaxed">
              To run our community and events, communicate with you, improve our programs, ensure safety, and meet legal requirements. We rely on your consent, which you can withdraw (we&apos;ll explain any impacts).
            </p>
          </div>

          <div>
            <h2 className="type-h3 text-dark mb-2">Sharing</h2>
            <p className="type-body text-text-secondary leading-relaxed">
              We use trusted service providers (email, ticketing, payments, analytics) under contracts that protect your information. We <strong>do not sell</strong> personal information.
            </p>
          </div>

          <div>
            <h2 className="type-h3 text-dark mb-2">Storage &amp; transfers</h2>
            <p className="type-body text-text-secondary leading-relaxed">
              Your information may be stored or accessed outside your province or Canada by our providers. We remain responsible for it and apply safeguards appropriate to the sensitivity of the data.
            </p>
          </div>

          <div>
            <h2 className="type-h3 text-dark mb-2">Retention</h2>
            <p className="type-body text-text-secondary leading-relaxed">
              We keep information only as long as needed for the purposes above or as required by law, then delete or de-identify it.
            </p>
          </div>

          <div>
            <h2 className="type-h3 text-dark mb-2">Your choices &amp; rights</h2>
            <p className="type-body text-text-secondary leading-relaxed">
              Unsubscribe from emails anytime. You may request access to or correction of your information, or ask us to withdraw consent. Contact us at{" "}
              <a href="mailto:hello@buildcanada.com" className="underline hover:text-dark transition-colors">
                hello@buildcanada.com
              </a>.
            </p>
          </div>

          <div>
            <h2 className="type-h3 text-dark mb-2">Security</h2>
            <p className="type-body text-text-secondary leading-relaxed">
              We use administrative, technical, and physical safeguards. No method is 100% secure.
            </p>
          </div>

          <div>
            <h2 className="type-h3 text-dark mb-2">Children</h2>
            <p className="type-body text-text-secondary leading-relaxed">
              Our services aren&apos;t directed to children under 13. If a child provided information, contact us to remove it.
            </p>
          </div>

          <div>
            <h2 className="type-h3 text-dark mb-2">Questions or complaints</h2>
            <p className="type-body text-text-secondary leading-relaxed">
              Email us at{" "}
              <a href="mailto:hello@buildcanada.com" className="underline hover:text-dark transition-colors">
                hello@buildcanada.com
              </a>. You may also contact the Office of the Privacy Commissioner of Canada or your provincial privacy regulator.
            </p>
          </div>

          <div>
            <h2 className="type-h3 text-dark mb-2">Updates</h2>
            <p className="type-body text-text-secondary leading-relaxed">
              We may update this Notice from time to time. The latest version will always apply.
            </p>
          </div>

          <p className="type-label text-text-muted pt-4 border-t border-border-light">
            Effective: September 6, 2025
          </p>
        </section>
      </article>
    </div>
  );
}
