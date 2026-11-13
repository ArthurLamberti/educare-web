"use server";

import { redirect } from "next/navigation";

import { ApiError } from "@/lib/api";
import { requestPasswordReset, resetPassword, type PasswordScope } from "@/lib/password";

export type ForgotPasswordState = { sent?: boolean; email?: string; message?: string };

export type ResetPasswordState = {
  message?: string;
  errors?: Partial<Record<"newPassword" | "confirmPassword", string>>;
};

export async function forgotPasswordAction(scope: PasswordScope, _prev: ForgotPasswordState, formData: FormData): Promise<ForgotPasswordState> {
  const email = String(formData.get("email") ?? "").trim();
  try {
    await requestPasswordReset(scope, email);
  } catch (error) {
    if (error instanceof ApiError && error.status === 429) return { email, message: "Muitas tentativas. Tente de novo mais tarde." };
    if (error instanceof ApiError && error.status === 400) return { email, message: "Informe um e-mail válido." };
    return { email, message: "Não foi possível enviar agora. Tente de novo em instantes." };
  }
  return { sent: true, email };
}

export async function resetPasswordAction(
  scope: PasswordScope,
  token: string,
  _prev: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  if (newPassword.length < 8) return { errors: { newPassword: "Use pelo menos 8 caracteres" } };
  if (newPassword.length > 72) return { errors: { newPassword: "Use no máximo 72 caracteres" } };
  if (newPassword !== confirmPassword) return { errors: { confirmPassword: "As senhas não conferem" } };
  try {
    await resetPassword(scope, token, newPassword);
  } catch (error) {
    if (error instanceof ApiError && error.status === 400) {
      return { message: "Este link não vale mais (expirou ou já foi usado). Peça um novo." };
    }
    if (error instanceof ApiError && error.status === 429) return { message: "Muitas tentativas. Tente de novo mais tarde." };
    return { message: "Não foi possível salvar agora. Tente de novo em instantes." };
  }
  redirect(scope === "admin" ? "/admin/login?reset=1" : "/login?reset=1");
}
