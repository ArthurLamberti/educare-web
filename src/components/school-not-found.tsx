import { ROOT_DOMAIN } from "@/lib/host";

export function SchoolNotFound() {
  return (
    <section className="mx-auto flex max-w-md flex-col gap-3 text-center">
      <h1 className="text-2xl font-bold">School not found</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        There is no school at this address. Check the link you received from your school, in the form{" "}
        <code className="font-mono">your-school.{ROOT_DOMAIN}</code>.
      </p>
    </section>
  );
}
