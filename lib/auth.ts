import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Returns the authenticated user's claims, or null if not authenticated.
 * Use in server components or route handlers where you want to check auth
 * without forcing a redirect.
 */
export async function getUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    return null;
  }

  return data.claims;
}

/**
 * Returns the authenticated user's claims, or redirects to /auth/login.
 * Use in server components or route handlers that require authentication.
 */
export async function requireAuth() {
  const claims = await getUser();

  if (!claims) {
    redirect("/auth/login");
  }

  return claims;
}
