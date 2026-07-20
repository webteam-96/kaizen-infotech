import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPageShell } from '@/components/legal/LegalPageShell';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbSchema } from '@/lib/seo/jsonld';
import { pageMetadata } from '@/lib/seo/config';
import { SITE_CONFIG } from '@/lib/utils/constants';

// NOTE (for the Kaizen team): these Terms are drafted from the company's real
// details and the actual nature of this website (an informational marketing site
// — no e-commerce, no accounts, engagements handled via separate written
// agreements) and are aligned to Indian law. Please have them reviewed by legal
// counsel before public launch, and confirm the governing-jurisdiction city.

const LEGAL_NAME = 'Kaizen Infotech Solutions Pvt. Ltd.';
const LAST_UPDATED = '16 July 2026';

export const metadata: Metadata = pageMetadata({
  title: 'Terms of Service',
  description:
    'The terms and conditions governing your use of the Kaizen Infotech Solutions website, including intellectual property, disclaimers, liability, and governing law.',
  path: '/terms',
});

export default function TermsOfServicePage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Terms of Service', path: '/terms' },
        ])}
      />
      <LegalPageShell
        kicker="Legal"
        title="Terms of Service"
        accentWords={['Service']}
        intro="These terms and conditions govern your access to and use of the Kaizen Infotech Solutions website."
        lastUpdated={LAST_UPDATED}
      >
        <h2>1. Acceptance of Terms</h2>
        <p>
          These Terms of Service (“Terms”) govern your access to and use of the website{' '}
          <a href={SITE_CONFIG.url}>kaizeninfotech.com</a> (the “Website”), operated by {LEGAL_NAME}{' '}
          (“Kaizen Infotech”, “we”, “us”, or “our”). By accessing or using the Website, you agree to
          be bound by these Terms and by our <Link href="/privacy-policy">Privacy Policy</Link>. If you do
          not agree, please do not use the Website.
        </p>

        <h2>2. Definitions</h2>
        <ul>
          <li>
            <strong>“Website”</strong> — kaizeninfotech.com and all pages, content, and features made
            available through it.
          </li>
          <li>
            <strong>“Content”</strong> — all text, graphics, logos, images, designs, code, and other
            material on the Website.
          </li>
          <li>
            <strong>“Services”</strong> — the software development, mobile app, event management, web
            portal, digital marketing, and related professional services described on the Website.
          </li>
          <li>
            <strong>“You” / “User”</strong> — any person who accesses or uses the Website.
          </li>
        </ul>

        <h2>3. Use of the Website</h2>
        <p>
          We grant you a limited, non-exclusive, non-transferable, and revocable licence to access
          and use the Website for your personal or internal business purposes, subject to these
          Terms. You agree not to:
        </p>
        <ul>
          <li>use the Website for any unlawful, harmful, or fraudulent purpose;</li>
          <li>
            copy, reproduce, distribute, or create derivative works from the Content without our
            prior written permission;
          </li>
          <li>
            attempt to gain unauthorised access to the Website, its servers, or any connected
            systems;
          </li>
          <li>introduce viruses, malware, or other harmful code;</li>
          <li>
            use automated means (bots or scrapers) to access or collect data from the Website, except
            for legitimate search-engine indexing; or
          </li>
          <li>interfere with or disrupt the integrity or performance of the Website.</li>
        </ul>

        <h2>4. Intellectual Property</h2>
        <p>
          All Content on the Website, including the Kaizen Infotech name, logo, brand elements, text,
          graphics, and design, is owned by or licensed to {LEGAL_NAME} and is protected by
          applicable intellectual-property laws. Except as expressly permitted, you may not use,
          reproduce, or exploit any Content without our prior written consent. All rights not
          expressly granted are reserved.
        </p>

        <h2>5. Services and Engagements</h2>
        <p>
          The information on this Website is provided for general information only and does not
          constitute a binding offer, quotation, or professional advice. Any engagement for our
          Services is governed by a separate written agreement, proposal, or statement of work
          executed between you and Kaizen Infotech. Nothing on this Website, by itself, creates a
          contract for Services.
        </p>

        <h2>6. Enquiries and Submissions</h2>
        <p>
          When you submit an enquiry or other information through the Website, you confirm that the
          information is accurate and that you are authorised to provide it. Unless we have signed a
          separate non-disclosure agreement with you, information submitted through the Website’s
          public forms is not treated as confidential. Please do not send sensitive or confidential
          material through the contact form.
        </p>

        <h2>7. Third-Party Links and Services</h2>
        <p>
          The Website may contain links to third-party websites, tools, or services that we do not
          control. We provide these links for convenience only and are not responsible for the
          content, products, or practices of any third party. Accessing them is at your own risk and
          subject to their terms.
        </p>

        <h2>8. Disclaimers</h2>
        <p>
          The Website and its Content are provided on an “as is” and “as available” basis, without
          warranties of any kind, whether express or implied, including warranties of merchantability,
          fitness for a particular purpose, accuracy, or non-infringement. We do not warrant that the
          Website will be uninterrupted, error-free, secure, or free of harmful components. Statistics,
          case studies, and outcomes described on the Website relate to specific engagements and are
          not a guarantee of future results.
        </p>

        <h2>9. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, {LEGAL_NAME}, its directors, employees, and
          affiliates will not be liable for any indirect, incidental, special, consequential, or
          punitive damages, or any loss of profits, data, business, or goodwill, arising out of or in
          connection with your use of (or inability to use) the Website, even if we have been advised
          of the possibility of such damages.
        </p>

        <h2>10. Indemnification</h2>
        <p>
          You agree to indemnify and hold harmless {LEGAL_NAME} and its personnel from any claims,
          damages, liabilities, costs, or expenses (including reasonable legal fees) arising out of
          your breach of these Terms or your misuse of the Website.
        </p>

        <h2>11. Privacy</h2>
        <p>
          Your use of the Website is also governed by our{' '}
          <Link href="/privacy-policy">Privacy Policy</Link>, which explains how we handle your personal
          data. By using the Website, you consent to the processing described there.
        </p>

        <h2>12. Changes to the Website and Terms</h2>
        <p>
          We may modify, suspend, or discontinue any part of the Website at any time without notice.
          We may also update these Terms from time to time; the revised version will be posted on this
          page with an updated “Last updated” date. Your continued use of the Website after changes
          are posted constitutes acceptance of the revised Terms.
        </p>

        <h2>13. Governing Law and Jurisdiction</h2>
        <p>
          These Terms are governed by and construed in accordance with the laws of India. Subject to
          applicable law, the courts at Thane, Maharashtra, India will have exclusive jurisdiction
          over any dispute arising out of or relating to these Terms or the Website.
        </p>

        <h2>14. Contact Us</h2>
        <p>For any questions about these Terms, please contact us:</p>
        <p>
          <strong>{LEGAL_NAME}</strong>
          <br />
          {SITE_CONFIG.address}
          <br />
          Email: <a href={`mailto:${SITE_CONFIG.contactEmail}`}>{SITE_CONFIG.contactEmail}</a>
          <br />
          Phone: <a href={`tel:${SITE_CONFIG.phone.replace(/\s+/g, '')}`}>{SITE_CONFIG.phone}</a>
        </p>
      </LegalPageShell>
    </>
  );
}
