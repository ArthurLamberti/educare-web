import Link from "next/link";
import { Suspense } from "react";

import { requireUser, type Role } from "@/lib/auth";
import { ROOT_DOMAIN } from "@/lib/host";
import { getTenantSlug } from "@/lib/tenant";

const LINKS: Record<Role, { href: string; label: string }[]> = {
  ADMIN: [
    { href: "/teachers", label: "Manage teachers" },
    { href: "/students", label: "View students" },
  ],
  TEACHER: [{ href: "/students", label: "View students" }],
  STUDENT: [],
};

export default function Home() {
  return (
    <Suspense fallback={<p className="text-zinc-500">Loading...</p>}>
      <HomeContent />
    </Suspense>
  );
}

async function HomeContent() {
  if (!(await getTenantSlug())) return <Landing />;
  const user = await requireUser();

  return (
    <section className="flex flex-col items-start gap-4">
      <h1 className="text-3xl font-bold">Welcome, {user.name}</h1>
      <p className="text-zinc-600 dark:text-zinc-400">{user.tenant.name}</p>
      <div className="flex gap-3">
        {LINKS[user.role].map((link) => (
          <Link key={link.href} href={link.href} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
            {link.label}
          </Link>
        ))}
      </div>
    </section>
  );
}

/** Root domain: no school selected. */
function Landing() {
  return (
    <section className="flex flex-col items-start gap-4">
      <h1 className="text-3xl font-bold">Welcome to Educare</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Each school has its own address. Open the link you received from your school, in the form{" "}
        <code className="font-mono">your-school.{ROOT_DOMAIN}</code>.
      </p>
    </section>
  );
}
