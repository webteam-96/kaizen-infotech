import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPageShell } from '@/components/legal/LegalPageShell';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbSchema } from '@/lib/seo/jsonld';
import { pageMetadata } from '@/lib/seo/config';
import { SITE_CONFIG } from '@/lib/utils/constants';

// NOTE (for the Kaizen team): this Privacy Policy is drafted from the company's
// real details and the website's actual data practices (contact form → Resend
// email, newsletter email, first-party CAPTCHA, functional storage only, no
// active third-party tracking) and is aligned to Indian law (DPDP Act 2023 + IT
// Act 2000 / SPDI Rules 2011). Please have it reviewed by legal counsel and,
// where applicable, name a specific Grievance Officer before public launch.

const LEGAL_NAME = 'Kaizen Infotech Solutions Pvt. Ltd.';
const LAST_UPDATED = '16 July 2026';

export const metadata: Metadata = pageMetadata({
  title: 'Privacy Policy',
  description:
    'How Kaizen Infotech Solutions collects, uses, shares, and protects the personal information you share through this website, in line with India’s DPDP Act, 2023.',
  path: '/privacy',
});

export default function PrivacyPolicyPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Privacy Policy', path: '/privacy' },
        ])}
      />
      <LegalPageShell
        kicker="Legal"
        title="Privacy Policy"
        accentWords={['Policy']}
        intro="This Privacy Policy explains how we collect, use, and protect the information you share with us through this website."
        lastUpdated={LAST_UPDATED}
      >
        <h2>1. Introduction</h2>
        <p>
          {LEGAL_NAME} (“Kaizen Infotech”, “we”, “us”, or “our”) is committed to protecting your
          privacy. This Privacy Policy describes how we collect, use, disclose, and safeguard your
          information when you visit{' '}
          <a href={SITE_CONFIG.url}>kaizeninfotech.com</a> (the “Website”) or otherwise interact
          with us. It is published in accordance with the Digital Personal Data Protection Act,
          2023, the Information Technology Act, 2000, and the rules made thereunder. By using this
          Website, you consent to the practices described in this Policy.
        </p>

        <h2>2. Information We Collect</h2>
        <h3>Information you provide to us</h3>
        <ul>
          <li>
            <strong>Contact enquiries</strong> — your name, email address, and message (required),
            and optionally your phone number, company name, project type, and budget range, when you
            submit our contact form.
          </li>
          <li>
            <strong>Newsletter subscriptions</strong> — your email address, when you choose to
            subscribe to updates.
          </li>
          <li>
            <strong>Direct communications</strong> — any information you include when you email,
            call, or message us (for example, over WhatsApp).
          </li>
        </ul>
        <h3>Information collected automatically</h3>
        <ul>
          <li>
            <strong>Server and usage logs</strong> — like most websites, our servers may record
            technical information such as your IP address, browser type and version, device and
            operating system, referring pages, and the date and time of your visit, to operate,
            secure, and improve the Website.
          </li>
          <li>
            <strong>Local storage</strong> — we store small amounts of data on your device to make
            the site work as intended (for example, to remember that you have already seen the intro
            animation). This is first-party functional storage, not advertising tracking.
          </li>
        </ul>
        <h3>Cookies and similar technologies</h3>
        <p>
          Our Website currently uses only essential, first-party storage needed for core
          functionality and security. We do not use third-party advertising or cross-site tracking
          cookies. If we introduce privacy-respecting analytics (such as Google Analytics) in the
          future, we will update this Policy and, where required, request your consent. You can
          control or delete cookies and local storage through your browser settings.
        </p>

        <h2>3. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>respond to your enquiries and provide the information or services you request;</li>
          <li>send you our newsletter or updates, where you have asked to receive them;</li>
          <li>operate, maintain, secure, and improve the Website and our services;</li>
          <li>prevent spam, fraud, and abuse (for example, through our image CAPTCHA); and</li>
          <li>comply with applicable legal and regulatory obligations.</li>
        </ul>
        <p>
          We do not carry out automated decision-making or profiling that produces legal effects
          concerning you.
        </p>

        <h2>4. Legal Basis and Consent</h2>
        <p>
          We process your personal data on the basis of the consent you provide when you voluntarily
          submit it to us, and to pursue legitimate business purposes such as responding to your
          enquiries and securing our Website. You may withdraw your consent at any time (see “Your
          Rights” below); withdrawing consent will not affect processing carried out before the
          withdrawal.
        </p>

        <h2>5. How We Share Your Information</h2>
        <p>We do not sell or rent your personal data. We share information only as follows:</p>
        <ul>
          <li>
            <strong>Service providers</strong> — trusted third parties who process data on our
            behalf under appropriate confidentiality obligations, including our email-delivery
            provider (Resend), which transmits contact-form submissions to us, and our website
            hosting provider. Any email-marketing service we later adopt will be added here.
          </li>
          <li>
            <strong>Legal and regulatory</strong> — where required by law, court order, or a
            governmental authority, or to protect our rights, safety, or property.
          </li>
          <li>
            <strong>Business transfers</strong> — in connection with any merger, acquisition, or
            reorganisation, subject to this Policy.
          </li>
        </ul>
        <p>
          Some of these providers may process data on servers located outside India. Where that
          happens, we take reasonable steps to ensure your information continues to be protected in
          accordance with applicable law.
        </p>

        <h2>6. Data Retention</h2>
        <p>
          We retain personal data only for as long as necessary to fulfil the purposes for which it
          was collected, to provide our services, to comply with our legal obligations, resolve
          disputes, and enforce our agreements. When it is no longer required, we securely delete or
          anonymise it.
        </p>

        <h2>7. Data Security</h2>
        <p>
          We follow reasonable security practices and procedures as contemplated under the
          Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal
          Data or Information) Rules, 2011, including encrypted (HTTPS) transmission, spam
          protection, and restricted access to personal data. However, no method of transmission
          over the internet or electronic storage is completely secure, and we cannot guarantee
          absolute security.
        </p>

        <h2>8. Your Rights</h2>
        <p>
          Subject to applicable law, including the Digital Personal Data Protection Act, 2023, you
          have the right to:
        </p>
        <ul>
          <li>access the personal data we hold about you;</li>
          <li>request correction or updating of inaccurate or incomplete data;</li>
          <li>
            request erasure of your personal data, where there is no overriding legal reason to
            retain it;
          </li>
          <li>withdraw your consent to further processing; and</li>
          <li>
            nominate another individual to exercise your rights in the event of death or incapacity.
          </li>
        </ul>
        <p>
          To exercise any of these rights, contact us using the details in the “Contact Us” section
          below. We may need to verify your identity before acting on a request.
        </p>

        <h2>9. Newsletter and Marketing Choices</h2>
        <p>
          If you subscribe to our newsletter, you can opt out at any time by contacting us. We will
          action opt-out requests promptly.
        </p>

        <h2>10. Children’s Privacy</h2>
        <p>
          Our Website is intended for a business audience and is not directed at children under the
          age of 18. We do not knowingly collect personal data from children. If you believe a child
          has provided us with personal data, please contact us and we will delete it.
        </p>

        <h2>11. Third-Party Links</h2>
        <p>
          Our Website may contain links to third-party websites or services. We are not responsible
          for the privacy practices or content of those third parties, and we encourage you to
          review their privacy policies.
        </p>

        <h2>12. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time to reflect changes in our practices or
          legal requirements. The revised version will be posted on this page with an updated “Last
          updated” date. Your continued use of the Website after changes are posted constitutes
          acceptance of the revised Policy.
        </p>

        <h2>13. Contact Us / Grievance Officer</h2>
        <p>
          If you have questions, concerns, or requests regarding this Privacy Policy or your personal
          data, please contact our Grievance Officer / Data Protection contact:
        </p>
        <p>
          <strong>{LEGAL_NAME}</strong>
          <br />
          {SITE_CONFIG.address}
          <br />
          Email: <a href={`mailto:${SITE_CONFIG.contactEmail}`}>{SITE_CONFIG.contactEmail}</a>
          <br />
          Phone: <a href={`tel:${SITE_CONFIG.phone.replace(/\s+/g, '')}`}>{SITE_CONFIG.phone}</a>
        </p>
        <p>
          We will acknowledge and address your request within the timelines prescribed by applicable
          law. This Policy should be read together with our{' '}
          <Link href="/terms">Terms of Service</Link>.
        </p>
      </LegalPageShell>
    </>
  );
}
