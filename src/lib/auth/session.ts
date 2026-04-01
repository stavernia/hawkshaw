import { createServerSupabaseClient } from "@/src/lib/supabase/server";
import { redirect } from "next/navigation";
import { SITE_ROUTES } from "@/src/config/routes";

export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function getCurrentSessionUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.user ?? null;
}

export async function requireCurrentUser(nextPath?: string) {
  const user = await getCurrentUser();

  if (user) {
    return user;
  }

  const destination = nextPath ? `${SITE_ROUTES.login}?next=${encodeURIComponent(nextPath)}` : SITE_ROUTES.login;
  redirect(destination);
}

export async function requireCurrentSessionUser(nextPath?: string) {
  const user = await getCurrentSessionUser();

  if (user) {
    return user;
  }

  const destination = nextPath ? `${SITE_ROUTES.login}?next=${encodeURIComponent(nextPath)}` : SITE_ROUTES.login;
  redirect(destination);
}
