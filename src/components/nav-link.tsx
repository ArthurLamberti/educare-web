"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Header link; the current section is underlined in highlighter yellow. */
export function NavLink({ href, label, count }: { href: string; label: string; count: number }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-1.5 border-b-2 py-1 text-sm whitespace-nowrap transition-colors ${
        active ? "border-highlight font-bold text-white" : "border-transparent text-brand-100 hover:border-brand-400 hover:text-white"
      }`}
    >
      {label}
      {count > 0 && (
        <span aria-label={`${count} pendentes`} className="rounded-sm bg-highlight px-1.5 text-xs font-bold text-ink-900">
          {count}
        </span>
      )}
    </Link>
  );
}
