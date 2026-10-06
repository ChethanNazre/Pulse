import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { CONTACT_EMAIL, OPERATOR_NAME, SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy">
      <p>
        {SITE_NAME} is a personal content dashboard operated by {OPERATOR_NAME} at {SITE_URL}. This page explains what
        information the site handles and why.
      </p>

      <h2>What is stored on your device</h2>
      <p>{SITE_NAME} saves your settings in your browser&apos;s local storage so they are still there when you return:</p>
      <ul>
        <li>The categories you follow.</li>
        <li>Your dark or light mode choice.</li>
        <li>The display name you enter in Settings.</li>
        <li>Items you mark as favorites (their title, description, link and image address).</li>
      </ul>
      <p>
        This information stays in your browser. We do not receive it. You can remove it at any time by clearing this
        site&apos;s data in your browser, or by removing favorites and changing settings inside the app.
      </p>

      <h2>What our server handles</h2>
      <p>
        When you open a page, load more content or search, your browser sends a request to our server that includes the
        categories you follow and any search words you typed. We use these only to return matching content. We do not
        keep them or link them to you.
      </p>
      <p>
        Like most websites, our hosting provider may record technical details such as your IP address, the time of the
        request and your browser type in server logs, for security and to keep the service running. These logs are
        handled under the provider&apos;s own policies.
      </p>
      <p>
        {SITE_NAME} has no accounts, no advertising and no analytics. {SITE_NAME} itself does not set cookies.
      </p>

      <h2>Third parties</h2>
      <ul>
        <li>
          When live data is switched on, our server requests news from NewsAPI and movie information from TMDB, using the
          categories and search words described above. Those requests come from our server, so these providers do not
          receive your IP address from us.
        </li>
        <li>
          Article and movie images may load directly from those providers or from the publishers, which means they can
          see your IP address and browser details when your browser fetches an image.
        </li>
        <li>
          Links to articles, movies and posts open other websites. Their privacy practices are their own.
        </li>
        <li>Some items are labeled as sample content. Sample content does not contact any third party.</li>
      </ul>

      <h2>Your choices</h2>
      <p>
        You can clear your stored settings and favorites at any time, as described above. If you have a question or a
        request about information we may hold about you, contact us.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        If we change how {SITE_NAME} handles information, we will update this page and the date at the top.
      </p>

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
