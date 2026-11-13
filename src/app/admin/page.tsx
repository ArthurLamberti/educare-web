import type { Metadata } from "next";
import Link from "next/link";

import { operatorLogout } from "@/app/admin/actions";
import { SpaceStatusButton } from "@/components/space-status-button";
import type { TenantStatus } from "@/lib/auth";
import { ROOT_DOMAIN } from "@/lib/host";
import { getOperator, listTenants, type PlatformTenant } from "@/lib/operator";

export const metadata: Metadata = { title: "Operador" };

const TABS: { status: TenantStatus; label: string }[] = [
  { status: "PENDING", label: "Aguardando liberação" },
  { status: "ACTIVE", label: "Ativos" },
  { status: "SUSPENDED", label: "Suspensos" },
];

const STATUSES = TABS.map((t) => t.status);

const when = (instant: string) =>
  new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" }).format(new Date(instant));

/** Operator panel (root domain): activates new private spaces and suspends or reactivates any space. */
export default async function OperatorPage({ searchParams }: PageProps<"/admin">) {
  const { status: param } = await searchParams;
  const status = STATUSES.find((s) => s === param) ?? "PENDING";
  const [operator, tenants] = await Promise.all([getOperator(), listTenants(status)]);

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Painel do operador</h1>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-ink-500">{operator.email}</span>
          <form action={operatorLogout}>
            <button type="submit" className="font-bold text-ink-600 hover:underline dark:text-ink-300">
              Sair
            </button>
          </form>
        </div>
      </div>

      <nav className="flex gap-1 border-b border-ink-200 dark:border-ink-800" aria-label="Situação">
        {TABS.map((tab) => (
          <Link
            key={tab.status}
            href={`/admin?status=${tab.status}`}
            aria-current={tab.status === status ? "page" : undefined}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-bold ${
              tab.status === status ? "border-brand-600 text-brand-700 dark:text-brand-300" : "border-transparent text-ink-500 hover:text-ink-800"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {tenants.length === 0 ? (
        <p className="text-ink-500">{status === "PENDING" ? "Nenhum espaço aguardando liberação." : "Nenhum espaço aqui."}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-ink-100 dark:divide-ink-800">
          {tenants.map((t) => (
            <SpaceRow key={t.id} tenant={t} />
          ))}
        </ul>
      )}
    </section>
  );
}

function SpaceRow({ tenant: t }: { tenant: PlatformTenant }) {
  const unconfirmed = t.owner && !t.owner.emailConfirmed;
  return (
    <li className="flex flex-wrap items-center justify-between gap-4 py-4">
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="font-bold">
          {t.name}{" "}
          <span className="ml-1 rounded bg-ink-100 px-1.5 py-0.5 text-xs font-normal text-ink-600 dark:bg-ink-800 dark:text-ink-300">
            {t.kind === "INDIVIDUAL" ? "Professor particular" : "Escola"}
          </span>
        </p>
        <p className="font-mono text-sm text-ink-500">
          {t.slug}.{ROOT_DOMAIN}
        </p>
        {t.owner && (
          <p className="text-sm">
            {t.owner.name} · {t.owner.email}
            {unconfirmed && <span className="ml-2 text-xs font-bold text-pen">e-mail não confirmado</span>}
          </p>
        )}
        <p className="text-xs text-ink-500">
          Criado em {when(t.createdAt)}
          {t.status !== "PENDING" && ` · ${t.status === "ACTIVE" ? "ativo" : "suspenso"} desde ${when(t.statusChangedAt)}`}
        </p>
      </div>
      {t.status === "ACTIVE" ? (
        <SpaceStatusButton id={t.id} action="suspend" label="Suspender" />
      ) : unconfirmed ? (
        <span className="text-sm text-ink-500">Aguardando o e-mail</span>
      ) : (
        <SpaceStatusButton id={t.id} action="activate" label={t.status === "SUSPENDED" ? "Reativar" : "Liberar"} />
      )}
    </li>
  );
}
