import Link from "next/link";

export default function Home() {
  return (
    <section className="flex flex-col items-start gap-4">
      <h1 className="text-3xl font-bold">Welcome to Educare</h1>
      <p className="text-zinc-600 dark:text-zinc-400">Manage the students registered on the platform.</p>
      <Link href="/students" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
        View students
      </Link>
    </section>
  );
}
