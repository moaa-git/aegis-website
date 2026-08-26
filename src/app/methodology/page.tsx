import type { Metadata } from "next";
import type { ReactNode } from "react";
import PageHero from "@/components/PageHero";
import SectionHeader from "@/components/SectionHeader";
import PhaseDiagram from "@/components/PhaseDiagram";
import TwoColumnList from "@/components/TwoColumnList";
import FeatureCardGrid from "@/components/FeatureCardGrid";
import DividedPanel from "@/components/DividedPanel";
import ConsultationButton from "@/components/ConsultationButton";
import SiteFooter from "@/components/SiteFooter";
import { methodologyPage } from "@/lib/company";

export const metadata: Metadata = {
  title: "Our Methodology | Aegis Ascent",
  description:
    "Five phases and two agreements: a free scoping conversation, a fixed-price assessment, a written Design document you own, then fixed-price remediation, validation and handoff.",
};

/**
 * Running-text measure. The page is centred throughout, so prose sits in a
 * centred container at 800px — the same width as the hero's content column,
 * which keeps the two vertically aligned — with the text itself left-aligned
 * inside it. Centred body copy is unreadable past a couple of lines.
 */
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

/**
 * The accented note panel — ChecklistCard's surface and border at its
 * smallest padding step, used for the two statements the page makes that are
 * commitments rather than description.
 */
function Callout({ lead, children }: { lead: string; children: ReactNode }) {
  return (
    <div
      className={`rounded-row border border-edge-accent bg-surface-row p-6 text-left md:p-8 ${MEASURE}`}
    >
      <p className="text-lg font-semibold leading-[1.5] tracking-tight1 text-heading md:text-xl">
        {lead}
      </p>
      <p className="mt-3 text-base leading-[1.7] text-white/90 md:text-lg">
        {children}
      </p>
    </div>
  );
}

export default function MethodologyPage() {
  const {
    hero,
    diagram,
    scope,
    assessmentAgreement,
    assess,
    design,
    remediationAgreement,
    deploy,
    validate,
    fixedScope,
    cta,
  } = methodologyPage;

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

        <section data-verify="diagram">
          {/* The bottom padding is not decorative: without it the band's
              lower edge lands exactly on the bottom of the last two phase
              cards, so --color-surface-row meets --color-surface right on a
              band boundary and reads as a seam. */}
          <div className="mx-auto w-full max-w-318 px-6 pb-12 pt-30">
            <SectionHeader
              eyebrow={diagram.eyebrow}
              title={diagram.title}
              subtitle={diagram.subtitle}
              align="center"
              subtitleWidth={720}
              name="diagram"
            />
            <div className="mt-14">
              <PhaseDiagram rows={diagram.rows} name="phase-diagram" />
            </div>
          </div>
        </section>

        {/* One band for the whole engagement, not seven. The five phases and
            the two agreements are a single continuous flow; making each a
            sibling <section> would put the site's 240px inter-band rhythm
            between "Scope" and its own agreement, which breaks the sequence
            the diagram above just established. Inside the band the steps are
            80px apart. */}
        <section data-verify="engagement">
          <div className="mx-auto flex w-full max-w-318 flex-col gap-20 px-6 pb-30 pt-30">
            <div id="scope" className="scroll-mt-8">
              <SectionHeader
                eyebrow={`Phase ${scope.number}`}
                title={scope.title}
                subtitle={scope.meta}
                align="center"
                size="sm"
                name="scope"
              />
              <div className="mt-8">
                <Prose paragraphs={scope.paragraphs} />
              </div>
            </div>

            <div>
              <SectionHeader
                title={assessmentAgreement.title}
                align="center"
                size="sm"
                name="assessment-agreement"
              />
              <div className="mt-8">
                <Prose paragraphs={assessmentAgreement.paragraphs} />
              </div>
            </div>

            <div id="assess" className="scroll-mt-8">
              <SectionHeader
                eyebrow={`Phase ${assess.number}`}
                title={assess.title}
                subtitle={assess.meta}
                align="center"
                size="sm"
                name="assess"
              />
              <div className="mt-8">
                <Prose paragraphs={assess.paragraphs} />
              </div>
              <div className="mt-12">
                <TwoColumnList columns={assess.columns} name="assess-columns" />
              </div>
            </div>

            <div id="design" className="scroll-mt-8">
              <SectionHeader
                eyebrow={`Phase ${design.number}`}
                title={design.title}
                align="center"
                size="sm"
                name="design"
              />
              <div className="mt-8">
                <Prose paragraphs={design.paragraphs} />
              </div>
              {/* Five cards on a three-across grid leaves a hole in the
                  trailing row; centerLastRow centres the pair instead. */}
              <div className="mt-8">
                <FeatureCardGrid
                  cards={[...design.cards]}
                  columns={3}
                  variant="plain"
                  centerLastRow
                  name="design-cards"
                />
              </div>
              <div className="mt-8">
                <Prose paragraphs={[design.review]} />
              </div>
              <div className="mt-8">
                <Callout lead={design.ends.lead}>{design.ends.body}</Callout>
              </div>
            </div>

            <div>
              <SectionHeader
                title={remediationAgreement.title}
                align="center"
                size="sm"
                name="remediation-agreement"
              />
              <div className="mt-8">
                <Prose paragraphs={remediationAgreement.paragraphs} />
              </div>
              <div className="mt-8">
                <Callout lead={remediationAgreement.credit.lead}>
                  {remediationAgreement.credit.body}
                </Callout>
              </div>
            </div>

            <div id="deploy" className="scroll-mt-8">
              <SectionHeader
                eyebrow={`Phase ${deploy.number}`}
                title={deploy.title}
                align="center"
                size="sm"
                name="deploy"
              />
              <div className="mt-8">
                <Prose paragraphs={deploy.paragraphs} />
              </div>
            </div>

            <div id="validate" className="scroll-mt-8">
              <SectionHeader
                eyebrow={`Phase ${validate.number}`}
                title={validate.title}
                align="center"
                size="sm"
                name="validate"
              />
              <div className="mt-8">
                <Prose paragraphs={validate.paragraphs} />
              </div>
            </div>
          </div>
        </section>

        <section data-verify="fixed-scope">
          <div className="mx-auto w-full max-w-318 px-6 pb-30 pt-30">
            <SectionHeader
              eyebrow={fixedScope.eyebrow}
              title={fixedScope.title}
              subtitle={fixedScope.subtitle}
              align="center"
              size="sm"
              name="fixed-scope"
            />
            <div className="mt-8">
              <DividedPanel cells={[...fixedScope.cells]} name="fixed-scope-panel" />
            </div>
            <div className="mt-8">
              <Prose paragraphs={[fixedScope.closing]} />
            </div>
          </div>
        </section>

        <section data-verify="methodology-cta">
          <div className="mx-auto w-full max-w-318 px-6 pb-30 pt-30">
            <div className="rounded-panel border border-edge-accent bg-surface-row p-8 text-center md:p-12 lg:p-16">
              <h2 className="text-3xl font-medium tracking-tight3 text-heading md:text-h2">
                {cta.title}
              </h2>
              <p className="mx-auto mt-6 max-w-[624px] text-lg leading-7 text-white/90">
                {cta.body}
              </p>
              <div className="mt-10 flex justify-center">
                <ConsultationButton className="flex h-14 items-center rounded-2xl bg-linear-to-r from-primary to-primary-deep px-6 text-lg font-medium text-white shadow-btn-primary transition-opacity hover:opacity-90">
                  {cta.button}
                </ConsultationButton>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
