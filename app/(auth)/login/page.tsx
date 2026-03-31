import { AuthForm } from "@/src/components/auth/auth-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return <AuthForm nextPath={next ?? "/player"} />;
}

