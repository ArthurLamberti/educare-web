"use server";

import { refresh } from "next/cache";

import { ApiError } from "@/lib/api";
import { canEditSettings, requireUser } from "@/lib/auth";
import { updateSettings } from "@/lib/settings";

export type SettingsState = {
  message?: string;
  saved?: boolean;
  errors?: Partial<Record<"name" | "timeZone", string>>;
  values?: { name: string; timeZone: string };
};

export async function saveSettings(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
  const user = await requireUser(["ADMIN", "TEACHER"]);
  if (!canEditSettings(user)) return { message: "Só a administração da escola pode mudar estas configurações." };
  const values = { name: String(formData.get("name") ?? "").trim(), timeZone: String(formData.get("timeZone") ?? "") };
  try {
    await updateSettings(values);
  } catch (error) {
    if (error instanceof ApiError) {
      const errors = error.problem.errors ?? {};
      return {
        values,
        message: Object.keys(errors).length ? undefined : error.message,
        errors: {
          ...(errors.name && { name: "Informe um nome de até 150 caracteres" }),
          ...(errors.timeZone && { timeZone: "Escolha um fuso horário válido" }),
        },
      };
    }
    return { values, message: error instanceof Error ? error.message : "Erro inesperado" };
  }
  // Header and dates everywhere read the school from the API again.
  refresh();
  return { values, saved: true };
}
