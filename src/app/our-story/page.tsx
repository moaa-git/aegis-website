import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import SectionHeader from "@/components/SectionHeader";
import StackedFeatureRow from "@/components/StackedFeatureRow";
import FeatureCardGrid from "@/components/FeatureCardGrid";
import CredentialStrip from "@/components/CredentialStrip";
import ConsultationButton from "@/components/ConsultationButton";
import SiteFooter from "@/components/SiteFooter";
import { storyPage } from "@/lib/company";

export const metadata: Metadata = {
  title: "About Aegis Ascent | Aegis Ascent",
  description:
    "Senior-level systems engineering delivered as fixed-scope projects: identity and cloud security, endpoint defense, compliance and defensibility, and AI readiness.",
};

/** The measure the hero column and every other company page sits on. */
const MEASURE = "mx-auto max-w-[800px]";

function Prose({ paragraphs }: { paragraphs: readonly string[] }) {
  return (
    <div
      className={`flex flex-col gap-5 text-left text-base leading-[1.7] text-white/90 md:text-lg md:leading-[1.75] ${MEASURE}`}
    >
      {paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  );
}

export default function OurStoryPage() {
  const { hero, standard, background, philosophy, credentials, cta } = storyPage;

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

        {/* Sections 1-3 are one band with 80px between them, the same call the
            Methodology engagement band makes. Three sibling <section>s would
            put the site's 240px inter-band rhythm between them and read as
            three pages stacked rather than one argument. */}
        <section data-verify="about">
          <div className="mx-auto flex w-full max-w-318 flex-col gap-20 px-6 pb-30 pt-30">
            <div>
              <SectionHeader
                eyebrow={standard.eyebrow}
                title={standard.title}
                align="center"
                size="sm"
                name="standard"
              />
              <div className="mt-8">
                <Prose paragraphs={standard.paragraphs} />
              </div>
            </div>

            <div>
              <SectionHeader
                eyebrow={background.eyebrow}
                title={background.title}
                align="center"
                size="sm"
                name="background"
              />
              <div className="mt-8">
                <Prose paragraphs={background.paragraphs} />
              </div>
              {/* Held to the prose measure rather than the full container so
                  the rows sit under the paragraph that introduces them. */}
              <div className={`mt-8 ${MEASURE}`}>
                <StackedFeatureRow
                  features={[...background.areas]}
                  variant="tile"
                  name="background-areas"
                />
              </div>
            </div>

            <div>
              <SectionHeader
                eyebrow={philosophy.eyebrow}
                title={philosophy.title}
                align="center"
                size="sm"
                name="philosophy"
              />
              <div className="mt-8">
                <FeatureCardGrid
                  cards={[...philosophy.cards]}
                  columns={3}
                  variant="plain"
                  name="philosophy-cards"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Full-width band on the darker surface. The site has no alternating
            band backgrounds to borrow from — every marketing section sits on
            --color-surface and the only darker full-width band is the footer
            — so this uses --color-surface-row, the design's own "darker than
            the page" fill. See docs/DEVIATIONS.md. */}
        <section data-verify="credentials" className="bg-surface-row">
          <div className="mx-auto w-full max-w-318 px-6 pb-30 pt-30">
            <SectionHeader
              eyebrow={credentials.eyebrow}
              title={credentials.title}
              align="center"
              size="sm"
              name="credentials"
            />
            <div className="mt-14">
              <CredentialStrip items={credentials.items} name="credential-strip" />
            </div>
          </div>
        </section>

        <section data-verify="story-cta">
          <div className="mx-auto w-full max-w-318 px-6 pb-30 pt-30">
            <div className="rounded-panel border border-edge-accent bg-surface-row p-8 text-center md:p-12 lg:p-16">
              <h2 className="text-3xl font-medium tracking-tight3 text-heading md:text-h2">
                {cta.title}
              </h2>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <ConsultationButton className="flex h-14 items-center rounded-2xl bg-linear-to-r from-primary to-primary-deep px-6 text-lg font-medium text-white shadow-btn-primary transition-opacity hover:opacity-90">
                  {cta.button}
                </ConsultationButton>
                <a
                  href={cta.secondary.href}
                  className="flex h-14 items-center rounded-2xl border border-accent-bright bg-surface-row px-6 text-lg font-medium text-white shadow-btn-secondary transition-colors hover:bg-surface-row/70"
                >
                  {cta.secondary.label}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
