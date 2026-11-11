import { getPageContent } from "@/lib/content/getPageContent";

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

function safeHex(value: string, fallback: string) {
  const v = value?.trim() ?? "";
  return HEX.test(v) ? v : fallback;
}

/**
 * Publishes site-wide CSS variables from CMS (Pages → Site).
 * Header, gold accents, and any `var(--gold*)` / `text-gold` usage pick these up.
 */
export default async function SiteTheme() {
  const { header, accent } = await getPageContent("site");
  const color = safeHex(header.color, "#2c241c");
  const overlayColor = safeHex(header.overlayColor, "#ffffff");
  const gold = safeHex(accent.gold, "#c5a059");
  const goldSoft = safeHex(accent.goldSoft, "#b8a070");

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `:root{--header-color:${color};--header-overlay-color:${overlayColor};--gold:${gold};--gold-soft:${goldSoft};--site-background:#ebe3d4;}`,
      }}
    />
  );
}
