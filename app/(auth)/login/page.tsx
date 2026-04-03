import { redirect } from "next/navigation";
import { AuthForm } from "@/src/components/auth/auth-form";
import { getCurrentSessionUser } from "@/src/lib/auth/session";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const user = await getCurrentSessionUser();

  if (user) {
    redirect(next ?? "/player");
  }

  return <AuthForm nextPath={next ?? "/player"} />;
}
