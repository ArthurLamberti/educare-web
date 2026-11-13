# space-activation-pages Specification

## Purpose
Shows users of a space that is not active why they cannot use it yet, and gives the operator a panel to activate, suspend and reactivate spaces.

## Requirements

### Requirement: Pending page
Users of a space whose status is not `ACTIVE` SHALL be sent to `/pending` from every page (and when an API call answers 403 `ACCOUNT_INACTIVE`). The page SHALL explain that the space waits for activation, or that it is suspended, and offer "Verificar de novo" and "Sair". Once the space is active, `/pending` SHALL send to the home page.

#### Scenario: Pending teacher logs in
- **WHEN** the teacher of a pending space logs in
- **THEN** they see "Quase lá" on `/pending` and no navigation menu

#### Scenario: Activated meanwhile
- **WHEN** the space was activated and the teacher presses "Verificar de novo"
- **THEN** they land on the home page with the same session

### Requirement: Operator panel
The root domain SHALL have an operator panel: `/admin/login` takes the platform key, checks it against the API and keeps it in an httpOnly cookie limited to `/admin`; `/admin` lists spaces by status (default: waiting for activation) with owner and email confirmation, and offers "Liberar", "Suspender" (confirmed inline) and "Reativar". The panel SHALL NOT exist on school subdomains.

#### Scenario: Activate a space
- **WHEN** the operator presses "Liberar" on a pending space
- **THEN** it leaves the list and the teacher can use the space

#### Scenario: Wrong key
- **WHEN** someone enters a wrong key
- **THEN** the page shows "Chave inválida." and no cookie is set
