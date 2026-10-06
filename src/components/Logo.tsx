/** Flat mark: a pulse line on a solid square. Also used as the favicon (src/app/icon.svg). */
export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="6" fill="rgb(var(--accent))" />
      <polyline points="5,17 11,17 14,9 18,24 21,17 27,17" fill="none" stroke="rgb(var(--on-accent))" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
