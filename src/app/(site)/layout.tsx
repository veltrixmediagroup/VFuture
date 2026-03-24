import { ReactNode } from "react";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { PageTransition } from "@/components/common/page-transition";
import { ExperimentalBadge } from "@/components/common/experimental-badge";
import { getSettings } from "@/lib/data/content-service";
import { buildSettingsMap } from "@/lib/utils/site-settings";

type SiteLayoutProps = {
  children: ReactNode;
};

export default async function SiteLayout({ children }: SiteLayoutProps) {
  const settings = await getSettings();
  const settingsMap = buildSettingsMap(settings);
  const settingEnabled = settingsMap["site.experimental_mode"] === "true";

  return (
    <div className="relative min-h-screen">
      <SiteNavbar />
      <PageTransition>
        <main className="mx-auto w-full max-w-7xl px-4 pb-16 md:px-6">{children}</main>
      </PageTransition>
      <SiteFooter />
      <ExperimentalBadge enabled={settingEnabled} />
    </div>
  );
}
