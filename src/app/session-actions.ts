"use server";

import { redirect } from "next/navigation";

import { apiFetch, ApiError } from "@/lib/api";
import { requireUser, type User } from "@/lib/auth";
import { clearSessionToken, safeNextPath, setSessionToken } from "@/lib/session";

export type LoginState = { message?: string; email?: string };

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
    if (error instanceof ApiError && error.status === 401) return { message: "Invalid email or password", email };
    return { message: error instanceof Error ? error.message : "Unexpected error", email };
  }
  await setSessionToken(result.token, result.expiresAt);
  redirect(result.user.mustChangePassword ? "/change-password" : safeNextPath(formData.get("next")));
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
  await requireUser(undefined, { allowPasswordChange: true });
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  if (newPassword !== confirmPassword) {
    return { errors: { confirmPassword: "Passwords do not match" } };
  }
  try {
    await apiFetch("/api/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  } catch (error) {
    if (error instanceof ApiError) return { message: error.message, errors: error.problem.errors };
    return { message: error instanceof Error ? error.message : "Unexpected error" };
  }
  redirect("/");
}
