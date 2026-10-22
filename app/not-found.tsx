import Link from "next/link";
import { GoldRule } from "@/components/paper/gold-rule";

export default function NotFound() {
  return (
    <div className="inner-page flex min-h-[70svh] flex-col items-center justify-center px-6 text-center">
      <p className="nav-link text-gold">Mislaid</p>
      <h1 className="display-title mt-4 text-4xl text-ink md:text-6xl">
        This room is empty
      </h1>
      <GoldRule className="mt-6" />
      <p className="mt-8 max-w-md font-serif text-xl text-ink-soft">
        The page has gone, or it was never cut. Return to the house.
      </p>
      <Link href="/" className="outline-btn mt-10 text-ink">
        Kesari
      </Link>
    </div>
  );
}
