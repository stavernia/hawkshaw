import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";

type PlaceholderShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  summary: string[];
  callout?: string;
};

export function PlaceholderShell({
  eyebrow,
  title,
  description,
  summary,
  callout,
}: PlaceholderShellProps) {
  return (
    <section className="grid w-full gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <Card className="app-surface border-white/70">
        <CardHeader className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{eyebrow}</p>
            <CardTitle className="font-[family-name:var(--font-heading)] text-5xl leading-none">
              {title}
            </CardTitle>
          </div>
          <CardDescription className="max-w-2xl text-base leading-7">{description}</CardDescription>
        </CardHeader>
      </Card>
      <Card className="app-surface border-white/70">
        <CardHeader>
          <CardTitle>Next-pass extension points</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          {summary.map((item) => (
            <div key={item} className="rounded-2xl border bg-white/80 p-4">
              {item}
            </div>
          ))}
          {callout ? <div className="rounded-2xl bg-primary/10 p-4 text-foreground">{callout}</div> : null}
        </CardContent>
      </Card>
    </section>
  );
}

