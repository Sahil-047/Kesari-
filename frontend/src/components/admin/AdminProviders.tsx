"use client";

import { AntdRegistry } from "@ant-design/nextjs-registry";
import { App, ConfigProvider, theme, type ThemeConfig } from "antd";
import enGB from "antd/locale/en_GB";
import type { ReactNode } from "react";

/**
 * Kesari Studio — minimal warm shell with a light soft-elevation hint
 * (restrained neo, not heavy extrusion). Gold stays brand-only.
 */
export const INK = "#1c1917";
export const STUDIO = {
  ink: INK,
  inkSoft: "#44403c",
  text: "#0c0a09",
  muted: "#57534e",
  faint: "#78716c",
  disabled: "#a8a29e",
  border: "#ddd8d1",
  hairline: "#e8e4de",
  subtle: "#f3f0eb",
  wash: "#ebe7e1",
  surface: "#faf8f5",
  raised: "#faf8f5",
  gold: "#a16207",
  danger: "#dc2626",
  shadowOut: "0 1px 2px rgba(28, 25, 23, 0.04), 0 6px 16px -8px rgba(28, 25, 23, 0.1)",
  shadowOutSm: "0 1px 2px rgba(28, 25, 23, 0.04)",
  shadowIn: "inset 0 1px 2px rgba(28, 25, 23, 0.05)",
  shadowInSm: "inset 0 1px 1px rgba(28, 25, 23, 0.04)",
  shadowFloat: "0 8px 24px -10px rgba(28, 25, 23, 0.16)",
} as const;

const FONT =
  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
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
    colorFillQuaternary: STUDIO.wash,
    colorBgTextHover: STUDIO.wash,
    fontFamily: FONT,
    fontSize: 14,
    fontWeightStrong: 600,
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,
    controlHeight: 36,
    controlHeightLG: 42,
    controlHeightSM: 28,
    lineWidth: 1,
    lineWidthFocus: 2,
    boxShadow: STUDIO.shadowFloat,
    boxShadowSecondary: STUDIO.shadowFloat,
    boxShadowTertiary: "none",
    motionDurationFast: "0.1s",
    motionDurationMid: "0.18s",
    motionDurationSlow: "0.24s",
    motionEaseOut: "cubic-bezier(0.23, 1, 0.32, 1)",
  },
  components: {
    Layout: {
      siderBg: STUDIO.surface,
      headerBg: "rgba(250, 248, 245, 0.88)",
      bodyBg: STUDIO.subtle,
      headerHeight: 56,
    },
    Menu: {
      itemBg: "transparent",
      itemColor: STUDIO.muted,
      itemHoverColor: STUDIO.text,
      itemHoverBg: STUDIO.wash,
      itemSelectedBg: STUDIO.wash,
      itemSelectedColor: STUDIO.text,
      itemActiveBg: STUDIO.hairline,
      itemHeight: 38,
      itemBorderRadius: 8,
      itemMarginInline: 10,
      itemMarginBlock: 2,
      groupTitleColor: STUDIO.faint,
      groupTitleFontSize: 11,
      activeBarBorderWidth: 0,
      iconSize: 15,
    },
    Button: {
      primaryShadow: "none",
      defaultShadow: "none",
      dangerShadow: "none",
      fontWeight: 500,
    },
    Card: {
      headerFontSize: 14,
      headerHeight: 52,
      headerHeightSM: 44,
      paddingLG: 22,
    },
    Table: {
      headerBg: STUDIO.subtle,
      headerColor: STUDIO.muted,
      headerSplitColor: "transparent",
      borderColor: STUDIO.hairline,
      rowHoverBg: "rgba(255, 255, 255, 0.45)",
      rowSelectedBg: STUDIO.wash,
      cellPaddingBlock: 14,
      headerBorderRadius: 0,
    },
    Input: {
      activeShadow: "0 0 0 3px rgba(28, 25, 23, 0.08)",
      hoverBorderColor: STUDIO.faint,
      activeBorderColor: STUDIO.ink,
    },
    InputNumber: {
      activeShadow: "0 0 0 3px rgba(28, 25, 23, 0.08)",
      hoverBorderColor: STUDIO.faint,
      activeBorderColor: STUDIO.ink,
    },
    Select: {
      activeOutlineColor: "rgba(28, 25, 23, 0.08)",
      hoverBorderColor: STUDIO.faint,
      activeBorderColor: STUDIO.ink,
      optionSelectedBg: STUDIO.wash,
      optionSelectedFontWeight: 500,
    },
    DatePicker: {
      activeShadow: "0 0 0 3px rgba(28, 25, 23, 0.08)",
      hoverBorderColor: STUDIO.faint,
      activeBorderColor: STUDIO.ink,
    },
    Segmented: {
      trackBg: STUDIO.wash,
      itemSelectedBg: STUDIO.surface,
      itemColor: STUDIO.muted,
      itemHoverColor: STUDIO.text,
    },
    Statistic: { titleFontSize: 13, contentFontSize: 26 },
    Progress: { defaultColor: STUDIO.ink, remainingColor: STUDIO.wash },
    Steps: { iconSize: 28 },
    Drawer: { footerPaddingBlock: 14, footerPaddingInline: 24 },
    Breadcrumb: {
      itemColor: STUDIO.faint,
      lastItemColor: STUDIO.muted,
      linkColor: STUDIO.faint,
      linkHoverColor: STUDIO.text,
      separatorColor: STUDIO.disabled,
    },
    Badge: { indicatorHeight: 18, indicatorHeightSM: 16 },
    Alert: { withDescriptionPadding: "14px 16px" },
    Collapse: { headerBg: STUDIO.surface, contentBg: STUDIO.surface },
  },
};

export default function AdminProviders({ children }: { children: ReactNode }) {
  return (
    <AntdRegistry>
      <ConfigProvider theme={studioTheme} locale={enGB}>
        <App>{children}</App>
      </ConfigProvider>
    </AntdRegistry>
  );
}
