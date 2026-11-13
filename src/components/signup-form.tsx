"use client";

import { useActionState, useEffect, useState, useTransition } from "react";

import { checkSlugAction, resendAction, signUpAction, type SignupState, type SlugCheck } from "@/app/signup/actions";

const TAKEN = "Esse endereço já está em uso";
import { Field, FormMessage, inputClass, primaryButtonClass } from "@/components/form-field";
import { TimeZoneSelect, useBrowserTimeZone } from "@/components/time-zone-select";
import type { TimeZoneOptions } from "@/lib/time-zones";

/** "Ana Souza – Inglês" → "ana-souza-ingles" */
function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/, "");
}

export function SignupForm({ rootDomain, timeZones }: { rootDomain: string; timeZones: TimeZoneOptions }) {
  const [state, formAction, pending] = useActionState<SignupState, FormData>(signUpAction, {});
  const browserZone = useBrowserTimeZone();

  const [spaceName, setSpaceName] = useState(state.values?.spaceName ?? "");
  // Follows the space name until the teacher edits the address.
  const [typedSlug, setTypedSlug] = useState<string | null>(state.values?.slug ?? null);
  const slug = typedSlug ?? slugify(spaceName);
  const [zone, setZone] = useState<string | null>(state.values?.timeZone ?? null);
  const timeZone = zone ?? browserZone ?? "America/Sao_Paulo";

  const [check, setCheck] = useState<SlugCheck | null>(null);
  useEffect(() => {
    if (slug.length < 3) return;
    let current = true;
    const timer = setTimeout(async () => {
      const result = await checkSlugAction(slug);
      if (current) setCheck(result);
    }, 400);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [slug]);
  // "Usei o e-mail errado" goes back to the form for this sign-up; its own address is not "taken".
  const [backFrom, setBackFrom] = useState<SignupState["done"] | null>(null);
  const ownSlug = state.done?.slug;
  const slugStatus = check?.slug === slug && !(slug === ownSlug && check.message === TAKEN) ? check : null;
  const slugError = state.errors?.slug && state.values?.slug === slug ? state.errors.slug : slugStatus?.message;

  if (state.done && backFrom !== state.done) {
    const done = state.done;
    return <CheckEmail email={done.email} slug={done.slug} rootDomain={rootDomain} onBack={() => setBackFrom(done)} />;
  }

  const v = state.values;
  const k = JSON.stringify(v ?? null);
  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormMessage message={state.message} />
      {state.done && (
        <p className="rounded-md bg-highlight/30 px-3 py-2 text-sm">
          Corrija o e-mail e envie de novo com <strong>a mesma senha</strong>: o endereço {state.done.slug} continua reservado para você.
        </p>
      )}
      <Field label="Seu nome" error={state.errors?.name}>
        <input name="name" required maxLength={150} autoComplete="name" defaultValue={v?.name} key={`n-${k}`} className={inputClass} />
      </Field>
      <Field label="E-mail" error={state.errors?.email}>
        <input name="email" type="email" required maxLength={255} autoComplete="email" defaultValue={v?.email} key={`e-${k}`} className={inputClass} />
      </Field>
      <Field label="Senha" error={state.errors?.password}>
        <input name="password" type="password" required minLength={8} maxLength={72} autoComplete="new-password" className={inputClass} />
      </Field>
      <span className="-mt-3 text-xs text-ink-500">Pelo menos 8 caracteres.</span>

      <Field label="Nome do seu espaço" error={state.errors?.spaceName}>
        <input
          name="spaceName"
          required
          maxLength={150}
          placeholder="Ex.: Ana Souza – Inglês"
          value={spaceName}
          onChange={(e) => setSpaceName(e.target.value)}
          className={inputClass}
        />
      </Field>
      <span className="-mt-3 text-xs text-ink-500">Aparece para os seus alunos no topo das telas.</span>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="slug" className="text-sm font-bold">
          Endereço
        </label>
        <div className="flex rounded-md border border-ink-300 bg-white text-sm focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-200 dark:border-ink-700 dark:bg-ink-900">
          <input
            id="slug"
            name="slug"
            required
            maxLength={40}
            value={slug}
            onChange={(e) => setTypedSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
            autoCapitalize="none"
            autoComplete="off"
            spellCheck={false}
            aria-invalid={slugError ? true : undefined}
            aria-describedby="slug-status"
            className="min-w-0 flex-1 bg-transparent px-3 py-2 text-right outline-none"
          />
          <span className="self-center pr-3 text-ink-500">.{rootDomain}</span>
        </div>
        <span id="slug-status" aria-live="polite" className="text-xs">
          {slugError ? (
            <span className="text-pen">{slugError}</span>
          ) : slugStatus?.available ? (
            <span className="text-brand-600">✓ Disponível</span>
          ) : (
            <span className="text-ink-500">É o link que você vai passar para os seus alunos.</span>
          )}
        </span>
      </div>

      <Field label="Fuso horário" error={state.errors?.timeZone}>
        <TimeZoneSelect name="timeZone" value={timeZone} onChange={setZone} options={timeZones} />
      </Field>
      <span className="-mt-3 text-xs text-ink-500">Os horários das aulas são mostrados neste fuso.</span>

      <button type="submit" disabled={pending || Boolean(slugError)} className={primaryButtonClass}>
        {pending ? "Criando..." : "Criar meu espaço"}
      </button>
    </form>
  );
}

function CheckEmail({ email, slug, rootDomain, onBack }: { email: string; slug: string; rootDomain: string; onBack: () => void }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ message: string; ok: boolean }>();

  return (
    <div role="status" className="flex flex-col gap-4">
      <h2 className="text-xl">Confirme seu e-mail</h2>
      <p className="text-ink-700 dark:text-ink-300">
        Enviamos um link para <strong>{email}</strong>. Abra o e-mail e confirme para entrar no seu espaço{" "}
        <strong className="whitespace-nowrap">
          {slug}.{rootDomain}
        </strong>
        .
      </p>
      <p className="text-sm text-ink-500">O link vale por 48 horas. Não chegou? Veja a caixa de spam ou peça outro.</p>
      <p className="text-sm text-ink-500">Depois da confirmação, a equipe da Educare libera o seu espaço e avisa você por e-mail.</p>
      {result && <p className={`text-sm ${result.ok ? "text-brand-700 dark:text-brand-300" : "text-pen"}`}>{result.message}</p>}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(async () => setResult(await resendAction(email, slug)))}
          className="rounded-md border border-ink-300 px-4 py-2 text-sm font-bold hover:bg-ink-50 disabled:opacity-50 dark:border-ink-700 dark:hover:bg-ink-800"
        >
          {pending ? "Enviando..." : "Reenviar link"}
        </button>
        <button type="button" onClick={onBack} className="self-center text-sm font-bold text-brand-600 hover:underline">
          Usei o e-mail errado
        </button>
      </div>
    </div>
  );
}
