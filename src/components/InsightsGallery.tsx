"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import MediaFrame from "./MediaFrame";

type GalleryItem = { src: string; adjective: string };

function WhatsAppIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function ContactUsButton() {
  return (
    <Link
      href="/atelier"
      className="ghost-btn ghost-btn-dark inline-flex items-center gap-2.5 text-ink"
    >
      <WhatsAppIcon className="h-4 w-4" />
      Contact Us
    </Link>
  );
}

export default function InsightsGallery({
  title = "Catalogue",
  images,
}: {
  title?: string;
  images: GalleryItem[];
}) {
  const [active, setActive] = useState<GalleryItem | null>(null);

  const close = useCallback(() => setActive(null), []);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [active, close]);

  if (!images.length) return null;

  return (
    <>
      <section className="relative z-10 section-pad py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="display mb-10 text-center text-[clamp(1.5rem,3vw,2.25rem)] uppercase tracking-[0.28em] text-white">
            {title}
          </h2>
          <div
            className={
              images.length === 1
                ? "flex justify-center"
                : "grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5"
            }
          >
            {images.map((item) => (
              <button
                key={item.src}
                type="button"
                onClick={() => setActive(item)}
                className={`group relative aspect-[3/4] overflow-hidden text-left ${
                  images.length === 1
                    ? "w-full max-w-sm sm:max-w-md"
                    : "w-full"
                }`}
              >
                <MediaFrame
                  src={item.src}
                  alt={item.adjective}
                  tone="ivory"
                  quality={100}
                  sizes="(max-width:768px) 100vw, 33vw"
                  objectPosition="center"
                />
                <div className="absolute inset-0 z-[1] bg-black/0 transition duration-500 group-hover:bg-black/40" />
                <div className="absolute inset-0 z-[2] flex items-center justify-center opacity-0 transition duration-500 group-hover:opacity-100">
                  <p className="display text-2xl uppercase tracking-[0.28em] text-white md:text-3xl">
                    {item.adjective}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <ContactUsButton />
          </div>
        </div>
      </section>

      <AnimatePresence>
        {active ? (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center px-4 py-8"
            role="dialog"
            aria-modal="true"
            aria-label={active.adjective}
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="absolute inset-0 bg-black/85"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            />
            <motion.div
              className="relative z-10 mx-auto aspect-[3/4] w-full max-w-[min(28rem,calc(78dvh*3/4))] overflow-hidden bg-ink shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <MediaFrame
                src={active.src}
                alt={active.adjective}
                tone="ivory"
                quality={100}
                priority
                sizes="(max-width:768px) 90vw, 36rem"
                objectPosition="center"
              />
              <motion.p
                className="absolute bottom-4 left-0 right-0 text-center display text-sm uppercase tracking-[0.28em] text-white drop-shadow md:text-base"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.35 }}
              >
                {active.adjective}
              </motion.p>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
