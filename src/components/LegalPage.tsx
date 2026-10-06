import { LEGAL_UPDATED } from "@/lib/site";

export default function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="max-w-2xl [&_h2]:mb-2 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_li]:mt-1 [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-muted">Last updated {LEGAL_UPDATED}</p>
      {children}
    </article>
  );
}
