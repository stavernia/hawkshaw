"use client";

import type { ComponentProps } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { createBrowserSupabaseClient } from "@/src/lib/supabase/browser";

type SignOutButtonProps = Omit<ComponentProps<typeof Button>, "children" | "onClick" | "type">;

export function SignOutButton({ className, size, variant = "outline", ...props }: SignOutButtonProps) {
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className ?? "gap-2"}
      {...props}
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
