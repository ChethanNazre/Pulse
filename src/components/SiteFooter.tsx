import Link from "next/link";
import { CONTACT_EMAIL, OPERATOR_NAME } from "@/lib/site";

export default function SiteFooter() {
  return (
    <footer className="mt-16 flex flex-col items-center gap-1 border-t border-line pb-24 pt-6 text-center text-sm text-muted md:flex-row md:justify-center md:gap-6 md:pb-6">
      <nav aria-label="Legal" className="flex flex-col items-center md:flex-row md:gap-6">
        <Link href="/privacy" className="inline-flex min-h-11 items-center underline-offset-4 hover:text-fg hover:underline">Privacy policy</Link>
        <Link href="/terms" className="inline-flex min-h-11 items-center underline-offset-4 hover:text-fg hover:underline">Terms and conditions</Link>
        {CONTACT_EMAIL && (
          <a href={`mailto:${CONTACT_EMAIL}`} className="inline-flex min-h-11 items-center underline-offset-4 hover:text-fg hover:underline">Contact</a>
        )}
      </nav>
      <p>Copyright {new Date().getFullYear()} {OPERATOR_NAME}</p>
    </footer>
  );
}
