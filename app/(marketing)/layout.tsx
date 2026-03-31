import { SiteFooter } from "@/src/components/layout/site-footer";
import { SiteHeader } from "@/src/components/layout/site-header";

export default function MarketingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}

