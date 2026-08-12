import { AppRail } from "@/components/layout/app-rail";
import { MobileNav } from "@/components/layout/mobile-nav";
import { UtilityBar } from "@/components/layout/utility-bar";
import { PrivacyStrip } from "@/components/layout/privacy-strip";
import { AppFooter } from "@/components/layout/app-footer";
import { EditorialStatement } from "@/components/upload/editorial-statement";
import { DocumentWorkbench } from "@/components/upload/document-workbench";
import { ContinueRibbon } from "@/components/files/continue-ribbon";
import { CategoryExplorer } from "@/components/marketing/category-explorer";
import { StepsExplainer } from "@/components/marketing/steps-explainer";
import { TrustSection } from "@/components/marketing/trust-section";
import { PricingPreview } from "@/components/marketing/pricing-preview";
import { FaqSection } from "@/components/marketing/faq-section";
import { getSessionUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getSessionUser();

  return (
    <div className="flex min-h-screen w-full">
      <AppRail user={user} />

      <main id="main" className="flex min-w-0 flex-1 flex-col bg-paper">
        <MobileNav user={user} />

        <div className="paper-grain flex flex-1 flex-col xl:flex-row">
          <div className="min-w-0 flex-1">
            <UtilityBar user={user} />
            <EditorialStatement />
            <DocumentWorkbench />
            <ContinueRibbon user={user} />
          </div>
          <PrivacyStrip />
        </div>

        <CategoryExplorer />
        <StepsExplainer />
        <TrustSection />
        <PricingPreview />
        <FaqSection />
        <AppFooter />
      </main>
    </div>
  );
}
