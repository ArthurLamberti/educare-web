import { redirect } from "next/navigation";

import { clearSessionToken } from "@/lib/session";

/**
 * The API rejected the session token (expired, user deactivated...). Cookies can only be changed
 * in Route Handlers and Server Actions, so rendering code redirects here to end the session.
 */
export async function GET() {
  await clearSessionToken();
  redirect("/login");
}
