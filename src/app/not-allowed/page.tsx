import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Not allowed" };

export default function NotAllowedPage() {
  return (
    <section className="flex flex-col items-start gap-3">
      <h1 className="text-2xl font-bold">You don&apos;t have access to this page</h1>
      <p className="text-zinc-600 dark:text-zinc-400">Your account does not have permission to see this content.</p>
      <Link href="/" className="text-sm font-medium text-indigo-600 hover:underline">
        Go to the home page
      </Link>
    </section>
  );
}
