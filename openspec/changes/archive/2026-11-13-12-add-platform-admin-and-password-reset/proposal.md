# Proposal: Password reset pages and operator login

## Why
The API (educare-api change 12) adds platform admin accounts and password reset.

## What Changes
- School subdomains: "Esqueci a senha" on the login page, `/forgot-password`, `/reset-password?token=`
  (from the email), then `/login?reset=1`.
- Operator panel: `/admin/login` with email and password (the admin's token in the `/admin` cookie
  instead of the platform key), "Esqueci a senha (ou primeiro acesso)", `/admin/forgot-password`,
  `/admin/reset-password`. The panel shows the admin's email.
