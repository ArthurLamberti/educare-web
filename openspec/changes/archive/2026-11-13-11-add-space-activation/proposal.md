# Proposal: Space activation pages

## Why
The API (educare-api change 11) now keeps private spaces `PENDING` until the operator activates
them (later: a payment). The web must show that state and give the operator a way to activate.

## What Changes
- `School.status`; `requireUser` sends users of an inactive space to `/pending`, and `apiFetch`
  does the same on 403 `ACCOUNT_INACTIVE`. The header hides the menu there.
- `/pending`: "Quase lá" while pending, "suspenso" when suspended, "Verificar de novo" and "Sair".
  It is where a checkout step will go later.
- Operator panel on the root domain: `/admin/login` (platform key, httpOnly cookie on `/admin`, 8 h)
  and `/admin` with tabs Aguardando liberação / Ativos / Suspensos, "Liberar", "Suspender"
  (confirmed inline) and "Reativar".
- Texts on the landing page and the check-email screen say the space is activated after a review.
