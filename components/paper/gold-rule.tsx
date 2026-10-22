import { classNames } from "@/lib/format";

type GoldRuleProps = {
  className?: string;
  align?: "left" | "center";
};

export function GoldRule({ className, align = "center" }: GoldRuleProps) {
  return (
    <div
      className={classNames(
        "gold-rule",
        align === "center" ? "mx-auto" : "mr-auto",
        className,
      )}
      aria-hidden="true"
    />
  );
}
