import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import SectionHeader from "@/components/SectionHeader";
import DividedPanel from "@/components/DividedPanel";
import FeatureCardGrid from "@/components/FeatureCardGrid";
import SiteFooter from "@/components/SiteFooter";
import { aiPage } from "@/lib/pages";

export const metadata: Metadata = {
  title: "AI & Copilot Readiness | Aegis Ascent",
  description:
    "Deploy Microsoft Copilot without leaking your data — permissions auditing, semantic indexing, licence governance, Copilot Studio agents, and user enablement.",
};

/**
 * Deliberately the shortest of the four pages: the comp's frame (149:38) is
 * 2705px against the others' 3000-3300, with three compact bands and no
 * full-width feature rows. Not padded to match its siblings.
 */
export default function AiCopilotReadinessPage() {
  const { hero, readiness, advanced, enablement } = aiPage;

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
          pillar="ai-modern-work"
          illustration={hero.illustration}
          headerGap={hero.headerGap}
          subtitleWidth={hero.subtitleWidth}
        />

        <section data-verify="readiness">
          <div className="mx-auto w-full max-w-318 px-6 pt-30">
            <SectionHeader
              eyebrow={readiness.eyebrow}
              title={readiness.title}
              align="left"
              size="sm"
              gap={42}
              name="readiness"
            />
            <div className="mt-6">
              <DividedPanel cells={readiness.cells} name="readiness-panel" />
            </div>
          </div>
        </section>

        <section data-verify="advanced">
          <div className="mx-auto w-full max-w-318 px-6 pt-20">
            <SectionHeader title={advanced.title} align="left" size="sm" name="advanced" />
            <div className="mt-6">
              <FeatureCardGrid
                cards={advanced.cards}
                columns={2}
                variant="plain"
                name="advanced-cards"
              />
            </div>
          </div>
        </section>

        <section data-verify="enablement">
          <div className="mx-auto w-full max-w-318 px-6 pb-30 pt-20">
            <SectionHeader title={enablement.title} align="left" size="sm" name="enablement" />
            <div className="mt-6">
              <FeatureCardGrid
                cards={enablement.cards}
                columns={2}
                variant="plain"
                name="enablement-cards"
              />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
