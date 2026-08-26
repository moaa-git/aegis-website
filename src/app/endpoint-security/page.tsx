import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import SectionHeader from "@/components/SectionHeader";
import FeatureCardGrid from "@/components/FeatureCardGrid";
import StackedFeatureRow from "@/components/StackedFeatureRow";
import SiteFooter from "@/components/SiteFooter";
import { endpointPage } from "@/lib/pages";

export const metadata: Metadata = {
  title: "Endpoint Management & Security | Aegis Ascent",
  description:
    "Microsoft Intune device management and Sophos endpoint defense for small businesses and law firms — Autopilot deployment, device hardening, conditional access, and XDR.",
};

export default function EndpointSecurityPage() {
  const { hero, deviceManagement, endpointDefense } = endpointPage;

  return (
    <>
      <main className="overflow-x-clip">
        <PageHero
          eyebrow={hero.eyebrow}
          title={hero.title}
          subtitle={hero.subtitle}
          primaryCta={hero.primaryCta}
          secondaryCta={hero.secondaryCta}
          pillar="endpoint-security"
          illustration={hero.illustration}
        />

        <section data-verify="device-management">
          {/* 45px of trailing space inside the comp's Services frame, which
              makes the gap to the next eyebrow 165px rather than the 120px
              between every other band on this page. */}
          <div className="mx-auto w-full max-w-318 px-6 pb-[45px] pt-30">
            <SectionHeader
              eyebrow={deviceManagement.eyebrow}
              title={deviceManagement.title}
              align="center"
              name="device-management"
            />
            <div className="mt-12">
              <FeatureCardGrid
                cards={deviceManagement.cards}
                columns={2}
                connector
                name="device-management-grid"
              />
            </div>
          </div>
        </section>

        <section data-verify="endpoint-defense">
          <div className="mx-auto w-full max-w-318 px-6 pb-30 pt-30">
            <SectionHeader
              eyebrow={endpointDefense.eyebrow}
              title={endpointDefense.title}
              align="left"
              name="endpoint-defense"
            />
            <div className="mt-12">
              <StackedFeatureRow
                features={endpointDefense.features}
                name="endpoint-defense-rows"
              />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
