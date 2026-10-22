import { FacadeHero } from "@/components/hero/facade-hero";
import { InteriorLook } from "@/components/hero/interior-look";

/** Temporary: facade door on top, interior courtyard below. */
export default function HomePage() {
  return (
    <>
      <FacadeHero />
      <InteriorLook />
    </>
  );
}
