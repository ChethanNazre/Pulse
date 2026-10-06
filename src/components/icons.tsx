import type { SVGProps } from "react";

const base = (p: SVGProps<SVGSVGElement>) => ({
  width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
  strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true, ...p,
});

export const HomeIcon = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /></svg>;
export const TrendIcon = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M3 17l6-6 4 4 8-8" /><path d="M15 7h6v6" /></svg>;
export const HeartIcon = ({ filled, ...p }: SVGProps<SVGSVGElement> & { filled?: boolean }) => <svg {...base(p)} fill={filled ? "currentColor" : "none"}><path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z" /></svg>;
export const GearIcon = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></svg>;
export const SearchIcon = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>;
export const SunIcon = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>;
export const MoonIcon = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>;
export const SidebarIcon = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16" /></svg>;
export const UserIcon = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><circle cx="12" cy="8" r="4" /><path d="M4.5 21a7.5 7.5 0 0 1 15 0" /></svg>;
export const TrashIcon = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M4 7h16M10 11v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3" /></svg>;
export const EyeOffIcon = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.9 5.2A10.7 10.7 0 0 1 12 5c5.5 0 9 7 9 7a15.8 15.8 0 0 1-3.1 3.8M6.2 6.2C3.9 7.8 3 12 3 12s3.5 7 9 7a9.8 9.8 0 0 0 3-.5" /></svg>;
export const PhotoIcon = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9" r="1.5" /><path d="m21 15-5-5L5 20" /></svg>;
export const GripIcon = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><circle cx="9" cy="6" r="1" /><circle cx="15" cy="6" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="9" cy="18" r="1" /><circle cx="15" cy="18" r="1" /></svg>;
export const ChevronUp = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)} width={16} height={16}><path d="M6 15l6-6 6 6" /></svg>;
export const ChevronDown = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)} width={16} height={16}><path d="M6 9l6 6 6-6" /></svg>;
export const CheckIcon = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)} width={16} height={16}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>;
export const PulseMark = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)} width={26} height={26} strokeWidth={2.2}><path d="M2 12h5l2.5-6 5 12L17 12h5" /></svg>;
