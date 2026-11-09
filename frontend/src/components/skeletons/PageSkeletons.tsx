import Header from "@/components/Header";
import type { ReactNode } from "react";
import Bone from "./Bone";

function Shell({
  children,
  overlayHeader = false,
  className = "site-shell default-surface parchment-noise",
}: {
  children: ReactNode;
  overlayHeader?: boolean;
  className?: string;
}) {
  return (
    <div className={className} aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading page</span>
      <Header variant={overlayHeader ? "overlay" : "solid"} />
      <main className="site-main relative z-10">{children}</main>
      <footer className="section-pad border-t border-ink/10 py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Bone className="h-3 w-28" />
          <div className="flex gap-4">
            <Bone className="h-2.5 w-16" />
            <Bone className="h-2.5 w-16" />
            <Bone className="h-2.5 w-20" />
          </div>
        </div>
      </footer>
    </div>
  );
}

/** Home — full-bleed hero + showcase strip */
export function HomeSkeleton() {
  return (
    <Shell overlayHeader className="site-shell default-surface parchment-noise">
      <section className="relative min-h-[100dvh] w-full overflow-hidden bg-ink/10">
        <Bone className="absolute inset-0 rounded-none opacity-70" rounded="none" />
        <div className="absolute inset-x-0 bottom-0 section-pad pb-16 md:pb-24">
          <Bone className="mb-4 h-3 w-24" />
          <Bone className="mb-3 h-10 w-[min(28rem,85%)] md:h-14" />
          <Bone className="h-4 w-[min(20rem,70%)]" />
          <Bone className="mt-8 h-11 w-40" />
        </div>
      </section>
      <section className="section-pad grid gap-4 py-12 md:grid-cols-3 md:gap-6 md:py-16">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-3">
            <Bone className="aspect-[3/4] w-full" />
            <Bone className="h-3 w-2/3" />
            <Bone className="h-2.5 w-1/2" />
          </div>
        ))}
      </section>
    </Shell>
  );
}

/** Weddings / editorial — tall hero + stacked content blocks */
export function EditorialSkeleton({ grain = false }: { grain?: boolean }) {
  return (
    <Shell
      overlayHeader
      className={grain ? "site-shell page-grain" : "site-shell default-surface parchment-noise"}
    >
      <section className="relative min-h-[88dvh] w-full overflow-hidden">
        <Bone className="absolute inset-0 rounded-none opacity-80" rounded="none" />
        <div className="absolute inset-x-0 bottom-0 section-pad pb-16">
          <Bone className="mb-3 h-3 w-28 bg-cream/25" />
          <Bone className="mb-3 h-12 w-[min(22rem,80%)] bg-cream/30 md:h-16" />
          <Bone className="h-4 w-[min(28rem,90%)] bg-cream/20" />
        </div>
      </section>
      <section className="section-pad grid gap-6 py-14 md:grid-cols-2">
        <Bone className="aspect-[4/5] w-full" />
        <div className="flex flex-col justify-center gap-4 py-4">
          <Bone className="h-3 w-24" />
          <Bone className="h-8 w-3/4" />
          <Bone className="h-3 w-full" />
          <Bone className="h-3 w-5/6" />
          <Bone className="h-3 w-2/3" />
        </div>
      </section>
      <section className="section-pad grid grid-cols-2 gap-3 pb-16 md:grid-cols-3 md:gap-5">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Bone key={i} className="aspect-[3/4] w-full" />
        ))}
      </section>
    </Shell>
  );
}

/** Shop / womenswear / menswear — filters + product grid */
export function CatalogueSkeleton({
  withHero = false,
}: {
  withHero?: boolean;
}) {
  return (
    <Shell overlayHeader={withHero}>
      {withHero ? (
        <section className="relative aspect-[21/9] min-h-[220px] w-full overflow-hidden md:min-h-[320px]">
          <Bone className="absolute inset-0 rounded-none" rounded="none" />
        </section>
      ) : (
        <div className="section-pad border-b border-ink/10 py-8 md:py-10">
          <Bone className="mb-3 h-3 w-20" />
          <Bone className="h-8 w-48 md:h-10 md:w-64" />
        </div>
      )}
      <div className="section-pad flex flex-col gap-8 py-8 md:flex-row md:gap-10 md:py-12">
        <aside className="hidden w-52 shrink-0 space-y-3 md:block">
          <Bone className="h-3 w-20" />
          {[0, 1, 2, 3, 4].map((i) => (
            <Bone key={i} className="h-8 w-full" />
          ))}
        </aside>
        <div className="grid flex-1 grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2.5">
              <Bone className="aspect-[3/4] w-full" />
              <Bone className="h-2.5 w-3/4" />
              <Bone className="h-2.5 w-1/3" />
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}

/** PDP — gallery + buy column */
export function ProductDetailSkeleton() {
  return (
    <Shell>
      <div className="section-pad grid gap-8 py-8 md:grid-cols-2 md:gap-12 md:py-14">
        <div className="space-y-3">
          <Bone className="aspect-[3/4] w-full" />
          <div className="grid grid-cols-4 gap-2">
            {[0, 1, 2, 3].map((i) => (
              <Bone key={i} className="aspect-square w-full" />
            ))}
          </div>
        </div>
        <div className="space-y-4 md:pt-6">
          <Bone className="h-3 w-24" />
          <Bone className="h-9 w-4/5" />
          <Bone className="h-4 w-28" />
          <Bone className="mt-4 h-3 w-full" />
          <Bone className="h-3 w-5/6" />
          <Bone className="h-3 w-2/3" />
          <Bone className="mt-8 h-14 w-full max-w-sm" />
          <Bone className="h-12 w-full max-w-sm" />
        </div>
      </div>
    </Shell>
  );
}

/** Atelier / form-led pages */
export function FormPageSkeleton() {
  return (
    <Shell>
      <div className="section-pad mx-auto grid max-w-5xl gap-10 py-14 md:grid-cols-2 md:py-20">
        <div className="space-y-4">
          <Bone className="h-3 w-24" />
          <Bone className="h-10 w-4/5" />
          <Bone className="h-3 w-full" />
          <Bone className="h-3 w-5/6" />
          <Bone className="mt-8 aspect-[4/5] w-full max-w-md" />
        </div>
        <div className="space-y-4 rounded-sm border border-ink/10 p-6 md:p-8">
          {[0, 1, 2, 3, 4].map((i) => (
            <Bone key={i} className="h-12 w-full" />
          ))}
          <Bone className="mt-4 h-14 w-full" />
        </div>
      </div>
    </Shell>
  );
}

/** Bag / wishlist / simple content */
export function UtilitySkeleton() {
  return (
    <Shell>
      <div className="section-pad mx-auto max-w-3xl py-12 md:py-16">
        <Bone className="mb-8 h-8 w-40" />
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-4 border-b border-ink/10 pb-4">
              <Bone className="h-28 w-24 shrink-0" />
              <div className="flex flex-1 flex-col justify-center gap-2.5">
                <Bone className="h-3 w-2/3" />
                <Bone className="h-2.5 w-1/3" />
                <Bone className="h-2.5 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}

/** World of Kesari — video hero + story */
export function WorldSkeleton() {
  return (
    <Shell overlayHeader className="site-shell">
      <section className="relative aspect-video w-full overflow-hidden md:min-h-[56dvh]">
        <Bone className="absolute inset-0 rounded-none" rounded="none" />
      </section>
      <section className="section-pad mx-auto max-w-3xl space-y-4 py-16 md:py-24">
        <Bone className="mx-auto h-3 w-28" />
        <Bone className="mx-auto h-10 w-3/4" />
        <Bone className="h-3 w-full" />
        <Bone className="h-3 w-full" />
        <Bone className="h-3 w-5/6" />
        <Bone className="h-3 w-4/5" />
      </section>
    </Shell>
  );
}

/** Studio CMS fallback inside AdminShell */
export function AdminSkeleton() {
  return (
    <div className="p-6 md:p-8" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading studio</span>
      <Bone className="mb-6 h-8 w-48" />
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Bone key={i} className="h-24 w-full" rounded="md" />
        ))}
      </div>
      <Bone className="mb-3 h-10 w-full" rounded="md" />
      <div className="space-y-2">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Bone key={i} className="h-12 w-full" rounded="md" />
        ))}
      </div>
    </div>
  );
}
