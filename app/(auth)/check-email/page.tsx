import Link from "next/link";
import { MailCheck } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";

export default function CheckEmailPage() {
  return (
    <Card className="app-surface border-white/70">
      <CardHeader>
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <MailCheck className="h-6 w-6" />
        </div>
        <CardTitle>Check your inbox</CardTitle>
        <CardDescription>
          The scaffold uses Supabase email magic links for low-friction identity. Open the link on
          this device to continue into Hawkshaw.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild variant="secondary" className="w-full">
          <Link href="/login">Back to sign in</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

