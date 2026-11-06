"use client";

import { AntdRegistry } from "@ant-design/nextjs-registry";
import { App, ConfigProvider, theme, type ThemeConfig } from "antd";
import enGB from "antd/locale/en_GB";
import type { ReactNode } from "react";

/**
 * Kesari Studio design system (from ui-ux-pro-max: "Luxury/Premium Brand"
 * palette, "Minimalism & Swiss" style, "Classic Elegant" type pairing).
 *
 * One ink colour on a warm stone scale does all functional work (buttons,
 * selection, focus, charts, badges). Gold is a minimal brand accent only
 * (logo mark, active-nav indicator), never for meaning. Red is reserved for
 * errors and destructive actions. Every text colour clears 4.5:1 on white.
 * Mirrored as CSS variables in app/admin/admin.css; see design-system/kesari-studio/MASTER.md.
 */
export const INK = "#1c1917";
export const STUDIO = {
  ink: INK,
  inkSoft: "#44403c",
  text: "#0c0a09",
  muted: "#57534e", // 7.6:1 on white
  faint: "#78716c", // 4.8:1 on white: lowest allowed for text
  disabled: "#a8a29e", // decoration and disabled only
  border: "#d6d3d1",
  hairline: "#e7e5e4",
  subtle: "#fafaf9",
  wash: "#f5f5f4",
  surface: "#ffffff",
  gold: "#a16207",
  danger: "#dc2626",
} as const;

const FONT =
  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
/** Display face for page titles only; controls and figures stay in Inter. */
export const DISPLAY_FONT = "'Playfair Display', Georgia, 'Times New Roman', serif";

export const studioTheme: ThemeConfig = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: STUDIO.ink,
    colorInfo: STUDIO.ink,
    colorSuccess: STUDIO.ink,
    colorWarning: STUDIO.inkSoft,
    colorError: STUDIO.danger,
    colorLink: STUDIO.ink,
    colorLinkHover: STUDIO.inkSoft,
    colorText: STUDIO.text,
    colorTextSecondary: STUDIO.muted,
    colorTextTertiary: STUDIO.faint,
    colorTextQuaternary: STUDIO.disabled,
    colorBorder: STUDIO.border,
    colorBorderSecondary: STUDIO.hairline,
    colorSplit: STUDIO.hairline,
    colorBgLayout: STUDIO.subtle,
    colorBgContainer: STUDIO.surface,
    colorFillSecondary: STUDIO.wash,
    colorFillTertiary: STUDIO.subtle,
    colorFillQuaternary: STUDIO.subtle,
    colorBgTextHover: STUDIO.wash,
    fontFamily: FONT,
    fontSize: 14,
    fontWeightStrong: 600,
    // Swiss: crisp corners, a single small radius family.
    borderRadius: 6,
    borderRadiusLG: 10,
    borderRadiusSM: 4,
    controlHeight: 36,
    controlHeightLG: 42,
    controlHeightSM: 28,
    lineWidthFocus: 2,
    // Surfaces separate by border, not shadow; only floating layers get elevation.
    boxShadowTertiary: "none",
    boxShadow: "0 1px 2px rgba(12, 10, 9, 0.05), 0 10px 28px -10px rgba(12, 10, 9, 0.16)",
    boxShadowSecondary: "0 1px 2px rgba(12, 10, 9, 0.05), 0 14px 36px -12px rgba(12, 10, 9, 0.22)",
    // Micro-interactions: quick feedback, slightly slower for surfaces.
    motionDurationFast: "0.1s",
    motionDurationMid: "0.18s",
    motionDurationSlow: "0.24s",
    motionEaseOut: "cubic-bezier(0.23, 1, 0.32, 1)",
  },
  components: {
    Layout: { siderBg: STUDIO.surface, headerBg: "rgba(255, 255, 255, 0.85)", bodyBg: STUDIO.subtle, headerHeight: 56 },
    Menu: {
      itemBg: "transparent",
      itemColor: STUDIO.muted,
      itemHoverColor: STUDIO.text,
      itemHoverBg: STUDIO.wash,
      itemSelectedBg: STUDIO.wash,
      itemSelectedColor: STUDIO.text,
      itemActiveBg: STUDIO.hairline,
      itemHeight: 36,
      itemBorderRadius: 8,
      itemMarginInline: 10,
      itemMarginBlock: 2,
      groupTitleColor: STUDIO.faint,
      groupTitleFontSize: 11,
      activeBarBorderWidth: 0,
      iconSize: 15,
    },
    Button: { primaryShadow: "none", defaultShadow: "none", dangerShadow: "none", fontWeight: 500 },
    Card: { headerFontSize: 14, headerHeight: 52, headerHeightSM: 44, paddingLG: 24 },
    Table: {
      headerBg: STUDIO.subtle,
      headerColor: STUDIO.muted,
      headerSplitColor: "transparent",
      borderColor: STUDIO.hairline,
      rowHoverBg: STUDIO.subtle,
      rowSelectedBg: STUDIO.wash,
      cellPaddingBlock: 14,
      headerBorderRadius: 0,
    },
    Input: { activeShadow: "0 0 0 3px rgba(28, 25, 23, 0.1)", hoverBorderColor: STUDIO.faint },
    InputNumber: { activeShadow: "0 0 0 3px rgba(28, 25, 23, 0.1)", hoverBorderColor: STUDIO.faint },
    Select: {
      activeOutlineColor: "rgba(28, 25, 23, 0.1)",
      hoverBorderColor: STUDIO.faint,
      optionSelectedBg: STUDIO.hairline,
      optionSelectedFontWeight: 500,
    },
    DatePicker: { activeShadow: "0 0 0 3px rgba(28, 25, 23, 0.1)", hoverBorderColor: STUDIO.faint },
    Segmented: { trackBg: STUDIO.wash, itemSelectedBg: STUDIO.surface, itemColor: STUDIO.muted, itemHoverColor: STUDIO.text },
    Statistic: { titleFontSize: 13, contentFontSize: 26 },
    Progress: { defaultColor: STUDIO.ink, remainingColor: STUDIO.wash },
    Steps: { iconSize: 28 },
    Drawer: { footerPaddingBlock: 14, footerPaddingInline: 24 },
    Breadcrumb: { itemColor: STUDIO.faint, lastItemColor: STUDIO.muted, linkColor: STUDIO.faint, linkHoverColor: STUDIO.text, separatorColor: STUDIO.disabled },
    Badge: { indicatorHeight: 18, indicatorHeightSM: 16 },
    Alert: { withDescriptionPadding: "14px 16px" },
    Collapse: { headerBg: STUDIO.surface, contentBg: STUDIO.surface },
  },
};

/** Ant's CSS-in-JS registry (SSR), theme, locale and the App context for message/modal. */
export default function AdminProviders({ children }: { children: ReactNode }) {
  return (
    <AntdRegistry>
      <ConfigProvider theme={studioTheme} locale={enGB}>
        <App>{children}</App>
      </ConfigProvider>
    </AntdRegistry>
  );
}
