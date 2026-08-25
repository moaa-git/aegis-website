import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import SectionHeader from "@/components/SectionHeader";
import ChecklistCard from "@/components/ChecklistCard";
import TwoColumnList from "@/components/TwoColumnList";
import SiteFooter from "@/components/SiteFooter";
import { compliancePage } from "@/lib/pages";

export const metadata: Metadata = {
  title: "Compliance & eDiscovery | Aegis Ascent",
  description:
    "Governance, risk and compliance for regulated industries — Microsoft Purview eDiscovery, legal hold workflows, DLP, SEC 17a-4 alignment and audit logging.",
};

export default function ComplianceEdiscoveryPage() {
  const { hero, promise, solutions } = compliancePage;

  return (
    <>
      <main className="overflow-x-clip">
        <PageHero
          eyebrow={hero.eyebrow}
          title={hero.title}
          subtitle={hero.subtitle}
          primaryCta={hero.primaryCta}
          secondaryCta={hero.secondaryCta}
          pillar="compliance-legal"
          illustration={hero.illustration}
          headerGap={hero.headerGap}
          subtitleWidth={hero.subtitleWidth}
        />

        <section data-verify="promise">
          <div className="mx-auto w-full max-w-318 px-6 pt-30">
            <ChecklistCard
              eyebrow={promise.eyebrow}
              title={promise.title}
              body={
                <>
                  <p>{promise.body.lead}</p>
                  <p className="mt-4 font-semibold">{promise.body.emphasis}</p>
                </>
              }
              items={promise.items}
              name="promise-card"
            />
          </div>
        </section>

        <section data-verify="solutions">
          <div className="mx-auto w-full max-w-318 px-6 pb-30 pt-30">
            <SectionHeader
              eyebrow={solutions.eyebrow}
              title={solutions.title}
              subtitle={solutions.subtitle}
              align="center"
              subtitleWidth={624}
              name="solutions"
            />
            <div className="mt-14">
              <TwoColumnList columns={solutions.columns} name="solutions-columns" />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
