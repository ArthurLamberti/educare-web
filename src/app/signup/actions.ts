"use server";

import { ApiError } from "@/lib/api";
import { SLUG_PATTERN } from "@/lib/host";
import { checkSlug, resendConfirmation, signUp } from "@/lib/signup";

type Field = "name" | "email" | "password" | "spaceName" | "slug" | "timeZone";

export type SignupState = {
  message?: string;
  errors?: Partial<Record<Field, string>>;
  /** Typed values to keep after an error (never the password). */
  values?: Omit<Record<Field, string>, "password">;
  /** Set once the space exists and the email went out. */
  done?: { email: string; slug: string };
};

const FIELD_MESSAGES: Record<Field, string> = {
  name: "Informe seu nome",
  email: "Informe um e-mail válido",
  password: "A senha precisa ter pelo menos 8 caracteres",
  spaceName: "Informe o nome do seu espaço",
  slug: "Use de 3 a 40 letras minúsculas, números ou hifens, sem hífen no começo ou no fim",
  timeZone: "Escolha um fuso horário",
};

const TOO_MANY = "Muitas tentativas. Tente de novo em alguns minutos.";

export type SlugCheck = { slug: string; available: boolean; message?: string };

/** Called while the teacher types the address (debounced by the form). */
export async function checkSlugAction(slug: string): Promise<SlugCheck> {
  if (!SLUG_PATTERN.test(slug)) return { slug, available: false, message: FIELD_MESSAGES.slug };
  try {
    const result = await checkSlug(slug);
    const message = {
      INVALID: FIELD_MESSAGES.slug,
      RESERVED: "Esse endereço não pode ser usado",
      TAKEN: "Esse endereço já está em uso",
    }[result.reason ?? "INVALID"];
    return { slug, available: result.available, message: result.available ? undefined : message };
  } catch {
    // Do not block the form on a failed check (e.g. rate limited); the sign-up itself checks again.
    return { slug, available: true };
  }
}

export async function signUpAction(_prev: SignupState, formData: FormData): Promise<SignupState> {
  const text = (name: string) => String(formData.get(name) ?? "").trim();
  const values = {
    name: text("name"),
    email: text("email"),
    spaceName: text("spaceName"),
    slug: text("slug").toLowerCase(),
    timeZone: text("timeZone"),
  };
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) return { values, errors: { password: FIELD_MESSAGES.password } };

  try {
    await signUp({ ...values, password });
  } catch (error) {
    if (!(error instanceof ApiError)) return { values, message: error instanceof Error ? error.message : "Erro inesperado" };
    if (error.status === 429) return { values, message: TOO_MANY };
    if (error.status === 409) return { values, errors: { slug: "Esse endereço já está em uso" } };
    const apiErrors = (error.problem.errors ?? {}) as Partial<Record<Field, string>>;
    const errors = Object.fromEntries(
      Object.entries(apiErrors).map(([field, message]) => [
        field,
        field === "slug" && message === "is reserved" ? "Esse endereço não pode ser usado" : (FIELD_MESSAGES[field as Field] ?? message),
      ]),
    );
    return { values, errors, message: Object.keys(errors).length ? undefined : error.message };
  }
  return { values, done: { email: values.email, slug: values.slug } };
}

/** "Reenviar link": same answer whether or not the account exists. */
export async function resendAction(email: string, slug: string): Promise<{ message: string; ok: boolean }> {
  try {
    await resendConfirmation(email, slug);
    return { ok: true, message: "Se o cadastro ainda não foi confirmado, enviamos um novo link. Os links anteriores deixam de valer." };
  } catch (error) {
    if (error instanceof ApiError && error.status === 429) return { ok: false, message: TOO_MANY };
    return { ok: false, message: "Não foi possível reenviar agora. Tente de novo em instantes." };
  }
}
