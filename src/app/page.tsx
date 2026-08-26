import Hero from "@/components/Hero";
import Expertise from "@/components/Expertise";
import Story from "@/components/Story";
import Services from "@/components/Services";
import Pricing from "@/components/Pricing";
import SiteFooter from "@/components/SiteFooter";

export default function Home() {
  return (
    <>
      <main className="overflow-x-clip">
        <Hero />
        <Expertise />
        <Story />
        <Services />
        <Pricing />
      </main>
      <SiteFooter />
    </>
  );
}
