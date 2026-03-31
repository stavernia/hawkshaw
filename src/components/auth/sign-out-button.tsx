"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { createBrowserSupabaseClient } from "@/src/lib/supabase/browser";

export function SignOutButton() {
  return (
    <Button
      type="button"
      variant="outline"
      className="gap-2"
      onClick={async () => {
        const supabase = createBrowserSupabaseClient();
        await supabase.auth.signOut();
        window.location.assign("/");
      }}
    >
      <LogOut className="h-4 w-4" />
      Sign out
    </Button>
  );
}

