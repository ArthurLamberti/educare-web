"use server";

import { redirect } from "next/navigation";

import { apiFetch, ApiError } from "@/lib/api";
import { requireUser, type User } from "@/lib/auth";
import { resendConfirmation } from "@/lib/signup";
import { getTenantSlug } from "@/lib/tenant";
import { clearSessionToken, safeNextPath, setSessionToken } from "@/lib/session";

export type LoginState = {
  message?: string;
  email?: string;
  /** Right password, but the sign-up email was never confirmed. */
  unconfirmed?: boolean;
};

type LoginResponse = { token: string; expiresAt: string; user: User };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  let result: LoginResponse;
  try {
    result = await apiFetch<LoginResponse>("/api/auth/login", {
      auth: false,
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return { message: "E-mail ou senha inválidos", email };
    if (error instanceof ApiError && error.problem.code === "EMAIL_NOT_CONFIRMED") return { unconfirmed: true, email };
    return { message: error instanceof Error ? error.message : "Erro inesperado", email };
  }
  await setSessionToken(result.token, result.expiresAt);
  redirect(result.user.mustChangePassword ? "/change-password" : safeNextPath(formData.get("next")));
}

/** From the login page, after `EMAIL_NOT_CONFIRMED`: a new link for this space. */
export async function resendFromLogin(email: string): Promise<string> {
  const slug = await getTenantSlug();
  if (!slug) return "Endereço inválido.";
  try {
    await resendConfirmation(email, slug);
    return "Enviamos um novo link. Confira sua caixa de entrada (e o spam).";
  } catch (error) {
    if (error instanceof ApiError && error.status === 429) return "Muitas tentativas. Tente de novo em alguns minutos.";
    return "Não foi possível reenviar agora. Tente de novo em instantes.";
  }
}

export async function logout() {
  await clearSessionToken();
  redirect("/login");
}

export type ChangePasswordState = {
  message?: string;
  errors?: Partial<Record<"currentPassword" | "newPassword" | "confirmPassword", string>>;
};

export async function changePassword(_prev: ChangePasswordState, formData: FormData): Promise<ChangePasswordState> {
  await requireUser(undefined, { allowPasswordChange: true, allowInactive: true });
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  if (newPassword !== confirmPassword) {
    return { errors: { confirmPassword: "As senhas não conferem" } };
  }
  try {
    await apiFetch("/api/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  } catch (error) {
    if (error instanceof ApiError) return { message: error.message, errors: error.problem.errors };
    return { message: error instanceof Error ? error.message : "Erro inesperado" };
  }
  redirect("/");
}
