import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import SectionHeader from "@/components/SectionHeader";
import FaqAccordion from "@/components/FaqAccordion";
import SiteFooter from "@/components/SiteFooter";
import { faqPage } from "@/lib/company";

export const metadata: Metadata = {
  title: "FAQ | Aegis Ascent",
  description:
    "How Aegis Ascent engagements work: fixed-scope projects rather than a managed service contract, why prices are quoted not published, who the work is for, and what access is needed.",
};

export default function FaqPage() {
  const { hero, groups } = faqPage;

  return (
    <>
      <main className="overflow-x-clip">
        <PageHero
          eyebrow={hero.eyebrow}
          title={[...hero.title]}
          subtitle={hero.subtitle}
          primaryCta={hero.primaryCta}
          secondaryCta={hero.secondaryCta}
          subtitleWidth={hero.subtitleWidth}
          titleWidth={hero.titleWidth}
          align="center"
        />

        {/* One band, not three. The three groups are a single run of
            questions with headings in it; splitting them into sibling
            <section>s would put the site's 240px inter-band rhythm between
            "How we work" and "Who we work with", which reads as three pages
            stacked rather than one. */}
        <section data-verify="faq">
          <div className="mx-auto w-full max-w-318 px-6 pb-30 pt-30">
            {/* 1082px is the design's widest running-text measure (the
                StackedFeatureRow copy on Endpoint and Compliance), which is
                what the legal pages sit on too. Answers are prose, so they
                sit there rather than across the full 1272px container. */}
            <div className="mx-auto flex max-w-[1082px] flex-col gap-20">
              {groups.map((group, i) => (
                <div key={group.title}>
                  <SectionHeader
                    title={group.title}
                    align="left"
                    size="sm"
                    name={`faq-group-${i}`}
                  />
                  <div className="mt-8">
                    <FaqAccordion items={group.items} name={`faq-items-${i}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
      <SiteFooter />
    </>
  );
}
