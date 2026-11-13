"use server";

import { redirect } from "next/navigation";

import { ApiError } from "@/lib/api";
import { confirmEmail } from "@/lib/signup";

export type ConfirmState = { message?: string };

/** Runs only on the button press, so link scanners that open the email's link do not use it up. */
export async function confirmAction(_prev: ConfirmState, formData: FormData): Promise<ConfirmState> {
  const token = String(formData.get("token") ?? "");
  try {
    await confirmEmail(token);
  } catch (error) {
    if (error instanceof ApiError && error.status === 429) return { message: "Muitas tentativas. Tente de novo em alguns minutos." };
    if (error instanceof ApiError && error.status === 400) return { message: "Este link é inválido ou expirou." };
    return { message: error instanceof Error ? error.message : "Erro inesperado" };
  }
  redirect("/login?confirmed=1");
}
