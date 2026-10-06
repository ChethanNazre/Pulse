import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { CONTACT_EMAIL, OPERATOR_NAME, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = { title: "Terms and conditions" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms and conditions">
      <p>
        These terms apply to your use of {SITE_NAME}, operated by {OPERATOR_NAME}. By using the site you agree to them.
        If you do not agree, please do not use it.
      </p>

      <h2>The service</h2>
      <p>
        {SITE_NAME} gathers news, movie recommendations and social posts into one feed that you can search, reorder and
        save. Some items may be sample content used for demonstration. Sample items are labeled as such and are not real
        articles, films or posts.
      </p>

      <h2>Third-party content</h2>
      <p>
        News, movie information, images and posts belong to their respective owners and are provided by third-party
        services. We do not write, check or endorse them. Links open other websites, which have their own terms and
        policies. Trademarks and logos belong to their owners.
      </p>

      <h2>Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>use the site for anything unlawful;</li>
        <li>attempt to disrupt the site or its servers, or overload them with automated requests;</li>
        <li>attempt to gain access to parts of the service you are not meant to reach;</li>
        <li>copy the site&apos;s code or design and present it as your own.</li>
      </ul>

      <h2>Your settings and favorites</h2>
      <p>
        Your settings and favorites are stored in your own browser. If you clear your browser data they are lost, and we
        cannot restore them.
      </p>

      <h2>Availability and changes</h2>
      <p>
        We may change, suspend or remove features, or the whole service, at any time. We do not guarantee that the
        service will be available without interruption or free of errors.
      </p>

      <h2>No warranty</h2>
      <p>
        The service and all content shown through it are provided &quot;as is&quot; and &quot;as available&quot;, without warranties of any
        kind, to the extent permitted by law. Content may be inaccurate, incomplete or out of date.
      </p>

      <h2>Limit of liability</h2>
      <p>
        To the extent permitted by law, {OPERATOR_NAME} is not liable for any loss or damage arising from your use of, or
        inability to use, the service or any third-party content or website linked from it.
      </p>

      <h2>Changes to these terms</h2>
      <p>We may update these terms. The date at the top shows when they last changed. Continued use means you accept the updated terms.</p>

      <h2>Contact</h2>
      <p>
        {CONTACT_EMAIL ? (
          <>Email <a className="text-accent underline underline-offset-4" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</>
        ) : (
          <>Contact details have not been configured yet.</>
        )}
      </p>
    </LegalPage>
  );
}
