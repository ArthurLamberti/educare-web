"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ApiError } from "@/lib/api";
import { activateTenant, endOperatorSession, startOperatorSession, suspendTenant } from "@/lib/operator";

export type OperatorLoginState = { message?: string; email?: string };

export async function operatorLogin(_prev: OperatorLoginState, formData: FormData): Promise<OperatorLoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  try {
    await startOperatorSession(email, password);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return { email, message: "E-mail ou senha inválidos." };
    if (error instanceof ApiError && error.status === 429) return { email, message: "Muitas tentativas. Tente de novo mais tarde." };
    return { email, message: error instanceof Error ? error.message : "Erro inesperado" };
  }
  redirect("/admin");
}

export async function operatorLogout() {
  await endOperatorSession();
  redirect("/admin/login");
}

/** Returns an error message, or nothing when it worked. */
export async function changeSpaceStatus(id: number, action: "activate" | "suspend"): Promise<string | undefined> {
  try {
    await (action === "activate" ? activateTenant(id) : suspendTenant(id));
  } catch (error) {
    if (error instanceof ApiError && error.status === 422) return "O professor ainda não confirmou o e-mail.";
    if (error instanceof ApiError && error.status === 404) return "Espaço não encontrado (talvez já tenha sido apagado).";
    throw error;
  }
  revalidatePath("/admin");
}
