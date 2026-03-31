import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { clientEnv } from "@/src/lib/env/client";

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Cookie writes are ignored during static rendering and handled by middleware when needed.
          }
        },
      },
    },
  );
}

