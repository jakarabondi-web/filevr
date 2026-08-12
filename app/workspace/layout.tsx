import { AppRail } from "@/components/layout/app-rail";
import { MobileNav } from "@/components/layout/mobile-nav";
import { UtilityBar } from "@/components/layout/utility-bar";
import { getSessionUser } from "@/lib/auth";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();

  return (
    <div className="flex min-h-screen w-full">
      <AppRail user={user} />
      <main id="main" className="flex min-w-0 flex-1 flex-col bg-bg">
        <MobileNav user={user} />
        <UtilityBar user={user} />
        <div className="flex-1 px-4 py-6 sm:px-8 md:px-10">{children}</div>
      </main>
    </div>
  );
}
