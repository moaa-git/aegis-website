import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import SectionHeader from "@/components/SectionHeader";
import FeatureCardGrid from "@/components/FeatureCardGrid";
import StackedFeatureRow from "@/components/StackedFeatureRow";
import SiteFooter from "@/components/SiteFooter";
import { infrastructurePage } from "@/lib/pages";

export const metadata: Metadata = {
  title: "Infrastructure & Networking | Aegis Ascent",
  description:
    "Microsoft 365 tenant hardening, Exchange Online migration and Entra ID identity management, with Sophos XGS firewall, synchronized security, VPN and network segmentation.",
};

export default function InfrastructureNetworkingPage() {
  const { hero, cloud, network } = infrastructurePage;

  return (
    <>
      <main className="overflow-x-clip">
        <PageHero
          eyebrow={hero.eyebrow}
          eyebrowIcon={hero.eyebrowIcon}
          title={hero.title}
          subtitle={hero.subtitle}
          primaryCta={hero.primaryCta}
          secondaryCta={hero.secondaryCta}
          pillar="infrastructure-network"
          illustration={hero.illustration}
          headerGap={hero.headerGap}
          subtitleWidth={hero.subtitleWidth}
        />

        <section data-verify="cloud-infrastructure">
          <div className="mx-auto w-full max-w-318 px-6 pt-30">
            <SectionHeader
              eyebrow={cloud.eyebrow}
              title={cloud.title}
              align="center"
              name="cloud"
            />
            <div className="mt-12">
              <FeatureCardGrid
                cards={cloud.cards}
                columns={2}
                connector
                name="cloud-grid"
              />
            </div>
          </div>
        </section>

        <section data-verify="network-security">
          <div className="mx-auto w-full max-w-318 px-6 pb-30 pt-30">
            <SectionHeader
              eyebrow={network.eyebrow}
              title={network.title}
              align="left"
              name="network"
            />
            <div className="mt-12">
              <StackedFeatureRow features={network.features} name="network-rows" />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
