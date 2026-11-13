import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SettingsForm } from "@/components/settings-form";
import { canEditSettings, placeWord, requireUser } from "@/lib/auth";
import { ROOT_DOMAIN } from "@/lib/host";
import { timeZoneOptions } from "@/lib/time-zones";

export const metadata: Metadata = { title: "Configurações" };

export default async function SettingsPage() {
  const user = await requireUser(["ADMIN", "TEACHER"]);
  if (!canEditSettings(user)) redirect("/not-allowed");
  const place = placeWord(user.tenant.kind);

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Configurações {place === "espaço" ? "do espaço" : "da escola"}</h1>
        <p className="text-sm text-ink-500">
          Endereço:{" "}
          <span className="font-mono">
            {user.tenant.slug}.{ROOT_DOMAIN}
          </span>{" "}
          (não pode ser mudado)
        </p>
      </div>
      <SettingsForm name={user.tenant.name} timeZone={user.tenant.timeZone} place={place} timeZones={timeZoneOptions()} />
    </section>
  );
}
